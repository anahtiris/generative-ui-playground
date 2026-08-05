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

Server side — register the tool definitions with your LLM provider, and its
handlers to turn a tool call into a render payload:

```ts
import { formToolDefinition, formToolHandler, /* ... */ } from "generative-ui-kit";

const tools = [formToolDefinition /* ... */];
const { render, forModel } = await formToolHandler(toolCallInput);
// `render` -> send to the client. `forModel` -> the tool_result you feed back to the LLM.
```

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
