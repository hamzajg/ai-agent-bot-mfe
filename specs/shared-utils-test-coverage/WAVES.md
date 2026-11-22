# Waves — shared-utils-test-coverage

Each wave IS an iteration: a time-boxed, independently shippable
increment — one branch, one PR, green tests, demoable outcome.
Do not start wave N+1 until wave N merges.

## Wave 1 — iteration 1

Scenarios proven by this wave:
- readJSON handles missing and invalid data
- chat history is capped and appended
- guest profile and chat history can be cleared
- local storage keys filter system entries
- usage settings use defaults and updates
- logEvent records logs and daily aggregates
- usage summary aggregates recent days
- shared utils suite runs in CI

| Item | Title | Size | Deps | Notes |
|------|-------|------|------|-------|
| US1 | As a maintainer, I want shared storage and usage helpers covered by automated tests, so that persistence and analytics regressions are caught in CI | S | — | Colocated Vitest tests for storage.ts and usage.ts; behavior-preserving fixes only if a test exposes a defect. |
