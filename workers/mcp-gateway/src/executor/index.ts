import type { ServerType } from "@relay/shared";

import type { RouteContext } from "../index";
import { braveExecutor } from "./brave";
import { githubExecutor } from "./github";
import { notionExecutor } from "./notion";

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
// T028–T032 will replace entries with real implementations.
const stubExecutor: ToolExecutor = {
  async executeTool(name) {
    throw new Error(`Tool handler for "${name}" is not yet implemented`);
  },
};

const executors: Record<ServerType, ToolExecutor> = {
  github: githubExecutor,
  notion: notionExecutor,
  brave: braveExecutor,
  slack: stubExecutor,
  postgres: stubExecutor,
  gdrive: stubExecutor,
};

export function getExecutor(type: ServerType): ToolExecutor {
  return executors[type];
}
