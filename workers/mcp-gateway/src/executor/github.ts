import type { ToolExecutor } from "./index";

const GITHUB_API = "https://api.github.com";

/** Call the GitHub REST API with the user's PAT. */
async function ghFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Relay-MCP/1.0",
      ...init?.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { message?: string }).message ?? `GitHub API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(`GitHub auth failed: ${msg}. Please update your credentials.`);
    }
    throw new Error(`GitHub API error (${res.status}): ${msg}`);
  }

  return body;
}

/** Build a query-string from optional params, omitting undefined values. */
function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<string, (a: Args, token: string) => Promise<unknown>> = {
  list_repos(a, token) {
    const path = a.org
      ? `/orgs/${a.org}/repos`
      : "/user/repos";
    return ghFetch(path + qs({ per_page: a.per_page, page: a.page }), token);
  },

  get_repo(a, token) {
    return ghFetch(`/repos/${a.owner}/${a.repo}`, token);
  },

  list_issues(a, token) {
    return ghFetch(
      `/repos/${a.owner}/${a.repo}/issues` + qs({ state: a.state, per_page: a.per_page, page: a.page }),
      token,
    );
  },

  create_issue(a, token) {
    return ghFetch(`/repos/${a.owner}/${a.repo}/issues`, token, {
      method: "POST",
      body: JSON.stringify({
        title: a.title,
        body: a.body,
        labels: a.labels,
        assignees: a.assignees,
      }),
    });
  },

  list_pull_requests(a, token) {
    return ghFetch(
      `/repos/${a.owner}/${a.repo}/pulls` + qs({ state: a.state, per_page: a.per_page, page: a.page }),
      token,
    );
  },

  get_pull_request(a, token) {
    return ghFetch(`/repos/${a.owner}/${a.repo}/pulls/${a.pull_number}`, token);
  },

  create_pull_request(a, token) {
    return ghFetch(`/repos/${a.owner}/${a.repo}/pulls`, token, {
      method: "POST",
      body: JSON.stringify({
        title: a.title,
        body: a.body,
        head: a.head,
        base: a.base,
      }),
    });
  },

  get_file_contents(a, token) {
    return ghFetch(
      `/repos/${a.owner}/${a.repo}/contents/${a.path}` + qs({ ref: a.ref }),
      token,
    );
  },

  search_code(a, token) {
    return ghFetch(`/search/code` + qs({ q: a.q, per_page: a.per_page, page: a.page }), token);
  },

  list_branches(a, token) {
    return ghFetch(
      `/repos/${a.owner}/${a.repo}/branches` + qs({ per_page: a.per_page, page: a.page }),
      token,
    );
  },

  list_commits(a, token) {
    return ghFetch(
      `/repos/${a.owner}/${a.repo}/commits` + qs({ sha: a.sha, per_page: a.per_page, page: a.page }),
      token,
    );
  },

  create_or_update_file(a, token) {
    return ghFetch(`/repos/${a.owner}/${a.repo}/contents/${a.path}`, token, {
      method: "PUT",
      body: JSON.stringify({
        message: a.message,
        content: btoa(String(a.content)),
        sha: a.sha,
        branch: a.branch,
      }),
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const githubExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.token as string | undefined;
    if (!token) {
      throw new Error("Missing GitHub personal access token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown GitHub tool: ${name}`);
    }

    return handler(args, token);
  },
};
