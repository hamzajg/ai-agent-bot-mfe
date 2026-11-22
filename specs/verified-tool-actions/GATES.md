# Gates: verified-tool-actions

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
> (the agent can satisfy it). Check: `manual`, `file:<repo-relative-path>`, or
> `command:<exact command>` (the agent runs it and records the output as
> evidence — the oracle never executes it).

## G0 — Value contract filled
- Before: plan
- Type: artifact
- Owner: agent
- Resolver: agent
- Blocking: yes
- Check: file:specs/verified-tool-actions/SPEC.md
- Why: D017 — value is the outcome, not the output. Problem, users, baseline,
  measurable target, economic hypothesis and review owner must be on record
  before wave planning commits the features.

<!-- Example (indented so it is not parsed):
  ## G1 — Domain glossary agreed
  - Before: spec
  - Type: decision
  - Owner: product-owner
  - Resolver: human
  - Blocking: yes
  - Check: manual
  - Why: AC-2 and AC-3 use domain terms that must be defined once.
-->

## G1 — Design decisions challenged
- Before: plan
- Type: artifact
- Owner: agent
- Resolver: agent
- Blocking: yes
- Check: file:specs/verified-tool-actions/DECISION-REVIEW.md
- Why: Every wave inherits the feature's architecture choices (persistence
  model, consistency, module boundaries, stateless vs stateful). The
  challenger review — alternatives, tradeoffs, testability, and a filled
  VERDICT — must exist before wave planning locks the design in. A human may
  waive this gate for genuinely trivial features.
