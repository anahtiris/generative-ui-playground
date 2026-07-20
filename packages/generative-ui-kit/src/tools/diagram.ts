import type { ToolDefinition } from "../types";

export const diagramToolDefinition: ToolDefinition = {
  name: "request_diagram",
  description: "Render an explanatory diagram (flow, sequence, or concept map) to teach or illustrate an idea.",
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

export async function diagramToolHandler(input: {
  title: string;
  diagram_type: string;
  nodes: Array<{ id: string; label: string }>;
  edges?: Array<{ from: string; to: string; label?: string }>;
}) {
  return {
    render: {
      component: "BlackboardRenderer" as const,
      props: { title: input.title, diagramType: input.diagram_type, nodes: input.nodes, edges: input.edges ?? [] },
    },
    forModel: { status: "diagram_rendered_to_user", node_count: input.nodes.length },
  };
}
