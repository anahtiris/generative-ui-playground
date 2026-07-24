# Generative UI Chat — Multi-LLM Monorepo

Provider-agnostic chat backend + a publishable `generative-ui-kit` npm
package of generative UI components and a `GenerativeChat` widget, plus a
demo app with a mock provider so the frontend can be built/demoed without
any real API key.

**v1 scope:** 4 renderers — secure forms, questions, tables, dashboards —
plus `GenerativeChat` itself in 2 layouts: `"normal"` (renders inline
wherever the host places it, current look) or `"float"` (fixed-corner
launcher bubble that opens into a fixed-position chat panel). A 5th
renderer, `BlackboardRenderer` (diagrams), exists in the package and is
exported, but is not part of the default registry or the demo app's wired
tools — see [Not included](#not-included-intentionally--v1-scope) below.

This is a pnpm workspace with two packages:

```
packages/generative-ui-kit/   the publishable library — no LLM calls of its own
  src/types.ts                   ChatMessage, ToolDefinition, RenderPayload, ChatStreamEvent, Suggestion
  src/GenerativeUIRouter.tsx      dispatches a render payload to a host-supplied renderer map
  src/GenerativeChat.tsx          the chat widget: turns/history, onSend loop, suggestion chips
  src/SuggestionChips.tsx         stateless chip row
  src/sendMessageContext.tsx      useSendMessage() — lets a renderer send a normal next chat message
  src/renderers/                  SecureFormRenderer, DashboardRenderer, QuestionRenderer, TableRenderer (v1 default set)
                                   + BlackboardRenderer (exported, not in defaultRenderers — opt-in only)
  src/tools/                      matching tool schema + handler for each renderer (request_form, request_dashboard, ask_question, request_table)
                                   + request_diagram (exported, not wired into the demo app)

apps/playground/              the demo app — consumes generative-ui-kit
  app/page.tsx                    renders <GenerativeChat>, supplies onSend + defaultRenderers
  app/api/chat/route.ts           main endpoint, provider chosen per-request
  app/api/forms/submit/route.ts   separate endpoint, never touches any LLM
  lib/llm/                        provider-agnostic LLMProvider interface + Anthropic/OpenAI/Mock adapters
  mock/fixtures.ts                canned tool calls the mock provider serves
```

The library never calls an LLM. A host (like `apps/playground`) supplies an
`onSend` adapter and owns its own orchestration — this keeps the UI package
usable with any provider or agent framework, not just one SDK.

## Key design rule

Every generative UI tool handler returns a `render` payload (goes to the
browser) and a `forModel` payload (goes back into the LLM's conversation
history as the tool_result). For `request_form`, `forModel` NEVER contains
field values — only a session id and status. See
`packages/generative-ui-kit/src/tools/form.ts`.

## Running with the mock provider (no API keys needed)

```bash
pnpm install
pnpm run dev
```

This builds nothing extra up front — `pnpm --filter playground dev` runs
Next.js directly against the workspace-linked library. If you've changed
library source, rebuild it first: `pnpm --filter generative-ui-kit run build`.

The mock provider keyword-matches the latest user message ("form" /
"dashboard" / "question" / "table") to pick a scenario, or returns a
generic reply if nothing matches. Edit `apps/playground/mock/fixtures.ts`
to add more canned scenarios.

## Chat widget layout

`GenerativeChat` takes an optional `layout` prop: `"normal"` (default) or
`"float"`. `"normal"` is unchanged — the widget renders inline wherever
the host places it, always visible, no internal open/close state.
`"float"` renders as a fixed bottom-right launcher bubble; clicking it
opens a fixed-position panel (scrollable turn list, chips and input
pinned at the bottom) in the same corner, with its own close button. The
playground demos this via the layout dropdown in `app/page.tsx`.

## Switching to a real provider

Set `DEFAULT_LLM_PROVIDER=anthropic` (or `openai`) in `apps/playground/.env`,
and the corresponding API key. Or pass `providerId` explicitly per request
from a model-picker in your UI — nothing else needs to change, since
`apps/playground/app/api/chat/route.ts` only talks to the `LLMProvider`
interface.

For a local model via [Ollama](https://ollama.com), set
`DEFAULT_LLM_PROVIDER=ollama` (or pick "Ollama (local)" from the demo's
provider dropdown). No API key needed — `OLLAMA_BASE_URL` defaults to
`http://localhost:11434/v1` (Ollama's OpenAI-compatible endpoint) and
`OLLAMA_MODEL` defaults to `llama3.1`; override either in `.env` if your
local setup differs. Model must support tool calling.

## Testing form submission without a real backend

With no `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` set,
`apps/playground/app/api/forms/submit/route.ts` simulates all 3
`FormSubmitResult` outcomes instead of always reporting success: type
`error` into any field to see the error state, `pending` to see the
pending-reference state, anything else submits normally.

## Adding a new generative UI sample

1. Add a tool schema + handler in `packages/generative-ui-kit/src/tools/`
   (split `render` / `forModel`)
2. Add the renderer component under `packages/generative-ui-kit/src/renderers/`
3. Export both from `packages/generative-ui-kit/src/index.ts`, and add the
   renderer to `defaultRenderers` in `src/renderers/index.ts`
4. Wire the tool definition/handler into `apps/playground/app/api/chat/route.ts`
5. (optional) Add a mock scenario in `apps/playground/mock/fixtures.ts` for demoing it

## Workspace commands

```bash
pnpm -r run typecheck   # typecheck both packages
pnpm run build          # build the library, then the app against it
```

## Not included (intentionally — v1 scope)

- `BlackboardRenderer` / `request_diagram` — the component and tool still
  exist and are exported from `generative-ui-kit`, but aren't in
  `defaultRenderers` or wired into the playground's `route.ts`/system
  prompt. A host can still import and register both manually.
- Auth — plug in whatever you use (Supabase Auth, NextAuth, etc.)
- Real encryption of `form_submissions.values_encrypted` — currently
  inserted as plaintext in `apps/playground/app/api/forms/submit/route.ts`
  (placeholder, intentionally deferred). Column-level encryption via
  pgcrypto or Supabase Vault still needs to be designed and added before
  this handles real PII.
- Streaming responses — the `ChatStreamEvent` contract supports it
  (`text_chunk`), but `GenerativeChat` doesn't accumulate chunks yet;
  adapters currently return a single response per turn.
- Publishing `generative-ui-kit` to npm — it's a workspace-linked
  (`workspace:*`) private package for now.
- An `HtmlContentRenderer`/`request_html_content` tool and a headless
  `useGenerativeChat` hook — deferred to a later phase.
