import type { ToolDefinition } from "../types";

export const questionToolDefinition: ToolDefinition = {
  name: "ask_question",
  description:
    "Ask the user a clarifying or preference question with structured options, " +
    "when you need a specific answer to proceed rather than free-form text.",
  input_schema: {
    type: "object",
    properties: {
      question: { type: "string" },
      question_type: { type: "string", enum: ["yes_no", "multiple_choice"] },
      options: {
        type: "array",
        description: "Required for multiple_choice. Ignored for yes_no (Yes/No are implicit).",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            value: { type: "string" },
          },
          required: ["label", "value"],
        },
      },
      allow_free_text: {
        type: "boolean",
        description: "If true, adds an 'Other' option that lets the user type a custom answer.",
      },
    },
    required: ["question", "question_type"],
  },
};

export async function questionToolHandler(input: {
  question: string;
  question_type: "yes_no" | "multiple_choice";
  options?: Array<{ label: string; value: string }>;
  allow_free_text?: boolean;
}) {
  return {
    render: {
      component: "QuestionRenderer" as const,
      props: {
        question: input.question,
        questionType: input.question_type,
        options: input.options,
        allowFreeText: input.allow_free_text,
      },
    },
    forModel: { status: "question_rendered_to_user" },
  };
}
