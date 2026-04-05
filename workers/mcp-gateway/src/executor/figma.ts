import type { ToolExecutor } from "./index";

const FIGMA_API = "https://api.figma.com/v1";

/** Call the Figma REST API with the user's personal access token. */
async function figmaFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${FIGMA_API}${path}`, {
    ...init,
    headers: {
      "X-FIGMA-TOKEN": token,
      ...init?.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { err?: string }).err ??
      (body as { message?: string }).message ??
      `Figma API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Figma auth failed: ${msg}. Please update your credentials.`);
    }
    throw new Error(`Figma API error (${res.status}): ${msg}`);
  }

  return body;
}

/** Build a query-string from optional params, omitting undefined values. */
function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<string, (a: Args, token: string) => Promise<unknown>> = {
  get_file(a, token) {
    return figmaFetch(`/files/${a.file_key}${qs({ depth: a.depth })}`, token);
  },

  get_file_components(a, token) {
    return figmaFetch(`/files/${a.file_key}/components`, token);
  },

  get_component(a, token) {
    return figmaFetch(`/components/${a.component_key}`, token);
  },

  get_styles(a, token) {
    return figmaFetch(`/files/${a.file_key}/styles`, token);
  },

  get_team_projects(a, token) {
    return figmaFetch(`/teams/${a.team_id}/projects`, token);
  },

  get_project_files(a, token) {
    return figmaFetch(`/projects/${a.project_id}/files`, token);
  },

  get_images(a, token) {
    return figmaFetch(
      `/images/${a.file_key}${qs({ ids: a.ids, format: a.format, scale: a.scale })}`,
      token,
    );
  },

  get_variables(a, token) {
    return figmaFetch(`/files/${a.file_key}/variables/local`, token);
  },
};

// ── Executor ────────────────────────────────────────────────

export const figmaExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const token = credentials.personal_access_token as string | undefined;
    if (!token) {
      throw new Error("Missing Figma personal access token in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Figma tool: ${name}`);
    }

    return handler(args, token);
  },
};
