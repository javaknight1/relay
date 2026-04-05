import { Command } from "commander";
import { apiRequest } from "../api.js";
import { output, fatal } from "../output.js";

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

interface ServerRow {
  id: string;
  status: string;
}

/**
 * `relay status`
 *
 * Show account information and server count.
 */
export function registerStatusCommand(program: Command): void {
  program
    .command("status")
    .description("Show account info and server count")
    .option("--api-base <url>", "Override the Relay API base URL")
    .action(async (opts: { apiBase?: string }) => {
      try {
        // Fetch user info
        const user = await apiRequest<UserInfo>("GET", "/api/cli/me", {
          apiBase: opts.apiBase,
        });

        // Fetch servers to get count
        const servers = await apiRequest<ServerRow[]>(
          "GET",
          "/api/cli/servers",
          { apiBase: opts.apiBase },
        );

        const running = servers.filter((s) => s.status === "running").length;
        const total = servers.length;

        const data = {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.stripe_subscription_id ? "pro" : "free",
            createdAt: user.created_at,
          },
          servers: {
            total,
            running,
          },
        };

        const prettyLines = [
          "Account Status",
          "==============",
          `  Email:    ${user.email}`,
          `  Name:     ${user.name ?? "(not set)"}`,
          `  Plan:     ${user.stripe_subscription_id ? "Pro" : "Free"}`,
          `  Member since: ${new Date(user.created_at).toLocaleDateString()}`,
          "",
          `  Servers:  ${running} running / ${total} total`,
        ];

        output(data, prettyLines.join("\n"));
      } catch (err) {
        fatal(err instanceof Error ? err.message : "Failed to fetch status");
      }
    });
}
