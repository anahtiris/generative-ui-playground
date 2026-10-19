import type { ToolDefinition } from "../types";
import type { ToolModule, ToolOutput, ToolRegistry } from "./types";

// Defines a tool from its parts. The model's tool input arrives as unvalidated
// JSON, so the registry holds every handler under Record<string, unknown>;
// the cast to the handler's specific input type lives here once instead of at
// every registration site.
export function defineTool<I>(
  definition: ToolDefinition,
  handler: (input: I) => Promise<ToolOutput>,
  promptHint?: string,
): ToolModule {
  return {
    definition,
    handler: handler as unknown as ToolModule["handler"],
    promptHint,
  };
}

// definitions() and execute() mirror MCP's tools/list and tools/call on
// purpose, so an MCP server can later wrap a registry without reshaping it.
export function createToolRegistry(modules: ToolModule[]): ToolRegistry {
  const byName = new Map<string, ToolModule>();
  for (const module of modules) {
    const { name } = module.definition;
    if (byName.has(name)) {
      throw new Error(`Duplicate tool name "${name}" in createToolRegistry`);
    }
    byName.set(name, module);
  }

  return {
    definitions: () => modules.map((m) => m.definition),

    systemPrompt: (base) => {
      const hints = modules.flatMap((m) => (m.promptHint ? [m.promptHint] : []));
      return hints.length > 0 ? `${base}\n\n${hints.join("\n")}` : base;
    },

    execute: async (name, input) => {
      const module = byName.get(name);
      if (!module) {
        return { ok: false, error: `no handler registered for tool "${name}"` };
      }
      return { ok: true, output: await module.handler(input) };
    },
  };
}
