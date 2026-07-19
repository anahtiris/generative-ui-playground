"use client";

import { useState } from "react";

interface Field {
  name: string;
  label: string;
  type: "string" | "date" | "email" | "file" | "number";
  required: boolean;
}

export function SecureFormRenderer({
  sessionId,
  purpose,
  fields,
}: {
  sessionId: string;
  purpose: string;
  fields: Field[];
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  // IMPORTANT: this component intentionally does NOT use the chat's
  // useChat()/message-array state. `values` never gets appended to any
  // array that flows back into the LLM context.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, values }), // goes straight to Supabase, bypassing /api/chat
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="text-sm text-green-600">Submitted securely. Reference: {sessionId.slice(0, 8)}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3">
      <p className="text-sm text-gray-500">{purpose}</p>
      {fields.map((f) => (
        <div key={f.name} className="flex flex-col gap-1">
          <label className="text-sm font-medium">{f.label}</label>
          <input
            type={f.type === "file" ? "file" : f.type === "date" ? "date" : "text"}
            required={f.required}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            className="rounded border px-2 py-1"
          />
        </div>
      ))}
      <button type="submit" disabled={status === "submitting"} className="rounded bg-black px-3 py-1.5 text-white text-sm">
        {status === "submitting" ? "Submitting…" : "Submit securely"}
      </button>
      {status === "error" && <p className="text-sm text-red-500">Something went wrong — try again.</p>}
    </form>
  );
}
