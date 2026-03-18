import type { ToolExecutor } from "./index";

/**
 * Airtable executor — calls the Airtable REST API.
 *
 * Credentials must include:
 *   - apiKey: Airtable Personal Access Token (pat_xxx)
 */

const AIRTABLE_API = "https://api.airtable.com/v0";
const AIRTABLE_META = "https://api.airtable.com/v0/meta";

async function airtableFetch(
  path: string,
  token: string,
  init?: RequestInit & { baseUrl?: string },
): Promise<unknown> {
  const base = init?.baseUrl ?? AIRTABLE_API;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 204) return { success: true };

  const body = await res.json();

  if (!res.ok) {
    const err = (body as { error?: { message?: string } }).error;
    const msg = err?.message ?? `Airtable API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Airtable auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Airtable API error (${res.status}): ${msg}`);
  }

  return body;
}

function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&")
  );
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, token: string) => Promise<unknown>
> = {
  list_bases(a, token) {
    return airtableFetch("/bases", token, { baseUrl: AIRTABLE_META });
  },

  list_tables(a, token) {
    return airtableFetch(`/bases/${a.base_id}/tables`, token, {
      baseUrl: AIRTABLE_META,
    });
  },

  list_records(a, token) {
    const params: Record<string, unknown> = {
      maxRecords: a.max_records ?? 100,
      pageSize: a.page_size ?? 100,
    };
    if (a.view) params.view = a.view;
    if (a.formula) params.filterByFormula = a.formula;
    if (a.sort_field) {
      params["sort[0][field]"] = a.sort_field;
      params["sort[0][direction]"] = a.sort_direction ?? "asc";
    }
    if (a.offset) params.offset = a.offset;

    return airtableFetch(
      `/${a.base_id}/${encodeURIComponent(String(a.table_name))}${qs(params)}`,
      token,
    );
  },

  get_record(a, token) {
    return airtableFetch(
      `/${a.base_id}/${encodeURIComponent(String(a.table_name))}/${a.record_id}`,
      token,
    );
  },

  create_records(a, token) {
    const records = (a.records as { fields: Record<string, unknown> }[]).map(
      (r) => ({ fields: r.fields }),
    );
    return airtableFetch(
      `/${a.base_id}/${encodeURIComponent(String(a.table_name))}`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ records, typecast: a.typecast ?? false }),
      },
    );
  },

  update_records(a, token) {
    const records = (
      a.records as { id: string; fields: Record<string, unknown> }[]
    ).map((r) => ({ id: r.id, fields: r.fields }));
    return airtableFetch(
      `/${a.base_id}/${encodeURIComponent(String(a.table_name))}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify({ records, typecast: a.typecast ?? false }),
      },
    );
  },

  delete_records(a, token) {
    const ids = a.record_ids as string[];
    const params = ids
      .map((id) => `records[]=${encodeURIComponent(id)}`)
      .join("&");
    return airtableFetch(
      `/${a.base_id}/${encodeURIComponent(String(a.table_name))}?${params}`,
      token,
      { method: "DELETE" },
    );
  },

  search_records(a, token) {
    const formula = `SEARCH(LOWER("${String(a.query).replace(/"/g, '\\"')}"), LOWER(CONCATENATE(${String(a.search_fields ?? "ARRAYJOIN(values)")})))`;
    const params: Record<string, unknown> = {
      filterByFormula: formula,
      maxRecords: a.max_records ?? 50,
    };
    return airtableFetch(
      `/${a.base_id}/${encodeURIComponent(String(a.table_name))}${qs(params)}`,
      token,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const airtableExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const apiKey = credentials.apiKey as string | undefined;
    if (!apiKey) {
      throw new Error("Missing Airtable Personal Access Token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Airtable tool: ${name}`);
    }

    return handler(args, apiKey);
  },
};
