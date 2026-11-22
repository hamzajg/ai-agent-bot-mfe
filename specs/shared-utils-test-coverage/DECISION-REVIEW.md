# Decision review brief — Spec: shared-utils-test-coverage

- Source: `specs/shared-utils-test-coverage/SPEC.md (## Decisions)`
- Generated: 2026-11-22T09:40:50Z
- Detected type: process, ux
- Readiness: **READY** (6/6 record elements)
- This brief is input to judgment, not a verdict. The agent fills the scorecard after reading the code.

**Reversibility:** stated

## Domain contract on record (DOMAIN.md — verify against code)

# Domain model: shared-utils-test-coverage

> The domain contract for this feature (D019): ubiquitous language,
> bounded contexts, aggregates and invariants. Fill every section. `simple`
> tier means the feature introduces no NEW domain concepts — say so
> explicitly and name the owning context; it is not a blank file. Deeper
> tiers are checked semantically by the spec audit and wave reviewer.

**Tier:** simple

## Ubiquitous language

<!-- One entry per term this feature introduces or relies on. Use the SAME
     words in scenarios, stories, code and UI copy. -->

- Chat history: ordered localStorage message list (`ai_agent_chat_history`) capped to latest 50 entries.
- Guest profile: localStorage profile (`ai_agent_guest_profile`) describing role/mission/routes/actions.
- Usage event: recorded event with id, timestamp, type, and metadata in `ai_usage_log_v1`.
- Daily aggregate: per-day usage counters/actions in `ai_usage_daily_v1`.
- Usage settings: localStorage settings (`ai_usage_settings_v1`) controlling logging behavior.

## Bounded contexts

<!-- Which context owns each concept; where translation is needed. -->

- Owning context: `shared/utils` client-side persistence helpers used by widget, auth, and dashboard modules.
- Context map: modules call helper functions; helpers own localStorage key format and fallback behavior. No cross-context translation layer added.
- New concepts introduced: none — all terms borrowed from existing storage/usage helper behavior.

## Domain model

<!-- Only what this feature needs. Invariants are enforced at the boundary. -->

- Aggregates and their invariants: none new; usage daily aggregates maintain counters per day and `actionsByName` map.
- Entities / value objects this feature adds or changes: none; tests cover existing helper behavior.
- Transaction boundary: each helper call writes its own localStorage key(s); no multi-aggregate transaction.

## Integration style

<!-- How this feature's context talks to the rest of the system. -->

- Synchronous in-process function calls to browser localStorage.
- Strong consistency within a single helper call; no eventual consistency.

## External translations

<!-- External systems/models entering this context and how they are
     translated — or an explicit "none". -->

- none — browser localStorage is the only external boundary, accessed directly by existing helpers.

**Alternatives on record (verify they are credible, not strawmen):**
- Storage/usage are pure-ish helpers around localStorage/Date/Math.random. - Options considered: (a) no tests, keep manual checks; (b) colocated Vitest unit tests
- Unrelated refactors increase risk. - Options considered: (a) refactor modules freely; (b) only behavior-preserving fixes proven by a failing test; (c) leave def
- (b) is simplest responsible option. - Decision & why: choose (b).

## Evidence signals (heuristic — verify before acting)

- `src/shared/utils/storage.ts` — 1 source file(s); not a domain path, so layering checks were skipped
- `src/shared/utils/usage.ts` — no test file references this code (heuristic)
- `src/shared/utils/usage.ts` — 1 source file(s); not a domain path, so layering checks were skipped
- `specs/shared-utils-test-coverage` — no source files found to inspect

Inspected: `src/shared/utils/storage.ts`, `src/shared/utils/usage.ts`, `specs/shared-utils-test-coverage`

## Design moves to test

- What feedback loop proves this process works, and how fast is it?
- Who owns it when it fails, and what is the escalation path?
- Can it be simpler without losing the guarantee?
- Which user journey does this serve, including empty, error, and slow states?
- What is the accessibility and keyboard path?
- Where does the UI hold state that belongs to the domain?
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
- Which quality dimensions does this affect — product (user task), system (correctness, security, reliability, operability) and business (TCO, adoption, adaptability)? Name any it makes worse.
- What is the simplest intervention that produces the same outcome — including not building it?
**Good looks like:** The value gap, a numeric target, a lifecycle cost hypothesis and an adoption signal are explicit; quality tradeoffs are named; 'do nothing' is a real option.

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
| Problem & forces | 4 | storage.ts/usage.ts have 0 tests; helpers used by widget/auth/dashboard (repo scan). | Keep scope to shared utils. |
| Value & economics | 4 | SPEC value contract: >=10 passing shared-utils tests in CI within 30 days, 0 regressions in 15 existing tests. | Track in CI. |
| Alternatives & tradeoffs | 4 | D1/D2 compare no-tests/UI tests vs colocated Vitest; behavior-preserving fixes only. | Avoid refactor creep. |
| Domain fit (DDD) | 4 | DOMAIN.md simple tier; no new concepts; borrows existing storage/usage terms. | Keep names aligned. |
| Architecture & boundaries | 4 | Isolated to shared utils tests; no UI/runtime architecture change. | None. |
| Testable design | 5 | localStorage/Date/Math.random seams easy to stub; deterministic unit tests. | Stub time/random in usage tests. |
| Craftsmanship | 4 | Smallest step, colocated tests, explicit fallback/cap behavior. | Fix only proven defects. |
| Decision record | 4 | D1/D2 have context/options/consequences/reversibility. | Revisit if UI integration gaps appear. |

## Verdict (agent fills)

```
VERDICT: ACCEPT
STEELMAN: Colocated Vitest unit tests for storage/usage provide fast, deterministic regression protection for shared persistence behavior with no new dependencies or UI harness cost, while allowing behavior-preserving fixes only when a test proves a defect.
SMALLEST NEXT STEP: Write failing Vitest cases for storage.ts and usage.ts covering fallbacks, caps, key filtering, and aggregates, then implement minimal fixes if any fail.
REVISIT TRIGGER: If shared-utils regressions escape to UI flows or if helpers grow into a richer persistence layer needing integration/contract tests.
```

Run the review with `/challenge-decision` and the `decision-challenger`
subagent. It is advisory: it never blocks a gate or a merge.
