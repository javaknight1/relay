"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SignUpButton, Show } from "@clerk/nextjs";

type BillingPeriod = "monthly" | "annual";

const TIERS = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    servers: "2",
    requests: "1K/mo",
    highlight: false,
    cta: "Get started",
    ctaStyle: "secondary" as const,
    href: null,
    features: [
      "2 MCP servers",
      "1,000 requests/mo",
      "Community support",
      "Basic analytics",
    ],
  },
  {
    name: "Pro",
    monthly: 29,
    annual: 24,
    servers: "10",
    requests: "20K/mo",
    highlight: true,
    cta: "Get started",
    ctaStyle: "primary" as const,
    href: null,
    features: [
      "10 MCP servers",
      "20,000 requests/mo",
      "Priority support",
      "Advanced analytics",
      "Custom domains",
      "Webhook notifications",
    ],
  },
  {
    name: "Team",
    monthly: 79,
    annual: 66,
    servers: "25",
    requests: "100K/mo",
    highlight: false,
    cta: "Get started",
    ctaStyle: "secondary" as const,
    href: null,
    features: [
      "25 MCP servers",
      "100,000 requests/mo",
      "Priority support",
      "Advanced analytics",
      "Custom domains",
      "Webhook notifications",
      "Team collaboration",
      "Role-based access",
    ],
  },
  {
    name: "Enterprise",
    monthly: -1,
    annual: -1,
    servers: "Unlimited",
    requests: "Unlimited",
    highlight: false,
    cta: "Contact us",
    ctaStyle: "secondary" as const,
    href: "mailto:sales@relay.app",
    features: [
      "Unlimited MCP servers",
      "Unlimited requests",
      "Dedicated support",
      "Advanced analytics",
      "Custom domains",
      "Webhook notifications",
      "Team collaboration",
      "Role-based access",
      "SSO / SAML",
      "SLA guarantee",
    ],
  },
];

export default function PricingToggle() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${period === "monthly" ? "text-gray-900" : "text-gray-500"}`}
        >
          Monthly
        </span>
        <button
          onClick={() =>
            setPeriod(period === "monthly" ? "annual" : "monthly")
          }
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          style={{
            backgroundColor: period === "annual" ? "#6366f1" : "#d1d5db",
          }}
          aria-label="Toggle billing period"
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              period === "annual" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${period === "annual" ? "text-gray-900" : "text-gray-500"}`}
        >
          Annual
        </span>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
          Save 20%
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const price = period === "monthly" ? tier.monthly : tier.annual;
          const isCustom = price === -1;

          return (
            <div
              key={tier.name}
              className={`relative rounded-xl border bg-white p-8 ${
                tier.highlight
                  ? "border-brand-500 ring-1 ring-brand-500"
                  : "border-gray-200"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900">
                {tier.name}
              </h3>

              <div className="mt-4">
                {isCustom ? (
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-gray-500">/mo</span>
                    )}
                  </>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {tier.href ? (
                  <a
                    href={tier.href}
                    className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <>
                    <Show when="signed-out">
                      <SignUpButton>
                        <button
                          className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                            tier.ctaStyle === "primary"
                              ? "bg-brand-500 text-white hover:bg-brand-600"
                              : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {tier.cta}
                        </button>
                      </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                      <a
                        href="/dashboard"
                        className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                          tier.ctaStyle === "primary"
                            ? "bg-brand-500 text-white hover:bg-brand-600"
                            : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Go to Dashboard
                      </a>
                    </Show>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
