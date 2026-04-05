import type { MCPToolDefinition } from "@relay/shared";

export const gitlabTools: MCPToolDefinition[] = [
  {
    name: "list_projects",
    description:
      "List projects accessible to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        membership: {
          type: "boolean",
          description: "Limit to projects the user is a member of",
          default: true,
        },
        search: {
          type: "string",
          description: "Search query to filter projects by name",
        },
        per_page: {
          type: "number",
          description: "Results per page (max 100)",
          default: 20,
        },
        page: {
          type: "number",
          description: "Page number",
          default: 1,
        },
      },
    },
  },
  {
    name: "get_project",
    description: "Get details of a specific GitLab project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description:
            "Project ID (numeric) or URL-encoded path (e.g. 'my-group%2Fmy-project')",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "list_merge_requests",
    description: "List merge requests for a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Project ID or URL-encoded path",
        },
        state: {
          type: "string",
          enum: ["opened", "closed", "merged", "all"],
          default: "opened",
        },
        per_page: {
          type: "number",
          description: "Results per page (max 100)",
          default: 20,
        },
        page: {
          type: "number",
          description: "Page number",
          default: 1,
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_merge_request",
    description: "Get details of a specific merge request",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Project ID or URL-encoded path",
        },
        merge_request_iid: {
          type: "number",
          description: "Merge request internal ID",
        },
      },
      required: ["project_id", "merge_request_iid"],
    },
  },
  {
    name: "list_issues",
    description: "List issues for a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Project ID or URL-encoded path",
        },
        state: {
          type: "string",
          enum: ["opened", "closed", "all"],
          default: "opened",
        },
        labels: {
          type: "string",
          description: "Comma-separated label names to filter by",
        },
        per_page: {
          type: "number",
          description: "Results per page (max 100)",
          default: 20,
        },
        page: {
          type: "number",
          description: "Page number",
          default: 1,
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "create_issue",
    description: "Create a new issue in a GitLab project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Project ID or URL-encoded path",
        },
        title: { type: "string", description: "Issue title" },
        description: {
          type: "string",
          description: "Issue description (Markdown)",
        },
        labels: {
          type: "string",
          description: "Comma-separated label names",
        },
        assignee_ids: {
          type: "array",
          items: { type: "number" },
          description: "User IDs to assign",
        },
        milestone_id: {
          type: "number",
          description: "Milestone ID",
        },
      },
      required: ["project_id", "title"],
    },
  },
  {
    name: "list_pipelines",
    description: "List CI/CD pipelines for a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Project ID or URL-encoded path",
        },
        status: {
          type: "string",
          enum: [
            "running",
            "pending",
            "success",
            "failed",
            "canceled",
            "skipped",
            "manual",
          ],
          description: "Filter by pipeline status",
        },
        ref: {
          type: "string",
          description: "Filter by branch or tag name",
        },
        per_page: {
          type: "number",
          description: "Results per page (max 100)",
          default: 20,
        },
        page: {
          type: "number",
          description: "Page number",
          default: 1,
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_pipeline",
    description: "Get details of a specific pipeline",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Project ID or URL-encoded path",
        },
        pipeline_id: {
          type: "number",
          description: "Pipeline ID",
        },
      },
      required: ["project_id", "pipeline_id"],
    },
  },
  {
    name: "search_code",
    description:
      "Search for code across projects (requires Elasticsearch on self-hosted instances)",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Search query",
        },
        project_id: {
          type: "string",
          description: "Limit search to a specific project ID",
        },
        per_page: {
          type: "number",
          description: "Results per page (max 100)",
          default: 20,
        },
        page: {
          type: "number",
          description: "Page number",
          default: 1,
        },
      },
      required: ["search"],
    },
  },
  {
    name: "get_file",
    description: "Get the contents of a file from a repository",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Project ID or URL-encoded path",
        },
        file_path: {
          type: "string",
          description: "URL-encoded file path (e.g. 'src%2Findex.ts')",
        },
        ref: {
          type: "string",
          description: "Branch name, tag, or commit SHA",
          default: "main",
        },
      },
      required: ["project_id", "file_path"],
    },
  },
];
