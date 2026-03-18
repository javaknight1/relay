import type { EncryptedBlob } from "@relay/shared";
import { decrypt, importKey } from "@relay/shared";

import type { Env } from "./index";

/**
 * Fetch and decrypt credentials for a server request.
 *
 * - Fetches the encrypted blob from Supabase `server_credentials` table
 *   via PostgREST using the service role key.
 * - Decrypts using the `ENCRYPTION_KEY` Worker secret.
 * - Returns parsed credentials object.
 * - Never cached, never logged — credentials exist only for this request.
 */
export async function decryptCredentials(
  credentialKey: string,
  env: Env,
): Promise<Record<string, unknown>> {
  // ── Fetch encrypted blob from Supabase ──────────────────
  const url = `${env.SUPABASE_URL}/rest/v1/server_credentials?server_id=eq.${encodeURIComponent(credentialKey)}&select=encrypted_blob&limit=1`;

  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch credentials");
  }

  const rows = (await res.json()) as { encrypted_blob: string }[];
  if (rows.length === 0) {
    throw new Error("Credentials not found");
  }

  // ── Decrypt ─────────────────────────────────────────────
  const blob: EncryptedBlob = JSON.parse(rows[0].encrypted_blob);
  const key = await importKey(env.ENCRYPTION_KEY);
  const plaintext = await decrypt(blob, key);

  return JSON.parse(plaintext) as Record<string, unknown>;
}
