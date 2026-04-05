import type { MCPToolDefinition } from "@relay/shared";

export const sentryTools: MCPToolDefinition[] = [
  {
    name: "list_issues",
    description:
      "List issues (errors) for a Sentry project, ordered by last seen",
    inputSchema: {
      type: "object",
      properties: {
        project_slug: {
          type: "string",
          description: "Project slug (e.g. 'my-web-app')",
        },
        query: {
          type: "string",
          description:
            "Search query (Sentry search syntax, e.g. 'is:unresolved level:error')",
        },
        cursor: {
          type: "string",
          description: "Pagination cursor from previous response",
        },
      },
      required: ["project_slug"],
    },
  },
  {
    name: "get_issue",
    description: "Get full details of a Sentry issue by its ID",
    inputSchema: {
      type: "object",
      properties: {
        issue_id: {
          type: "string",
          description: "Sentry issue ID",
        },
      },
      required: ["issue_id"],
    },
  },
  {
    name: "list_events",
    description: "List events (occurrences) for a specific Sentry issue",
    inputSchema: {
      type: "object",
      properties: {
        issue_id: {
          type: "string",
          description: "Sentry issue ID",
        },
        full: {
          type: "boolean",
          description: "Include full event details",
          default: false,
        },
        cursor: {
          type: "string",
          description: "Pagination cursor",
        },
      },
      required: ["issue_id"],
    },
  },
  {
    name: "resolve_issue",
    description: "Resolve a Sentry issue (mark as resolved)",
    inputSchema: {
      type: "object",
      properties: {
        issue_id: {
          type: "string",
          description: "Sentry issue ID",
        },
        status: {
          type: "string",
          enum: ["resolved", "unresolved", "ignored"],
          description: "New status for the issue",
          default: "resolved",
        },
      },
      required: ["issue_id"],
    },
  },
  {
    name: "list_projects",
    description:
      "List all projects in the Sentry organization",
    inputSchema: {
      type: "object",
      properties: {
        cursor: {
          type: "string",
          description: "Pagination cursor",
        },
      },
    },
  },
  {
    name: "get_event",
    description: "Get full details of a specific event by event ID",
    inputSchema: {
      type: "object",
      properties: {
        project_slug: {
          type: "string",
          description: "Project slug",
        },
        event_id: {
          type: "string",
          description: "Event ID",
        },
      },
      required: ["project_slug", "event_id"],
    },
  },
  {
    name: "search_issues",
    description:
      "Search issues across all projects in the organization using Sentry search syntax",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query (e.g. 'is:unresolved assigned:me level:error')",
        },
        sort: {
          type: "string",
          enum: ["date", "new", "priority", "freq", "user"],
          description: "Sort order",
          default: "date",
        },
        cursor: {
          type: "string",
          description: "Pagination cursor",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_releases",
    description: "List releases for the Sentry organization or a specific project",
    inputSchema: {
      type: "object",
      properties: {
        project_slug: {
          type: "string",
          description: "Project slug (omit for all projects)",
        },
        cursor: {
          type: "string",
          description: "Pagination cursor",
        },
      },
    },
  },
];
