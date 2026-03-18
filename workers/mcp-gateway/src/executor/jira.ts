import type { ToolExecutor } from "./index";

/**
 * Jira executor — calls the Jira Cloud REST API v3.
 *
 * Credentials must include:
 *   - domain:   Atlassian site domain (e.g. "mycompany.atlassian.net")
 *   - email:    User email for Basic auth
 *   - apiToken: Atlassian API token
 */

/** Call the Jira REST API with Basic auth. */
async function jiraFetch(
  domain: string,
  path: string,
  auth: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`https://${domain}/rest/api/3${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 204) return { success: true };

  const body = await res.json();

  if (!res.ok) {
    const errors = (body as { errorMessages?: string[] }).errorMessages;
    const msg = errors?.[0] ?? `Jira API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Jira auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Jira API error (${res.status}): ${msg}`);
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
  search_issues(a, domain, auth) {
    const jql = String(a.jql ?? "ORDER BY updated DESC");
    const maxResults = (a.max_results as number) ?? 50;
    const startAt = (a.start_at as number) ?? 0;
    return jiraFetch(
      domain,
      `/search${qs({
        jql,
        maxResults,
        startAt,
        fields: "summary,status,assignee,priority,issuetype,project,created,updated",
      })}`,
      auth,
    );
  },

  get_issue(a, domain, auth) {
    const fields =
      "summary,description,status,assignee,reporter,priority,issuetype,project,labels,components,created,updated,comment";
    return jiraFetch(
      domain,
      `/issue/${a.issue_key}${qs({ fields, expand: "renderedFields" })}`,
      auth,
    );
  },

  create_issue(a, domain, auth) {
    const fields: Record<string, unknown> = {
      project: { key: a.project_key },
      summary: a.summary,
      issuetype: { name: (a.issue_type as string) ?? "Task" },
    };
    if (a.description) {
      fields.description = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: a.description }],
          },
        ],
      };
    }
    if (a.priority) fields.priority = { name: a.priority };
    if (a.assignee_id) fields.assignee = { accountId: a.assignee_id };
    if (a.labels) fields.labels = a.labels;
    if (a.parent_key) fields.parent = { key: a.parent_key };

    return jiraFetch(domain, "/issue", auth, {
      method: "POST",
      body: JSON.stringify({ fields }),
    });
  },

  update_issue(a, domain, auth) {
    const fields: Record<string, unknown> = {};
    if (a.summary) fields.summary = a.summary;
    if (a.description) {
      fields.description = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: a.description }],
          },
        ],
      };
    }
    if (a.priority) fields.priority = { name: a.priority };
    if (a.assignee_id) fields.assignee = { accountId: a.assignee_id };
    if (a.labels) fields.labels = a.labels;

    return jiraFetch(domain, `/issue/${a.issue_key}`, auth, {
      method: "PUT",
      body: JSON.stringify({ fields }),
    });
  },

  transition_issue(a, domain, auth) {
    return jiraFetch(domain, `/issue/${a.issue_key}/transitions`, auth, {
      method: "POST",
      body: JSON.stringify({
        transition: { id: a.transition_id },
      }),
    });
  },

  add_comment(a, domain, auth) {
    return jiraFetch(domain, `/issue/${a.issue_key}/comment`, auth, {
      method: "POST",
      body: JSON.stringify({
        body: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: a.body }],
            },
          ],
        },
      }),
    });
  },

  list_projects(a, domain, auth) {
    const maxResults = (a.max_results as number) ?? 50;
    const startAt = (a.start_at as number) ?? 0;
    return jiraFetch(
      domain,
      `/project/search${qs({ maxResults, startAt })}`,
      auth,
    );
  },

  get_transitions(a, domain, auth) {
    return jiraFetch(
      domain,
      `/issue/${a.issue_key}/transitions`,
      auth,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const jiraExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const domain = credentials.domain as string | undefined;
    const email = credentials.email as string | undefined;
    const apiToken = credentials.apiToken as string | undefined;

    if (!domain || !email || !apiToken) {
      throw new Error(
        "Missing Jira credentials (domain, email, apiToken)",
      );
    }

    const auth = btoa(`${email}:${apiToken}`);

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Jira tool: ${name}`);
    }

    return handler(args, domain, auth);
  },
};
