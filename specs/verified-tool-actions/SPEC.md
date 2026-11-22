# Spec: verified-tool-actions

> Spec-driven development artifact. This file is the contract: implementation
> is done when every acceptance criterion maps to a scenario in
> `EXAMPLES.feature` and every scenario has a passing check.

## Problem

The chat widget's product-search tools are parsed and executed by
`src/modules/agent/tools/actionExecutor.ts`, but nothing proves the pipeline
still works after a change. ADR 0002 extracted the logic specifically to make
it testable, yet the repo has no test runner, no test script and CI builds only
the two Vite bundles. A regression in action parsing, lookup or formatting can
reach shoppers as a broken or misleading assistant reply, and the failure is
only found by manual chatting.

## Users

- Shoppers using the embeddable widget to search products through the agent.
- Maintainers changing the agent tool layer or its configuration.

## Value contract

Required before wave planning (D017). Fill every field. Keep the target
measurable — a number, a unit, and a review window.

- Problem: Tool-path regressions reach users because 0 automated tool-path checks exist; CI only builds bundles, so a broken parser or executor is invisible until a shopper reports it.
- Users: Shoppers lose useful answers; maintainers spend time reproducing tool failures that a local check could have caught.
- Baseline / current cost: 0 automated checks for `actionExecutor`, no `test` script in `package.json`, and a CI workflow with only `npm ci` + `npm run build:all` (measured 2026-11-21).
- Target outcome indicator: at least 8 passing tool-path scenarios in CI within 30 days of release, and 0 confirmed tool-action regressions across the next 3 releases.
- Economic hypothesis: One escaped tool bug costs a support cycle and erodes trust in the assistant; a small Vitest suite plus a CI test step is cheaper than repeated manual chat QA over 3 years, including test upkeep.
- Owner / date: repo owner, 2026-12-21.

## Outcome hypothesis

- Expected user outcome: product-search tool replies stop failing silently; shoppers get a usable product list from the assistant.
- Opportunity evidence: repository scan 2026-11-21 (0 test files, no `test` script, build-only CI) plus ADR 0002, which states the extracted layer is "importable/testable ... ready for vitest when one lands". No customer research is claimed.
- Signal: number of passing tool-path scenarios in CI and the count of confirmed tool-action regressions per release; baseline is the measured 0 checks, not an invented failure rate.
- Follow-up owner/date: repo owner, 2026-12-21.

## Scope (in)

- `src/modules/agent/tools/actionExecutor.ts` — verified by tests only; behavior stays unchanged unless a test exposes a real defect.
- `src/modules/agent/tools/actionExecutor.test.ts` — colocated Vitest scenarios covering the tool pipeline.
- `package.json` / `package-lock.json` — add a `test` script and the Vitest dev dependency.
- `.github/workflows/ci.yml` — run the test step alongside the existing SPA + widget build.
- `specs/verified-tool-actions/` — this spec, its scenarios, backlog, gates and audit artifacts.

## Scope (out)

- Provider API changes (OpenAI / Gemini / Ollama request or response shapes).
- React component tests for `ChatBotWidget.tsx` or `InitView.tsx`.
- Fixing the existing TypeScript errors outside the tool layer.
- Admin gate security, secret handling and README/ADR drift — logged as separate follow-ups from the maturity check.

## Acceptance criteria

<!-- Scenario(s): use scenario names verbatim from EXAMPLES.feature and/or
     @w<N> tags — ship_validate resolves both for traceability. A numbered
     list is allowed under this heading, but every item must still name its
     scenario(s) or @w<N> tag inline. -->

| # | Criterion | Scenario(s) |
|---|-----------|-------------|
| 1 | A JSON action object is parsed from the first balanced object in a model reply. | parse the first JSON action from a reply |
| 2 | The explicit-request guard keeps ordinary prose and embedded JSON from being treated as an action. | ignore JSON without an explicit action request |
| 3 | Tool lookup is case-insensitive and an unknown tool returns a clear miss without throwing. | find a tool case-insensitively; miss an unknown tool safely |
| 4 | HTTP and localStorage actions execute with the declared URL, params and key, returning observable results. | execute an HTTP tool with query params; execute a localStorage tool |
| 5 | Result formatting preserves the existing product preview, key-value and raw-text shapes. | format an array preview; format key-value results; format raw text |
| 6 | `toToolSpec` exposes the declared action to providers with native tool calling. | map a tool spec for provider-native calling |
| 7 | The test runner is invoked by `npm test` and by CI before the bundles are declared green. | run the tool-path suite in CI |

## Decisions

### D1 — Test runner: Vitest

- Context & forces: the repo is Vite + ESM + TypeScript; ADR 0002 names Vitest as the intended runner. The suite must run locally and in CI without a separate transpile pipeline.
- Options considered: (a) no runner — keep build-only CI; (b) Jest with ts-jest/Babel — familiar but adds config and ESM friction; (c) Vitest — Vite-native, reads the existing config, minimal setup. Simplest option is (a); most reversible is (c).
- Decision & why: add Vitest. It matches the build tool, needs no Babel bridge and was already anticipated by ADR 0002.
- Consequences: positive — tool logic gains a deterministic local and CI check; negative — one dev dependency and a `test` script to maintain.
- Reversibility: two-way door; revisit if Vitest conflicts with the Vite upgrade or CI Node version.

### D2 — Colocate tool tests with the module

- Context & forces: `actionExecutor.ts` is a pure module with no React dependency; a separate top-level `tests/` tree would need its own path aliases.
- Options considered: (a) no tests; (b) top-level `tests/` mirroring `src/`; (c) `actionExecutor.test.ts` beside the module. Simplest and most reversible is (c).
- Decision & why: colocate. The test sits next to the contract it proves and inherits the module's `@/` aliases.
- Consequences: positive — easy discovery and small diff; negative — source directory carries test files.
- Reversibility: two-way door; revisit if a broader test layout is adopted.

### D3 — CI runs tests in addition to builds

- Context & forces: the current CI job proves bundling only; a green build says nothing about tool behavior.
- Options considered: (a) keep build-only CI; (b) add `npm test` to the existing job before `npm run build:all`; (c) create a separate test job. Simplest is (b); most reversible is (b).
- Decision & why: add one `npm test` step to the existing build job. It keeps one CI surface and fails fast before bundling.
- Consequences: positive — tool regressions block merge; negative — CI gets slightly slower and a flaky test would block unrelated changes.
- Reversibility: two-way door; revisit if the suite grows enough to justify a parallel job.
