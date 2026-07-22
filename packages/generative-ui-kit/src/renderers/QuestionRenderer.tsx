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
    sendMessage(freeText.trim());
  }

  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white p-4 space-y-3">
      <p className="text-sm font-medium">{question}</p>
      {!answered && (
        <>
          <div className="flex flex-wrap gap-2">
            {choices.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => choose(opt.label)}
                className="rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
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
                className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-black dark:text-white px-2 py-1 text-sm"
              />
              <button type="submit" className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm">
                Send
              </button>
            </form>
          )}
        </>
      )}
      {answered && <p className="text-sm text-gray-500 dark:text-gray-400">Answer sent.</p>}
    </div>
  );
}
