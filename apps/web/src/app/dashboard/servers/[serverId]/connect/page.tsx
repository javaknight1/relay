import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import type { UserRow, ServerRow } from "@relay/shared";
import { CheckCircle2, ExternalLink } from "lucide-react";
import CopyButton from "./CopyButton";

/** Extract the server token from an endpoint URL like https://host/s/{token} */
function extractToken(endpointUrl: string): string {
  const match = endpointUrl.match(/\/s\/([^/]+)$/);
  return match?.[1] ?? "";
}

async function getServerAndSiblings(
  serverId: string,
  clerkId: string,
): Promise<{ server: ServerRow; allServers: ServerRow[] } | null> {
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

  // Fetch all running servers for the merged config
  const { data: allServers } = (await supabase
    .from("servers")
    .select("*")
    .eq("user_id", dbUser.id)
    .eq("status", "running")
    .is("deleted_at", null)
    .order("created_at")) as { data: ServerRow[] | null };

  return { server, allServers: allServers ?? [server] };
}

function serverToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function buildClaudeConfig(servers: ServerRow[]) {
  const mcpServers: Record<string, { url: string; headers: Record<string, string> }> = {};

  for (const s of servers) {
    if (!s.endpoint_url) continue;
    const slug = serverToSlug(s.name);
    const token = extractToken(s.endpoint_url);
    mcpServers[slug] = {
      url: s.endpoint_url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return JSON.stringify({ mcpServers }, null, 2);
}

export default async function ConnectPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const result = await getServerAndSiblings(serverId, clerkId);
  if (!result) notFound();

  const { server, allServers } = result;
  const isLive = server.status === "running";
  const configSnippet = buildClaudeConfig(allServers);
  const endpointUrl =
    server.endpoint_url ?? "Endpoint will appear after deployment";
  const hasMultipleServers = allServers.length > 1;

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {isLive ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">
            Your server is live and accepting connections.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            Server status: {server.status}.
            {server.error_message && ` — ${server.error_message}`}
          </p>
        </div>
      )}

      {/* Endpoint URL */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Endpoint URL</h2>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700">
            {endpointUrl}
          </code>
          {server.endpoint_url && (
            <CopyButton text={server.endpoint_url} />
          )}
        </div>
      </div>

      {/* Claude Desktop config */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Claude Desktop
          </h2>
          <CopyButton text={configSnippet} label="Copy config" />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {hasMultipleServers
            ? `Includes all ${allServers.length} of your running servers. Paste into your Claude Desktop config file.`
            : "Add this to your Claude Desktop configuration file."}
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100">
          {configSnippet}
        </pre>
        <ol className="mt-4 space-y-2 text-sm text-gray-600">
          <li>
            1. Open Claude Desktop &rarr;{" "}
            <strong>Settings &rarr; Developer &rarr; Edit Config</strong>
          </li>
          <li>
            2. Paste the configuration above.
            {hasMultipleServers
              ? " It already includes all your Relay servers."
              : " Merge with existing entries if needed."}
          </li>
          <li>3. Save and restart Claude Desktop.</li>
        </ol>
      </div>

      {/* Cursor config */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Cursor
          </h2>
          <CopyButton text={configSnippet} label="Copy config" />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Cursor uses the same MCP config format as Claude Desktop.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100">
          {configSnippet}
        </pre>
        <ol className="mt-4 space-y-2 text-sm text-gray-600">
          <li>
            1. Open Cursor &rarr;{" "}
            <strong>Settings &rarr; MCP</strong> &rarr; click{" "}
            <strong>Add new global MCP server</strong>.
          </li>
          <li>
            2. This opens{" "}
            <code className="rounded bg-gray-100 px-1 font-mono text-xs">
              ~/.cursor/mcp.json
            </code>
            . Paste the configuration above.
          </li>
          <li>3. Save the file. Cursor picks up changes automatically.</li>
        </ol>
      </div>

      {/* Other clients */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Other Clients</h2>
        <p className="mt-1 text-xs text-gray-500">
          This server works with any MCP-compatible client that supports
          Streamable HTTP transport.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {["Windsurf", "Claude Code"].map((client) => (
            <span
              key={client}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
            >
              {client}
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
