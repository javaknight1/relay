import type { MCPToolDefinition } from "@relay/shared";

export const postgresTools: MCPToolDefinition[] = [
  {
    name: "query",
    description: "Execute a read-only SQL query against the database",
    inputSchema: {
      type: "object",
      properties: {
        sql: { type: "string", description: "SQL query to execute (SELECT only)" },
        params: {
          type: "array",
          items: {},
          description: "Parameterized query values ($1, $2, ...)",
        },
      },
      required: ["sql"],
    },
  },
  {
    name: "list_tables",
    description: "List all tables in the database with their schemas",
    inputSchema: {
      type: "object",
      properties: {
        schema: { type: "string", description: "Schema name", default: "public" },
      },
    },
  },
  {
    name: "describe_table",
    description: "Get column names, types, and constraints for a table",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string", description: "Table name" },
        schema: { type: "string", description: "Schema name", default: "public" },
      },
      required: ["table"],
    },
  },
  {
    name: "execute",
    description: "Execute a write SQL statement (INSERT, UPDATE, DELETE)",
    inputSchema: {
      type: "object",
      properties: {
        sql: { type: "string", description: "SQL statement to execute" },
        params: {
          type: "array",
          items: {},
          description: "Parameterized query values ($1, $2, ...)",
        },
      },
      required: ["sql"],
    },
  },
];
