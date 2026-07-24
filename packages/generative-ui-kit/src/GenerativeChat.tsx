"use client";

import { useEffect, useRef, useState } from "react";
import { GenerativeUIRouter, type RendererMap } from "./GenerativeUIRouter";
import { SuggestionChips } from "./SuggestionChips";
import { SendMessageProvider } from "./sendMessageContext";
import type { ChatLayout, ChatMessage, ChatStreamEvent, RenderPayload, Suggestion } from "./types";

type Turn =
  | { kind: "user"; text: string }
  | { kind: "assistant_text"; text: string }
  | { kind: "assistant_render"; payload: RenderPayload };

export function GenerativeChat({
  onSend,
  suggestions,
  renderers,
  layout = "normal",
}: {
  onSend: (messages: ChatMessage[]) => AsyncIterable<ChatStreamEvent>;
  suggestions: Suggestion[];
  renderers: RendererMap;
  layout?: ChatLayout;
}) {
  // Only meaningful in "float" layout — the widget starts as a closed
  // launcher bubble; "normal" layout ignores this and is always visible.
  const [open, setOpen] = useState(false);
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

  const turnList = (
    <div className={layout === "float" ? "flex-1 overflow-y-auto space-y-4 p-4" : "space-y-4"}>
      {turns.map((t, i) => {
        if (t.kind === "user") {
          return (
            <div
              key={i}
              className="ml-auto max-w-[80%] rounded-[var(--gui-radius)] bg-[var(--gui-accent-bg)] text-[var(--gui-accent-text)] px-3 py-2 text-sm"
            >
              {t.text}
            </div>
          );
        }
        if (t.kind === "assistant_text") {
          return (
            <div
              key={i}
              className="max-w-[80%] rounded-[var(--gui-radius)] border border-[var(--gui-border)] text-[var(--gui-text)] px-3 py-2 text-sm"
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
      {loading && <p className="text-sm text-[var(--gui-text-muted)]">Thinking...</p>}
      {error && <p className="text-sm text-[var(--gui-error)]">{error}</p>}
    </div>
  );

  const composer = (
    <div className={layout === "float" ? "p-4 pt-0 space-y-4" : "space-y-4"}>
      <SuggestionChips suggestions={remainingSuggestions} onPick={handleSuggestionPick} disabled={loading} />

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-[var(--gui-radius)] border border-[var(--gui-border)] bg-[var(--gui-bg)] text-[var(--gui-text)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-[var(--gui-radius)] bg-[var(--gui-accent-bg)] text-[var(--gui-accent-text)] px-4 py-2 text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );

  if (layout === "float") {
    if (!open) {
      return (
        <SendMessageProvider sendMessage={sendMessage}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
            className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gui-accent-bg)] text-[var(--gui-accent-text)] shadow-xl"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
        </SendMessageProvider>
      );
    }
    return (
      <SendMessageProvider sendMessage={sendMessage}>
        <div className="fixed bottom-4 right-4 z-50 flex h-[32rem] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[var(--gui-radius)] border border-[var(--gui-border)] bg-[var(--gui-bg)] text-[var(--gui-text)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--gui-border)] px-4 py-3">
            <span className="text-sm font-semibold">Chat</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-[var(--gui-text-muted)] hover:text-[var(--gui-text)]"
            >
              ✕
            </button>
          </div>
          {turnList}
          {composer}
        </div>
      </SendMessageProvider>
    );
  }

  return (
    <SendMessageProvider sendMessage={sendMessage}>
      <div className="space-y-4">
        {turnList}
        {composer}
      </div>
    </SendMessageProvider>
  );
}
