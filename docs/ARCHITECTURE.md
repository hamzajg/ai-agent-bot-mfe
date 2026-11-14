# Architecture — ai-agent-bot-mfe

Current-state map. Descriptive, not aspirational; see `docs/adr/` for why.

## Shape

```
ai-agent-bot-mfe/
├── src/
│   ├── modules/           feature modules (MFE-style)
│   │   ├── agent/         chatbot agent
│   │   ├── auth/          login/signup/session
│   │   ├── dashboard/     admin dashboard
│   │   ├── landing/       marketing page
│   │   └── widget/        embeddable chat widget entry
│   ├── shared/            shared components/hooks/utils
│   ├── styles/            Tailwind + global CSS
│   └── main entry(s)      per Vite config
├── public/assets          static assets
├── vite.config.ts         SPA build config
├── vite.widget.config.ts  widget build config
├── Dockerfile + nginx.conf  production hosting
├── docker-compose.yml     local deployment
└── docs/                  screenshots, design notes
```

## Build outputs

- `vite.config.ts` → SPA shell (dashboard/landing/auth).
- `vite.widget.config.ts` → embeddable widget bundle (different entry,
  own output) for third-party pages.
- `npm run build:all` runs both — CI gate.

## Flows

- **Chat:** widget/agent module → axios → configured AI provider
  (OpenAI / Gemini / Ollama) → streamed or plain response → UI.
- **Auth:** auth module handles session; dashboard/agent gated behind it.
- **Embed:** external page loads widget bundle → chat UI mounts standalone.

## State

Client-side React state + axios calls; no visible backend in repo — the
"backend" is the AI provider APIs plus whatever auth/dashboard endpoints
are configured via env. Treat env config as the integration contract.

## Deployment

nginx serves `dist/`; Dockerfile + compose wrap it. Widget bundle is a
separate static asset consumers can embed.
