import type { ToolExecutor } from "./index";

const ASANA_API = "https://app.asana.com/api/1.0";

/** Call the Asana REST API with the user's PAT. */
async function asanaFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${ASANA_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const errors = (body as { errors?: { message: string }[] }).errors;
    const msg = errors?.[0]?.message ?? `Asana API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Asana auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Asana API error (${res.status}): ${msg}`);
  }

  return (body as { data?: unknown }).data ?? body;
}

/** Build a query-string from optional params, omitting undefined values. */
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
  list_tasks(a, token) {
    return asanaFetch(
      `/tasks${qs({
        project: a.project,
        assignee: a.assignee,
        completed_since: a.completed_since,
        opt_fields: a.opt_fields ?? "name,assignee,due_on,completed,created_at,modified_at",
        limit: a.limit,
        offset: a.offset,
      })}`,
      token,
    );
  },

  get_task(a, token) {
    return asanaFetch(`/tasks/${a.task_gid}`, token);
  },

  create_task(a, token) {
    const data: Record<string, unknown> = { name: a.name };
    if (a.projects) data.projects = a.projects;
    if (a.assignee) data.assignee = a.assignee;
    if (a.notes) data.notes = a.notes;
    if (a.html_notes) data.html_notes = a.html_notes;
    if (a.due_on) data.due_on = a.due_on;
    if (a.tags) data.tags = a.tags;
    if (a.parent) data.parent = a.parent;

    return asanaFetch("/tasks", token, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
  },

  update_task(a, token) {
    const data: Record<string, unknown> = {};
    if (a.name) data.name = a.name;
    if (a.assignee) data.assignee = a.assignee;
    if (a.notes !== undefined) data.notes = a.notes;
    if (a.due_on !== undefined) data.due_on = a.due_on;
    if (a.completed !== undefined) data.completed = a.completed;

    return asanaFetch(`/tasks/${a.task_gid}`, token, {
      method: "PUT",
      body: JSON.stringify({ data }),
    });
  },

  list_projects(a, token) {
    return asanaFetch(
      `/projects${qs({
        workspace: a.workspace,
        archived: a.archived,
        limit: a.limit,
        offset: a.offset,
      })}`,
      token,
    );
  },

  get_project(a, token) {
    return asanaFetch(`/projects/${a.project_gid}`, token);
  },

  search_tasks(a, token) {
    const params: Record<string, unknown> = {};
    if (a.text) params["text"] = a.text;
    if (a.assignee) params["assignee.any"] = a.assignee;
    if (a.completed !== undefined)
      params["completed"] = a.completed;
    if (a.projects) params["projects.any"] = a.projects;
    if (a.is_subtask !== undefined)
      params["is_subtask"] = a.is_subtask;

    return asanaFetch(
      `/workspaces/${a.workspace}/tasks/search${qs(params)}`,
      token,
    );
  },

  add_comment(a, token) {
    const data: Record<string, unknown> = { text: a.text };
    if (a.html_text) data.html_text = a.html_text;

    return asanaFetch(`/tasks/${a.task_gid}/stories`, token, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const asanaExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.personal_access_token as string | undefined;
    if (!token) {
      throw new Error("Missing Asana personal access token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Asana tool: ${name}`);
    }

    return handler(args, token);
  },
};
