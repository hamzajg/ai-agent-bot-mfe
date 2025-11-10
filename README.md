# AI Agent Bot MFE

A modular micro-frontend application featuring an AI chatbot agent with admin dashboard and widget capabilities.

## Features

- AI Chatbot Widget (embeddable)
- Admin Dashboard
- Landing Page
- Authentication System
- Multiple AI Service Integrations:
  - OpenAI
  - Gemini
  - Ollama

## Project Structure

```
src/
├── modules/          # Modular feature organization
│   ├── agent/        # AI Agent core functionality
│   ├── auth/         # Authentication module
│   ├── dashboard/    # Admin dashboard
│   ├── landing/      # Landing page
│   └── widget/       # Embeddable chat widget
└── shared/           # Shared components and utilities
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Docker (optional, for containerization)

### Installation

1. Clone the repository
```bash
git clone https://github.com/hamzajg/ai-agent-bot-mfe.git
cd ai-agent-bot-mfe
```

2. Install dependencies
```bash
yarn install
```

3. Start development server
```bash
yarn dev
```

### Building

Build all micro-frontends:
```bash
yarn build:all
```

Or build specific parts:
```bash
yarn build:widget    # Build widget only
yarn build:spa       # Build SPA
```

### Docker Deployment

Build and run with Docker Compose:
```bash
docker compose up --build -d
```

## Development

The project uses Vite for building and development. Each micro-frontend has its own entry point and configuration:

- Widget: `vite.widget.config.ts`
- SPA: `vite.config.ts`