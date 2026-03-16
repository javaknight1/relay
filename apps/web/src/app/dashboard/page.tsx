import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import type { UserRow, ServerRow } from "@relay/shared";
import {
  Plus,
  Server,
  Github,
  BookOpen,
  Search,
  MessageSquare,
  Database,
  FolderOpen,
} from "lucide-react";

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

async function getServers(clerkId: string): Promise<ServerRow[]> {
  const supabase = createServiceClient();

  // Look up the internal user by Clerk ID
  // Cast needed: cross-package supabase-js types resolve to `never`
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single() as { data: UserRow | null };

  if (!user) return [];

  // Fetch non-deleted servers for this user
  const { data: servers } = await supabase
    .from("servers")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false }) as { data: ServerRow[] | null };

  return servers ?? [];
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();
  const servers = clerkId ? await getServers(clerkId) : [];
  const hasServers = servers.length > 0;
  const firstName = user?.firstName ?? "there";

  return (
    <>
      <div className="mb-8">
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

      {hasServers ? (
        /* T013 will implement the full server list here */
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            You have {servers.length} server{servers.length !== 1 ? "s" : ""}.
            Server list coming soon.
          </p>
        </div>
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
