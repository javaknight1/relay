import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GitHub Integration — Relay Docs",
  description:
    "Set up a GitHub MCP server on Relay. Learn which PAT scopes are needed, available tools, and example usage with Claude Desktop.",
};

export default function DocsGitHub() {
  return (
    <>
      <h1>GitHub Integration</h1>
      <p>
        The GitHub MCP server gives your AI assistant direct access to
        repositories, issues, pull requests, and code search. With 12 tools
        available, it covers the most common GitHub workflows.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A GitHub account</li>
        <li>A Personal Access Token (PAT) with the required scopes</li>
        <li>A Relay account</li>
      </ul>

      <h2>Creating a Personal Access Token</h2>
      <ol>
        <li>
          Go to{" "}
          <a
            href="https://github.com/settings/tokens/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Token Settings
          </a>{" "}
          (or navigate to Settings &rarr; Developer settings &rarr; Personal
          access tokens &rarr; Tokens (classic)).
        </li>
        <li>
          Click <strong>Generate new token (classic)</strong>.
        </li>
        <li>
          Give it a descriptive name, such as{" "}
          <code>Relay MCP Server</code>.
        </li>
        <li>
          Select the following <strong>scopes</strong>:
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
            <td><code>repo</code></td>
            <td>Full control of private repos (read issues, PRs, code, push files)</td>
          </tr>
          <tr>
            <td><code>read:user</code></td>
            <td>Read user profile data</td>
          </tr>
        </tbody>
      </table>

      <blockquote>
        If you only need read access, you can use a <strong>fine-grained
        token</strong> instead, granting read-only permissions on the specific
        repositories you want to expose.
      </blockquote>

      <ol start={5}>
        <li>
          Click <strong>Generate token</strong> and copy the token immediately.
          It will not be shown again.
        </li>
      </ol>

      <h2>Deploying the server</h2>
      <ol>
        <li>
          In your Relay <Link href="/dashboard">Dashboard</Link>, click{" "}
          <strong>New Server</strong>.
        </li>
        <li>
          Select the <strong>GitHub</strong> template.
        </li>
        <li>
          Paste your Personal Access Token in the credential field.
        </li>
        <li>
          Click <strong>Deploy</strong>. Your server will be live in seconds.
        </li>
      </ol>

      <h2>Available tools</h2>
      <p>
        The GitHub template provides 12 tools. All are enabled by default
        except <code>push_files</code>, which you can enable from the server
        settings page.
      </p>

      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Description</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>list_issues</code></td>
            <td>List issues in a repository</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>get_issue</code></td>
            <td>Get a single issue by number</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>create_issue</code></td>
            <td>Create a new issue</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>update_issue</code></td>
            <td>Update an existing issue</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>list_pull_requests</code></td>
            <td>List pull requests</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>get_pull_request</code></td>
            <td>Get a single pull request</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>list_repositories</code></td>
            <td>List your repositories</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>get_repository</code></td>
            <td>Get repository details</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>search_issues</code></td>
            <td>Search issues and PRs</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>search_code</code></td>
            <td>Search code across repos</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>get_file_contents</code></td>
            <td>Read a file from a repo</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td><code>push_files</code></td>
            <td>Push files to a repo</td>
            <td>Disabled</td>
          </tr>
        </tbody>
      </table>

      <h2>Connecting to Claude Desktop</h2>
      <p>
        After deploying, copy your server endpoint URL from the dashboard.
        Open your Claude Desktop configuration file and add the following:
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
        On macOS, the config file is at{" "}
        <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>.
        On Windows, it is at{" "}
        <code>%APPDATA%\\Claude\\claude_desktop_config.json</code>.
      </p>

      <h2>Example usage</h2>
      <p>
        Once connected, try these prompts with your AI assistant:
      </p>
      <ul>
        <li>
          <strong>&quot;List my open issues in the acme/api repo&quot;</strong>{" "}
          -- calls <code>list_issues</code>
        </li>
        <li>
          <strong>&quot;Search for TODO comments in my codebase&quot;</strong>{" "}
          -- calls <code>search_code</code>
        </li>
        <li>
          <strong>&quot;Create an issue titled &apos;Fix login bug&apos; with a description&quot;</strong>{" "}
          -- calls <code>create_issue</code>
        </li>
        <li>
          <strong>&quot;Show me the README.md from acme/frontend&quot;</strong>{" "}
          -- calls <code>get_file_contents</code>
        </li>
        <li>
          <strong>&quot;What PRs are open in the main repo?&quot;</strong>{" "}
          -- calls <code>list_pull_requests</code>
        </li>
      </ul>

      <h2>Security notes</h2>
      <ul>
        <li>
          Your Personal Access Token is encrypted with AES-256 at rest and
          never exposed to clients.
        </li>
        <li>
          The <code>push_files</code> tool is disabled by default to prevent
          accidental writes. Enable it only if your workflow requires it.
        </li>
        <li>
          Use a fine-grained token with minimal permissions when possible.
        </li>
      </ul>
    </>
  );
}
