import { getProvider } from "../../../lib/llm";
import { allTools } from "../../../lib/tools/definitions";
import { toolHandlers } from "../../../lib/tools/handlers";
import type { ChatMessage } from "../../../lib/llm/types";

const SYSTEM_PROMPT = `
You are an assistant for a relocation platform. When you need the user to
submit sensitive personal data, call request_form — never ask for it in
plain chat text. Use request_dashboard and request_diagram to visualize
data or explain processes when it would help the user.
`.trim();

export async function POST(req: Request) {
  const { messages, providerId } = (await req.json()) as {
    messages: ChatMessage[];
    providerId?: string; // "anthropic" | "openai" | "mock" — user/UI picks this
  };

  const provider = getProvider(providerId);
  const response = await provider.send({ system: SYSTEM_PROMPT, messages, tools: allTools });

  if (response.type === "text") {
    return Response.json({ type: "text", text: response.text });
  }

  // response.type === "tool_call"
  const handler = toolHandlers[response.name];
  if (!handler) {
    return Response.json({ type: "text", text: `(no handler registered for tool "${response.name}")` });
  }

  const { render, forModel } = await handler(response.input);

  // `forModel` is what would be appended as this turn's tool_result the
  // next time this conversation continues — persist it alongside the
  // message history. `render` goes to the client only.
  return Response.json({
    type: "tool_call",
    toolCallId: response.id,
    toolName: response.name,
    input: response.input, // -> needed to reconstruct the assistant tool-call turn in history
    render, // -> passed straight into <GenerativeUIRouter payload={render} />
    forModel, // -> store in your message history as the next tool_result
  });
}
