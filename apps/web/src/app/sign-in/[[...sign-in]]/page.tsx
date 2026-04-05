import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Relay account to manage your MCP servers, view logs, and configure integrations.",
  alternates: {
    canonical: "https://relay.club/sign-in",
  },
};

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
