import type { MCPToolDefinition } from "@relay/shared";

export const confluenceTools: MCPToolDefinition[] = [
  {
    name: "search_content",
    description:
      "Search for Confluence content using CQL (Confluence Query Language)",
    inputSchema: {
      type: "object",
      properties: {
        cql: {
          type: "string",
          description:
            'CQL query (e.g. \'type=page AND text~"release notes"\')',
        },
        limit: {
          type: "number",
          description: "Maximum results to return (max 100)",
          default: 25,
        },
        start: {
          type: "number",
          description: "Starting index for pagination",
          default: 0,
        },
      },
      required: ["cql"],
    },
  },
  {
    name: "get_page",
    description:
      "Get a Confluence page by ID, including its body content",
    inputSchema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description: "Page ID",
        },
        expand: {
          type: "string",
          description:
            "Comma-separated expansions (e.g. 'body.storage,version,space')",
          default: "body.storage,version,space",
        },
      },
      required: ["page_id"],
    },
  },
  {
    name: "create_page",
    description: "Create a new Confluence page in a space",
    inputSchema: {
      type: "object",
      properties: {
        space_key: {
          type: "string",
          description: "Space key (e.g. 'ENG')",
        },
        title: {
          type: "string",
          description: "Page title",
        },
        body: {
          type: "string",
          description: "Page body in Confluence storage format (XHTML)",
        },
        parent_id: {
          type: "string",
          description: "Parent page ID (omit to create at space root)",
        },
      },
      required: ["space_key", "title", "body"],
    },
  },
  {
    name: "update_page",
    description: "Update an existing Confluence page",
    inputSchema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description: "Page ID",
        },
        title: {
          type: "string",
          description: "New page title",
        },
        body: {
          type: "string",
          description: "New page body in Confluence storage format (XHTML)",
        },
        version_number: {
          type: "number",
          description:
            "Current version number (required — incremented automatically). Use get_page to find this.",
        },
      },
      required: ["page_id", "title", "body", "version_number"],
    },
  },
  {
    name: "list_spaces",
    description:
      "List Confluence spaces accessible to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["global", "personal"],
          description: "Filter by space type",
        },
        limit: {
          type: "number",
          description: "Maximum results to return",
          default: 25,
        },
        start: {
          type: "number",
          description: "Starting index for pagination",
          default: 0,
        },
      },
    },
  },
  {
    name: "get_space",
    description: "Get details of a Confluence space by key",
    inputSchema: {
      type: "object",
      properties: {
        space_key: {
          type: "string",
          description: "Space key (e.g. 'ENG')",
        },
        expand: {
          type: "string",
          description:
            "Comma-separated expansions (e.g. 'description.plain,homepage')",
          default: "description.plain,homepage",
        },
      },
      required: ["space_key"],
    },
  },
  {
    name: "get_page_children",
    description: "Get child pages of a Confluence page",
    inputSchema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description: "Parent page ID",
        },
        limit: {
          type: "number",
          description: "Maximum results to return",
          default: 25,
        },
        start: {
          type: "number",
          description: "Starting index for pagination",
          default: 0,
        },
      },
      required: ["page_id"],
    },
  },
  {
    name: "add_comment",
    description: "Add a comment to a Confluence page",
    inputSchema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description: "Page ID to comment on",
        },
        body: {
          type: "string",
          description: "Comment body in Confluence storage format (XHTML)",
        },
      },
      required: ["page_id", "body"],
    },
  },
];
