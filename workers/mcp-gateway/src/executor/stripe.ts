import type { ToolExecutor } from "./index";

const STRIPE_API = "https://api.stripe.com";

/** Call the Stripe REST API with the user's secret key. */
async function stripeFetch(
  path: string,
  secretKey: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...init?.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const err = (body as { error?: { message?: string } }).error;
    const msg = err?.message ?? `Stripe API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Stripe auth failed: ${msg}. Please update your credentials.`);
    }
    throw new Error(`Stripe API error (${res.status}): ${msg}`);
  }

  return body;
}

/** Build a query-string from optional params, omitting undefined values. */
function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

/** Encode params as x-www-form-urlencoded body. */
function formBody(params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => {
      if (typeof v === "object" && v !== null) {
        // Handle nested objects like metadata[key]=value
        return Object.entries(v as Record<string, unknown>)
          .filter(([, sv]) => sv != null)
          .map(([sk, sv]) => `${k}[${encodeURIComponent(sk)}]=${encodeURIComponent(String(sv))}`)
          .join("&");
      }
      return `${k}=${encodeURIComponent(String(v))}`;
    })
    .join("&");
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<string, (a: Args, key: string) => Promise<unknown>> = {
  list_customers(a, key) {
    return stripeFetch(
      `/v1/customers${qs({ limit: a.limit, starting_after: a.starting_after, email: a.email })}`,
      key,
    );
  },

  get_customer(a, key) {
    return stripeFetch(`/v1/customers/${a.customer_id}`, key);
  },

  create_customer(a, key) {
    return stripeFetch("/v1/customers", key, {
      method: "POST",
      body: formBody({
        email: a.email,
        name: a.name,
        description: a.description,
        phone: a.phone,
        metadata: a.metadata,
      }),
    });
  },

  list_charges(a, key) {
    return stripeFetch(
      `/v1/charges${qs({ limit: a.limit, starting_after: a.starting_after, customer: a.customer })}`,
      key,
    );
  },

  list_subscriptions(a, key) {
    return stripeFetch(
      `/v1/subscriptions${qs({
        limit: a.limit,
        starting_after: a.starting_after,
        customer: a.customer,
        status: a.status,
      })}`,
      key,
    );
  },

  get_subscription(a, key) {
    return stripeFetch(`/v1/subscriptions/${a.subscription_id}`, key);
  },

  create_payment_link(a, key) {
    const quantity = (a.quantity as number) ?? 1;
    return stripeFetch("/v1/payment_links", key, {
      method: "POST",
      body: `line_items[0][price]=${encodeURIComponent(String(a.price_id))}&line_items[0][quantity]=${quantity}`,
    });
  },

  list_invoices(a, key) {
    return stripeFetch(
      `/v1/invoices${qs({
        limit: a.limit,
        starting_after: a.starting_after,
        customer: a.customer,
        status: a.status,
      })}`,
      key,
    );
  },

  get_invoice(a, key) {
    return stripeFetch(`/v1/invoices/${a.invoice_id}`, key);
  },

  list_products(a, key) {
    return stripeFetch(
      `/v1/products${qs({ limit: a.limit, starting_after: a.starting_after, active: a.active })}`,
      key,
    );
  },

  get_balance(_a, key) {
    return stripeFetch("/v1/balance", key);
  },

  search_charges(a, key) {
    return stripeFetch(
      `/v1/charges/search${qs({ query: a.query, limit: a.limit })}`,
      key,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const stripeExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const secretKey = credentials.secret_key as string | undefined;
    if (!secretKey) {
      throw new Error("Missing Stripe secret key in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Stripe tool: ${name}`);
    }

    return handler(args, secretKey);
  },
};
