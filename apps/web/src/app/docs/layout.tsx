import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DocsSidebar from "./DocsSidebar";

export const metadata: Metadata = {
  title: "Documentation — Relay",
  description:
    "Learn how to set up and use Relay managed MCP servers. Guides for GitHub, Notion, Slack, Brave Search, PostgreSQL, and Google Drive integrations.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Docs Navbar ── */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-gray-900"
            >
              Relay
            </Link>
            <span className="hidden h-5 w-px bg-gray-200 sm:block" />
            <Link
              href="/docs"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:block"
            >
              Documentation
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10">
        <DocsSidebar />
        <main className="min-w-0 flex-1">
          <article className="prose-docs mx-auto max-w-3xl">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
