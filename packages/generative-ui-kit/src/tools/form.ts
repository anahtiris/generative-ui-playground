import type { ToolDefinition } from "../types";

export const formToolDefinition: ToolDefinition = {
  name: "request_form",
  description:
    "Request a secure data-collection form from the user for personal, identifying, " +
    "or sensitive data (passport numbers, dates of birth, financial details, documents). " +
    "You will NEVER receive the values entered — only a submission confirmation.",
  input_schema: {
    type: "object",
    properties: {
      purpose: { type: "string", description: "User-facing reason this data is needed." },
      fields: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            label: { type: "string" },
            type: {
              type: "string",
              enum: ["string", "date", "email", "file", "number", "select", "checkbox", "textarea"],
            },
            required: { type: "boolean" },
            options: { type: "array", items: { type: "string" }, description: "Required when type is 'select'." },
            placeholder: { type: "string" },
            validation: {
              type: "object",
              description:
                "Native browser constraint validation — the form won't submit until these pass. " +
                "pattern/minLength/maxLength apply to string/email/textarea fields; min/max apply " +
                "to number/date fields. Anything more complex belongs server-side, not here.",
              properties: {
                pattern: { type: "string" },
                minLength: { type: "number" },
                maxLength: { type: "number" },
                min: { type: ["number", "string"], description: "number for number fields, ISO date string for date fields." },
                max: { type: ["number", "string"], description: "number for number fields, ISO date string for date fields." },
              },
            },
          },
          required: ["name", "label", "type", "required"],
        },
      },
    },
    required: ["purpose", "fields"],
  },
};

export async function formToolHandler(input: {
  purpose: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    validation?: { pattern?: string; minLength?: number; maxLength?: number; min?: number | string; max?: number | string };
  }>;
}) {
  // Global `crypto.randomUUID()` (Web Crypto API), not Node's `crypto` module
  // import — this handler is a library export that could run in any host's
  // server runtime, browser included, not just this repo's Next.js API routes.
  const sessionId = crypto.randomUUID();
  return {
    render: {
      component: "SecureFormRenderer" as const,
      props: { sessionId, purpose: input.purpose, fields: input.fields },
    },
    forModel: { status: "form_rendered_to_user", session_id: sessionId },
  };
}
