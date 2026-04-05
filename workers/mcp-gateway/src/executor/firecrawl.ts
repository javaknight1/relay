import type { ToolExecutor } from "./index";

const FIRECRAWL_API = "https://api.firecrawl.dev/v1";

/** Call the Firecrawl REST API with the user's API key. */
async function firecrawlFetch(
  path: string,
  apiKey: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${FIRECRAWL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 204) return { success: true };

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { error?: string }).error ??
      (body as { message?: string }).message ??
      `Firecrawl API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Firecrawl auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Firecrawl API error (${res.status}): ${msg}`);
  }

  return body;
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, apiKey: string) => Promise<unknown>
> = {
  scrape_url(a, apiKey) {
    const body: Record<string, unknown> = { url: a.url };
    if (a.formats) body.formats = a.formats;
    if (a.only_main_content !== undefined)
      body.onlyMainContent = a.only_main_content;
    if (a.wait_for) body.waitFor = a.wait_for;

    return firecrawlFetch("/scrape", apiKey, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  crawl_site(a, apiKey) {
    const body: Record<string, unknown> = { url: a.url };
    if (a.limit) body.limit = a.limit;
    if (a.max_depth) body.maxDepth = a.max_depth;
    if (a.include_paths) body.includePaths = a.include_paths;
    if (a.exclude_paths) body.excludePaths = a.exclude_paths;

    return firecrawlFetch("/crawl", apiKey, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  search_web(a, apiKey) {
    const body: Record<string, unknown> = { query: a.query };
    if (a.limit) body.limit = a.limit;
    if (a.lang) body.lang = a.lang;
    if (a.country) body.country = a.country;
    if (a.scrape_options) body.scrapeOptions = a.scrape_options;

    return firecrawlFetch("/search", apiKey, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  extract_data(a, apiKey) {
    const body: Record<string, unknown> = { urls: a.urls };
    if (a.prompt) body.prompt = a.prompt;
    if (a.schema) body.schema = a.schema;

    return firecrawlFetch("/extract", apiKey, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  get_crawl_status(a, apiKey) {
    return firecrawlFetch(`/crawl/${a.crawl_id}`, apiKey);
  },

  map_site(a, apiKey) {
    const body: Record<string, unknown> = { url: a.url };
    if (a.limit) body.limit = a.limit;
    if (a.search) body.search = a.search;

    return firecrawlFetch("/map", apiKey, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const firecrawlExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const apiKey = credentials.api_key as string | undefined;
    if (!apiKey) {
      throw new Error("Missing Firecrawl API key in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Firecrawl tool: ${name}`);
    }

    return handler(args, apiKey);
  },
};
