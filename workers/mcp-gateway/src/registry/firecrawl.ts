import type { MCPToolDefinition } from "@relay/shared";

export const firecrawlTools: MCPToolDefinition[] = [
  {
    name: "scrape_url",
    description:
      "Scrape a single URL and extract its content as clean markdown, HTML, or structured data",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to scrape",
        },
        formats: {
          type: "array",
          items: {
            type: "string",
            enum: ["markdown", "html", "rawHtml", "links", "screenshot"],
          },
          description: "Output formats to return",
          default: ["markdown"],
        },
        only_main_content: {
          type: "boolean",
          description: "Only return the main content (exclude headers, footers, navs)",
          default: true,
        },
        wait_for: {
          type: "number",
          description: "Milliseconds to wait for page to load before scraping",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "crawl_site",
    description:
      "Start an asynchronous crawl of an entire website, following links from the starting URL",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Starting URL for the crawl",
        },
        limit: {
          type: "number",
          description: "Maximum number of pages to crawl",
          default: 50,
        },
        max_depth: {
          type: "number",
          description: "Maximum link depth to follow from the starting URL",
        },
        include_paths: {
          type: "array",
          items: { type: "string" },
          description: "Only crawl URLs matching these glob patterns",
        },
        exclude_paths: {
          type: "array",
          items: { type: "string" },
          description: "Skip URLs matching these glob patterns",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "search_web",
    description:
      "Search the web and optionally scrape results to get full page content",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
        limit: {
          type: "number",
          description: "Number of results to return",
          default: 5,
        },
        lang: {
          type: "string",
          description: "Language code (e.g. 'en', 'fr')",
        },
        country: {
          type: "string",
          description: "Country code (e.g. 'us', 'gb')",
        },
        scrape_options: {
          type: "object",
          description: "Options for scraping search results",
          properties: {
            formats: {
              type: "array",
              items: { type: "string" },
              description: "Output formats (e.g. ['markdown'])",
            },
          },
        },
      },
      required: ["query"],
    },
  },
  {
    name: "extract_data",
    description:
      "Extract structured data from one or more URLs using a natural language prompt or schema",
    inputSchema: {
      type: "object",
      properties: {
        urls: {
          type: "array",
          items: { type: "string" },
          description: "URLs to extract data from",
        },
        prompt: {
          type: "string",
          description: "Natural language description of the data to extract",
        },
        schema: {
          type: "object",
          description: "JSON schema defining the structure of data to extract",
        },
      },
      required: ["urls"],
    },
  },
  {
    name: "get_crawl_status",
    description:
      "Check the status and get results of an asynchronous crawl job",
    inputSchema: {
      type: "object",
      properties: {
        crawl_id: {
          type: "string",
          description: "The crawl job ID returned by crawl_site",
        },
      },
      required: ["crawl_id"],
    },
  },
  {
    name: "map_site",
    description:
      "Get a sitemap-like list of all URLs on a website without full content scraping",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Website URL to map",
        },
        limit: {
          type: "number",
          description: "Maximum number of URLs to return",
          default: 5000,
        },
        search: {
          type: "string",
          description: "Optional search term to filter URLs",
        },
      },
      required: ["url"],
    },
  },
];
