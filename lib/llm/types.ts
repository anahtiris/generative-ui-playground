/**
 * Provider-agnostic types for the chat + generative UI layer.
 * Every LLM adapter (Anthropic, OpenAI, Mock, ...) speaks this shape.
 * The rest of the app (chat route, UI router) never imports a
 * provider-specific SDK type directly.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>; // JSON Schema
}

export type ChatRole = "user" | "assistant" | "tool";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  // present only on assistant messages that call a tool
  toolCall?: {
    id: string;
    name: string;
    input: Record<string, unknown>;
  };
  // present only on tool-role messages (the result sent back to the model)
  toolResult?: {
    toolCallId: string;
    // IMPORTANT: this is what the MODEL sees. Never put raw PII here.
    output: Record<string, unknown>;
  };
}

/**
 * What a provider call returns: either plain text, or a request to
 * invoke a tool. We never let a provider return "text + silently
 * embedded UI" — tool calls are the only path to rendering UI,
 * which keeps every provider's output auditable the same way.
 */
export type ProviderResponse =
  | { type: "text"; text: string }
  | {
      type: "tool_call";
      id: string;
      name: string;
      input: Record<string, unknown>;
    };

export interface LLMProvider {
  /** Machine-readable id, e.g. "anthropic", "openai", "mock" */
  readonly id: string;
  /** Human-readable label for UI/logging */
  readonly label: string;

  send(params: {
    system: string;
    messages: ChatMessage[];
    tools: ToolDefinition[];
  }): Promise<ProviderResponse>;
}
