import type { ToolExecutor } from "./index";

const BRAVE_API = "https://api.search.brave.com/res/v1";

/** Call the Brave Search API with the user's subscription token. */
async function braveFetch(
  path: string,
  apiKey: string,
  params: Record<string, unknown>,
): Promise<unknown> {
  const qs = Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

  const res = await fetch(`${BRAVE_API}${path}?${qs}`, {
    headers: {
      "X-Subscription-Token": apiKey,
      Accept: "application/json",
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { message?: string }).message ?? `Brave API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Brave auth failed: ${msg}. Please update your credentials.`);
    }
    throw new Error(`Brave API error (${res.status}): ${msg}`);
  }

  return body;
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<string, (a: Args, apiKey: string) => Promise<unknown>> = {
  web_search(a, apiKey) {
    return braveFetch("/web/search", apiKey, {
      q: a.q,
      count: a.count,
      offset: a.offset,
      freshness: a.freshness,
    });
  },

  local_search(a, apiKey) {
    return braveFetch("/web/search", apiKey, {
      q: a.q,
      count: a.count,
      search_lang: "en",
      result_filter: "locations",
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const braveExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const apiKey = credentials.apiKey as string | undefined;
    if (!apiKey) {
      throw new Error("Missing Brave Search API key in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Brave tool: ${name}`);
    }

    return handler(args, apiKey);
  },
};
