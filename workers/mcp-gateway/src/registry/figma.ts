import type { MCPToolDefinition } from "@relay/shared";

export const figmaTools: MCPToolDefinition[] = [
  {
    name: "get_file",
    description: "Get a Figma file by key, including its document structure",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "Figma file key (from the URL)" },
        depth: { type: "number", description: "Depth of the document tree to return (1-4)" },
      },
      required: ["file_key"],
    },
  },
  {
    name: "get_file_components",
    description: "Get a list of published components in a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "Figma file key" },
      },
      required: ["file_key"],
    },
  },
  {
    name: "get_component",
    description: "Get metadata for a single published component by key",
    inputSchema: {
      type: "object",
      properties: {
        component_key: { type: "string", description: "The component's unique key" },
      },
      required: ["component_key"],
    },
  },
  {
    name: "get_styles",
    description: "Get a list of published styles in a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "Figma file key" },
      },
      required: ["file_key"],
    },
  },
  {
    name: "get_team_projects",
    description: "Get projects for a Figma team",
    inputSchema: {
      type: "object",
      properties: {
        team_id: { type: "string", description: "Figma team ID" },
      },
      required: ["team_id"],
    },
  },
  {
    name: "get_project_files",
    description: "Get files in a Figma project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "Figma project ID" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_images",
    description: "Export images from a Figma file for specific node IDs",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "Figma file key" },
        ids: {
          type: "string",
          description: "Comma-separated list of node IDs to export",
        },
        format: {
          type: "string",
          enum: ["jpg", "png", "svg", "pdf"],
          description: "Image export format",
          default: "png",
        },
        scale: {
          type: "number",
          description: "Image scale factor (0.01 to 4)",
          default: 1,
        },
      },
      required: ["file_key", "ids"],
    },
  },
  {
    name: "get_variables",
    description: "Get local variables and their values in a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "Figma file key" },
      },
      required: ["file_key"],
    },
  },
];
