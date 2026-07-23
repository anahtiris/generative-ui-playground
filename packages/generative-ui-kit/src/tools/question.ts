import type { ToolDefinition } from "../types";

export const questionToolDefinition: ToolDefinition = {
  name: "ask_question",
  description:
    "Ask the user a clarifying or preference question with structured options, " +
    "when you need a specific answer to proceed rather than free-form text. Pick " +
    "question_type based on the options: \"buttons\" for a quick pick among short " +
    "labels (sends instantly on click), \"radio\" for a single pick among longer " +
    "option text (user reviews, then submits), \"checkboxes\" when more than one " +
    "answer can apply at once.",
  input_schema: {
    type: "object",
    properties: {
      question: { type: "string" },
      question_type: { type: "string", enum: ["buttons", "radio", "checkboxes"] },
      options: {
        type: "array",
        description: "The choices offered, in display order.",
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
        description: "If true, adds an 'Other' text field the user can fill in instead of picking an option.",
      },
    },
    required: ["question", "question_type", "options"],
  },
};

export async function questionToolHandler(input: {
  question: string;
  question_type: "buttons" | "radio" | "checkboxes";
  options: Array<{ label: string; value: string }>;
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
