import type { MCPRequest, MCPResponse } from "@relay/shared";
import type { RouteContext } from "../index";

/**
 * POST /s/{serverToken}/rpc — JSON-RPC tool call handler.
 * Validates the envelope, decrypts credentials, dispatches to template handler.
 * Stub for T025.
 */
export async function handleRpc(
  request: Request,
  _routeCtx: RouteContext,
): Promise<Response> {
  // Validate JSON-RPC envelope
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { jsonrpc: "2.0", id: 0, error: { code: -32700, message: "Parse error" } },
      { status: 400 },
    );
  }

  const req = body as Partial<MCPRequest>;
  if (req.jsonrpc !== "2.0" || !req.method || req.id == null) {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: req.id ?? 0,
        error: { code: -32600, message: "Invalid JSON-RPC request" },
      },
      { status: 400 },
    );
  }

  // T025 will implement full tool dispatch
  return Response.json(
    {
      jsonrpc: "2.0",
      id: req.id!,
      error: { code: -32601, message: "RPC handler not implemented yet (T025)" },
    } satisfies MCPResponse,
    { status: 501 },
  );
}
