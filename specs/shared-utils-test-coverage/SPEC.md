# Spec: shared-utils-test-coverage

> Spec-driven development artifact. This file is the contract: implementation
> is done when every acceptance criterion maps to a scenario in
> `EXAMPLES.feature` and every scenario has a passing check.

## Problem

`src/shared/utils/storage.ts` and `src/shared/utils/usage.ts` hold localStorage-backed behavior used by the widget, auth, and dashboard (profile/chat persistence, usage logs/aggregates, key filtering), but there are 0 automated tests for these modules. Regressions in serialization, fallback, cap/trimming, or aggregation logic would be caught only by manual UI checks.

## Users

- Maintainers changing shared utilities or storage/usage behavior.
- Widget and dashboard users indirectly affected by persistence/usage regressions.

## Value contract

Required before wave planning (D017). Fill every field. Keep the target
measurable — a number, a unit, and a review window.

- Problem: 0 automated tests cover `storage.ts` and `usage.ts`; the shared utils have localStorage parsing/fallback/capping behavior that can silently regress.
- Users: Maintainers bear debugging/regression cost; end users bear broken persistence or incorrect usage summaries.
- Baseline / current cost: 0 test files for `storage.ts`/`usage.ts`; 15 total tests in repo (measured 2026-11-22).
- Target outcome indicator: at least 10 passing shared-utils tests covering storage and usage behaviors in CI within 30 days of release, with 0 regressions in existing 15 tests.
- Economic hypothesis: A small colocated Vitest suite costs less than repeated manual regression checks across widget/dashboard flows over 3 years and reduces risk when refactoring shared state helpers.
- Owner / date: repo owner, 2026-12-22.

## Outcome hypothesis

- Expected user outcome: persistence and usage tracking behave consistently after future changes; regressions are caught by CI.
- Opportunity evidence: repository scan 2026-11-22 (no tests for storage/usage). Assumption: these helpers are reused enough that silent regressions matter.
- Signal: number of passing shared-utils tests in CI and regressions in existing tests; baseline 0 shared-utils tests.
- Follow-up owner/date: repo owner, 2026-12-22.

## Experience

N/A — internal utility test coverage; no user-facing UI flow, copy, or interaction changes.

## Scope (in)

- `src/shared/utils/storage.test.ts` — Vitest coverage for storage helpers.
- `src/shared/utils/usage.test.ts` — Vitest coverage for usage helpers.
- `src/shared/utils/storage.ts` / `src/shared/utils/usage.ts` — behavior-preserving fixes only if tests expose a real defect.
- `specs/shared-utils-test-coverage/` — spec artifacts.

## Scope (out)

- UI component tests for widget/dashboard screens.
- New persistence features, schema migrations, or analytics backends.
- Refactoring unrelated modules.
- Changing localStorage key names or public data contracts except to fix a proven defect.

## Acceptance criteria

<!-- Scenario(s): use scenario names verbatim from EXAMPLES.feature and/or
     @w<N> tags — ship_validate resolves both for traceability. A numbered
     list is allowed under this heading, but every item must still name its
     scenario(s) or @w<N> tag inline. -->

| # | Criterion | Scenario(s) |
|---|-----------|-------------|
| 1 | `readJSON` returns fallback for missing/invalid JSON and returns parsed values for valid JSON. | readJSON handles missing and invalid data |
| 2 | Chat history is capped to the last 50 messages and append writes a timestamped entry. | chat history is capped and appended |
| 3 | Guest profile and chat history can be cleared through the storage helpers. | guest profile and chat history can be cleared |
| 4 | `getLocalStorageKeys` excludes system/vite keys and handles storage errors. | local storage keys filter system entries |
| 5 | Usage settings fall back to defaults and can be updated. | usage settings use defaults and updates |
| 6 | `logEvent` updates ring-buffer logs and daily aggregates, respecting log cap. | logEvent records logs and daily aggregates |
| 7 | `getUsageSummary` returns series/totals/byAction for the requested window. | usage summary aggregates recent days |
| 8 | Shared-utils tests run through `npm test` / CI. | shared utils suite runs in CI |

## Decisions

### D1 — Test scope and style

- Context & forces: The repo uses Vitest with colocated tests and simple localStorage stubs (see `AuthService.test.ts`, `actionExecutor.test.ts`). Storage/usage are pure-ish helpers around localStorage/Date/Math.random.
- Options considered: (a) no tests, keep manual checks; (b) colocated Vitest unit tests with stubbed localStorage and controlled time/random where needed; (c) integration tests through UI components. (b) is simplest and most reversible.
- Decision & why: choose (b). It verifies behavior quickly, matches existing patterns, and avoids UI test harness setup.
- Consequences: positive — fast deterministic coverage; negative — does not prove UI wiring.
- Reversibility: two-way door; add UI integration tests later if needed.

### D2 — Behavior-preserving fixes

- Context & forces: Tests may expose a real defect. Unrelated refactors increase risk.
- Options considered: (a) refactor modules freely; (b) only behavior-preserving fixes proven by a failing test; (c) leave defects unfixed. (b) is simplest responsible option.
- Decision & why: choose (b). Fix only defects exposed by new tests, with evidence.
- Consequences: positive — low risk; negative — some cleanup may be deferred.
- Reversibility: two-way door.