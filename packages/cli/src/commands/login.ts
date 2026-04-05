import { Command } from "commander";
import http from "node:http";
import { writeConfig, getConfigPath } from "../config.js";
import { getApiBase } from "../api.js";
import { output, fatal } from "../output.js";

/**
 * `relay login`
 *
 * Opens the browser to the Relay web app's CLI auth page.
 * A local HTTP server listens for the callback with the session token.
 */
export function registerLoginCommand(program: Command): void {
  program
    .command("login")
    .description("Authenticate with your Relay account")
    .option("--api-base <url>", "Override the Relay API base URL")
    .action(async (opts: { apiBase?: string }) => {
      const apiBase = getApiBase(opts.apiBase);
      const callbackPort = await findFreePort();
      const callbackUrl = `http://localhost:${callbackPort}/callback`;

      // Start local server to receive the token
      const tokenPromise = startCallbackServer(callbackPort);

      // Build the auth URL
      const authUrl = `${apiBase}/cli/auth?callback=${encodeURIComponent(callbackUrl)}`;

      console.log("Opening browser for authentication...");
      console.log(`If the browser doesn't open, visit:\n  ${authUrl}\n`);

      // Dynamic import for ESM-only 'open' package
      try {
        const open = await import("open");
        await open.default(authUrl);
      } catch {
        // If open fails (e.g. headless server), just show the URL
        console.log("Could not open browser automatically. Please open the URL above.");
      }

      console.log("Waiting for authentication...");

      try {
        const token = await tokenPromise;

        writeConfig({
          token,
          apiBase,
        });

        output(
          { ok: true, configPath: getConfigPath() },
          `Logged in successfully!\nCredentials saved to ${getConfigPath()}`,
        );
      } catch (err) {
        fatal(
          err instanceof Error ? err.message : "Authentication failed",
        );
      }
    });
}

/** Find a free port for the callback server. */
function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        const port = addr.port;
        server.close(() => resolve(port));
      } else {
        server.close(() => reject(new Error("Could not find free port")));
      }
    });
    server.on("error", reject);
  });
}

/**
 * Start a one-shot HTTP server that waits for the auth callback.
 * The callback will have `?token=<jwt>` in the query string.
 * Returns a promise that resolves with the token.
 */
function startCallbackServer(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("Authentication timed out after 5 minutes"));
    }, 5 * 60 * 1000);

    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);

      if (url.pathname === "/callback") {
        const token = url.searchParams.get("token");

        if (token) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h2>Authenticated!</h2><p>You can close this tab and return to the terminal.</p></body></html>",
          );
          clearTimeout(timeout);
          server.close();
          resolve(token);
        } else {
          const error = url.searchParams.get("error") ?? "No token received";
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(
            `<html><body><h2>Authentication failed</h2><p>${error}</p></body></html>`,
          );
          clearTimeout(timeout);
          server.close();
          reject(new Error(error));
        }
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(port);
    server.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
