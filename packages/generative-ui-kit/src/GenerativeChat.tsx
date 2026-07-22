"use client";

import { useEffect, useRef, useState } from "react";
import { GenerativeUIRouter, type RendererMap } from "./GenerativeUIRouter";
import { SuggestionChips } from "./SuggestionChips";
import { SendMessageProvider } from "./sendMessageContext";
import type { ChatMessage, ChatStreamEvent, RenderPayload, Suggestion } from "./types";

type Turn =
  | { kind: "user"; text: string }
  | { kind: "assistant_text"; text: string }
  | { kind: "assistant_render"; payload: RenderPayload };

export function GenerativeChat({
  onSend,
  suggestions,
  renderers,
}: {
  onSend: (messages: ChatMessage[]) => AsyncIterable<ChatStreamEvent>;
  suggestions: Suggestion[];
  renderers: RendererMap;
}) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  // Mirrors `loading` synchronously: `sendMessage` reads this instead of the
  // `loading` state closure, so two calls in the same tick can't both pass
  // the guard before a state update commits.
  const loadingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingSuggestions, setRemainingSuggestions] = useState<Suggestion[]>(suggestions);

  // Whenever the host passes a new suggestions array (e.g. an AI-suggested
  // next set after a turn), reset the visible chip row to match it.
  useEffect(() => {
    setRemainingSuggestions(suggestions);
  }, [suggestions]);

  async function send(nextHistory: ChatMessage[]) {
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      let workingHistory = nextHistory;
      // Plain for-await over the iterable: this is what makes "yields one
      // or more events per turn" work with no special-casing — a generator
      // that yields once behaves identically to one that yields several times.
      for await (const event of onSend(nextHistory)) {
        if (event.type === "text_chunk") {
          continue; // real chunk accumulation lands with streaming's actual implementation (Phase 3+)
        }
        if (event.type === "text_done") {
          workingHistory = [...workingHistory, { role: "assistant", content: event.text }];
          setTurns((t) => [...t, { kind: "assistant_text", text: event.text }]);
          continue;
        }
        // event.type === "tool_call"
        workingHistory = [
          ...workingHistory,
          { role: "assistant", content: "", toolCall: { id: event.toolCallId, name: event.toolName, input: event.input } },
          { role: "tool", content: "", toolResult: { toolCallId: event.toolCallId, output: event.forModel } },
        ];
        setTurns((t) => [...t, { kind: "assistant_render", payload: event.render }]);
      }
      setHistory(workingHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  function sendMessage(text: string) {
    if (!text.trim() || loadingRef.current) return;
    const nextHistory: ChatMessage[] = [...history, { role: "user", content: text }];
    setHistory(nextHistory);
    setTurns((t) => [...t, { kind: "user", text }]);
    send(nextHistory);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input;
    setInput("");
    sendMessage(text);
  }

  function handleSuggestionPick(s: Suggestion) {
    setRemainingSuggestions((list) => list.filter((item) => item.label !== s.label));
    sendMessage(s.sampleMessage);
  }

  return (
    <SendMessageProvider sendMessage={sendMessage}>
      <div className="space-y-4">
        <div className="space-y-4">
          {turns.map((t, i) => {
            if (t.kind === "user") {
              return (
                <div
                  key={i}
                  className="ml-auto max-w-[80%] rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-2 text-sm"
                >
                  {t.text}
                </div>
              );
            }
            if (t.kind === "assistant_text") {
              return (
                <div
                  key={i}
                  className="max-w-[80%] rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white px-3 py-2 text-sm"
                >
                  {t.text}
                </div>
              );
            }
            return (
              <div key={i}>
                <GenerativeUIRouter payload={t.payload} renderers={renderers} />
              </div>
            );
          })}
          {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Thinking...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <SuggestionChips suggestions={remainingSuggestions} onPick={handleSuggestionPick} disabled={loading} />

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-black dark:text-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </SendMessageProvider>
  );
}
