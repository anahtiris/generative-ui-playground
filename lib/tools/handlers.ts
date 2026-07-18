import { randomUUID } from "crypto";

/**
 * Each handler returns two things:
 *  - render: what the frontend uses to draw the component (may contain data)
 *  - forModel: what goes back into the LLM's tool_result (never raw PII)
 *
 * The chat route must ALWAYS use `forModel`, never `render`, when
 * constructing the tool_result message sent back to the provider.
 */

export async function handleRequestForm(input: {
  form_type: string;
  purpose: string;
  fields: Array<{ name: string; label: string; type: string; required: boolean }>;
}) {
  const sessionId = randomUUID();
  // In a real app: persist a `form_sessions` row here (see prior architecture note).
  return {
    render: {
      component: "SecureFormRenderer" as const,
      props: { sessionId, purpose: input.purpose, fields: input.fields },
    },
    forModel: { status: "form_rendered_to_user", session_id: sessionId },
  };
}

export async function handleRequestDashboard(input: {
  title: string;
  widgets: Array<Record<string, unknown>>;
}) {
  return {
    render: { component: "DashboardRenderer" as const, props: { title: input.title, widgets: input.widgets } },
    forModel: { status: "dashboard_rendered_to_user", widget_count: input.widgets.length },
  };
}

export async function handleRequestDiagram(input: {
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

export const toolHandlers: Record<string, (input: any) => Promise<{ render: unknown; forModel: unknown }>> = {
  request_form: handleRequestForm,
  request_dashboard: handleRequestDashboard,
  request_diagram: handleRequestDiagram,
};
