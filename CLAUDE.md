# CLAUDE.md

## Project

Relay — Managed MCP server hosting SaaS. See `TODO.md` for the full roadmap.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 14 (App Router) + Tailwind + TypeScript (`apps/web`)
- **Worker**: Cloudflare Workers (`workers/mcp-gateway`)
- **Shared types**: `packages/shared` (imported as `@relay/shared`)
- **DB**: Supabase (Postgres) | **Auth**: Clerk | **Billing**: Stripe | **Email**: Resend

## Commands

- `pnpm dev` — starts both Next.js and wrangler dev
- `pnpm build` — builds all packages
- `pnpm typecheck` — TypeScript strict mode check across all packages
- `pnpm lint` — ESLint across all packages

## Task Completion Rule

**Every time a task from TODO.md is completed, you MUST update all three locations in TODO.md:**

1. **Task Index table** — strikethrough the entire row (e.g. `| ~~T001~~ | ~~P0~~ | ~~Setup~~ | ... |`)
2. **Sprint Roadmap checklist** — change `- [ ]` to `- [x]`
3. **Detailed description section** — change `- [ ]` to `- [x]`

Never skip this. Do it immediately after completing the task.
