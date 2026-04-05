import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { ServerLogRow } from "@relay/shared";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const user = await requireUser();
    const { serverId } = await params;

    const supabase = createServiceClient();

    // Verify ownership
    const { data: server } = await supabase
      .from("servers")
      .select("id")
      .eq("id", serverId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Query logs for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const { data: logs } = (await supabase
      .from("server_logs")
      .select("*")
      .eq("server_id", serverId)
      .gte("called_at", sevenDaysAgoISO)
      .order("called_at", { ascending: true })) as {
      data: ServerLogRow[] | null;
    };

    const allLogs = logs ?? [];

    // Calculate stats
    const totalCalls = allLogs.length;
    const successCount = allLogs.filter((l) => l.status === "success").length;
    const errorCount = allLogs.filter((l) => l.status === "error").length;

    const durationsMs = allLogs
      .map((l) => l.duration_ms)
      .filter((d): d is number => d != null);
    const avgLatency =
      durationsMs.length > 0
        ? Math.round(
            durationsMs.reduce((sum, d) => sum + d, 0) / durationsMs.length,
          )
        : 0;

    const errorRate =
      totalCalls > 0 ? Math.round((errorCount / totalCalls) * 1000) / 10 : 0;

    // Calls per day (group by date)
    const callsByDay: Record<string, number> = {};
    for (const log of allLogs) {
      const day = log.called_at.slice(0, 10); // YYYY-MM-DD
      callsByDay[day] = (callsByDay[day] ?? 0) + 1;
    }

    // Calls today
    const todayStr = new Date().toISOString().slice(0, 10);
    const callsToday = callsByDay[todayStr] ?? 0;

    return NextResponse.json({
      totalCalls,
      successCount,
      errorCount,
      avgLatency,
      errorRate,
      callsToday,
      callsByDay,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
