import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PostgreSQL Integration — Relay Docs",
  description:
    "Set up a PostgreSQL MCP server on Relay. Learn how to configure a connection string, available tools, and security best practices.",
};

export default function DocsPostgreSQL() {
  return (
    <>
      <h1>PostgreSQL Integration</h1>
      <p>
        The PostgreSQL MCP server lets your AI assistant query databases,
        inspect schemas, and run analytics directly against your Postgres
        instance. It provides 4 tools for read-only database operations.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A PostgreSQL database accessible from the internet (or through a tunnel)</li>
        <li>A connection string with appropriate credentials</li>
        <li>A Relay account</li>
      </ul>

      <h2>Preparing your database</h2>

      <h3>Create a read-only user</h3>
      <p>
        For security, we strongly recommend creating a dedicated read-only
        user for Relay. Connect to your database as a superuser and run:
      </p>
      <pre>
        <code>{`-- Create a read-only role
CREATE ROLE relay_reader WITH LOGIN PASSWORD 'your-secure-password';

-- Grant read access to the desired schema
GRANT USAGE ON SCHEMA public TO relay_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO relay_reader;

-- Ensure future tables are also readable
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO relay_reader;`}</code>
      </pre>

      <h3>Connection string format</h3>
      <p>
        Your connection string should follow the standard PostgreSQL URI
        format:
      </p>
      <pre>
        <code>postgresql://relay_reader:your-secure-password@your-host:5432/your-database</code>
      </pre>

      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>relay_reader</code></td>
            <td>Database username</td>
          </tr>
          <tr>
            <td><code>your-secure-password</code></td>
            <td>Database password</td>
          </tr>
          <tr>
            <td><code>your-host</code></td>
            <td>Hostname or IP of your database server</td>
          </tr>
          <tr>
            <td><code>5432</code></td>
            <td>Port number (5432 is the default)</td>
          </tr>
          <tr>
            <td><code>your-database</code></td>
            <td>Name of the database</td>
          </tr>
        </tbody>
      </table>

      <p>
        For SSL connections, append <code>?sslmode=require</code> to the
        connection string.
      </p>

      <h2>Deploying the server</h2>
      <ol>
        <li>
          In your Relay <Link href="/dashboard">Dashboard</Link>, click{" "}
          <strong>New Server</strong>.
        </li>
        <li>
          Select the <strong>PostgreSQL</strong> template.
        </li>
        <li>Paste your connection string in the credential field.</li>
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
            <td><code>query</code></td>
            <td>Execute a SQL query (read-only by default)</td>
          </tr>
          <tr>
            <td><code>list_tables</code></td>
            <td>List all tables in the database</td>
          </tr>
          <tr>
            <td><code>describe_table</code></td>
            <td>Show the schema of a specific table (columns, types, constraints)</td>
          </tr>
          <tr>
            <td><code>list_schemas</code></td>
            <td>List all schemas in the database</td>
          </tr>
        </tbody>
      </table>

      <h2>Connecting to Claude Desktop</h2>
      <pre>
        <code>{`{
  "mcpServers": {
    "postgres": {
      "transport": "sse",
      "url": "https://relay.app/mcp/your-server-id"
    }
  }
}`}</code>
      </pre>

      <h2>Example usage</h2>
      <ul>
        <li>
          <strong>&quot;What tables are in the database?&quot;</strong>{" "}
          -- calls <code>list_tables</code>
        </li>
        <li>
          <strong>&quot;Describe the users table&quot;</strong>{" "}
          -- calls <code>describe_table</code>
        </li>
        <li>
          <strong>&quot;How many orders were placed this month?&quot;</strong>{" "}
          -- calls <code>query</code> with a SQL count query
        </li>
        <li>
          <strong>&quot;Show me the top 10 customers by revenue&quot;</strong>{" "}
          -- calls <code>query</code> with an aggregation query
        </li>
        <li>
          <strong>&quot;What schemas exist in this database?&quot;</strong>{" "}
          -- calls <code>list_schemas</code>
        </li>
      </ul>

      <h2>Security best practices</h2>
      <ul>
        <li>
          <strong>Always use a read-only user.</strong> The query tool executes
          arbitrary SQL, so restricting to SELECT-only access prevents
          accidental data modification.
        </li>
        <li>
          <strong>Limit schema access.</strong> Only grant access to schemas
          and tables your AI assistant needs. Avoid exposing sensitive tables
          (like user credentials or payment data).
        </li>
        <li>
          <strong>Use SSL.</strong> Append <code>?sslmode=require</code> to
          your connection string to ensure encrypted connections.
        </li>
        <li>
          <strong>Allowlist Relay IPs.</strong> If your database has IP-based
          firewall rules, ensure Relay&apos;s infrastructure can connect.
          Contact support for the current IP ranges.
        </li>
        <li>
          Your connection string is encrypted with AES-256 at rest and never
          exposed to AI clients.
        </li>
      </ul>

      <h2>Supported PostgreSQL versions</h2>
      <p>
        Relay supports PostgreSQL 12 and above, including managed services
        like Supabase, Neon, AWS RDS, Google Cloud SQL, and Azure Database
        for PostgreSQL.
      </p>
    </>
  );
}
