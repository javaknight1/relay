import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import type { UserRow, ServerRow, PlanTier } from "@relay/shared";
import { PLAN_LIMITS } from "@relay/shared";
import {
  Plus,
  Server,
  Github,
  BookOpen,
  Search,
  MessageSquare,
  Database,
  FolderOpen,
  ArrowUpRight,
  Circle,
} from "lucide-react";

// ── Template definitions (shared with empty state) ──────────

const TEMPLATES = [
  {
    id: "github",
    name: "GitHub",
    description: "Repos, issues, PRs, and code search",
    icon: Github,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Pages, databases, and blocks",
    icon: BookOpen,
  },
  {
    id: "brave",
    name: "Brave Search",
    description: "Web and local search",
    icon: Search,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Messages, channels, and threads",
    icon: MessageSquare,
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Queries, schemas, and analytics",
    icon: Database,
  },
  {
    id: "gdrive",
    name: "Google Drive",
    description: "Search, read, and organize files",
    icon: FolderOpen,
  },
];

const SERVER_TYPE_ICONS: Record<string, typeof Github> = {
  github: Github,
  notion: BookOpen,
  brave: Search,
  slack: MessageSquare,
  postgres: Database,
  gdrive: FolderOpen,
};

const SERVER_TYPE_LABELS: Record<string, string> = {
  github: "GitHub",
  notion: "Notion",
  brave: "Brave Search",
  slack: "Slack",
  postgres: "PostgreSQL",
  gdrive: "Google Drive",
};

const STATUS_STYLES: Record<
  string,
  { dot: string; label: string }
> = {
  running: { dot: "text-emerald-500", label: "Running" },
  deploying: { dot: "text-amber-500", label: "Deploying" },
  stopped: { dot: "text-gray-400", label: "Stopped" },
  error: { dot: "text-red-500", label: "Error" },
};

// ── Data fetching ───────────────────────────────────────────

async function getDashboardData(clerkId: string) {
  const supabase = createServiceClient();

  // Cast needed: cross-package supabase-js types resolve to `never`
  const { data: dbUser } = (await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single()) as { data: UserRow | null };

  if (!dbUser) return { servers: [], plan: "free" as PlanTier };

  const { data: servers } = (await supabase
    .from("servers")
    .select("*")
    .eq("user_id", dbUser.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })) as {
    data: ServerRow[] | null;
  };

  return { servers: servers ?? [], plan: dbUser.plan };
}

// ── Helpers ─────────────────────────────────────────────────

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Page ────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();
  const { servers, plan } = clerkId
    ? await getDashboardData(clerkId)
    : { servers: [], plan: "free" as PlanTier };

  const hasServers = servers.length > 0;
  const firstName = user?.firstName ?? "there";
  const limits = PLAN_LIMITS[plan];
  const atLimit = servers.length >= limits.maxServers;
  const nearLimit =
    servers.length >= limits.maxServers - 1 && limits.maxServers > 1;

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {hasServers
              ? `Welcome back, ${firstName}`
              : `Welcome, ${firstName}`}
          </h1>
          <p className="mt-1 text-gray-600">
            {hasServers
              ? "Deploy and manage your MCP servers from one place."
              : "Get started by creating your first MCP server."}
          </p>
        </div>

        {hasServers && (
          <Link
            href={atLimit ? "/pricing" : "/dashboard/servers/new"}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              atLimit
                ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-brand-500 text-white hover:bg-brand-600"
            }`}
          >
            <Plus className="h-4 w-4" />
            {atLimit ? "Upgrade to Add" : "Add Server"}
          </Link>
        )}
      </div>

      {hasServers ? (
        <>
          {/* Plan usage bar */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {servers.length} / {limits.maxServers} server
                {limits.maxServers !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-500 capitalize">{plan} plan</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${
                  atLimit
                    ? "bg-amber-500"
                    : nearLimit
                      ? "bg-amber-400"
                      : "bg-brand-500"
                }`}
                style={{
                  width: `${Math.min((servers.length / limits.maxServers) * 100, 100)}%`,
                }}
              />
            </div>
            {atLimit && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-amber-700">
                  You&apos;ve reached your {plan} plan limit.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Upgrade
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Server list */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Server</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="hidden px-5 py-3 sm:table-cell">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {servers.map((server) => {
                  const Icon =
                    SERVER_TYPE_ICONS[server.type] ?? Server;
                  const typeLabel =
                    SERVER_TYPE_LABELS[server.type] ?? server.type;
                  const status = STATUS_STYLES[server.status] ??
                    STATUS_STYLES.stopped;

                  return (
                    <tr key={server.id} className="group">
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/servers/${server.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-gray-900 group-hover:text-brand-600">
                            {server.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {typeLabel}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Circle
                            className={`h-2.5 w-2.5 fill-current ${status.dot}`}
                          />
                          <span className="text-gray-700">
                            {status.label}
                          </span>
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-sm text-gray-500 sm:table-cell">
                        {relativeTime(server.last_active_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Empty state */}
          <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
              <Server className="h-8 w-8 text-brand-500" />
            </div>
            <h2 className="mt-6 text-lg font-semibold text-gray-900">
              No servers yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Create your first MCP server to give your AI real tools.
            </p>
            <Link
              href="/dashboard/servers/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" />
              Add Server
            </Link>
          </div>

          {/* Quick-start templates */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick start with a template
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Pick a pre-built integration to get started in minutes.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <Link
                    key={template.id}
                    href={`/dashboard/servers/new?template=${template.id}`}
                    className="group rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/30"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-brand-100 group-hover:text-brand-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {template.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
