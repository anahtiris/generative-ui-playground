import type { RenderPayload, ToolDefinition } from "../types";

export interface ToolOutput {
  // goes to the browser
  render: RenderPayload;
  // goes back into the LLM's history as the tool_result — never raw PII
  forModel: Record<string, unknown>;
}

// One tool, all its parts together: what the model sees (definition), what
// runs when it calls it (handler), and the prompt guidance that goes with it.
export interface ToolModule {
  definition: ToolDefinition;
  handler: (input: Record<string, unknown>) => Promise<ToolOutput>;
  // Appended to the host's system prompt so adding a tool never means
  // hand-editing the prompt.
  promptHint?: string;
}

// An unknown tool name is an expected condition (the model can hallucinate
// one), so it comes back as a value rather than a thrown error.
export type ToolResult = { ok: true; output: ToolOutput } | { ok: false; error: string };

export interface ToolRegistry {
  definitions(): ToolDefinition[];
  systemPrompt(base: string): string;
  execute(name: string, input: Record<string, unknown>): Promise<ToolResult>;
}
