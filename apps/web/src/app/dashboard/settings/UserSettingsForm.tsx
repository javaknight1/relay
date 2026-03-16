"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function UserSettingsForm({
  userName,
  userEmail,
}: {
  userName: string | null;
  userEmail: string | null;
}) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [name, setName] = useState(userName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (name === (userName ?? "")) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "delete my account") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (res.ok) {
        await signOut();
        router.push("/");
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
          Your name shown in the dashboard and emails.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder="Your name"
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <div className="mt-3 flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs text-emerald-600">Saved</span>
          )}
          <button
            type="submit"
            disabled={saving || name === (userName ?? "")}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        </div>
      </form>

      {/* Email (read-only via Clerk) */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Email Address</h2>
        <p className="mt-1 text-xs text-gray-500">
          Managed by your authentication provider. Cannot be changed here.
        </p>
        <input
          type="email"
          value={userEmail ?? ""}
          disabled
          className="mt-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
        />
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-xs text-gray-500">
          Permanently delete your account, all servers, credentials, and logs.
          This action cannot be undone.
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Delete Account
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
                Delete Account
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              This will permanently delete your account and all associated data
              including servers, encrypted credentials, and logs. You will be
              signed out immediately.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Type <strong>delete my account</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="delete my account"
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
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "delete my account" || deleting}
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
