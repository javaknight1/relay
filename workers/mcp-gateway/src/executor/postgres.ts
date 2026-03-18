import type { ToolExecutor } from "./index";

/**
 * Postgres executor — proxies SQL queries to a Fly.io sidecar service
 * that holds the actual TCP connection to the database.
 *
 * Credentials must include:
 *   - proxyUrl: URL of the Fly.io Postgres proxy (e.g. "https://pg-proxy-xxx.fly.dev")
 *   - apiKey:   Auth token for the proxy
 *
 * The proxy is provisioned per-server with the connection string baked in,
 * so the Worker never handles the raw connection string at query time.
 */

// ── DDL blocklist ───────────────────────────────────────────

const DDL_PATTERN =
  /^\s*(DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|COMMENT\s+ON)\b/i;

function assertNoDDL(sql: string): void {
  if (DDL_PATTERN.test(sql)) {
    throw new Error(
      "DDL statements (DROP, CREATE, ALTER, TRUNCATE, GRANT, REVOKE) are not allowed",
    );
  }
}

// ── Proxy fetch ─────────────────────────────────────────────

async function proxyQuery(
  proxyUrl: string,
  apiKey: string,
  sql: string,
  params?: unknown[],
): Promise<unknown> {
  const res = await fetch(`${proxyUrl}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params: params ?? [] }),
  });

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { error?: string }).error ?? `Postgres proxy error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Database auth failed: ${msg}. Please update your credentials.`);
    }
    throw new Error(`Database error: ${msg}`);
  }

  return body;
}

// ── Canned SQL for metadata tools ───────────────────────────

const LIST_TABLES_SQL = `
  SELECT table_schema, table_name, table_type
  FROM information_schema.tables
  WHERE table_schema = $1
  ORDER BY table_name
`;

const DESCRIBE_TABLE_SQL = `
  SELECT
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    tc.constraint_type
  FROM information_schema.columns c
  LEFT JOIN information_schema.key_column_usage kcu
    ON c.table_schema = kcu.table_schema
    AND c.table_name = kcu.table_name
    AND c.column_name = kcu.column_name
  LEFT JOIN information_schema.table_constraints tc
    ON kcu.constraint_name = tc.constraint_name
    AND kcu.table_schema = tc.table_schema
  WHERE c.table_schema = $1 AND c.table_name = $2
  ORDER BY c.ordinal_position
`;

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, proxyUrl: string, apiKey: string) => Promise<unknown>
> = {
  query(a, proxyUrl, apiKey) {
    const sql = String(a.sql);
    assertNoDDL(sql);
    return proxyQuery(proxyUrl, apiKey, sql, a.params as unknown[] | undefined);
  },

  list_tables(a, proxyUrl, apiKey) {
    const schema = (a.schema as string) || "public";
    return proxyQuery(proxyUrl, apiKey, LIST_TABLES_SQL, [schema]);
  },

  describe_table(a, proxyUrl, apiKey) {
    const schema = (a.schema as string) || "public";
    return proxyQuery(proxyUrl, apiKey, DESCRIBE_TABLE_SQL, [schema, a.table]);
  },

  execute(a, proxyUrl, apiKey) {
    const sql = String(a.sql);
    assertNoDDL(sql);
    return proxyQuery(proxyUrl, apiKey, sql, a.params as unknown[] | undefined);
  },
};

// ── Executor ────────────────────────────────────────────────

export const postgresExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const proxyUrl = credentials.proxyUrl as string | undefined;
    const apiKey = credentials.apiKey as string | undefined;
    if (!proxyUrl || !apiKey) {
      throw new Error("Missing proxyUrl or apiKey in Postgres credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Postgres tool: ${name}`);
    }

    return handler(args, proxyUrl, apiKey);
  },
};
