import { Command } from "commander";
import { apiRequest } from "../api.js";
import { output, fatal } from "../output.js";

interface ServerRow {
  id: string;
  name: string;
  type: string;
  status: string;
  endpoint_url: string | null;
}

type ClientType = "claude" | "cursor" | "windsurf";

const VALID_CLIENTS: ClientType[] = ["claude", "cursor", "windsurf"];

/**
 * `relay config generate --client <claude|cursor|windsurf>`
 *
 * Fetches the user's running servers and generates the appropriate
 * MCP client configuration JSON for the specified client.
 */
export function registerConfigCommand(program: Command): void {
  const config = program
    .command("config")
    .description("Configuration utilities");

  config
    .command("generate")
    .description("Generate MCP client config JSON")
    .requiredOption(
      "--client <type>",
      `Client type (${VALID_CLIENTS.join(", ")})`,
    )
    .option("--api-base <url>", "Override the Relay API base URL")
    .action(async (opts: { client: string; apiBase?: string }) => {
      try {
        if (!VALID_CLIENTS.includes(opts.client as ClientType)) {
          fatal(
            `Invalid client type: ${opts.client}\nValid clients: ${VALID_CLIENTS.join(", ")}`,
          );
        }

        const client = opts.client as ClientType;

        // Fetch all running servers
        const servers = await apiRequest<ServerRow[]>(
          "GET",
          "/api/cli/servers",
          { apiBase: opts.apiBase },
        );

        const running = servers.filter(
          (s) => s.status === "running" && s.endpoint_url,
        );

        if (running.length === 0) {
          fatal(
            "No running servers found. Create one with `relay servers create`.",
          );
        }

        const configJson = generateClientConfig(client, running);

        // Always output raw JSON for this command (it's meant to be piped/copied)
        console.log(JSON.stringify(configJson, null, 2));
      } catch (err) {
        fatal(
          err instanceof Error
            ? err.message
            : "Failed to generate config",
        );
      }
    });
}

function generateClientConfig(
  client: ClientType,
  servers: ServerRow[],
): Record<string, unknown> {
  switch (client) {
    case "claude": {
      // Claude Desktop format: { mcpServers: { name: { url } } }
      const mcpServers: Record<string, { url: string }> = {};
      for (const server of servers) {
        const key = sanitizeKey(server.name);
        mcpServers[key] = {
          url: `${server.endpoint_url}/sse`,
        };
      }
      return { mcpServers };
    }

    case "cursor": {
      // Cursor format: { mcpServers: { name: { url } } }
      const mcpServers: Record<string, { url: string }> = {};
      for (const server of servers) {
        const key = sanitizeKey(server.name);
        mcpServers[key] = {
          url: `${server.endpoint_url}/sse`,
        };
      }
      return { mcpServers };
    }

    case "windsurf": {
      // Windsurf format: { mcpServers: { name: { serverUrl } } }
      const mcpServers: Record<string, { serverUrl: string }> = {};
      for (const server of servers) {
        const key = sanitizeKey(server.name);
        mcpServers[key] = {
          serverUrl: `${server.endpoint_url}/sse`,
        };
      }
      return { mcpServers };
    }
  }
}

/** Sanitize a server name into a valid JSON key. */
function sanitizeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
