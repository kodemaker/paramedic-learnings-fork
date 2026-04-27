# Paramedic Learnings

A knowledge platform for ambulance personnel: capture and improve operational guidance ("topics") with AI-assisted analysis and human approval.

> **Course project** — This repository is the empty starting point for a two-day agentic development course. The infrastructure (Next.js, Drizzle, Postgres, Tailwind, Zod) is wired up; the domain is yours to build. See [docs/user-stories.md](docs/user-stories.md) for the backlog.

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

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Where to Start

The backlog is in [docs/user-stories.md](docs/user-stories.md). Begin with **Story 1: Create a topic manually** — every other story builds on having topics in the database.

Once you define your first table in `src/db/schema.ts`, generate and apply the migration:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Database

After cloning or pulling schema changes:

```bash
docker compose up -d
npx drizzle-kit migrate
npm run seed
```

The seed wipes existing topic data and inserts four example topics — useful for demoing Stories 2–6.

## Tech Stack

- Next.js (App Router) + TypeScript
- React + Tailwind CSS
- PostgreSQL + Drizzle ORM
- Zod for validation
