# Relay - Technical Roadmap & Task Tracker

**Relay** — The "Vercel for MCP servers." Deploy, manage, and monetize MCP servers with purpose-built tooling no generic hosting platform offers. Playground, marketplace, composable servers, and more.

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

## Completed (Before MVP)

All pre-MVP tasks are complete. Summary of what was built:

- **T001–T008**: Monorepo, Supabase schema, Clerk auth, Cloudflare Workers/KV, Stripe billing, Resend email, CI/CD
- **T009–T010**: Clerk webhook user sync, auth middleware
- **T011–T013**: App shell, empty state dashboard, server list dashboard
- **T014–T020**: Template catalog, credential form, validation, deploy flow, server detail tabs (Connect, Logs, Settings)
- **T021–T022**: AES-256 credential encryption/decryption + encrypted storage
- **T023–T027**: Worker routing, MCP capabilities (SSE), JSON-RPC handler, credential decryption in Worker, async log push
- **T028–T033**: Server handlers — GitHub (12 tools), Notion (8), Brave Search (2), Slack (6), PostgreSQL (4), Google Drive (6)
- **T034–T036**: Auto-generated client configs — Claude Desktop, Cursor, Windsurf
- **T037–T039**: MCP health check, credential expiry detection + warning email, server uptime tracking
- **T040–T045**: Pricing page, Stripe quantity billing, Checkout flow, webhook handler, Customer Portal, billing dashboard
- **T046–T048**: RLS policies, token rotation, Worker rate limiting
- **T049–T051**: Log ingestion, log retention (90 days), tool call stats aggregation
- **T052–T053**: User settings page, environment config
- **T054–T055**: Sentry error tracking, PostHog analytics
- **T057–T059**: Linear, Jira, Airtable server handlers
- **T067**: Per-tool toggle controls

---

## Task Index (Remaining)

| ID   | Priority | Category      | Task                                                                |
|------|----------|---------------|---------------------------------------------------------------------|
| T056 | P2       | Templates     | OAuth flow handling for Google + Slack (full OAuth dance in Worker) |
| T060 | P3       | Builder       | OpenAPI importer (paste spec → select endpoints → deploy)          |
| T061 | P3       | Builder       | Manual tool builder (no-code HTTP request definer)                 |
| T062 | P3       | Discovery     | One-click publish to Smithery registry                             |
| T063 | P3       | Teams         | Team workspaces + member invites                                    |
| T064 | P3       | Teams         | Role-based access within workspace (Admin, Viewer)                 |
| T065 | P3       | API           | Developer API (headless server provisioning via API key)           |
| T066 | P3       | RAG           | RAG knowledge base server type (file upload + vector search)       |
| T068 | P2       | UX            | Dark mode                                                           |
| ~~T069~~ | ~~P2~~ | ~~Marketing~~ | ~~Public landing page~~                                             |
| ~~T070~~ | ~~P2~~ | ~~Marketing~~ | ~~Documentation site~~                                              |
| ~~T071~~ | ~~P2~~ | ~~DevEx~~     | ~~MCP playground & debugger (interactive web UI)~~                  |
| T072 | P2       | Marketplace   | MCP server registry & marketplace                                   |
| T073 | P2       | Platform      | Composable MCP servers (merge multiple into one endpoint)           |
| T074 | P2       | Platform      | Schema validation & server versioning                               |
| T075 | P3       | Billing       | Creator monetization (let publishers charge for MCP servers)        |
| T076 | P3       | Builder       | AI-assisted MCP server builder                                      |
| T077 | P3       | Platform      | Relay Client SDK (universal MCP connector library)                  |
| T078 | P2       | Observability | AI conversation context in observability                            |
| T079 | P2       | Platform      | Webhooks & event system (trigger on MCP events)                     |
| T080 | P3       | Platform      | Canary deploys & instant rollback                                   |
| T081 | P2       | Security      | Secrets & integrations vault                                        |
| T082 | P2       | Builder       | Custom MCP server (deploy from GitHub repo URL)                     |
| ~~T083~~ | ~~P2~~ | ~~DevEx~~     | ~~Relay CLI tool (`relay` command for developers)~~                 |
| T084 | P2       | Templates     | Google Drive MCP server handler (complete OAuth flow)               |
| T085 | P2       | Templates     | Stripe MCP server handler                                          |
| T086 | P2       | Templates     | Figma MCP server handler                                           |
| T087 | P2       | Templates     | Gmail MCP server handler                                           |
| T088 | P2       | Templates     | Google Calendar MCP server handler                                 |
| ~~T089~~ | ~~P2~~ | ~~Templates~~ | ~~Confluence MCP server handler~~                                  |
| ~~T090~~ | ~~P2~~ | ~~Templates~~ | ~~MongoDB MCP server handler~~                                     |
| ~~T091~~ | ~~P2~~ | ~~Templates~~ | ~~MySQL MCP server handler~~                                       |
| ~~T092~~ | ~~P2~~ | ~~Templates~~ | ~~Redis MCP server handler~~                                       |
| T093 | P2       | Templates     | Shopify MCP server handler                                         |
| ~~T094~~ | ~~P2~~ | ~~Templates~~ | ~~Sentry MCP server handler~~                                      |
| ~~T095~~ | ~~P2~~ | ~~Templates~~ | ~~HubSpot MCP server handler~~                                     |
| ~~T096~~ | ~~P2~~ | ~~Templates~~ | ~~GitLab MCP server handler~~                                      |
| ~~T097~~ | ~~P2~~ | ~~Templates~~ | ~~Asana MCP server handler~~                                       |
| ~~T098~~ | ~~P2~~ | ~~Templates~~ | ~~Todoist MCP server handler~~                                     |
| ~~T099~~ | ~~P2~~ | ~~Templates~~ | ~~Twilio MCP server handler~~                                      |
| T100 | P2       | Templates     | Salesforce MCP server handler                                      |
| T101 | P2       | Templates     | Playwright MCP server handler                                      |
| ~~T102~~ | ~~P2~~ | ~~Templates~~ | ~~Firecrawl MCP server handler~~                                   |
| ~~T103~~ | ~~P2~~ | ~~Templates~~ | ~~Discord MCP server handler~~                                     |
| ~~T104~~ | ~~P1~~ | ~~Marketing~~ | ~~SEO + GEO strategy & implementation~~                            |

---

## Upcoming Sprints

### Sprint 8 — Post-MVP Growth

- [x] **T104** — SEO + GEO strategy & implementation
- [x] **T069** — Landing page
- [x] **T070** — Documentation site
- [x] **T083** — Relay CLI tool

### Sprint 9 — Platform Differentiation

- [ ] **T056** — OAuth for Google + Slack
- [x] **T071** — MCP playground & debugger
- [ ] **T074** — Schema validation & versioning
- [ ] **T079** — Webhooks & event system
- [ ] **T081** — Secrets & integrations vault
- [ ] **T078** — AI conversation context observability

### Sprint 10 — Marketplace & Ecosystem

- [ ] **T072** — MCP server registry & marketplace
- [ ] **T073** — Composable MCP servers
- [ ] **T077** — Relay Client SDK

### Sprint 11 — Advanced Builder & Monetization

- [ ] **T082** — Custom MCP server (deploy from GitHub repo)
- [ ] **T076** — AI-assisted MCP server builder
- [ ] **T075** — Creator monetization platform
- [ ] **T080** — Canary deploys & instant rollback

### Sprint 12 — High-Value Integrations

- [ ] **T085** — Stripe handler
- [ ] **T086** — Figma handler
- [ ] **T093** — Shopify handler
- [x] **T094** — Sentry handler
- [ ] **T100** — Salesforce handler
- [x] **T096** — GitLab handler
- [x] **T089** — Confluence handler

### Sprint 13 — Integration Breadth

- [ ] **T084** — Google Drive handler (complete)
- [ ] **T087** — Gmail handler
- [ ] **T088** — Google Calendar handler
- [x] **T090** — MongoDB handler
- [x] **T091** — MySQL handler
- [x] **T092** — Redis handler
- [x] **T095** — HubSpot handler
- [x] **T097** — Asana handler
- [x] **T098** — Todoist handler
- [x] **T099** — Twilio handler
- [ ] **T101** — Playwright handler
- [x] **T102** — Firecrawl handler
- [x] **T103** — Discord handler

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
