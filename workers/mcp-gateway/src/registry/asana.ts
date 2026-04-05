import type { MCPToolDefinition } from "@relay/shared";

export const asanaTools: MCPToolDefinition[] = [
  {
    name: "list_tasks",
    description:
      "List tasks in an Asana project, optionally filtered by assignee or completion status",
    inputSchema: {
      type: "object",
      properties: {
        project: {
          type: "string",
          description: "Project GID to list tasks from",
        },
        assignee: {
          type: "string",
          description: "Filter by assignee (user GID or 'me')",
        },
        completed_since: {
          type: "string",
          description:
            "Only return tasks completed since this time (ISO 8601). Use 'now' to only get incomplete tasks.",
        },
        opt_fields: {
          type: "string",
          description:
            "Comma-separated fields to include (e.g. 'name,assignee,due_on,completed')",
        },
        limit: {
          type: "number",
          description: "Results per page (max 100)",
          default: 50,
        },
        offset: {
          type: "string",
          description: "Pagination offset token",
        },
      },
      required: ["project"],
    },
  },
  {
    name: "get_task",
    description:
      "Get full details of a specific Asana task including description, assignee, and subtasks",
    inputSchema: {
      type: "object",
      properties: {
        task_gid: {
          type: "string",
          description: "The task GID",
        },
      },
      required: ["task_gid"],
    },
  },
  {
    name: "create_task",
    description: "Create a new task in an Asana project",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Task name" },
        projects: {
          type: "array",
          items: { type: "string" },
          description: "Project GIDs to add the task to",
        },
        assignee: {
          type: "string",
          description: "Assignee user GID or 'me'",
        },
        notes: {
          type: "string",
          description: "Task description (plain text)",
        },
        html_notes: {
          type: "string",
          description: "Task description (HTML)",
        },
        due_on: {
          type: "string",
          description: "Due date (YYYY-MM-DD)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tag GIDs to add",
        },
        parent: {
          type: "string",
          description: "Parent task GID (to create a subtask)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "update_task",
    description: "Update an existing Asana task",
    inputSchema: {
      type: "object",
      properties: {
        task_gid: { type: "string", description: "Task GID to update" },
        name: { type: "string", description: "New task name" },
        assignee: { type: "string", description: "New assignee user GID" },
        notes: { type: "string", description: "New description (plain text)" },
        due_on: { type: "string", description: "New due date (YYYY-MM-DD)" },
        completed: {
          type: "boolean",
          description: "Mark task as completed or incomplete",
        },
      },
      required: ["task_gid"],
    },
  },
  {
    name: "list_projects",
    description:
      "List projects in an Asana workspace",
    inputSchema: {
      type: "object",
      properties: {
        workspace: {
          type: "string",
          description: "Workspace GID",
        },
        archived: {
          type: "boolean",
          description: "Filter by archived status",
          default: false,
        },
        limit: {
          type: "number",
          description: "Results per page (max 100)",
          default: 50,
        },
        offset: {
          type: "string",
          description: "Pagination offset token",
        },
      },
      required: ["workspace"],
    },
  },
  {
    name: "get_project",
    description: "Get details of a specific Asana project",
    inputSchema: {
      type: "object",
      properties: {
        project_gid: {
          type: "string",
          description: "The project GID",
        },
      },
      required: ["project_gid"],
    },
  },
  {
    name: "search_tasks",
    description:
      "Search tasks in an Asana workspace using text matching and filters",
    inputSchema: {
      type: "object",
      properties: {
        workspace: {
          type: "string",
          description: "Workspace GID to search in",
        },
        text: {
          type: "string",
          description: "Text to search for in task names and descriptions",
        },
        assignee: {
          type: "string",
          description: "Filter by assignee (user GID or 'me')",
        },
        completed: {
          type: "boolean",
          description: "Filter by completion status",
        },
        projects: {
          type: "string",
          description: "Filter by project GID",
        },
        is_subtask: {
          type: "boolean",
          description: "Filter subtasks",
        },
      },
      required: ["workspace"],
    },
  },
  {
    name: "add_comment",
    description: "Add a comment (story) to an Asana task",
    inputSchema: {
      type: "object",
      properties: {
        task_gid: {
          type: "string",
          description: "Task GID to comment on",
        },
        text: {
          type: "string",
          description: "Comment text (plain text)",
        },
        html_text: {
          type: "string",
          description: "Comment text (HTML)",
        },
      },
      required: ["task_gid", "text"],
    },
  },
];
