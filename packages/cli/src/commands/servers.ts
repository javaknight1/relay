import { Command } from "commander";
import readline from "node:readline";
import { apiRequest } from "../api.js";
import { output, fatal, table, colorStatus, isJsonMode } from "../output.js";

// ── Types ───────────────────────────────────────────────────────

interface ServerRow {
  id: string;
  name: string;
  type: string;
  status: string;
  endpoint_url: string | null;
  last_active_at: string | null;
  created_at: string;
}

interface ServerLogRow {
  id: string;
  tool_name: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  called_at: string;
}

type ServerType =
  | "github"
  | "notion"
  | "slack"
  | "postgres"
  | "brave"
  | "gdrive"
  | "linear"
  | "jira"
  | "airtable";

const VALID_SERVER_TYPES: ServerType[] = [
  "github",
  "notion",
  "slack",
  "postgres",
  "brave",
  "gdrive",
  "linear",
  "jira",
  "airtable",
];

// ── Credential prompts per server type ──────────────────────────

const CREDENTIAL_FIELDS: Record<ServerType, { key: string; label: string; secret: boolean }[]> = {
  github: [{ key: "personal_access_token", label: "GitHub Personal Access Token", secret: true }],
  notion: [{ key: "integration_token", label: "Notion Integration Token", secret: true }],
  slack: [{ key: "bot_token", label: "Slack Bot Token", secret: true }],
  postgres: [
    { key: "connection_string", label: "PostgreSQL Connection String", secret: true },
  ],
  brave: [{ key: "api_key", label: "Brave Search API Key", secret: true }],
  gdrive: [
    { key: "client_id", label: "Google Client ID", secret: false },
    { key: "client_secret", label: "Google Client Secret", secret: true },
    { key: "refresh_token", label: "Google Refresh Token", secret: true },
  ],
  linear: [{ key: "api_key", label: "Linear API Key", secret: true }],
  jira: [
    { key: "domain", label: "Jira Domain (e.g. mycompany.atlassian.net)", secret: false },
    { key: "email", label: "Jira Email", secret: false },
    { key: "api_token", label: "Jira API Token", secret: true },
  ],
  airtable: [{ key: "api_key", label: "Airtable API Key", secret: true }],
};

// ── Helpers ─────────────────────────────────────────────────────

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function confirm(question: string): Promise<boolean> {
  return prompt(`${question} (y/N) `).then(
    (answer) => answer.toLowerCase() === "y" || answer.toLowerCase() === "yes",
  );
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Command Registration ────────────────────────────────────────

export function registerServersCommand(program: Command): void {
  const servers = program
    .command("servers")
    .description("Manage MCP servers");

  // ── servers list ──────────────────────────────────────────────
  servers
    .command("list")
    .description("List all deployed servers")
    .option("--api-base <url>", "Override the Relay API base URL")
    .action(async (opts: { apiBase?: string }) => {
      try {
        const data = await apiRequest<ServerRow[]>("GET", "/api/cli/servers", {
          apiBase: opts.apiBase,
        });

        if (data.length === 0) {
          output([], "No servers found. Create one with `relay servers create`.");
          return;
        }

        if (isJsonMode()) {
          output(data);
          return;
        }

        const rows = data.map((s) => [
          s.id.slice(0, 8),
          s.name,
          s.type,
          colorStatus(s.status),
          relativeTime(s.last_active_at),
          new Date(s.created_at).toLocaleDateString(),
        ]);

        const formatted = table(
          ["ID", "Name", "Type", "Status", "Last Active", "Created"],
          rows,
        );
        console.log(formatted);
      } catch (err) {
        fatal(err instanceof Error ? err.message : "Failed to list servers");
      }
    });

  // ── servers create ────────────────────────────────────────────
  servers
    .command("create")
    .description("Create a new MCP server")
    .requiredOption("--type <type>", `Server type (${VALID_SERVER_TYPES.join(", ")})`)
    .requiredOption("--name <name>", "Server name")
    .option("--api-base <url>", "Override the Relay API base URL")
    .action(
      async (opts: { type: string; name: string; apiBase?: string }) => {
        try {
          // Validate server type
          if (!VALID_SERVER_TYPES.includes(opts.type as ServerType)) {
            fatal(
              `Invalid server type: ${opts.type}\nValid types: ${VALID_SERVER_TYPES.join(", ")}`,
            );
          }

          const serverType = opts.type as ServerType;
          const fields = CREDENTIAL_FIELDS[serverType];

          // Interactive credential prompts
          console.error(`\nConfiguring ${serverType} server: ${opts.name}\n`);

          const credentials: Record<string, string> = {};
          for (const field of fields) {
            const value = await prompt(`  ${field.label}: `);
            if (!value) {
              fatal(`${field.label} is required`);
            }
            credentials[field.key] = value;
          }

          console.error("\nCreating server...");

          const result = await apiRequest<{ id: string }>(
            "POST",
            "/api/cli/servers",
            {
              apiBase: opts.apiBase,
              body: {
                name: opts.name,
                type: serverType,
                credentials,
              },
            },
          );

          output(
            result,
            `\nServer created successfully!\n  ID: ${result.id}\n  Name: ${opts.name}\n  Type: ${serverType}`,
          );
        } catch (err) {
          fatal(
            err instanceof Error ? err.message : "Failed to create server",
          );
        }
      },
    );

  // ── servers delete ────────────────────────────────────────────
  servers
    .command("delete <id>")
    .description("Delete a server")
    .option("--force", "Skip confirmation prompt")
    .option("--api-base <url>", "Override the Relay API base URL")
    .action(async (id: string, opts: { force?: boolean; apiBase?: string }) => {
      try {
        if (!opts.force) {
          const confirmed = await confirm(
            `Are you sure you want to delete server ${id}?`,
          );
          if (!confirmed) {
            console.log("Aborted.");
            return;
          }
        }

        await apiRequest("DELETE", `/api/cli/servers/${id}`, {
          apiBase: opts.apiBase,
        });

        output({ ok: true, id }, `Server ${id} deleted.`);
      } catch (err) {
        fatal(err instanceof Error ? err.message : "Failed to delete server");
      }
    });

  // ── servers logs ──────────────────────────────────────────────
  servers
    .command("logs <id>")
    .description("Show recent tool call logs for a server")
    .option("-f, --follow", "Poll for new logs continuously")
    .option("-n, --lines <count>", "Number of recent logs to show", "25")
    .option("--api-base <url>", "Override the Relay API base URL")
    .action(
      async (
        id: string,
        opts: { follow?: boolean; lines?: string; apiBase?: string },
      ) => {
        try {
          const limit = parseInt(opts.lines ?? "25", 10);

          const fetchLogs = async (
            since?: string,
          ): Promise<ServerLogRow[]> => {
            let path = `/api/cli/servers/${id}/logs?limit=${limit}`;
            if (since) {
              path += `&since=${encodeURIComponent(since)}`;
            }
            return apiRequest<ServerLogRow[]>("GET", path, {
              apiBase: opts.apiBase,
            });
          };

          const formatLog = (log: ServerLogRow): string => {
            const time = new Date(log.called_at).toLocaleTimeString();
            const duration = log.duration_ms != null ? `${log.duration_ms}ms` : "-";
            const status =
              log.status === "success"
                ? "\x1b[32mOK\x1b[0m"
                : "\x1b[31mERR\x1b[0m";
            const error = log.error_message ? ` (${log.error_message})` : "";
            return `${time}  ${status}  ${log.tool_name.padEnd(30)}  ${duration.padStart(6)}${error}`;
          };

          const logs = await fetchLogs();

          if (isJsonMode() && !opts.follow) {
            output(logs);
            return;
          }

          if (logs.length === 0) {
            console.log("No logs found.");
          } else {
            console.log(
              "Time      Status  Tool                            Duration",
            );
            console.log(
              "--------  ------  ------------------------------  --------",
            );
            for (const log of logs) {
              console.log(formatLog(log));
            }
          }

          // Follow mode — poll every 3 seconds
          if (opts.follow) {
            let lastSeen = logs.length > 0 ? logs[logs.length - 1].called_at : undefined;
            console.log("\n--- following (ctrl+c to stop) ---\n");

            const poll = async () => {
              try {
                const newLogs = await fetchLogs(lastSeen);
                for (const log of newLogs) {
                  if (isJsonMode()) {
                    console.log(JSON.stringify(log));
                  } else {
                    console.log(formatLog(log));
                  }
                  lastSeen = log.called_at;
                }
              } catch {
                // Ignore transient errors in follow mode
              }
            };

            // Use setInterval for polling — process will stay alive
            setInterval(poll, 3000);

            // Keep the process alive
            await new Promise<void>(() => {
              // never resolves — user must ctrl+c
            });
          }
        } catch (err) {
          fatal(err instanceof Error ? err.message : "Failed to fetch logs");
        }
      },
    );
}
