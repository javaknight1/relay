-- ============================================================
-- Relay Schema (consolidated)
-- Tables: users, servers, server_credentials, server_logs
-- Row Level Security policies included inline
-- ============================================================

-- ── Users (synced from Clerk via webhook) ────────────────────

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
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
  credential_expires_at TIMESTAMPTZ,
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

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_logs ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ─────────────────────────────────────────────
-- API routes and Workers use the service role key (bypasses RLS).
-- These policies protect against direct client-level access.

-- Users: read and update only their own row
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Servers: full CRUD on own servers
CREATE POLICY "servers_select_own" ON servers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "servers_insert_own" ON servers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "servers_update_own" ON servers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "servers_delete_own" ON servers
  FOR DELETE USING (user_id = auth.uid());

-- Server Logs: read logs for servers user owns
CREATE POLICY "server_logs_select_own" ON server_logs
  FOR SELECT USING (
    server_id IN (
      SELECT id FROM servers WHERE user_id = auth.uid()
    )
  );

-- Server Credentials: no policies — service-role only.
-- RLS enabled + no policies = all non-service-role access denied.
