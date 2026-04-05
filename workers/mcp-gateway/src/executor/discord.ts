import type { ToolExecutor } from "./index";

const DISCORD_API = "https://discord.com/api/v10";

/** Call the Discord REST API with the bot token. */
async function discordFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${DISCORD_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 204) return { success: true };

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { message?: string }).message ??
      `Discord API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Discord auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Discord API error (${res.status}): ${msg}`);
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
  list_guilds(a, token) {
    return discordFetch(
      `/users/@me/guilds${qs({ limit: a.limit, after: a.after })}`,
      token,
    );
  },

  list_channels(a, token) {
    return discordFetch(`/guilds/${a.guild_id}/channels`, token);
  },

  get_channel_messages(a, token) {
    return discordFetch(
      `/channels/${a.channel_id}/messages${qs({
        limit: a.limit,
        before: a.before,
        after: a.after,
        around: a.around,
      })}`,
      token,
    );
  },

  send_message(a, token) {
    const body: Record<string, unknown> = { content: a.content };
    if (a.tts) body.tts = a.tts;
    if (a.reply_to) {
      body.message_reference = { message_id: a.reply_to };
    }

    return discordFetch(`/channels/${a.channel_id}/messages`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  list_members(a, token) {
    return discordFetch(
      `/guilds/${a.guild_id}/members${qs({
        limit: a.limit,
        after: a.after,
      })}`,
      token,
    );
  },

  get_user(a, token) {
    return discordFetch(`/users/${a.user_id}`, token);
  },

  create_channel(a, token) {
    const body: Record<string, unknown> = { name: a.name };
    if (a.type !== undefined) body.type = a.type;
    if (a.topic) body.topic = a.topic;
    if (a.parent_id) body.parent_id = a.parent_id;

    return discordFetch(`/guilds/${a.guild_id}/channels`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  search_messages(a, token) {
    const params: Record<string, unknown> = {};
    if (a.content) params.content = a.content;
    if (a.author_id) params.author_id = a.author_id;
    if (a.channel_id) params.channel_id = a.channel_id;
    if (a.has) params.has = a.has;
    if (a.limit) params.limit = a.limit;
    if (a.offset) params.offset = a.offset;

    return discordFetch(
      `/guilds/${a.guild_id}/messages/search${qs(params)}`,
      token,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const discordExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.bot_token as string | undefined;
    if (!token) {
      throw new Error("Missing Discord bot token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Discord tool: ${name}`);
    }

    return handler(args, token);
  },
};
