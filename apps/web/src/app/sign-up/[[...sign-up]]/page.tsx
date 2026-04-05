import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free Relay account and deploy your first managed MCP server in minutes. No credit card required.",
  alternates: {
    canonical: "https://relay.club/sign-up",
  },
};

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
