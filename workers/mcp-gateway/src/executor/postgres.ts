import { Client } from "pg";

import type { ToolExecutor } from "./index";

/**
 * Postgres executor — connects directly via the `pg` driver.
 *
 * Credentials must include:
 *   - connectionString: full Postgres URI (e.g. "postgresql://user:pass@host:5432/db")
 *
 * Uses CF Workers `nodejs_compat` flag for TCP socket support.
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

// ── Error mapping ───────────────────────────────────────────

const PG_ERROR_MESSAGES: Record<string, string> = {
  "28P01": "Authentication failed. Please update your database credentials.",
  "28000": "Authorization failed. Please check your database credentials.",
  "3D000": "Database does not exist. Please check your connection string.",
  "08001": "Unable to connect to the database. Please check the host and port.",
  "08006": "Connection to the database was lost.",
  "42P01": "Table does not exist.",
  "42703": "Column does not exist.",
  "42601": "SQL syntax error.",
  "57014": "Query was cancelled (statement timeout exceeded).",
};

function mapPgError(err: unknown): Error {
  if (err instanceof Error && "code" in err) {
    const code = (err as { code: string }).code;
    const friendly = PG_ERROR_MESSAGES[code];
    if (friendly) {
      return new Error(friendly);
    }
  }
  if (err instanceof Error) {
    return new Error(`Database error: ${err.message}`);
  }
  return new Error("Unknown database error");
}

// ── Query helper ────────────────────────────────────────────

async function runQuery(
  connectionString: string,
  sql: string,
  params?: unknown[],
  options?: { statementTimeout?: string },
): Promise<unknown> {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    if (options?.statementTimeout) {
      await client.query(
        `SET statement_timeout = '${options.statementTimeout}'`,
      );
    }
    const result = await client.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } catch (err) {
    throw mapPgError(err);
  } finally {
    await client.end().catch(() => {});
  }
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
  (a: Args, connectionString: string) => Promise<unknown>
> = {
  query(a, connectionString) {
    const sql = String(a.sql);
    assertNoDDL(sql);
    return runQuery(connectionString, sql, a.params as unknown[] | undefined, {
      statementTimeout: "10s",
    });
  },

  list_tables(a, connectionString) {
    const schema = (a.schema as string) || "public";
    return runQuery(connectionString, LIST_TABLES_SQL, [schema], {
      statementTimeout: "10s",
    });
  },

  describe_table(a, connectionString) {
    const schema = (a.schema as string) || "public";
    return runQuery(connectionString, DESCRIBE_TABLE_SQL, [schema, a.table], {
      statementTimeout: "10s",
    });
  },

  execute(a, connectionString) {
    const sql = String(a.sql);
    assertNoDDL(sql);
    return runQuery(connectionString, sql, a.params as unknown[] | undefined, {
      statementTimeout: "10s",
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const postgresExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const connectionString = credentials.connectionString as string | undefined;
    if (!connectionString) {
      throw new Error("Missing connectionString in Postgres credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Postgres tool: ${name}`);
    }

    return handler(args, connectionString);
  },
};
