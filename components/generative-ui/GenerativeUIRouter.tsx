"use client";

import { SecureFormRenderer } from "./SecureFormRenderer";
import { DashboardRenderer } from "./DashboardRenderer";
import { BlackboardRenderer } from "./BlackboardRenderer";

export interface RenderPayload {
  component: "SecureFormRenderer" | "DashboardRenderer" | "BlackboardRenderer";
  props: Record<string, any>;
}

/**
 * Add new generative UI components here as you build them.
 * Nothing about the chat pipeline needs to change — only this map.
 */
const registry: Record<RenderPayload["component"], React.ComponentType<any>> = {
  SecureFormRenderer,
  DashboardRenderer,
  BlackboardRenderer,
};

export function GenerativeUIRouter({ payload }: { payload: RenderPayload }) {
  const Component = registry[payload.component];
  if (!Component) {
    return <div className="text-sm text-red-500">Unknown UI component: {payload.component}</div>;
  }
  return <Component {...payload.props} />;
}
