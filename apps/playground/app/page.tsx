"use client";

import { useState } from "react";
import { GenerativeChat, defaultRenderers } from "generative-ui-kit";
import type { ChatMessage, ChatStreamEvent, RenderPayload, Suggestion, FormSubmitResult } from "generative-ui-kit";
import { mockScenarios } from "../mock/fixtures";

const PROVIDERS = [
  { id: "mock", label: "Mock (no API calls)" },
  { id: "anthropic", label: "Claude (Anthropic)" },
  { id: "openai", label: "GPT (OpenAI)" },
];

// Computed once at module scope, not inside the component body: GenerativeChat
// resets its visible chip row whenever the `suggestions` array reference
// changes, so this must stay a stable reference across renders.
const suggestions: Suggestion[] = mockScenarios.map((s) => ({ label: s.label, sampleMessage: s.sampleMessage }));

type ChatApiResponse =
  | { type: "text"; text: string }
  | {
      type: "tool_call";
      toolCallId: string;
      toolName: string;
      input: Record<string, unknown>;
      render: RenderPayload;
      forModel: Record<string, unknown>;
    };

async function submitForm(sessionId: string, values: Record<string, string>): Promise<FormSubmitResult> {
  try {
    const res = await fetch("/api/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, values }),
    });
    if (!res.ok) return { status: "error", message: "Submission failed" };
    return { status: "submitted" };
  } catch {
    return { status: "error", message: "Submission failed" };
  }
}

export default function Home() {
  const [providerId, setProviderId] = useState("mock");

  async function* onSend(messages: ChatMessage[]): AsyncIterable<ChatStreamEvent> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, providerId }),
    });
    if (!res.ok) throw new Error(`Chat request failed (${res.status})`);
    const data: ChatApiResponse = await res.json();

    if (data.type === "text") {
      yield { type: "text_done", text: data.text };
      return;
    }

    // SecureFormRenderer needs a real onSubmit function, which the library's
    // formToolHandler can't supply (it doesn't know this host's submission
    // endpoint) — this host-side onSend is exactly where that gets attached.
    const props =
      data.render.component === "SecureFormRenderer"
        ? {
            ...data.render.props,
            onSubmit: (values: Record<string, string>) =>
              submitForm((data.render.props as { sessionId: string }).sessionId, values),
          }
        : data.render.props;

    yield {
      type: "tool_call",
      toolCallId: data.toolCallId,
      toolName: data.toolName,
      input: data.input,
      render: { component: data.render.component, props },
      forModel: data.forModel,
    };
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4 bg-white text-black dark:bg-neutral-900 dark:text-white min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Generative UI Chat</h1>
        <select
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 px-2 py-1 text-sm"
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <GenerativeChat onSend={onSend} suggestions={suggestions} renderers={defaultRenderers} />
    </main>
  );
}
