import type { Metadata } from "next";
import Link from "next/link";
import {
  Github,
  BookOpen,
  MessageSquare,
  Search,
  Database,
  FolderOpen,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Getting Started — Relay Docs",
  description:
    "Get started with Relay managed MCP hosting. Learn how to sign up, deploy your first server, and connect it to your AI client.",
};

const INTEGRATION_LINKS = [
  { label: "GitHub", href: "/docs/github", icon: Github },
  { label: "Notion", href: "/docs/notion", icon: BookOpen },
  { label: "Slack", href: "/docs/slack", icon: MessageSquare },
  { label: "Brave Search", href: "/docs/brave-search", icon: Search },
  { label: "PostgreSQL", href: "/docs/postgresql", icon: Database },
  { label: "Google Drive", href: "/docs/google-drive", icon: FolderOpen },
];

export default function DocsGettingStarted() {
  return (
    <>
      <h1>Getting Started</h1>
      <p>
        Relay is a managed MCP (Model Context Protocol) hosting platform. It
        lets you deploy pre-configured MCP servers in minutes -- no Docker, no
        CLI, no infrastructure to manage. Your AI clients (Claude Desktop,
        Cursor, ChatGPT, and others) connect to your Relay endpoint and gain
        access to real tools like GitHub, Notion, Slack, and more.
      </p>

      <h2>What is MCP?</h2>
      <p>
        The <strong>Model Context Protocol (MCP)</strong> is an open standard
        that lets AI assistants call external tools. Instead of copy-pasting
        data into a chat window, your AI client can directly search GitHub
        issues, query a database, or send a Slack message -- all through a
        secure, structured protocol.
      </p>
      <p>
        Relay hosts MCP servers for you so you don&apos;t have to run anything
        locally. You pick a template, enter your API credentials, and get a
        live endpoint URL.
      </p>

      <h2>Quick start in 3 steps</h2>

      <h3>Step 1: Sign up</h3>
      <p>
        Create a free Relay account at{" "}
        <Link href="/sign-up">relay.app/sign-up</Link>. You can sign up with
        your email or a social login.
      </p>

      <h3>Step 2: Deploy your first server</h3>
      <ol>
        <li>
          Go to your <Link href="/dashboard">Dashboard</Link> and click{" "}
          <strong>New Server</strong>.
        </li>
        <li>
          Choose a template (for example, <strong>GitHub</strong>).
        </li>
        <li>
          Enter the required credentials (such as a GitHub Personal Access
          Token).
        </li>
        <li>
          Click <strong>Deploy</strong>. Your MCP server will be live in
          seconds.
        </li>
      </ol>

      <h3>Step 3: Connect your AI client</h3>
      <p>
        Once deployed, Relay gives you a unique endpoint URL. Add it to your
        AI client&apos;s MCP configuration. Here is an example for{" "}
        <strong>Claude Desktop</strong>:
      </p>
      <pre>
        <code>{`{
  "mcpServers": {
    "github": {
      "transport": "sse",
      "url": "https://relay.app/mcp/your-server-id"
    }
  }
}`}</code>
      </pre>
      <p>
        For <strong>Cursor</strong>, open Settings, go to the MCP tab, and
        paste your endpoint URL.
      </p>
      <p>
        After connecting, your AI assistant can call the tools exposed by your
        MCP server. Try asking it to &quot;list my open GitHub issues&quot; or
        &quot;search my Notion workspace.&quot;
      </p>

      <h2>Core concepts</h2>

      <h3>Servers</h3>
      <p>
        A <strong>server</strong> is a running instance of an MCP template. Each
        server has its own endpoint URL, its own set of credentials, and its own
        tool configuration. You can have multiple servers of the same template
        (for example, one GitHub server per organization).
      </p>

      <h3>Templates</h3>
      <p>
        A <strong>template</strong> is a pre-built MCP server definition. Relay
        provides templates for popular services like GitHub, Notion, Slack, and
        more. Each template defines which tools are available and what
        credentials are required.
      </p>

      <h3>Tools</h3>
      <p>
        <strong>Tools</strong> are the individual actions your AI client can
        perform through MCP. For example, the GitHub template includes tools
        like <code>list_issues</code>, <code>search_code</code>, and{" "}
        <code>create_issue</code>. You can enable or disable individual tools
        per server from your dashboard.
      </p>

      <h3>Credentials</h3>
      <p>
        Each server requires credentials to access the underlying service (such
        as an API key or OAuth token). Relay encrypts all credentials with
        AES-256 at rest and never exposes them to clients. Your credentials are
        only used server-side when the MCP server processes a tool call.
      </p>

      <h2>Integration guides</h2>
      <p>
        Dive into the detailed setup guides for each supported integration:
      </p>

      <div className="not-prose mt-4 grid gap-3 sm:grid-cols-2">
        {INTEGRATION_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              <Icon className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-brand-500" />
              {link.label}
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-brand-400" />
            </Link>
          );
        })}
      </div>

      <h2>Need help?</h2>
      <p>
        Check the <Link href="/docs/faq">FAQ</Link> for answers to common
        questions. If you need further assistance, reach out to us through the
        dashboard support channel.
      </p>
    </>
  );
}
