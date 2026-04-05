import type { MCPToolDefinition } from "@relay/shared";

export const stripeTools: MCPToolDefinition[] = [
  {
    name: "list_customers",
    description: "List customers with optional filtering and pagination",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of customers to return (max 100)", default: 10 },
        starting_after: { type: "string", description: "Cursor for pagination (customer ID)" },
        email: { type: "string", description: "Filter by exact email address" },
      },
    },
  },
  {
    name: "get_customer",
    description: "Retrieve a specific customer by ID",
    inputSchema: {
      type: "object",
      properties: {
        customer_id: { type: "string", description: "Customer ID (e.g. 'cus_xxx')" },
      },
      required: ["customer_id"],
    },
  },
  {
    name: "create_customer",
    description: "Create a new customer",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Customer email address" },
        name: { type: "string", description: "Customer full name" },
        description: { type: "string", description: "Description of the customer" },
        phone: { type: "string", description: "Customer phone number" },
        metadata: { type: "object", description: "Key-value metadata pairs" },
      },
    },
  },
  {
    name: "list_charges",
    description: "List charges with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of charges to return (max 100)", default: 10 },
        starting_after: { type: "string", description: "Cursor for pagination (charge ID)" },
        customer: { type: "string", description: "Filter by customer ID" },
      },
    },
  },
  {
    name: "list_subscriptions",
    description: "List subscriptions with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of subscriptions to return (max 100)", default: 10 },
        starting_after: { type: "string", description: "Cursor for pagination (subscription ID)" },
        customer: { type: "string", description: "Filter by customer ID" },
        status: {
          type: "string",
          enum: ["active", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "trialing", "all"],
          description: "Filter by subscription status",
        },
      },
    },
  },
  {
    name: "get_subscription",
    description: "Retrieve a specific subscription by ID",
    inputSchema: {
      type: "object",
      properties: {
        subscription_id: { type: "string", description: "Subscription ID (e.g. 'sub_xxx')" },
      },
      required: ["subscription_id"],
    },
  },
  {
    name: "create_payment_link",
    description: "Create a new payment link for a price",
    inputSchema: {
      type: "object",
      properties: {
        price_id: { type: "string", description: "Price ID to create a payment link for" },
        quantity: { type: "number", description: "Quantity of the line item", default: 1 },
      },
      required: ["price_id"],
    },
  },
  {
    name: "list_invoices",
    description: "List invoices with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of invoices to return (max 100)", default: 10 },
        starting_after: { type: "string", description: "Cursor for pagination (invoice ID)" },
        customer: { type: "string", description: "Filter by customer ID" },
        status: {
          type: "string",
          enum: ["draft", "open", "paid", "uncollectible", "void"],
          description: "Filter by invoice status",
        },
      },
    },
  },
  {
    name: "get_invoice",
    description: "Retrieve a specific invoice by ID",
    inputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string", description: "Invoice ID (e.g. 'in_xxx')" },
      },
      required: ["invoice_id"],
    },
  },
  {
    name: "list_products",
    description: "List products with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of products to return (max 100)", default: 10 },
        starting_after: { type: "string", description: "Cursor for pagination (product ID)" },
        active: { type: "boolean", description: "Filter by active status" },
      },
    },
  },
  {
    name: "get_balance",
    description: "Retrieve the current account balance",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "search_charges",
    description: "Search charges using Stripe's search syntax",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query using Stripe search syntax (e.g. 'status:\"succeeded\" AND amount>1000')",
        },
        limit: { type: "number", description: "Number of results to return (max 100)", default: 10 },
      },
      required: ["query"],
    },
  },
];
