import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import {
  Github,
  BookOpen,
  Search,
  MessageSquare,
  Database,
  FolderOpen,
  Shield,
  Zap,
  Plug,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import MobileNav from "./components/MobileNav";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
];

const TEMPLATES = [
  {
    id: "github",
    name: "GitHub",
    description: "Manage repos, issues, PRs, and code search",
    icon: Github,
    tools: 12,
    color: "hover:border-gray-800",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Read and update pages, databases, and blocks",
    icon: BookOpen,
    tools: 8,
    color: "hover:border-gray-800",
  },
  {
    id: "brave",
    name: "Brave Search",
    description: "Web and local search with instant answers",
    icon: Search,
    tools: 3,
    color: "hover:border-orange-500",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send messages, search channels, manage threads",
    icon: MessageSquare,
    tools: 6,
    color: "hover:border-purple-600",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Query databases, inspect schemas, run analytics",
    icon: Database,
    tools: 5,
    color: "hover:border-blue-600",
  },
  {
    id: "gdrive",
    name: "Google Drive",
    description: "Search, read, and organize files and folders",
    icon: FolderOpen,
    tools: 7,
    color: "hover:border-green-600",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Secure by Default",
    description:
      "Credentials are encrypted at rest and never leave the server. Each endpoint is scoped to your account.",
  },
  {
    icon: Zap,
    title: "Zero Config",
    description:
      "Pick a template, paste your API key, and get a working endpoint. No Docker, no YAML, no CLI.",
  },
  {
    icon: Plug,
    title: "Works with Any Client",
    description:
      "Claude Desktop, Cursor, ChatGPT, or any MCP-compatible client. Just paste your endpoint URL.",
  },
  {
    icon: BarChart3,
    title: "Usage Dashboard",
    description:
      "See every tool call, token count, and error in real time. Debug issues before your users notice.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Pick a template",
    description:
      "Choose from GitHub, Notion, Slack, and more. Each template is pre-configured with the right tools.",
  },
  {
    step: "2",
    title: "Enter credentials",
    description:
      "Paste your API key or OAuth token. We encrypt it and never expose it to clients.",
  },
  {
    step: "3",
    title: "Get your endpoint",
    description:
      "Copy your unique MCP endpoint URL and paste it into any MCP-compatible client.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-bold tracking-tight text-gray-900">
            Relay
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Show when="signed-out">
              <SignInButton>
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600">
                  Sign up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <a
                href="/dashboard"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                Dashboard
              </a>
              <UserButton />
            </Show>
          </div>

          <MobileNav />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-glow relative overflow-hidden">
        <div className="bg-grid absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
          {/* Left column */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              Now in public beta
            </div>
            <h1 className="animate-fade-in-up text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              MCP servers,{" "}
              <span className="text-gradient">hosted for you</span>
            </h1>
            <p className="mt-6 animate-fade-in-up text-lg leading-relaxed text-gray-600 stagger-1">
              Pick a template, enter your credentials, and get a live MCP
              endpoint in minutes. No Docker, no CLI, no infrastructure to
              manage.
            </p>
            <div className="mt-8 flex animate-fade-in-up flex-wrap gap-4 stagger-2">
              <Show when="signed-out">
                <SignUpButton>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Show>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right column — Terminal */}
          <div className="animate-fade-in-up stagger-2 lg:justify-self-end">
            <div className="terminal w-full max-w-md shadow-2xl">
              <div className="terminal-header">
                <span className="terminal-dot bg-red-500" />
                <span className="terminal-dot bg-yellow-500" />
                <span className="terminal-dot bg-green-500" />
                <span className="ml-3 text-xs text-gray-400">
                  claude_desktop_config.json
                </span>
              </div>
              <div className="terminal-body">
                <div className="terminal-line">
                  <span className="text-gray-500">{"{"}</span>
                </div>
                <div className="terminal-line">
                  <span className="text-purple-400">
                    {"  \"mcpServers\""}
                  </span>
                  <span className="text-gray-500">{": {"}</span>
                </div>
                <div className="terminal-line">
                  <span className="text-green-400">
                    {"    \"github\""}
                  </span>
                  <span className="text-gray-500">{": {"}</span>
                </div>
                <div className="terminal-line">
                  <span className="text-blue-400">
                    {"      \"transport\""}
                  </span>
                  <span className="text-gray-500">{": "}</span>
                  <span className="text-amber-300">{"\"sse\""}</span>
                  <span className="text-gray-500">,</span>
                </div>
                <div className="terminal-line">
                  <span className="text-blue-400">
                    {"      \"url\""}
                  </span>
                  <span className="text-gray-500">{": "}</span>
                  <span className="text-amber-300">
                    {"\"https://relay.app/mcp/gh_abc123\""}
                  </span>
                </div>
                <div className="terminal-line">
                  <span className="text-gray-500">{"    }"}</span>
                </div>
                <div className="terminal-line">
                  <span className="text-gray-500">{"  }"}</span>
                </div>
                <div className="terminal-line">
                  <span className="text-gray-500">{"}"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t border-gray-100 bg-gray-50/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Up and running in 3 steps
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No infrastructure to manage. No YAML to write.
            </p>
          </div>
          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            {/* Connecting line (desktop only) */}
            <div className="absolute top-10 left-[16.67%] right-[16.67%] hidden h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 md:block" />

            {STEPS.map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-100 bg-white text-2xl font-bold text-brand-600 shadow-sm">
                  {step.step}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section id="integrations" className="border-t border-gray-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready-made templates
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Deploy pre-built MCP servers for popular services. More coming
              every week.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className={`hover-lift group rounded-xl border border-gray-200 bg-white p-6 ${template.color} transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {template.tools} tools
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {template.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-gray-100 bg-gray-50/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for production
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to run MCP servers at scale, without the ops
              burden.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-gray-200 bg-white p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="bg-gradient-animated overflow-hidden rounded-2xl px-8 py-16 text-center shadow-xl sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to give your AI real tools?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Deploy your first MCP server in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Show when="signed-out">
                <SignUpButton>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-lg transition-all hover:bg-gray-50">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-lg transition-all hover:bg-gray-50"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Show>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Unlimited API calls
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Pay per server
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-gray-50/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <span className="text-sm font-semibold text-gray-900">Relay</span>
          <nav className="flex gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <span className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Relay. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
