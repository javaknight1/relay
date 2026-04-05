import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { kvDeleteServerConfig, kvGetServerConfig, kvPutServerConfig } from "@/lib/kv";
import { stripe } from "@/lib/stripe";
import type { Database } from "@relay/shared";

type ServerUpdate = Database["public"]["Tables"]["servers"]["Update"];

/** Extract the server token from an endpoint URL like https://host/s/{token} */
function extractToken(endpointUrl: string | null): string | null {
  if (!endpointUrl) return null;
  const match = endpointUrl.match(/\/s\/([^/]+)$/);
  return match?.[1] ?? null;
}

/** Decrement the subscription quantity after a server is deleted (non-fatal). */
async function decrementSubscriptionQuantity(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  if (!item || (item.quantity ?? 0) <= 0) return;

  const newQuantity = (item.quantity ?? 1) - 1;
  if (newQuantity === 0) {
    // Cancel subscription if no servers left
    await stripe.subscriptions.cancel(subscriptionId);
  } else {
    await stripe.subscriptionItems.update(item.id, {
      quantity: newQuantity,
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const user = await requireUser();
    const { serverId } = await params;
    const body = await req.json();

    const supabase = createServiceClient();

    // Verify ownership — also fetch endpoint_url for KV sync
    const { data: server } = (await supabase
      .from("servers")
      .select("id, endpoint_url")
      .eq("id", serverId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single()) as { data: { id: string; endpoint_url: string | null } | null };

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const updates: ServerUpdate = {};
    let allowedToolsChanged = false;

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }

    // Handle allowedTools: accept string[] | null
    if ("allowedTools" in body) {
      const val = body.allowedTools;
      if (val === null || (Array.isArray(val) && val.every((v: unknown) => typeof v === "string"))) {
        updates.allowed_tools = val;
        allowedToolsChanged = true;
      }
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

    // Sync allowedTools to KV routing table
    if (allowedToolsChanged) {
      const token = extractToken(server.endpoint_url);
      if (token) {
        const kvConfig = await kvGetServerConfig(token);
        if (kvConfig) {
          kvConfig.allowedTools = updates.allowed_tools ?? null;
          await kvPutServerConfig(token, kvConfig);
        }
      }
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

    // Verify ownership — fetch endpoint_url so we can delete the KV entry
    const { data: server } = (await supabase
      .from("servers")
      .select("id, endpoint_url")
      .eq("id", serverId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single()) as { data: { id: string; endpoint_url: string | null } | null };

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

    // Remove from KV routing table
    const token = extractToken(server.endpoint_url);
    if (token) {
      await kvDeleteServerConfig(token);
    }

    // Decrement Stripe subscription quantity (non-fatal)
    if (user.stripe_subscription_id) {
      try {
        await decrementSubscriptionQuantity(user.stripe_subscription_id);
      } catch (billingErr) {
        console.error(
          "Failed to decrement subscription quantity:",
          billingErr instanceof Error ? billingErr.message : billingErr,
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
