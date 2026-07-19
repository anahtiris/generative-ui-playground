import { randomUUID } from "crypto";
import type { LLMProvider, ChatMessage, ProviderResponse } from "../types";
import { mockScenarios } from "../../../mock/fixtures";

/**
 * MockProvider: lets frontend/UI work proceed without any real API key,
 * and lets you demo every generative-UI sample deterministically.
 *
 * Selection rules (checked in order):
 *   1. If the previous turn was a tool_result, return a plain text
 *      "wrap up" message instead of another tool call.
 *   2. If the latest user message contains a scenario keyword
 *      ("form", "dashboard", "blackboard"/"diagram"), return that scenario.
 *   3. Otherwise return a sample text reply (no tool call).
 */
export const mockProvider: LLMProvider = {
  id: "mock",
  label: "Mock (no API calls)",

  async send({ messages }): Promise<ProviderResponse> {
    const last = messages[messages.length - 1];

    if (last?.role === "tool") {
      return {
        type: "text",
        text: `(mock) Got your submission for "${last.toolResult?.toolCallId}". In a real provider, ` +
          `I'd summarize next steps here without ever having seen the actual field values.`,
      };
    }

    const userText = (last?.content || "").toLowerCase();
    const scenario = mockScenarios.find((s) => s.keywords.some((k) => userText.includes(k)));

    if (!scenario) {
      return {
        type: "text",
        text: `(mock) Got it, you said: "${last?.content ?? ""}". Here's a sample reply since this isn't a scenario I recognize.`,
      };
    }

    return {
      type: "tool_call",
      id: `mock_${randomUUID()}`,
      name: scenario.toolName,
      input: scenario.input,
    };
  },
};
