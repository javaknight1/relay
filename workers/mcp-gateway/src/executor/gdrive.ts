import type { ToolExecutor } from "./index";

const DRIVE_API = "https://www.googleapis.com/drive/v3";

// ── Service account JWT auth ────────────────────────────────

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signJwt(
  payload: Record<string, unknown>,
  privateKeyPem: string,
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const enc = new TextEncoder();

  // Import PEM key
  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const unsignedToken =
    base64url(JSON.stringify(header)) +
    "." +
    base64url(JSON.stringify(payload));

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    enc.encode(unsignedToken),
  );

  return (
    unsignedToken +
    "." +
    base64url(String.fromCharCode(...new Uint8Array(signature)))
  );
}

async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJwt(
    {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/drive",
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    },
    sa.private_key,
  );

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const body = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !body.access_token) {
    throw new Error(
      `Google auth failed: ${body.error ?? res.status}. Please update your service account credentials.`,
    );
  }

  return body.access_token;
}

// ── Google Drive fetch helper ───────────────────────────────

async function driveFetch(
  path: string,
  token: string,
  init?: RequestInit & { rawUrl?: boolean },
): Promise<unknown> {
  const url = init?.rawUrl ? path : `${DRIVE_API}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 204) return { success: true };

  const body = await res.json();

  if (!res.ok) {
    const err = (body as { error?: { message?: string } }).error;
    const msg = err?.message ?? `Google Drive API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Google Drive auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Google Drive API error (${res.status}): ${msg}`);
  }

  return body;
}

function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (entries.length === 0) return "";
  return (
    "?" +
    entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
  );
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, token: string) => Promise<unknown>
> = {
  search_files(a, token) {
    const query = String(a.query);
    const q = `fullText contains '${query.replace(/'/g, "\\'")}'`;
    return driveFetch(
      "/files" +
        qs({
          q,
          fields: "files(id,name,mimeType,modifiedTime,size,parents)",
          pageSize: a.page_size ?? 20,
          pageToken: a.page_token,
        }),
      token,
    );
  },

  get_file(a, token) {
    return driveFetch(
      `/files/${a.file_id}` +
        qs({
          fields: "id,name,mimeType,modifiedTime,size,parents,webViewLink,description",
        }),
      token,
    );
  },

  list_folder(a, token) {
    const folderId = (a.folder_id as string) || "root";
    const q = `'${folderId}' in parents and trashed = false`;
    return driveFetch(
      "/files" +
        qs({
          q,
          fields: "files(id,name,mimeType,modifiedTime,size),nextPageToken",
          pageSize: a.page_size ?? 50,
          pageToken: a.page_token,
          orderBy: "folder,name",
        }),
      token,
    );
  },

  async get_file_content(a, token) {
    // First get file metadata to check mimeType
    const meta = (await driveFetch(
      `/files/${a.file_id}` + qs({ fields: "id,name,mimeType,size" }),
      token,
    )) as { mimeType: string; name: string; size?: string };

    const isGoogleDoc = meta.mimeType.startsWith(
      "application/vnd.google-apps.",
    );

    if (isGoogleDoc) {
      // Export Google Docs/Sheets/Slides as plain text
      const exportMime =
        meta.mimeType === "application/vnd.google-apps.spreadsheet"
          ? "text/csv"
          : "text/plain";
      const url =
        `${DRIVE_API}/files/${a.file_id}/export` +
        qs({ mimeType: exportMime });
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(
          `Failed to export file: ${res.status} ${res.statusText}`,
        );
      }
      const text = await res.text();
      return { name: meta.name, mimeType: exportMime, content: text };
    }

    // For binary/text files, check size limit (1 MB)
    const size = meta.size ? parseInt(meta.size, 10) : 0;
    if (size > 1_048_576) {
      throw new Error(
        `File is too large to read (${Math.round(size / 1024)} KB). Maximum is 1 MB.`,
      );
    }

    const url =
      `${DRIVE_API}/files/${a.file_id}` + qs({ alt: "media" });
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(
        `Failed to download file: ${res.status} ${res.statusText}`,
      );
    }
    const text = await res.text();
    return { name: meta.name, mimeType: meta.mimeType, content: text };
  },

  create_folder(a, token) {
    const body: Record<string, unknown> = {
      name: a.name,
      mimeType: "application/vnd.google-apps.folder",
    };
    if (a.parent) body.parents = [a.parent];
    return driveFetch("/files", token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  share_file(a, token) {
    const permission = {
      type: "user",
      role: (a.role as string) || "reader",
      emailAddress: a.email,
    };
    return driveFetch(`/files/${a.file_id}/permissions`, token, {
      method: "POST",
      body: JSON.stringify(permission),
    });
  },
};

// ── Executor ────────────────────────────────────────────────

export const gdriveExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const serviceAccountJson = credentials.serviceAccountKey as
      | string
      | undefined;
    if (!serviceAccountJson) {
      throw new Error(
        "Missing serviceAccountKey in Google Drive credentials",
      );
    }

    let sa: ServiceAccountKey;
    try {
      sa = JSON.parse(serviceAccountJson) as ServiceAccountKey;
    } catch {
      throw new Error(
        "Invalid service account JSON. Please update your credentials.",
      );
    }

    if (!sa.client_email || !sa.private_key || !sa.token_uri) {
      throw new Error(
        "Service account JSON missing required fields (client_email, private_key, token_uri).",
      );
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Google Drive tool: ${name}`);
    }

    const token = await getAccessToken(sa);
    return handler(args, token);
  },
};
