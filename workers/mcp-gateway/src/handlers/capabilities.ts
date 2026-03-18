import type { MCPCapabilities } from "@relay/shared";

import type { RouteContext } from "../index";
import { corsJson } from "../index";
import { getToolsForServer } from "../registry";

/**
 * GET /s/{serverToken}/mcp — MCP capabilities endpoint.
 * Returns the server's tool list and protocol info as JSON.
 */
export function handleCapabilities(routeCtx: RouteContext): Response {
  const { config } = routeCtx;
  const tools = getToolsForServer(config.type, config.allowedTools);

  const capabilities: MCPCapabilities = {
    protocolVersion: "2024-11-05",
    capabilities: { tools: { listChanged: false } },
    serverInfo: { name: `relay-${config.type}`, version: "1.0.0" },
    tools,
  };

  return corsJson(capabilities);
}
