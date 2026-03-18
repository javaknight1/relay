import type { MCPRequest, MCPResponse } from "@relay/shared";

import { decryptCredentials } from "../credentials";
import { getExecutor } from "../executor";
import type { RouteContext } from "../index";
import { CORS_HEADERS, corsJson } from "../index";
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

  try {
    const result = await executor.executeTool(
      toolName,
      req.params?.arguments ?? {},
      credentials,
      routeCtx,
    );

    // TODO (T027): push log entry to Upstash queue (async, after response)
    return corsJson(
      rpcResult(id, {
        content: [{ type: "text", text: JSON.stringify(result) }],
      }),
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Tool execution failed";

    // TODO (T027): push error log entry
    return corsJson(rpcError(id, -32000, message));
  }
}
