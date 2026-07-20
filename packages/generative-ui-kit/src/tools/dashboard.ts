import type { ToolDefinition } from "../types";

export const dashboardToolDefinition: ToolDefinition = {
  name: "request_dashboard",
  description: "Render a dashboard of charts/metrics to visualize data discussed in the conversation.",
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
            data: { type: "array", items: { type: "object" } },
          },
          required: ["kind", "title"],
        },
      },
    },
    required: ["title", "widgets"],
  },
};

export async function dashboardToolHandler(input: { title: string; widgets: Array<Record<string, unknown>> }) {
  return {
    render: { component: "DashboardRenderer" as const, props: { title: input.title, widgets: input.widgets } },
    forModel: { status: "dashboard_rendered_to_user", widget_count: input.widgets.length },
  };
}
