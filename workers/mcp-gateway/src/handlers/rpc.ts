import type { MCPRequest, MCPResponse, ServerConfig } from "@relay/shared";

import { decryptCredentials } from "../credentials";
import { getExecutor } from "../executor";
import type { RouteContext, Env } from "../index";
import { CORS_HEADERS, corsJson } from "../index";
import { pushLog } from "../logger";
import { getToolsForServer } from "../registry";

// ── Helpers ─────────────────────────────────────────────────

function rpcResult(id: number | string, result: unknown): MCPResponse {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(
  id: number | string | null,
  code: number,
  message: string,
): MCPResponse {
  return { jsonrpc: "2.0", id: id ?? 0, error: { code, message } };
}

// ── Handler ─────────────────────────────────────────────────

/**
 * POST /s/{serverToken}/rpc — JSON-RPC 2.0 handler.
 *
 * Supported methods:
 *  - initialize     → protocol version + capabilities
 *  - ping           → empty result
 *  - tools/list     → filtered tool definitions
 *  - tools/call     → dispatch to ToolExecutor
 *  - notifications/* → accepted with 202 (no response body)
 */
export async function handleRpc(
  request: Request,
  routeCtx: RouteContext,
): Promise<Response> {
  // ── Parse JSON body ───────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsJson(rpcError(null, -32700, "Parse error"), { status: 400 });
  }

  const req = body as Partial<MCPRequest>;
  if (req.jsonrpc !== "2.0" || !req.method) {
    return corsJson(
      rpcError(req.id ?? null, -32600, "Invalid JSON-RPC request"),
      { status: 400 },
    );
  }

  // ── Notifications (no id) — acknowledge without response body
  if (req.id == null) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }

  const { config } = routeCtx;

  // ── Method dispatch ───────────────────────────────────────
  switch (req.method) {
    case "initialize":
      return corsJson(
        rpcResult(req.id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: `relay-${config.type}`, version: "1.0.0" },
        }),
      );

    case "ping":
      return corsJson(rpcResult(req.id, {}));

    case "tools/list":
      return corsJson(
        rpcResult(req.id, {
          tools: getToolsForServer(config.type, config.allowedTools),
        }),
      );

    case "tools/call":
      return handleToolCall(req, routeCtx);

    default:
      return corsJson(
        rpcError(req.id, -32601, `Method not found: ${req.method}`),
      );
  }
}

// ── tools/call handler ──────────────────────────────────────

async function handleToolCall(
  req: Partial<MCPRequest>,
  routeCtx: RouteContext,
): Promise<Response> {
  const id = req.id!;
  const toolName = req.params?.name;

  if (!toolName) {
    return corsJson(rpcError(id, -32602, "Missing params.name"));
  }

  // Validate tool exists and is allowed for this server
  const { config } = routeCtx;
  const availableTools = getToolsForServer(config.type, config.allowedTools);
  const tool = availableTools.find((t) => t.name === toolName);

  if (!tool) {
    return corsJson(rpcError(id, -32602, `Unknown tool: ${toolName}`));
  }

  // Decrypt credentials per-request (T026)
  let credentials: Record<string, unknown>;
  try {
    credentials = await decryptCredentials(config.credentialKey, routeCtx.env);
  } catch {
    return corsJson(
      rpcError(id, -32000, "Failed to load server credentials"),
      { status: 500 },
    );
  }

  // Dispatch to template handler
  const executor = getExecutor(config.type);
  const startMs = Date.now();

  try {
    const result = await executor.executeTool(
      toolName,
      req.params?.arguments ?? {},
      credentials,
      routeCtx,
    );
    const durationMs = Date.now() - startMs;

    const calledAt = new Date().toISOString();

    // Async log push — never blocks the response (T027)
    routeCtx.ctx.waitUntil(
      pushLog(
        {
          serverId: config.serverId,
          toolName,
          status: "success",
          durationMs,
          errorMessage: null,
          calledAt,
        },
        routeCtx.env,
      ),
    );

    // Update lastActiveAt in KV to avoid a DB write per call (T039)
    routeCtx.ctx.waitUntil(
      updateLastActiveAt(routeCtx.serverToken, config, calledAt, routeCtx.env),
    );

    return corsJson(
      rpcResult(id, {
        content: [{ type: "text", text: JSON.stringify(result) }],
      }),
    );
  } catch (err) {
    const durationMs = Date.now() - startMs;
    const message =
      err instanceof Error ? err.message : "Tool execution failed";

    // Async error log push (T027)
    routeCtx.ctx.waitUntil(
      pushLog(
        {
          serverId: config.serverId,
          toolName,
          status: "error",
          durationMs,
          errorMessage: message,
          calledAt: new Date().toISOString(),
        },
        routeCtx.env,
      ),
    );

    return corsJson(rpcError(id, -32000, message));
  }
}

// ── KV last-active-at updater (T039) ─────────────────────────

/**
 * Update the `lastActiveAt` field on the KV config entry after a successful
 * tool call. This avoids a Supabase write on every call — the cron-based
 * log-ingestion job will flush the authoritative timestamp to the DB.
 *
 * Failures are silently swallowed so they never affect the tool call response.
 */
async function updateLastActiveAt(
  serverToken: string,
  config: ServerConfig,
  calledAt: string,
  env: Env,
): Promise<void> {
  try {
    const updated: ServerConfig = { ...config, lastActiveAt: calledAt };
    await env.SERVER_ROUTING.put(
      `server:${serverToken}`,
      JSON.stringify(updated),
    );
  } catch (err) {
    console.error("Failed to update lastActiveAt in KV:", err);
  }
}
