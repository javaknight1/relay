import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  try {
    const user = await requireUser();
    const { serverId } = await params;

    const supabase = createServiceClient();

    // Verify ownership and fetch endpoint_url
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

    if (!server.endpoint_url) {
      return NextResponse.json(
        { error: "Server has no endpoint URL" },
        { status: 400 },
      );
    }

    // Parse the request body
    const body = (await req.json()) as {
      toolName?: string;
      arguments?: Record<string, unknown>;
    };

    if (!body.toolName || typeof body.toolName !== "string") {
      return NextResponse.json(
        { error: "toolName is required" },
        { status: 400 },
      );
    }

    // Extract the server token from the endpoint URL for auth
    const tokenMatch = server.endpoint_url.match(/\/s\/([^/]+)$/);
    const token = tokenMatch?.[1] ?? "";

    // Build the JSON-RPC request
    const jsonRpcRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: body.toolName,
        arguments: body.arguments ?? {},
      },
    };

    // Forward to the server's endpoint
    const startTime = Date.now();
    const upstreamRes = await fetch(server.endpoint_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonRpcRequest),
    });

    const durationMs = Date.now() - startTime;

    // Read the upstream response
    const contentType = upstreamRes.headers.get("content-type") ?? "";
    let responseBody: unknown;

    if (contentType.includes("application/json")) {
      responseBody = await upstreamRes.json();
    } else {
      const text = await upstreamRes.text();
      responseBody = { rawText: text };
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id: jsonRpcRequest.id,
      result: responseBody,
      _meta: {
        upstreamStatus: upstreamRes.status,
        durationMs,
      },
    });
  } catch (err) {
    // requireUser throws UnauthorizedError
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Playground proxy error:", err);
    return NextResponse.json(
      {
        error: "Proxy request failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
