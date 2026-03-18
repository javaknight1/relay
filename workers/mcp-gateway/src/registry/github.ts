import type { MCPToolDefinition } from "@relay/shared";

export const githubTools: MCPToolDefinition[] = [
  {
    name: "list_repos",
    description: "List repositories for the authenticated user or a specific organization",
    inputSchema: {
      type: "object",
      properties: {
        org: { type: "string", description: "Organization name (omit for user repos)" },
        per_page: { type: "number", description: "Results per page (max 100)", default: 30 },
        page: { type: "number", description: "Page number", default: 1 },
      },
    },
  },
  {
    name: "get_repo",
    description: "Get details of a specific repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "list_issues",
    description: "List issues in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        state: { type: "string", enum: ["open", "closed", "all"], default: "open" },
        per_page: { type: "number", description: "Results per page (max 100)", default: 30 },
        page: { type: "number", description: "Page number", default: 1 },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "create_issue",
    description: "Create a new issue in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        title: { type: "string", description: "Issue title" },
        body: { type: "string", description: "Issue body (Markdown)" },
        labels: { type: "array", items: { type: "string" }, description: "Label names" },
        assignees: { type: "array", items: { type: "string" }, description: "Usernames to assign" },
      },
      required: ["owner", "repo", "title"],
    },
  },
  {
    name: "list_pull_requests",
    description: "List pull requests in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        state: { type: "string", enum: ["open", "closed", "all"], default: "open" },
        per_page: { type: "number", description: "Results per page (max 100)", default: 30 },
        page: { type: "number", description: "Page number", default: 1 },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "get_pull_request",
    description: "Get details of a specific pull request",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        pull_number: { type: "number", description: "Pull request number" },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "create_pull_request",
    description: "Create a new pull request",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        title: { type: "string", description: "PR title" },
        body: { type: "string", description: "PR body (Markdown)" },
        head: { type: "string", description: "Branch with changes" },
        base: { type: "string", description: "Branch to merge into" },
      },
      required: ["owner", "repo", "title", "head", "base"],
    },
  },
  {
    name: "get_file_contents",
    description: "Get the contents of a file or directory in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        path: { type: "string", description: "File or directory path" },
        ref: { type: "string", description: "Git ref (branch, tag, or SHA)" },
      },
      required: ["owner", "repo", "path"],
    },
  },
  {
    name: "search_code",
    description: "Search for code across repositories",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search query (GitHub code search syntax)" },
        per_page: { type: "number", description: "Results per page (max 100)", default: 30 },
        page: { type: "number", description: "Page number", default: 1 },
      },
      required: ["q"],
    },
  },
  {
    name: "list_branches",
    description: "List branches in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        per_page: { type: "number", description: "Results per page (max 100)", default: 30 },
        page: { type: "number", description: "Page number", default: 1 },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "list_commits",
    description: "List commits in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        sha: { type: "string", description: "Branch name or commit SHA to start listing from" },
        per_page: { type: "number", description: "Results per page (max 100)", default: 30 },
        page: { type: "number", description: "Page number", default: 1 },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "create_or_update_file",
    description: "Create or update a file in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        path: { type: "string", description: "File path" },
        message: { type: "string", description: "Commit message" },
        content: { type: "string", description: "File content (will be Base64-encoded)" },
        sha: { type: "string", description: "SHA of the file being replaced (required for updates)" },
        branch: { type: "string", description: "Branch name" },
      },
      required: ["owner", "repo", "path", "message", "content"],
    },
  },
];
