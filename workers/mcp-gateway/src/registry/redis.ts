import type { MCPToolDefinition } from "@relay/shared";

export const redisTools: MCPToolDefinition[] = [
  {
    name: "get",
    description: "Get the value of a key",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Redis key" },
      },
      required: ["key"],
    },
  },
  {
    name: "set",
    description: "Set the value of a key with optional expiration",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Redis key" },
        value: { type: "string", description: "Value to set" },
        ex: {
          type: "number",
          description: "Expiration in seconds (optional)",
        },
      },
      required: ["key", "value"],
    },
  },
  {
    name: "delete",
    description: "Delete one or more keys",
    inputSchema: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description: "Redis key (or comma-separated keys) to delete",
        },
      },
      required: ["key"],
    },
  },
  {
    name: "list_keys",
    description: "Scan for keys matching a pattern (uses SCAN, not KEYS)",
    inputSchema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Glob-style pattern (e.g. 'user:*')",
          default: "*",
        },
        count: {
          type: "number",
          description: "Approximate number of keys to return per scan",
          default: 100,
        },
        cursor: {
          type: "string",
          description: "Cursor from a previous scan for pagination",
          default: "0",
        },
      },
    },
  },
  {
    name: "hget",
    description: "Get the value of a hash field",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Redis hash key" },
        field: { type: "string", description: "Hash field name" },
      },
      required: ["key", "field"],
    },
  },
  {
    name: "hset",
    description: "Set one or more hash fields",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Redis hash key" },
        fields: {
          type: "object",
          description: "Field-value pairs to set (e.g. { \"name\": \"Alice\" })",
        },
      },
      required: ["key", "fields"],
    },
  },
  {
    name: "lpush",
    description: "Prepend one or more values to a list",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Redis list key" },
        values: {
          type: "array",
          items: { type: "string" },
          description: "Values to prepend",
        },
      },
      required: ["key", "values"],
    },
  },
  {
    name: "lrange",
    description: "Get a range of elements from a list",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Redis list key" },
        start: {
          type: "number",
          description: "Start index (0-based)",
          default: 0,
        },
        stop: {
          type: "number",
          description: "Stop index (-1 for end of list)",
          default: -1,
        },
      },
      required: ["key"],
    },
  },
];
