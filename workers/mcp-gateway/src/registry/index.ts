import type { MCPToolDefinition, ServerType } from "@relay/shared";

import { braveTools } from "./brave";
import { githubTools } from "./github";
import { linearTools } from "./linear";
import { notionTools } from "./notion";
import { postgresTools } from "./postgres";
import { slackTools } from "./slack";

const toolsByType: Record<ServerType, MCPToolDefinition[]> = {
  github: githubTools,
  notion: notionTools,
  brave: braveTools,
  slack: slackTools,
  postgres: postgresTools,
  gdrive: [], // T033 — tool definitions registered in executor only
  linear: linearTools,
};

/**
 * Return tool definitions for a server type, optionally filtered by allowedTools.
 *
 * - `allowedTools: null`  → all tools for the type
 * - `allowedTools: [...]` → only matching tools
 */
export function getToolsForServer(
  type: ServerType,
  allowedTools: string[] | null,
): MCPToolDefinition[] {
  const all = toolsByType[type] ?? [];
  if (!allowedTools) return all;
  const allowed = new Set(allowedTools);
  return all.filter((t) => allowed.has(t.name));
}
