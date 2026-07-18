import { anthropicProvider } from "./providers/anthropic";
import { openaiProvider } from "./providers/openai";
import { mockProvider } from "./providers/mock";
import type { LLMProvider } from "./types";

const registry: Record<string, LLMProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  mock: mockProvider,
};

export function getProvider(id: string | undefined): LLMProvider {
  const key = id && registry[id] ? id : process.env.DEFAULT_LLM_PROVIDER || "mock";
  const provider = registry[key];
  if (!provider) {
    throw new Error(`Unknown LLM provider "${key}". Available: ${Object.keys(registry).join(", ")}`);
  }
  return provider;
}

export const availableProviders = Object.values(registry).map((p) => ({ id: p.id, label: p.label }));

export type { LLMProvider } from "./types";
