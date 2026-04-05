import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { PostHogProvider } from "./posthog-provider";
import { OrganizationJsonLd } from "./components/JsonLd";
import "./globals.css";

const SITE_URL = "https://relay.club";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Relay — Managed MCP Server Hosting",
    template: "%s | Relay",
  },
  description:
    "Deploy managed MCP servers in minutes. Pick a template (GitHub, Notion, Slack, PostgreSQL, and more), enter your credentials, and get a live endpoint. $3/server/month with unlimited API calls.",
  keywords: [
    "MCP server hosting",
    "managed MCP servers",
    "Model Context Protocol",
    "MCP hosting platform",
    "Claude MCP server",
    "AI tool hosting",
    "MCP endpoint",
    "GitHub MCP server",
    "Notion MCP server",
    "Slack MCP server",
  ],
  authors: [{ name: "Relay" }],
  creator: "Relay",
  publisher: "Relay",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Relay — Managed MCP Server Hosting",
    description:
      "Deploy managed MCP servers in minutes. Pick a template, enter your credentials, get a live endpoint. $3/server/month.",
    siteName: "Relay",
    url: SITE_URL,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Relay — Managed MCP Server Hosting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Relay — Managed MCP Server Hosting",
    description:
      "Deploy managed MCP servers in minutes. Pick a template, enter your credentials, get a live endpoint. $3/server/month.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body className="font-sans antialiased">
          <OrganizationJsonLd />
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
