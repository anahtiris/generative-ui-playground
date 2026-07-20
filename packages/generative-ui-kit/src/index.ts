export type {
  ToolDefinition,
  ChatRole,
  ChatMessage,
  RenderPayload,
  ChatStreamEvent,
  Suggestion,
} from "./types";

export { GenerativeUIRouter } from "./GenerativeUIRouter";
export type { RendererMap } from "./GenerativeUIRouter";

export { DashboardRenderer } from "./renderers/DashboardRenderer";
export { dashboardToolDefinition, dashboardToolHandler } from "./tools/dashboard";

export { BlackboardRenderer } from "./renderers/BlackboardRenderer";
export { diagramToolDefinition, diagramToolHandler } from "./tools/diagram";

export { SecureFormRenderer } from "./renderers/SecureFormRenderer";
export type { Field, FormSubmitResult } from "./renderers/SecureFormRenderer";
export { formToolDefinition, formToolHandler } from "./tools/form";

export { QuestionRenderer } from "./renderers/QuestionRenderer";
export type { QuestionOption } from "./renderers/QuestionRenderer";
export { questionToolDefinition, questionToolHandler } from "./tools/question";

export { useSendMessage } from "./sendMessageContext";
