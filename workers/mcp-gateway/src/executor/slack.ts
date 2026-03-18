import type { ToolExecutor } from "./index";

const SLACK_API = "https://slack.com/api";

/** Call a Slack Web API method. GET for reads, POST for writes. */
async function slackFetch(
  method: string,
  token: string,
  params?: Record<string, unknown>,
  post?: boolean,
): Promise<unknown> {
  const url = `${SLACK_API}/${method}`;
  let res: Response;

  if (post) {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(params ?? {}),
    });
  } else {
    const qs = Object.entries(params ?? {})
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");
    res = await fetch(`${url}${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const body = (await res.json()) as { ok: boolean; error?: string };

  if (!res.ok || !body.ok) {
    const err = body.error ?? `Slack API error ${res.status}`;
    if (err === "invalid_auth" || err === "token_revoked" || err === "not_authed") {
      throw new Error(`Slack auth failed: ${err}. Please update your credentials.`);
    }
    throw new Error(`Slack API error: ${err}`);
  }

  return body;
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<string, (a: Args, token: string) => Promise<unknown>> = {
  list_channels(a, token) {
    return slackFetch("conversations.list", token, {
      limit: a.limit,
      cursor: a.cursor,
      types: a.types,
    });
  },

  post_message(a, token) {
    return slackFetch("chat.postMessage", token, {
      channel: a.channel,
      text: a.text,
      thread_ts: a.thread_ts,
    }, true);
  },

  get_channel_history(a, token) {
    return slackFetch("conversations.history", token, {
      channel: a.channel,
      limit: a.limit,
      oldest: a.oldest,
      latest: a.latest,
    });
  },

  search_messages(a, token) {
    return slackFetch("search.messages", token, {
      query: a.query,
      count: a.count,
      sort: a.sort,
    });
  },

  get_thread_replies(a, token) {
    return slackFetch("conversations.replies", token, {
      channel: a.channel,
      ts: a.ts,
      limit: a.limit,
    });
  },

  list_users(a, token) {
    return slackFetch("users.list", token, {
      limit: a.limit,
      cursor: a.cursor,
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const slackExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.token as string | undefined;
    if (!token) {
      throw new Error("Missing Slack bot token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Slack tool: ${name}`);
    }

    return handler(args, token);
  },
};
