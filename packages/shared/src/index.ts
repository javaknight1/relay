// ── Server Types ──────────────────────────────────────────────

export type ServerType =
  | "github"
  | "notion"
  | "slack"
  | "postgres"
  | "brave"
  | "gdrive";

export type ServerStatus = "deploying" | "running" | "stopped" | "error";

export type PlanTier = "free" | "starter" | "pro" | "builder";

export interface ServerConfig {
  serverId: string;
  userId: string;
  type: ServerType;
  credentialKey: string;
  allowedTools: string[] | null;
  status: ServerStatus;
}

// ── MCP Protocol Types ───────────────────────────────────────

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPCapabilities {
  protocolVersion: string;
  capabilities: { tools: Record<string, unknown> };
  serverInfo: { name: string; version: string };
  tools: MCPToolDefinition[];
}

export interface MCPRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

export interface MCPResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// ── Credential Types ─────────────────────────────────────────

export interface EncryptedBlob {
  iv: string;
  ciphertext: string;
}

// ── Plan Limits ──────────────────────────────────────────────

export const PLAN_LIMITS: Record<
  PlanTier,
  { maxServers: number; callsPerDay: number; logRetentionDays: number }
> = {
  free: { maxServers: 1, callsPerDay: 100, logRetentionDays: 7 },
  starter: { maxServers: 3, callsPerDay: 1_000, logRetentionDays: 30 },
  pro: { maxServers: 8, callsPerDay: 5_000, logRetentionDays: 90 },
  builder: { maxServers: 20, callsPerDay: 20_000, logRetentionDays: 180 },
};
