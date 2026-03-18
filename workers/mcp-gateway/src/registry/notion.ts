import type { MCPToolDefinition } from "@relay/shared";

export const notionTools: MCPToolDefinition[] = [
  {
    name: "search",
    description: "Search pages and databases in the workspace",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query text" },
        filter: {
          type: "object",
          properties: {
            value: { type: "string", enum: ["page", "database"] },
            property: { type: "string", const: "object" },
          },
          description: "Filter by object type",
        },
        page_size: { type: "number", description: "Results per page (max 100)", default: 25 },
        start_cursor: { type: "string", description: "Pagination cursor" },
      },
    },
  },
  {
    name: "get_page",
    description: "Retrieve a page by ID",
    inputSchema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Notion page ID" },
      },
      required: ["page_id"],
    },
  },
  {
    name: "create_page",
    description: "Create a new page in a database or as a child of another page",
    inputSchema: {
      type: "object",
      properties: {
        parent_id: { type: "string", description: "Parent database or page ID" },
        parent_type: { type: "string", enum: ["database_id", "page_id"], description: "Type of parent" },
        title: { type: "string", description: "Page title" },
        properties: { type: "object", description: "Page properties (varies by database schema)" },
      },
      required: ["parent_id", "parent_type", "title"],
    },
  },
  {
    name: "update_page",
    description: "Update page properties",
    inputSchema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Notion page ID" },
        properties: { type: "object", description: "Properties to update" },
        archived: { type: "boolean", description: "Set to true to archive the page" },
      },
      required: ["page_id"],
    },
  },
  {
    name: "get_block_children",
    description: "Retrieve the children blocks of a block (page content)",
    inputSchema: {
      type: "object",
      properties: {
        block_id: { type: "string", description: "Block or page ID" },
        page_size: { type: "number", description: "Results per page (max 100)", default: 50 },
        start_cursor: { type: "string", description: "Pagination cursor" },
      },
      required: ["block_id"],
    },
  },
  {
    name: "append_block_children",
    description: "Append new content blocks to a page or block",
    inputSchema: {
      type: "object",
      properties: {
        block_id: { type: "string", description: "Block or page ID to append to" },
        children: {
          type: "array",
          items: { type: "object" },
          description: "Array of block objects to append",
        },
      },
      required: ["block_id", "children"],
    },
  },
  {
    name: "query_database",
    description: "Query a database with optional filters and sorts",
    inputSchema: {
      type: "object",
      properties: {
        database_id: { type: "string", description: "Database ID" },
        filter: { type: "object", description: "Filter conditions" },
        sorts: { type: "array", items: { type: "object" }, description: "Sort conditions" },
        page_size: { type: "number", description: "Results per page (max 100)", default: 50 },
        start_cursor: { type: "string", description: "Pagination cursor" },
      },
      required: ["database_id"],
    },
  },
  {
    name: "get_database",
    description: "Retrieve a database schema by ID",
    inputSchema: {
      type: "object",
      properties: {
        database_id: { type: "string", description: "Database ID" },
      },
      required: ["database_id"],
    },
  },
];
