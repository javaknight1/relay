"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TemplateInfo } from "@/lib/templates";
import { ExternalLink, Loader2 } from "lucide-react";

export default function CredentialForm({
  template,
}: {
  template: TemplateInfo;
}) {
  const router = useRouter();
  const [name, setName] = useState(`My ${template.name} Server`);
  const [credentials, setCredentials] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of template.credentialFields) {
      initial[field.key] = "";
    }
    return initial;
  });
  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const tool of template.tools) {
        initial[tool.name] = tool.enabledByDefault;
      }
      return initial;
    },
  );
  const [submitting, setSubmitting] = useState(false);

  const allRequiredFilled = template.credentialFields
    .filter((f) => f.required)
    .every((f) => credentials[f.key]?.trim() !== "");

  const canSubmit = name.trim() !== "" && allRequiredFilled && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: template.id,
          credentials,
          enabledTools: Object.entries(enabledTools)
            .filter(([, v]) => v)
            .map(([k]) => k),
        }),
      });

      if (res.ok) {
        const { id } = await res.json();
        router.push(`/dashboard/servers/${id}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Server name */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Server Name
        </label>
        <p className="mt-1 text-xs text-gray-500">
          A friendly name for this server shown in the dashboard.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          required
        />
      </div>

      {/* Credential fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-900">
            Credentials
          </label>
          {template.credentialHelpUrl && (
            <a
              href={template.credentialHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              {template.credentialHelpLabel}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {template.credentialFields.map((field) => (
            <div key={field.key}>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.required ? (
                  <span className="text-xs text-red-500">Required</span>
                ) : (
                  <span className="text-xs text-gray-400">Optional</span>
                )}
              </div>
              {field.hint && (
                <p className="mt-0.5 text-xs text-gray-500">{field.hint}</p>
              )}
              {field.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={credentials[field.key]}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  value={credentials[field.key]}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tool toggles */}
      {template.tools.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            Tools
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Choose which tools to enable for this server.
          </p>

          <div className="mt-4 divide-y divide-gray-100">
            {template.tools.map((tool) => (
              <label
                key={tool.name}
                className="flex cursor-pointer items-center justify-between py-2.5"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    <code className="rounded bg-gray-50 px-1 py-0.5 font-mono text-xs">
                      {tool.name}
                    </code>
                  </span>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {tool.description}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enabledTools[tool.name] ?? true}
                  onChange={(e) =>
                    setEnabledTools((prev) => ({
                      ...prev,
                      [tool.name]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Server"
          )}
        </button>
      </div>
    </form>
  );
}
