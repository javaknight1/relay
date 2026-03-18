import type { MCPToolDefinition } from "@relay/shared";

export const slackTools: MCPToolDefinition[] = [
  {
    name: "list_channels",
    description: "List public and private channels in the workspace",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Maximum channels to return (max 1000)", default: 100 },
        cursor: { type: "string", description: "Pagination cursor" },
        types: {
          type: "string",
          description: "Comma-separated channel types (public_channel, private_channel)",
          default: "public_channel",
        },
      },
    },
  },
  {
    name: "post_message",
    description: "Send a message to a channel or DM",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID or name" },
        text: { type: "string", description: "Message text (supports Slack Markdown)" },
        thread_ts: { type: "string", description: "Thread timestamp to reply in a thread" },
      },
      required: ["channel", "text"],
    },
  },
  {
    name: "get_channel_history",
    description: "Fetch recent messages from a channel",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        limit: { type: "number", description: "Number of messages (max 1000)", default: 20 },
        oldest: { type: "string", description: "Only messages after this timestamp" },
        latest: { type: "string", description: "Only messages before this timestamp" },
      },
      required: ["channel"],
    },
  },
  {
    name: "search_messages",
    description: "Search for messages across the workspace",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        count: { type: "number", description: "Number of results (max 100)", default: 20 },
        sort: { type: "string", enum: ["score", "timestamp"], default: "score" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_thread_replies",
    description: "Get replies in a message thread",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        ts: { type: "string", description: "Timestamp of the parent message" },
        limit: { type: "number", description: "Number of replies (max 1000)", default: 50 },
      },
      required: ["channel", "ts"],
    },
  },
  {
    name: "list_users",
    description: "List members of the workspace",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Maximum users to return (max 1000)", default: 100 },
        cursor: { type: "string", description: "Pagination cursor" },
      },
    },
  },
];
