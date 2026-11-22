# Validation — auth-storage-hardening

## Traceability

| AC | Criterion | Scenarios | Wave(s) | Test evidence |
|----|-----------|-----------|---------|---------------|
| 1 | Registering a user stores a salted password hash, not the plaintext password. | register stores a hashed password | 1 | AuthService.test.ts |
| 2 | Logging in with the correct password succeeds against a hashed record. | login succeeds with a hashed password | 1 | AuthService.test.ts |
| 3 | Logging in with the wrong password fails against a hashed record. | login rejects an invalid password | 1 | AuthService.test.ts |
| 4 | A legacy plaintext record is accepted on correct login and upgraded to a hashed record. | legacy plaintext password is migrated on login | 1 | AuthService.test.ts |
| 5 | Auth storage tests run through `npm test` / CI. | auth storage suite runs in CI | 1 | AuthService.test.ts |

## Scenario coverage

- Scenarios: 5 total, 5 with detected test evidence, 0 with weak (token-match) evidence only, 0 without
- ✓ `register stores a hashed password` (@w1)
- ✓ `login succeeds with a hashed password` (@w1)
- ✓ `login rejects an invalid password` (@w1)
- ✓ `legacy plaintext password is migrated on login` (@w1)
- ✓ `auth storage suite runs in CI` (@w1)

## TDD evidence

- Wave 1: red→green→refactor ✓ (recorded in PR #15: red 2 failed/3 passed on AuthService.test.ts before implementation; green 5/5 after implementation; refactor/verification 15/15 full suite + build:all green)

## Demo script (manual walkthrough)

1. **register stores a hashed password** — register a shop owner, inspect `shop_owners` in localStorage; record has `passwordHash` and `salt`, no `password`.
2. **login succeeds with a hashed password** — log in with correct credentials; session is created.
3. **login rejects an invalid password** — log in with wrong password; “Invalid credentials”.
4. **legacy plaintext password is migrated on login** — seed a legacy plaintext record, log in correctly; record upgraded to hash+salt.

## Gaps

None.

## Manual verification

- AC 5 — `npm test` locally (15/15 passing) and CI on PR #15 ran `npm test` before `npm run build:all`; all PR #15 checks green before merge `18bab47`.

## Outcome follow-up

Optional; this is a post-release learning record, not a finish gate.
- Status: not yet measured (merged 2026-11-22, not released as a production product)
- Owner and review date: repo owner, 2026-12-22
- Baseline / current: 0 auth-storage checks, plaintext `password` stored in `shop_owners` records (measured 2026-11-22)
- Target outcome indicator: 0 plaintext password values stored in `shop_owners` records after register/login migration, and at least 5 passing auth-storage tests in CI within 30 days of release
- Adoption signal: not yet measured
- Cost / TCO note: small client-side hash/migration + one test file; no new dependency
- Signal and observed result: not yet measured
- Learning or next action: review after 30 days; revisit when real backend auth is introduced (D1)