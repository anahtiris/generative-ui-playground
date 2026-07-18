import type { ToolDefinition } from "../llm/types";

/**
 * request_form — secure data-collection form.
 * The model only ever sees field SCHEMAS, never values.
 * See lib/tools/handlers.ts for the enforcement of that boundary.
 */
export const requestFormTool: ToolDefinition = {
  name: "request_form",
  description:
    "Request a secure data-collection form from the user for personal, identifying, " +
    "or sensitive data (passport numbers, dates of birth, financial details, documents). " +
    "You will NEVER receive the values entered — only a submission confirmation.",
  input_schema: {
    type: "object",
    properties: {
      form_type: { type: "string", enum: ["identity_verification", "bank_details", "document_upload"] },
      purpose: { type: "string", description: "User-facing reason this data is needed." },
      fields: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            label: { type: "string" },
            type: { type: "string", enum: ["string", "date", "email", "file", "number"] },
            required: { type: "boolean" },
          },
          required: ["name", "label", "type", "required"],
        },
      },
    },
    required: ["form_type", "purpose", "fields"],
  },
};

/**
 * request_dashboard — chart/metric layout generated from conversation context.
 * Values here ARE allowed to reach the model (it's aggregate/derived data,
 * not PII) — this tool is intentionally less locked-down than request_form.
 */
export const requestDashboardTool: ToolDefinition = {
  name: "request_dashboard",
  description:
    "Render a dashboard of charts/metrics to visualize data discussed in the conversation.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      widgets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["line_chart", "bar_chart", "stat_card", "table"] },
            title: { type: "string" },
            // Small inline datasets only — for large/live data, widget should
            // carry a `dataSourceId` and let the frontend fetch it separately.
            data: { type: "array", items: { type: "object" } },
          },
          required: ["kind", "title"],
        },
      },
    },
    required: ["title", "widgets"],
  },
};

/**
 * request_diagram — "blackboard" for teaching: nodes/edges or step sequence.
 */
export const requestDiagramTool: ToolDefinition = {
  name: "request_diagram",
  description:
    "Render an explanatory diagram (flow, sequence, or concept map) to teach or illustrate an idea.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      diagram_type: { type: "string", enum: ["flow", "sequence", "concept_map"] },
      nodes: {
        type: "array",
        items: {
          type: "object",
          properties: { id: { type: "string" }, label: { type: "string" } },
          required: ["id", "label"],
        },
      },
      edges: {
        type: "array",
        items: {
          type: "object",
          properties: { from: { type: "string" }, to: { type: "string" }, label: { type: "string" } },
          required: ["from", "to"],
        },
      },
    },
    required: ["title", "diagram_type", "nodes"],
  },
};

export const allTools: ToolDefinition[] = [requestFormTool, requestDashboardTool, requestDiagramTool];
