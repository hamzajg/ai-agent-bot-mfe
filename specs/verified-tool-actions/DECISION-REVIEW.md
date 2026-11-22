# Decision review brief — Spec: verified-tool-actions

- Source: `specs/verified-tool-actions/SPEC.md (## Decisions)`
- Generated: 2026-11-21T19:02:37Z
- Detected type: process, architecture
- Focus: testability
- Readiness: **CHALLENGE** (6/6 record elements)
- This brief is input to judgment, not a verdict. The agent fills the scorecard after reading the code.

**Reversibility:** stated

**Alternatives on record (verify they are credible, not strawmen):**
- The suite must run locally and in CI without a separate transpile pipeline. - Options considered: (a) no runner — keep build-only CI; (b) Jest with ts-jest/Babe
- Simplest option is (a); most reversible is (c). - Decision & why: add Vitest.
- Context & forces: actionExecutor.ts is a pure module with no React dependency; a separate top-level tests/ tree would need its own path aliases. - Options consi
- Context & forces: the current CI job proves bundling only; a green build says nothing about tool behavior. - Options considered: (a) keep build-only CI; (b) add

## Evidence signals (heuristic — verify before acting)

- `src/modules/agent/tools/actionExecutor.ts` — no test file references this code (heuristic)
- `src/modules/agent/tools/actionExecutor.ts` — 1 source file(s); not a domain path, so layering checks were skipped

Inspected: `src/modules/agent/tools/actionExecutor.ts`

## Design moves to test

- What feedback loop proves this process works, and how fast is it?
- Who owns it when it fails, and what is the escalation path?
- Can it be simpler without losing the guarantee?
- Can this be a module inside the current deployable before it becomes a service?
- Which dependency can be inverted so the core owns the interface?
- What is the smallest reversible step that tests the boundary?
- Invert a dependency so the unstable thing depends on the stable thing.
- Make an implicit boundary or invariant explicit before adding mechanism.
- Shrink the decision: can half of it ship independently and reversibly?

## Challenge questions

### 1. Problem & forces
- What user/business outcome does this serve, and what breaks if we do nothing?
- Which quality attributes actually drive it (correctness, latency, cost, operability, compliance, time-to-market)? Rank them.
- Which constraints are fixed (budget, deadline, team, contracts) and which are assumed?
- Who owns this decision, and who must live with the consequences?
**Good looks like:** The dominant force is named, and "do nothing" is treated as a real option.

### 2. Value & economics
- What is the value gap: who bears the current cost, and how painful or frequent is it?
- Which outcome indicator and baseline prove the gap closed, and over what review window?
- What is the full-lifecycle cost (build, operate, adopt, migrate, support) and what benefit justifies it?
- Will users actually choose this? What adoption signal would show they do?
- What is the simplest intervention that produces the same outcome — including not building it?
**Good looks like:** The value gap, a numeric target, a lifecycle cost hypothesis and an adoption signal are explicit; 'do nothing' is a real option.

### 3. Alternatives & tradeoffs
- What are at least two credible alternatives, including the simplest thing that could work?
- For each: what does it make easy, what does it make hard, and what does it cost to reverse?
- Is this a one-way or two-way door? If one-way, what evidence justifies it?
- What would have to be true for the chosen option to be wrong?
**Good looks like:** A tradeoff matrix names winners and losers; reversibility is explicit; no strawman options.

### 4. Domain fit (DDD)
- Which bounded context owns this concept, and is the boundary drawn around language or deployment?
- Which terms are overloaded across contexts, and where is the translation (anti-corruption layer)?
- What are the aggregates, their invariants, and the transaction boundary? Does one transaction span aggregates?
- Are domain events the right integration mechanism, or is this a synchronous dependency?
- Does the model carry behavior, or is it an anemic data bag?
**Good looks like:** Ubiquitous language is explicit, invariants are protected at the boundary, external models are translated.

### 5. Architecture & boundaries
- Which direction do dependencies point? Can the core be tested without the framework, DB, or network?
- What is the smallest boundary that isolates this change (module, port, package)?
- What happens when each external dependency is slow, down, or returns garbage?
- Where does data ownership live, and is there a second writer?
- What is the operational story: config, migrations, rollout, rollback, observability?
**Good looks like:** Policy depends on nothing; mechanisms are adapters; failure and migration paths are named.

### 6. Testable design
- Where are the seams? Can time, randomness, IO, and external calls be injected?
- Which behaviors get fast unit tests, which need integration, which need contract tests?
- Does each acceptance criterion map to an observable check, or only to implementation details?
- Are the tests deterministic and independent (no shared state, no sleeps)?
- What is the failure signal when this decision turns out wrong in production?
**Good looks like:** Behavior-first tests, deterministic seams, scenario-to-test traceability, a named failure signal.

### 7. Craftsmanship
- Is this the smallest reversible step, or a big-bang change?
- Are names from the domain, or from the framework/table?
- Is the error model explicit (typed failures vs exceptions vs silent nulls)?
- Is there speculative abstraction (interfaces with one implementation, config nobody sets)?
- Is the migration path documented and rollback-able?
**Good looks like:** Small steps, intention-revealing names, explicit errors, no speculative generality, documented migration.

### 8. Decision record
- Are status, owner, and date recorded?
- Are consequences (positive and negative) written down?
- Is there a revisit trigger (metric, date, event)?
- Are links to evidence, code, and related ADRs present?
**Good looks like:** A future reader can tell why, what was traded, and when to revisit.

## Scorecard (agent fills; 1 = poor, 5 = strong, evidence required)

| Lens | Score | Evidence (file:line, test, benchmark) | Action |
|------|-------|----------------------------------------|--------|
| Problem & forces | 5 | SPEC.md Problem + Value contract; 2026-11-21 scan found 0 tests and build-only CI | Keep |
| Value & economics | 4 | SPEC.md value contract names a 30-day target and 3-year cost rationale; no customer research claimed | Keep, review signal on 2026-12-21 |
| Alternatives & tradeoffs | 4 | SPEC.md D1/D2/D3 each compare 3 options and state reversibility | Keep |
| Domain fit (DDD) | 3 | Tool pipeline is cross-cutting infrastructure, not a bounded context; ADR 0002 keeps provider translation at the service edge | Acceptable for this scope |
| Architecture & boundaries | 4 | ADR 0002 extracted a React-free `actionExecutor.ts`; IO is limited to fetch/localStorage seams | Keep |
| Testable design | 5 | Pure parse/guard/lookup/format functions; 11 scenarios in EXAMPLES.feature map 1:1 to planned checks | Keep |
| Craftsmanship | 4 | One dev dependency, one script, one CI step; component and typecheck work explicitly out of scope | Keep |
| Decision record | 5 | SPEC.md Decisions records context, options, consequences and revisit triggers for D1-D3 | Keep |

## Verdict (agent fills)

```
VERDICT: ACCEPT
STEELMAN: The widget already has a pure, React-free tool pipeline that ADR 0002 extracted for testability; adding a Vite-native runner and one CI step turns that latent seam into a real regression gate with minimal surface area.
SMALLEST NEXT STEP: Add Vitest plus one colocated actionExecutor.test.ts covering the 11 scenarios, then add `npm test` to the existing CI job before `build:all`.
REVISIT TRIGGER: Reopen if the tool suite needs React rendering, if Vitest conflicts with a Vite/Node upgrade, or if the 2026-12-21 review shows fewer than 8 passing scenarios in CI.
```

Run the review with `/challenge-decision` and the `decision-challenger`
subagent. It is advisory: it never blocks a gate or a merge.
