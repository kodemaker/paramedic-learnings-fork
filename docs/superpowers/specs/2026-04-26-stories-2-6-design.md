# Stories 2–6 — Topic Discovery: Design

Date: 2026-04-26
Author: Rosa (with Claude as collaborator)
Scope: User Stories 2, 3, 4, 5, 6 from `docs/user-stories.md`
Builds on: Story 1 (create a topic manually), already shipped in `marinahaugen/topic-create`

## What we're building

The read-side of topics on top of Story 1's create flow:

- Story 2 — list operational topics
- Story 3 — search topics by keyword
- Story 4 — filter topics by area
- Story 5 — view topic details
- Story 6 — see why guidance exists (rationale + sources)

Built on a versioned schema so Stories 12–21 (AI propose, approve, version history) can extend the same data model without re-architecting.

## Key decisions

The headline decisions, made during brainstorming. Each is a design choice with consequences.

### 1. Versioned data model from day one (option B)

Topics split into `topics` (identity) and `topic_versions` (content). Sources hang off a version, not a topic.

Rationale: `docs/README.md` and `CLAUDE.md` are explicit that topics are versioned and approved changes create a new `TopicVersion`. Building flat now and migrating to versioned later would be more work than building versioned now while no production data exists. Reading-side stories (2–6) read from `current_version_id`; writing-side stories (12–18) will create new `topic_versions` rows without altering any tables.

### 2. UUID URLs for the detail page

`/topics/[id]` with the raw UUID. No slug column, no rename-vs-canonical-URL ambiguity. URLs are permanent under renames.

Slug-based URLs are deferred to a future story.

### 3. Search and filter via URL search params, server-rendered

`/topics?q=...&area=...`. The page is a server component that reads `searchParams`, queries Drizzle, and renders. No client state, no `useEffect` fetch loop.

Free wins: shareable URLs, the back button works, chip nav is plain `<a href>` tags, no JS needed for the filter UX.

### 4. List-page layout: search bar prominent + area chips

Full-width search input at top; below it, a row of area chips. The active chip is filled with the accent color; "All" clears the filter. Story 4's "show active filters clearly" criterion is satisfied for free.

### 5. Detail-page layout: single column, journal article

Per the Clinical Reference theme (`max-w-2xl` for prose pages):

```
← All topics
Topic
Adrenaline in cardiac arrest
[Cardiac chip] · Dr. Smith · Last updated 12 Apr 2026 · v1
─────────
[Italic lead summary]
─────────
GUIDANCE
[detailed text]
─────────
RATIONALE
[why text]
─────────
BASED ON
[source list — title, citation, optional link]
```

The `v1` badge ships now even though there is no v2 yet — Stories 19–21 will make it clickable later without redrawing this page.

### 6. Story 1's create form expands

Story 1's acceptance criteria already mention summary and creator; the current implementation under-built both. We finish Story 1 here.

The form moves from the `/topics` sidebar to its own page `/topics/new`. Reasons: six fields don't fit a sidebar visually; it cleanly separates "discover" (Stories 2–6 audience: clinicians) from "author" (Story 1 audience: topic owners), which matches the user-needs split in `docs/README.md`.

Sources are *not* on the create form — they belong to the AI-propose-and-approve flow (Stories 12–18) which is the natural place for source-management UX. Demo seed data fills sources for the four example topics so Story 6 demos cleanly on day 1.

## Data model

### Tables

```
topics
  id                  uuid       pk, default random
  name                text       not null
  area                topic_area not null
  owner               text       not null
  current_version_id  uuid       fk → topic_versions.id, nullable on insert,
                                 set during the create transaction
  created_at          timestamptz not null, default now()
  updated_at          timestamptz not null, default now()

topic_versions
  id                  uuid       pk, default random
  topic_id            uuid       fk → topics.id, not null
  version_number      int        not null, starts at 1, monotonically per topic
  summary             text       not null
  guidance            text       not null
  rationale           text       nullable
  published_at        timestamptz not null, default now()

sources
  id                  uuid       pk, default random
  topic_version_id    uuid       fk → topic_versions.id, not null
  title               text       not null
  citation            text       not null
  url                 text       nullable
  created_at          timestamptz not null, default now()
```

### Enum

```
topic_area: cardiac | airway | trauma | medical | drugs | operational
```

Postgres enum (Drizzle has first-class support; type-safe on the TS side; one-line migration to add a value).

### Why fields land where they do

- `name`, `area`, `owner` on `topics` — identity and classification, stable across content revisions. Renames don't bump the version.
- `summary`, `guidance`, `rationale` on `topic_versions` — these are what gets reviewed, edited, and approved.
- `sources.topic_version_id` (not `topic_id`) — when guidance is revised in v2, the old v1 must still display the sources that justified it. Linking to the version preserves the audit trail (Stories 19–21).
- `version_number` on `topic_versions` — used in the meta line (`v1`, `v2`, …). Computed at insert time (current count + 1 per topic, in the same transaction).
- `current_version_id` on `topics` — denormalized for read performance and clarity. Updated when a new version is published.

### Migration approach

Clean slate. The first migration adds `topic_versions`, `sources`, the `topic_area` enum, and the new columns on `topics`. Existing dev rows are wiped — this is a course exercise with no real data to preserve. The README will note `npx drizzle-kit migrate && npm run seed` after pulling.

### Seed data

`db/seed.ts` (or a SQL seed) inserts ~4 fully-fleshed example topics with summary + guidance + rationale + 1–2 sources each. This:

- Lets Stories 5/6 demo cleanly on day 1
- Exercises the versioned schema end-to-end (a smoke test in disguise)
- Gives the rationale + sources UI real content before any UI code is written

## API surface

### `GET /api/topics?q=&area=`

Query params:
- `q` — string, optional. Case-insensitive substring match (Postgres `ILIKE %q%`) against `topics.name`, the current version's `summary`, and the current version's `guidance`. The three columns are OR'd. No tokenization, no ranking — YAGNI for course scope; full-text search is a future story if it's ever needed.
- `area` — string, optional, must match `topic_area` enum (validated; bad values → 400). AND'd with the `q` clause.

The query joins `topics` to `topic_versions` on `topic_versions.id = topics.current_version_id`. Use an INNER JOIN — `current_version_id` is non-null in steady state because the `POST /api/topics` transaction sets it before commit, and no read can observe the in-flight null thanks to default transaction isolation.

Returns: array of topics joined to current version. Shape:
```ts
{
  id: string,
  name: string,
  area: TopicArea,
  owner: string,
  updatedAt: string,
  currentVersion: {
    versionNumber: number,
    summary: string,
    publishedAt: string,
  }
}[]
```

The list page server component will hit Drizzle directly (Story 1 pattern); this endpoint is for parity, testability, and possible future client-side use.

### `GET /api/topics/[id]`

Returns one topic with its current version + sources, or 404.

Shape:
```ts
{
  id: string,
  name: string,
  area: TopicArea,
  owner: string,
  updatedAt: string,
  currentVersion: {
    id: string,
    versionNumber: number,
    summary: string,
    guidance: string,
    rationale: string | null,
    publishedAt: string,
    sources: { id, title, citation, url }[]
  }
}
```

### `POST /api/topics`

Zod-validated body: `{ name, summary, area, owner, guidance, rationale? }`.

Behavior — Drizzle transaction:

1. Insert into `topics` with `current_version_id` null
2. Insert into `topic_versions` with `version_number = 1`, `topic_id = <topic.id>`
3. Update `topics.current_version_id = <version.id>` and `topics.updated_at = now()`
4. Return the joined topic

Errors return `{ error, issues: { fieldErrors } }` per the Story 1 pattern.

## Pages and components

### `/topics` (server component, rewritten)

Replaces the existing `/topics` page. Layout:

- Header (eyebrow "Topics" + h1 "Operational guidance"), like the existing.
- Search form: `<form method="get" action="/topics">` with a single input named `q`. Active `area` is preserved via a hidden field. No client component.
- Area chips: a row of `<a href>` links — `/topics`, `/topics?area=cardiac`, etc. — preserving any active `q`. Active chip styled with accent fill.
- Topic list: each row shows name (serif), summary (one line), area chip, last-updated. Each row is a link to `/topics/[id]`.
- Empty / no-match states (see below).
- "+ New topic" link to `/topics/new`.

### `/topics/new` (server shell + client form island)

Form with six fields:

- `name` — text, required, max 120
- `summary` — text, required, max 280
- `area` — select, required, options from the enum
- `owner` — text, required, max 120
- `guidance` — textarea, required, max 4000
- `rationale` — textarea, optional, max 4000

On `201`: `router.push('/topics/[id]')` to the new detail page.
On `400` with `issues.fieldErrors`: render per-field errors inline (Story 1 pattern).

### `/topics/[id]` (server component)

The approved detail-page layout (see "Detail-page layout" above). Soft 404 via `notFound()` if no row.

## Empty / edge states

- `/topics` with zero rows: "No topics yet" + CTA link to `/topics/new`.
- `/topics?q=foo&area=cardiac` with zero matches: "No topics match **foo** in *Cardiac*." + "Clear filters" link to `/topics`.
- `/topics/[id]` rationale missing: section header "Rationale" + muted body "Not yet recorded — comes via the propose-and-approve flow."
- `/topics/[id]` sources missing: "Based on" header + muted "No sources cited yet."
- `/topics/[id]` invalid uuid or no row: `notFound()` → standard Next.js 404.

## Build sequence (informs the implementation plan)

Leaf-up. Each step is independently shippable.

1. **Schema migration + seed**. Adds `topic_versions`, `sources`, `topic_area` enum, alters `topics`. Writes `db/seed.ts` with four example topics. Verifies that `npx drizzle-kit migrate && npm run seed` produces a fully populated DB.
2. **API routes**. `POST /api/topics` (transactional), `GET /api/topics?q=&area=`, `GET /api/topics/[id]`. Zod schemas at the boundary.
3. **Detail page** `/topics/[id]`. Smallest leaf — read-only, queries by id, renders the four sections. Tests against the seed data.
4. **List page** `/topics` rewrite. Search input + chip nav + extended row. Reads `searchParams`. Empty / no-match states.
5. **Create page** `/topics/new`. Form move + expansion. On success redirects to `/topics/[id]`.
6. **Polish**. 404 page, lint clean, build clean, browser smoke test of the full flow (create → list → search → filter → detail).

The order is leaf-up because the detail page only needs seeded reads, the list page builds on the same read pattern, and the form is the only write — landing it last lets steps 1–5 use the seed for everything.

## Out of scope / future work

Captured here so we know what we deliberately said no to:

- **Story 22 — user table + simple login.** Today, `owner` is a text field. Tripwire: the first story that needs accountability-on-write (knowing *which user* did the action, not just typed a name).
- **Source input UX.** Adding sources to a topic is part of the AI-propose-and-approve flow (Stories 12–18). Manual source authorship would duplicate that UX.
- **Editing topics outside the propose-approve flow.** Intentional — the system's whole shape says guidance changes through the loop. Renaming a topic, changing its area or owner is small enough to justify a separate "Edit topic metadata" story if it's ever needed.
- **Pagination, infinite scroll.** Tripwire: ~50 topics in real use. Not needed for a course exercise.
- **Slug-based URLs.** Deferred. UUID URLs cover Stories 2–6 fine.
- **Multi-area filter, advanced search operators, full-text search ranking.** YAGNI.
- **Dark mode.** Deliberately out per the design theme ("Light theme only — the ivory *is* the brand").

## Open questions

None at design time. Implementation-detail questions (e.g., is it cleaner to defer the `current_version_id` FK or to do insert-then-update, exact Drizzle query shape for the joined read) are deferred to the implementation-plan phase, where the right answer comes from trying the simpler thing first and adjusting if the constraint fails.
