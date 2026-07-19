import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, ChatMessage, ProviderResponse, ToolDefinition } from "../types";

let client: Anthropic | undefined;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

function toAnthropicMessages(messages: ChatMessage[]) {
  return messages.map((m) => {
    if (m.role === "tool" && m.toolResult) {
      return {
        role: "user" as const,
        content: [
          {
            type: "tool_result" as const,
            tool_use_id: m.toolResult.toolCallId,
            content: JSON.stringify(m.toolResult.output),
          },
        ],
      };
    }
    if (m.role === "assistant" && m.toolCall) {
      return {
        role: "assistant" as const,
        content: [
          {
            type: "tool_use" as const,
            id: m.toolCall.id,
            name: m.toolCall.name,
            input: m.toolCall.input,
          },
        ],
      };
    }
    return { role: m.role === "assistant" ? ("assistant" as const) : ("user" as const), content: m.content };
  });
}

export const anthropicProvider: LLMProvider = {
  id: "anthropic",
  label: "Claude (Anthropic)",

  async send({ system, messages, tools }): Promise<ProviderResponse> {
    const response = await getClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system,
      messages: toAnthropicMessages(messages),
      tools: tools as unknown as Anthropic.Tool[],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (toolUse && toolUse.type === "tool_use") {
      return { type: "tool_call", id: toolUse.id, name: toolUse.name, input: toolUse.input as Record<string, unknown> };
    }

    const text = response.content.find((b) => b.type === "text");
    return { type: "text", text: text && text.type === "text" ? text.text : "" };
  },
};
