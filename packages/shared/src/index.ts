// ── Server Types ──────────────────────────────────────────────

export type ServerType =
  | "github"
  | "notion"
  | "slack"
  | "postgres"
  | "brave"
  | "gdrive";

export type ServerStatus = "deploying" | "running" | "stopped" | "error";

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

// ── Database Types ───────────────────────────────────────────

export type {
  Database,
  UserRow,
  ServerRow,
  ServerCredentialRow,
  ServerLogRow,
} from "./database";

// ── Crypto ──────────────────────────────────────────────────

export { importKey, encrypt, decrypt } from "./crypto";

// ── Billing ─────────────────────────────────────────────────

export const BILLING = {
  pricePerServerCents: 300, // $3/server/month
} as const;
