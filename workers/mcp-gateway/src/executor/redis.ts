import type { ToolExecutor } from "./index";

/**
 * Redis executor — calls the Upstash Redis REST API (HTTP-based).
 *
 * The Upstash REST API works perfectly in CF Workers since it's HTTP-only.
 * API docs: https://upstash.com/docs/redis/overall/redisapi
 *
 * Credentials must include:
 *   - rest_url:   Upstash Redis REST URL (e.g. "https://xxx.upstash.io")
 *   - rest_token: Upstash Redis REST token
 */

interface RedisCredentials {
  rest_url: string;
  rest_token: string;
}

function parseCredentials(
  credentials: Record<string, unknown>,
): RedisCredentials {
  const rest_url = credentials.rest_url as string | undefined;
  const rest_token = credentials.rest_token as string | undefined;

  if (!rest_url)
    throw new Error("Missing rest_url in Redis credentials");
  if (!rest_token)
    throw new Error("Missing rest_token in Redis credentials");

  // Ensure no trailing slash
  return {
    rest_url: rest_url.replace(/\/+$/, ""),
    rest_token,
  };
}

async function redisFetch(
  command: (string | number)[],
  creds: RedisCredentials,
): Promise<unknown> {
  // Upstash REST API: POST with array of command parts
  const res = await fetch(creds.rest_url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.rest_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401) {
      throw new Error(
        "Redis authentication failed. Please check your REST token.",
      );
    }
    throw new Error(`Upstash Redis API error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { result: unknown; error?: string };
  if (data.error) {
    throw new Error(`Redis error: ${data.error}`);
  }

  return data.result;
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, creds: RedisCredentials) => Promise<unknown>
> = {
  get(a, creds) {
    return redisFetch(["GET", String(a.key)], creds);
  },

  set(a, creds) {
    const cmd: (string | number)[] = ["SET", String(a.key), String(a.value)];
    if (a.ex != null) {
      cmd.push("EX", Number(a.ex));
    }
    return redisFetch(cmd, creds);
  },

  delete(a, creds) {
    const keys = String(a.key)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    return redisFetch(["DEL", ...keys], creds);
  },

  list_keys(a, creds) {
    const pattern = (a.pattern as string) || "*";
    const cursor = (a.cursor as string) || "0";
    const count = a.count ?? 100;
    return redisFetch(
      ["SCAN", cursor, "MATCH", pattern, "COUNT", Number(count)],
      creds,
    );
  },

  hget(a, creds) {
    return redisFetch(["HGET", String(a.key), String(a.field)], creds);
  },

  hset(a, creds) {
    const fields = a.fields as Record<string, string>;
    const parts: (string | number)[] = ["HSET", String(a.key)];
    for (const [field, value] of Object.entries(fields)) {
      parts.push(field, String(value));
    }
    return redisFetch(parts, creds);
  },

  lpush(a, creds) {
    const values = a.values as string[];
    return redisFetch(["LPUSH", String(a.key), ...values], creds);
  },

  lrange(a, creds) {
    const start = a.start ?? 0;
    const stop = a.stop ?? -1;
    return redisFetch(
      ["LRANGE", String(a.key), Number(start), Number(stop)],
      creds,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const redisExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const creds = parseCredentials(credentials);

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Redis tool: ${name}`);
    }

    return handler(args, creds);
  },
};
