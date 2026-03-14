// ── Database Row Types ───────────────────────────────────────
// These mirror the Supabase schema exactly.

import type { PlanTier, ServerStatus, ServerType } from "./index";

export interface UserRow {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  stripe_customer_id: string | null;
  plan: PlanTier;
  plan_valid_until: string | null;
  created_at: string;
}

export interface ServerRow {
  id: string;
  user_id: string;
  name: string;
  type: ServerType;
  server_token_hash: string;
  status: ServerStatus;
  credential_key: string;
  allowed_tools: string[] | null;
  endpoint_url: string | null;
  last_active_at: string | null;
  error_message: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface ServerCredentialRow {
  id: string;
  server_id: string;
  encrypted_blob: string;
  created_at: string;
}

export interface ServerLogRow {
  id: string;
  server_id: string;
  tool_name: string;
  status: "success" | "error";
  duration_ms: number | null;
  error_message: string | null;
  called_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<UserRow, "id">>;
      };
      servers: {
        Row: ServerRow;
        Insert: Omit<ServerRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ServerRow, "id">>;
      };
      server_credentials: {
        Row: ServerCredentialRow;
        Insert: Omit<ServerCredentialRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ServerCredentialRow, "id">>;
      };
      server_logs: {
        Row: ServerLogRow;
        Insert: Omit<ServerLogRow, "id" | "called_at"> & {
          id?: string;
          called_at?: string;
        };
        Update: Partial<Omit<ServerLogRow, "id">>;
      };
    };
  };
}
