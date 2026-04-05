import type { ToolExecutor } from "./index";

const TODOIST_API = "https://api.todoist.com/rest/v2";

/** Call the Todoist REST API with the user's API token. */
async function todoistFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${TODOIST_API}${path}`, {
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
    const msg =
      (body as { message?: string }).message ??
      `Todoist API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Todoist auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Todoist API error (${res.status}): ${msg}`);
  }

  return body;
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
    return todoistFetch(
      `/tasks${qs({
        project_id: a.project_id,
        label: a.label,
        filter: a.filter,
      })}`,
      token,
    );
  },

  get_task(a, token) {
    return todoistFetch(`/tasks/${a.task_id}`, token);
  },

  create_task(a, token) {
    const body: Record<string, unknown> = { content: a.content };
    if (a.description) body.description = a.description;
    if (a.project_id) body.project_id = a.project_id;
    if (a.priority) body.priority = a.priority;
    if (a.due_string) body.due_string = a.due_string;
    if (a.due_date) body.due_date = a.due_date;
    if (a.labels) body.labels = a.labels;
    if (a.parent_id) body.parent_id = a.parent_id;
    if (a.section_id) body.section_id = a.section_id;

    return todoistFetch("/tasks", token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update_task(a, token) {
    const body: Record<string, unknown> = {};
    if (a.content) body.content = a.content;
    if (a.description !== undefined) body.description = a.description;
    if (a.priority) body.priority = a.priority;
    if (a.due_string) body.due_string = a.due_string;
    if (a.due_date) body.due_date = a.due_date;
    if (a.labels) body.labels = a.labels;

    return todoistFetch(`/tasks/${a.task_id}`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  complete_task(a, token) {
    return todoistFetch(`/tasks/${a.task_id}/close`, token, {
      method: "POST",
    });
  },

  list_projects(_a, token) {
    return todoistFetch("/projects", token);
  },

  create_project(a, token) {
    const body: Record<string, unknown> = { name: a.name };
    if (a.parent_id) body.parent_id = a.parent_id;
    if (a.color) body.color = a.color;
    if (a.is_favorite !== undefined) body.is_favorite = a.is_favorite;
    if (a.view_style) body.view_style = a.view_style;

    return todoistFetch("/projects", token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  add_comment(a, token) {
    const body: Record<string, unknown> = { content: a.content };
    if (a.task_id) body.task_id = a.task_id;
    if (a.project_id) body.project_id = a.project_id;

    return todoistFetch("/comments", token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const todoistExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.api_token as string | undefined;
    if (!token) {
      throw new Error("Missing Todoist API token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Todoist tool: ${name}`);
    }

    return handler(args, token);
  },
};
