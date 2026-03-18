import type { MCPToolDefinition } from "@relay/shared";

export const linearTools: MCPToolDefinition[] = [
  {
    name: "list_issues",
    description:
      "List issues in Linear, optionally filtered by team, status, or assignee",
    inputSchema: {
      type: "object",
      properties: {
        team_key: {
          type: "string",
          description: "Team key to filter by (e.g. 'ENG')",
        },
        status: {
          type: "string",
          description: "Filter by workflow state name (e.g. 'In Progress', 'Todo')",
        },
        assignee: {
          type: "string",
          description: "Filter by assignee name (case-insensitive partial match)",
        },
        first: {
          type: "number",
          description: "Number of issues to return (max 250)",
          default: 50,
        },
        after: {
          type: "string",
          description: "Cursor for pagination",
        },
      },
    },
  },
  {
    name: "get_issue",
    description:
      "Get full details of a Linear issue including description, comments, and sub-issues",
    inputSchema: {
      type: "object",
      properties: {
        issue_id: {
          type: "string",
          description: "The issue UUID or identifier (e.g. 'ENG-123')",
        },
      },
      required: ["issue_id"],
    },
  },
  {
    name: "create_issue",
    description: "Create a new issue in Linear",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Issue title" },
        team_id: { type: "string", description: "Team UUID to create the issue in" },
        description: {
          type: "string",
          description: "Issue description (Markdown)",
        },
        priority: {
          type: "number",
          description: "Priority (0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low)",
        },
        assignee_id: { type: "string", description: "Assignee user UUID" },
        state_id: { type: "string", description: "Workflow state UUID" },
        parent_id: { type: "string", description: "Parent issue UUID (for sub-issues)" },
        estimate: { type: "number", description: "Point estimate" },
        label_ids: {
          type: "array",
          items: { type: "string" },
          description: "Label UUIDs to apply",
        },
      },
      required: ["title", "team_id"],
    },
  },
  {
    name: "update_issue",
    description: "Update an existing Linear issue",
    inputSchema: {
      type: "object",
      properties: {
        issue_id: { type: "string", description: "Issue UUID to update" },
        title: { type: "string", description: "New title" },
        description: { type: "string", description: "New description (Markdown)" },
        priority: { type: "number", description: "New priority (0-4)" },
        assignee_id: { type: "string", description: "New assignee user UUID" },
        state_id: { type: "string", description: "New workflow state UUID" },
        estimate: { type: "number", description: "New point estimate" },
      },
      required: ["issue_id"],
    },
  },
  {
    name: "list_teams",
    description:
      "List all teams in the workspace with their workflow states, labels, and members",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "search_issues",
    description: "Search issues by text query across all teams",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query text" },
        first: {
          type: "number",
          description: "Number of results to return",
          default: 20,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "add_comment",
    description: "Add a comment to a Linear issue",
    inputSchema: {
      type: "object",
      properties: {
        issue_id: { type: "string", description: "Issue UUID to comment on" },
        body: { type: "string", description: "Comment body (Markdown)" },
      },
      required: ["issue_id", "body"],
    },
  },
  {
    name: "list_projects",
    description: "List projects in Linear with progress, lead, and timeline info",
    inputSchema: {
      type: "object",
      properties: {
        first: {
          type: "number",
          description: "Number of projects to return",
          default: 50,
        },
      },
    },
  },
];
