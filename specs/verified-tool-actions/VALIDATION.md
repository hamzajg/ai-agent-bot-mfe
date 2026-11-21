# Validation — verified-tool-actions

## Traceability

| AC | Criterion | Scenarios | Wave(s) | Test evidence |
|----|-----------|-----------|---------|---------------|
| 1 | A JSON action object is parsed from the first balanced… | parse the first JSON action from a reply | 1 | actionExecutor.test.ts |
| 2 | The explicit-request guard keeps ordinary prose and… | ignore JSON without an explicit action request | 1 | actionExecutor.test.ts |
| 3 | Tool lookup is case-insensitive and an unknown tool returns… | find a tool case-insensitively, miss an unknown tool safely | 1 | actionExecutor.test.ts |
| 4 | HTTP and localStorage actions execute with the declared… | execute a localStorage tool, execute an HTTP tool with query params | 1 | actionExecutor.test.ts |
| 5 | Result formatting preserves the existing product preview… | format an array preview, format key-value results, format raw text | 1 | actionExecutor.test.ts |
| 6 | `toToolSpec` exposes the declared action to providers with… | map a tool spec for provider-native calling | 1 | actionExecutor.test.ts |
| 7 | The test runner is invoked by `npm test` and by CI before… | run the tool-path suite in CI | 1 | (weak) actionExecutor.test.ts |

## Scenario coverage

- Scenarios: 11 total, 10 with detected test evidence, 1 with weak (token-match) evidence only, 0 without
- ✓ `parse the first JSON action from a reply` (@w1)
- ✓ `ignore JSON without an explicit action request` (@w1)
- ✓ `find a tool case-insensitively` (@w1)
- ✓ `miss an unknown tool safely` (@w1)
- ✓ `execute an HTTP tool with query params` (@w1)
- ✓ `execute a localStorage tool` (@w1)
- ✓ `format an array preview` (@w1)
- ✓ `format key-value results` (@w1)
- ✓ `format raw text` (@w1)
- ✓ `map a tool spec for provider-native calling` (@w1)
- ~ `run the tool-path suite in CI` (@w1)

## TDD evidence

Ordered red → green → refactor steps recorded in the wave's
evidence bundle (`--tdd=` on `harness_evidence --action=step`).

- Wave 1: red→green→refactor ✓

## Demo script (manual walkthrough)

1. **parse the first JSON action from a reply** — run the app, perform the scenario, observe the outcome.
2. **find a tool case-insensitively** — run the app, perform the scenario, observe the outcome.
3. **execute an HTTP tool with query params** — run the app, perform the scenario, observe the outcome.
4. **execute a localStorage tool** — run the app, perform the scenario, observe the outcome.
5. **format an array preview** — run the app, perform the scenario, observe the outcome.
6. **format key-value results** — run the app, perform the scenario, observe the outcome.
7. **format raw text** — run the app, perform the scenario, observe the outcome.
8. **map a tool spec for provider-native calling** — run the app, perform the scenario, observe the outcome.

## Gaps

- 1 scenario(s) have only weak token-match evidence — not proof; add scenario-named tests or record manual verification

Note: 'no evidence' means neither the scenario name nor a
token match was found in test files — verify by hand before
treating it as a real gap. '~' marks weak token-match evidence,
which is not proof: ship_loop finish requires strong test
evidence or a `## Manual verification` entry per AC.

## Manual verification

- AC 7 — `npm test` (Vitest) locally, then the `npm test` step in `.github/workflows/ci.yml` on PR #13, before `npm run build:all` → local run 10/10 passing; GitHub check runs for commit `2b78696` all concluded success (`Build (SPA + widget)`, `Build web`, `nginx serves the built app`). The scenario is a runner/CI check, not a unit test, so it is verified by the command and the workflow file rather than a scenario-named test.

## Outcome follow-up

Optional; this is a post-release learning record, not a finish gate.
- Status: not yet measured (PR #13 open, not merged or released)
- Owner and review date: repo owner, 2026-12-21
- Baseline / current: 0 automated tool-path checks, no `test` script, build-only CI (measured 2026-11-21)
- Target outcome indicator: at least 8 passing tool-path scenarios in CI within 30 days of release, and 0 confirmed tool-action regressions across the next 3 releases
- Adoption signal: not yet measured
- Cost / TCO note: one Vitest dev dependency, one script, one CI step; no new runtime module
- Signal and observed result: not yet measured — record after release
- Learning or next action: not yet measured