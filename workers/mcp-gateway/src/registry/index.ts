import type { MCPToolDefinition, ServerType } from "@relay/shared";

import { asanaTools } from "./asana";
import { braveTools } from "./brave";
import { confluenceTools } from "./confluence";
import { discordTools } from "./discord";
import { figmaTools } from "./figma";
import { firecrawlTools } from "./firecrawl";
import { githubTools } from "./github";
import { gitlabTools } from "./gitlab";
import { hubspotTools } from "./hubspot";
import { airtableTools } from "./airtable";
import { jiraTools } from "./jira";
import { linearTools } from "./linear";
import { mongodbTools } from "./mongodb";
import { mysqlTools } from "./mysql";
import { notionTools } from "./notion";
import { postgresTools } from "./postgres";
import { redisTools } from "./redis";
import { salesforceTools } from "./salesforce";
import { sentryTools } from "./sentry";
import { shopifyTools } from "./shopify";
import { slackTools } from "./slack";
import { stripeTools } from "./stripe";
import { todoistTools } from "./todoist";
import { twilioTools } from "./twilio";

const toolsByType: Partial<Record<ServerType, MCPToolDefinition[]>> = {
  github: githubTools,
  notion: notionTools,
  brave: braveTools,
  slack: slackTools,
  postgres: postgresTools,
  gdrive: [], // T033 — tool definitions registered in executor only
  linear: linearTools,
  jira: jiraTools,
  airtable: airtableTools,
  mongodb: mongodbTools,
  mysql: mysqlTools,
  redis: redisTools,
  stripe: stripeTools,
  figma: figmaTools,
  shopify: shopifyTools,
  salesforce: salesforceTools,
  asana: asanaTools,
  todoist: todoistTools,
  twilio: twilioTools,
  firecrawl: firecrawlTools,
  discord: discordTools,
  sentry: sentryTools,
  gitlab: gitlabTools,
  confluence: confluenceTools,
  hubspot: hubspotTools,
};

/**
 * Return tool definitions for a server type, optionally filtered by allowedTools.
 *
 * - `allowedTools: null`  → all tools for the type
 * - `allowedTools: [...]` → only matching tools
 */
export function getToolsForServer(
  type: ServerType,
  allowedTools: string[] | null,
): MCPToolDefinition[] {
  const all = toolsByType[type] ?? [];
  if (!allowedTools) return all;
  const allowed = new Set(allowedTools);
  return all.filter((t) => allowed.has(t.name));
}
