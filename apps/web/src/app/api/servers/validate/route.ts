import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

interface ValidationResult {
  valid: boolean;
  identity?: string;
  meta?: string;
  error?: string;
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

    const data = await res.json();
    return {
      valid: true,
      identity: `Connected as ${data.login}`,
      meta: `${data.public_repos} public repositories`,
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
};

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch {
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
