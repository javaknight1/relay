import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

interface ValidationResult {
  valid: boolean;
  identity?: string;
  meta?: string;
  error?: string;
  expiresAt?: string;
}

type Validator = (
  credentials: Record<string, string>,
) => Promise<ValidationResult>;

const validators: Record<string, Validator> = {
  async github(credentials) {
    const token = credentials.personal_access_token?.trim();
    if (!token) return { valid: false, error: "Personal access token is required" };

    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = body?.message ?? res.statusText;
      return {
        valid: false,
        error: `GitHub API error (${res.status}): ${message}`,
      };
    }

    const expiresAt =
      res.headers.get("github-authentication-token-expiration") ?? undefined;
    const data = await res.json();
    return {
      valid: true,
      identity: `Connected as ${data.login}`,
      meta: `${data.public_repos} public repositories`,
      expiresAt,
    };
  },

  async notion(credentials) {
    const token = credentials.integration_token;
    if (!token) return { valid: false, error: "Integration token is required" };

    const res = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return {
          valid: false,
          error: "Invalid token. Check that you copied the full integration token from your Notion integration settings.",
        };
      }
      return { valid: false, error: `Notion API returned ${res.status}` };
    }

    const data = await res.json();
    const name = data.bot?.owner?.user?.name ?? data.name ?? "Integration";
    return {
      valid: true,
      identity: `Connected as ${name}`,
      meta: data.type === "bot" ? "Bot integration" : undefined,
    };
  },

  async brave(credentials) {
    const key = credentials.api_key;
    if (!key) return { valid: false, error: "API key is required" };

    const res = await fetch(
      "https://api.search.brave.com/res/v1/web/search?q=test&count=1",
      {
        headers: { "X-Subscription-Token": key },
      },
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid API key. Check that you copied it correctly from the Brave Search API dashboard.",
        };
      }
      return { valid: false, error: `Brave API returned ${res.status}` };
    }

    return {
      valid: true,
      identity: "Connected to Brave Search",
      meta: "API key verified",
    };
  },

  async slack(credentials) {
    const token = credentials.bot_token;
    if (!token) return { valid: false, error: "Bot token is required" };

    const res = await fetch("https://slack.com/api/auth.test", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return { valid: false, error: `Slack API returned ${res.status}` };
    }

    const data = await res.json();
    if (!data.ok) {
      return {
        valid: false,
        error: `Slack error: ${data.error ?? "invalid_auth"}. Check that the bot token is correct and the app is installed to the workspace.`,
      };
    }

    return {
      valid: true,
      identity: `Connected to ${data.team}`,
      meta: `as ${data.user}`,
    };
  },

  async postgres() {
    return {
      valid: true,
      identity: "Connection will be tested on deploy",
      meta: "PostgreSQL connections are validated during server startup",
    };
  },

  async stripe(credentials) {
    const key = credentials.secret_key?.trim();
    if (!key) return { valid: false, error: "Secret key is required" };

    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return {
          valid: false,
          error: "Invalid API key. Check that you copied the full secret key from the Stripe Dashboard.",
        };
      }
      return { valid: false, error: `Stripe API returned ${res.status}` };
    }

    const data = await res.json();
    const available = data.available?.[0];
    const currency = available?.currency?.toUpperCase() ?? "USD";
    const amount = available?.amount != null ? (available.amount / 100).toFixed(2) : "0.00";
    return {
      valid: true,
      identity: "Connected to Stripe",
      meta: `Balance: ${amount} ${currency}`,
    };
  },

  async figma(credentials) {
    const token = credentials.personal_access_token?.trim();
    if (!token) return { valid: false, error: "Personal access token is required" };

    const res = await fetch("https://api.figma.com/v1/me", {
      headers: {
        "X-FIGMA-TOKEN": token,
      },
    });

    if (!res.ok) {
      if (res.status === 403) {
        return {
          valid: false,
          error: "Invalid token. Check that you copied the full personal access token from Figma settings.",
        };
      }
      return { valid: false, error: `Figma API returned ${res.status}` };
    }

    const data = await res.json();
    return {
      valid: true,
      identity: `Connected as ${data.handle ?? data.email ?? "User"}`,
      meta: data.email ?? undefined,
    };
  },

  async shopify(credentials) {
    const token = credentials.access_token?.trim();
    const domain = credentials.store_domain?.trim();

    if (!token) return { valid: false, error: "Access token is required" };
    if (!domain) return { valid: false, error: "Store domain is required" };

    const res = await fetch(
      `https://${domain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": token,
        },
      },
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Authentication failed. Check your access token and store domain.",
        };
      }
      return { valid: false, error: `Shopify API returned ${res.status}` };
    }

    const data = await res.json();
    const shop = data.shop;
    return {
      valid: true,
      identity: `Connected to ${shop?.name ?? domain}`,
      meta: shop?.plan_name ? `Plan: ${shop.plan_name}` : undefined,
    };
  },

  async salesforce(credentials) {
    const token = credentials.access_token?.trim();
    const instanceUrl = credentials.instance_url?.trim()?.replace(/\/+$/, "");

    if (!token) return { valid: false, error: "Access token is required" };
    if (!instanceUrl) return { valid: false, error: "Instance URL is required" };

    const res = await fetch(`${instanceUrl}/services/data/v59.0/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Authentication failed. Check your access token and instance URL.",
        };
      }
      return { valid: false, error: `Salesforce API returned ${res.status}` };
    }

    return {
      valid: true,
      identity: `Connected to ${instanceUrl}`,
      meta: "API v59.0",
    };
  },

  async mongodb(credentials) {
    const apiKey = credentials.api_key?.trim();
    const appId = credentials.app_id?.trim();
    const clusterName = credentials.cluster_name?.trim();
    const databaseName = credentials.database_name?.trim();

    if (!apiKey) return { valid: false, error: "Data API key is required" };
    if (!appId) return { valid: false, error: "App ID is required" };
    if (!clusterName) return { valid: false, error: "Cluster name is required" };
    if (!databaseName) return { valid: false, error: "Database name is required" };

    const url = `https://data.mongodb-api.com/app/${appId}/endpoint/data/v1/action/find`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        dataSource: clusterName,
        database: databaseName,
        collection: "_relay_probe",
        filter: {},
        limit: 1,
      }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return {
          valid: false,
          error: "MongoDB authentication failed. Check your Data API key.",
        };
      }
      const text = await res.text().catch(() => "");
      return {
        valid: false,
        error: `MongoDB Data API error (${res.status}): ${text}`,
      };
    }

    return {
      valid: true,
      identity: `Connected to cluster ${clusterName}`,
      meta: `Database: ${databaseName}`,
    };
  },

  async mysql(credentials) {
    const endpoint = credentials.api_endpoint?.trim();
    if (!endpoint) return { valid: false, error: "HTTP proxy endpoint URL is required" };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: "SELECT 1 AS ok", params: [] }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "MySQL proxy authentication failed. Check your endpoint URL.",
        };
      }
      const text = await res.text().catch(() => "");
      return {
        valid: false,
        error: `MySQL proxy error (${res.status}): ${text}`,
      };
    }

    return {
      valid: true,
      identity: "Connected to MySQL via HTTP proxy",
      meta: "Test query succeeded",
    };
  },

  async redis(credentials) {
    const restUrl = credentials.rest_url?.trim()?.replace(/\/+$/, "");
    const restToken = credentials.rest_token?.trim();

    if (!restUrl) return { valid: false, error: "REST URL is required" };
    if (!restToken) return { valid: false, error: "REST token is required" };

    const res = await fetch(restUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${restToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["PING"]),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return {
          valid: false,
          error: "Redis authentication failed. Check your REST token.",
        };
      }
      const text = await res.text().catch(() => "");
      return {
        valid: false,
        error: `Upstash Redis error (${res.status}): ${text}`,
      };
    }

    const data = await res.json().catch(() => null) as { result?: string } | null;
    if (data?.result === "PONG") {
      return {
        valid: true,
        identity: "Connected to Upstash Redis",
        meta: "PING/PONG verified",
      };
    }

    return {
      valid: true,
      identity: "Connected to Upstash Redis",
      meta: "Connection verified",
    };
  },

  async sentry(credentials) {
    const token = credentials.auth_token?.trim();
    const org = credentials.organization_slug?.trim();
    if (!token) return { valid: false, error: "Auth token is required" };
    if (!org) return { valid: false, error: "Organization slug is required" };

    const res = await fetch(`https://sentry.io/api/0/organizations/${org}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid auth token. Check that the token has org:read scope.",
        };
      }
      if (res.status === 404) {
        return {
          valid: false,
          error: `Organization "${org}" not found. Check your organization slug.`,
        };
      }
      return { valid: false, error: `Sentry API returned ${res.status}` };
    }

    const data = await res.json();
    return {
      valid: true,
      identity: `Connected to ${data.name ?? org}`,
      meta: `Organization: ${data.slug ?? org}`,
    };
  },

  async gitlab(credentials) {
    const token = credentials.personal_access_token?.trim();
    if (!token) return { valid: false, error: "Personal access token is required" };

    const instanceUrl = credentials.instance_url?.trim()?.replace(/\/+$/, "") || "https://gitlab.com";
    const res = await fetch(`${instanceUrl}/api/v4/user`, {
      headers: {
        "PRIVATE-TOKEN": token,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid personal access token. Check that the token has api or read_api scope.",
        };
      }
      return { valid: false, error: `GitLab API returned ${res.status}` };
    }

    const data = await res.json();
    return {
      valid: true,
      identity: `Connected as ${data.username ?? data.name}`,
      meta: instanceUrl === "https://gitlab.com" ? "gitlab.com" : instanceUrl,
    };
  },

  async confluence(credentials) {
    const email = credentials.email?.trim();
    const apiToken = credentials.api_token?.trim();
    const domain = credentials.domain?.trim();

    if (!email) return { valid: false, error: "Email is required" };
    if (!apiToken) return { valid: false, error: "API token is required" };
    if (!domain) return { valid: false, error: "Confluence domain is required" };

    const auth = btoa(`${email}:${apiToken}`);
    const res = await fetch(
      `https://${domain}.atlassian.net/wiki/rest/api/space?limit=1`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      },
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Authentication failed. Check your email, API token, and domain.",
        };
      }
      return { valid: false, error: `Confluence API returned ${res.status}` };
    }

    const data = await res.json();
    const spaceCount = data.size ?? 0;
    return {
      valid: true,
      identity: `Connected to ${domain}.atlassian.net`,
      meta: `${spaceCount} space${spaceCount === 1 ? "" : "s"} accessible`,
    };
  },

  async hubspot(credentials) {
    const token = credentials.access_token?.trim();
    if (!token) return { valid: false, error: "Access token is required" };

    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid access token. Check that the private app has CRM scopes.",
        };
      }
      return { valid: false, error: `HubSpot API returned ${res.status}` };
    }

    const data = await res.json();
    const total = data.total ?? "unknown";
    return {
      valid: true,
      identity: "Connected to HubSpot CRM",
      meta: `${total} contacts in account`,
    };
  },

  async asana(credentials) {
    const token = credentials.personal_access_token?.trim();
    if (!token) return { valid: false, error: "Personal access token is required" };

    const res = await fetch("https://app.asana.com/api/1.0/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid token. Check that you copied the full personal access token from the Asana Developer Console.",
        };
      }
      return { valid: false, error: `Asana API returned ${res.status}` };
    }

    const body = await res.json();
    const userData = body?.data;
    const name = userData?.name ?? "User";
    const email = userData?.email ? ` (${userData.email})` : "";
    return {
      valid: true,
      identity: `Connected as ${name}${email}`,
      meta: userData?.workspaces?.length
        ? `${userData.workspaces.length} workspace(s)`
        : undefined,
    };
  },

  async todoist(credentials) {
    const token = credentials.api_token?.trim();
    if (!token) return { valid: false, error: "API token is required" };

    const res = await fetch("https://api.todoist.com/rest/v2/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid API token. Check that you copied it correctly from Todoist Settings.",
        };
      }
      return { valid: false, error: `Todoist API returned ${res.status}` };
    }

    const projects = await res.json();
    const projectCount = Array.isArray(projects) ? projects.length : 0;
    return {
      valid: true,
      identity: "Connected to Todoist",
      meta: `${projectCount} project(s)`,
    };
  },

  async twilio(credentials) {
    const accountSid = credentials.account_sid?.trim();
    const authToken = credentials.auth_token?.trim();

    if (!accountSid) return { valid: false, error: "Account SID is required" };
    if (!authToken) return { valid: false, error: "Auth Token is required" };

    const auth = btoa(`${accountSid}:${authToken}`);
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      },
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid credentials. Check your Account SID and Auth Token from the Twilio Console.",
        };
      }
      return { valid: false, error: `Twilio API returned ${res.status}` };
    }

    const accountData = await res.json();
    return {
      valid: true,
      identity: `Connected to ${accountData.friendly_name ?? accountSid}`,
      meta: `Status: ${accountData.status ?? "active"}`,
    };
  },

  async firecrawl(credentials) {
    const apiKey = credentials.api_key?.trim();
    if (!apiKey) return { valid: false, error: "API key is required" };

    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://example.com",
        formats: ["markdown"],
      }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid API key. Check that you copied it correctly from the Firecrawl dashboard.",
        };
      }
      return { valid: false, error: `Firecrawl API returned ${res.status}` };
    }

    return {
      valid: true,
      identity: "Connected to Firecrawl",
      meta: "API key verified",
    };
  },

  async discord(credentials) {
    const token = credentials.bot_token?.trim();
    if (!token) return { valid: false, error: "Bot token is required" };

    const res = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          error: "Invalid bot token. Check that you copied the full token from the Discord Developer Portal.",
        };
      }
      return { valid: false, error: `Discord API returned ${res.status}` };
    }

    const botData = await res.json();
    const username = botData.username ?? "Bot";
    return {
      valid: true,
      identity: `Connected as ${username}`,
      meta: botData.bot ? "Bot account" : undefined,
    };
  },
};

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    console.error("Auth failed in /api/servers/validate:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, credentials } = body as {
    type: string;
    credentials: Record<string, string>;
  };

  if (!type || !credentials) {
    return NextResponse.json(
      { valid: false, error: "Missing type or credentials" },
      { status: 400 },
    );
  }

  const validator = validators[type];
  if (!validator) {
    return NextResponse.json(
      { valid: false, error: `Unknown template type: ${type}` },
      { status: 400 },
    );
  }

  try {
    const result = await validator(credentials);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, error: "Validation request failed. Please try again." },
      { status: 500 },
    );
  }
}
