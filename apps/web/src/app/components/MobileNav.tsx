"use client";

import { useState } from "react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#compare", label: "Compare" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        <div className="flex flex-col items-center justify-center gap-1.5">
          <span
            className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-white pt-20">
          <nav className="flex flex-col items-center gap-6 p-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-lg font-medium text-gray-700 hover:text-brand-600"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col items-center gap-3">
              <Show when="signed-out">
                <SignInButton>
                  <button className="w-48 rounded-lg px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="w-48 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600">
                    Sign up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <a
                  href="/dashboard"
                  className="w-48 rounded-lg bg-brand-500 px-6 py-3 text-center text-sm font-medium text-white hover:bg-brand-600"
                >
                  Dashboard
                </a>
                <UserButton />
              </Show>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
