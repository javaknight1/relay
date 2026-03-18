import type { MCPToolDefinition } from "@relay/shared";

export const braveTools: MCPToolDefinition[] = [
  {
    name: "web_search",
    description: "Search the web using Brave Search",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search query" },
        count: { type: "number", description: "Number of results (max 20)", default: 10 },
        offset: { type: "number", description: "Pagination offset", default: 0 },
        freshness: {
          type: "string",
          enum: ["pd", "pw", "pm", "py"],
          description: "Freshness filter: past day, week, month, year",
        },
      },
      required: ["q"],
    },
  },
  {
    name: "local_search",
    description: "Search for local businesses and places using Brave Local Search",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search query (e.g. 'pizza near me')" },
        count: { type: "number", description: "Number of results (max 20)", default: 5 },
      },
      required: ["q"],
    },
  },
];
