import type { MCPToolDefinition } from "@relay/shared";

export const airtableTools: MCPToolDefinition[] = [
  {
    name: "list_bases",
    description: "List all Airtable bases accessible to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_tables",
    description: "List all tables in an Airtable base with their fields and views",
    inputSchema: {
      type: "object",
      properties: {
        base_id: {
          type: "string",
          description: "Base ID (e.g. 'appXXXXXXXXXXXXXX')",
        },
      },
      required: ["base_id"],
    },
  },
  {
    name: "list_records",
    description:
      "List records from an Airtable table with optional filtering, sorting, and pagination",
    inputSchema: {
      type: "object",
      properties: {
        base_id: {
          type: "string",
          description: "Base ID",
        },
        table_name: {
          type: "string",
          description: "Table name or ID",
        },
        view: {
          type: "string",
          description: "View name or ID to filter by",
        },
        formula: {
          type: "string",
          description:
            "Airtable formula to filter records (e.g. \"{Status} = 'Active'\")",
        },
        sort_field: {
          type: "string",
          description: "Field name to sort by",
        },
        sort_direction: {
          type: "string",
          enum: ["asc", "desc"],
          description: "Sort direction",
          default: "asc",
        },
        max_records: {
          type: "number",
          description: "Maximum number of records to return",
          default: 100,
        },
        page_size: {
          type: "number",
          description: "Number of records per page (max 100)",
          default: 100,
        },
        offset: {
          type: "string",
          description: "Pagination offset from a previous response",
        },
      },
      required: ["base_id", "table_name"],
    },
  },
  {
    name: "get_record",
    description: "Get a single record by ID from an Airtable table",
    inputSchema: {
      type: "object",
      properties: {
        base_id: { type: "string", description: "Base ID" },
        table_name: { type: "string", description: "Table name or ID" },
        record_id: {
          type: "string",
          description: "Record ID (e.g. 'recXXXXXXXXXXXXXX')",
        },
      },
      required: ["base_id", "table_name", "record_id"],
    },
  },
  {
    name: "create_records",
    description:
      "Create one or more records in an Airtable table (max 10 per request)",
    inputSchema: {
      type: "object",
      properties: {
        base_id: { type: "string", description: "Base ID" },
        table_name: { type: "string", description: "Table name or ID" },
        records: {
          type: "array",
          description: "Array of records to create",
          items: {
            type: "object",
            properties: {
              fields: {
                type: "object",
                description: "Field name → value mapping",
              },
            },
            required: ["fields"],
          },
        },
        typecast: {
          type: "boolean",
          description:
            "If true, Airtable will try to convert string values to the appropriate cell type",
          default: false,
        },
      },
      required: ["base_id", "table_name", "records"],
    },
  },
  {
    name: "update_records",
    description:
      "Update one or more existing records in an Airtable table (max 10 per request)",
    inputSchema: {
      type: "object",
      properties: {
        base_id: { type: "string", description: "Base ID" },
        table_name: { type: "string", description: "Table name or ID" },
        records: {
          type: "array",
          description: "Array of records to update",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Record ID to update" },
              fields: {
                type: "object",
                description: "Field name → new value mapping",
              },
            },
            required: ["id", "fields"],
          },
        },
        typecast: {
          type: "boolean",
          description:
            "If true, Airtable will try to convert string values to the appropriate cell type",
          default: false,
        },
      },
      required: ["base_id", "table_name", "records"],
    },
  },
  {
    name: "delete_records",
    description: "Delete one or more records from an Airtable table (max 10 per request)",
    inputSchema: {
      type: "object",
      properties: {
        base_id: { type: "string", description: "Base ID" },
        table_name: { type: "string", description: "Table name or ID" },
        record_ids: {
          type: "array",
          items: { type: "string" },
          description: "Record IDs to delete",
        },
      },
      required: ["base_id", "table_name", "record_ids"],
    },
  },
  {
    name: "search_records",
    description:
      "Search records in an Airtable table by text query across specified fields",
    inputSchema: {
      type: "object",
      properties: {
        base_id: { type: "string", description: "Base ID" },
        table_name: { type: "string", description: "Table name or ID" },
        query: { type: "string", description: "Text to search for" },
        search_fields: {
          type: "string",
          description:
            "Comma-separated field names to search in (e.g. \"{Name},{Description}\"). Defaults to all fields.",
        },
        max_records: {
          type: "number",
          description: "Maximum results to return",
          default: 50,
        },
      },
      required: ["base_id", "table_name", "query"],
    },
  },
];
