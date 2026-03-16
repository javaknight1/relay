# Relay - Technical Roadmap & Task Tracker

**Relay** — Managed MCP server hosting for everyone. Pick a template, enter your credentials, get a live endpoint URL in 3 minutes. No terminal required.

**Last Updated: 2026-03-09** (Project initialized)

---

## Stack Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind + TypeScript | Full-stack in one repo, server components for dashboard |
| Auth | Clerk | Drop-in UI, webhooks to sync users, handles all edge cases |
| Database | Supabase (Postgres) | Managed Postgres + RLS, real-time available for later |
| Execution | Cloudflare Workers | Edge execution, low latency, free tier generous |
| Credential Storage | AES-256 encrypted blobs in Supabase | $0 cost, own the encryption, migrate later if compliance demands |
| Encryption Key | Cloudflare Worker Secret (env var) | Never touches the DB, injected at runtime |
| Routing Table | Cloudflare KV | Sub-ms lookup of serverToken → server config |
| Log Queue | Upstash Redis (queue mode) | Async log push from Workers without blocking responses |
| Billing | Stripe | Industry standard, webhooks are reliable |
| Email | Resend | Simple API, good deliverability, generous free tier |
| Containers (Postgres MCP) | Fly.io | Stateful servers that need persistent TCP |
| CI/CD | GitHub Actions | Already familiar from ServicePro |

---

## Task Index

| ID   | Priority | Category      | Confidence | MVP    | Task                                                                |
|------|----------|---------------|------------|--------|---------------------------------------------------------------------|
| ~~T001~~ | ~~P0~~ | ~~Setup~~     | ~~High~~   | ~~Before~~ | ~~Initialize monorepo (Next.js + Cloudflare Workers)~~          |
| ~~T002~~ | ~~P0~~ | ~~Setup~~     | ~~High~~   | ~~Before~~ | ~~Set up Supabase project + schema migrations~~                |
| ~~T003~~ | ~~P0~~ | ~~Setup~~     | ~~High~~   | ~~Before~~ | ~~Integrate Clerk authentication~~                             |
| T004 | P0       | Setup         | High       | Before | Set up Cloudflare Workers project + wrangler config                |
| T005 | P0       | Setup         | High       | Before | Configure Cloudflare KV namespaces                                 |
| T006 | P0       | Setup         | High       | Before | Set up Stripe (single product, quantity-based $3/server/mo price)  |
| T007 | P0       | Setup         | High       | Before | Integrate Resend for transactional email                           |
| T008 | P0       | Setup         | High       | Before | GitHub Actions CI/CD pipeline                                      |
| ~~T009~~ | ~~P0~~ | ~~Auth~~ | ~~High~~ | ~~Before~~ | ~~Clerk webhook → sync user to Supabase users table~~ |
| ~~T010~~ | ~~P0~~ | ~~Auth~~ | ~~High~~ | ~~Before~~ | ~~Auth middleware for Next.js API routes~~ |
| ~~T011~~ | ~~P0~~ | ~~Dashboard~~ | ~~High~~ | ~~Before~~ | ~~Build app shell (sidebar, layout, nav)~~ |
| ~~T012~~ | ~~P0~~ | ~~Dashboard~~ | ~~High~~ | ~~Before~~ | ~~Build empty state dashboard~~ |
| ~~T013~~ | ~~P0~~ | ~~Dashboard~~ | ~~High~~ | ~~Before~~ | ~~Build server list dashboard (with servers)~~ |
| ~~T014~~ | ~~P0~~ | ~~Servers~~ | ~~High~~ | ~~Before~~ | ~~Build template catalog page~~ |
| ~~T015~~ | ~~P0~~ | ~~Servers~~ | ~~High~~ | ~~Before~~ | ~~Build credential form (generic + per-template fields)~~ |
| ~~T016~~ | ~~P0~~ | ~~Servers~~ | ~~High~~ | ~~Before~~ | ~~Build credential validation (test connection before deploy)~~ |
| T017 | P0       | Servers       | High       | Before | Build deploy flow + progress screen                                |
| ~~T018~~ | ~~P0~~ | ~~Servers~~ | ~~High~~ | ~~Before~~ | ~~Build server detail page — Connect tab~~ |
| ~~T019~~ | ~~P0~~ | ~~Servers~~ | ~~High~~ | ~~Before~~ | ~~Build server detail page — Logs tab~~ |
| ~~T020~~ | ~~P0~~ | ~~Servers~~ | ~~High~~ | ~~Before~~ | ~~Build server detail page — Settings tab~~ |
| T021 | P0       | Security      | High       | Before | Build AES-256 credential encryption/decryption                     |
| T022 | P0       | Security      | High       | Before | Encrypted credential storage in Supabase                           |
| T023 | P0       | Worker        | High       | Before | Worker routing layer (serverToken → KV lookup → server config)     |
| T024 | P0       | Worker        | High       | Before | MCP capabilities endpoint (GET /s/{token}/mcp — SSE)              |
| T025 | P0       | Worker        | High       | Before | JSON-RPC tool call handler (POST /s/{token}/rpc)                   |
| T026 | P0       | Worker        | High       | Before | Credential decryption in Worker request lifecycle                  |
| T027 | P0       | Worker        | High       | Before | Async log push to Upstash queue (non-blocking)                     |
| T028 | P0       | Templates     | High       | Before | GitHub MCP server handler (12 tools)                               |
| T029 | P0       | Templates     | High       | Before | Notion MCP server handler (8 tools)                                |
| T030 | P1       | Templates     | High       | Before | Brave Search MCP server handler (2 tools)                          |
| T031 | P1       | Templates     | Medium     | Before | Slack MCP server handler (6 tools)                                 |
| T032 | P1       | Templates     | Medium     | Before | PostgreSQL MCP server handler (Fly.io container)                   |
| T033 | P1       | Templates     | Medium     | Before | Google Drive MCP server handler                                    |
| T034 | P0       | Config        | High       | Before | Auto-generate Claude Desktop config JSON                           |
| T035 | P1       | Config        | High       | Before | Auto-generate Cursor config                                        |
| T036 | P1       | Config        | High       | Before | Auto-generate Windsurf config                                      |
| T037 | P0       | Health        | High       | Before | MCP health check (actual MCP handshake, not just HTTP ping)        |
| T038 | P1       | Health        | High       | Before | Credential expiry detection + proactive warning email              |
| T039 | P1       | Health        | High       | Before | Server uptime tracking (store last_active_at)                      |
| ~~T040~~ | ~~P0~~ | ~~Billing~~ | ~~High~~ | ~~Before~~ | ~~Build pricing page~~ |
| T041 | P0       | Billing       | High       | Before | Server creation → increment Stripe subscription quantity           |
| T042 | P0       | Billing       | High       | Before | Stripe Checkout flow (first server → checkout, subsequent → update)|
| T043 | P1       | Billing       | High       | Before | Stripe Customer Portal (manage subscription)                       |
| T044 | P0       | Billing       | High       | Before | Stripe webhook handler (subscription lifecycle)                    |
| T045 | P1       | Billing       | High       | Before | Billing page in dashboard (server count x $3/mo)                   |
| T046 | P0       | Security      | High       | Before | Supabase Row Level Security policies (users own their servers)     |
| T047 | P1       | Security      | High       | Before | Server token rotation endpoint                                     |
| T048 | P1       | Security      | High       | Before | Rate limiting on Worker execution layer                            |
| T049 | P1       | Monitoring    | High       | Before | Structured log ingestion from Upstash queue → Supabase             |
| T050 | P1       | Monitoring    | High       | Before | Log retention policy (30 days free, 90 days paid)                  |
| T051 | P2       | Monitoring    | Medium     | Before | Tool call stats aggregation (calls/day, avg latency, error rate)   |
| T052 | P1       | Settings      | High       | Before | User settings page (name, email, delete account)                   |
| T053 | P0       | Infra         | High       | Before | Environment config (.env.local + Cloudflare secrets)               |
| T054 | P2       | Observability | High       | After  | Sentry error tracking (Next.js + Worker)                           |
| T055 | P2       | Analytics     | High       | After  | PostHog product analytics                                           |
| T056 | P2       | Templates     | Medium     | After  | OAuth flow handling for Google + Slack (full OAuth dance in Worker) |
| T057 | P2       | Templates     | Medium     | After  | Linear MCP server handler                                          |
| T058 | P2       | Templates     | Medium     | After  | Jira MCP server handler                                            |
| T059 | P2       | Templates     | Medium     | After  | Airtable MCP server handler                                        |
| T060 | P3       | Builder       | Low        | After  | OpenAPI importer (paste spec → select endpoints → deploy)          |
| T061 | P3       | Builder       | Low        | After  | Manual tool builder (no-code HTTP request definer)                 |
| T062 | P3       | Discovery     | Low        | After  | One-click publish to Smithery registry                             |
| T063 | P3       | Teams         | Low        | After  | Team workspaces + member invites                                    |
| T064 | P3       | Teams         | Low        | After  | Role-based access within workspace (Admin, Viewer)                 |
| T065 | P3       | API           | Low        | After  | Developer API (headless server provisioning via API key)           |
| T066 | P3       | RAG           | Low        | After  | RAG knowledge base server type (file upload + vector search)       |
| T067 | P2       | UX            | Medium     | After  | Tool-level toggle controls (enable/disable individual tools)       |
| T068 | P2       | UX            | High       | After  | Dark mode                                                           |
| T069 | P2       | Marketing     | High       | After  | Public landing page                                                 |
| T070 | P2       | Marketing     | High       | After  | Documentation site                                                  |
| T071 | P2       | DevEx         | High       | After  | MCP playground & debugger (interactive web UI)                      |
| T072 | P2       | Marketplace   | Medium     | After  | MCP server registry & marketplace                                   |
| T073 | P2       | Platform      | Medium     | After  | Composable MCP servers (merge multiple into one endpoint)           |
| T074 | P2       | Platform      | High       | After  | Schema validation & server versioning                               |
| T075 | P3       | Billing       | Low        | After  | Creator monetization (let publishers charge for MCP servers)        |
| T076 | P3       | Builder       | Medium     | After  | AI-assisted MCP server builder                                      |
| T077 | P3       | Platform      | Low        | After  | Relay Client SDK (universal MCP connector library)                  |
| T078 | P2       | Observability | Medium     | After  | AI conversation context in observability                            |
| T079 | P2       | Platform      | High       | After  | Webhooks & event system (trigger on MCP events)                     |
| T080 | P3       | Platform      | Medium     | After  | Canary deploys & instant rollback                                   |
| T081 | P2       | Security      | High       | After  | Secrets & integrations vault                                        |

---

## Sprint Roadmap

### Sprint 1 — Foundation (Infra + Auth + Shell)

Get the app running end-to-end with real auth and a skeleton UI.

- [x] **T001** — Initialize monorepo
- [x] **T002** — Supabase schema
- [x] **T003** — Clerk auth
- [ ] **T004** — Cloudflare Workers + wrangler
- [ ] **T005** — Cloudflare KV
- [ ] **T008** — GitHub Actions CI/CD
- [x] **T009** — Clerk webhook → Supabase user sync
- [x] **T010** — Auth middleware
- [x] **T011** — App shell (sidebar + layout)
- [ ] **T053** — Environment config

### Sprint 2 — Credential Security + Worker Core

The hardest technical piece. Get encryption working and the Worker executing real MCP calls.

- [ ] **T021** — AES-256 encryption/decryption
- [ ] **T022** — Encrypted credential storage
- [ ] **T046** — Supabase RLS policies
- [ ] **T023** — Worker routing layer
- [ ] **T024** — MCP capabilities endpoint (SSE)
- [ ] **T025** — JSON-RPC tool call handler
- [ ] **T026** — Credential decryption in Worker
- [ ] **T027** — Async log push to Upstash

### Sprint 3 — First Working Server (GitHub)

End-to-end: user signs up → connects GitHub → gets a URL → Claude calls a tool. The full happy path.

- [ ] **T028** — GitHub MCP server handler
- [x] **T015** — Credential form (GitHub)
- [x] **T016** — Credential validation (GitHub token test)
- [ ] **T017** — Deploy flow + progress screen
- [ ] **T037** — MCP health check
- [ ] **T034** — Claude Desktop config generation
- [x] **T018** — Server detail → Connect tab
- [x] **T012** — Empty state dashboard
- [x] **T013** — Server list dashboard

### Sprint 4 — More Templates + Logs + Settings

Expand the template library and wire up the remaining detail tabs.

- [ ] **T029** — Notion MCP server handler
- [ ] **T030** — Brave Search MCP server handler
- [x] **T014** — Template catalog page
- [ ] **T049** — Log ingestion from queue
- [x] **T019** — Server detail → Logs tab
- [x] **T020** — Server detail → Settings tab
- [ ] **T039** — Server uptime tracking
- [ ] **T047** — Token rotation endpoint
- [ ] **T052** — User settings page

### Sprint 5 — Billing ($3/server/month)

Per-server billing. First server triggers Stripe Checkout, subsequent servers update subscription quantity.

- [x] **T040** — Pricing page
- [ ] **T006** — Stripe single product + quantity-based price ($3/server/mo)
- [ ] **T042** — Stripe Checkout (first server → checkout, subsequent → update quantity)
- [ ] **T044** — Stripe webhook handler (subscription lifecycle)
- [ ] **T041** — Server creation → increment Stripe subscription quantity
- [ ] **T043** — Stripe Customer Portal
- [ ] **T045** — Billing page in dashboard (server count x $3/mo)
- [ ] **T007** — Resend email (welcome, expiry warning, payment receipt)

### Sprint 6 — Remaining Templates + Config

Fill out the template catalog and multi-client config support.

- [ ] **T031** — Slack MCP server handler
- [ ] **T032** — PostgreSQL MCP server handler (Fly.io)
- [ ] **T033** — Google Drive MCP server handler
- [ ] **T035** — Cursor config generation
- [ ] **T036** — Windsurf config generation
- [ ] **T038** — Credential expiry detection + email
- [ ] **T048** — Worker rate limiting
- [ ] **T050** — Log retention policy

### Sprint 7 — Polish + Monitoring

Hardening before any real user acquisition.

- [ ] **T051** — Tool call stats aggregation
- [ ] **T054** — Sentry error tracking
- [ ] **T055** — PostHog analytics
- [ ] **T067** — Per-tool toggle controls

### Sprint 8 — Post-MVP Growth

- [ ] **T056** — OAuth for Google + Slack
- [ ] **T057** — Linear handler
- [ ] **T058** — Jira handler
- [ ] **T059** — Airtable handler
- [ ] **T069** — Landing page
- [ ] **T070** — Documentation site
- [ ] **T060** — OpenAPI importer
- [ ] **T063** — Team workspaces
- [ ] **T065** — Developer API
- [ ] **T066** — RAG knowledge base server

### Sprint 9 — Platform Differentiation

The features that make Relay the "Vercel for MCP" — purpose-built developer experience that generic hosting platforms will never offer.

- [ ] **T071** — MCP playground & debugger
- [ ] **T074** — Schema validation & versioning
- [ ] **T079** — Webhooks & event system
- [ ] **T081** — Secrets & integrations vault
- [ ] **T078** — AI conversation context observability

### Sprint 10 — Marketplace & Ecosystem

Build network effects and a distribution moat. Be where people discover and connect to MCP servers.

- [ ] **T072** — MCP server registry & marketplace
- [ ] **T073** — Composable MCP servers
- [ ] **T077** — Relay Client SDK

### Sprint 11 — Advanced Builder & Monetization

Turn Relay into a platform where anyone can build, publish, and monetize MCP servers.

- [ ] **T076** — AI-assisted MCP server builder
- [ ] **T075** — Creator monetization platform
- [ ] **T080** — Canary deploys & instant rollback

---

## P0 — Critical (MVP Blockers)

### Setup & Infrastructure

- [x] **T001: Initialize Monorepo (Next.js + Cloudflare Workers)**
  - **What**: Set up a monorepo with two packages: `apps/web` (Next.js) and `workers/mcp-gateway` (Cloudflare Worker)
  - **Why**: Both apps share types (ServerConfig, MCPRequest/Response schemas). Monorepo keeps them in sync without npm publishing.
  - **Structure**:
    ```
    relay/
    ├── apps/
    │   └── web/               # Next.js dashboard
    ├── workers/
    │   └── mcp-gateway/       # Cloudflare Worker
    ├── packages/
    │   └── shared/            # Shared TypeScript types
    ├── package.json           # Turborepo or pnpm workspaces
    └── .github/workflows/
    ```
  - **Tech choices**: pnpm workspaces, Turborepo for build orchestration
  - **Acceptance Criteria**:
    - `pnpm dev` starts both Next.js and Worker (wrangler dev)
    - Shared types importable in both apps
    - TypeScript strict mode enabled in all packages

- [x] **T002: Set Up Supabase Schema**
  - **What**: Create the database schema with migrations
  - **Why**: Foundation for all app state
  - **Schema**:
    ```sql
    -- users (synced from Clerk)
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- servers
    CREATE TABLE servers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,               -- github | notion | slack | postgres | etc.
      server_token_hash TEXT NOT NULL,  -- SHA-256 hash of the actual token
      status TEXT NOT NULL DEFAULT 'deploying',  -- deploying | running | stopped | error
      credential_key TEXT NOT NULL,     -- KV key where encrypted credentials are stored
      allowed_tools TEXT[],             -- null = all tools enabled
      endpoint_url TEXT,
      last_active_at TIMESTAMPTZ,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      deleted_at TIMESTAMPTZ
    );

    -- server_logs
    CREATE TABLE server_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
      tool_name TEXT NOT NULL,
      status TEXT NOT NULL,   -- success | error
      duration_ms INTEGER,
      error_message TEXT,
      called_at TIMESTAMPTZ DEFAULT now()
    );
    ```
  - **Acceptance Criteria**:
    - Migrations in `supabase/migrations/`
    - `supabase db push` works cleanly
    - RLS enabled on all tables (policies in T046)

- [x] **T003: Integrate Clerk Authentication**
  - **What**: Full auth flow using Clerk
  - **Why**: Handles sign-up, sign-in, session management, social logins — don't build this yourself
  - **Implementation**:
    - Install `@clerk/nextjs`
    - Wrap app in `<ClerkProvider>`
    - Add `authMiddleware` to `middleware.ts` (protect all `/dashboard` routes)
    - Sign-in/sign-up pages at `/sign-in`, `/sign-up`
    - Redirect post-auth to `/dashboard`
  - **Acceptance Criteria**:
    - Sign-up creates Clerk user
    - Sign-in redirects to dashboard
    - Unauthenticated access to `/dashboard/*` redirects to sign-in
    - User avatar + name shown in sidebar

- [ ] **T004: Set Up Cloudflare Workers + Wrangler**
  - **What**: Initialize the Worker project that handles all live MCP traffic
  - **Why**: The Worker is the execution layer — all tool calls flow through it
  - **wrangler.toml**:
    ```toml
    name = "relay-mcp-gateway"
    main = "src/index.ts"
    compatibility_date = "2025-01-01"

    [[kv_namespaces]]
    binding = "SERVER_ROUTING"
    id = "..."
    preview_id = "..."

    [vars]
    ENVIRONMENT = "production"

    # Secrets (set via wrangler secret put):
    # ENCRYPTION_KEY — master AES-256 key
    # SUPABASE_URL
    # SUPABASE_SERVICE_ROLE_KEY
    # UPSTASH_REDIS_REST_URL
    # UPSTASH_REDIS_REST_TOKEN
    ```
  - **Acceptance Criteria**:
    - `wrangler dev` starts local Worker
    - `wrangler deploy` deploys to Cloudflare
    - Environment/secrets separated from wrangler.toml

- [ ] **T005: Configure Cloudflare KV Namespaces**
  - **What**: Create KV namespaces for the server routing table
  - **Why**: Workers need sub-ms lookup of serverToken → server config. Supabase would be too slow.
  - **KV key structure**: `server:{serverToken}` → JSON blob
    ```json
    {
      "serverId": "uuid",
      "userId": "uuid",
      "type": "github",
      "credentialKey": "cred:uuid",
      "allowedTools": null,
      "status": "running"
    }
    ```
  - **Acceptance Criteria**:
    - Namespace created for prod and preview
    - KV write happens on server deploy (from Next.js API)
    - KV delete happens on server delete or stop

- [ ] **T006: Set Up Stripe (Per-Server Billing)**
  - **What**: Configure a single Stripe product with a quantity-based price ($3/server/month)
  - **Product**: "Relay MCP Server" — metered per unit (quantity = number of active servers)
  - **Price**: $3.00/month per unit (quantity-based)
  - **Webhook events to handle**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
  - **Acceptance Criteria**:
    - Single product + quantity-based price created in Stripe
    - Webhook endpoint registered and signing secret stored
    - Test mode working end-to-end

- [ ] **T007: Integrate Resend**
  - **What**: Transactional email client
  - **Emails needed**:
    - Welcome email (on signup)
    - Credential expiry warning (7 days before)
    - Payment receipt
    - Server error alert (repeated failures)
  - **Implementation**: Resend SDK, templates as React Email components
  - **Acceptance Criteria**:
    - `sendEmail()` utility working
    - Welcome email fires on new user webhook from Clerk
    - Emails render correctly

- [ ] **T008: GitHub Actions CI/CD**
  - **What**: Automated test + deploy pipeline
  - **Workflows**:
    - `checks.yml` — TypeScript type-check + lint on every push/PR
    - `deploy.yml` — Deploy to Cloudflare Pages (Next.js) + Cloudflare Workers on push to `main`
  - **Acceptance Criteria**:
    - PRs blocked if type-check fails
    - Deploy on merge to main
    - Secrets stored in GitHub Actions environment

### Auth

- [x] **T009: Clerk Webhook → Supabase User Sync**
  - **What**: When Clerk creates/updates a user, mirror that to the Supabase `users` table
  - **Why**: All app data (servers, logs, billing) is keyed to `user_id` in Supabase, not Clerk IDs
  - **Implementation**:
    - Create webhook endpoint at `/api/webhooks/clerk`
    - Verify `svix-signature` header
    - Handle `user.created` → INSERT into users
    - Handle `user.updated` → UPDATE email/name
    - Handle `user.deleted` → soft-delete or anonymize
  - **Acceptance Criteria**:
    - New Clerk user → row in Supabase users within seconds
    - Webhook signature verified (reject invalid requests)

- [x] **T010: Auth Middleware for Next.js API Routes**
  - **What**: Protect all `/api/` routes and resolve the current user
  - **Why**: Every API handler needs `userId` to scope queries properly
  - **Implementation**:
    ```typescript
    // lib/auth.ts
    export async function requireUser(req: Request): Promise<User> {
      const { userId } = auth(); // Clerk
      if (!userId) throw new UnauthorizedError();
      const user = await db.users.findByClerkId(userId);
      if (!user) throw new UnauthorizedError();
      return user;
    }
    ```
  - **Acceptance Criteria**:
    - Unauthenticated API requests get 401
    - Handler receives typed `User` object

### Dashboard UI

- [x] **T011: App Shell (Sidebar + Layout)**
  - **What**: The persistent navigation shell around all dashboard pages
  - **Layout**:
    - Left sidebar (220px): logo, nav items, user avatar at bottom
    - Main content area: scrollable
  - **Nav items**: Dashboard, My Servers, Activity, Billing, Settings
  - **Acceptance Criteria**:
    - Active nav item highlighted
    - Responsive (sidebar collapses on mobile)
    - User name/email shown in sidebar footer

- [x] **T012: Empty State Dashboard**
  - **What**: What a new user sees before adding any servers
  - **Contents**:
    - Greeting with user's name
    - Empty state illustration + CTA to add first server
    - Grid of popular integration cards (click to pre-select template)
  - **Acceptance Criteria**:
    - "Add Server" button navigates to catalog
    - Clicking an integration card navigates to that template's credential form

- [x] **T013: Server List Dashboard**
  - **What**: The main dashboard once user has servers
  - **Contents**:
    - Server count + monthly cost display
    - List of servers: icon, name, status dot, call count, last active
  - **Acceptance Criteria**:
    - Status dot updates in real-time (or on page focus)
    - Click server row → server detail page
    - "Add Server" button always available

### Servers

- [x] **T014: Template Catalog Page**
  - **What**: Grid of available server templates to choose from
  - **Contents**: Integration card per template (icon, name, category pill, description, tool count), search/filter
  - **Templates at launch**: GitHub, Notion, Brave Search, Slack, PostgreSQL, Google Drive
  - **Acceptance Criteria**:
    - Search filters by name and category
    - Clicking a card navigates to credential form for that template
    - "Coming Soon" state for templates not yet built

- [x] **T015: Credential Form (Per-Template)**
  - **What**: The form where user enters their credentials for a specific template
  - **Requirements**:
    - Display name field (pre-filled with "My {Template} Server")
    - Template-specific credential fields (each template defines its own schema)
    - Credential type hints (e.g., "GitHub PAT requires scopes: repo, read:user")
    - Link to where the credential can be obtained
    - Tool toggles (enable/disable individual tools, all on by default)
  - **Template credential schemas**:
    - GitHub: `{ personal_access_token: string }`
    - Notion: `{ integration_token: string }`
    - Brave Search: `{ api_key: string }`
    - Slack: `{ bot_token: string, app_token: string }`
    - PostgreSQL: `{ connection_string: string }`
    - Google Drive: OAuth (post-MVP — show "Coming Soon" for now)
  - **Acceptance Criteria**:
    - Form renders correct fields for each template
    - Fields marked with required/optional
    - Cannot submit without filling required fields

- [x] **T016: Credential Validation (Test Connection)**
  - **What**: "Validate" button that tests the credentials against the real API before deploying
  - **Why**: Fail early with a clear error rather than deploying a broken server
  - **Implementation**:
    - API route `POST /api/servers/validate` takes `{ type, credentials }`
    - Each template has a `validate()` function that makes a lightweight test call
    - GitHub: `GET /user` with the token → returns username
    - Notion: `GET /users/me` → returns bot name
    - Brave: `GET /web/search?q=test&count=1` → checks for 200
    - PostgreSQL: attempt connection + `SELECT 1`
  - **Acceptance Criteria**:
    - Success shows who/what is connected ("Connected as sarahm · 23 repositories")
    - Error shows specific failure reason with actionable message
    - Loading state during validation
    - Cannot proceed to deploy without successful validation

- [ ] **T017: Deploy Flow + Progress Screen**
  - **What**: Animated progress screen while the server is being deployed
  - **Steps shown**:
    1. Encrypting credentials
    2. Storing to secure vault
    3. Generating endpoint URL
    4. Writing to routing table (KV)
    5. Starting server
    6. Verifying MCP handshake
  - **Backend**: `POST /api/servers` creates server record, writes KV entry, triggers health check
  - **Acceptance Criteria**:
    - Steps animate in sequence
    - Actual deployment happens in parallel (not one step at a time)
    - On success → navigate to server detail page
    - On failure → show error with specific step that failed

- [x] **T018: Server Detail — Connect Tab**
  - **What**: Instructions and config for connecting the server to AI clients
  - **Contents**:
    - Green success banner ("Your server is live")
    - Auto-generated config snippet for Claude Desktop (JSON, copyable)
    - Step-by-step instructions (numbered list)
    - Links to other client configs (Cursor, Windsurf)
    - Endpoint URL display
  - **Acceptance Criteria**:
    - Config snippet auto-populates with real endpoint URL and token
    - Copy button works
    - Instructions match the correct client

- [x] **T019: Server Detail — Logs Tab**
  - **What**: List of recent tool calls made through this server
  - **Columns**: Status dot, tool name, duration (ms), timestamp
  - **Display**: Last 100 calls, paginated
  - **Acceptance Criteria**:
    - Success/error status clearly distinguished
    - Tool name shown in monospace
    - Timestamps relative (e.g., "3 min ago") and hoverable for absolute time
    - Empty state when no calls yet

- [x] **T020: Server Detail — Settings Tab**
  - **What**: Edit server configuration + manage credentials
  - **Contents**:
    - Credential expiry warning banner (if < 14 days)
    - Update credentials field (paste new token)
    - Display name field
    - Danger zone: delete server (with confirmation modal)
  - **Acceptance Criteria**:
    - Updating credentials re-validates before saving
    - Delete requires typing server name to confirm
    - Delete removes KV entry, marks server as deleted in DB

### Security

- [ ] **T021: AES-256 Credential Encryption/Decryption**
  - **What**: Utility functions for encrypting and decrypting credential blobs
  - **Implementation**:
    - Use `SubtleCrypto` (Web Crypto API — available in both Node.js and Cloudflare Workers)
    - AES-256-GCM with random IV per encryption
    - Store as: `{ iv: base64, ciphertext: base64 }`
    - Master key from `ENCRYPTION_KEY` environment variable (32-byte hex string)
  - **NEVER**:
    - Log the master key
    - Log decrypted credentials
    - Cache decrypted credentials anywhere
  - **Acceptance Criteria**:
    - `encrypt(plaintext, key)` → `{ iv, ciphertext }`
    - `decrypt({ iv, ciphertext }, key)` → `plaintext`
    - Unit tests verify round-trip correctness
    - Different encryptions of same plaintext produce different ciphertexts (random IV)

- [ ] **T022: Encrypted Credential Storage**
  - **What**: Store encrypted credential blobs in Supabase, path reference in servers table
  - **Implementation**:
    - On deploy: encrypt credentials JSON blob, store in `server_credentials` table
    - Store only the `credential_key` (UUID) in `servers` table, never the ciphertext there
    - Separate table gives cleaner RLS: credentials table has stricter policies
  - **Schema addition**:
    ```sql
    CREATE TABLE server_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
      encrypted_blob TEXT NOT NULL,  -- { iv, ciphertext } as JSON string
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ```
  - **Acceptance Criteria**:
    - Plaintext credentials never stored in DB
    - Credential update creates new row, old row deleted
    - RLS: only service role (Worker) can read credentials table

- [ ] **T046: Supabase Row Level Security**
  - **What**: RLS policies ensuring users can only access their own data
  - **Policies**:
    - `servers`: SELECT/UPDATE/DELETE WHERE user_id = auth.uid() (mapped from Clerk)
    - `server_logs`: SELECT WHERE server_id IN (SELECT id FROM servers WHERE user_id = auth.uid())
    - `server_credentials`: no user-level access — service role only (Workers use service key)
  - **Acceptance Criteria**:
    - User A cannot read User B's servers even with direct Supabase calls
    - Workers use service role key (bypasses RLS intentionally)
    - Next.js API routes use anon key + JWT from Clerk

### MCP Execution Worker

- [ ] **T023: Worker Routing Layer**
  - **What**: The main Worker handler that routes incoming requests by serverToken
  - **Request flow**:
    1. Extract `serverToken` from path (`/s/{serverToken}/...`)
    2. Look up `server:{serverToken}` in KV
    3. If not found or status != "running" → 404 or 503
    4. Route to capabilities or RPC handler
  - **Acceptance Criteria**:
    - Unknown tokens → 404
    - Stopped servers → 503 with JSON error body
    - Valid tokens → correct handler invoked
    - Token lookup < 1ms (KV)

- [ ] **T024: MCP Capabilities Endpoint (SSE)**
  - **What**: `GET /s/{token}/mcp` — returns the server's capabilities via Server-Sent Events
  - **Why**: MCP clients discover what tools are available by hitting this endpoint first
  - **Response format** (MCP spec):
    ```json
    {
      "protocolVersion": "2024-11-05",
      "capabilities": { "tools": {} },
      "serverInfo": { "name": "github-sarahm", "version": "1.0.0" },
      "tools": [
        {
          "name": "list_issues",
          "description": "List GitHub issues",
          "inputSchema": { "type": "object", "properties": { ... } }
        }
      ]
    }
    ```
  - **Implementation**: Each template handler exports a `getCapabilities()` function
  - **Acceptance Criteria**:
    - Response matches MCP spec for capabilities
    - Only returns tools in `allowedTools` if set
    - Content-Type: text/event-stream
    - Claude Desktop successfully reads capabilities

- [ ] **T025: JSON-RPC Tool Call Handler**
  - **What**: `POST /s/{token}/rpc` — handles tool invocation requests from MCP clients
  - **Request format** (JSON-RPC 2.0):
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "tools/call",
      "params": {
        "name": "list_issues",
        "arguments": { "repo": "owner/repo", "state": "open" }
      }
    }
    ```
  - **Implementation**:
    1. Validate JSON-RPC envelope
    2. Fetch + decrypt credentials (T026)
    3. Instantiate template handler
    4. Call `handler.executeTool(name, arguments, credentials)`
    5. Return MCP-formatted response
    6. Push log entry to Upstash queue (T027) — async, after response sent
  - **Acceptance Criteria**:
    - Valid tool call → correct API call to downstream service → MCP response
    - Unknown tool name → JSON-RPC error response
    - Downstream API errors → MCP error response with human-readable message
    - Invalid auth from downstream → 401-equivalent MCP error with "update your credentials" hint

- [ ] **T026: Credential Decryption in Worker**
  - **What**: Fetch and decrypt credentials for the current request
  - **Implementation**:
    1. Get `credentialKey` from KV server record
    2. Fetch encrypted blob from Supabase (service role key)
    3. Decrypt using `ENCRYPTION_KEY` Worker secret
    4. Return parsed credentials object
    5. Credentials used only for this request — never cached, never logged
  - **Acceptance Criteria**:
    - Decryption happens per-request (no caching)
    - `ENCRYPTION_KEY` is a Worker Secret (not in wrangler.toml or source)
    - Failed decryption → 500 with generic error (no internal details leaked)

- [ ] **T027: Async Log Push to Upstash**
  - **What**: After sending the MCP response, push a log entry to Upstash Redis queue
  - **Why**: Logging should never add latency to the MCP response
  - **Implementation**:
    - Use `ctx.waitUntil(pushLog(...))` — Cloudflare's mechanism for non-blocking async work
    - Log payload: `{ serverId, toolName, status, durationMs, errorMessage, calledAt }`
    - Upstash queue → Next.js background worker reads queue and writes to `server_logs`
  - **Acceptance Criteria**:
    - Log push does not delay MCP response
    - Logs appear in Supabase within seconds
    - Failed log push does not affect the tool call result

### Templates

- [ ] **T028: GitHub MCP Server Handler**
  - **What**: Translates MCP tool calls into GitHub REST API calls
  - **Tools to implement** (12):
    - `list_issues(repo, state?, labels?)` → `GET /repos/{repo}/issues`
    - `get_issue(repo, issue_number)` → `GET /repos/{repo}/issues/{number}`
    - `create_issue(repo, title, body?, labels?)` → `POST /repos/{repo}/issues`
    - `update_issue(repo, issue_number, state?, title?, body?)` → `PATCH /repos/{repo}/issues/{number}`
    - `list_pull_requests(repo, state?)` → `GET /repos/{repo}/pulls`
    - `get_pull_request(repo, pr_number)` → `GET /repos/{repo}/pulls/{number}`
    - `list_repositories(per_page?)` → `GET /user/repos`
    - `get_repository(repo)` → `GET /repos/{repo}`
    - `search_issues(query)` → `GET /search/issues`
    - `search_code(query, repo?)` → `GET /search/code`
    - `get_file_contents(repo, path, branch?)` → `GET /repos/{repo}/contents/{path}`
    - `push_files(repo, branch, files, message)` → `PUT /repos/{repo}/contents/{path}` (disabled by default)
  - **Auth**: `Authorization: Bearer {personal_access_token}`
  - **Credential validation**: `GET /user` → verify token is valid, return login name
  - **Acceptance Criteria**:
    - All tools callable from Claude
    - Error from GitHub returned as readable MCP error
    - `push_files` off by default in tool toggles

- [ ] **T029: Notion MCP Server Handler**
  - **What**: Translates MCP tool calls into Notion API calls
  - **Tools to implement** (8):
    - `search(query, filter?)` → `POST /search`
    - `get_page(page_id)` → `GET /pages/{id}`
    - `get_page_content(page_id)` → `GET /blocks/{id}/children`
    - `create_page(parent_id, title, content?)` → `POST /pages`
    - `update_page(page_id, properties)` → `PATCH /pages/{id}`
    - `query_database(database_id, filter?, sorts?)` → `POST /databases/{id}/query`
    - `get_database(database_id)` → `GET /databases/{id}`
    - `create_database_entry(database_id, properties)` → `POST /pages`
  - **Auth**: `Authorization: Bearer {integration_token}`, `Notion-Version: 2022-06-28`
  - **Credential validation**: `GET /users/me` → returns bot info
  - **Acceptance Criteria**:
    - Search returns readable page summaries
    - Page content blocks rendered as readable text
    - Database query results formatted as structured list

- [ ] **T030: Brave Search MCP Server Handler**
  - **What**: Wraps Brave Search API as MCP tools
  - **Tools** (2):
    - `web_search(query, count?)` → `GET /web/search`
    - `news_search(query, count?)` → `GET /news/search`
  - **Auth**: `X-Subscription-Token: {api_key}`
  - **Credential validation**: Simple test search query
  - **Acceptance Criteria**:
    - Results include title, URL, description
    - Count parameter respected (default 5, max 20)

### Client Config Generation

- [ ] **T034: Auto-generate Claude Desktop Config**
  - **What**: Generate the ready-to-paste JSON config for Claude Desktop
  - **Format**:
    ```json
    {
      "mcpServers": {
        "{serverSlug}": {
          "url": "https://mcp.relay.app/s/{serverToken}",
          "headers": {
            "Authorization": "Bearer {serverToken}"
          }
        }
      }
    }
    ```
  - **Note**: Config key is server slug (e.g., `github-sarahm`), not server ID
  - **Acceptance Criteria**:
    - Correct endpoint URL
    - One-click copy
    - Shows existing config if user already has Claude Desktop config entries

### Health

- [ ] **T037: MCP Health Check**
  - **What**: Verify a server is actually responsive by performing a real MCP capabilities handshake
  - **Why**: HTTP 200 doesn't mean the MCP server works. The handshake verifies protocol compliance.
  - **Implementation**:
    - After deploy: call GET `/s/{token}/mcp`, verify response is valid MCP capabilities JSON
    - Scheduled: run health check every 5 minutes via Cloudflare Cron Trigger
    - On failure: update server status to `error`, store error message, queue alert email
  - **Acceptance Criteria**:
    - Deploy fails gracefully if health check fails (don't mark as "running")
    - Status updates reflected on dashboard within 60 seconds of failure

### Billing

- [x] **T040: Pricing Page**
  - **What**: Public-facing pricing page at `/pricing`
  - **Model**: $3/server/month, unlimited API calls, all features included
  - **Acceptance Criteria**:
    - Single pricing card showing $3/server/month
    - Feature list: unlimited API calls, all integrations, 90-day logs, cancel anytime
    - "Get Started" CTA goes to sign-up
    - FAQ covers per-server billing model

- [ ] **T041: Server Creation → Stripe Subscription Quantity**
  - **What**: When a server is created, increment the Stripe subscription quantity
  - **Implementation**:
    - `POST /api/servers` creates server, then updates Stripe subscription quantity
    - If no subscription exists, redirect to Stripe Checkout (T042)
    - If subscription exists, call `stripe.subscriptions.update()` with new quantity
    - On server deletion, decrement quantity
  - **Acceptance Criteria**:
    - Server count always matches Stripe subscription quantity
    - Deleting a server reduces the bill (prorated)
    - Creating a server without payment triggers checkout flow

- [ ] **T042: Stripe Checkout Flow (Per-Server)**
  - **What**: First server triggers Stripe Checkout; subsequent servers update subscription quantity
  - **Implementation**:
    - `POST /api/billing/checkout` → create Stripe Checkout Session with quantity=1
    - Success URL: `/dashboard?subscribed=true` → show success toast
    - Cancel URL: `/dashboard`
    - Pre-fill email from Clerk user
    - For users with existing subscription, skip checkout and update quantity directly
  - **Acceptance Criteria**:
    - First server → Stripe Checkout with $3/mo
    - Subsequent servers → subscription quantity incremented (no checkout redirect)
    - Subscription ID stored in `users.stripe_subscription_id`

- [ ] **T044: Stripe Webhook Handler (Subscription Lifecycle)**
  - **What**: Handle Stripe events to keep subscription state in sync
  - **Events**:
    - `checkout.session.completed` → store `stripe_subscription_id` on user
    - `customer.subscription.updated` → sync quantity (no tier changes)
    - `customer.subscription.deleted` → clear `stripe_subscription_id`, stop all servers
    - `invoice.payment_failed` → send payment failure email
  - **Acceptance Criteria**:
    - Webhook signature verified before processing
    - Idempotent (safe to replay events)
    - Subscription deletion stops all user's servers

---

## P1 — High Priority

- [ ] **T031: Slack MCP Server Handler**
  - **Tools**: `list_channels`, `get_channel_history`, `send_message`, `search_messages`, `get_user_info`, `list_users`
  - **Auth**: `Authorization: Bearer {bot_token}`
  - **Note**: Requires bot token with correct OAuth scopes (channels:read, chat:write, etc.)
  - **Credential validation**: `GET /auth.test`

- [ ] **T032: PostgreSQL MCP Server Handler**
  - **What**: Allows Claude to query a PostgreSQL database
  - **Architecture**: Unlike other handlers, this needs a persistent TCP connection → runs on Fly.io, not Cloudflare Workers
  - **Tools**: `query(sql)`, `list_tables`, `describe_table(table)`, `list_schemas`
  - **Security**: Read-only mode enforced at connection level (connect with read-only user)
  - **Credential**: connection string (`postgresql://user:pass@host:5432/db`)
  - **Acceptance Criteria**:
    - DDL statements (DROP, CREATE, ALTER) blocked even if user tries
    - Results returned as structured JSON with column names

- [ ] **T033: Google Drive MCP Server Handler**
  - **Note**: Requires OAuth — build basic version with service account first, OAuth post-MVP
  - **Tools**: `search_files(query)`, `get_file(file_id)`, `list_folder(folder_id?)`, `get_file_content(file_id)`, `create_folder(name, parent?)`, `share_file(file_id, email, role)`
  - **Credential**: Service account JSON key (until OAuth is built)

- [ ] **T035: Cursor Config Generation**
  - **Format**: Cursor uses the same `mcp.json` format as Claude Desktop
  - **Acceptance Criteria**: Config snippet shown in Connect tab alongside Claude Desktop

- [ ] **T036: Windsurf Config Generation**
  - **Format**: Windsurf MCP config format (check docs at time of implementation)
  - **Acceptance Criteria**: Config snippet shown in Connect tab

- [ ] **T038: Credential Expiry Detection + Warning Email**
  - **What**: Detect when GitHub tokens, API keys, etc. are near expiry
  - **GitHub tokens**: GitHub returns `GitHub-Authentication-Token-Expiration` header — store this on validate
  - **Fallback**: If no expiry info, health check will catch failures
  - **Warning email**: Send 7 days and 1 day before expiry
  - **Acceptance Criteria**:
    - Warning banner shown in Settings tab when < 14 days
    - Email sent at 7 days remaining
    - Cron job checks all servers daily

- [ ] **T039: Server Uptime Tracking**
  - **What**: Track `last_active_at` timestamp on every successful tool call
  - **Why**: "Last active 3 min ago" in the server list. Uptime % calculation.
  - **Implementation**: Worker writes `last_active_at` to KV entry (avoid DB write per call); background job syncs KV → Supabase every minute
  - **Acceptance Criteria**:
    - Dashboard shows last active time
    - Server detail shows uptime percentage (calculated over last 7 days)

- [ ] **T043: Stripe Customer Portal**
  - **What**: Let users manage their subscription (cancel, update payment method)
  - **Implementation**: `POST /api/billing/portal` → Stripe Billing Portal session → redirect
  - **Acceptance Criteria**:
    - Portal loads with correct customer
    - Cancellation triggers webhook → stops all servers

- [ ] **T047: Server Token Rotation**
  - **What**: Generate a new server token, update KV, invalidate old token
  - **Why**: If user suspects their token was leaked
  - **Acceptance Criteria**:
    - Old token stops working immediately after rotation
    - New config snippet generated for user to copy
    - Confirmation dialog before rotation

- [ ] **T048: Rate Limiting on Worker Execution Layer**
  - **What**: Prevent abuse of the MCP endpoint
  - **Implementation**: Cloudflare Rate Limiting rules (per serverToken) or manual counter in KV
  - **Limits**: Generous per-server rate limit (e.g., 10,000 calls/day per server)
  - **Acceptance Criteria**:
    - Excess calls get 429 with `Retry-After` header
    - Rate limit counters reset at midnight UTC

- [ ] **T049: Log Ingestion Worker**
  - **What**: Background worker that reads from Upstash queue and writes to Supabase `server_logs`
  - **Implementation**: Next.js API route called by Upstash's HTTP delivery, or cron job polling queue
  - **Acceptance Criteria**:
    - Logs in Supabase within 30 seconds of tool call
    - Duplicate log entries prevented (idempotency key)

- [ ] **T050: Log Retention Policy**
  - **What**: Auto-delete old logs after 90 days
  - **Retention**: 90 days for all users
  - **Implementation**: Supabase scheduled function (pg_cron) or nightly Next.js cron route
  - **Acceptance Criteria**:
    - Logs older than 90 days deleted nightly
    - User sees retention period in Logs tab

- [ ] **T052: User Settings Page**
  - **What**: Basic account settings
  - **Contents**: Display name, email (read-only via Clerk), delete account
  - **Acceptance Criteria**:
    - Display name change reflects in sidebar immediately
    - Delete account: deletes all servers, all logs, all credentials, then deletes Clerk user

---

## P2 — Post-MVP Enhancements

- [ ] **T054: Sentry Error Tracking**
  - Next.js: `@sentry/nextjs` with source map upload
  - Worker: Sentry's Cloudflare SDK
  - Errors tagged with user ID + server ID when available

- [ ] **T055: PostHog Analytics**
  - Key events: `server_created`, `server_deleted`, `tool_call_made`, `upgrade_clicked`, `plan_upgraded`
  - Funnel: signup → first server → first tool call → upgrade

- [ ] **T056: OAuth Flow Handling**
  - **Scope**: Google Drive OAuth, Slack OAuth (so users don't need to manually create a bot)
  - **Implementation**: OAuth dance in Next.js (`/api/oauth/callback/{provider}`), store refresh token as credential
  - **Note**: Much friendlier UX but significantly more complex to implement

- [ ] **T067: Per-Tool Toggle Controls**
  - **What**: UI to enable/disable individual tools after server creation
  - **Why**: User may want Notion read access but not write access
  - **Implementation**: Settings tab → tool list with toggles → `PATCH /api/servers/{id}` → update KV allowed_tools
  - **Acceptance Criteria**:
    - Toggle updates take effect on next tool call
    - Disabled tools still appear in list but return "Tool disabled" error

- [ ] **T068: Dark Mode**
  - Tailwind `dark:` classes throughout
  - Persisted to localStorage + system preference detection

- [ ] **T069: Public Landing Page**
  - Marketing page at `relay.app` (or whatever domain)
  - Sections: Hero, How it works (3 steps), Integrations grid, Pricing, FAQ
  - CTA: "Get started"

- [ ] **T070: Documentation Site**
  - `/docs` — getting started guide
  - Per-integration setup guides (GitHub, Notion, etc.)
  - FAQ: "What is MCP?", "Is my data safe?", "What AI clients work?"

---

## P3 — Future

- [ ] **T060: OpenAPI Importer**
  - **What**: Paste an OpenAPI/Swagger spec URL or JSON → Relay parses it → shows list of endpoints → user selects which to expose as tools → deploy
  - **Why**: Lets users connect any REST API without Relay needing to build a handler for it
  - **This is a genuine product differentiator** — nothing else does this

- [ ] **T061: Manual Tool Builder (No-Code)**
  - **What**: Visual interface to define HTTP requests as MCP tools (like Zapier's action builder)
  - **Define**: Tool name, description, HTTP method, URL (with `{variable}` params), headers, body template
  - **Connects any API** without needing an OpenAPI spec

- [ ] **T062: Smithery One-Click Publish**
  - Publish server configuration to Smithery registry for discoverability
  - Smithery → Relay = npm → Vercel relationship

- [ ] **T063: Team Workspaces**
  - Multiple users sharing the same pool of servers
  - Role-based: Admin (full access), Member (use only), Viewer (read-only)
  - This is the bridge into the Sentinel product (enterprise)

- [ ] **T065: Developer API**
  - API key-based headless server provisioning
  - `POST /api/v1/servers`, `DELETE /api/v1/servers/{id}`
  - Enables other apps to embed Relay's MCP hosting

- [ ] **T066: RAG Knowledge Base Server Type**
  - File upload → embed → vector DB → `search_knowledge_base(query)` tool
  - Integration: pgvector in Supabase (simplest) or Pinecone/Qdrant
  - Document connectors: file upload (MVP), Google Drive sync, Notion sync (post-MVP)
  - This is premium tier only

---

## Credential Schema Reference

Each template defines its credential schema. This is used to render the credential form and validate before deploy.

```typescript
interface TemplateDefinition {
  type: string;
  label: string;
  description: string;
  category: string;
  credentialFields: {
    key: string;
    label: string;
    type: "text" | "password" | "textarea";
    placeholder?: string;
    hint?: string;
    required: boolean;
  }[];
  validateFn: (credentials: Record<string, string>) => Promise<ValidationResult>;
  tools: ToolDefinition[];
  defaultEnabledTools: string[];
}
```

---

## Billing Reference

| Price | Max Servers | API Calls | Log Retention |
|---|---|---|---|
| $3/server/month | Unlimited | Unlimited | 90 days |

---

## Priority Definitions

- **P0 (Critical)**: MVP blocker — app cannot ship without this
- **P1 (High)**: Required for a polished, complete v1.0
- **P2 (Medium)**: Post-launch improvements that increase retention/conversion
- **P3 (Low)**: Future product expansion

---

_Last updated: 2026-03-09_