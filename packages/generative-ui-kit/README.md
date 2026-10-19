# generative-ui-kit

Provider-agnostic generative UI components (secure forms, questions, tables,
dashboards) and a `GenerativeChat` widget for tool-calling LLM chat apps.
The library never calls an LLM itself — your host app supplies an `onSend`
adapter and owns the actual provider integration (Anthropic, OpenAI, a local
model, whatever), so this works with any provider or agent framework.

## Install

```bash
npm install generative-ui-kit
```

Peer dependencies: `react` and `react-dom` (^18).

## What's in the box

- `GenerativeChat` — the chat widget (turns, suggestion chips, `normal` or
  `float` launcher-bubble layout)
- `GenerativeUIRouter` — dispatches a render payload to a renderer map, for
  building a custom chat UI instead of using `GenerativeChat`
- 4 default renderers, each with a matching tool schema + handler:
  `SecureFormRenderer` (`request_form`), `QuestionRenderer` (`ask_question`),
  `TableRenderer` (`request_table`), `DashboardRenderer` (`request_dashboard`)
- `BlackboardRenderer` (`request_diagram`) — exported but not in
  `defaultRenderers`; register it yourself if you want diagrams
- `ScrollToAnchorRenderer` (`scroll_to_anchor`) — exported but not in
  `defaultRenderers`; renders nothing, just scrolls an existing element
  (by DOM id) into view

## Quick start

Server side — build a registry from the built-in tools. It hands your LLM
provider the tool list and system prompt, and turns a tool call into a render
payload:

```ts
import { createToolRegistry, builtinTools } from "generative-ui-kit";

const registry = createToolRegistry(builtinTools);

registry.definitions();               // tool list for your LLM provider
registry.systemPrompt(BASE_PROMPT);   // your prompt + each tool's hint

const result = await registry.execute(toolCall.name, toolCall.input);
if (result.ok) {
  const { render, forModel } = result.output;
  // `render` -> send to the client. `forModel` -> the tool_result you feed back to the LLM.
} else {
  // unknown tool name: result.error
}
```

Upgrading the package brings new built-in tools with no code change on your
side. Opt-in tools and your own take one line:

```ts
import { defineTool, diagramTool, scrollToAnchorTool } from "generative-ui-kit";

const weatherTool = defineTool(weatherDefinition, weatherHandler, "Use get_weather for forecasts.");
createToolRegistry([...builtinTools, scrollToAnchorTool, weatherTool]);
```

An opt-in tool also needs its renderer registered client-side. The individual
`*ToolDefinition` / `*ToolHandler` exports still work if you'd rather wire
tools by hand.

Client side — render whatever payload comes back:

```tsx
import { GenerativeChat, defaultRenderers } from "generative-ui-kit";

<GenerativeChat
  onSend={onSend}          // async generator yielding ChatStreamEvent
  suggestions={suggestions}
  renderers={defaultRenderers}
  layout="normal"           // or "float" for a corner launcher bubble
/>;
```

## `SecureFormRenderer` and `onSubmit`

`formToolHandler`'s `forModel` output never contains field values — only a
`session_id` and status, so the LLM can't see what the user typed. Because of
that, `onSubmit` can't be supplied by this library or by the render payload
(functions don't survive JSON) — your host app must inject it itself,
wherever it turns a render payload into props, before handing it to
`GenerativeUIRouter`:

```ts
const props = payload.component === "SecureFormRenderer"
  ? { ...payload.props, onSubmit: (values) => myBackend.submit(payload.props.sessionId, values) }
  : payload.props;
```

`Field.validation` (pattern/minLength/maxLength/min/max) enforces native
browser constraint validation client-side; anything more complex — a lookup
against another system, cross-field rules — belongs in your own submit
endpoint.

## License

MIT
