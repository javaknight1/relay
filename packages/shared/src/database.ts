// ── Database Row Types ───────────────────────────────────────
// These mirror the Supabase schema exactly.
// Union types are inlined to avoid cross-file imports that break
// supabase-js generic type resolution across package boundaries.

export interface UserRow {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface ServerRow {
  id: string;
  user_id: string;
  name: string;
  type: "github" | "notion" | "slack" | "postgres" | "brave" | "gdrive" | "linear" | "jira" | "airtable";
  server_token_hash: string;
  status: "deploying" | "running" | "stopped" | "error";
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
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      servers: {
        Row: ServerRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "github" | "notion" | "slack" | "postgres" | "brave" | "gdrive" | "linear" | "jira" | "airtable";
          server_token_hash: string;
          status: "deploying" | "running" | "stopped" | "error";
          credential_key: string;
          allowed_tools?: string[] | null;
          endpoint_url?: string | null;
          last_active_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "github" | "notion" | "slack" | "postgres" | "brave" | "gdrive" | "linear" | "jira" | "airtable";
          server_token_hash?: string;
          status?: "deploying" | "running" | "stopped" | "error";
          credential_key?: string;
          allowed_tools?: string[] | null;
          endpoint_url?: string | null;
          last_active_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      server_credentials: {
        Row: ServerCredentialRow;
        Insert: {
          id?: string;
          server_id: string;
          encrypted_blob: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          server_id?: string;
          encrypted_blob?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      server_logs: {
        Row: ServerLogRow;
        Insert: {
          id?: string;
          server_id: string;
          tool_name: string;
          status: "success" | "error";
          duration_ms?: number | null;
          error_message?: string | null;
          called_at?: string;
        };
        Update: {
          id?: string;
          server_id?: string;
          tool_name?: string;
          status?: "success" | "error";
          duration_ms?: number | null;
          error_message?: string | null;
          called_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
