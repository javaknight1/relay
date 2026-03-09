import type { ServerConfig, MCPResponse } from "@relay/shared";

export interface Env {
  // KV namespace (uncomment when T005 configures it)
  // SERVER_ROUTING: KVNamespace;

  // Environment variables
  ENVIRONMENT: string;

  // Secrets (set via wrangler secret put)
  // ENCRYPTION_KEY: string;
  // SUPABASE_URL: string;
  // SUPABASE_SERVICE_ROLE_KEY: string;
  // UPSTASH_REDIS_REST_URL: string;
  // UPSTASH_REDIS_REST_TOKEN: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", environment: env.ENVIRONMENT });
    }

    // MCP routes will be handled here (T023-T027)
    // Pattern: /s/{serverToken}/mcp (GET) and /s/{serverToken}/rpc (POST)
    const match = url.pathname.match(/^\/s\/([^/]+)\/(mcp|rpc)$/);
    if (match) {
      const [, serverToken, action] = match;
      return Response.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: "Not implemented yet — server routing coming in T023",
          },
        } satisfies Partial<MCPResponse>,
        { status: 501 },
      );
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
};
