import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@relay/shared";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const updates: UserUpdate = {};
    if (typeof body.name === "string") {
      updates.name = body.name.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("users")
      .update(updates as never)
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    const supabase = createServiceClient();

    // 1. Get all servers owned by this user
    const { data: servers } = await supabase
      .from("servers")
      .select("id")
      .eq("user_id", user.id);

    const serverIds = (servers as { id: string }[] | null)?.map((s) => s.id) ?? [];

    if (serverIds.length > 0) {
      // 2. Delete credentials for all servers
      await supabase
        .from("server_credentials")
        .delete()
        .in("server_id", serverIds);

      // 3. Delete logs for all servers
      await supabase
        .from("server_logs")
        .delete()
        .in("server_id", serverIds);

      // 4. Delete all servers
      await supabase
        .from("servers")
        .delete()
        .eq("user_id", user.id);
    }

    // 5. Delete user record
    await supabase.from("users").delete().eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
