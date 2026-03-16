import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
        <Settings className="h-6 w-6 text-gray-400" />
      </div>
      <h2 className="mt-4 text-sm font-semibold text-gray-900">Settings</h2>
      <p className="mt-1 text-sm text-gray-500">
        Account settings, display name, and account management will appear here.
      </p>
    </div>
  );
}
