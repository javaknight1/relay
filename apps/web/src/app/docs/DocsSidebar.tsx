"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Github,
  MessageSquare,
  Search,
  Database,
  FolderOpen,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Getting Started",
    href: "/docs",
    icon: BookOpen,
  },
  {
    heading: "Integrations",
    items: [
      { label: "GitHub", href: "/docs/github", icon: Github },
      { label: "Notion", href: "/docs/notion", icon: BookOpen },
      { label: "Slack", href: "/docs/slack", icon: MessageSquare },
      { label: "Brave Search", href: "/docs/brave-search", icon: Search },
      { label: "PostgreSQL", href: "/docs/postgresql", icon: Database },
      { label: "Google Drive", href: "/docs/google-drive", icon: FolderOpen },
    ],
  },
  {
    label: "FAQ",
    href: "/docs/faq",
    icon: HelpCircle,
  },
] as const;

type NavLink = { label: string; href: string; icon: typeof BookOpen };
type NavGroup = { heading: string; items: readonly NavLink[] };
type NavEntry = NavLink | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "heading" in entry;
}

function SidebarLink({ item, onClick }: { item: NavLink; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-brand-50 text-brand-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
      {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
    </Link>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {(NAV_ITEMS as readonly NavEntry[]).map((entry, i) => {
        if (isGroup(entry)) {
          return (
            <div key={entry.heading} className="mt-6 first:mt-0">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {entry.heading}
              </p>
              <div className="flex flex-col gap-0.5">
                {entry.items.map((item) => (
                  <SidebarLink key={item.href} item={item} onClick={onLinkClick} />
                ))}
              </div>
            </div>
          );
        }
        return <SidebarLink key={entry.href} item={entry} onClick={onLinkClick} />;
      })}
    </nav>
  );
}

export default function DocsSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition-transform hover:scale-105 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Link href="/docs" className="text-lg font-bold text-gray-900">
                Docs
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 overflow-y-auto pb-10">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
