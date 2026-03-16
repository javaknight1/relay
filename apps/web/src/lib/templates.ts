import type { LucideIcon } from "lucide-react";
import {
  Github,
  BookOpen,
  Search,
  MessageSquare,
  Database,
  FolderOpen,
} from "lucide-react";

// ── Credential field definition ─────────────────────────────

export interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password" | "textarea";
  placeholder?: string;
  hint?: string;
  required: boolean;
}

// ── Tool definition ─────────────────────────────────────────

export interface ToolInfo {
  name: string;
  description: string;
  enabledByDefault: boolean;
}

// ── Template definition ─────────────────────────────────────

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: "Developer Tools" | "Productivity" | "Search" | "Data";
  icon: LucideIcon;
  toolCount: number;
  comingSoon: boolean;
  credentialFields: CredentialField[];
  credentialHelpUrl: string;
  credentialHelpLabel: string;
  tools: ToolInfo[];
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Repos, issues, PRs, and code search",
    category: "Developer Tools",
    icon: Github,
    toolCount: 12,
    comingSoon: false,
    credentialFields: [
      {
        key: "personal_access_token",
        label: "Personal Access Token",
        type: "password",
        placeholder: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        hint: "Requires scopes: repo, read:user",
        required: true,
      },
    ],
    credentialHelpUrl: "https://github.com/settings/tokens/new",
    credentialHelpLabel: "Create a GitHub token",
    tools: [
      { name: "list_issues", description: "List issues in a repository", enabledByDefault: true },
      { name: "get_issue", description: "Get a single issue by number", enabledByDefault: true },
      { name: "create_issue", description: "Create a new issue", enabledByDefault: true },
      { name: "update_issue", description: "Update an existing issue", enabledByDefault: true },
      { name: "list_pull_requests", description: "List pull requests", enabledByDefault: true },
      { name: "get_pull_request", description: "Get a single pull request", enabledByDefault: true },
      { name: "list_repositories", description: "List your repositories", enabledByDefault: true },
      { name: "get_repository", description: "Get repository details", enabledByDefault: true },
      { name: "search_issues", description: "Search issues and PRs", enabledByDefault: true },
      { name: "search_code", description: "Search code across repos", enabledByDefault: true },
      { name: "get_file_contents", description: "Read a file from a repo", enabledByDefault: true },
      { name: "push_files", description: "Push files to a repo", enabledByDefault: false },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Pages, databases, and blocks",
    category: "Productivity",
    icon: BookOpen,
    toolCount: 8,
    comingSoon: false,
    credentialFields: [
      {
        key: "integration_token",
        label: "Integration Token",
        type: "password",
        placeholder: "ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        hint: "Create an internal integration in your Notion workspace",
        required: true,
      },
    ],
    credentialHelpUrl: "https://www.notion.so/my-integrations",
    credentialHelpLabel: "Create a Notion integration",
    tools: [
      { name: "search", description: "Search pages and databases", enabledByDefault: true },
      { name: "get_page", description: "Get a page by ID", enabledByDefault: true },
      { name: "get_page_content", description: "Get page content blocks", enabledByDefault: true },
      { name: "create_page", description: "Create a new page", enabledByDefault: true },
      { name: "update_page", description: "Update page properties", enabledByDefault: true },
      { name: "query_database", description: "Query a database", enabledByDefault: true },
      { name: "get_database", description: "Get database schema", enabledByDefault: true },
      { name: "create_database_entry", description: "Add a database entry", enabledByDefault: true },
    ],
  },
  {
    id: "brave",
    name: "Brave Search",
    description: "Web and news search",
    category: "Search",
    icon: Search,
    toolCount: 2,
    comingSoon: false,
    credentialFields: [
      {
        key: "api_key",
        label: "API Key",
        type: "password",
        placeholder: "BSA...",
        hint: "Get a free API key from the Brave Search API dashboard",
        required: true,
      },
    ],
    credentialHelpUrl: "https://brave.com/search/api/",
    credentialHelpLabel: "Get a Brave Search API key",
    tools: [
      { name: "web_search", description: "Search the web", enabledByDefault: true },
      { name: "news_search", description: "Search recent news", enabledByDefault: true },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Messages, channels, and threads",
    category: "Productivity",
    icon: MessageSquare,
    toolCount: 6,
    comingSoon: false,
    credentialFields: [
      {
        key: "bot_token",
        label: "Bot Token",
        type: "password",
        placeholder: "xoxb-...",
        hint: "OAuth scopes: channels:read, chat:write, search:read, users:read",
        required: true,
      },
    ],
    credentialHelpUrl: "https://api.slack.com/apps",
    credentialHelpLabel: "Create a Slack app",
    tools: [
      { name: "list_channels", description: "List workspace channels", enabledByDefault: true },
      { name: "get_channel_history", description: "Get channel messages", enabledByDefault: true },
      { name: "send_message", description: "Send a message to a channel", enabledByDefault: true },
      { name: "search_messages", description: "Search messages", enabledByDefault: true },
      { name: "get_user_info", description: "Get user profile info", enabledByDefault: true },
      { name: "list_users", description: "List workspace members", enabledByDefault: true },
    ],
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Queries, schemas, and analytics",
    category: "Data",
    icon: Database,
    toolCount: 4,
    comingSoon: false,
    credentialFields: [
      {
        key: "connection_string",
        label: "Connection String",
        type: "password",
        placeholder: "postgresql://user:password@host:5432/dbname",
        hint: "Use a read-only user for safety",
        required: true,
      },
    ],
    credentialHelpUrl: "https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING",
    credentialHelpLabel: "Connection string format",
    tools: [
      { name: "query", description: "Execute a SQL query (read-only)", enabledByDefault: true },
      { name: "list_tables", description: "List all tables", enabledByDefault: true },
      { name: "describe_table", description: "Describe a table schema", enabledByDefault: true },
      { name: "list_schemas", description: "List database schemas", enabledByDefault: true },
    ],
  },
  {
    id: "gdrive",
    name: "Google Drive",
    description: "Search, read, and organize files",
    category: "Productivity",
    icon: FolderOpen,
    toolCount: 6,
    comingSoon: true,
    credentialFields: [],
    credentialHelpUrl: "",
    credentialHelpLabel: "",
    tools: [],
  },
];

export const CATEGORIES = [
  "All",
  "Developer Tools",
  "Productivity",
  "Search",
  "Data",
] as const;
