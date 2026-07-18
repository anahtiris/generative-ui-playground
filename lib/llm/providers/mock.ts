import { randomUUID } from "crypto";
import type { LLMProvider, ChatMessage, ProviderResponse } from "../types";
import { mockScenarios } from "../../../mock/fixtures";

/**
 * MockProvider — lets frontend/UI work proceed without any real API key,
 * and lets you demo every generative-UI sample deterministically.
 *
 * Selection rules (checked in order):
 *   1. If the latest user message contains a scenario keyword
 *      ("form", "dashboard", "blackboard"/"diagram"), return that scenario.
 *   2. Otherwise cycle through all scenarios in order, one per call.
 *   3. If the previous turn was a tool_result, return a plain text
 *      "wrap up" message instead of another tool call.
 */
let cursor = 0;

export const mockProvider: LLMProvider = {
  id: "mock",
  label: "Mock (no API calls)",

  async send({ messages }): Promise<ProviderResponse> {
    const last = messages[messages.length - 1];

    // If we just got a tool result back, respond with text — don't loop forever.
    if (last?.role === "tool") {
      return {
        type: "text",
        text: `(mock) Got your submission for "${last.toolResult?.toolCallId}". In a real provider, ` +
          `I'd summarize next steps here without ever having seen the actual field values.`,
      };
    }

    const userText = (last?.content || "").toLowerCase();
    const keyed = mockScenarios.find((s) => s.keywords.some((k) => userText.includes(k)));
    const scenario = keyed ?? mockScenarios[cursor++ % mockScenarios.length];

    return {
      type: "tool_call",
      id: `mock_${randomUUID()}`,
      name: scenario.toolName,
      input: scenario.input,
    };
  },
};
