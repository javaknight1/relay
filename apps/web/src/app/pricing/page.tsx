import type { Metadata } from "next";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import MobileNav from "../components/MobileNav";
import PricingCard from "./PricingCard";

export const metadata: Metadata = {
  title: "Pricing — Relay",
  description:
    "Simple, transparent pricing for managed MCP server hosting. $3 per server per month.",
};

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
];

const FAQS = [
  {
    question: "How does per-server billing work?",
    answer:
      "You pay $3 per month for each active MCP server. When you add a server, it's added to your monthly bill. When you remove a server, the charge is prorated and removed from your next invoice.",
  },
  {
    question: "What happens when I add or remove servers?",
    answer:
      "Adding a server immediately updates your subscription. Removing a server prorates the remaining time and reduces your next bill. You're never charged for servers you've deleted.",
  },
  {
    question: "Are there any limits on API calls?",
    answer:
      "No. Every server comes with unlimited API calls. We don't throttle or cap usage — your MCP servers work as much as you need them to.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and process payments securely through Stripe. Enterprise customers can also pay by invoice.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can delete any server at any time and your bill adjusts immediately. There are no contracts or cancellation fees.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="/"
            className="text-xl font-bold tracking-tight text-gray-900"
          >
            Relay
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Show when="signed-out">
              <SignInButton>
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600">
                  Sign up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <a
                href="/dashboard"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                Dashboard
              </a>
              <UserButton />
            </Show>
          </div>

          <MobileNav />
        </div>
      </header>

      {/* ── Hero Header ── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Pay per server. Unlimited API calls. No surprises.
          </p>

          <div className="mt-10">
            <PricingCard />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-gray-100 bg-gray-50/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about our pricing.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-10">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <p className="mt-2 leading-relaxed text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="bg-gradient-animated overflow-hidden rounded-2xl px-8 py-16 text-center shadow-xl sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to give your AI real tools?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Deploy your first MCP server in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Show when="signed-out">
                <SignUpButton>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-lg transition-all hover:bg-gray-50">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-lg transition-all hover:bg-gray-50"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Show>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Unlimited API calls
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Pay per server
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-gray-50/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <span className="text-sm font-semibold text-gray-900">Relay</span>
          <nav className="flex gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <span className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Relay. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
