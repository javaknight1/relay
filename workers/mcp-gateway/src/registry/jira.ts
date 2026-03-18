import type { MCPToolDefinition } from "@relay/shared";

export const jiraTools: MCPToolDefinition[] = [
  {
    name: "search_issues",
    description:
      "Search for Jira issues using JQL (Jira Query Language)",
    inputSchema: {
      type: "object",
      properties: {
        jql: {
          type: "string",
          description:
            'JQL query (e.g. \'project = "ENG" AND status = "In Progress"\'). Defaults to recently updated.',
        },
        max_results: {
          type: "number",
          description: "Maximum results to return (max 100)",
          default: 50,
        },
        start_at: {
          type: "number",
          description: "Index of first result for pagination",
          default: 0,
        },
      },
    },
  },
  {
    name: "get_issue",
    description:
      "Get full details of a Jira issue including description, comments, and status",
    inputSchema: {
      type: "object",
      properties: {
        issue_key: {
          type: "string",
          description: "Issue key (e.g. 'ENG-123')",
        },
      },
      required: ["issue_key"],
    },
  },
  {
    name: "create_issue",
    description: "Create a new Jira issue",
    inputSchema: {
      type: "object",
      properties: {
        project_key: {
          type: "string",
          description: "Project key (e.g. 'ENG')",
        },
        summary: { type: "string", description: "Issue summary/title" },
        issue_type: {
          type: "string",
          description: "Issue type (e.g. 'Task', 'Bug', 'Story')",
          default: "Task",
        },
        description: {
          type: "string",
          description: "Issue description (plain text)",
        },
        priority: {
          type: "string",
          description: "Priority name (e.g. 'High', 'Medium', 'Low')",
        },
        assignee_id: {
          type: "string",
          description: "Assignee account ID",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to apply",
        },
        parent_key: {
          type: "string",
          description: "Parent issue key for sub-tasks",
        },
      },
      required: ["project_key", "summary"],
    },
  },
  {
    name: "update_issue",
    description: "Update fields on an existing Jira issue",
    inputSchema: {
      type: "object",
      properties: {
        issue_key: {
          type: "string",
          description: "Issue key (e.g. 'ENG-123')",
        },
        summary: { type: "string", description: "New summary" },
        description: { type: "string", description: "New description (plain text)" },
        priority: { type: "string", description: "New priority name" },
        assignee_id: {
          type: "string",
          description: "New assignee account ID",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "New labels (replaces existing)",
        },
      },
      required: ["issue_key"],
    },
  },
  {
    name: "transition_issue",
    description:
      "Transition a Jira issue to a new status (e.g. move to 'In Progress' or 'Done'). Use get_transitions to find valid transition IDs.",
    inputSchema: {
      type: "object",
      properties: {
        issue_key: {
          type: "string",
          description: "Issue key (e.g. 'ENG-123')",
        },
        transition_id: {
          type: "string",
          description: "Transition ID (use get_transitions to find valid IDs)",
        },
      },
      required: ["issue_key", "transition_id"],
    },
  },
  {
    name: "add_comment",
    description: "Add a comment to a Jira issue",
    inputSchema: {
      type: "object",
      properties: {
        issue_key: {
          type: "string",
          description: "Issue key (e.g. 'ENG-123')",
        },
        body: {
          type: "string",
          description: "Comment body (plain text)",
        },
      },
      required: ["issue_key", "body"],
    },
  },
  {
    name: "list_projects",
    description: "List Jira projects accessible to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        max_results: {
          type: "number",
          description: "Maximum results to return",
          default: 50,
        },
        start_at: {
          type: "number",
          description: "Index of first result for pagination",
          default: 0,
        },
      },
    },
  },
  {
    name: "get_transitions",
    description:
      "Get available status transitions for an issue. Use this to find valid transition IDs before calling transition_issue.",
    inputSchema: {
      type: "object",
      properties: {
        issue_key: {
          type: "string",
          description: "Issue key (e.g. 'ENG-123')",
        },
      },
      required: ["issue_key"],
    },
  },
];
