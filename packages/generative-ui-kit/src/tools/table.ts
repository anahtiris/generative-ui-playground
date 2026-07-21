import type { ToolDefinition } from "../types";

export const tableToolDefinition: ToolDefinition = {
  name: "request_table",
  description:
    "Render a standalone table of data discussed in the conversation. Use when " +
    "tabular data is the entire answer, not one part of a mixed dashboard " +
    "alongside charts or stat cards.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      columns: {
        type: "array",
        description: "Column order and display labels.",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            label: { type: "string" },
          },
          required: ["key", "label"],
        },
      },
      rows: {
        type: "array",
        description: "Row data, each object keyed by a column's `key`.",
        items: { type: "object" },
      },
    },
    required: ["title", "columns", "rows"],
  },
};

export async function tableToolHandler(input: {
  title: string;
  columns: Array<{ key: string; label: string }>;
  rows: Record<string, unknown>[];
}) {
  return {
    render: {
      component: "TableRenderer" as const,
      props: { title: input.title, columns: input.columns, rows: input.rows },
    },
    forModel: { status: "table_rendered_to_user", row_count: input.rows.length },
  };
}
