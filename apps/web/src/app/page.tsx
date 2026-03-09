import type { ServerType } from "@relay/shared";

const SUPPORTED_TEMPLATES: ServerType[] = [
  "github",
  "notion",
  "brave",
  "slack",
  "postgres",
  "gdrive",
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Relay</h1>
      <p className="text-lg text-gray-600 mb-8">
        Managed MCP server hosting. Pick a template, enter your credentials, get
        a live endpoint in minutes.
      </p>
      <div className="flex gap-2">
        {SUPPORTED_TEMPLATES.map((t) => (
          <span
            key={t}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
          >
            {t}
          </span>
        ))}
      </div>
    </main>
  );
}
