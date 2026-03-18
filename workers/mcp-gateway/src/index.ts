import type { ServerConfig } from "@relay/shared";
import { handleCapabilities } from "./handlers/capabilities";
import { handleRpc } from "./handlers/rpc";

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

/** Parsed route info passed to handlers. */
export interface RouteContext {
  serverToken: string;
  config: ServerConfig;
  env: Env;
  ctx: ExecutionContext;
}

// ── Route pattern ────────────────────────────────────────────
const MCP_ROUTE = /^\/s\/([^/]+)\/(mcp|rpc)$/;

// ── CORS headers (MCP clients may preflight) ────────────────
export const CORS_HEADERS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function corsJson(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: { ...CORS_HEADERS, ...init?.headers },
  });
}

// ── Worker entry ─────────────────────────────────────────────

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health") {
      return corsJson({ status: "ok", environment: env.ENVIRONMENT });
    }

    // Match MCP routes: /s/{serverToken}/(mcp|rpc)
    const match = url.pathname.match(MCP_ROUTE);
    if (!match) {
      return corsJson({ error: "Not found" }, { status: 404 });
    }

    const [, serverToken, action] = match;

    // ── KV lookup ──────────────────────────────────────────
    const configJson = await env.SERVER_ROUTING.get(
      `server:${serverToken}`,
    );

    if (!configJson) {
      return corsJson({ error: "Server not found" }, { status: 404 });
    }

    let config: ServerConfig;
    try {
      config = JSON.parse(configJson);
    } catch {
      return corsJson(
        { error: "Corrupt server configuration" },
        { status: 500 },
      );
    }

    // ── Status gate ────────────────────────────────────────
    if (config.status !== "running") {
      return corsJson(
        { error: `Server is ${config.status}` },
        { status: 503 },
      );
    }

    // ── Route to handler ───────────────────────────────────
    const routeCtx: RouteContext = { serverToken, config, env, ctx };

    if (action === "mcp" && request.method === "GET") {
      return handleCapabilities(routeCtx);
    }

    if (action === "rpc" && request.method === "POST") {
      return handleRpc(request, routeCtx);
    }

    // Wrong method for the action
    return corsJson(
      { error: `Method ${request.method} not allowed for /${action}` },
      { status: 405 },
    );
  },
};
