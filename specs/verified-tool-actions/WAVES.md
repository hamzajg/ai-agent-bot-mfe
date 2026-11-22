# Waves — verified-tool-actions

Each wave IS an iteration: a time-boxed, independently shippable
increment — one branch, one PR, green tests, demoable outcome.
Do not start wave N+1 until wave N merges.

## Wave 1 — iteration 1

Scenarios proven by this wave:
- parse the first JSON action from a reply
- ignore JSON without an explicit action request
- find a tool case-insensitively
- miss an unknown tool safely
- execute an HTTP tool with query params
- execute a localStorage tool
- format an array preview
- format key-value results
- format raw text
- map a tool spec for provider-native calling
- run the tool-path suite in CI

| Item | Title | Size | Deps | Notes |
|------|-------|------|------|-------|
| US1 | As a shopper, I want product-search tool replies to work reliably, so that I can find products without broken assistant answers | M | — | Cover parse, guard, lookup, HTTP/localStorage execution and result formatting in `actionExecutor.ts`. |
| US2 | As a maintainer, I want tool regressions to fail CI, so that a broken tool path cannot be merged unnoticed | S | — | Add Vitest, an `npm test` script, a `npm test` CI step, and a provider tool-spec check. |
