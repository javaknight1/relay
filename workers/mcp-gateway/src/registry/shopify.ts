import type { MCPToolDefinition } from "@relay/shared";

export const shopifyTools: MCPToolDefinition[] = [
  {
    name: "list_products",
    description: "List products in the Shopify store with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of products to return (max 250)", default: 50 },
        since_id: { type: "string", description: "Return products after this ID for pagination" },
        status: {
          type: "string",
          enum: ["active", "archived", "draft"],
          description: "Filter by product status",
        },
        collection_id: { type: "string", description: "Filter by collection ID" },
        product_type: { type: "string", description: "Filter by product type" },
      },
    },
  },
  {
    name: "get_product",
    description: "Get a specific product by ID with variants and images",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "string", description: "Product ID" },
      },
      required: ["product_id"],
    },
  },
  {
    name: "list_orders",
    description: "List orders in the Shopify store with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of orders to return (max 250)", default: 50 },
        since_id: { type: "string", description: "Return orders after this ID for pagination" },
        status: {
          type: "string",
          enum: ["open", "closed", "cancelled", "any"],
          description: "Filter by order status",
          default: "any",
        },
        financial_status: {
          type: "string",
          enum: ["authorized", "pending", "paid", "partially_paid", "refunded", "voided", "partially_refunded", "any"],
          description: "Filter by financial status",
        },
        fulfillment_status: {
          type: "string",
          enum: ["shipped", "partial", "unshipped", "any", "unfulfilled"],
          description: "Filter by fulfillment status",
        },
      },
    },
  },
  {
    name: "get_order",
    description: "Get a specific order by ID with line items and fulfillment details",
    inputSchema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Order ID" },
      },
      required: ["order_id"],
    },
  },
  {
    name: "list_customers",
    description: "List customers in the Shopify store",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of customers to return (max 250)", default: 50 },
        since_id: { type: "string", description: "Return customers after this ID for pagination" },
      },
    },
  },
  {
    name: "get_customer",
    description: "Get a specific customer by ID with addresses and order history",
    inputSchema: {
      type: "object",
      properties: {
        customer_id: { type: "string", description: "Customer ID" },
      },
      required: ["customer_id"],
    },
  },
  {
    name: "list_inventory",
    description: "List inventory levels for a location",
    inputSchema: {
      type: "object",
      properties: {
        location_id: { type: "string", description: "Location ID to get inventory for" },
        limit: { type: "number", description: "Number of results to return (max 250)", default: 50 },
      },
      required: ["location_id"],
    },
  },
  {
    name: "update_inventory",
    description: "Set the inventory level for an item at a location",
    inputSchema: {
      type: "object",
      properties: {
        inventory_item_id: { type: "string", description: "Inventory item ID" },
        location_id: { type: "string", description: "Location ID" },
        available: { type: "number", description: "New available quantity" },
      },
      required: ["inventory_item_id", "location_id", "available"],
    },
  },
  {
    name: "create_product",
    description: "Create a new product in the Shopify store",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Product title" },
        body_html: { type: "string", description: "Product description (HTML)" },
        vendor: { type: "string", description: "Product vendor" },
        product_type: { type: "string", description: "Product type" },
        status: {
          type: "string",
          enum: ["active", "archived", "draft"],
          description: "Product status",
          default: "draft",
        },
        tags: { type: "string", description: "Comma-separated tags" },
        variants: {
          type: "array",
          description: "Product variants",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Variant title" },
              price: { type: "string", description: "Variant price" },
              sku: { type: "string", description: "SKU" },
              inventory_quantity: { type: "number", description: "Initial inventory quantity" },
            },
          },
        },
      },
      required: ["title"],
    },
  },
  {
    name: "search_orders",
    description: "Search orders by query string",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (e.g. email, name, or order number)" },
        limit: { type: "number", description: "Number of results to return (max 250)", default: 50 },
      },
      required: ["query"],
    },
  },
];
