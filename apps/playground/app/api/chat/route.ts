import { getProvider } from "../../../lib/llm";
import {
  formToolDefinition,
  formToolHandler,
  dashboardToolDefinition,
  dashboardToolHandler,
  diagramToolDefinition,
  diagramToolHandler,
  questionToolDefinition,
  questionToolHandler,
  tableToolDefinition,
  tableToolHandler,
} from "generative-ui-kit";
import type { ChatMessage } from "generative-ui-kit";

const SYSTEM_PROMPT = `
You are an assistant for a relocation platform. When you need the user to
submit sensitive personal data, call request_form — never ask for it in
plain chat text. Use request_dashboard, request_diagram, and request_table
to visualize data or explain processes when it would help the user. Use
ask_question when you need a specific answer from the user to proceed.
`.trim();

const allTools = [
  formToolDefinition,
  dashboardToolDefinition,
  diagramToolDefinition,
  questionToolDefinition,
  tableToolDefinition,
];

type ToolHandler = (input: Record<string, unknown>) => Promise<{ render: unknown; forModel: unknown }>;

// Registry boundary cast: same reasoning as generative-ui-kit's defaultRenderers
// (see packages/generative-ui-kit/src/renderers/index.ts) — each handler's
// input type is more specific than Record<string, unknown>, so a targeted
// cast per entry, not a blanket `any`.
const toolHandlers: Record<string, ToolHandler> = {
  request_form: formToolHandler as ToolHandler,
  request_dashboard: dashboardToolHandler as ToolHandler,
  request_diagram: diagramToolHandler as ToolHandler,
  ask_question: questionToolHandler as ToolHandler,
  request_table: tableToolHandler as ToolHandler,
};

export async function POST(req: Request) {
  const { messages, providerId } = (await req.json()) as {
    messages: ChatMessage[];
    providerId?: string;
  };

  const provider = getProvider(providerId);
  const response = await provider.send({ system: SYSTEM_PROMPT, messages, tools: allTools });

  if (response.type === "text") {
    return Response.json({ type: "text", text: response.text });
  }

  const handler = toolHandlers[response.name];
  if (!handler) {
    return Response.json({ type: "text", text: `(no handler registered for tool "${response.name}")` });
  }

  const { render, forModel } = await handler(response.input);

  return Response.json({
    type: "tool_call",
    toolCallId: response.id,
    toolName: response.name,
    input: response.input,
    render,
    forModel,
  });
}
