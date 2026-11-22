# Backlog: shared-utils-test-coverage

Items are USER STORIES in the parseable format below — keep the heading
shape `## US<n> — <story>` and the field lines intact so `wave_plan` can
parse them. Write the story as: "As a <role>, I want <goal>, so that
<value>" — the title after the dash IS the story.

```
## US<n> — As a <role>, I want <goal>, so that <value>
- Scenarios: @w1, @w2
- Depends: US1, US3        (optional; omit for wave-1 items)
- Size: S|M|L
- Notes: <one line>
```

Order stories by user value; dependencies express technical order only.

## US1 — As a maintainer, I want shared storage and usage helpers covered by automated tests, so that persistence and analytics regressions are caught in CI
- Scenarios: @w1
- Size: S
- Notes: Colocated Vitest tests for storage.ts and usage.ts; behavior-preserving fixes only if a test exposes a defect.