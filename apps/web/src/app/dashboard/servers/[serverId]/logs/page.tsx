import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import type { UserRow, ServerRow, ServerLogRow } from "@relay/shared";
import { Circle, Activity } from "lucide-react";

async function getServerLogs(
  serverId: string,
  clerkId: string,
): Promise<{ server: ServerRow; logs: ServerLogRow[] } | null> {
  const supabase = createServiceClient();

  const { data: dbUser } = (await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single()) as { data: UserRow | null };
  if (!dbUser) return null;

  const { data: server } = (await supabase
    .from("servers")
    .select("*")
    .eq("id", serverId)
    .eq("user_id", dbUser.id)
    .is("deleted_at", null)
    .single()) as { data: ServerRow | null };
  if (!server) return null;

  const { data: logs } = (await supabase
    .from("server_logs")
    .select("*")
    .eq("server_id", serverId)
    .order("called_at", { ascending: false })
    .limit(100)) as { data: ServerLogRow[] | null };

  return { server, logs: logs ?? [] };
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function LogsPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const result = await getServerLogs(serverId, clerkId);
  if (!result) notFound();

  const { logs } = result;

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
          <Activity className="h-6 w-6 text-gray-400" />
        </div>
        <h2 className="mt-4 text-sm font-semibold text-gray-900">
          No tool calls yet
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Logs will appear here once an AI client makes a tool call through this
          server.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Tool</th>
            <th className="hidden px-5 py-3 sm:table-cell">Duration</th>
            <th className="px-5 py-3">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-5 py-3">
                <Circle
                  className={`h-2.5 w-2.5 fill-current ${
                    log.status === "success"
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                />
              </td>
              <td className="px-5 py-3">
                <code className="rounded bg-gray-50 px-1.5 py-0.5 font-mono text-sm text-gray-800">
                  {log.tool_name}
                </code>
                {log.error_message && (
                  <p className="mt-0.5 text-xs text-red-600">
                    {log.error_message}
                  </p>
                )}
              </td>
              <td className="hidden px-5 py-3 text-sm text-gray-500 sm:table-cell">
                {log.duration_ms != null ? `${log.duration_ms}ms` : "—"}
              </td>
              <td className="px-5 py-3">
                <span
                  className="text-sm text-gray-500"
                  title={new Date(log.called_at).toLocaleString()}
                >
                  {relativeTime(log.called_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-5 py-3 text-xs text-gray-400">
        Logs are retained for 90 days.
      </p>
    </div>
  );
}
