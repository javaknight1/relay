import { Check } from "lucide-react";
import { SignUpButton, Show } from "@clerk/nextjs";

const FEATURES = [
  "Unlimited API calls",
  "All integrations included",
  "90-day log retention",
  "Priority support",
  "Cancel anytime",
];

export default function PricingCard() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-brand-500 bg-white p-8 ring-1 ring-brand-500">
      <h3 className="text-lg font-semibold text-gray-900">Per Server</h3>

      <div className="mt-4">
        <span className="text-4xl font-bold tracking-tight text-gray-900">
          $3
        </span>
        <span className="text-sm text-gray-500"> / server / month</span>
      </div>

      <ul className="mt-6 space-y-3">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Show when="signed-out">
          <SignUpButton>
            <button className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600">
              Get started
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <a
            href="/dashboard"
            className="block w-full rounded-lg bg-brand-500 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            Go to Dashboard
          </a>
        </Show>
      </div>
    </div>
  );
}
