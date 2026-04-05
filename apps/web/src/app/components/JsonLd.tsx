/**
 * JSON-LD structured data components for SEO and GEO (Generative Engine Optimization).
 * These schemas help search engines and AI systems understand page content.
 */

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** WebApplication schema for the landing page */
export function WebApplicationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Relay",
    url: "https://relay.club",
    description:
      "Managed MCP server hosting platform. Deploy pre-built MCP servers for GitHub, Notion, Slack, Brave Search, PostgreSQL, Google Drive, Linear, Jira, and Airtable in minutes.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "3.00",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "3.00",
        priceCurrency: "USD",
        unitText: "server per month",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "MON",
        },
      },
      description: "$3 per server per month with unlimited API calls",
    },
    featureList: [
      "Pre-built MCP server templates",
      "AES-256 credential encryption",
      "Cloudflare Workers edge execution",
      "Unlimited API calls",
      "Real-time logs and analytics",
      "Per-tool toggles",
      "Auto-generated client configuration",
      "90-day log retention",
    ],
    screenshot: "https://relay.club/og-image.png",
    softwareHelp: {
      "@type": "CreativeWork",
      url: "https://relay.club/docs",
    },
    creator: {
      "@type": "Organization",
      name: "Relay",
      url: "https://relay.club",
    },
  };

  return <JsonLd data={data} />;
}

/** HowTo schema describing the 3-step deployment process */
export function HowToJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to deploy a managed MCP server with Relay",
    description:
      "Deploy a production-ready MCP server in 3 simple steps — no Docker, CLI, or infrastructure to manage.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Pick a template",
        text: "Choose from GitHub, Notion, Slack, Brave Search, PostgreSQL, Google Drive, and more. Each template is pre-configured with the right tools.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Enter credentials",
        text: "Paste your API key or OAuth token. Relay encrypts it with AES-256 and never exposes it to clients.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Get your endpoint",
        text: "Copy your unique MCP endpoint URL and paste it into any MCP-compatible client like Claude Desktop, Cursor, or ChatGPT.",
      },
    ],
  };

  return <JsonLd data={data} />;
}

/** FAQ schema for the pricing page */
export function PricingFaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does per-server billing work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You pay $3 per month for each active MCP server. When you add a server, it's added to your monthly bill. When you remove a server, the charge is prorated and removed from your next invoice.",
        },
      },
      {
        "@type": "Question",
        name: "What happens when I add or remove servers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Adding a server immediately updates your subscription. Removing a server prorates the remaining time and reduces your next bill. You're never charged for servers you've deleted.",
        },
      },
      {
        "@type": "Question",
        name: "Are there any limits on API calls?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Every server comes with unlimited API calls. We don't throttle or cap usage — your MCP servers work as much as you need them to.",
        },
      },
      {
        "@type": "Question",
        name: "What payment methods do you accept?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We accept all major credit cards (Visa, Mastercard, American Express) and process payments securely through Stripe. Enterprise customers can also pay by invoice.",
        },
      },
      {
        "@type": "Question",
        name: "Can I cancel anytime?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can delete any server at any time and your bill adjusts immediately. There are no contracts or cancellation fees.",
        },
      },
    ],
  };

  return <JsonLd data={data} />;
}

/** Organization schema for site-wide use */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Relay",
    url: "https://relay.club",
    logo: "https://relay.club/logo.png",
    description:
      "Managed MCP server hosting. Deploy pre-built MCP servers in minutes, not days.",
    sameAs: [],
  };

  return <JsonLd data={data} />;
}
