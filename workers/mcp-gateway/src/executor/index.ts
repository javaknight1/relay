import type { ServerType } from "@relay/shared";

import type { RouteContext } from "../index";
import { asanaExecutor } from "./asana";
import { braveExecutor } from "./brave";
import { confluenceExecutor } from "./confluence";
import { discordExecutor } from "./discord";
import { figmaExecutor } from "./figma";
import { firecrawlExecutor } from "./firecrawl";
import { gdriveExecutor } from "./gdrive";
import { githubExecutor } from "./github";
import { gitlabExecutor } from "./gitlab";
import { hubspotExecutor } from "./hubspot";
import { airtableExecutor } from "./airtable";
import { jiraExecutor } from "./jira";
import { linearExecutor } from "./linear";
import { mongodbExecutor } from "./mongodb";
import { mysqlExecutor } from "./mysql";
import { notionExecutor } from "./notion";
import { postgresExecutor } from "./postgres";
import { redisExecutor } from "./redis";
import { salesforceExecutor } from "./salesforce";
import { sentryExecutor } from "./sentry";
import { shopifyExecutor } from "./shopify";
import { slackExecutor } from "./slack";
import { stripeExecutor } from "./stripe";
import { todoistExecutor } from "./todoist";
import { twilioExecutor } from "./twilio";

/** Interface that each server-type handler implements (T028–T032). */
export interface ToolExecutor {
  executeTool(
    name: string,
    args: Record<string, unknown>,
    credentials: Record<string, unknown>,
    routeCtx: RouteContext,
  ): Promise<unknown>;
}

// Stub executor — throws for all tools.
const stubExecutor: ToolExecutor = {
  async executeTool(name) {
    throw new Error(`Tool handler for "${name}" is not yet implemented`);
  },
};

const executors: Partial<Record<ServerType, ToolExecutor>> = {
  github: githubExecutor,
  notion: notionExecutor,
  brave: braveExecutor,
  slack: slackExecutor,
  postgres: postgresExecutor,
  gdrive: gdriveExecutor,
  linear: linearExecutor,
  jira: jiraExecutor,
  airtable: airtableExecutor,
  mongodb: mongodbExecutor,
  mysql: mysqlExecutor,
  redis: redisExecutor,
  stripe: stripeExecutor,
  figma: figmaExecutor,
  shopify: shopifyExecutor,
  salesforce: salesforceExecutor,
  asana: asanaExecutor,
  todoist: todoistExecutor,
  twilio: twilioExecutor,
  firecrawl: firecrawlExecutor,
  discord: discordExecutor,
  sentry: sentryExecutor,
  gitlab: gitlabExecutor,
  confluence: confluenceExecutor,
  hubspot: hubspotExecutor,
};

export function getExecutor(type: ServerType): ToolExecutor {
  return executors[type] ?? stubExecutor;
}
