import type { MCPToolDefinition } from "@relay/shared";

export const twilioTools: MCPToolDefinition[] = [
  {
    name: "send_sms",
    description: "Send an SMS message via Twilio",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Destination phone number (E.164 format, e.g. '+15551234567')",
        },
        from: {
          type: "string",
          description: "Twilio phone number to send from (E.164 format)",
        },
        body: {
          type: "string",
          description: "Message body (max 1600 characters)",
        },
      },
      required: ["to", "from", "body"],
    },
  },
  {
    name: "list_messages",
    description: "List SMS/MMS messages for the account",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Filter by destination phone number",
        },
        from: {
          type: "string",
          description: "Filter by sender phone number",
        },
        date_sent: {
          type: "string",
          description: "Filter by date sent (YYYY-MM-DD)",
        },
        page_size: {
          type: "number",
          description: "Number of results per page (max 1000)",
          default: 50,
        },
      },
    },
  },
  {
    name: "get_message",
    description: "Get details of a specific message",
    inputSchema: {
      type: "object",
      properties: {
        message_sid: {
          type: "string",
          description: "The message SID (e.g. 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')",
        },
      },
      required: ["message_sid"],
    },
  },
  {
    name: "make_call",
    description: "Initiate a phone call via Twilio",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Destination phone number (E.164 format)",
        },
        from: {
          type: "string",
          description: "Twilio phone number to call from (E.164 format)",
        },
        url: {
          type: "string",
          description: "TwiML URL that controls the call flow",
        },
        twiml: {
          type: "string",
          description: "Inline TwiML instructions (alternative to url)",
        },
      },
      required: ["to", "from"],
    },
  },
  {
    name: "list_calls",
    description: "List phone calls for the account",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Filter by destination phone number",
        },
        from: {
          type: "string",
          description: "Filter by caller phone number",
        },
        status: {
          type: "string",
          enum: ["queued", "ringing", "in-progress", "completed", "busy", "failed", "no-answer", "canceled"],
          description: "Filter by call status",
        },
        page_size: {
          type: "number",
          description: "Number of results per page (max 1000)",
          default: 50,
        },
      },
    },
  },
  {
    name: "get_call",
    description: "Get details of a specific phone call",
    inputSchema: {
      type: "object",
      properties: {
        call_sid: {
          type: "string",
          description: "The call SID (e.g. 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')",
        },
      },
      required: ["call_sid"],
    },
  },
  {
    name: "list_phone_numbers",
    description: "List phone numbers owned by the account",
    inputSchema: {
      type: "object",
      properties: {
        page_size: {
          type: "number",
          description: "Number of results per page (max 1000)",
          default: 50,
        },
      },
    },
  },
  {
    name: "lookup_number",
    description: "Look up information about a phone number using the Twilio Lookup API",
    inputSchema: {
      type: "object",
      properties: {
        phone_number: {
          type: "string",
          description: "Phone number to look up (E.164 format)",
        },
        fields: {
          type: "string",
          description:
            "Comma-separated lookup fields (e.g. 'caller_name,line_type_intelligence')",
        },
      },
      required: ["phone_number"],
    },
  },
];
