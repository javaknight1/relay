import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Relay Docs",
  description:
    "Frequently asked questions about Relay managed MCP hosting. Learn about MCP, security, supported AI clients, and billing.",
};

const FAQS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What is MCP?",
    answer: (
      <>
        <p>
          MCP stands for <strong>Model Context Protocol</strong>. It is an open
          standard that allows AI assistants to call external tools and access
          data sources through a structured, secure interface. Think of it as a
          universal plugin system for AI -- your AI client connects to an MCP
          server, discovers which tools are available, and can call them on your
          behalf.
        </p>
        <p>
          For example, with an MCP-connected GitHub server, your AI assistant
          can list issues, search code, and create pull requests -- all within
          the chat interface.
        </p>
      </>
    ),
  },
  {
    question: "Is my data safe?",
    answer: (
      <>
        <p>
          Yes. Security is a core part of Relay&apos;s architecture:
        </p>
        <ul>
          <li>
            <strong>Encryption at rest:</strong> All credentials (API keys,
            tokens, connection strings) are encrypted with AES-256 before
            being stored.
          </li>
          <li>
            <strong>Encryption in transit:</strong> All connections use TLS/HTTPS.
          </li>
          <li>
            <strong>No credential exposure:</strong> Your credentials are
            never sent to AI clients. They are only used server-side when
            processing tool calls.
          </li>
          <li>
            <strong>Scoped endpoints:</strong> Each MCP endpoint is scoped to
            your account. Other users cannot access your servers.
          </li>
          <li>
            <strong>Tool-level controls:</strong> You can disable individual
            tools (such as write operations) to enforce read-only access.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "What AI clients work with Relay?",
    answer: (
      <>
        <p>
          Relay works with any MCP-compatible client. Currently supported
          clients include:
        </p>
        <ul>
          <li>
            <strong>Claude Desktop</strong> -- Anthropic&apos;s desktop app
            with native MCP support.
          </li>
          <li>
            <strong>Cursor</strong> -- The AI-first code editor, which
            supports MCP servers in its settings.
          </li>
          <li>
            <strong>ChatGPT</strong> -- OpenAI&apos;s chat interface (with
            MCP plugin support).
          </li>
          <li>
            <strong>Continue.dev</strong> -- Open-source AI coding assistant
            with MCP support.
          </li>
          <li>
            <strong>Any SSE-compatible client</strong> -- Relay uses the
            Server-Sent Events (SSE) transport, which is supported by most
            MCP client implementations.
          </li>
        </ul>
        <p>
          To connect, simply paste your Relay endpoint URL into your
          client&apos;s MCP configuration.
        </p>
      </>
    ),
  },
  {
    question: "How does billing work?",
    answer: (
      <>
        <p>
          Relay uses simple, per-server pricing:
        </p>
        <ul>
          <li>
            <strong>$3 per server per month</strong> -- Each active MCP server
            costs $3/month.
          </li>
          <li>
            <strong>Unlimited API calls</strong> -- There are no caps on tool
            calls or requests. Your servers work as much as you need.
          </li>
          <li>
            <strong>Prorated billing</strong> -- When you add or remove a
            server mid-cycle, your bill is prorated automatically.
          </li>
          <li>
            <strong>No contracts</strong> -- Cancel anytime. Delete a server
            and the charge stops immediately.
          </li>
        </ul>
        <p>
          Payments are processed securely through Stripe. See the{" "}
          <Link href="/pricing">Pricing page</Link> for more details.
        </p>
      </>
    ),
  },
  {
    question: "How is Relay different from running MCP servers locally?",
    answer: (
      <>
        <p>
          Running MCP servers locally (via Docker, npx, or directly) works
          but comes with operational overhead:
        </p>
        <ul>
          <li>You need to keep the server process running.</li>
          <li>You need to manage dependencies and updates.</li>
          <li>Credentials sit in plain text config files on your machine.</li>
          <li>Sharing with a team requires each person to set up their own instance.</li>
        </ul>
        <p>
          Relay handles all of this for you. Your server runs on Relay&apos;s
          global edge infrastructure, credentials are encrypted, and you get a
          single URL that works from any device.
        </p>
      </>
    ),
  },
  {
    question: "Can I use multiple MCP servers at the same time?",
    answer: (
      <>
        <p>
          Yes. Most AI clients support connecting to multiple MCP servers
          simultaneously. You can have a GitHub server, a Notion server, and a
          Brave Search server all active at the same time. Your AI assistant
          will see all available tools and choose the right one based on your
          request.
        </p>
        <p>
          Here is an example Claude Desktop config with multiple servers:
        </p>
        <pre>
          <code>{`{
  "mcpServers": {
    "github": {
      "transport": "sse",
      "url": "https://relay.app/mcp/server-1"
    },
    "notion": {
      "transport": "sse",
      "url": "https://relay.app/mcp/server-2"
    },
    "brave-search": {
      "transport": "sse",
      "url": "https://relay.app/mcp/server-3"
    }
  }
}`}</code>
        </pre>
      </>
    ),
  },
  {
    question: "What integrations are available?",
    answer: (
      <>
        <p>Relay currently supports the following MCP server templates:</p>
        <ul>
          <li>
            <Link href="/docs/github">GitHub</Link> -- 12 tools for repos,
            issues, PRs, and code search
          </li>
          <li>
            <Link href="/docs/notion">Notion</Link> -- 8 tools for pages,
            databases, and blocks
          </li>
          <li>
            <Link href="/docs/slack">Slack</Link> -- 6 tools for messages,
            channels, and search
          </li>
          <li>
            <Link href="/docs/brave-search">Brave Search</Link> -- 2 tools
            for web and news search
          </li>
          <li>
            <Link href="/docs/postgresql">PostgreSQL</Link> -- 4 tools for
            queries, schemas, and analytics
          </li>
          <li>
            <Link href="/docs/google-drive">Google Drive</Link> -- 6 tools
            for files and folders (coming soon)
          </li>
          <li>Linear -- 8 tools for issues, projects, and teams</li>
          <li>Jira -- 8 tools for issues, projects, and workflows</li>
          <li>Airtable -- 8 tools for bases, tables, and records</li>
        </ul>
        <p>
          More integrations are added regularly. Check the{" "}
          <Link href="/dashboard/servers/new">template gallery</Link> for the
          latest list.
        </p>
      </>
    ),
  },
  {
    question: "How do I disable specific tools on a server?",
    answer: (
      <>
        <p>
          Each server has a settings page where you can toggle individual tools
          on or off. For example, you might want to disable the{" "}
          <code>push_files</code> tool on your GitHub server to prevent
          accidental writes, or disable <code>send_message</code> on Slack
          for read-only monitoring.
        </p>
        <p>
          To manage tools, go to your{" "}
          <Link href="/dashboard">Dashboard</Link>, click on the server, and
          navigate to the server settings.
        </p>
      </>
    ),
  },
  {
    question: "What happens if a tool call fails?",
    answer: (
      <>
        <p>
          If a tool call fails (due to a network error, invalid credentials,
          rate limit, or API error), Relay returns a structured error message
          to your AI client. The AI assistant will typically explain the error
          and suggest how to fix it.
        </p>
        <p>
          You can also view all tool calls and their results in the{" "}
          <strong>Activity Log</strong> on your dashboard. This includes
          request/response details, timestamps, and any error messages.
        </p>
      </>
    ),
  },
  {
    question: "Is there a free tier?",
    answer: (
      <p>
        A free tier is coming soon. In the meantime, Relay offers a
        straightforward $3/server/month pricing with no limits on API calls.
        You can add and remove servers at any time, and billing is prorated.
      </p>
    ),
  },
];

export default function DocsFAQ() {
  return (
    <>
      <h1>Frequently Asked Questions</h1>
      <p>
        Common questions about Relay, MCP, security, and billing. Can&apos;t
        find what you are looking for? Reach out through the dashboard support
        channel.
      </p>

      {FAQS.map((faq) => (
        <section key={faq.question}>
          <h2>{faq.question}</h2>
          {faq.answer}
        </section>
      ))}
    </>
  );
}
