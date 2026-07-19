"use client";

import type { ComponentType } from "react";
import type { RenderPayload } from "./types";

export type RendererMap = Record<string, ComponentType<Record<string, unknown>>>;

export function GenerativeUIRouter({
  payload,
  renderers,
}: {
  payload: RenderPayload;
  renderers: RendererMap;
}) {
  const Component = renderers[payload.component];
  if (!Component) {
    return <div className="text-sm text-red-500">Unknown UI component: {payload.component}</div>;
  }
  return <Component {...payload.props} />;
}
