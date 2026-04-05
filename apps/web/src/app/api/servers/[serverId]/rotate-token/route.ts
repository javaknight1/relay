import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import {
  kvGetServerConfig,
  kvPutServerConfig,
  kvDeleteServerConfig,
} from "@/lib/kv";

/** Extract the server token from an endpoint URL like https://host/s/{token} */
function extractToken(endpointUrl: string | null): string | null {
  if (!endpointUrl) return null;
  const match = endpointUrl.match(/\/s\/([^/]+)$/);
  return match?.[1] ?? null;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const user = await requireUser();
    const { serverId } = await params;

    const supabase = createServiceClient();

    // Verify ownership — fetch endpoint_url so we can extract the old token
    const { data: server } = (await supabase
      .from("servers")
      .select("id, endpoint_url")
      .eq("id", serverId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single()) as {
      data: { id: string; endpoint_url: string | null } | null;
    };

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Generate new token + hash
    const newToken = crypto.randomUUID();
    const newTokenHash = crypto
      .createHash("sha256")
      .update(newToken)
      .digest("hex");

    // Build new endpoint URL
    const workerBaseUrl =
      process.env.NEXT_PUBLIC_WORKER_URL ?? "https://mcp.relay.club";
    const newEndpointUrl = `${workerBaseUrl}/s/${newToken}`;

    // Extract old token from current endpoint URL
    const oldToken = extractToken(server.endpoint_url);

    // Update server record in Supabase
    const { error: updateError } = await supabase
      .from("servers")
      .update({
        server_token_hash: newTokenHash,
        endpoint_url: newEndpointUrl,
      } as never)
      .eq("id", serverId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update server token" },
        { status: 500 },
      );
    }

    // Rotate KV: read old config, write to new key, delete old key
    if (oldToken) {
      const config = await kvGetServerConfig(oldToken);
      if (config) {
        await kvPutServerConfig(newToken, config);
        await kvDeleteServerConfig(oldToken);
      }
    }

    return NextResponse.json({
      token: newToken,
      endpointUrl: newEndpointUrl,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
