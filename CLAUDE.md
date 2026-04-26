# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A **deliberately empty starter skeleton** for a two-day agentic-coding course. The infrastructure is wired up (Next.js 16 App Router, Drizzle ORM, Postgres, Tailwind v4, Zod), but the domain has not been built yet — `src/db/schema.ts` only contains `export {};` and there is no `drizzle/` migrations directory.

Participants build the domain by working through `docs/user-stories.md`, starting with **Story 1: Create a topic manually**. The product vision (knowledge platform for ambulance personnel, with an "AI proposes, human approves" loop) is described in `docs/README.md`.

## Commands

First-time setup on a fresh clone:

```bash
npm install
cp .env.example .env.local   # then edit if not using the included Docker Postgres
docker compose up -d         # or point DATABASE_URL at your own Postgres
```

Day-to-day:

```bash
npm run dev            # Next dev server on http://localhost:3000
npm run build          # Production build
npm run start          # Run production build
npm run lint           # ESLint (flat config: next/core-web-vitals + next/typescript)

docker compose up -d   # Local Postgres 16 on port 15432 (NOT 5432)

# After editing src/db/schema.ts:
npx drizzle-kit generate   # Generate migration SQL into ./drizzle
npx drizzle-kit migrate    # Apply migrations to DATABASE_URL
```

There is no test runner configured yet — adding one is a participant decision.

## Architecture notes

- **Path alias**: `@/*` → `./src/*` (configured in `tsconfig.json`).
- **DB client** (`src/db/index.ts`): single `postgres-js` connection, exposed as `db` from `drizzle-orm/postgres-js` with the schema imported as a namespace. Add new tables to `src/db/schema.ts` and they will be picked up automatically by `db.query.*`.
- **Drizzle config** (`drizzle.config.ts`) uses `@next/env`'s `loadEnvConfig` so `drizzle-kit` reads `.env.local` the same way Next does — no separate dotenv loader needed.
- **Postgres port is 15432**, not 5432. The `.env.example` and `docker-compose.yml` agree on this; if a participant runs Postgres on the host instead of Docker, they need to update `DATABASE_URL` in `.env.local` to match.
- **App Router layout** (`src/app/layout.tsx`) defines the page chrome (header + footer) and is locked to a light theme via Tailwind classes — `globals.css` does not toggle on `prefers-color-scheme` (see commit `ea951ba` for the reason: dark-mode contrast was broken). Keep this constraint when restyling.
- **React 19 + Next 16 + Tailwind v4**. Tailwind v4 uses `@import "tailwindcss";` in `globals.css` and `@theme inline { ... }` for token mapping — no `tailwind.config.ts`.

## Domain guardrails (from docs/README.md)

When implementing AI-assisted stories (Stories 12–18: summaries, conflict detection, change proposals, approvals):

- AI **proposes**; humans **approve, edit, or reject**. Do not auto-publish guidance changes.
- Topics are **versioned**. An approval creates a new `TopicVersion` rather than mutating the current one.
- Every change must remain **traceable**: which source(s) triggered it, who proposed, who approved, when.

The suggested vertical slice through the backlog is listed at the bottom of `docs/user-stories.md` (Stories 1, 2, 5, 6, 9, 12, 14, 15, 17, 19) — it demonstrates the full propose/approve loop end-to-end and is a good order to build in.
