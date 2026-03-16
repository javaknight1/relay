import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { TEMPLATES } from "@/lib/templates";
import type { UserRow, ServerRow } from "@relay/shared";
import { Plus, Server, Circle } from "lucide-react";

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  running: { dot: "text-emerald-500", label: "Running" },
  deploying: { dot: "text-amber-500", label: "Deploying" },
  stopped: { dot: "text-gray-400", label: "Stopped" },
  error: { dot: "text-red-500", label: "Error" },
};

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

function getTemplateInfo(type: string) {
  const t = TEMPLATES.find((t) => t.id === type);
  return { icon: t?.icon ?? Server, label: t?.name ?? type };
}

async function getServers(clerkId: string): Promise<ServerRow[]> {
  const supabase = createServiceClient();

  const { data: dbUser } = (await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single()) as { data: UserRow | null };
  if (!dbUser) return [];

  const { data: servers } = (await supabase
    .from("servers")
    .select("*")
    .eq("user_id", dbUser.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })) as {
    data: ServerRow[] | null;
  };

  return servers ?? [];
}

export default async function ServersPage() {
  const { userId: clerkId } = await auth();
  const servers = clerkId ? await getServers(clerkId) : [];

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Servers</h1>
          <p className="mt-1 text-gray-600">
            All your MCP servers in one place.
          </p>
        </div>
        <Link
          href="/dashboard/servers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Add Server
        </Link>
      </div>

      {servers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <Server className="h-6 w-6 text-gray-400" />
          </div>
          <h2 className="mt-4 text-sm font-semibold text-gray-900">
            No servers yet
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create your first MCP server to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Server</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="hidden px-5 py-3 sm:table-cell">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {servers.map((server) => {
                const { icon: Icon, label: typeLabel } = getTemplateInfo(
                  server.type,
                );
                const status =
                  STATUS_STYLES[server.status] ?? STATUS_STYLES.stopped;

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
                        <span className="text-gray-700">{status.label}</span>
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
      )}
    </>
  );
}
