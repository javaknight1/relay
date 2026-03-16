"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ServerRow } from "@relay/shared";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ServerSettingsForm({
  server,
}: {
  server: ServerRow;
}) {
  const router = useRouter();
  const [name, setName] = useState(server.name);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div className="space-y-6">
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
