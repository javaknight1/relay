import type { RouteContext } from "../index";

/**
 * GET /s/{serverToken}/mcp — MCP capabilities endpoint.
 * Returns the server's tool list and protocol info via SSE.
 * Stub for T024.
 */
export function handleCapabilities(_routeCtx: RouteContext): Response {
  return Response.json(
    {
      jsonrpc: "2.0",
      error: { code: -32601, message: "Capabilities endpoint not implemented yet (T024)" },
    },
    { status: 501 },
  );
}
