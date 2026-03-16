import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@relay/shared";

type ServerUpdate = Database["public"]["Tables"]["servers"]["Update"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const user = await requireUser();
    const { serverId } = await params;
    const body = await req.json();

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

    // Only allow updating the name for now
    const updates: ServerUpdate = {};
    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("servers")
      .update(updates as never)
      .eq("id", serverId);

    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
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

    // Soft-delete: set deleted_at and stop the server
    const updates: ServerUpdate = {
      deleted_at: new Date().toISOString(),
      status: "stopped",
    };

    const { error } = await supabase
      .from("servers")
      .update(updates as never)
      .eq("id", serverId);

    if (error) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
