import type { MCPToolDefinition } from "@relay/shared";

export const hubspotTools: MCPToolDefinition[] = [
  {
    name: "list_contacts",
    description: "List contacts in HubSpot CRM",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum contacts to return (max 100)",
          default: 10,
        },
        after: {
          type: "string",
          description: "Pagination cursor for next page",
        },
        properties: {
          type: "array",
          items: { type: "string" },
          description:
            "Contact properties to include (e.g. ['email', 'firstname', 'lastname', 'phone'])",
        },
      },
    },
  },
  {
    name: "get_contact",
    description: "Get a single HubSpot contact by ID",
    inputSchema: {
      type: "object",
      properties: {
        contact_id: {
          type: "string",
          description: "Contact ID",
        },
        properties: {
          type: "array",
          items: { type: "string" },
          description:
            "Properties to include (e.g. ['email', 'firstname', 'lastname'])",
        },
      },
      required: ["contact_id"],
    },
  },
  {
    name: "create_contact",
    description: "Create a new contact in HubSpot CRM",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Contact email address",
        },
        firstname: {
          type: "string",
          description: "First name",
        },
        lastname: {
          type: "string",
          description: "Last name",
        },
        phone: {
          type: "string",
          description: "Phone number",
        },
        company: {
          type: "string",
          description: "Company name",
        },
        properties: {
          type: "object",
          description: "Additional properties as key-value pairs",
        },
      },
      required: ["email"],
    },
  },
  {
    name: "list_deals",
    description: "List deals in HubSpot CRM",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum deals to return (max 100)",
          default: 10,
        },
        after: {
          type: "string",
          description: "Pagination cursor for next page",
        },
        properties: {
          type: "array",
          items: { type: "string" },
          description:
            "Deal properties to include (e.g. ['dealname', 'amount', 'dealstage'])",
        },
      },
    },
  },
  {
    name: "get_deal",
    description: "Get a single HubSpot deal by ID",
    inputSchema: {
      type: "object",
      properties: {
        deal_id: {
          type: "string",
          description: "Deal ID",
        },
        properties: {
          type: "array",
          items: { type: "string" },
          description:
            "Properties to include (e.g. ['dealname', 'amount', 'dealstage', 'closedate'])",
        },
      },
      required: ["deal_id"],
    },
  },
  {
    name: "list_companies",
    description: "List companies in HubSpot CRM",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum companies to return (max 100)",
          default: 10,
        },
        after: {
          type: "string",
          description: "Pagination cursor for next page",
        },
        properties: {
          type: "array",
          items: { type: "string" },
          description:
            "Company properties to include (e.g. ['name', 'domain', 'industry'])",
        },
      },
    },
  },
  {
    name: "search_contacts",
    description:
      "Search for contacts using HubSpot's search API with filter groups",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query text (searches across default searchable properties)",
        },
        limit: {
          type: "number",
          description: "Maximum results to return (max 100)",
          default: 10,
        },
        after: {
          type: "string",
          description: "Pagination cursor",
        },
        properties: {
          type: "array",
          items: { type: "string" },
          description: "Properties to include in results",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_tickets",
    description: "List support tickets in HubSpot CRM",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum tickets to return (max 100)",
          default: 10,
        },
        after: {
          type: "string",
          description: "Pagination cursor for next page",
        },
        properties: {
          type: "array",
          items: { type: "string" },
          description:
            "Ticket properties to include (e.g. ['subject', 'content', 'hs_pipeline_stage'])",
        },
      },
    },
  },
];
