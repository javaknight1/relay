import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Google Drive Integration — Relay Docs",
  description:
    "Set up a Google Drive MCP server on Relay. Learn about the upcoming integration for searching, reading, and organizing files.",
};

export default function DocsGoogleDrive() {
  return (
    <>
      <h1>Google Drive Integration</h1>
      <p>
        The Google Drive MCP server lets your AI assistant search, read, and
        organize files and folders in your Google Drive. It provides 6 tools
        for common file operations.
      </p>

      <div className="not-prose my-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Coming soon</p>
        <p className="mt-1 text-sm text-amber-700">
          The Google Drive integration is currently in development. Sign up for
          a Relay account to be notified when it launches.
        </p>
      </div>

      <h2>What to expect</h2>
      <p>
        When the Google Drive integration launches, it will include OAuth-based
        authentication (no manual API keys needed) and support for the
        following capabilities:
      </p>

      <h3>Planned tools</h3>

      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>search_files</code></td>
            <td>Search files by name, content, or type</td>
          </tr>
          <tr>
            <td><code>get_file</code></td>
            <td>Get file metadata and details</td>
          </tr>
          <tr>
            <td><code>read_file</code></td>
            <td>Read the content of a document, spreadsheet, or text file</td>
          </tr>
          <tr>
            <td><code>list_folder</code></td>
            <td>List files in a specific folder</td>
          </tr>
          <tr>
            <td><code>create_file</code></td>
            <td>Create a new file or document</td>
          </tr>
          <tr>
            <td><code>move_file</code></td>
            <td>Move a file to a different folder</td>
          </tr>
        </tbody>
      </table>

      <h2>Supported file types</h2>
      <p>
        The integration will support reading and searching across common file
        types:
      </p>
      <ul>
        <li>Google Docs, Sheets, and Slides</li>
        <li>PDF documents</li>
        <li>Plain text and Markdown files</li>
        <li>CSV files</li>
        <li>Images (metadata only)</li>
      </ul>

      <h2>Authentication</h2>
      <p>
        Unlike other integrations that use API keys, Google Drive will use
        OAuth 2.0 for authentication. When you create a Google Drive server
        on Relay, you will be redirected to Google to grant access. Relay
        will securely store your OAuth refresh token, encrypted at rest.
      </p>

      <h2>Example usage (preview)</h2>
      <p>
        Once available, you will be able to ask your AI assistant things like:
      </p>
      <ul>
        <li>
          <strong>&quot;Search my Drive for the Q4 budget spreadsheet&quot;</strong>
        </li>
        <li>
          <strong>&quot;Read the contents of my project proposal document&quot;</strong>
        </li>
        <li>
          <strong>&quot;List all files in my Shared Drives folder&quot;</strong>
        </li>
        <li>
          <strong>&quot;Create a new document titled &apos;Meeting Notes&apos;&quot;</strong>
        </li>
      </ul>

      <h2>Get notified</h2>
      <p>
        <Link href="/sign-up">Create a Relay account</Link> to be notified
        when the Google Drive integration is available. You can also check back
        on this page for updates.
      </p>
    </>
  );
}
