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

export interface RenderPayload {
  component: string;
  props: Record<string, unknown>;
}

export type ChatStreamEvent =
  | { type: "text_chunk"; delta: string }
  | { type: "text_done"; text: string }
  | {
      type: "tool_call";
      toolCallId: string;
      toolName: string;
      input: Record<string, unknown>;
      render: RenderPayload;
      forModel: Record<string, unknown>;
    };

export interface Suggestion {
  label: string;
  sampleMessage: string;
}

// GenerativeChat's own container: "normal" renders inline wherever the host
// places it (current behavior). "float" renders as a fixed-corner launcher
// bubble that opens into a fixed-position panel — the whole widget, not any
// one rendered card.
export type ChatLayout = "normal" | "float";
