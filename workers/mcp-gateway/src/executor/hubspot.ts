import type { ToolExecutor } from "./index";

/**
 * HubSpot executor — calls the HubSpot CRM API v3.
 *
 * Credentials must include:
 *   - access_token: HubSpot private app access token
 */

const HUBSPOT_API = "https://api.hubapi.com";

/** Call the HubSpot API with Bearer auth. */
async function hubspotFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
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
      `HubSpot API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `HubSpot auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`HubSpot API error (${res.status}): ${msg}`);
  }

  return body;
}

function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(([k, v]) => {
        if (Array.isArray(v)) {
          return v
            .map((item) => `${k}=${encodeURIComponent(String(item))}`)
            .join("&");
        }
        return `${k}=${encodeURIComponent(String(v))}`;
      })
      .join("&")
  );
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, token: string) => Promise<unknown>
> = {
  list_contacts(a, token) {
    return hubspotFetch(
      `/crm/v3/objects/contacts${qs({
        limit: a.limit,
        after: a.after,
        properties: a.properties,
      })}`,
      token,
    );
  },

  get_contact(a, token) {
    return hubspotFetch(
      `/crm/v3/objects/contacts/${a.contact_id}${qs({
        properties: a.properties,
      })}`,
      token,
    );
  },

  create_contact(a, token) {
    const properties: Record<string, unknown> = {
      email: a.email,
      ...(a.firstname ? { firstname: a.firstname } : {}),
      ...(a.lastname ? { lastname: a.lastname } : {}),
      ...(a.phone ? { phone: a.phone } : {}),
      ...(a.company ? { company: a.company } : {}),
      ...((a.properties as Record<string, unknown>) ?? {}),
    };

    return hubspotFetch("/crm/v3/objects/contacts", token, {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
  },

  list_deals(a, token) {
    return hubspotFetch(
      `/crm/v3/objects/deals${qs({
        limit: a.limit,
        after: a.after,
        properties: a.properties,
      })}`,
      token,
    );
  },

  get_deal(a, token) {
    return hubspotFetch(
      `/crm/v3/objects/deals/${a.deal_id}${qs({
        properties: a.properties,
      })}`,
      token,
    );
  },

  list_companies(a, token) {
    return hubspotFetch(
      `/crm/v3/objects/companies${qs({
        limit: a.limit,
        after: a.after,
        properties: a.properties,
      })}`,
      token,
    );
  },

  search_contacts(a, token) {
    const body: Record<string, unknown> = {
      query: a.query,
      limit: a.limit ?? 10,
    };
    if (a.after) body.after = a.after;
    if (a.properties) body.properties = a.properties;

    return hubspotFetch("/crm/v3/objects/contacts/search", token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  list_tickets(a, token) {
    return hubspotFetch(
      `/crm/v3/objects/tickets${qs({
        limit: a.limit,
        after: a.after,
        properties: a.properties,
      })}`,
      token,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const hubspotExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.access_token as string | undefined;
    if (!token) {
      throw new Error("Missing HubSpot access token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown HubSpot tool: ${name}`);
    }

    return handler(args, token);
  },
};
