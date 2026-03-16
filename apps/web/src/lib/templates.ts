import type { LucideIcon } from "lucide-react";
import {
  Github,
  BookOpen,
  Search,
  MessageSquare,
  Database,
  FolderOpen,
} from "lucide-react";

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: "Developer Tools" | "Productivity" | "Search" | "Data";
  icon: LucideIcon;
  toolCount: number;
  comingSoon: boolean;
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
  },
  {
    id: "notion",
    name: "Notion",
    description: "Pages, databases, and blocks",
    category: "Productivity",
    icon: BookOpen,
    toolCount: 8,
    comingSoon: false,
  },
  {
    id: "brave",
    name: "Brave Search",
    description: "Web and news search",
    category: "Search",
    icon: Search,
    toolCount: 2,
    comingSoon: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Messages, channels, and threads",
    category: "Productivity",
    icon: MessageSquare,
    toolCount: 6,
    comingSoon: false,
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Queries, schemas, and analytics",
    category: "Data",
    icon: Database,
    toolCount: 4,
    comingSoon: false,
  },
  {
    id: "gdrive",
    name: "Google Drive",
    description: "Search, read, and organize files",
    category: "Productivity",
    icon: FolderOpen,
    toolCount: 6,
    comingSoon: true,
  },
];

export const CATEGORIES = [
  "All",
  "Developer Tools",
  "Productivity",
  "Search",
  "Data",
] as const;
