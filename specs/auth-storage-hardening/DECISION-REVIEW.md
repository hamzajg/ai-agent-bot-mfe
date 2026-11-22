# Decision review brief — Spec: auth-storage-hardening

- Source: `specs/auth-storage-hardening/SPEC.md (## Decisions)`
- Generated: 2026-11-22T07:26:26Z
- Detected type: security, data
- Readiness: **CHALLENGE** (6/6 record elements)
- This brief is input to judgment, not a verdict. The agent fills the scorecard after reading the code.

**Reversibility:** stated

**Alternatives on record (verify they are credible, not strawmen):**
- Every one-way-door or high-impact choice (persistence model, consistency guarantees, module/service boundaries, stateless
- stateful design, public contracts — REST/OpenAPI, events/AsyncAPI or schema registry, gRPC/protobuf IDL — and their documentation, security controls, framework 
- Plaintext storage is unacceptable; adding a heavy crypto dependency is unnecessary. - Options considered: (a) keep plaintext (simplest, but insecure); (b) Web C
- A breaking format change would lock them out. - Options considered: (a) drop old records (simple, destructive); (b) migrate plaintext record to salted hash on s

## Evidence signals (heuristic — verify before acting)

- `src/modules/auth/AuthService.ts` — no test file references this code (heuristic)
- `src/modules/auth/AuthService.ts` — 1 source file(s); not a domain path, so layering checks were skipped
- `src/shared/types/index.ts` — no test file references this code (heuristic)
- `src/shared/types/index.ts` — 1 source file(s); not a domain path, so layering checks were skipped
- `specs/auth-storage-hardening` — no source files found to inspect

Inspected: `src/modules/auth/AuthService.ts`, `src/shared/types/index.ts`, `specs/auth-storage-hardening`

## Design moves to test

- What is the threat model, and which asset is actually being protected?
- Where are secrets stored, rotated, and audited?
- What is the least privilege this component needs?
- Which invariant spans more than one aggregate, and does the transaction span it too?
- Can the write model be separated from read shapes without splitting the database?
- What is the migration and rollback path for existing data?
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
- Which consistency guarantee is required, and which can be eventual?
**Good looks like:** Ubiquitous language is explicit, invariants are protected at the boundary, external models are translated.

### 5. Architecture & boundaries
- Which direction do dependencies point? Can the core be tested without the framework, DB, or network?
- What is the smallest boundary that isolates this change (module, port, package)?
- What happens when each external dependency is slow, down, or returns garbage?
- Where does data ownership live, and is there a second writer?
- What is the operational story: config, migrations, rollout, rollback, observability?
- What is the blast radius if this control fails?
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
| Problem & forces | 4 | `AuthService.ts` stores `password` plaintext and compares by equality; SPEC.md records baseline 0 checks. | Keep scope to client-side hygiene. |
| Value & economics | 4 | SPEC.md value contract: 0 plaintext records after migration, >=5 auth-storage tests in CI within 30 days. | Measure post-release as planned. |
| Alternatives & tradeoffs | 4 | D1/D2 list plaintext/drop/forever-dual vs SHA-256+salt+migrate-on-login; reversibility stated. | Document KDF limitation. |
| Domain fit (DDD) | 3 | Auth is a small local module, not a bounded-context split; terms are clear. | None needed at this size. |
| Architecture & boundaries | 4 | Change isolated to `AuthService` + colocated tests; no UI/backend boundary change. | Keep hashing helper private/testable. |
| Testable design | 4 | Planned Vitest covers register/login/fail/migration; Web Crypto can be exercised in Node test env. | Add deterministic assertions on stored record shape. |
| Craftsmanship | 4 | Small reversible step, explicit migration, no new dependency. | Avoid speculative abstraction. |
| Decision record | 4 | D1/D2 include context, options, consequences, reversibility. | Revisit on backend auth. |

## Verdict (agent fills)

```
VERDICT: ACCEPT
STEELMAN: For a client-side-only demo MFE with no backend, replacing plaintext localStorage passwords with salted Web Crypto hashes and migrating legacy records on successful login removes an avoidable credential-exposure defect with minimal complexity, no new dependency, and a clear test seam.
SMALLEST NEXT STEP: Implement D1/D2 in `AuthService` with colocated Vitest tests first (red), including a legacy plaintext migration case.
REVISIT TRIGGER: When real backend authentication/OAuth is introduced, or if auth-storage tests/regressions indicate the migration path is insufficient.
```

Run the review with `/challenge-decision` and the `decision-challenger`
subagent. It is advisory: it never blocks a gate or a merge.
