"use client";

import { useState } from "react";
import { useSendMessage } from "../sendMessageContext";

export interface QuestionOption {
  label: string;
  value: string;
}

export function QuestionRenderer({
  question,
  questionType,
  options,
  allowFreeText,
}: {
  question: string;
  questionType: "yes_no" | "multiple_choice";
  options?: QuestionOption[];
  allowFreeText?: boolean;
}) {
  const sendMessage = useSendMessage();
  const [answered, setAnswered] = useState(false);
  const [freeText, setFreeText] = useState("");

  const choices: QuestionOption[] =
    questionType === "yes_no" ? [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] : options ?? [];

  function choose(label: string) {
    setAnswered(true);
    sendMessage(label);
  }

  function submitFreeText(e: React.FormEvent) {
    e.preventDefault();
    if (!freeText.trim()) return;
    setAnswered(true);
    sendMessage(freeText);
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <p className="text-sm font-medium">{question}</p>
      {!answered && (
        <>
          <div className="flex flex-wrap gap-2">
            {choices.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => choose(opt.label)}
                className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100"
              >
                {opt.label}
              </button>
            ))}
          </div>
          {allowFreeText && (
            <form onSubmit={submitFreeText} className="flex gap-2">
              <input
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Other…"
                className="flex-1 rounded border px-2 py-1 text-sm"
              />
              <button type="submit" className="rounded border px-3 py-1 text-sm">
                Send
              </button>
            </form>
          )}
        </>
      )}
      {answered && <p className="text-sm text-gray-400">Answer sent.</p>}
    </div>
  );
}
