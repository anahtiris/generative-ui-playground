import type { ComponentType } from "react";
import { SecureFormRenderer } from "./SecureFormRenderer";
import { DashboardRenderer } from "./DashboardRenderer";
import { QuestionRenderer } from "./QuestionRenderer";
import { TableRenderer } from "./TableRenderer";
import type { RendererMap } from "../GenerativeUIRouter";

// v1 scope: form, question, table, dashboard, each with normal/float style.
// BlackboardRenderer stays exported from the package root for hosts that
// want to register it manually — it's just not in this default set.
//
// Registry boundary cast: each renderer's props are more specific than
// Record<string, unknown> (that's the whole point of a typed component) —
// GenerativeUIRouter's registry necessarily holds them under one wider type
// to stay open to host-added custom renderers. A targeted cast per entry
// here, not a blanket `any`.
export const defaultRenderers: RendererMap = {
  SecureFormRenderer: SecureFormRenderer as ComponentType<Record<string, unknown>>,
  DashboardRenderer: DashboardRenderer as ComponentType<Record<string, unknown>>,
  QuestionRenderer: QuestionRenderer as ComponentType<Record<string, unknown>>,
  TableRenderer: TableRenderer as ComponentType<Record<string, unknown>>,
};
