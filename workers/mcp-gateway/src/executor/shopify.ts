import type { ToolExecutor } from "./index";

/**
 * Shopify executor — calls the Shopify Admin REST API.
 *
 * Credentials must include:
 *   - access_token: Shopify Admin API access token
 *   - store_domain: Store domain (e.g. "my-store.myshopify.com")
 */

/** Call the Shopify Admin REST API with the user's access token. */
async function shopifyFetch(
  storeDomain: string,
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(
    `https://${storeDomain}/admin/api/2024-01${path}`,
    {
      ...init,
      headers: {
        "X-Shopify-Access-Token": token,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    },
  );

  const body = await res.json();

  if (!res.ok) {
    const errors = (body as { errors?: unknown }).errors;
    const msg =
      typeof errors === "string"
        ? errors
        : errors
          ? JSON.stringify(errors)
          : `Shopify API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Shopify auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Shopify API error (${res.status}): ${msg}`);
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
  (a: Args, domain: string, token: string) => Promise<unknown>
> = {
  list_products(a, domain, token) {
    return shopifyFetch(
      domain,
      `/products.json${qs({
        limit: a.limit,
        since_id: a.since_id,
        status: a.status,
        collection_id: a.collection_id,
        product_type: a.product_type,
      })}`,
      token,
    );
  },

  get_product(a, domain, token) {
    return shopifyFetch(domain, `/products/${a.product_id}.json`, token);
  },

  list_orders(a, domain, token) {
    return shopifyFetch(
      domain,
      `/orders.json${qs({
        limit: a.limit,
        since_id: a.since_id,
        status: a.status,
        financial_status: a.financial_status,
        fulfillment_status: a.fulfillment_status,
      })}`,
      token,
    );
  },

  get_order(a, domain, token) {
    return shopifyFetch(domain, `/orders/${a.order_id}.json`, token);
  },

  list_customers(a, domain, token) {
    return shopifyFetch(
      domain,
      `/customers.json${qs({ limit: a.limit, since_id: a.since_id })}`,
      token,
    );
  },

  get_customer(a, domain, token) {
    return shopifyFetch(domain, `/customers/${a.customer_id}.json`, token);
  },

  list_inventory(a, domain, token) {
    return shopifyFetch(
      domain,
      `/inventory_levels.json${qs({ location_ids: a.location_id, limit: a.limit })}`,
      token,
    );
  },

  update_inventory(a, domain, token) {
    return shopifyFetch(domain, "/inventory_levels/set.json", token, {
      method: "POST",
      body: JSON.stringify({
        inventory_item_id: Number(a.inventory_item_id),
        location_id: Number(a.location_id),
        available: a.available,
      }),
    });
  },

  create_product(a, domain, token) {
    const product: Record<string, unknown> = { title: a.title };
    if (a.body_html) product.body_html = a.body_html;
    if (a.vendor) product.vendor = a.vendor;
    if (a.product_type) product.product_type = a.product_type;
    if (a.status) product.status = a.status;
    if (a.tags) product.tags = a.tags;
    if (a.variants) product.variants = a.variants;

    return shopifyFetch(domain, "/products.json", token, {
      method: "POST",
      body: JSON.stringify({ product }),
    });
  },

  search_orders(a, domain, token) {
    return shopifyFetch(
      domain,
      `/orders.json${qs({ name: a.query, limit: a.limit, status: "any" })}`,
      token,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const shopifyExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const accessToken = credentials.access_token as string | undefined;
    const storeDomain = credentials.store_domain as string | undefined;

    if (!accessToken || !storeDomain) {
      throw new Error(
        "Missing Shopify credentials (access_token, store_domain)",
      );
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Shopify tool: ${name}`);
    }

    return handler(args, storeDomain, accessToken);
  },
};
