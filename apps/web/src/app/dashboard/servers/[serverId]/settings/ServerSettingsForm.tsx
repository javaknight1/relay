"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ServerRow } from "@relay/shared";
import type { ToolInfo } from "@/lib/templates";
import { AlertTriangle, Clock, Loader2, RefreshCw, Wrench } from "lucide-react";

export default function ServerSettingsForm({
  server,
  templateTools,
}: {
  server: ServerRow;
  templateTools: ToolInfo[];
}) {
  const router = useRouter();
  const [name, setName] = useState(server.name);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [newEndpointUrl, setNewEndpointUrl] = useState<string | null>(null);

  // Tool toggle state: null means all enabled
  const [enabledTools, setEnabledTools] = useState<Set<string>>(() => {
    if (server.allowed_tools === null) {
      // All tools enabled
      return new Set(templateTools.map((t) => t.name));
    }
    return new Set(server.allowed_tools);
  });
  const [savingTools, setSavingTools] = useState(false);
  const [toolsSaved, setToolsSaved] = useState(false);

  // Check if tool state has changed from the server's current state
  const toolsChanged = (() => {
    if (server.allowed_tools === null) {
      // Currently all enabled — changed if any are now disabled
      return enabledTools.size !== templateTools.length;
    }
    // Currently a subset — compare sets
    const currentSet = new Set(server.allowed_tools);
    if (currentSet.size !== enabledTools.size) return true;
    for (const t of currentSet) {
      if (!enabledTools.has(t)) return true;
    }
    return false;
  })();

  function handleToggleTool(toolName: string) {
    setToolsSaved(false);
    setEnabledTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolName)) {
        next.delete(toolName);
      } else {
        next.add(toolName);
      }
      return next;
    });
  }

  function handleToggleAll() {
    setToolsSaved(false);
    const allEnabled = enabledTools.size === templateTools.length;
    if (allEnabled) {
      setEnabledTools(new Set());
    } else {
      setEnabledTools(new Set(templateTools.map((t) => t.name)));
    }
  }

  async function handleSaveTools() {
    setSavingTools(true);
    setToolsSaved(false);
    try {
      // If all tools are enabled, send null (meaning "all")
      const allEnabled = enabledTools.size === templateTools.length;
      const allowedTools = allEnabled ? null : Array.from(enabledTools);

      const res = await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowedTools }),
      });
      if (res.ok) {
        setToolsSaved(true);
        router.refresh();
      }
    } finally {
      setSavingTools(false);
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() === "" || name === server.name) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== server.name) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/servers/${server.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleRotateToken() {
    setRotating(true);
    try {
      const res = await fetch(`/api/servers/${server.id}/rotate-token`, {
        method: "POST",
      });
      if (res.ok) {
        const data = (await res.json()) as { token: string; endpointUrl: string };
        setNewEndpointUrl(data.endpointUrl);
      }
    } finally {
      setRotating(false);
    }
  }

  // Credential expiry detection
  const credentialExpiryBanner = (() => {
    if (!server.credential_expires_at) return null;
    const expiresAt = new Date(server.credential_expires_at);
    const now = new Date();
    const msRemaining = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900">
              Your credentials have expired
            </p>
            <p className="mt-1 text-sm text-red-700">
              Update them to restore your server.
            </p>
          </div>
        </div>
      );
    }

    if (daysRemaining < 14) {
      const isUrgent = daysRemaining <= 3;
      const borderColor = isUrgent ? "border-red-200" : "border-amber-200";
      const bgColor = isUrgent ? "bg-red-50" : "bg-amber-50";
      const iconColor = isUrgent ? "text-red-600" : "text-amber-600";
      const titleColor = isUrgent ? "text-red-900" : "text-amber-900";
      const textColor = isUrgent ? "text-red-700" : "text-amber-700";

      return (
        <div
          className={`flex items-start gap-3 rounded-xl border ${borderColor} ${bgColor} p-4`}
        >
          <Clock className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
          <div>
            <p className={`text-sm font-medium ${titleColor}`}>
              Your credentials expire in {daysRemaining}{" "}
              {daysRemaining === 1 ? "day" : "days"}
            </p>
            <p className={`mt-1 text-sm ${textColor}`}>
              Expires on {expiresAt.toLocaleDateString()}. Update your
              credentials to avoid downtime.
            </p>
          </div>
        </div>
      );
    }

    return null;
  })();

  return (
    <div className="space-y-6">
      {credentialExpiryBanner}

      {/* Display name */}
      <form
        onSubmit={handleSaveName}
        className="rounded-xl border border-gray-200 bg-white p-5"
      >
        <h2 className="text-sm font-semibold text-gray-900">Display Name</h2>
        <p className="mt-1 text-xs text-gray-500">
          A friendly name for this server shown in the dashboard.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving || name.trim() === "" || name === server.name}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>

      {/* Update credentials */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Credentials</h2>
        <p className="mt-1 text-xs text-gray-500">
          Update the credentials for this server. The new credentials will be
          validated before saving.
        </p>
        <div className="mt-3">
          <textarea
            rows={3}
            placeholder="Paste new credential (e.g., API key or token)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Validate &amp; Save
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Credential update will be available once validation is implemented
          (T016).
        </p>
      </div>

      {/* Tool toggles */}
      {templateTools.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Tools</h2>
            </div>
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-xs font-medium text-brand-500 hover:text-brand-600"
            >
              {enabledTools.size === templateTools.length
                ? "Disable all"
                : "Enable all"}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Choose which tools are available on this server. Disabled tools will
            not appear in the MCP capabilities response.
          </p>
          <div className="mt-3 divide-y divide-gray-100">
            {templateTools.map((tool) => {
              const enabled = enabledTools.has(tool.name);
              return (
                <label
                  key={tool.name}
                  className="flex cursor-pointer items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {tool.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {tool.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => handleToggleTool(tool.name)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                      enabled ? "bg-brand-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        enabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </label>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {enabledTools.size} of {templateTools.length} tools enabled
            </p>
            <div className="flex items-center gap-2">
              {toolsSaved && (
                <span className="text-xs text-green-600">Saved</span>
              )}
              <button
                type="button"
                onClick={handleSaveTools}
                disabled={savingTools || !toolsChanged}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                {savingTools ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotate token */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Rotate Token</h2>
        <p className="mt-1 text-xs text-gray-500">
          Generate a new server token if you suspect the current one has been
          compromised. Rotating your token will immediately invalidate the old
          one. You will need to update your client config.
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowRotateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
          >
            <RefreshCw className="h-4 w-4" />
            Rotate Token
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-xs text-gray-500">
          Permanently delete this server. This action cannot be undone.
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Delete Server
          </button>
        </div>
      </div>

      {/* Rotate token confirmation modal */}
      {showRotateModal && !newEndpointUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <RefreshCw className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Rotate Server Token
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              This will generate a new token for{" "}
              <strong>{server.name}</strong> and immediately invalidate the
              current one. Any clients using the old endpoint URL will stop
              working.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRotateModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRotateToken}
                disabled={rotating}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
              >
                {rotating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Rotate Token"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotate token success modal */}
      {newEndpointUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Token Rotated
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Your server token has been rotated. Update your client
              configuration with the new endpoint URL:
            </p>
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <code className="break-all text-xs text-gray-800">
                {newEndpointUrl}
              </code>
            </div>
            <p className="mt-2 text-xs text-amber-600">
              Make sure to copy this URL. The old endpoint will no longer work.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setNewEndpointUrl(null);
                  setShowRotateModal(false);
                  router.refresh();
                }}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Server
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              This will permanently delete <strong>{server.name}</strong> and
              all its logs. This action cannot be undone.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Type <strong>{server.name}</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={server.name}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConfirm !== server.name || deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
