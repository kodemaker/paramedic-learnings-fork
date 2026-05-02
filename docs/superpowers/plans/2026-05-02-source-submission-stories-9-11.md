# Source Submission (Stories 9–11) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Stories 9 (Submit a debrief report), 10 (Submit a research finding), and 11 (Classify source type) by widening the existing `sources` table to support the full submission lifecycle, adding `/sources/*` pages and a `POST/GET /api/sources` route.

**Architecture:** Single `sources` table evolution — `topic_version_id` becomes nullable, plus new `source_type` enum, `content`, and `event_date` columns. Submission via Zod-validated discriminated-union API; reads via server components hitting Drizzle directly. Mirrors the existing topic flow patterns. See `docs/adr/001-source-submission-and-classification.md` for the full design.

**Tech Stack:** Next.js 16 (App Router), React 19, Drizzle ORM, Postgres 16, Zod 3, Tailwind v4, Vitest + Testing Library.

---

## Pre-flight check

Before starting, ensure:
- `docker compose up -d` has run (Postgres on `localhost:15432`)
- `npm install` is up-to-date
- Working tree is clean (commit or stash any unrelated work)

---

## File map

**Modified:**
- `src/db/schema.ts` — add `sourceType` enum; widen `sources` table (3 new columns, 2 columns become nullable)
- `src/app/layout.tsx` — add "Sources" nav link

**Created:**
- `drizzle/0002_<auto-name>.sql` + `drizzle/meta/0002_snapshot.json` — generated migration
- `src/app/sources/_constants.ts` — `SOURCE_TYPE_LABELS`
- `src/app/api/sources/route.ts` — `POST` (create) + `GET` (list)
- `src/app/api/sources/route.test.ts` — Zod schema unit tests
- `src/app/sources/page.tsx` — list view (server component)
- `src/app/sources/new/page.tsx` — server-component shell hosting form
- `src/app/sources/new/SubmitSourceForm.tsx` — client form with type-conditional fields
- `src/app/sources/new/SubmitSourceForm.test.tsx` — form behavior tests
- `src/app/sources/[id]/page.tsx` — detail view (server component)
- `src/app/sources/[id]/not-found.tsx` — 404 page

---

## Task 1: Schema changes

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 1: Edit `src/db/schema.ts`**

Add `date` to the import list; add a new `sourceType` enum; modify the `sources` table.

Replace the existing import block:

```ts
import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
```

Add the new enum directly after `topicArea` (after line 17):

```ts
export const sourceType = pgEnum("source_type", ["debrief", "research"]);
```

Replace the existing `sources` table definition (lines 50–61) with:

```ts
export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nullable: a source exists before being linked to a topic version.
  // Linking happens in Stories 15/18.
  topicVersionId: uuid("topic_version_id").references(() => topicVersions.id, {
    onDelete: "cascade",
  }),
  sourceType: sourceType("source_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  // Required at the Zod layer when sourceType === "debrief".
  eventDate: date("event_date"),
  // Required at the Zod layer when sourceType === "research".
  citation: text("citation"),
  url: text("url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

Add the `SourceType` type alias near the bottom (alongside `TopicArea`):

```ts
export type SourceType = (typeof sourceType.enumValues)[number];
```

The existing `Source` and `NewSource` exports automatically reflect the new column shape via `$inferSelect` / `$inferInsert` — no change needed.

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: no errors. (You may see unrelated pre-existing warnings; the file we just edited must produce none.)

- [ ] **Step 3: Commit**

```bash
git add src/db/schema.ts
git commit -m "feat(schema): widen sources entity for submission lifecycle

Adds sourceType enum (debrief, research). Widens sources with content,
event_date, source_type. Loosens topic_version_id and citation NOT NULL
constraints — sources now exist before being linked to a topic version
(linking comes in Stories 15/18).

See docs/adr/001-source-submission-and-classification.md."
```

---

## Task 2: Generate and apply migration

**Files:**
- Create: `drizzle/0002_<auto-name>.sql`
- Create: `drizzle/meta/0002_snapshot.json`

- [ ] **Step 1: Generate the migration**

Run: `npx drizzle-kit generate`

Expected output: a new `drizzle/0002_*.sql` file is created plus `drizzle/meta/0002_snapshot.json`. drizzle-kit may prompt about the `topicVersionId` and `citation` columns dropping `NOT NULL` — confirm those changes (use arrow keys / Enter at each prompt).

If drizzle-kit stalls (non-TTY environment), follow the CLAUDE.md fallback: hand-author both files. The expected SQL is:

```sql
CREATE TYPE "public"."source_type" AS ENUM('debrief', 'research');
--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "topic_version_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "citation" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "source_type" "source_type" NOT NULL;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "content" text NOT NULL;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "event_date" date;
```

Note: adding `NOT NULL` columns without defaults requires the table to be empty. The current `sources` table has no rows in dev (it was added in commit `0dd8d28` but never populated), so this is safe. If you have hand-seeded rows: `TRUNCATE sources;` first.

- [ ] **Step 2: Open and review the generated SQL**

Run: `cat drizzle/0002_*.sql`
Expected: contains `CREATE TYPE`, two `DROP NOT NULL`, three `ADD COLUMN` statements (matching the SQL above).

- [ ] **Step 3: Apply the migration**

Run: `npx drizzle-kit migrate`
Expected output: `[✓] migrations applied successfully!` (or similar). The `drizzle/meta/_journal.json` file gets updated with the new entry.

- [ ] **Step 4: Verify the schema in Postgres**

Run:
```bash
docker compose exec -T postgres psql -U postgres -d paramedic_learnings -c "\d sources"
```
Expected: shows `topic_version_id` (nullable), `source_type` (`source_type` NOT NULL), `content` (text NOT NULL), `event_date` (date), `citation` (text, nullable).

- [ ] **Step 5: Commit**

```bash
git add drizzle/
git commit -m "feat(db): migration 0002 — widen sources for submission lifecycle"
```

---

## Task 3: Page-local constants

**Files:**
- Create: `src/app/sources/_constants.ts`

- [ ] **Step 1: Create the file**

Path: `src/app/sources/_constants.ts`

```ts
import type { SourceType } from "@/db/schema";

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  debrief: "Debrief",
  research: "Research",
};
```

- [ ] **Step 2: Verify type completeness**

Run: `npx tsc --noEmit`
Expected: no errors. If you add a new value to the `sourceType` enum later and forget to label it here, this `Record<SourceType, string>` will fail to compile — by design.

- [ ] **Step 3: Commit**

```bash
git add src/app/sources/_constants.ts
git commit -m "feat(sources): add SOURCE_TYPE_LABELS for human-readable rendering"
```

---

## Task 4: API — POST Zod schema for debrief (TDD)

**Files:**
- Create: `src/app/api/sources/route.test.ts`
- Create: `src/app/api/sources/route.ts`

- [ ] **Step 1: Write the failing test**

Path: `src/app/api/sources/route.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { createSourceSchema } from "./route";

describe("createSourceSchema", () => {
  const validDebrief = {
    sourceType: "debrief",
    title: "Cardiac arrest in the field",
    eventDate: "2026-04-15",
    content: "Patient went into VF en route. CPR initiated within 60s.",
  };

  it("accepts a valid debrief payload", () => {
    expect(createSourceSchema.safeParse(validDebrief).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/app/api/sources/route.test.ts`
Expected: FAIL with module-not-found error (route.ts doesn't exist).

- [ ] **Step 3: Write the minimal implementation**

Path: `src/app/api/sources/route.ts`

```ts
import { z } from "zod";

const debriefInputSchema = z.object({
  sourceType: z.literal("debrief"),
  title: z.string().trim().min(1, "Title is required").max(200),
  eventDate: z.string().date(),
  content: z.string().trim().min(1, "Content is required").max(10_000),
});

export const createSourceSchema = debriefInputSchema;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/app/api/sources/route.test.ts`
Expected: PASS — 1 test passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/sources/route.ts src/app/api/sources/route.test.ts
git commit -m "feat(api/sources): Zod schema for debrief submissions"
```

---

## Task 5: API — POST Zod schema extends to research (TDD)

**Files:**
- Modify: `src/app/api/sources/route.test.ts`
- Modify: `src/app/api/sources/route.ts`

- [ ] **Step 1: Add the failing test**

Append to `src/app/api/sources/route.test.ts` inside the same `describe` block:

```ts
  const validResearch = {
    sourceType: "research",
    title: "Adrenaline timing in OHCA",
    citation: "Smith et al. 2025, NEJM",
    url: "https://www.nejm.org/example",
    content: "Meta-analysis of 12 trials suggesting earlier dosing improves ROSC.",
  };

  it("accepts a valid research payload", () => {
    expect(createSourceSchema.safeParse(validResearch).success).toBe(true);
  });

  it("accepts a research payload without optional url", () => {
    const { url, ...withoutUrl } = validResearch;
    void url;
    expect(createSourceSchema.safeParse(withoutUrl).success).toBe(true);
  });
```

- [ ] **Step 2: Run to verify the new tests fail**

Run: `npx vitest run src/app/api/sources/route.test.ts`
Expected: FAIL — the schema only knows about debrief; research payloads are rejected.

- [ ] **Step 3: Convert the schema to a discriminated union**

Replace the body of `src/app/api/sources/route.ts` with:

```ts
import { z } from "zod";

const debriefInputSchema = z.object({
  sourceType: z.literal("debrief"),
  title: z.string().trim().min(1, "Title is required").max(200),
  eventDate: z.string().date(),
  content: z.string().trim().min(1, "Content is required").max(10_000),
});

const researchInputSchema = z.object({
  sourceType: z.literal("research"),
  title: z.string().trim().min(1, "Title is required").max(200),
  citation: z.string().trim().min(1, "Citation is required").max(500),
  url: z
    .string()
    .url()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  content: z.string().trim().min(1, "Summary is required").max(10_000),
});

export const createSourceSchema = z.discriminatedUnion("sourceType", [
  debriefInputSchema,
  researchInputSchema,
]);
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npx vitest run src/app/api/sources/route.test.ts`
Expected: PASS — 3 tests passing (debrief, research, research-no-url).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/sources/route.ts src/app/api/sources/route.test.ts
git commit -m "feat(api/sources): extend schema to research via discriminated union"
```

---

## Task 6: API — POST validation rejection tests (TDD)

**Files:**
- Modify: `src/app/api/sources/route.test.ts`

These are tests that *should already pass* given the Zod schema from Task 5 — they pin down the contract so future schema changes don't silently regress it.

- [ ] **Step 1: Add the rejection tests**

Append inside the same `describe` block:

```ts
  it("rejects a debrief without eventDate", () => {
    const { eventDate, ...withoutDate } = validDebrief;
    void eventDate;
    expect(createSourceSchema.safeParse(withoutDate).success).toBe(false);
  });

  it("rejects a debrief with malformed eventDate", () => {
    const result = createSourceSchema.safeParse({
      ...validDebrief,
      eventDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a research payload without citation", () => {
    const { citation, ...withoutCitation } = validResearch;
    void citation;
    expect(createSourceSchema.safeParse(withoutCitation).success).toBe(false);
  });

  it("rejects an unknown sourceType", () => {
    const result = createSourceSchema.safeParse({
      ...validDebrief,
      sourceType: "incident",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = createSourceSchema.safeParse({ ...validDebrief, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty content", () => {
    const result = createSourceSchema.safeParse({
      ...validDebrief,
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a research payload with an invalid url", () => {
    const result = createSourceSchema.safeParse({
      ...validResearch,
      url: "not a url",
    });
    expect(result.success).toBe(false);
  });
```

- [ ] **Step 2: Run all tests**

Run: `npx vitest run src/app/api/sources/route.test.ts`
Expected: PASS — all tests (3 from earlier + 7 new = 10 total).

If any of the new tests *fail*, adjust the schema in `route.ts` to match — but in practice the discriminated union from Task 5 already enforces all of these.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/sources/route.test.ts
git commit -m "test(api/sources): pin down schema rejection contract"
```

---

## Task 7: API — POST and GET handlers

**Files:**
- Modify: `src/app/api/sources/route.ts`

The schema is in place; now wire up the actual HTTP handlers. The project convention (per `src/app/api/topics/route.ts`) is **not** to write integration tests for handlers — they are exercised manually and via the form's tests with mocked `fetch`. Follow the same convention.

- [ ] **Step 1: Add `POST` and `GET` handlers**

Replace the contents of `src/app/api/sources/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sources } from "@/db/schema";

const debriefInputSchema = z.object({
  sourceType: z.literal("debrief"),
  title: z.string().trim().min(1, "Title is required").max(200),
  eventDate: z.string().date(),
  content: z.string().trim().min(1, "Content is required").max(10_000),
});

const researchInputSchema = z.object({
  sourceType: z.literal("research"),
  title: z.string().trim().min(1, "Title is required").max(200),
  citation: z.string().trim().min(1, "Citation is required").max(500),
  url: z
    .string()
    .url()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  content: z.string().trim().min(1, "Summary is required").max(10_000),
});

export const createSourceSchema = z.discriminatedUnion("sourceType", [
  debriefInputSchema,
  researchInputSchema,
]);

export async function GET() {
  const rows = await db
    .select({
      id: sources.id,
      sourceType: sources.sourceType,
      title: sources.title,
      createdAt: sources.createdAt,
    })
    .from(sources)
    .orderBy(desc(sources.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const [created] =
    data.sourceType === "debrief"
      ? await db
          .insert(sources)
          .values({
            sourceType: "debrief",
            title: data.title,
            eventDate: data.eventDate,
            content: data.content,
          })
          .returning()
      : await db
          .insert(sources)
          .values({
            sourceType: "research",
            title: data.title,
            citation: data.citation,
            url: data.url,
            content: data.content,
          })
          .returning();

  return NextResponse.json(created, { status: 201 });
}
```

- [ ] **Step 2: Re-run schema tests to ensure nothing regressed**

Run: `npx vitest run src/app/api/sources/route.test.ts`
Expected: PASS — all 10 tests still pass.

- [ ] **Step 3: Manual smoke test — POST a debrief**

Start the dev server in another terminal: `npm run dev`

Then:
```bash
curl -i -X POST http://localhost:3000/api/sources \
  -H 'Content-Type: application/json' \
  -d '{
    "sourceType": "debrief",
    "title": "Cardiac arrest curbside",
    "eventDate": "2026-04-15",
    "content": "Bystander CPR before our arrival. ROSC after 2nd shock."
  }'
```
Expected: `HTTP/1.1 201` with a JSON body containing `id`, `sourceType: "debrief"`, `title`, `content`, `eventDate: "2026-04-15"`, `citation: null`, `url: null`, `createdAt` timestamp, and `topicVersionId: null`.

- [ ] **Step 4: Manual smoke test — POST a research finding**

```bash
curl -i -X POST http://localhost:3000/api/sources \
  -H 'Content-Type: application/json' \
  -d '{
    "sourceType": "research",
    "title": "Adrenaline timing in OHCA",
    "citation": "Smith et al. 2025, NEJM",
    "content": "Meta-analysis of 12 trials suggesting earlier dosing improves ROSC."
  }'
```
Expected: `HTTP/1.1 201` with `sourceType: "research"`, `eventDate: null`, `citation` populated.

- [ ] **Step 5: Manual smoke test — GET the list**

```bash
curl -s http://localhost:3000/api/sources | jq
```
Expected: a JSON array with both rows you just inserted, newest first, each containing `id`, `sourceType`, `title`, `createdAt` (and nothing else — the list response is deliberately lighter than the detail).

- [ ] **Step 6: Manual smoke test — POST a malformed payload**

```bash
curl -i -X POST http://localhost:3000/api/sources \
  -H 'Content-Type: application/json' \
  -d '{"sourceType": "debrief", "title": "x"}'
```
Expected: `HTTP/1.1 400` with body `{"error":"Validation failed","issues":{"formErrors":[],"fieldErrors":{"eventDate":[...],"content":[...]}}}`.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/sources/route.ts
git commit -m "feat(api/sources): POST creates source, GET lists newest-first"
```

---

## Task 8: SubmitSourceForm — render & type-switch (TDD)

**Files:**
- Create: `src/app/sources/new/SubmitSourceForm.tsx`
- Create: `src/app/sources/new/SubmitSourceForm.test.tsx`

- [ ] **Step 1: Write the first failing tests (render + reveal-on-pick)**

Path: `src/app/sources/new/SubmitSourceForm.test.tsx`

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SubmitSourceForm } from "./SubmitSourceForm";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("SubmitSourceForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockClear();
    refreshMock.mockClear();
  });

  it("renders only the source type picker initially", () => {
    render(<SubmitSourceForm />);
    expect(screen.getByLabelText(/source type/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^title/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/event date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/citation/i)).not.toBeInTheDocument();
  });

  it("reveals debrief fields when debrief is picked", () => {
    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "debrief" },
    });
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^content/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/citation/i)).not.toBeInTheDocument();
  });

  it("reveals research fields when research is picked", () => {
    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "research" },
    });
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/citation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/event date/i)).not.toBeInTheDocument();
  });

  it("preserves title when switching from debrief to research", () => {
    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "debrief" },
    });
    fireEvent.change(screen.getByLabelText(/^title/i), {
      target: { value: "My title" },
    });
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "research" },
    });
    expect(screen.getByLabelText(/^title/i)).toHaveValue("My title");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/sources/new/SubmitSourceForm.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the form skeleton with conditional rendering**

Path: `src/app/sources/new/SubmitSourceForm.tsx`

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { sourceType, type SourceType } from "@/db/schema";
import { SOURCE_TYPE_LABELS } from "../_constants";

const SOURCE_TYPES = sourceType.enumValues.map((value) => ({
  value,
  label: SOURCE_TYPE_LABELS[value],
}));

type FieldErrors = Partial<
  Record<
    | "sourceType"
    | "title"
    | "eventDate"
    | "content"
    | "citation"
    | "url",
    string[]
  >
>;

export function SubmitSourceForm() {
  const router = useRouter();
  const [type, setType] = useState<SourceType | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [citation, setCitation] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Implementation comes in Task 9.
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label
          htmlFor="source-type"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Source type
        </label>
        <select
          id="source-type"
          name="sourceType"
          required
          value={type}
          onChange={(e) => setType(e.target.value as SourceType | "")}
          className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-invalid={Boolean(fieldErrors.sourceType)}
        >
          <option value="" disabled>
            Choose a source type…
          </option>
          {SOURCE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {type !== "" && (
        <Field
          id="source-title"
          label="Title"
          value={title}
          onChange={setTitle}
          error={fieldErrors.title?.[0]}
          maxLength={200}
          required
          placeholder="Short, descriptive headline"
        />
      )}

      {type === "debrief" && (
        <>
          <div>
            <label
              htmlFor="source-event-date"
              className="mb-1.5 block font-sans text-sm font-medium text-ink"
            >
              Event date
            </label>
            <input
              id="source-event-date"
              name="eventDate"
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              aria-invalid={Boolean(fieldErrors.eventDate)}
            />
            {fieldErrors.eventDate?.[0] && (
              <p className="mt-1.5 font-sans text-xs text-accent">
                {fieldErrors.eventDate[0]}
              </p>
            )}
          </div>
          <Textarea
            id="source-content"
            label="Content"
            value={content}
            onChange={setContent}
            error={fieldErrors.content?.[0]}
            maxLength={10_000}
            required
            rows={8}
            placeholder="What happened in the field — sequence of events, observations, outcome."
          />
        </>
      )}

      {type === "research" && (
        <>
          <Field
            id="source-citation"
            label="Citation"
            value={citation}
            onChange={setCitation}
            error={fieldErrors.citation?.[0]}
            maxLength={500}
            required
            placeholder="e.g. Smith et al. 2025, NEJM 392:1234"
          />
          <Field
            id="source-url"
            label="URL (optional)"
            value={url}
            onChange={setUrl}
            error={fieldErrors.url?.[0]}
            maxLength={2000}
            placeholder="https://…"
          />
          <Textarea
            id="source-summary"
            label="Summary"
            value={content}
            onChange={setContent}
            error={fieldErrors.content?.[0]}
            maxLength={10_000}
            required
            rows={8}
            placeholder="Key findings and how they relate to current practice."
          />
        </>
      )}

      {formError && (
        <p className="font-sans text-sm text-accent" role="alert">
          {formError}
        </p>
      )}

      {type !== "" && (
        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit source"}
          </button>
        </div>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  required,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-sans text-sm font-medium text-ink"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p className="mt-1.5 font-sans text-xs text-accent">{error}</p>
      )}
    </div>
  );
}

function Textarea({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  required,
  rows,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength: number;
  required?: boolean;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-sans text-sm font-medium text-ink"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        required={required}
        maxLength={maxLength}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base leading-relaxed text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p className="mt-1.5 font-sans text-xs text-accent">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/sources/new/SubmitSourceForm.test.tsx`
Expected: PASS — all 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/sources/new/
git commit -m "feat(sources): SubmitSourceForm scaffold with type-conditional fields"
```

---

## Task 9: SubmitSourceForm — submission (TDD)

**Files:**
- Modify: `src/app/sources/new/SubmitSourceForm.test.tsx`
- Modify: `src/app/sources/new/SubmitSourceForm.tsx`

- [ ] **Step 1: Add the failing submission tests**

Append to the existing `describe` block in `SubmitSourceForm.test.tsx`:

```tsx
  it("submits a debrief payload to /api/sources and redirects on 201", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ id: "11111111-2222-3333-4444-555555555555" }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "debrief" },
    });
    fireEvent.change(screen.getByLabelText(/^title/i), {
      target: { value: "Curbside arrest" },
    });
    fireEvent.change(screen.getByLabelText(/event date/i), {
      target: { value: "2026-04-15" },
    });
    fireEvent.change(screen.getByLabelText(/^content/i), {
      target: { value: "Bystander CPR before arrival." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit source/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/sources",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body).toEqual({
      sourceType: "debrief",
      title: "Curbside arrest",
      eventDate: "2026-04-15",
      content: "Bystander CPR before arrival.",
    });

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith(
        "/sources/11111111-2222-3333-4444-555555555555",
      );
    });
  });

  it("submits a research payload omitting hidden debrief fields", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "abcd" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "research" },
    });
    fireEvent.change(screen.getByLabelText(/^title/i), {
      target: { value: "Adrenaline timing" },
    });
    fireEvent.change(screen.getByLabelText(/citation/i), {
      target: { value: "Smith 2025" },
    });
    fireEvent.change(screen.getByLabelText(/summary/i), {
      target: { value: "Earlier dosing improves outcomes." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit source/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body).toEqual({
      sourceType: "research",
      title: "Adrenaline timing",
      citation: "Smith 2025",
      content: "Earlier dosing improves outcomes.",
    });
    expect(body).not.toHaveProperty("eventDate");
  });
```

Also update the imports at the top of `SubmitSourceForm.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/sources/new/SubmitSourceForm.test.tsx`
Expected: FAIL — `handleSubmit` is empty, fetch never called.

- [ ] **Step 3: Implement `handleSubmit` with type-aware payload**

Replace the `handleSubmit` function in `SubmitSourceForm.tsx` with:

```tsx
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (type === "") return;

    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const payload =
      type === "debrief"
        ? { sourceType: "debrief" as const, title, eventDate, content }
        : {
            sourceType: "research" as const,
            title,
            citation,
            ...(url.trim() ? { url: url.trim() } : {}),
            content,
          };

    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const created = await response.json();
        router.refresh();
        router.push(`/sources/${created.id}`);
        return;
      }

      const errBody = await response.json().catch(() => null);
      if (errBody?.issues?.fieldErrors) {
        setFieldErrors(errBody.issues.fieldErrors as FieldErrors);
      } else {
        setFormError(errBody?.error ?? "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/sources/new/SubmitSourceForm.test.tsx`
Expected: PASS — 6 tests passing (4 from Task 8 + 2 new).

- [ ] **Step 5: Commit**

```bash
git add src/app/sources/new/SubmitSourceForm.tsx src/app/sources/new/SubmitSourceForm.test.tsx
git commit -m "feat(sources): SubmitSourceForm posts type-aware payload + redirects"
```

---

## Task 10: SubmitSourceForm — error handling (TDD)

**Files:**
- Modify: `src/app/sources/new/SubmitSourceForm.test.tsx`

The error-handling code path was already added in Task 9 step 3 — these tests pin it down.

- [ ] **Step 1: Add the failing tests**

Append inside the same `describe` block:

```tsx
  it("renders per-field errors from a 400 response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Validation failed",
          issues: {
            formErrors: [],
            fieldErrors: { title: ["Title is required"] },
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "debrief" },
    });
    fireEvent.change(screen.getByLabelText(/event date/i), {
      target: { value: "2026-04-15" },
    });
    fireEvent.change(screen.getByLabelText(/^content/i), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit source/i }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("renders a top-level error from a 500 response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("server fell over", { status: 500 }),
    );

    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "debrief" },
    });
    fireEvent.change(screen.getByLabelText(/^title/i), {
      target: { value: "x" },
    });
    fireEvent.change(screen.getByLabelText(/event date/i), {
      target: { value: "2026-04-15" },
    });
    fireEvent.change(screen.getByLabelText(/^content/i), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit source/i }));

    expect(
      await screen.findByText(/something went wrong/i),
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/app/sources/new/SubmitSourceForm.test.tsx`
Expected: PASS — 8 tests passing (6 from before + 2 new). The error path was already implemented in Task 9.

- [ ] **Step 3: Commit**

```bash
git add src/app/sources/new/SubmitSourceForm.test.tsx
git commit -m "test(sources): pin down form error display contract"
```

---

## Task 11: New source page (server-component shell)

**Files:**
- Create: `src/app/sources/new/page.tsx`

- [ ] **Step 1: Create the page**

Path: `src/app/sources/new/page.tsx`

```tsx
import Link from "next/link";
import { SubmitSourceForm } from "./SubmitSourceForm";

export const metadata = {
  title: "Submit a source · Paramedic Learnings",
};

export default function NewSourcePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/sources"
        className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
      >
        ← All sources
      </Link>

      <p className="mt-12 font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
        Submission
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-ink leading-tight">
        Submit a source
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-muted">
        Capture a debrief from the field or share a research finding. Both
        feed the propose-and-approve loop.
      </p>

      <hr className="my-8 border-rule" />

      <SubmitSourceForm />
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Make sure `npm run dev` is running. Visit `http://localhost:3000/sources/new` in a browser. Expected: heading, intro, source-type picker visible. Picking debrief reveals event date and content; picking research reveals citation, url, summary.

- [ ] **Step 3: Commit**

```bash
git add src/app/sources/new/page.tsx
git commit -m "feat(sources): /sources/new page hosts SubmitSourceForm"
```

---

## Task 12: Source list page

**Files:**
- Create: `src/app/sources/page.tsx`

- [ ] **Step 1: Create the page**

Path: `src/app/sources/page.tsx`

```tsx
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { sources } from "@/db/schema";
import { SOURCE_TYPE_LABELS } from "./_constants";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function SourcesPage() {
  const rows = await db
    .select({
      id: sources.id,
      sourceType: sources.sourceType,
      title: sources.title,
      createdAt: sources.createdAt,
    })
    .from(sources)
    .orderBy(desc(sources.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="border-b border-rule pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
          Sources
        </p>
        <div className="mt-3 flex items-baseline justify-between gap-6">
          <h1 className="font-serif text-3xl text-ink">Submitted evidence</h1>
          <Link
            href="/sources/new"
            className="font-mono text-xs uppercase tracking-[0.18em] text-accent hover:underline"
          >
            + New source
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Field debriefs and research findings awaiting review. Each source
          may later trigger a change proposal against current guidance.
        </p>
      </header>

      <section className="mt-10 space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-ink">All sources</h2>
          <span className="font-mono text-xs text-ink-subtle">
            {rows.length} {rows.length === 1 ? "source" : "sources"}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-sm border border-dashed border-rule bg-surface px-6 py-12 text-center">
            <p className="font-serif text-lg italic text-ink-muted">
              No sources yet.
            </p>
            <Link
              href="/sources/new"
              className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.18em] text-accent hover:underline"
            >
              Submit the first one →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {rows.map((row) => (
              <li key={row.id} className="py-6">
                <Link
                  href={`/sources/${row.id}`}
                  className="group block transition-colors"
                >
                  <h3 className="font-serif text-xl text-ink group-hover:text-accent">
                    {row.title}
                  </h3>
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-subtle">
                    {SOURCE_TYPE_LABELS[row.sourceType]} · Submitted{" "}
                    {dateFormatter.format(row.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:3000/sources`. Expected: shows the rows you inserted via curl in Task 7, newest first, with type label and submission date. Clicking a row goes to `/sources/<id>` (which 404s for now — fixed in Task 13).

- [ ] **Step 3: Commit**

```bash
git add src/app/sources/page.tsx
git commit -m "feat(sources): /sources list page (newest first, createdAt always)"
```

---

## Task 13: Source detail page + not-found

**Files:**
- Create: `src/app/sources/[id]/page.tsx`
- Create: `src/app/sources/[id]/not-found.tsx`

- [ ] **Step 1: Create the not-found page**

Path: `src/app/sources/[id]/not-found.tsx`

```tsx
import Link from "next/link";

export default function SourceNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
        404
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink">Source not found</h1>
      <p className="mt-4 text-ink-muted">
        We couldn&apos;t find a source with that id.
      </p>
      <Link
        href="/sources"
        className="mt-8 inline-block font-mono text-xs uppercase tracking-[0.18em] text-accent hover:underline"
      >
        ← Back to all sources
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create the detail page**

Path: `src/app/sources/[id]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sources } from "@/db/schema";
import { SOURCE_TYPE_LABELS } from "../_constants";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const idSchema = z.string().uuid();

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();

  const [row] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, id))
    .limit(1);

  if (!row) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/sources"
        className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
      >
        ← All sources
      </Link>

      <p className="mt-12 font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
        Source
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-ink leading-tight">
        {row.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-accent px-3 py-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-background">
          {SOURCE_TYPE_LABELS[row.sourceType]}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          Submitted {dateFormatter.format(row.createdAt)}
        </span>
      </div>

      <hr className="my-8 border-rule" />

      {row.sourceType === "debrief" && row.eventDate && (
        <>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
            Event date
          </p>
          <p className="mt-2 font-serif text-lg text-ink">{row.eventDate}</p>
          <hr className="my-8 border-rule" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
            Content
          </p>
          <div className="mt-3 space-y-4 text-base leading-relaxed text-ink whitespace-pre-line">
            {row.content}
          </div>
        </>
      )}

      {row.sourceType === "research" && (
        <>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
            Citation
          </p>
          <p className="mt-2 font-serif text-lg text-ink">{row.citation}</p>
          {row.url && (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:underline"
            >
              Open source ↗
            </a>
          )}
          <hr className="my-8 border-rule" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
            Summary
          </p>
          <div className="mt-3 space-y-4 text-base leading-relaxed text-ink whitespace-pre-line">
            {row.content}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Visit `http://localhost:3000/sources` and click a row. Expected:
- For a debrief: title, "Debrief" badge, event date, content
- For a research: title, "Research" badge, citation, URL link if present, summary
- Visiting `/sources/00000000-0000-0000-0000-000000000000` shows the not-found page
- Visiting `/sources/garbage` also shows not-found (caught by UUID schema)

- [ ] **Step 4: Commit**

```bash
git add src/app/sources/[id]/
git commit -m "feat(sources): /sources/[id] detail with type-aware rendering"
```

---

## Task 14: Add Sources nav link

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Edit the nav block**

Replace the `<nav>` block in `src/app/layout.tsx` (lines 52–59) with:

```tsx
            <nav className="font-sans text-sm text-ink-muted">
              <Link
                href="/topics"
                className="border-b border-transparent pb-0.5 transition-colors hover:border-ink hover:text-ink"
              >
                Topics
              </Link>
              <Link
                href="/sources"
                className="ml-6 border-b border-transparent pb-0.5 transition-colors hover:border-ink hover:text-ink"
              >
                Sources
              </Link>
            </nav>
```

- [ ] **Step 2: Verify in browser**

Reload any page. Expected: header now shows "Topics" and "Sources" side-by-side; clicking Sources goes to `/sources`.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(layout): add Sources nav link alongside Topics"
```

---

## Task 15: End-to-end manual verification

No code changes — this task confirms the slice hangs together.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including the new sources tests (10 schema + 8 form = 18 new) plus all existing topic tests.

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Build verification**

Run: `npm run build`
Expected: build succeeds; `/sources`, `/sources/new`, `/sources/[id]` appear in the route table.

- [ ] **Step 4: User journey: submit a debrief**

In a browser at `http://localhost:3000`:
1. Click **Sources** in the header → land on `/sources`
2. Click **+ New source** → land on `/sources/new`
3. Choose **Debrief** → debrief fields appear
4. Fill title, event date, content; click **Submit source**
5. Land on `/sources/<new-id>` showing the submission with correct rendering

- [ ] **Step 5: User journey: submit a research finding**

1. Back to `/sources` (via "← All sources" or nav)
2. Verify the debrief from Step 4 is in the list, newest first
3. Click **+ New source**
4. Choose **Research** → research fields appear (no event date)
5. Fill title, citation, URL, summary; submit
6. Land on `/sources/<new-id>`; URL is rendered as a clickable link

- [ ] **Step 6: User journey: type-switch preserves shared fields**

1. New source → choose Debrief
2. Type "shared title" into Title
3. Switch to Research → title is still "shared title", but event-date field is gone, citation is empty

- [ ] **Step 7: User journey: validation error display**

1. New source → Debrief
2. Fill title only; leave event date and content blank
3. Submit → form posts; server returns 400; per-field errors render under the empty fields. (Form-level submission is gated by HTML5 `required`; if the browser blocks it, briefly remove `required` from the inputs to confirm the API path also surfaces errors — then restore.)

- [ ] **Step 8: Done**

If all journeys pass, the slice is complete. If anything fails, capture the failure mode and fix in a follow-up commit (one fix per commit).

---

## Self-review notes

- Spec coverage:
  - **Story 9 (debrief)** → Tasks 1, 2, 4, 7, 8, 9, 11, 13
  - **Story 10 (research)** → Tasks 5, 7, 8, 9, 11, 13
  - **Story 11 (classify by type)** → Tasks 1, 3, 8, 12, 13 (label visible in list + detail)
- Type consistency: `SourceType`, `createSourceSchema`, `SOURCE_TYPE_LABELS`, `SubmitSourceForm`, `FieldErrors` all match across tasks.
- All steps contain actual code or commands — no TBDs.
