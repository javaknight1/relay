import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@relay/shared";

type ServerInsert = Database["public"]["Tables"]["servers"]["Insert"];
type CredentialInsert =
  Database["public"]["Tables"]["server_credentials"]["Insert"];

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

    const supabase = createServiceClient();

    // Generate server token + hash
    const token = crypto.randomUUID();
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Credential key (placeholder — T021 adds real AES-256)
    const credentialKey = crypto.randomUUID();

    // Endpoint URL
    const workerBaseUrl =
      process.env.NEXT_PUBLIC_WORKER_URL ?? "https://mcp.relay.club";
    const endpointUrl = `${workerBaseUrl}/s/${token}`;

    // 1. Create server record
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

    // 2. Store credentials (plaintext JSON — T021 will encrypt with AES-256)
    const credInsert: CredentialInsert = {
      server_id: server.id,
      encrypted_blob: JSON.stringify(credentials),
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

    // 3. Mark server as running
    await supabase
      .from("servers")
      .update({ status: "running" } as never)
      .eq("id", server.id);

    return NextResponse.json({ id: server.id });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
