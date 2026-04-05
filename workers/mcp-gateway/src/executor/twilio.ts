import type { ToolExecutor } from "./index";

/**
 * Twilio executor — calls the Twilio REST API.
 *
 * Credentials must include:
 *   - account_sid: Twilio Account SID
 *   - auth_token:  Twilio Auth Token
 */

/** Call the Twilio REST API with Basic auth. */
async function twilioFetch(
  path: string,
  auth: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`https://api.twilio.com${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      ...init?.headers,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    const msg =
      (body as { message?: string }).message ??
      `Twilio API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Twilio auth failed: ${msg}. Please update your credentials.`,
      );
    }
    throw new Error(`Twilio API error (${res.status}): ${msg}`);
  }

  return body;
}

/** Build a query-string from optional params, omitting undefined values. */
function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&")
  );
}

/** Encode params as application/x-www-form-urlencoded body. */
function formBody(params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, accountSid: string, auth: string) => Promise<unknown>
> = {
  send_sms(a, accountSid, auth) {
    return twilioFetch(
      `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      auth,
      {
        method: "POST",
        body: formBody({
          To: a.to,
          From: a.from,
          Body: a.body,
        }),
      },
    );
  },

  list_messages(a, accountSid, auth) {
    return twilioFetch(
      `/2010-04-01/Accounts/${accountSid}/Messages.json${qs({
        To: a.to,
        From: a.from,
        DateSent: a.date_sent,
        PageSize: a.page_size,
      })}`,
      auth,
    );
  },

  get_message(a, accountSid, auth) {
    return twilioFetch(
      `/2010-04-01/Accounts/${accountSid}/Messages/${a.message_sid}.json`,
      auth,
    );
  },

  make_call(a, accountSid, auth) {
    const params: Record<string, unknown> = {
      To: a.to,
      From: a.from,
    };
    if (a.url) params.Url = a.url;
    if (a.twiml) params.Twiml = a.twiml;

    return twilioFetch(
      `/2010-04-01/Accounts/${accountSid}/Calls.json`,
      auth,
      {
        method: "POST",
        body: formBody(params),
      },
    );
  },

  list_calls(a, accountSid, auth) {
    return twilioFetch(
      `/2010-04-01/Accounts/${accountSid}/Calls.json${qs({
        To: a.to,
        From: a.from,
        Status: a.status,
        PageSize: a.page_size,
      })}`,
      auth,
    );
  },

  get_call(a, accountSid, auth) {
    return twilioFetch(
      `/2010-04-01/Accounts/${accountSid}/Calls/${a.call_sid}.json`,
      auth,
    );
  },

  list_phone_numbers(a, accountSid, auth) {
    return twilioFetch(
      `/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json${qs({
        PageSize: a.page_size,
      })}`,
      auth,
    );
  },

  lookup_number(a, _accountSid, auth) {
    const fieldsParam = a.fields ? `?Fields=${encodeURIComponent(String(a.fields))}` : "";
    return twilioFetch(
      `/v2/PhoneNumbers/${encodeURIComponent(String(a.phone_number))}${fieldsParam}`,
      auth,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const twilioExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const accountSid = credentials.account_sid as string | undefined;
    const authToken = credentials.auth_token as string | undefined;

    if (!accountSid || !authToken) {
      throw new Error(
        "Missing Twilio credentials (account_sid, auth_token)",
      );
    }

    const auth = btoa(`${accountSid}:${authToken}`);

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Twilio tool: ${name}`);
    }

    return handler(args, accountSid, auth);
  },
};
