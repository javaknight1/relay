"use client";

import { useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, Wrench } from "lucide-react";
import { TEMPLATES, CATEGORIES } from "@/lib/templates";

export default function TemplateCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = TEMPLATES.filter((t) => {
    const matchesSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || t.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Search + filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
          <p className="text-sm text-gray-500">
            No templates match your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => {
            const Icon = template.icon;

            if (template.comingSoon) {
              return (
                <div
                  key={template.id}
                  className="relative rounded-xl border border-gray-200 bg-white p-5 opacity-60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {template.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                      {template.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Wrench className="h-3 w-3" />
                      {template.toolCount} tools
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={template.id}
                href={`/dashboard/servers/new/${template.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-brand-100 group-hover:text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                  {template.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {template.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                    {template.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Wrench className="h-3 w-3" />
                    {template.toolCount} tools
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
