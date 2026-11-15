# ADR 0002 — Provider-agnostic tool layer (`agent/tools/actionExecutor.ts`)

## Status

Accepted — implemented on `feat/agent-tools`.

## Context

The widget already had "tool use" in the loose sense: the system prompt
teaches the model to emit `{"action","params"}` JSON, and
`ChatBotWidget.tsx` parsed it and executed the matching profile `Action`
inline — ~80 lines of fetch/localStorage/presentation logic buried in a
651-line component, untestable, duplicated nowhere but un-reusable
everywhere. The queued candidate was real tool use behind a
provider-agnostic seam.

## Decision

Extract the entire post-JSON pipeline into
`src/modules/agent/tools/actionExecutor.ts`:

- `parseAgentAction(reply)` — first JSON object or null.
- `isExplicitActionRequest(text)` — the existing verb regex, moved
  verbatim (the guard that keeps JSON from hijacking conversation).
- `findAction` / `executeAction` — case-insensitive lookup; localStorage
  vs HTTP execution moved verbatim from the component.
- `formatActionResult` — the array-preview / key-value / raw-text
  presentation, moved verbatim.
- `toToolSpec(action)` — OpenAI-compatible function spec, the documented
  seam for providers with native tool calling.

`ChatBotWidget` shrinks ~84 lines and now just orchestrates: parse →
guard → execute → format → append. Behavior is unchanged — same regex,
same fetch semantics, same display strings.

## Consequences

- Tool logic is now importable/testable outside React (no test runner
  exists in this repo yet — the module is pure TS + fetch/localStorage,
  ready for vitest when one lands).
- All three providers (OpenAI/Gemini/Ollama) share the layer — it sits
  *after* the provider call, so streaming is unaffected.
- Native tool calling remains future work: `toToolSpec` defines the
  mapping, but wiring it requires per-provider request/response changes
  in the three services — deliberately not done here (KISS).
- The JSON-in-text contract stays the default because it works
  identically everywhere; native specs are additive, not a replacement.
