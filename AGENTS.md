# AGENTS.md — ai-agent-bot-mfe

Guidance for AI agents (and humans) working in this repository.

## Project

A modular micro-frontend (MFE) React app centred on an **AI chatbot
agent**, with an admin dashboard, landing page, auth, and an embeddable
chat widget. Multiple AI providers supported: OpenAI, Gemini, Ollama.
Stack: React + TypeScript + Vite, axios, framer-motion, react-router-dom,
Tailwind (postcss). Docker + nginx for deployment.

## Commands

Verified 2026-11-13 against CI (`.github/workflows/ci.yml`) and
`package.json`.

| Task | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` (Vite, `vite.config.ts`) |
| Build all (CI) | `npm run build:all` = `build:spa` + `build` |
| SPA build | `npm run build:spa` (`vite.config.ts`) |
| Widget build | `npm run build` (`vite.widget.config.ts`) |
| Preview | `npm run preview` |

Two Vite configs produce two bundles: the SPA shell (`vite.config.ts`)
and the embeddable widget (`vite.widget.config.ts`). `dist/` is build
output.

## Architecture

```
src/
  modules/
    agent/       chatbot agent UI/logic
    auth/        authentication screens/flow
    dashboard/   admin dashboard
    landing/     marketing/landing page
    widget/      embeddable chat widget entry
  shared/        cross-module components/utils
  styles/        Tailwind/global styles
public/assets   static assets served by Vite
Dockerfile      production image (nginx)
nginx.conf      SPA + widget hosting config
docker-compose.yml  local stack
docs/           screenshots/design notes
```

Module federation style: each `modules/*` is a self-contained feature
area; `shared/` holds common code. The widget build is a separate entry
so it can be embedded on third-party pages.

## Conventions

- React function components + TypeScript; Tailwind for styling.
- axios for HTTP; keep API calls in module-level service files, not
  inline in components.
- AI provider integrations should stay behind a provider-agnostic
  interface — don't hard-code OpenAI/Gemini/Ollama types into shared UI.
- KISS: modules are folders, not packages — no need for a monorepo tool.

## Landmines

- **Default branch is `main`, not `master`.**
- `node_modules/` and `dist/` exist in the tree locally — don't commit
  them; `npm ci` is the clean install.
- Two build outputs — `build` alone builds only the widget; CI runs
  `build:all`. A "successful build" claim must specify which config.
- AI provider API keys are env-driven — never commit `.env`; check
  `vite.config.ts` / `vite.widget.config.ts` `define`/`envPrefix` for
  which vars get inlined into the bundle (Vite inlines `VITE_*` at build
  time — treat them as public).
- Widget vs SPA share `src/` — changes to `shared/` affect both bundles.

## Agent rules

- Branch from `main`; name branches `feat/*`, `fix/*`, `chore/*`, `docs/*`.
- Docs-only changes still go through a PR; never commit to `main` directly.
- Verify before claiming: `npm ci && npm run build:all` and report the
  real result; run the dev server to sanity-check UI changes.
- Keep provider integrations behind an abstraction; document new env vars
  in AGENTS.md when added.
- Keep changes minimal and consistent with surrounding code. No drive-by
  refactors.
- Update AGENTS.md / docs/ARCHITECTURE.md when modules, build outputs, or
  env vars change.
