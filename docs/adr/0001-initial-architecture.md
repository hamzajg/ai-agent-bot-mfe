# ADR 0001 — Initial architecture

Date: 2026-11-13 (baseline recorded retroactively)
Status: accepted (describes what is built)

## Context

An AI chatbot product needing both a full app (dashboard, auth, landing)
and a lightweight embeddable widget for third-party sites, with pluggable
AI providers.

## Decisions

1. **Module-folder MFE, not a monorepo.** `src/modules/{agent,auth,
   dashboard,landing,widget}` + `src/shared/` — modules are folders in one
   Vite app. Rationale: KISS — no federation runtime needed yet; the
   widget is a separate *build*, not a separate deployable.
2. **Two Vite configs, two bundles.** `vite.config.ts` (SPA) and
   `vite.widget.config.ts` (embeddable widget). Rationale: the widget must
   be a self-contained asset external sites can load; sharing source keeps
   one codebase.
3. **Provider-agnostic AI layer.** OpenAI, Gemini and Ollama are supported
   providers behind a common interface. Rationale: avoid lock-in; the
   agent module talks to an abstraction, not a vendor SDK.
4. **React + TS + Vite + Tailwind + axios.** Rationale: standard modern
   SPA stack; axios chosen for HTTP (interceptors fit auth flows).
5. **Static hosting via nginx + Docker.** No server runtime — the app is
   pure static bundles. Rationale: simplest deploy; backend concerns live
   in the AI providers / auth service, not this repo.

## Consequences / open questions

- Widget and SPA share `src/shared/` — a breaking change there breaks
  both bundles; keep shared code stable.
- No backend in repo: auth/dashboard persistence is external — the env
  contract (`VITE_*`) is the real API boundary and must stay documented.
- Streaming support depends on provider; the UI abstraction must not
  assume SSE everywhere.
- True module federation (runtime sharing across MFEs) is not implemented
  — folders + dual builds is the current mechanism.
