import type { MCPToolDefinition } from "@relay/shared";

export const discordTools: MCPToolDefinition[] = [
  {
    name: "list_guilds",
    description: "List guilds (servers) the bot has been added to",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max number of guilds to return (max 200)",
          default: 100,
        },
        after: {
          type: "string",
          description: "Guild ID to paginate after",
        },
      },
    },
  },
  {
    name: "list_channels",
    description: "List channels in a guild",
    inputSchema: {
      type: "object",
      properties: {
        guild_id: {
          type: "string",
          description: "Guild (server) ID",
        },
      },
      required: ["guild_id"],
    },
  },
  {
    name: "get_channel_messages",
    description: "Get recent messages from a channel",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "Channel ID",
        },
        limit: {
          type: "number",
          description: "Number of messages to return (max 100)",
          default: 50,
        },
        before: {
          type: "string",
          description: "Get messages before this message ID",
        },
        after: {
          type: "string",
          description: "Get messages after this message ID",
        },
        around: {
          type: "string",
          description: "Get messages around this message ID",
        },
      },
      required: ["channel_id"],
    },
  },
  {
    name: "send_message",
    description: "Send a message to a Discord channel",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "Channel ID to send the message to",
        },
        content: {
          type: "string",
          description: "Message content (max 2000 characters)",
        },
        tts: {
          type: "boolean",
          description: "Whether this is a TTS message",
          default: false,
        },
        reply_to: {
          type: "string",
          description: "Message ID to reply to",
        },
      },
      required: ["channel_id", "content"],
    },
  },
  {
    name: "list_members",
    description: "List members of a guild",
    inputSchema: {
      type: "object",
      properties: {
        guild_id: {
          type: "string",
          description: "Guild (server) ID",
        },
        limit: {
          type: "number",
          description: "Max number of members to return (max 1000)",
          default: 100,
        },
        after: {
          type: "string",
          description: "User ID to paginate after",
        },
      },
      required: ["guild_id"],
    },
  },
  {
    name: "get_user",
    description: "Get information about a Discord user",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "User ID (or '@me' for the bot user)",
        },
      },
      required: ["user_id"],
    },
  },
  {
    name: "create_channel",
    description: "Create a new channel in a guild",
    inputSchema: {
      type: "object",
      properties: {
        guild_id: {
          type: "string",
          description: "Guild (server) ID",
        },
        name: {
          type: "string",
          description: "Channel name",
        },
        type: {
          type: "number",
          description:
            "Channel type (0=text, 2=voice, 4=category, 5=announcement, 13=stage, 15=forum)",
          default: 0,
        },
        topic: {
          type: "string",
          description: "Channel topic (max 1024 characters)",
        },
        parent_id: {
          type: "string",
          description: "Category channel ID to nest under",
        },
      },
      required: ["guild_id", "name"],
    },
  },
  {
    name: "search_messages",
    description:
      "Search messages in a guild using Discord's search functionality",
    inputSchema: {
      type: "object",
      properties: {
        guild_id: {
          type: "string",
          description: "Guild (server) ID to search in",
        },
        content: {
          type: "string",
          description: "Message content to search for",
        },
        author_id: {
          type: "string",
          description: "Filter by message author ID",
        },
        channel_id: {
          type: "string",
          description: "Filter by channel ID",
        },
        has: {
          type: "string",
          enum: ["link", "embed", "file", "video", "image", "sound"],
          description: "Filter by message content type",
        },
        limit: {
          type: "number",
          description: "Number of results (max 25)",
          default: 25,
        },
        offset: {
          type: "number",
          description: "Result offset for pagination",
          default: 0,
        },
      },
      required: ["guild_id"],
    },
  },
];
