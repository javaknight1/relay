import type { MCPToolDefinition } from "@relay/shared";

export const salesforceTools: MCPToolDefinition[] = [
  {
    name: "query",
    description: "Execute a SOQL query against Salesforce",
    inputSchema: {
      type: "object",
      properties: {
        soql: {
          type: "string",
          description: "SOQL query string (e.g. \"SELECT Id, Name FROM Account LIMIT 10\")",
        },
      },
      required: ["soql"],
    },
  },
  {
    name: "get_record",
    description: "Get a single Salesforce record by object type and ID",
    inputSchema: {
      type: "object",
      properties: {
        object_type: { type: "string", description: "Salesforce object type (e.g. 'Account', 'Contact')" },
        record_id: { type: "string", description: "Record ID (18-character Salesforce ID)" },
        fields: {
          type: "string",
          description: "Comma-separated list of fields to return (omit for all accessible fields)",
        },
      },
      required: ["object_type", "record_id"],
    },
  },
  {
    name: "create_record",
    description: "Create a new Salesforce record",
    inputSchema: {
      type: "object",
      properties: {
        object_type: { type: "string", description: "Salesforce object type (e.g. 'Account', 'Contact')" },
        fields: {
          type: "object",
          description: "Field name-value pairs for the new record",
        },
      },
      required: ["object_type", "fields"],
    },
  },
  {
    name: "update_record",
    description: "Update an existing Salesforce record",
    inputSchema: {
      type: "object",
      properties: {
        object_type: { type: "string", description: "Salesforce object type (e.g. 'Account', 'Contact')" },
        record_id: { type: "string", description: "Record ID to update" },
        fields: {
          type: "object",
          description: "Field name-value pairs to update",
        },
      },
      required: ["object_type", "record_id", "fields"],
    },
  },
  {
    name: "list_objects",
    description: "List all available Salesforce object types (sObjects)",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "describe_object",
    description: "Get metadata and field definitions for a Salesforce object type",
    inputSchema: {
      type: "object",
      properties: {
        object_type: { type: "string", description: "Salesforce object type (e.g. 'Account', 'Contact')" },
      },
      required: ["object_type"],
    },
  },
  {
    name: "search",
    description: "Execute a SOSL search across Salesforce objects",
    inputSchema: {
      type: "object",
      properties: {
        sosl: {
          type: "string",
          description: "SOSL search string (e.g. \"FIND {Acme} IN ALL FIELDS RETURNING Account(Id, Name)\")",
        },
      },
      required: ["sosl"],
    },
  },
  {
    name: "list_reports",
    description: "List available Salesforce reports",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_report",
    description: "Run a Salesforce report and get results",
    inputSchema: {
      type: "object",
      properties: {
        report_id: { type: "string", description: "Report ID" },
      },
      required: ["report_id"],
    },
  },
  {
    name: "list_dashboards",
    description: "List available Salesforce dashboards",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];
