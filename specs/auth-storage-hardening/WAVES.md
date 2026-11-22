# Waves — auth-storage-hardening

Each wave IS an iteration: a time-boxed, independently shippable
increment — one branch, one PR, green tests, demoable outcome.
Do not start wave N+1 until wave N merges.

## Wave 1 — iteration 1

Scenarios proven by this wave:
- register stores a hashed password
- login succeeds with a hashed password
- login rejects an invalid password
- legacy plaintext password is migrated on login
- auth storage suite runs in CI

| Item | Title | Size | Deps | Notes |
|------|-------|------|------|-------|
| US1 | As a shop owner, I want my demo password stored safely, so that local storage inspection does not expose my plaintext password | S | — | Hash on register/login verify; migrate legacy plaintext on successful login; colocated Vitest coverage. |
