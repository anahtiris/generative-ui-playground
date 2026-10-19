import { getProvider } from "../../../lib/llm";
import { builtinTools, createToolRegistry } from "generative-ui-kit";
import type { ChatMessage } from "generative-ui-kit";

// Per-tool guidance lives with each tool (ToolModule.promptHint); this is
// only the host's own context. To add a tool: put it in this list.
const BASE_PROMPT = `
You are an assistant for a relocation platform. Every render tool accepts an
optional "style": "normal" (inline in chat, default) or "float" (anchored
overlay card) — use "float" for something the user should keep visible while
the conversation continues.
`.trim();

const registry = createToolRegistry(builtinTools);
const SYSTEM_PROMPT = registry.systemPrompt(BASE_PROMPT);

export async function POST(req: Request) {
  const { messages, providerId } = (await req.json()) as {
    messages: ChatMessage[];
    providerId?: string;
  };

  const provider = getProvider(providerId);
  const response = await provider.send({ system: SYSTEM_PROMPT, messages, tools: registry.definitions() });

  if (response.type === "text") {
    return Response.json({ type: "text", text: response.text });
  }

  const result = await registry.execute(response.name, response.input);
  if (!result.ok) {
    return Response.json({ type: "text", text: `(${result.error})` });
  }

  return Response.json({
    type: "tool_call",
    toolCallId: response.id,
    toolName: response.name,
    input: response.input,
    render: result.output.render,
    forModel: result.output.forModel,
  });
}
