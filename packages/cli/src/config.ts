import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// ── Config file location ────────────────────────────────────────

const CONFIG_DIR = path.join(os.homedir(), ".relay");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface CliConfig {
  /** Clerk session token (JWT) for authenticating API calls */
  token: string;
  /** Base URL of the Relay web API */
  apiBase: string;
}

/** Read the stored config, or return null if none exists. */
export function readConfig(): CliConfig | null {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as CliConfig;
  } catch {
    return null;
  }
}

/** Persist a config to disk. Creates ~/.relay/ if needed. */
export function writeConfig(config: CliConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", {
    mode: 0o600,
  });
}

/** Delete the stored config (logout). */
export function deleteConfig(): void {
  try {
    fs.unlinkSync(CONFIG_FILE);
  } catch {
    // ignore if already absent
  }
}

/** Get the config dir path (for display purposes). */
export function getConfigPath(): string {
  return CONFIG_FILE;
}
