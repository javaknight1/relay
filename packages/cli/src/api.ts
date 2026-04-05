import { readConfig } from "./config.js";

// ── API Client ──────────────────────────────────────────────────

/** Default base URL for the Relay API. Overridable via config or --api-base flag. */
const DEFAULT_API_BASE = "https://relay.club";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Return the current API base URL.
 * Priority: explicit override > config file > environment variable > default.
 */
export function getApiBase(override?: string): string {
  if (override) return override.replace(/\/$/, "");

  const config = readConfig();
  if (config?.apiBase) return config.apiBase.replace(/\/$/, "");

  const env = process.env.RELAY_API_BASE;
  if (env) return env.replace(/\/$/, "");

  return DEFAULT_API_BASE;
}

/**
 * Make an authenticated request to the Relay API.
 * Reads the stored token from ~/.relay/config.json.
 */
export async function apiRequest<T = unknown>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    apiBase?: string;
  },
): Promise<T> {
  const config = readConfig();
  if (!config?.token) {
    throw new Error(
      "Not logged in. Run `relay login` first.",
    );
  }

  const base = getApiBase(options?.apiBase);
  const url = `${base}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.token}`,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message: string;
    try {
      const body = (await res.json()) as { error?: string };
      message = body.error ?? res.statusText;
    } catch {
      message = res.statusText;
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}
