-- ============================================================
-- Relay Initial Schema
-- Tables: users, servers, server_logs, server_credentials
-- ============================================================

-- ── Users (synced from Clerk via webhook) ────────────────────

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  plan_valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_clerk_id ON users (clerk_id);
CREATE INDEX idx_users_email ON users (email);

-- ── Servers ──────────────────────────────────────────────────

CREATE TABLE servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  server_token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'deploying',
  credential_key TEXT NOT NULL,
  allowed_tools TEXT[],
  endpoint_url TEXT,
  last_active_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_servers_user_id ON servers (user_id);
CREATE INDEX idx_servers_status ON servers (status);

-- ── Server Credentials (encrypted blobs) ─────────────────────

CREATE TABLE server_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers (id) ON DELETE CASCADE,
  encrypted_blob TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_server_credentials_server_id ON server_credentials (server_id);

-- ── Server Logs (tool call audit trail) ──────────────────────

CREATE TABLE server_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers (id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  error_message TEXT,
  called_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_server_logs_server_id ON server_logs (server_id);
CREATE INDEX idx_server_logs_called_at ON server_logs (called_at DESC);
CREATE INDEX idx_server_logs_server_id_called_at ON server_logs (server_id, called_at DESC);

-- ── Enable Row Level Security ────────────────────────────────
-- Policies are defined in T046. Enabling RLS now means
-- all access is denied by default until policies are added.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_logs ENABLE ROW LEVEL SECURITY;
