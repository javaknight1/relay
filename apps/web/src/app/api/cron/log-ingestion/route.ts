import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { createServiceClient } from "@/lib/supabase";

const QUEUE_KEY = "log_queue";
const BATCH_SIZE = 100;

interface LogEntry {
  serverId: string;
  toolName: string;
  status: "success" | "error";
  durationMs: number | null;
  errorMessage: string | null;
  calledAt: string;
  idempotencyKey?: string;
}

export async function GET(req: NextRequest) {
  // Check CRON_SECRET
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const supabase = createServiceClient();
  let totalIngested = 0;

  // Process in batches
  while (true) {
    // Pop up to BATCH_SIZE entries from the list
    const entries: LogEntry[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const entry = await redis.lpop<LogEntry>(QUEUE_KEY);
      if (!entry) break;
      entries.push(entry);
    }

    if (entries.length === 0) break;

    // Insert into Supabase
    const rows = entries.map((e) => ({
      server_id: e.serverId,
      tool_name: e.toolName,
      status: e.status,
      duration_ms: e.durationMs,
      error_message: e.errorMessage,
      called_at: e.calledAt,
    }));

    const { error } = await supabase
      .from("server_logs")
      .insert(rows as never);

    if (error) {
      console.error("Failed to insert logs:", error);
      // Push entries back to queue on failure
      for (const entry of entries) {
        await redis.rpush(QUEUE_KEY, entry);
      }
      return NextResponse.json(
        { error: "Failed to insert logs", ingested: totalIngested },
        { status: 500 },
      );
    }

    // Update last_active_at per server with the latest calledAt (T039)
    const latestByServer = new Map<string, string>();
    for (const entry of entries) {
      const existing = latestByServer.get(entry.serverId);
      if (!existing || entry.calledAt > existing) {
        latestByServer.set(entry.serverId, entry.calledAt);
      }
    }

    for (const [serverId, lastActiveAt] of latestByServer) {
      const { error: updateError } = await supabase
        .from("servers")
        .update({ last_active_at: lastActiveAt } as never)
        .eq("id", serverId);

      if (updateError) {
        console.error(
          `Failed to update last_active_at for server ${serverId}:`,
          updateError,
        );
      }
    }

    totalIngested += entries.length;

    // If we got fewer than BATCH_SIZE, queue is empty
    if (entries.length < BATCH_SIZE) break;
  }

  return NextResponse.json({ ingested: totalIngested });
}
