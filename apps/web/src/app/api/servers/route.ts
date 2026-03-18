import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { kvPutServerConfig } from "@/lib/kv";
import { importKey, encrypt } from "@relay/shared";
import type { Database, ServerConfig } from "@relay/shared";

type ServerInsert = Database["public"]["Tables"]["servers"]["Insert"];
type CredentialInsert =
  Database["public"]["Tables"]["server_credentials"]["Insert"];

/** Perform an MCP capabilities handshake to verify the server is alive (T037). */
async function verifyMcpHealth(endpointUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${endpointUrl}/mcp`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return false;

    const body = (await res.json()) as {
      protocolVersion?: string;
      tools?: unknown[];
    };

    return !!body.protocolVersion && Array.isArray(body.tools);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { name, type, credentials, enabledTools } = await req.json();

    if (!name?.trim() || !type || !credentials) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const encryptionKeyHex = process.env.ENCRYPTION_KEY;
    if (!encryptionKeyHex) {
      return NextResponse.json(
        { error: "Server encryption is not configured" },
        { status: 500 },
      );
    }

    const supabase = createServiceClient();

    // Generate server token + hash
    const token = crypto.randomUUID();
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Credential key — a UUID reference stored in the servers table
    const credentialKey = crypto.randomUUID();

    // Endpoint URL
    const workerBaseUrl =
      process.env.NEXT_PUBLIC_WORKER_URL ?? "https://mcp.relay.club";
    const endpointUrl = `${workerBaseUrl}/s/${token}`;

    // 1. Encrypt credentials with AES-256-GCM
    const aesKey = await importKey(encryptionKeyHex);
    const encryptedBlob = await encrypt(JSON.stringify(credentials), aesKey);

    // 2. Create server record
    const serverInsert: ServerInsert = {
      user_id: user.id,
      name: name.trim(),
      type,
      server_token_hash: tokenHash,
      status: "deploying",
      credential_key: credentialKey,
      allowed_tools: enabledTools ?? null,
      endpoint_url: endpointUrl,
    };

    const { data: server, error: insertErr } = (await supabase
      .from("servers")
      .insert(serverInsert as never)
      .select("id")
      .single()) as { data: { id: string } | null; error: unknown };

    if (insertErr || !server) {
      return NextResponse.json(
        { error: "Failed to create server" },
        { status: 500 },
      );
    }

    // 3. Store encrypted credentials
    const credInsert: CredentialInsert = {
      server_id: server.id,
      encrypted_blob: JSON.stringify(encryptedBlob),
    };

    const { error: credErr } = await supabase
      .from("server_credentials")
      .insert(credInsert as never);

    if (credErr) {
      await supabase.from("servers").delete().eq("id", server.id);
      return NextResponse.json(
        { error: "Failed to store credentials" },
        { status: 500 },
      );
    }

    // 4. Write server config to Cloudflare KV routing table
    const kvConfig: ServerConfig = {
      serverId: server.id,
      userId: user.id,
      type,
      credentialKey,
      allowedTools: enabledTools ?? null,
      status: "running",
    };

    try {
      await kvPutServerConfig(token, kvConfig);
    } catch (kvErr) {
      // Roll back: delete credentials + server record
      await supabase
        .from("server_credentials")
        .delete()
        .eq("server_id", server.id);
      await supabase.from("servers").delete().eq("id", server.id);

      const message =
        kvErr instanceof Error ? kvErr.message : "Unknown KV error";
      console.error("KV write failed during server creation:", message);
      return NextResponse.json(
        {
          error:
            "Failed to write routing configuration. The server was not created. Please try again.",
        },
        { status: 500 },
      );
    }

    // 5. MCP health check — verify the server responds with valid capabilities
    const healthOk = await verifyMcpHealth(endpointUrl);

    if (healthOk) {
      await supabase
        .from("servers")
        .update({ status: "running" } as never)
        .eq("id", server.id);
    } else {
      await supabase
        .from("servers")
        .update({
          status: "error",
          error_message: "MCP health check failed after deploy",
        } as never)
        .eq("id", server.id);
    }

    return NextResponse.json({ id: server.id });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
