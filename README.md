# 🚑 Paramedic Learnings

A learning-sharing platform for ambulance personnel. Document field experiences and learnings so the whole team benefits from shared knowledge.

> **Course project** — This app is used as a hands-on use case during a two-day agentic development course.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL — or Docker (the repo includes `docker-compose.yml` for a local Postgres on port 15432)

### Setup

```bash
# Start Postgres (skip if you run PostgreSQL locally yourself)
docker compose up -d

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL if you're not using the included Docker setup

# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js (App Router) + TypeScript
- React + Tailwind CSS
- PostgreSQL + Drizzle ORM
- Zod for validation
