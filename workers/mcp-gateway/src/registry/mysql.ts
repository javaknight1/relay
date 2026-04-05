import type { MCPToolDefinition } from "@relay/shared";

export const mysqlTools: MCPToolDefinition[] = [
  {
    name: "query",
    description:
      "Execute a read-only SQL query against the MySQL database via HTTP proxy",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "SQL query to execute (SELECT only)",
        },
        params: {
          type: "array",
          items: {},
          description: "Parameterized query values",
        },
      },
      required: ["sql"],
    },
  },
  {
    name: "list_tables",
    description: "List all tables in the MySQL database",
    inputSchema: {
      type: "object",
      properties: {
        schema: {
          type: "string",
          description: "Database/schema name (defaults to the connected database)",
        },
      },
    },
  },
  {
    name: "describe_table",
    description: "Get column names, types, and key info for a MySQL table",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string", description: "Table name" },
        schema: {
          type: "string",
          description: "Database/schema name (defaults to the connected database)",
        },
      },
      required: ["table"],
    },
  },
  {
    name: "list_schemas",
    description: "List all databases/schemas on the MySQL server",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];
