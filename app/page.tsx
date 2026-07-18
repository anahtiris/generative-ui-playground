"use client";

import { useState } from "react";
import { GenerativeUIRouter, type RenderPayload } from "../components/generative-ui/GenerativeUIRouter";
import type { ChatMessage } from "../lib/llm/types";

type Turn =
  | { kind: "user"; text: string }
  | { kind: "assistant_text"; text: string }
  | { kind: "assistant_render"; payload: RenderPayload };

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

const PROVIDERS = [
  { id: "mock", label: "Mock (no API calls)" },
  { id: "anthropic", label: "Claude (Anthropic)" },
  { id: "openai", label: "GPT (OpenAI)" },
];

export default function Home() {
  const [providerId, setProviderId] = useState("mock");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(nextHistory: ChatMessage[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory, providerId }),
      });
      if (!res.ok) throw new Error(`Chat request failed (${res.status})`);
      const data: ChatApiResponse = await res.json();

      if (data.type === "text") {
        setHistory([...nextHistory, { role: "assistant", content: data.text }]);
        setTurns((t) => [...t, { kind: "assistant_text", text: data.text }]);
        return;
      }

      setHistory([
        ...nextHistory,
        {
          role: "assistant",
          content: "",
          toolCall: { id: data.toolCallId, name: data.toolName, input: data.input },
        },
        {
          role: "tool",
          content: "",
          toolResult: { toolCallId: data.toolCallId, output: data.forModel },
        },
      ]);
      setTurns((t) => [...t, { kind: "assistant_render", payload: data.render }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const nextHistory: ChatMessage[] = [...history, { role: "user", content: input }];
    setHistory(nextHistory);
    setTurns((t) => [...t, { kind: "user", text: input }]);
    setInput("");
    send(nextHistory);
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Generative UI Chat</h1>
        <select
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {turns.map((t, i) => {
          if (t.kind === "user") {
            return (
              <div key={i} className="ml-auto max-w-[80%] rounded-lg bg-black px-3 py-2 text-sm text-white">
                {t.text}
              </div>
            );
          }
          if (t.kind === "assistant_text") {
            return (
              <div key={i} className="max-w-[80%] rounded-lg border px-3 py-2 text-sm">
                {t.text}
              </div>
            );
          }
          return (
            <div key={i}>
              <GenerativeUIRouter payload={t.payload} />
            </div>
          );
        })}
        {loading && <p className="text-sm text-gray-400">Thinking…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try "form", "dashboard", or "explain how this works"'
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
