import type { ToolDefinition } from "../types";

export const scrollToAnchorToolDefinition: ToolDefinition = {
  name: "scroll_to_anchor",
  description:
    "Scroll the page to a specific element, identified by its DOM id. Use when " +
    "the user asks to jump to, show, or focus a section that already exists on the page.",
  input_schema: {
    type: "object",
    properties: {
      anchorId: { type: "string", description: "DOM id of the target element." },
    },
    required: ["anchorId"],
  },
};

export async function scrollToAnchorToolHandler(input: { anchorId: string }) {
  return {
    render: {
      component: "ScrollToAnchorRenderer" as const,
      props: { anchorId: input.anchorId },
    },
    forModel: { status: "scrolled", anchorId: input.anchorId },
  };
}
