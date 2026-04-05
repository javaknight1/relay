import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Slack Integration — Relay Docs",
  description:
    "Set up a Slack MCP server on Relay. Learn how to create a Slack app, configure OAuth scopes, and use all 6 available tools.",
};

export default function DocsSlack() {
  return (
    <>
      <h1>Slack Integration</h1>
      <p>
        The Slack MCP server lets your AI assistant interact with your Slack
        workspace -- listing channels, reading messages, sending messages, and
        searching across conversations. It provides 6 tools for common Slack
        operations.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A Slack workspace where you can install apps</li>
        <li>A Slack Bot Token with the required OAuth scopes</li>
        <li>A Relay account</li>
      </ul>

      <h2>Creating a Slack app</h2>
      <ol>
        <li>
          Go to{" "}
          <a
            href="https://api.slack.com/apps"
            target="_blank"
            rel="noopener noreferrer"
          >
            Slack API Apps
          </a>{" "}
          and click <strong>Create New App</strong>.
        </li>
        <li>
          Choose <strong>From scratch</strong>, give your app a name (such
          as <code>Relay MCP</code>), and select your workspace.
        </li>
        <li>
          Go to <strong>OAuth &amp; Permissions</strong> in the left sidebar.
        </li>
        <li>
          Under <strong>Bot Token Scopes</strong>, add the following scopes:
        </li>
      </ol>

      <table>
        <thead>
          <tr>
            <th>Scope</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>channels:read</code></td>
            <td>List public channels and read channel info</td>
          </tr>
          <tr>
            <td><code>channels:history</code></td>
            <td>Read messages in public channels</td>
          </tr>
          <tr>
            <td><code>chat:write</code></td>
            <td>Send messages to channels the bot is in</td>
          </tr>
          <tr>
            <td><code>search:read</code></td>
            <td>Search messages across the workspace</td>
          </tr>
          <tr>
            <td><code>users:read</code></td>
            <td>Read user profiles and info</td>
          </tr>
        </tbody>
      </table>

      <ol start={5}>
        <li>
          Scroll up and click <strong>Install to Workspace</strong>. Authorize
          the app when prompted.
        </li>
        <li>
          Copy the <strong>Bot User OAuth Token</strong> (starts with{" "}
          <code>xoxb-</code>).
        </li>
      </ol>

      <h3>Invite the bot to channels</h3>
      <p>
        Your Slack bot can only read and send messages in channels it has been
        invited to. In each channel you want to use, type:
      </p>
      <pre>
        <code>/invite @Relay MCP</code>
      </pre>
      <p>
        Alternatively, mention your bot in the channel and click{" "}
        <strong>Invite to Channel</strong> when prompted.
      </p>

      <h2>Deploying the server</h2>
      <ol>
        <li>
          In your Relay <Link href="/dashboard">Dashboard</Link>, click{" "}
          <strong>New Server</strong>.
        </li>
        <li>
          Select the <strong>Slack</strong> template.
        </li>
        <li>Paste your Bot User OAuth Token.</li>
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
            <td><code>list_channels</code></td>
            <td>List workspace channels the bot can see</td>
          </tr>
          <tr>
            <td><code>get_channel_history</code></td>
            <td>Get recent messages from a channel</td>
          </tr>
          <tr>
            <td><code>send_message</code></td>
            <td>Send a message to a channel</td>
          </tr>
          <tr>
            <td><code>search_messages</code></td>
            <td>Search messages across the workspace</td>
          </tr>
          <tr>
            <td><code>get_user_info</code></td>
            <td>Get a user&apos;s profile information</td>
          </tr>
          <tr>
            <td><code>list_users</code></td>
            <td>List all workspace members</td>
          </tr>
        </tbody>
      </table>

      <h2>Connecting to Claude Desktop</h2>
      <pre>
        <code>{`{
  "mcpServers": {
    "slack": {
      "transport": "sse",
      "url": "https://relay.app/mcp/your-server-id"
    }
  }
}`}</code>
      </pre>

      <h2>Example usage</h2>
      <ul>
        <li>
          <strong>&quot;What are the recent messages in #engineering?&quot;</strong>{" "}
          -- calls <code>get_channel_history</code>
        </li>
        <li>
          <strong>&quot;Send a message to #general saying the deploy is complete&quot;</strong>{" "}
          -- calls <code>send_message</code>
        </li>
        <li>
          <strong>&quot;Search Slack for discussions about the API redesign&quot;</strong>{" "}
          -- calls <code>search_messages</code>
        </li>
        <li>
          <strong>&quot;List all channels in the workspace&quot;</strong>{" "}
          -- calls <code>list_channels</code>
        </li>
        <li>
          <strong>&quot;Who is @johndoe?&quot;</strong>{" "}
          -- calls <code>get_user_info</code>
        </li>
      </ul>

      <h2>Security notes</h2>
      <ul>
        <li>
          Your Bot Token is encrypted with AES-256 at rest. It is never exposed
          to AI clients.
        </li>
        <li>
          The bot can only access channels it has been invited to. It cannot
          read private channels or DMs unless explicitly granted access.
        </li>
        <li>
          For read-only use cases, you can omit the <code>chat:write</code>{" "}
          scope and disable the <code>send_message</code> tool in your server
          settings.
        </li>
      </ul>
    </>
  );
}
