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
  questionType: "buttons" | "radio" | "checkboxes";
  options: QuestionOption[];
  allowFreeText?: boolean;
}) {
  const sendMessage = useSendMessage();
  const [answered, setAnswered] = useState(false);
  const [radioValue, setRadioValue] = useState<string | null>(null);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");

  function choose(label: string) {
    setAnswered(true);
    sendMessage(label);
  }

  function toggleChecked(value: string) {
    setCheckedValues((vals) => (vals.includes(value) ? vals.filter((v) => v !== value) : [...vals, value]));
  }

  function submitRadio() {
    const chosen = options.find((o) => o.value === radioValue);
    if (!chosen) return;
    choose(chosen.label);
  }

  function submitCheckboxes() {
    const labels = options.filter((o) => checkedValues.includes(o.value)).map((o) => o.label);
    if (labels.length === 0) return;
    choose(labels.join(", "));
  }

  function submitFreeText(e: React.FormEvent) {
    e.preventDefault();
    if (!freeText.trim()) return;
    choose(freeText.trim());
  }

  return (
    <div className="rounded-[var(--gui-radius)] border border-[var(--gui-border)] bg-[var(--gui-bg)] text-[var(--gui-text)] p-4 space-y-3">
      <p className="text-sm font-medium">{question}</p>
      {!answered && (
        <>
          {questionType === "buttons" && (
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => choose(opt.label)}
                  className="rounded-full border border-[var(--gui-border)] px-3 py-1 text-sm hover:bg-[var(--gui-bg-hover)]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {questionType === "radio" && (
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                {options.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="question-radio"
                      value={opt.value}
                      checked={radioValue === opt.value}
                      onChange={() => setRadioValue(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={submitRadio}
                disabled={radioValue === null}
                className="rounded-[var(--gui-radius)] bg-[var(--gui-accent-bg)] text-[var(--gui-accent-text)] px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          )}

          {questionType === "checkboxes" && (
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                {options.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checkedValues.includes(opt.value)}
                      onChange={() => toggleChecked(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={submitCheckboxes}
                disabled={checkedValues.length === 0}
                className="rounded-[var(--gui-radius)] bg-[var(--gui-accent-bg)] text-[var(--gui-accent-text)] px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          )}

          {allowFreeText && (
            <form onSubmit={submitFreeText} className="flex gap-2">
              <input
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Other…"
                className="flex-1 rounded-[var(--gui-radius)] border border-[var(--gui-border)] bg-[var(--gui-bg)] text-[var(--gui-text)] px-2 py-1 text-sm"
              />
              <button type="submit" className="rounded-[var(--gui-radius)] border border-[var(--gui-border)] px-3 py-1 text-sm">
                Send
              </button>
            </form>
          )}
        </>
      )}
      {answered && <p className="text-sm text-[var(--gui-text-muted)]">Answer sent.</p>}
    </div>
  );
}
