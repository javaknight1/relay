import Link from "next/link";
import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
        <CreditCard className="h-6 w-6 text-gray-400" />
      </div>
      <h2 className="mt-4 text-sm font-semibold text-gray-900">Billing</h2>
      <p className="mt-1 text-sm text-gray-500">
        Manage your subscription and payment details here.
      </p>
      <Link
        href="/pricing"
        className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        View pricing
      </Link>
    </div>
  );
}
