import type { ToolExecutor } from "./index";

/**
 * GitLab executor — calls the GitLab REST API v4.
 *
 * Credentials must include:
 *   - personal_access_token:  GitLab personal access token
 *   - instance_url (optional): Custom GitLab instance URL (default: https://gitlab.com)
 */

/** Call the GitLab REST API with PRIVATE-TOKEN header. */
async function gitlabFetch(
  baseUrl: string,
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${baseUrl}/api/v4${path}`, {
    ...init,
    headers: {
      "PRIVATE-TOKEN": token,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 204) return { success: true };

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { message?: string; error?: string }).message ??
      (body as { error?: string }).error ??
      `GitLab API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `GitLab auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`GitLab API error (${res.status}): ${msg}`);
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
  (a: Args, baseUrl: string, token: string) => Promise<unknown>
> = {
  list_projects(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects${qs({
        membership: a.membership,
        search: a.search,
        per_page: a.per_page,
        page: a.page,
      })}`,
      token,
    );
  },

  get_project(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects/${encodeURIComponent(String(a.project_id))}`,
      token,
    );
  },

  list_merge_requests(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects/${encodeURIComponent(String(a.project_id))}/merge_requests${qs({
        state: a.state,
        per_page: a.per_page,
        page: a.page,
      })}`,
      token,
    );
  },

  get_merge_request(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects/${encodeURIComponent(String(a.project_id))}/merge_requests/${a.merge_request_iid}`,
      token,
    );
  },

  list_issues(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects/${encodeURIComponent(String(a.project_id))}/issues${qs({
        state: a.state,
        labels: a.labels,
        per_page: a.per_page,
        page: a.page,
      })}`,
      token,
    );
  },

  create_issue(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects/${encodeURIComponent(String(a.project_id))}/issues`,
      token,
      {
        method: "POST",
        body: JSON.stringify({
          title: a.title,
          description: a.description,
          labels: a.labels,
          assignee_ids: a.assignee_ids,
          milestone_id: a.milestone_id,
        }),
      },
    );
  },

  list_pipelines(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects/${encodeURIComponent(String(a.project_id))}/pipelines${qs({
        status: a.status,
        ref: a.ref,
        per_page: a.per_page,
        page: a.page,
      })}`,
      token,
    );
  },

  get_pipeline(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects/${encodeURIComponent(String(a.project_id))}/pipelines/${a.pipeline_id}`,
      token,
    );
  },

  search_code(a, baseUrl, token) {
    const scope = "blobs";
    if (a.project_id) {
      return gitlabFetch(
        baseUrl,
        `/projects/${encodeURIComponent(String(a.project_id))}/search${qs({
          scope,
          search: a.search,
          per_page: a.per_page,
          page: a.page,
        })}`,
        token,
      );
    }
    return gitlabFetch(
      baseUrl,
      `/search${qs({
        scope,
        search: a.search,
        per_page: a.per_page,
        page: a.page,
      })}`,
      token,
    );
  },

  get_file(a, baseUrl, token) {
    return gitlabFetch(
      baseUrl,
      `/projects/${encodeURIComponent(String(a.project_id))}/repository/files/${encodeURIComponent(String(a.file_path))}${qs({ ref: a.ref })}`,
      token,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const gitlabExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.personal_access_token as string | undefined;
    if (!token) {
      throw new Error("Missing GitLab personal access token in credentials");
    }

    const instanceUrl = (credentials.instance_url as string | undefined)?.replace(
      /\/$/,
      "",
    );
    const baseUrl = instanceUrl || "https://gitlab.com";

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown GitLab tool: ${name}`);
    }

    return handler(args, baseUrl, token);
  },
};
