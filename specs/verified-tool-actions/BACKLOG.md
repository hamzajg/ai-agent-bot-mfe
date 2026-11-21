# Backlog: verified-tool-actions

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

## US1 — As a shopper, I want product-search tool replies to work reliably, so that I can find products without broken assistant answers
- Scenarios: @w1
- Size: M
- Notes: Cover parse, guard, lookup, HTTP/localStorage execution and result formatting in `actionExecutor.ts`.

## US2 — As a maintainer, I want tool regressions to fail CI, so that a broken tool path cannot be merged unnoticed
- Scenarios: @w1
- Size: S
- Notes: Add Vitest, an `npm test` script, a `npm test` CI step, and a provider tool-spec check.
