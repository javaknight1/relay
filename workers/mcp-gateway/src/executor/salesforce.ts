import type { ToolExecutor } from "./index";

/**
 * Salesforce executor — calls the Salesforce REST API.
 *
 * Credentials must include:
 *   - access_token: OAuth2 access token
 *   - instance_url: Salesforce instance URL (e.g. "https://na1.salesforce.com")
 */

const SF_API_VERSION = "v59.0";

/** Call the Salesforce REST API with the user's access token. */
async function sfFetch(
  instanceUrl: string,
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${instanceUrl}/services/data/${SF_API_VERSION}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 204) return { success: true };

  const body = await res.json();

  if (!res.ok) {
    const errors = body as { message?: string }[] | { message?: string };
    const msg = Array.isArray(errors)
      ? errors[0]?.message ?? `Salesforce API error ${res.status}`
      : (errors as { message?: string }).message ?? `Salesforce API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Salesforce auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Salesforce API error (${res.status}): ${msg}`);
  }

  return body;
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, instanceUrl: string, token: string) => Promise<unknown>
> = {
  query(a, instanceUrl, token) {
    const soql = encodeURIComponent(String(a.soql));
    return sfFetch(instanceUrl, `/query/?q=${soql}`, token);
  },

  get_record(a, instanceUrl, token) {
    const fieldsParam = a.fields
      ? `?fields=${encodeURIComponent(String(a.fields))}`
      : "";
    return sfFetch(
      instanceUrl,
      `/sobjects/${a.object_type}/${a.record_id}${fieldsParam}`,
      token,
    );
  },

  create_record(a, instanceUrl, token) {
    return sfFetch(instanceUrl, `/sobjects/${a.object_type}/`, token, {
      method: "POST",
      body: JSON.stringify(a.fields),
    });
  },

  update_record(a, instanceUrl, token) {
    return sfFetch(
      instanceUrl,
      `/sobjects/${a.object_type}/${a.record_id}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(a.fields),
      },
    );
  },

  list_objects(a, instanceUrl, token) {
    return sfFetch(instanceUrl, "/sobjects/", token);
  },

  describe_object(a, instanceUrl, token) {
    return sfFetch(instanceUrl, `/sobjects/${a.object_type}/describe/`, token);
  },

  search(a, instanceUrl, token) {
    const sosl = encodeURIComponent(String(a.sosl));
    return sfFetch(instanceUrl, `/search/?q=${sosl}`, token);
  },

  list_reports(a, instanceUrl, token) {
    return sfFetch(instanceUrl, "/analytics/reports", token);
  },

  get_report(a, instanceUrl, token) {
    return sfFetch(instanceUrl, `/analytics/reports/${a.report_id}`, token);
  },

  list_dashboards(a, instanceUrl, token) {
    return sfFetch(instanceUrl, "/analytics/dashboards", token);
  },
};

// ── Executor ────────────────────────────────────────────────

export const salesforceExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const accessToken = credentials.access_token as string | undefined;
    const instanceUrl = credentials.instance_url as string | undefined;

    if (!accessToken || !instanceUrl) {
      throw new Error(
        "Missing Salesforce credentials (access_token, instance_url)",
      );
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Salesforce tool: ${name}`);
    }

    return handler(args, instanceUrl, accessToken);
  },
};
