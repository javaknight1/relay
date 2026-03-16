"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "connect", label: "Connect" },
  { slug: "logs", label: "Logs" },
  { slug: "settings", label: "Settings" },
];

export default function TabNav({ serverId }: { serverId: string }) {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex gap-6">
        {TABS.map((tab) => {
          const href = `/dashboard/servers/${serverId}/${tab.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={tab.slug}
              href={href}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
