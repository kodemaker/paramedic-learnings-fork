# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

This is a **course scaffold**, not a finished product. The repo is used as a hands-on case during a two-day agentic-development course, and participants build features on top of a deliberately minimal starting point.

- `docs/README.md`, `docs/reference-specification.md`, and `docs/user-stories.md` describe the **intended product** (topics, versions, sources, AI-assisted change proposals, approvals, subscriptions). **Most of that is not implemented.**
- `src/` currently implements a single domain object: `learnings` (title, description, author, timestamps). Assume any reference to topics/versions/sources in the docs is a future feature, not existing code.

When asked to "add X", check whether X already exists before designing it — usually it doesn't.

## Common commands

```bash
# Dev loop
npm run dev              # Next.js dev server on http://localhost:3000
npm run build            # production build
npm run lint             # ESLint (flat config, eslint.config.mjs)

# Database (Docker Compose)
docker compose up -d     # starts Postgres 16 on port 15432 (not 5432)
docker compose down      # stops; `docker compose down -v` also wipes the volume

# Drizzle migrations
npx drizzle-kit generate # regenerate SQL migration after editing src/db/schema.ts
npx drizzle-kit migrate  # apply migrations to the DB in DATABASE_URL
```

There is no test runner wired up yet. If you add tests, add the script to `package.json` and document the single-test invocation here.

## Architecture

Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind v4 + Drizzle ORM on `postgres-js` + Zod.

### Data flow for mutations (the pattern to match)

1. **UI** — a client component (`"use client"`) renders a `<form action={...}>` that calls a server action with `FormData`. See `src/components/LearningForm.tsx`.
2. **Server action** — in `src/app/actions.ts` (module-level `"use server"`). Parse `FormData` → validate with a Zod schema from `src/lib/validations.ts` → call Drizzle → `revalidatePath("/")` so the feed re-fetches.
3. **Read path** — server components (e.g. `src/app/page.tsx`) call Drizzle query functions directly; there is no API route layer.

Keep new mutation features in this shape unless there's a concrete reason not to. In particular, do not introduce a REST/tRPC layer just to mirror the action — the Server Action *is* the backend boundary.

### Database layer

- `src/db/schema.ts` — Drizzle schema. Exports `learnings` plus inferred `Learning` and `NewLearning` types used throughout the app.
- `src/db/index.ts` — creates a `postgres` client from `process.env.DATABASE_URL` and wraps it in Drizzle. Imported as `@/db`.
- `drizzle.config.ts` points at `./src/db/schema.ts` and outputs migrations to `./drizzle/`.

### Validation

- Schemas live in `src/lib/validations.ts` and are the source of truth for mutation inputs. Prefer `z.infer<typeof schema>` over hand-written types for request payloads.

### Path alias

- `@/*` → `src/*` (configured in `tsconfig.json`). Use it in imports consistently (`@/db`, `@/lib/validations`, `@/components/...`).

## Non-obvious setup details

- **Postgres port is 15432**, chosen intentionally to avoid clashing with any local Postgres. Don't "fix" it back to 5432.
- **`drizzle.config.ts` imports `@next/env` and calls `loadEnvConfig(process.cwd())`** so that `drizzle-kit` (which runs outside Next.js) can read `DATABASE_URL` from `.env.local`. Don't replace this with `dotenv` — `@next/env` matches Next.js's own env-loading precedence (`.env.local` → `.env.<env>` → `.env`).
- `.env.local` is committed in this course repo (it contains only the local Docker Postgres URL, no secrets). `.env.example` is the canonical template.
