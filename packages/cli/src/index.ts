import { Command } from "commander";
import { setJsonMode } from "./output.js";
import { registerLoginCommand } from "./commands/login.js";
import { registerLogoutCommand } from "./commands/logout.js";
import { registerStatusCommand } from "./commands/status.js";
import { registerServersCommand } from "./commands/servers.js";
import { registerConfigCommand } from "./commands/config-generate.js";

const program = new Command();

program
  .name("relay")
  .description("Relay CLI — manage MCP servers from the command line")
  .version("0.1.0")
  .option("--json", "Output machine-readable JSON")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts() as { json?: boolean };
    if (opts.json) {
      setJsonMode(true);
    }
  });

// Register all commands
registerLoginCommand(program);
registerLogoutCommand(program);
registerStatusCommand(program);
registerServersCommand(program);
registerConfigCommand(program);

program.parse();
