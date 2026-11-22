# Gates: shared-utils-test-coverage

> Preconditions for phase transitions. Each `## G<n> — <title>` block is a
> gate. `ship_loop` refuses to advance past a phase while a blocking gate is
> pending. Definitions live here; status and evidence live in `LOOP.md`.
>
> Gate phases: `spec` (before writing the spec), `plan` (before planning
> waves), `wave:<n>` (before starting wave n), `validate` (before validation),
> `finish` (before closing the feature).
>
> Gate types: decision | artifact | external | technical | quality | data.
> Resolver: `human` (needs a person to decide/provide something) or `agent`
> (the agent can satisfy it). Check: `manual`, `file:<repo-relative-path>`,
> `section:<repo-relative-path>#<heading>` (the named `##` section must be
> filled — used for SPEC.md sections that need their own contract), or
> `command:<exact command>` (the agent runs it and records the output as
> evidence — the oracle never executes it).

## G0 — Value contract filled
- Before: plan
- Type: artifact
- Owner: agent
- Resolver: agent
- Blocking: yes
- Check: file:specs/shared-utils-test-coverage/SPEC.md
- Why: D017 — value is the outcome, not the output. Problem, users, baseline,
  measurable target, economic hypothesis and review owner must be on record
  before wave planning commits the features.

<!-- Example (indented so it is not parsed):
  ## G4 — Pricing rules approved
  - Before: spec
  - Type: decision
  - Owner: product-owner
  - Resolver: human
  - Blocking: yes
  - Check: manual
  - Why: AC-2 and AC-3 use pricing terms that must be defined once.
-->

## G1 — Design decisions challenged
- Before: plan
- Type: artifact
- Owner: agent
- Resolver: agent
- Blocking: yes
- Check: file:specs/shared-utils-test-coverage/DECISION-REVIEW.md
- Why: Every wave inherits the feature's architecture choices (persistence
  model, consistency, module boundaries, stateless vs stateful). The
  challenger review — alternatives, tradeoffs, testability, and a filled
  VERDICT — must exist before wave planning locks the design in. A human may
  waive this gate for genuinely trivial features.

## G2 — Domain model captured
- Before: plan
- Type: artifact
- Owner: agent
- Resolver: agent
- Blocking: yes
- Check: file:specs/shared-utils-test-coverage/DOMAIN.md
- Why: D019 — waves inherit the ubiquitous language, bounded contexts,
  aggregates and invariants declared here. The file must name its tier
  (simple|standard|domain-heavy) and fill every section; `simple` still
  names the owning context and states "no new domain concepts" explicitly.

## G3 — Experience contract filled
- Before: plan
- Type: artifact
- Owner: agent
- Resolver: agent
- Blocking: yes
- Check: section:specs/shared-utils-test-coverage/SPEC.md#Experience
- Why: D019 — user-facing features must name the primary journey, edge
  states, a concrete UX bar and accessibility notes before planning. A
  feature with no user-facing surface writes `N/A — <reason>`; a bare N/A
  is rejected.
