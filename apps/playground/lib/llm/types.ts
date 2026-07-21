/**
 * Provider-specific types for this playground's own LLMProvider adapters.
 * ChatMessage/ToolDefinition live in generative-ui-kit — every adapter here
 * imports them from there instead of declaring its own copy.
 */
import type { ChatMessage, ToolDefinition } from "generative-ui-kit";

export type ProviderResponse =
  | { type: "text"; text: string }
  | {
      type: "tool_call";
      id: string;
      name: string;
      input: Record<string, unknown>;
    };

export interface LLMProvider {
  readonly id: string;
  readonly label: string;

  send(params: {
    system: string;
    messages: ChatMessage[];
    tools: ToolDefinition[];
  }): Promise<ProviderResponse>;
}

export type { ChatMessage, ToolDefinition };
