import type { ServerConfig } from "@relay/shared";

/**
 * Cloudflare KV client for the Next.js API layer.
 *
 * Writes/deletes server routing entries via the Cloudflare REST API.
 * The Worker reads these entries via its KV binding at sub-ms latency.
 *
 * Required env vars:
 *   CF_ACCOUNT_ID        — Cloudflare account ID
 *   CF_KV_NAMESPACE_ID   — KV namespace ID (same as wrangler.toml id)
 *   CF_API_TOKEN          — Cloudflare API token with Workers KV write permission
 */

function getConfig() {
  const accountId = process.env.CF_ACCOUNT_ID;
  const namespaceId = process.env.CF_KV_NAMESPACE_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!accountId || !namespaceId || !apiToken) {
    return null;
  }

  return { accountId, namespaceId, apiToken };
}

function kvUrl(accountId: string, namespaceId: string, key: string) {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
}

/**
 * Write a server config to the KV routing table.
 * Key: `server:{serverToken}`
 */
export async function kvPutServerConfig(
  serverToken: string,
  config: ServerConfig,
): Promise<void> {
  const cfg = getConfig();
  if (!cfg) {
    throw new Error(
      "Cloudflare KV is not configured (missing CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, or CF_API_TOKEN)",
    );
  }

  const url = kvUrl(cfg.accountId, cfg.namespaceId, `server:${serverToken}`);

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${cfg.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KV PUT failed (${res.status}): ${text}`);
  }
}

/**
 * Delete a server config from the KV routing table.
 * Key: `server:{serverToken}`
 */
export async function kvDeleteServerConfig(
  serverToken: string,
): Promise<void> {
  const cfg = getConfig();
  if (!cfg) return;

  const url = kvUrl(cfg.accountId, cfg.namespaceId, `server:${serverToken}`);

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${cfg.apiToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`KV DELETE failed (${res.status}): ${text}`);
  }
}
