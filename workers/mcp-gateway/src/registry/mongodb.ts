import type { MCPToolDefinition } from "@relay/shared";

export const mongodbTools: MCPToolDefinition[] = [
  {
    name: "list_databases",
    description: "List all databases in the MongoDB cluster",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_collections",
    description: "List all collections in a database",
    inputSchema: {
      type: "object",
      properties: {
        database: {
          type: "string",
          description: "Database name (defaults to the configured database)",
        },
      },
    },
  },
  {
    name: "find_documents",
    description:
      "Find documents in a collection with optional filter, projection, sort, and limit",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Collection name" },
        database: {
          type: "string",
          description: "Database name (defaults to the configured database)",
        },
        filter: {
          type: "object",
          description: "MongoDB query filter (e.g. { \"status\": \"active\" })",
        },
        projection: {
          type: "object",
          description: "Fields to include or exclude (e.g. { \"name\": 1 })",
        },
        sort: {
          type: "object",
          description: "Sort order (e.g. { \"createdAt\": -1 })",
        },
        limit: {
          type: "number",
          description: "Maximum number of documents to return",
          default: 50,
        },
      },
      required: ["collection"],
    },
  },
  {
    name: "insert_document",
    description: "Insert a single document into a collection",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Collection name" },
        database: {
          type: "string",
          description: "Database name (defaults to the configured database)",
        },
        document: {
          type: "object",
          description: "Document to insert",
        },
      },
      required: ["collection", "document"],
    },
  },
  {
    name: "update_documents",
    description: "Update documents in a collection matching a filter",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Collection name" },
        database: {
          type: "string",
          description: "Database name (defaults to the configured database)",
        },
        filter: {
          type: "object",
          description: "MongoDB query filter to match documents",
        },
        update: {
          type: "object",
          description:
            "Update operations (e.g. { \"$set\": { \"status\": \"done\" } })",
        },
        upsert: {
          type: "boolean",
          description: "Insert a document if no match is found",
          default: false,
        },
      },
      required: ["collection", "filter", "update"],
    },
  },
  {
    name: "delete_documents",
    description: "Delete documents in a collection matching a filter",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Collection name" },
        database: {
          type: "string",
          description: "Database name (defaults to the configured database)",
        },
        filter: {
          type: "object",
          description: "MongoDB query filter to match documents to delete",
        },
      },
      required: ["collection", "filter"],
    },
  },
  {
    name: "aggregate",
    description: "Run an aggregation pipeline on a collection",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Collection name" },
        database: {
          type: "string",
          description: "Database name (defaults to the configured database)",
        },
        pipeline: {
          type: "array",
          items: { type: "object" },
          description:
            "Aggregation pipeline stages (e.g. [{ \"$match\": {} }, { \"$group\": {} }])",
        },
      },
      required: ["collection", "pipeline"],
    },
  },
  {
    name: "create_index",
    description: "Create an index on a collection",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Collection name" },
        database: {
          type: "string",
          description: "Database name (defaults to the configured database)",
        },
        keys: {
          type: "object",
          description: "Index key specification (e.g. { \"email\": 1 })",
        },
        unique: {
          type: "boolean",
          description: "Whether the index should enforce uniqueness",
          default: false,
        },
        name: {
          type: "string",
          description: "Optional index name",
        },
      },
      required: ["collection", "keys"],
    },
  },
];
