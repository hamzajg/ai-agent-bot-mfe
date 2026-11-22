# Spec: auth-storage-hardening

> Spec-driven development artifact. This file is the contract: implementation
> is done when every acceptance criterion maps to a scenario in
> `EXAMPLES.feature` and every scenario has a passing check.

## Problem

`AuthService` stores shop-owner credentials in browser `localStorage` as
plaintext (`password` field in `shop_owners`, compared by string equality on
login). Anyone with local device access, browser devtools, or an exported
storage snapshot can read credentials. This is a client-side-only demo app,
but plaintext credential storage is an avoidable hygiene defect and makes the
maturity baseline worse than it needs to be.

## Users

- Shop owners who register/login in the demo dashboard.
- Maintainers reviewing the project as a reference MFE.

## Value contract

Required before wave planning (D017). Fill every field. Keep the target
measurable — a number, a unit, and a review window.

- Problem: 1 plaintext password field per registered local user is stored in `localStorage`; 0 automated checks guard auth storage behavior (measured 2026-11-22).
- Users: Local demo users bear credential-exposure risk; maintainers bear regression/maturity risk.
- Baseline / current cost: `AuthService.register` persists `password` in plaintext and `login` compares plaintext; no auth-storage tests exist (repository scan 2026-11-22).
- Target outcome indicator: 0 plaintext password values stored in `shop_owners` records after register/login migration, and at least 5 passing auth-storage tests in CI within 30 days of release.
- Economic hypothesis: A small client-side hashing/migration change plus tests costs less than ongoing security-review noise and prevents avoidable credential exposure in demo installs over 3 years.
- Owner / date: repo owner, 2026-12-22.

## Outcome hypothesis

- Expected user outcome: registering and logging in continues to work, but stored auth records no longer contain plaintext passwords.
- Opportunity evidence: repository scan 2026-11-22 (`AuthService` plaintext storage/compare). No external user research; assumption based on code inspection.
- Signal: presence of plaintext `password` in stored user records (baseline 1 field/record) and count of passing auth-storage tests in CI (baseline 0).
- Follow-up owner/date: repo owner, 2026-12-22.

## Scope (in)

- `src/modules/auth/AuthService.ts` — hash passwords on register, verify hash on login, migrate legacy plaintext records on successful login.
- `src/modules/auth/AuthService.test.ts` — Vitest coverage for register/login/hash/migration behavior.
- `src/shared/types/index.ts` only if needed for stored-user typing clarity (no public behavior change).
- `specs/auth-storage-hardening/` — spec artifacts.

## Scope (out)

- Real backend authentication, OAuth, sessions, JWTs, or server-side password storage.
- OwnerGate PIN flow changes (already hashed with salt).
- Encrypting all localStorage data or adding a secret-management system.
- Changing the login/register UI.

## Acceptance criteria

<!-- Scenario(s): use scenario names verbatim from EXAMPLES.feature and/or
     @w<N> tags — ship_validate resolves both for traceability. A numbered
     list is allowed under this heading, but every item must still name its
     scenario(s) or @w<N> tag inline. -->

| # | Criterion | Scenario(s) |
|---|-----------|-------------|
| 1 | Registering a user stores a salted password hash, not the plaintext password. | register stores a hashed password |
| 2 | Logging in with the correct password succeeds against a hashed record. | login succeeds with a hashed password |
| 3 | Logging in with the wrong password fails against a hashed record. | login rejects an invalid password |
| 4 | A legacy plaintext record is accepted on correct login and upgraded to a hashed record. | legacy plaintext password is migrated on login |
| 5 | Auth storage tests run through `npm test` / CI. | auth storage suite runs in CI |

## Decisions

<!-- One block per decision. Every one-way-door or high-impact choice
     (persistence model, consistency guarantees, module/service boundaries,
     stateless vs stateful design, public contracts — REST/OpenAPI,
     events/AsyncAPI or schema registry, gRPC/protobuf IDL — and their
     documentation, security controls, framework vs custom mechanism)
     MUST record:
       - Context & forces: what drives the choice, what breaks without it
       - Options considered: at least two credible options, INCLUDING the
         simplest one and the most reversible one
       - Decision & why: the choice and the decisive tradeoff
       - Consequences: positive AND negative
       - Reversibility: one-way or two-way door; revisit trigger if known
     These feed `challenge_decision` — the review brief scores exactly
     this shape. -->

### D1 — Password hashing mechanism

- Context & forces: The app is client-side only, uses browser APIs, and already uses Web Crypto SHA-256 in OwnerGate. There is no backend to own bcrypt/argon2. Plaintext storage is unacceptable; adding a heavy crypto dependency is unnecessary.
- Options considered: (a) keep plaintext (simplest, but insecure); (b) Web Crypto SHA-256 with per-user random salt, same pattern as OwnerGate (simple, reversible, no dependency); (c) add bcrypt/argon2 JS library (stronger KDF, more dependency/runtime cost and still client-side).
- Decision & why: choose (b). It removes plaintext exposure with existing platform primitives and matches the existing OwnerGate pattern.
- Consequences: positive — no plaintext at rest in localStorage, no new dependency, testable; negative — SHA-256 is not a memory-hard password KDF, so it is not equivalent to server-side password hashing.
- Reversibility: two-way door; revisit when real backend auth is introduced.

### D2 — Legacy record migration

- Context & forces: Existing demo users may have plaintext `password` records in localStorage. A breaking format change would lock them out.
- Options considered: (a) drop old records (simple, destructive); (b) migrate plaintext record to salted hash on successful login (small, preserves access); (c) support both formats forever without migration (simplest runtime, leaves plaintext around).
- Decision & why: choose (b). It preserves access while eliminating plaintext after the next successful login.
- Consequences: positive — no unnecessary lockout; negative — plaintext remains until a successful login occurs; failed logins cannot safely upgrade.
- Reversibility: two-way door; remove migration path after a deprecation window if desired.
