import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brave Search Integration — Relay Docs",
  description:
    "Set up a Brave Search MCP server on Relay. Learn how to get an API key and use web and news search tools.",
};

export default function DocsBraveSearch() {
  return (
    <>
      <h1>Brave Search Integration</h1>
      <p>
        The Brave Search MCP server gives your AI assistant real-time access to
        the web. It provides 2 tools for web search and news search, powered
        by Brave&apos;s independent search index.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A Brave Search API account</li>
        <li>An API key</li>
        <li>A Relay account</li>
      </ul>

      <h2>Getting an API key</h2>
      <ol>
        <li>
          Go to the{" "}
          <a
            href="https://brave.com/search/api/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Brave Search API
          </a>{" "}
          page.
        </li>
        <li>
          Sign up for a free plan (includes 2,000 queries per month) or a
          paid plan for higher limits.
        </li>
        <li>
          After signing up, navigate to your API dashboard and copy your{" "}
          <strong>API key</strong>.
        </li>
      </ol>

      <blockquote>
        The free tier is generous enough for personal use and experimentation.
        Upgrade to a paid plan if you need more than 2,000 queries per month.
      </blockquote>

      <h2>Deploying the server</h2>
      <ol>
        <li>
          In your Relay <Link href="/dashboard">Dashboard</Link>, click{" "}
          <strong>New Server</strong>.
        </li>
        <li>
          Select the <strong>Brave Search</strong> template.
        </li>
        <li>Paste your API key in the credential field.</li>
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
            <td><code>web_search</code></td>
            <td>Search the web for pages, answers, and information</td>
          </tr>
          <tr>
            <td><code>news_search</code></td>
            <td>Search recent news articles</td>
          </tr>
        </tbody>
      </table>

      <h2>Connecting to Claude Desktop</h2>
      <pre>
        <code>{`{
  "mcpServers": {
    "brave-search": {
      "transport": "sse",
      "url": "https://relay.app/mcp/your-server-id"
    }
  }
}`}</code>
      </pre>

      <h2>Example usage</h2>
      <ul>
        <li>
          <strong>&quot;Search the web for the latest Next.js release notes&quot;</strong>{" "}
          -- calls <code>web_search</code>
        </li>
        <li>
          <strong>&quot;What are the top news stories about AI today?&quot;</strong>{" "}
          -- calls <code>news_search</code>
        </li>
        <li>
          <strong>&quot;Find documentation for the Stripe Billing API&quot;</strong>{" "}
          -- calls <code>web_search</code>
        </li>
        <li>
          <strong>&quot;Search for recent articles about MCP protocol&quot;</strong>{" "}
          -- calls <code>news_search</code>
        </li>
      </ul>

      <h2>When to use Brave Search</h2>
      <p>
        Brave Search is particularly useful when your AI assistant needs access
        to information that is:
      </p>
      <ul>
        <li>
          <strong>Current</strong> -- real-time results for recent events, new
          releases, and breaking news.
        </li>
        <li>
          <strong>External</strong> -- information from the public web that
          is not in your private tools (GitHub, Notion, etc.).
        </li>
        <li>
          <strong>Research-oriented</strong> -- finding documentation,
          tutorials, and reference material.
        </li>
      </ul>
      <p>
        Combine it with other Relay servers for a powerful setup: use Brave
        Search for web lookups and GitHub for your codebase, all from the
        same AI assistant.
      </p>

      <h2>Rate limits</h2>
      <p>
        Brave Search API has rate limits based on your plan. Relay does not
        add any additional limits on top of what Brave allows. If you hit a
        rate limit, the tool will return an appropriate error message that
        your AI client can understand.
      </p>
    </>
  );
}
