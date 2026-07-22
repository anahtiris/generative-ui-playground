"use client";

import { useState } from "react";

export interface Field {
  name: string;
  label: string;
  type: "string" | "date" | "email" | "file" | "number" | "select" | "checkbox" | "textarea";
  required: boolean;
  options?: string[]; // required when type === "select"
}

export type FormSubmitResult =
  | { status: "submitted" }
  | { status: "pending_reference"; referenceNumber: string }
  | { status: "error"; message: string };

export function SecureFormRenderer({
  sessionId,
  purpose,
  fields,
  onSubmit,
}: {
  sessionId: string;
  purpose: string;
  fields: Field[];
  onSubmit: (values: Record<string, string>) => Promise<FormSubmitResult>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // IMPORTANT: this component intentionally does NOT use the chat's
  // message-array state. `values` never gets appended to any array that
  // flows back into the LLM context.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const result = await onSubmit(values);
      if (result.status === "submitted") {
        setStatus("done");
      } else if (result.status === "pending_reference") {
        setReferenceNumber(result.referenceNumber);
        setStatus("done");
      } else {
        setErrorMessage(result.message);
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong — try again.");
      setStatus("error");
    }
  }

  function renderField(f: Field) {
    if (f.type === "select") {
      return (
        <select
          required={f.required}
          defaultValue=""
          onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-black dark:text-white px-2 py-1"
        >
          <option value="" disabled>
            Select…
          </option>
          {(f.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === "checkbox") {
      return (
        <input
          type="checkbox"
          required={f.required}
          onChange={(e) => setValues((v) => ({ ...v, [f.name]: String(e.target.checked) }))}
          className="h-4 w-4"
        />
      );
    }
    if (f.type === "textarea") {
      return (
        <textarea
          required={f.required}
          onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-black dark:text-white px-2 py-1"
        />
      );
    }
    return (
      <input
        type={f.type === "file" ? "file" : f.type === "date" ? "date" : "text"}
        required={f.required}
        onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
        className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-black dark:text-white px-2 py-1"
      />
    );
  }

  if (status === "done") {
    return (
      <p className="text-sm text-green-600 dark:text-green-400">
        Submitted securely. Reference: {referenceNumber ?? sessionId.slice(0, 8)}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white p-4 space-y-3"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">{purpose}</p>
      {fields.map((f) => (
        <div key={f.name} className="flex flex-col gap-1">
          <label className="text-sm font-medium">{f.label}</label>
          {renderField(f)}
        </div>
      ))}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm"
      >
        {status === "submitting" ? "Submitting…" : "Submit securely"}
      </button>
      {status === "error" && <p className="text-sm text-red-500">{errorMessage ?? "Something went wrong — try again."}</p>}
    </form>
  );
}
