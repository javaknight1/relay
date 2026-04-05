import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notion Integration — Relay Docs",
  description:
    "Set up a Notion MCP server on Relay. Learn how to create an integration, share pages, and use all 8 available tools.",
};

export default function DocsNotion() {
  return (
    <>
      <h1>Notion Integration</h1>
      <p>
        The Notion MCP server lets your AI assistant read and write pages,
        query databases, and manage content blocks in your Notion workspace.
        With 8 tools available, it covers search, read, create, and update
        workflows.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A Notion account with a workspace you administer</li>
        <li>An internal Notion integration with an integration token</li>
        <li>A Relay account</li>
      </ul>

      <h2>Creating a Notion integration</h2>
      <ol>
        <li>
          Go to{" "}
          <a
            href="https://www.notion.so/my-integrations"
            target="_blank"
            rel="noopener noreferrer"
          >
            Notion Integrations
          </a>{" "}
          and click <strong>New integration</strong>.
        </li>
        <li>
          Give it a name (for example, <code>Relay MCP</code>), select
          your workspace, and set the type to <strong>Internal</strong>.
        </li>
        <li>
          Under <strong>Capabilities</strong>, grant the following:
        </li>
      </ol>

      <table>
        <thead>
          <tr>
            <th>Capability</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Read content</td>
            <td>Search and read pages, databases, and blocks</td>
          </tr>
          <tr>
            <td>Update content</td>
            <td>Create and update pages and database entries</td>
          </tr>
          <tr>
            <td>Insert content</td>
            <td>Add new blocks and pages</td>
          </tr>
        </tbody>
      </table>

      <ol start={4}>
        <li>
          Click <strong>Save changes</strong> and copy the{" "}
          <strong>Internal Integration Token</strong> (starts with{" "}
          <code>ntn_</code>).
        </li>
      </ol>

      <h3>Share pages with the integration</h3>
      <p>
        By default, your integration cannot access any pages. You must
        explicitly share pages or databases with it:
      </p>
      <ol>
        <li>Open a page or database in Notion.</li>
        <li>
          Click the <strong>...</strong> menu in the top-right corner.
        </li>
        <li>
          Select <strong>Connections</strong> and find your integration name.
        </li>
        <li>
          Click <strong>Confirm</strong>. The integration now has access to
          this page and all child pages.
        </li>
      </ol>

      <blockquote>
        Tip: Share a top-level page to grant access to an entire section of
        your workspace at once.
      </blockquote>

      <h2>Deploying the server</h2>
      <ol>
        <li>
          In your Relay <Link href="/dashboard">Dashboard</Link>, click{" "}
          <strong>New Server</strong>.
        </li>
        <li>
          Select the <strong>Notion</strong> template.
        </li>
        <li>
          Paste your Integration Token in the credential field.
        </li>
        <li>
          Click <strong>Deploy</strong>.
        </li>
      </ol>

      <h2>Available tools</h2>

      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>search</code></td>
            <td>Search pages and databases by title or content</td>
          </tr>
          <tr>
            <td><code>get_page</code></td>
            <td>Get a page by its ID (properties and metadata)</td>
          </tr>
          <tr>
            <td><code>get_page_content</code></td>
            <td>Get the content blocks of a page</td>
          </tr>
          <tr>
            <td><code>create_page</code></td>
            <td>Create a new page in a parent page or database</td>
          </tr>
          <tr>
            <td><code>update_page</code></td>
            <td>Update page properties (title, status, etc.)</td>
          </tr>
          <tr>
            <td><code>query_database</code></td>
            <td>Query a database with filters and sorts</td>
          </tr>
          <tr>
            <td><code>get_database</code></td>
            <td>Get a database schema (columns and types)</td>
          </tr>
          <tr>
            <td><code>create_database_entry</code></td>
            <td>Add a new entry (row) to a database</td>
          </tr>
        </tbody>
      </table>

      <h2>Connecting to Claude Desktop</h2>
      <pre>
        <code>{`{
  "mcpServers": {
    "notion": {
      "transport": "sse",
      "url": "https://relay.app/mcp/your-server-id"
    }
  }
}`}</code>
      </pre>

      <h2>Example usage</h2>
      <ul>
        <li>
          <strong>&quot;Search my Notion for meeting notes from last week&quot;</strong>{" "}
          -- calls <code>search</code>
        </li>
        <li>
          <strong>&quot;Show me the content of my Q4 Planning page&quot;</strong>{" "}
          -- calls <code>get_page_content</code>
        </li>
        <li>
          <strong>&quot;Add a new task to my Tasks database&quot;</strong>{" "}
          -- calls <code>create_database_entry</code>
        </li>
        <li>
          <strong>&quot;Query my CRM database for leads with status Active&quot;</strong>{" "}
          -- calls <code>query_database</code>
        </li>
        <li>
          <strong>&quot;Create a page titled &apos;Sprint Retrospective&apos; under my Team page&quot;</strong>{" "}
          -- calls <code>create_page</code>
        </li>
      </ul>

      <h2>Troubleshooting</h2>
      <h3>Tools return empty results</h3>
      <p>
        Make sure you have shared the relevant pages or databases with your
        integration. Notion integrations can only access content that has been
        explicitly shared with them.
      </p>

      <h3>Permission errors</h3>
      <p>
        Verify that your integration has the required capabilities (Read,
        Update, Insert content) in the{" "}
        <a
          href="https://www.notion.so/my-integrations"
          target="_blank"
          rel="noopener noreferrer"
        >
          integration settings
        </a>.
      </p>
    </>
  );
}
