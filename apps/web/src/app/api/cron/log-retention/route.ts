import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const cutoffDate = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error, count } = await supabase
    .from("server_logs")
    .delete({ count: "exact" })
    .lt("called_at", cutoffDate);

  if (error) {
    console.error("Log retention cleanup failed:", error);
    return NextResponse.json(
      { error: "Failed to delete old logs" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    deleted: count ?? 0,
    cutoffDate,
  });
}
