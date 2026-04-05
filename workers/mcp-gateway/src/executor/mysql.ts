import type { ToolExecutor } from "./index";

/**
 * MySQL executor — calls a MySQL HTTP proxy endpoint.
 *
 * CF Workers cannot use TCP sockets for MySQL connections, so this handler
 * expects the user to provide an HTTP-based MySQL proxy endpoint (e.g.
 * PlanetScale Serverless Driver, a self-hosted HTTP-to-MySQL proxy, or
 * a Fly.io-hosted proxy similar to the PostgreSQL pattern).
 *
 * The proxy must accept POST requests with JSON body:
 *   { "sql": "SELECT ...", "params": [...] }
 * and return JSON:
 *   { "rows": [...], "rowCount": N }
 *
 * Credentials must include:
 *   - api_endpoint: URL of the MySQL HTTP proxy
 */

// ── DDL blocklist ───────────────────────────────────────────

const DDL_PATTERN =
  /^\s*(DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE)\b/i;

function assertNoDDL(sql: string): void {
  if (DDL_PATTERN.test(sql)) {
    throw new Error(
      "DDL statements (DROP, CREATE, ALTER, TRUNCATE, GRANT, REVOKE) are not allowed",
    );
  }
}

// ── Query helper ────────────────────────────────────────────

async function proxyQuery(
  endpoint: string,
  sql: string,
  params?: unknown[],
): Promise<unknown> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params: params ?? [] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "MySQL proxy authentication failed. Please check your endpoint URL.",
      );
    }
    throw new Error(`MySQL proxy error (${res.status}): ${text}`);
  }

  return res.json();
}

// ── Canned SQL for metadata tools ───────────────────────────

const LIST_TABLES_SQL = `
  SELECT table_schema, table_name, table_type
  FROM information_schema.tables
  WHERE table_schema = ?
  ORDER BY table_name
`;

const DESCRIBE_TABLE_SQL = `
  SELECT
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.column_key,
    c.extra
  FROM information_schema.columns c
  WHERE c.table_schema = ? AND c.table_name = ?
  ORDER BY c.ordinal_position
`;

const LIST_SCHEMAS_SQL = `
  SELECT schema_name
  FROM information_schema.schemata
  ORDER BY schema_name
`;

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, endpoint: string) => Promise<unknown>
> = {
  query(a, endpoint) {
    const sql = String(a.sql);
    assertNoDDL(sql);
    return proxyQuery(endpoint, sql, a.params as unknown[] | undefined);
  },

  list_tables(a, endpoint) {
    const schema = (a.schema as string) || "information_schema";
    return proxyQuery(endpoint, LIST_TABLES_SQL, [schema]).then((result) => {
      // If no schema was provided, try to get the default database tables
      if (!a.schema) {
        return proxyQuery(endpoint, "SHOW TABLES", []);
      }
      return result;
    });
  },

  describe_table(a, endpoint) {
    const schema = (a.schema as string) || "";
    if (schema) {
      return proxyQuery(endpoint, DESCRIBE_TABLE_SQL, [schema, a.table]);
    }
    // Fallback to DESCRIBE which uses the current database
    return proxyQuery(endpoint, `DESCRIBE \`${String(a.table).replace(/`/g, "``")}\``, []);
  },

  list_schemas(_a, endpoint) {
    return proxyQuery(endpoint, LIST_SCHEMAS_SQL, []);
  },
};

// ── Executor ────────────────────────────────────────────────

export const mysqlExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const endpoint = credentials.api_endpoint as string | undefined;
    if (!endpoint) {
      throw new Error(
        "Missing api_endpoint in MySQL credentials. Provide the URL of your MySQL HTTP proxy.",
      );
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown MySQL tool: ${name}`);
    }

    return handler(args, endpoint);
  },
};
