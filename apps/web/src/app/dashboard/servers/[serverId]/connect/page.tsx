import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import type { UserRow, ServerRow } from "@relay/shared";
import { CheckCircle2 } from "lucide-react";
import CopyButton from "./CopyButton";
import ClientConfigTabs from "./ClientConfigTabs";

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

function buildMcpServers(
  servers: ServerRow[],
  urlKey: "url" | "serverUrl",
) {
  const mcpServers: Record<string, Record<string, unknown>> = {};

  for (const s of servers) {
    if (!s.endpoint_url) continue;
    const slug = serverToSlug(s.name);
    const token = extractToken(s.endpoint_url);
    mcpServers[slug] = {
      [urlKey]: s.endpoint_url,
      headers: { Authorization: `Bearer ${token}` },
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
  const endpointUrl =
    server.endpoint_url ?? "Endpoint will appear after deployment";
  const hasMultipleServers = allServers.length > 1;

  const claudeConfig = buildMcpServers(allServers, "url");
  const windsurfConfig = buildMcpServers(allServers, "serverUrl");

  const multiNote = hasMultipleServers
    ? ` Includes all ${allServers.length} of your running servers.`
    : "";

  const configs = [
    {
      label: "Claude Desktop",
      config: claudeConfig,
      description: `Add this to your Claude Desktop configuration file.${multiNote}`,
      steps: [
        "Open Claude Desktop &rarr; <strong>Settings &rarr; Developer &rarr; Edit Config</strong>.",
        `Paste the configuration above.${hasMultipleServers ? " It already includes all your Relay servers." : " Merge with existing entries if needed."}`,
        "Save and restart Claude Desktop.",
      ],
    },
    {
      label: "Cursor",
      config: claudeConfig,
      description: `Cursor uses the same MCP config format as Claude Desktop.${multiNote}`,
      steps: [
        "Open Cursor &rarr; <strong>Settings &rarr; MCP</strong> &rarr; click <strong>Add new global MCP server</strong>.",
        'This opens <code class="rounded bg-gray-100 px-1 font-mono text-xs">~/.cursor/mcp.json</code>. Paste the configuration above.',
        "Save the file. Cursor picks up changes automatically.",
      ],
    },
    {
      label: "Windsurf",
      config: windsurfConfig,
      description: `Windsurf uses serverUrl instead of url in its config format.${multiNote}`,
      steps: [
        "Open Windsurf &rarr; <strong>Settings &rarr; Cascade &rarr; MCP</strong> &rarr; click <strong>Add Server</strong> &rarr; <strong>Raw JSON</strong>.",
        'Or edit <code class="rounded bg-gray-100 px-1 font-mono text-xs">~/.codeium/windsurf/mcp_config.json</code> directly. Paste the configuration above.',
        "Save the file. Windsurf picks up changes automatically.",
      ],
    },
  ];

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

      {/* Client config with tab selector */}
      <ClientConfigTabs configs={configs} />
    </div>
  );
}
