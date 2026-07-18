# Generative UI Chat — Multi-LLM Scaffold

Provider-agnostic chat backend + 3 generative UI components, with a mock
provider so the frontend can be built/demoed without any real API key.

## Structure

```
lib/llm/            provider-agnostic types + Anthropic/OpenAI/Mock adapters
lib/tools/          tool schemas (definitions.ts) + server handlers (handlers.ts)
components/generative-ui/
  GenerativeUIRouter.tsx   dispatches a render payload to the right component
  SecureFormRenderer.tsx   PII form — bypasses the chat pipeline on submit
  DashboardRenderer.tsx    charts/metrics (recharts)
  BlackboardRenderer.tsx   teaching diagram (raw SVG flow)
app/api/chat/route.ts          main endpoint, provider chosen per-request
app/api/forms/submit/route.ts  separate endpoint, never touches any LLM
mock/fixtures.ts               canned tool calls the mock provider serves
```

## Key design rule

Every generative UI tool has a `render` payload (goes to the browser) and
a `forModel` payload (goes back into the LLM's conversation history as the
tool_result). For `request_form`, `forModel` NEVER contains field values —
only a session id and status. See `lib/tools/handlers.ts`.

## Running with the mock provider (no API keys needed)

```bash
npm install
npm run dev
```

POST to `/api/chat` with `{ "providerId": "mock", "messages": [...] }`.
The mock provider keyword-matches the latest user message
("form" / "dashboard" / "blackboard" / "diagram") to pick a scenario, or
cycles through all three if nothing matches. Edit `mock/fixtures.ts` to
add more canned scenarios.

## Switching to a real provider

Set `DEFAULT_LLM_PROVIDER=anthropic` (or `openai`) in `.env`, and the
corresponding API key. Or pass `providerId` explicitly per request from
a model-picker in your UI — nothing else in the app needs to change,
since `app/api/chat/route.ts` only talks to the `LLMProvider` interface.

## Adding a new generative UI sample

1. Add a tool schema in `lib/tools/definitions.ts`
2. Add its handler in `lib/tools/handlers.ts` (split `render` / `forModel`)
3. Add the component under `components/generative-ui/` and register it
   in `GenerativeUIRouter.tsx`
4. (optional) Add a mock scenario in `mock/fixtures.ts` for demoing it

## Not included (intentionally)

- Auth — plug in whatever you use (Supabase Auth, NextAuth, etc.)
- Real encryption of `form_submissions.values_encrypted` — currently
  inserted as plaintext in `app/api/forms/submit/route.ts` (placeholder,
  intentionally deferred). Column-level encryption via pgcrypto or
  Supabase Vault still needs to be designed and added before this
  handles real PII.
- Streaming responses — adapters currently return a single response;
  extend `LLMProvider.send` to a generator if you need token streaming
