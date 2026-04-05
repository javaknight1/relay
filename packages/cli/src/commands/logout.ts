import { Command } from "commander";
import { deleteConfig, getConfigPath } from "../config.js";
import { output } from "../output.js";

/**
 * `relay logout`
 *
 * Removes the stored authentication token.
 */
export function registerLogoutCommand(program: Command): void {
  program
    .command("logout")
    .description("Remove stored authentication credentials")
    .action(() => {
      deleteConfig();
      output(
        { ok: true },
        `Logged out. Credentials removed from ${getConfigPath()}`,
      );
    });
}
