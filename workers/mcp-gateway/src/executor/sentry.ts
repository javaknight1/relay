import type { ToolExecutor } from "./index";

/**
 * Sentry executor — calls the Sentry REST API.
 *
 * Credentials must include:
 *   - auth_token:         Sentry auth token (Bearer token)
 *   - organization_slug:  Sentry organization slug
 */

/** Call the Sentry API with Bearer auth. */
async function sentryFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`https://sentry.io/api/0${path}`, {
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
      (body as { detail?: string }).detail ?? `Sentry API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Sentry auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Sentry API error (${res.status}): ${msg}`);
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
  (a: Args, token: string, org: string) => Promise<unknown>
> = {
  list_issues(a, token, org) {
    return sentryFetch(
      `/projects/${org}/${a.project_slug}/issues/${qs({
        query: a.query,
        cursor: a.cursor,
      })}`,
      token,
    );
  },

  get_issue(a, token) {
    return sentryFetch(`/issues/${a.issue_id}/`, token);
  },

  list_events(a, token) {
    return sentryFetch(
      `/issues/${a.issue_id}/events/${qs({
        full: a.full,
        cursor: a.cursor,
      })}`,
      token,
    );
  },

  resolve_issue(a, token) {
    const status = (a.status as string) ?? "resolved";
    return sentryFetch(`/issues/${a.issue_id}/`, token, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  list_projects(a, token, org) {
    return sentryFetch(
      `/organizations/${org}/projects/${qs({ cursor: a.cursor })}`,
      token,
    );
  },

  get_event(a, token, org) {
    return sentryFetch(
      `/projects/${org}/${a.project_slug}/events/${a.event_id}/`,
      token,
    );
  },

  search_issues(a, token, org) {
    return sentryFetch(
      `/organizations/${org}/issues/${qs({
        query: a.query,
        sort: a.sort,
        cursor: a.cursor,
      })}`,
      token,
    );
  },

  list_releases(a, token, org) {
    const path = a.project_slug
      ? `/projects/${org}/${a.project_slug}/releases/`
      : `/organizations/${org}/releases/`;
    return sentryFetch(path + qs({ cursor: a.cursor }), token);
  },
};

// ── Executor ────────────────────────────────────────────────

export const sentryExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.auth_token as string | undefined;
    const org = credentials.organization_slug as string | undefined;

    if (!token || !org) {
      throw new Error(
        "Missing Sentry credentials (auth_token, organization_slug)",
      );
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Sentry tool: ${name}`);
    }

    return handler(args, token, org);
  },
};
