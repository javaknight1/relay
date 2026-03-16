import type { ServerConfig, MCPResponse } from "@relay/shared";

export interface Env {
  // KV namespace for server routing table
  SERVER_ROUTING: KVNamespace;

  // Environment variables
  ENVIRONMENT: string;

  // Secrets (set via wrangler secret put)
  ENCRYPTION_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
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

    // MCP routes: /s/{serverToken}/mcp (GET) and /s/{serverToken}/rpc (POST)
    const match = url.pathname.match(/^\/s\/([^/]+)\/(mcp|rpc)$/);
    if (match) {
      const [, serverToken, action] = match;

      // Look up server config from KV
      const configJson = await env.SERVER_ROUTING.get(
        `server:${serverToken}`,
      );
      if (!configJson) {
        return Response.json(
          { error: "Server not found" },
          { status: 404 },
        );
      }

      const config: ServerConfig = JSON.parse(configJson);

      if (config.status !== "running") {
        return Response.json(
          { error: `Server is ${config.status}` },
          { status: 503 },
        );
      }

      // T023-T027 will implement the full MCP request handling
      return Response.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: "MCP handler not implemented yet — coming in T023-T025",
          },
        } satisfies Partial<MCPResponse>,
        { status: 501 },
      );
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
};
