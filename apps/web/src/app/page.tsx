import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
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
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton>
            <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800">
              Sign up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <a
            href="/dashboard"
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Dashboard
          </a>
          <UserButton />
        </Show>
      </div>
      <h1 className="text-4xl font-bold mb-4">Relay</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-lg">
        Managed MCP server hosting. Pick a template, enter your credentials, get
        a live endpoint in minutes.
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
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
