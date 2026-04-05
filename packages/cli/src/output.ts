// ── Output helpers ──────────────────────────────────────────────
// Support --json flag for machine-readable output, and pretty output for humans.

let jsonMode = false;

export function setJsonMode(enabled: boolean): void {
  jsonMode = enabled;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

/** Print data: JSON when --json is set, otherwise pretty human text. */
export function output(data: unknown, prettyText?: string): void {
  if (jsonMode) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(prettyText ?? JSON.stringify(data, null, 2));
  }
}

/** Print an error and exit. */
export function fatal(message: string, exitCode = 1): never {
  if (jsonMode) {
    console.error(JSON.stringify({ error: message }));
  } else {
    console.error(`Error: ${message}`);
  }
  process.exit(exitCode);
}

/** Format a table for terminal output. */
export function table(
  headers: string[],
  rows: string[][],
): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length)),
  );

  const divider = colWidths.map((w) => "-".repeat(w + 2)).join("+");
  const formatRow = (row: string[]) =>
    row.map((cell, i) => ` ${(cell ?? "").padEnd(colWidths[i])} `).join("|");

  const lines: string[] = [];
  lines.push(formatRow(headers));
  lines.push(divider);
  for (const row of rows) {
    lines.push(formatRow(row));
  }
  return lines.join("\n");
}

/** Format a status with color (basic ANSI). */
export function colorStatus(status: string): string {
  switch (status) {
    case "running":
      return `\x1b[32m${status}\x1b[0m`; // green
    case "deploying":
      return `\x1b[33m${status}\x1b[0m`; // yellow
    case "stopped":
      return `\x1b[90m${status}\x1b[0m`; // gray
    case "error":
      return `\x1b[31m${status}\x1b[0m`; // red
    default:
      return status;
  }
}
