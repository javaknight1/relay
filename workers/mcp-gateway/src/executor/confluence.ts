import type { ToolExecutor } from "./index";

/**
 * Confluence executor — calls the Confluence Cloud REST API.
 *
 * Credentials must include:
 *   - email:     Atlassian account email
 *   - api_token: Atlassian API token
 *   - domain:    Atlassian site domain (e.g. "mycompany")
 */

/** Call the Confluence REST API with Basic auth. */
async function confluenceFetch(
  domain: string,
  path: string,
  auth: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(
    `https://${domain}.atlassian.net/wiki/rest/api${path}`,
    {
      ...init,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    },
  );

  if (res.status === 204) return { success: true };

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { message?: string }).message ??
      `Confluence API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Confluence auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Confluence API error (${res.status}): ${msg}`);
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
  (a: Args, domain: string, auth: string) => Promise<unknown>
> = {
  search_content(a, domain, auth) {
    return confluenceFetch(
      domain,
      `/content/search${qs({
        cql: a.cql,
        limit: a.limit,
        start: a.start,
      })}`,
      auth,
    );
  },

  get_page(a, domain, auth) {
    const expand = (a.expand as string) ?? "body.storage,version,space";
    return confluenceFetch(
      domain,
      `/content/${a.page_id}${qs({ expand })}`,
      auth,
    );
  },

  create_page(a, domain, auth) {
    const payload: Record<string, unknown> = {
      type: "page",
      title: a.title,
      space: { key: a.space_key },
      body: {
        storage: {
          value: a.body,
          representation: "storage",
        },
      },
    };
    if (a.parent_id) {
      payload.ancestors = [{ id: a.parent_id }];
    }

    return confluenceFetch(domain, "/content", auth, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update_page(a, domain, auth) {
    return confluenceFetch(domain, `/content/${a.page_id}`, auth, {
      method: "PUT",
      body: JSON.stringify({
        type: "page",
        title: a.title,
        body: {
          storage: {
            value: a.body,
            representation: "storage",
          },
        },
        version: {
          number: (a.version_number as number) + 1,
        },
      }),
    });
  },

  list_spaces(a, domain, auth) {
    return confluenceFetch(
      domain,
      `/space${qs({
        type: a.type,
        limit: a.limit,
        start: a.start,
      })}`,
      auth,
    );
  },

  get_space(a, domain, auth) {
    const expand = (a.expand as string) ?? "description.plain,homepage";
    return confluenceFetch(
      domain,
      `/space/${a.space_key}${qs({ expand })}`,
      auth,
    );
  },

  get_page_children(a, domain, auth) {
    return confluenceFetch(
      domain,
      `/content/${a.page_id}/child/page${qs({
        limit: a.limit,
        start: a.start,
      })}`,
      auth,
    );
  },

  add_comment(a, domain, auth) {
    return confluenceFetch(domain, "/content", auth, {
      method: "POST",
      body: JSON.stringify({
        type: "comment",
        container: { id: a.page_id, type: "page" },
        body: {
          storage: {
            value: a.body,
            representation: "storage",
          },
        },
      }),
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const confluenceExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const domain = credentials.domain as string | undefined;
    const email = credentials.email as string | undefined;
    const apiToken = credentials.api_token as string | undefined;

    if (!domain || !email || !apiToken) {
      throw new Error(
        "Missing Confluence credentials (domain, email, api_token)",
      );
    }

    const auth = btoa(`${email}:${apiToken}`);

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Confluence tool: ${name}`);
    }

    return handler(args, domain, auth);
  },
};
