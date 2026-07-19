import OpenAI from "openai";
import type { LLMProvider, ChatMessage, ProviderResponse, ToolDefinition } from "../types";

let client: OpenAI | undefined;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function toOpenAIMessages(system: string, messages: ChatMessage[]) {
  const out: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: "system", content: system }];
  for (const m of messages) {
    if (m.role === "tool" && m.toolResult) {
      out.push({
        role: "tool",
        tool_call_id: m.toolResult.toolCallId,
        content: JSON.stringify(m.toolResult.output),
      });
    } else if (m.role === "assistant" && m.toolCall) {
      out.push({
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: m.toolCall.id,
            type: "function",
            function: { name: m.toolCall.name, arguments: JSON.stringify(m.toolCall.input) },
          },
        ],
      });
    } else {
      out.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content });
    }
  }
  return out;
}

function toOpenAITools(tools: ToolDefinition[]): OpenAI.Chat.ChatCompletionTool[] {
  return tools.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.input_schema },
  }));
}

export const openaiProvider: LLMProvider = {
  id: "openai",
  label: "GPT (OpenAI)",

  async send({ system, messages, tools }): Promise<ProviderResponse> {
    const completion = await getClient().chat.completions.create({
      model: "gpt-4.1",
      messages: toOpenAIMessages(system, messages),
      tools: toOpenAITools(tools),
    });

    const choice = completion.choices[0].message;
    const call = choice.tool_calls?.[0];
    if (call && call.type === "function") {
      return {
        type: "tool_call",
        id: call.id,
        name: call.function.name,
        input: JSON.parse(call.function.arguments || "{}"),
      };
    }

    return { type: "text", text: choice.content ?? "" };
  },
};
