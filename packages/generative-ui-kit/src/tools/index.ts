import { defineTool } from "../registry/createToolRegistry";
import type { ToolModule } from "../registry/types";
import { dashboardToolDefinition, dashboardToolHandler } from "./dashboard";
import { diagramToolDefinition, diagramToolHandler } from "./diagram";
import { formToolDefinition, formToolHandler } from "./form";
import { questionToolDefinition, questionToolHandler } from "./question";
import { scrollToAnchorToolDefinition, scrollToAnchorToolHandler } from "./scrollToAnchor";
import { tableToolDefinition, tableToolHandler } from "./table";

const formTool = defineTool(
  formToolDefinition,
  formToolHandler,
  "When you need the user to submit sensitive personal data, call request_form — never ask for it in plain chat text.",
);

const dashboardTool = defineTool(
  dashboardToolDefinition,
  dashboardToolHandler,
  "Use request_dashboard to visualize data when it would help the user.",
);

const questionTool = defineTool(
  questionToolDefinition,
  questionToolHandler,
  'Use ask_question when you need a specific answer from the user to proceed — pick "buttons" for a quick pick among ' +
    'short labels, "radio" for a single pick among longer option text, and "checkboxes" when more than one answer can apply at once.',
);

const tableTool = defineTool(
  tableToolDefinition,
  tableToolHandler,
  "Use request_table to visualize data when it would help the user.",
);

// v1 default set — matches defaultRenderers in ../renderers. A host that
// passes this to createToolRegistry gets every new default tool on upgrade
// without touching its own code.
export const builtinTools: ToolModule[] = [formTool, dashboardTool, questionTool, tableTool];

// Opt-in, same as their renderers: exported but not in builtinTools. A host
// adds one with createToolRegistry([...builtinTools, scrollToAnchorTool]) and
// must also register the matching renderer client-side.
export const diagramTool: ToolModule = defineTool(diagramToolDefinition, diagramToolHandler);
export const scrollToAnchorTool: ToolModule = defineTool(scrollToAnchorToolDefinition, scrollToAnchorToolHandler);
