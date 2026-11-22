# Validation — shared-utils-test-coverage

## Traceability

| AC | Criterion | Scenarios | Wave(s) | Test evidence |
|----|-----------|-----------|---------|---------------|
| 1 | `readJSON` returns fallback for missing/invalid JSON and… | readJSON handles missing and invalid data | 1 | storage.test.ts |
| 2 | Chat history is capped to the last 50 messages and append… | chat history is capped and appended | 1 | storage.test.ts |
| 3 | Guest profile and chat history can be cleared through the… | guest profile and chat history can be cleared | 1 | storage.test.ts |
| 4 | `getLocalStorageKeys` excludes system/vite keys and handles… | local storage keys filter system entries | 1 | storage.test.ts |
| 5 | Usage settings fall back to defaults and can be updated. | usage settings use defaults and updates | 1 | usage.test.ts |
| 6 | `logEvent` updates ring-buffer logs and daily aggregates… | logEvent records logs and daily aggregates | 1 | usage.test.ts |
| 7 | `getUsageSummary` returns series/totals/byAction for the… | usage summary aggregates recent days | 1 | usage.test.ts |
| 8 | Shared-utils tests run through `npm test` / CI. | shared utils suite runs in CI | 1 | storage.test.ts, usage.test.ts |

## Scenario coverage

- Scenarios: 8 total, 8 with detected test evidence, 0 without
- ✓ `readJSON handles missing and invalid data` (@w1)
- ✓ `chat history is capped and appended` (@w1)
- ✓ `guest profile and chat history can be cleared` (@w1)
- ✓ `local storage keys filter system entries` (@w1)
- ✓ `usage settings use defaults and updates` (@w1)
- ✓ `logEvent records logs and daily aggregates` (@w1)
- ✓ `usage summary aggregates recent days` (@w1)
- ✓ `shared utils suite runs in CI` (@w1)

## TDD evidence

Ordered red → green → refactor steps recorded in the wave's
evidence bundle (`--tdd=` on `harness_evidence --action=step`).

- Wave 1: red→green→refactor ✓

## Demo script (manual walkthrough)

1. **readJSON handles missing and invalid data** — run the app, perform the scenario, observe the outcome.
2. **chat history is capped and appended** — run the app, perform the scenario, observe the outcome.
3. **guest profile and chat history can be cleared** — run the app, perform the scenario, observe the outcome.
4. **local storage keys filter system entries** — run the app, perform the scenario, observe the outcome.
5. **usage settings use defaults and updates** — run the app, perform the scenario, observe the outcome.
6. **logEvent records logs and daily aggregates** — run the app, perform the scenario, observe the outcome.
7. **usage summary aggregates recent days** — run the app, perform the scenario, observe the outcome.
8. **shared utils suite runs in CI** — run the app, perform the scenario, observe the outcome.

## Gaps

- none — spec is fully traced

Note: 'no evidence' means neither the scenario name nor a
token match was found in test files — verify by hand before
treating it as a real gap. '~' marks weak token-match evidence,
which is not proof: ship_loop finish requires strong test
evidence or a `## Manual verification` entry per AC.

## Manual verification

<!-- For ACs without strong automated evidence, one bullet per
     AC: `- AC <n> — <command/check run> → <observed result>`.
     Preserved across ship_validate reruns; the delivery auditor
     still verifies each claim. -->

## Outcome follow-up

Optional; this is a post-release learning record, not a finish gate.
- Status: not yet measured (merged PR #17, 2026-11-22)
- Owner and review date: repo owner, 2026-12-22
- Baseline / current: 0 tests for storage.ts/usage.ts; 15 total repo tests (measured 2026-11-22)
- Target outcome indicator: >=10 passing shared-utils tests in CI within 30 days of release, 0 regressions in existing 15 tests
- Adoption signal: not yet measured
- Cost / TCO note: two colocated Vitest files, no new dependency
- Signal and observed result: not yet measured
- Learning or next action: review after 30 days
