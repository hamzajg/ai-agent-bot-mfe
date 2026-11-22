# Backlog: auth-storage-hardening

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

## US1 — As a shop owner, I want my demo password stored safely, so that local storage inspection does not expose my plaintext password
- Scenarios: @w1
- Size: S
- Notes: Hash on register/login verify; migrate legacy plaintext on successful login; colocated Vitest coverage.
