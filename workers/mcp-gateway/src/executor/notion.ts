import type { ToolExecutor } from "./index";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

/** Call the Notion API with the user's integration token. */
async function notionFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${NOTION_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { message?: string }).message ?? `Notion API error ${res.status}`;
    if (res.status === 401) {
      throw new Error(`Notion auth failed: ${msg}. Please update your credentials.`);
    }
    throw new Error(`Notion API error (${res.status}): ${msg}`);
  }

  return body;
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<string, (a: Args, token: string) => Promise<unknown>> = {
  search(a, token) {
    const payload: Record<string, unknown> = {};
    if (a.query) payload.query = a.query;
    if (a.filter) payload.filter = a.filter;
    if (a.page_size) payload.page_size = a.page_size;
    if (a.start_cursor) payload.start_cursor = a.start_cursor;
    return notionFetch("/search", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  get_page(a, token) {
    return notionFetch(`/pages/${a.page_id}`, token);
  },

  create_page(a, token) {
    const parent: Record<string, string> = {};
    parent[a.parent_type as string] = a.parent_id as string;

    const payload: Record<string, unknown> = {
      parent,
      properties: a.properties ?? {
        title: {
          title: [{ text: { content: a.title } }],
        },
      },
    };

    return notionFetch("/pages", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update_page(a, token) {
    const payload: Record<string, unknown> = {};
    if (a.properties) payload.properties = a.properties;
    if (a.archived != null) payload.archived = a.archived;
    return notionFetch(`/pages/${a.page_id}`, token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  get_block_children(a, token) {
    const params = new URLSearchParams();
    if (a.page_size) params.set("page_size", String(a.page_size));
    if (a.start_cursor) params.set("start_cursor", String(a.start_cursor));
    const qs = params.toString();
    return notionFetch(`/blocks/${a.block_id}/children${qs ? `?${qs}` : ""}`, token);
  },

  append_block_children(a, token) {
    return notionFetch(`/blocks/${a.block_id}/children`, token, {
      method: "PATCH",
      body: JSON.stringify({ children: a.children }),
    });
  },

  query_database(a, token) {
    const payload: Record<string, unknown> = {};
    if (a.filter) payload.filter = a.filter;
    if (a.sorts) payload.sorts = a.sorts;
    if (a.page_size) payload.page_size = a.page_size;
    if (a.start_cursor) payload.start_cursor = a.start_cursor;
    return notionFetch(`/databases/${a.database_id}/query`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  get_database(a, token) {
    return notionFetch(`/databases/${a.database_id}`, token);
  },
};

// ── Executor ────────────────────────────────────────────────

export const notionExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.token as string | undefined;
    if (!token) {
      throw new Error("Missing Notion integration token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Notion tool: ${name}`);
    }

    return handler(args, token);
  },
};
