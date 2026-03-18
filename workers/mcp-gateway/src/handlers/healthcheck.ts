import type { Env } from "../index";

/**
 * MCP Health Check (T037)
 *
 * Called by the Cron Trigger every 5 minutes. Iterates all running servers
 * in Supabase, performs an MCP capabilities handshake (GET /s/{token}/mcp),
 * and marks servers as "error" if the check fails.
 */

interface ServerHealthRow {
  id: string;
  endpoint_url: string | null;
  status: string;
}

/** Perform a single health check against a server's /mcp endpoint. */
export async function checkServer(
  endpointUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${endpointUrl}/mcp`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return { ok: false, error: `MCP endpoint returned ${res.status}` };
    }

    const body = (await res.json()) as {
      protocolVersion?: string;
      tools?: unknown[];
    };

    if (!body.protocolVersion || !Array.isArray(body.tools)) {
      return {
        ok: false,
        error: "Invalid MCP capabilities response (missing protocolVersion or tools)",
      };
    }

    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Health check request failed";
    return { ok: false, error: message };
  }
}

/** Cron handler — check all running servers and update status on failure. */
export async function handleScheduled(env: Env): Promise<void> {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Health check skipped: missing Supabase credentials");
    return;
  }

  // Fetch all running servers with an endpoint_url
  const queryUrl = `${supabaseUrl}/rest/v1/servers?status=eq.running&deleted_at=is.null&endpoint_url=not.is.null&select=id,endpoint_url,status`;
  const listRes = await fetch(queryUrl, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!listRes.ok) {
    console.error(
      `Health check: failed to fetch servers (${listRes.status})`,
    );
    return;
  }

  const servers = (await listRes.json()) as ServerHealthRow[];

  if (servers.length === 0) return;

  // Check each server concurrently (capped at 20 to avoid overload)
  const BATCH_SIZE = 20;
  for (let i = 0; i < servers.length; i += BATCH_SIZE) {
    const batch = servers.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (server) => {
        if (!server.endpoint_url) return;

        const result = await checkServer(server.endpoint_url);

        if (!result.ok) {
          // Mark server as error in Supabase
          const updateUrl = `${supabaseUrl}/rest/v1/servers?id=eq.${server.id}`;
          await fetch(updateUrl, {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              status: "error",
              error_message: result.error ?? "Health check failed",
            }),
          });

          console.log(
            `Health check failed for server ${server.id}: ${result.error}`,
          );
        }
      }),
    );

    // Log any unexpected rejections
    for (const r of results) {
      if (r.status === "rejected") {
        console.error("Health check batch error:", r.reason);
      }
    }
  }
}
