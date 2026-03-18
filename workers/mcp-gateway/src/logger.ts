import type { Env } from "./index";

export interface LogEntry {
  serverId: string;
  toolName: string;
  status: "success" | "error";
  durationMs: number;
  errorMessage: string | null;
  calledAt: string;
}

/**
 * Push a log entry to the Upstash Redis queue.
 *
 * Uses the Upstash REST API (`LPUSH`) so no Redis client library is needed.
 * This function is designed to be called inside `ctx.waitUntil()` so it
 * never blocks the MCP response.  Failures are silently swallowed —
 * a failed log push must never affect the tool call result.
 */
export async function pushLog(entry: LogEntry, env: Env): Promise<void> {
  try {
    const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/lpush/relay:logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([JSON.stringify(entry)]),
    });

    if (!res.ok) {
      console.error(`Log push failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    // Silently swallow — logging must never affect the response
    console.error("Log push error:", err);
  }
}
