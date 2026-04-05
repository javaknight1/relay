import type { ServerConfig } from "@relay/shared";
import { handleCapabilities } from "./handlers/capabilities";
import { handleScheduled } from "./handlers/healthcheck";
import { handleRpc } from "./handlers/rpc";
import { withSentry, captureException } from "./sentry";

export interface Env {
  // KV namespace for server routing table
  SERVER_ROUTING: KVNamespace;

  // Environment variables
  ENVIRONMENT: string;

  // Secrets (set via wrangler secret put)
  ENCRYPTION_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  SENTRY_DSN?: string;
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

// ── Rate limiting ────────────────────────────────────────────
const DAILY_LIMIT = 10_000;

/**
 * Per-server daily rate limiter using KV.
 * Returns a 429 Response if the limit is exceeded, otherwise null.
 * Counter resets at midnight UTC via KV TTL expiration.
 */
async function checkRateLimit(
  serverToken: string,
  env: Env,
): Promise<Response | null> {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const key = `ratelimit:${serverToken}:${today}`;
  const count = parseInt((await env.SERVER_ROUTING.get(key)) ?? "0", 10);

  if (count >= DAILY_LIMIT) {
    const now = new Date();
    const midnight = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
      ),
    );
    const retryAfter = Math.ceil(
      (midnight.getTime() - now.getTime()) / 1000,
    );

    return new Response(
      JSON.stringify({ error: "Rate limit exceeded", retryAfter }),
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          "Retry-After": String(retryAfter),
          "Content-Type": "application/json",
        },
      },
    );
  }

  await env.SERVER_ROUTING.put(key, String(count + 1), {
    expirationTtl: 86400,
  });

  return null;
}

// ── Worker entry ─────────────────────────────────────────────

const handler: ExportedHandler<Env> = {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(handleScheduled(env));
  },

  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
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
        // Per-server daily rate limit (10,000 calls/day)
        const rateLimited = await checkRateLimit(serverToken, env);
        if (rateLimited) return rateLimited;

        return handleRpc(request, routeCtx);
      }

      // Wrong method for the action
      return corsJson(
        { error: `Method ${request.method} not allowed for /${action}` },
        { status: 405 },
      );
    } catch (error) {
      captureException(error);
      return corsJson({ error: "Internal server error" }, { status: 500 });
    }
  },
};

export default withSentry<Env>(
  (env) =>
    env.SENTRY_DSN
      ? { dsn: env.SENTRY_DSN, tracesSampleRate: 0.1 }
      : undefined,
  handler,
);
