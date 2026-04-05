import type { MCPToolDefinition } from "@relay/shared";

export const todoistTools: MCPToolDefinition[] = [
  {
    name: "list_tasks",
    description:
      "List active tasks, optionally filtered by project, label, or filter expression",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Filter by project ID",
        },
        label: {
          type: "string",
          description: "Filter by label name",
        },
        filter: {
          type: "string",
          description:
            "Todoist filter expression (e.g. 'today', 'overdue', 'priority 1')",
        },
      },
    },
  },
  {
    name: "get_task",
    description: "Get full details of a specific task",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "The task ID",
        },
      },
      required: ["task_id"],
    },
  },
  {
    name: "create_task",
    description: "Create a new task in Todoist",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Task content/title" },
        description: {
          type: "string",
          description: "Task description (Markdown)",
        },
        project_id: {
          type: "string",
          description: "Project ID to add the task to",
        },
        priority: {
          type: "number",
          description: "Priority (1=normal, 2=medium, 3=high, 4=urgent)",
          default: 1,
        },
        due_string: {
          type: "string",
          description:
            "Natural language due date (e.g. 'tomorrow', 'next Monday')",
        },
        due_date: {
          type: "string",
          description: "Due date (YYYY-MM-DD)",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Label names to add",
        },
        parent_id: {
          type: "string",
          description: "Parent task ID (to create a subtask)",
        },
        section_id: {
          type: "string",
          description: "Section ID to add the task to",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "update_task",
    description: "Update an existing Todoist task",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID to update" },
        content: { type: "string", description: "New task content/title" },
        description: {
          type: "string",
          description: "New description (Markdown)",
        },
        priority: {
          type: "number",
          description: "New priority (1-4)",
        },
        due_string: {
          type: "string",
          description: "New due date (natural language)",
        },
        due_date: {
          type: "string",
          description: "New due date (YYYY-MM-DD)",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "New labels (replaces existing)",
        },
      },
      required: ["task_id"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as completed (close it)",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "Task ID to complete",
        },
      },
      required: ["task_id"],
    },
  },
  {
    name: "list_projects",
    description: "List all projects in the user's Todoist account",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_project",
    description: "Create a new Todoist project",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
        parent_id: {
          type: "string",
          description: "Parent project ID (for nesting)",
        },
        color: {
          type: "string",
          description:
            "Color name (e.g. 'berry_red', 'blue', 'green', 'orange')",
        },
        is_favorite: {
          type: "boolean",
          description: "Whether to mark as favorite",
          default: false,
        },
        view_style: {
          type: "string",
          enum: ["list", "board"],
          description: "View style for the project",
          default: "list",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "add_comment",
    description: "Add a comment to a task or project",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "Task ID to comment on (provide this or project_id)",
        },
        project_id: {
          type: "string",
          description:
            "Project ID to comment on (provide this or task_id)",
        },
        content: {
          type: "string",
          description: "Comment content (Markdown)",
        },
      },
      required: ["content"],
    },
  },
];
