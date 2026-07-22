"use client";

import type { Suggestion } from "./types";

export function SuggestionChips({
  suggestions,
  onPick,
  disabled,
}: {
  suggestions: Suggestion[];
  onPick: (suggestion: Suggestion) => void;
  disabled?: boolean;
}) {
  if (suggestions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onPick(s)}
          disabled={disabled}
          className="rounded-full border border-gray-300 dark:border-gray-600 text-black dark:text-white px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
