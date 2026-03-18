"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";

interface ClientConfig {
  label: string;
  config: string;
  description: string;
  steps: string[];
}

export default function ClientConfigTabs({
  configs,
}: {
  configs: ClientConfig[];
}) {
  const [active, setActive] = useState(0);
  const current = configs[active];

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 pt-4">
        <nav className="-mb-px flex gap-5">
          {configs.map((c, i) => (
            <button
              key={c.label}
              onClick={() => setActive(i)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                i === active
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </nav>
        <div className="-mt-1">
          <CopyButton text={current.config} label="Copy config" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs text-gray-500">{current.description}</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100">
          {current.config}
        </pre>
        <ol className="mt-4 space-y-2 text-sm text-gray-600">
          {current.steps.map((step, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: `${i + 1}. ${step}` }} />
          ))}
        </ol>
      </div>
    </div>
  );
}
