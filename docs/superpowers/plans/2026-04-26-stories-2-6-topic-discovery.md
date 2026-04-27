# Stories 2–6 — Topic Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Stories 2–6 (list, search, filter, detail, rationale) on top of Story 1, on a versioned schema.

**Architecture:** `topics` (identity) + `topic_versions` (content) + `sources` (per-version citations). Reads via Drizzle in server components, search/filter via URL params, transactional write through `POST /api/topics`. UUID URLs for the detail page; the create form moves to `/topics/new`.

**Tech Stack:** Next.js 16 App Router, React 19, Drizzle ORM 0.45 (postgres-js), Postgres 16, Zod 4, Tailwind v4. Tests: Vitest + jsdom + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-04-26-stories-2-6-design.md`

---

## Pre-flight

Before Task 0, confirm the dev DB is running and Story 1's migration has been applied. If a participant pulls this plan into a fresh clone:

```bash
docker compose up -d
npx drizzle-kit migrate
npm run dev   # verify http://localhost:3000/topics renders
# Stop dev server before continuing.
```

---

## Task 0: Test setup (Vitest + jsdom + Testing Library)

The course exercise's Step 2 (`/test-driven-development`) requires a working test runner. This task installs it, configures it, and verifies one trivial test passes — so subsequent tasks can write red tests with confidence.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/sanity.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D vitest@^2 jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6 @vitejs/plugin-react@^4
```

Expected: clean install, no peer-dependency errors.

- [ ] **Step 2: Add vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

- [ ] **Step 3: Add test setup file**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add scripts to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a failing sanity test**

Create `src/test/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest setup", () => {
  it("can run a test", () => {
    expect(1 + 1).toBe(3); // intentionally wrong
  });
});
```

- [ ] **Step 6: Run the test, watch it fail**

```bash
npm test
```

Expected: 1 test failing — `expected 2 to be 3`. Confirms the runner works.

- [ ] **Step 7: Fix the assertion, re-run, watch it pass**

Edit `src/test/sanity.test.ts`:

```ts
expect(1 + 1).toBe(2);
```

```bash
npm test
```

Expected: 1 test passing.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test
git commit -m "Add Vitest + Testing Library, jsdom environment"
```

---

## Task 1: Schema, migration, seed

Adds `topic_area` enum, `topic_versions`, `sources`, alters `topics`. Seeds four richly-fleshed example topics so Stories 5/6 demo cleanly.

**Files:**
- Modify: `src/db/schema.ts`
- Create: `drizzle/0001_<auto-named>.sql` (drizzle-kit generates)
- Create: `src/db/seed.ts`
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: Replace `src/db/schema.ts` with the versioned schema**

```ts
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const topicArea = pgEnum("topic_area", [
  "cardiac",
  "airway",
  "trauma",
  "medical",
  "drugs",
  "operational",
]);

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  area: topicArea("area").notNull(),
  owner: text("owner").notNull(),
  // Pointer to current version. No FK constraint on this column to avoid
  // circular-reference issues during the create transaction; integrity is
  // maintained by the application.
  currentVersionId: uuid("current_version_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const topicVersions = pgTable("topic_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  summary: text("summary").notNull(),
  guidance: text("guidance").notNull(),
  rationale: text("rationale"),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicVersionId: uuid("topic_version_id")
    .notNull()
    .references(() => topicVersions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  citation: text("citation").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type TopicVersion = typeof topicVersions.$inferSelect;
export type NewTopicVersion = typeof topicVersions.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type TopicArea = (typeof topicArea.enumValues)[number];
```

Note the new `integer` import — add `integer` to the import list:

```ts
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
```

- [ ] **Step 2: Generate the migration**

```bash
npx drizzle-kit generate
```

Expected: a new file appears in `drizzle/`, e.g. `0001_<random>.sql`. Open it and confirm:
- Creates `topic_area` enum
- Creates `topic_versions` table
- Creates `sources` table
- Alters `topics`: drops `description`, adds `area`, `owner`, `current_version_id`, `updated_at`

If the migration tries to add `area NOT NULL` without a default and there are existing rows, it will fail at apply time. We'll handle that in Step 3 by truncating before migrating, since this is a course exercise with no production data.

- [ ] **Step 3: Wipe the dev DB and re-migrate cleanly**

```bash
docker compose down -v   # deletes the volume, fresh DB
docker compose up -d
npx drizzle-kit migrate  # applies 0000 (Story 1) and 0001 (this task)
```

Expected: both migrations apply cleanly. Verify with:

```bash
docker compose exec db psql -U postgres -d paramedic_learnings -c "\dt"
```

Expected: tables `topics`, `topic_versions`, `sources` listed (plus the drizzle migrations table).

- [ ] **Step 4: Install tsx for running the seed script**

```bash
npm install -D tsx
```

- [ ] **Step 5: Add seed script to package.json**

In `package.json`, add to `"scripts"`:

```json
"seed": "tsx --env-file=.env.local src/db/seed.ts"
```

- [ ] **Step 6: Write the seed script**

Create `src/db/seed.ts`:

```ts
import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import { sources, topics, topicVersions } from "./schema";

type SeedSource = {
  title: string;
  citation: string;
  url?: string;
};

type SeedTopic = {
  name: string;
  area:
    | "cardiac"
    | "airway"
    | "trauma"
    | "medical"
    | "drugs"
    | "operational";
  owner: string;
  summary: string;
  guidance: string;
  rationale: string | null;
  sources: SeedSource[];
};

const seedTopics: SeedTopic[] = [
  {
    name: "Adrenaline in cardiac arrest",
    area: "cardiac",
    owner: "Dr. Smith",
    summary:
      "1 mg IV every 3–5 minutes during ACLS. Avoid before defibrillation in shockable rhythms.",
    guidance:
      "Administer adrenaline 1 mg IV/IO every 3–5 minutes during ACLS for non-shockable rhythms (asystole, PEA). For shockable rhythms (VF/pVT), prioritize defibrillation; defer adrenaline until after the second shock. Use a 10 mL flush after each dose. Continue CPR throughout.",
    rationale:
      "Adrenaline's vasoconstrictive effect raises coronary perfusion pressure during compressions, improving the chance of ROSC. Recent randomised data show improved survival to hospital but mixed neurological outcomes — current guidance therefore preserves the dose but emphasises early defibrillation in shockable rhythms.",
    sources: [
      {
        title: "AHA 2020 ACLS Guidelines",
        citation:
          "Panchal AR et al. Circulation 142(16) S366–S468. 2020.",
      },
      {
        title: "PARAMEDIC2 — Adrenaline in OHCA",
        citation:
          "Perkins GD et al. NEJM 379:711–721. 2018. RCT, n=8014.",
      },
    ],
  },
  {
    name: "Hypothermic patient — passive rewarming",
    area: "trauma",
    owner: "Dr. Lindberg",
    summary:
      "Do not actively warm a pulseless patient with no spontaneous circulation; passive rewarming and continued resuscitation only.",
    guidance:
      "For severely hypothermic (T < 30 °C) patients in cardiac arrest, defer active rewarming until ROSC. Continue CPR, remove wet clothing, insulate. Limit defibrillation to one attempt below 30 °C; resume after rewarming. Transport to a centre with ECMO capability if available.",
    rationale:
      "Active rewarming of a pulseless hypothermic patient causes core-temperature afterdrop and arrhythmia. Cold-protected myocardium tolerates extended low-flow states; long down-times have produced neurologically intact survival. The rule of thumb: 'no one is dead until warm and dead.'",
    sources: [
      {
        title: "ERC Guidelines — Cardiac arrest in special circumstances",
        citation:
          "Lott C et al. Resuscitation 161:152–219. 2021.",
      },
    ],
  },
  {
    name: "Supraglottic airway as first-line in OHCA",
    area: "airway",
    owner: "Dr. Smith",
    summary:
      "Prefer supraglottic airway (i-gel, LMA) over endotracheal intubation in field cardiac arrest unless contraindicated.",
    guidance:
      "Insert a supraglottic airway as the first advanced airway in OHCA. Reserve endotracheal intubation for cases where ventilation cannot be achieved through a supraglottic device, in a crew with verified intubation competency, and only when interruptions to compressions can be limited to <10 seconds.",
    rationale:
      "Pre-hospital intubation interrupts CPR and has a meaningful first-pass failure rate in field conditions. RCT evidence (AIRWAYS-2) shows supraglottic devices are non-inferior to ETI for OHCA and produce shorter compression-pause times.",
    sources: [
      {
        title: "AIRWAYS-2 — Supraglottic vs ETI in OHCA",
        citation:
          "Benger JR et al. JAMA 320(8):779–791. 2018. RCT, n=9296.",
      },
    ],
  },
  {
    name: "Patient handover — the AT-MIST framework",
    area: "operational",
    owner: "L. Hansen",
    summary:
      "Use AT-MIST (Age, Time, Mechanism, Injuries, Signs, Treatment) for every trauma handover. 30 seconds, hands off, room silent.",
    guidance:
      "On arrival at the receiving facility, request 30 seconds of silence and deliver AT-MIST: patient's age and sex, time of incident, mechanism, identified injuries, current vital signs, and treatment given. The receiving team listens without interruption. Follow-up questions come after.",
    rationale: null,
    sources: [],
  },
];

async function seed() {
  await db.execute(
    sql`TRUNCATE TABLE sources, topic_versions, topics RESTART IDENTITY CASCADE`,
  );

  for (const t of seedTopics) {
    const [topic] = await db
      .insert(topics)
      .values({
        name: t.name,
        area: t.area,
        owner: t.owner,
      })
      .returning();

    const [version] = await db
      .insert(topicVersions)
      .values({
        topicId: topic.id,
        versionNumber: 1,
        summary: t.summary,
        guidance: t.guidance,
        rationale: t.rationale,
      })
      .returning();

    await db
      .update(topics)
      .set({ currentVersionId: version.id, updatedAt: new Date() })
      .where(eq(topics.id, topic.id));

    if (t.sources.length > 0) {
      await db.insert(sources).values(
        t.sources.map((s) => ({
          topicVersionId: version.id,
          title: s.title,
          citation: s.citation,
          url: s.url ?? null,
        })),
      );
    }
  }
}

seed()
  .then(() => {
    console.log(`Seeded ${seedTopics.length} topics.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
```

- [ ] **Step 7: Run the seed**

```bash
npm run seed
```

Expected: `Seeded 4 topics.`

Verify with:

```bash
docker compose exec db psql -U postgres -d paramedic_learnings -c "SELECT name, area FROM topics;"
docker compose exec db psql -U postgres -d paramedic_learnings -c "SELECT count(*) FROM topic_versions;"
docker compose exec db psql -U postgres -d paramedic_learnings -c "SELECT count(*) FROM sources;"
```

Expected: 4 topics, 4 versions, 4 sources (3 topics have sources × 1–2 each = 4 total).

- [ ] **Step 8: Add seed instructions to README**

Append to `README.md` (under Setup, or at the end if no Setup section exists):

```markdown
## Database

After cloning or pulling schema changes:

\`\`\`bash
docker compose up -d
npx drizzle-kit migrate
npm run seed
\`\`\`

The seed wipes existing topic data and inserts four example topics — useful for demoing Stories 2–6.
```

(Use real backticks; the escape above is for this code block.)

- [ ] **Step 9: Confirm Story 1 smoke still works**

```bash
npm run dev
```

Open http://localhost:3000/topics. Expected: page renders without crashing. Note: the existing list will look broken (the old `description` column is gone, the page doesn't read `summary` yet) — that's fine; we'll fix it in Tasks 4 and 5. Stop the dev server.

- [ ] **Step 10: Commit**

```bash
git add src/db/schema.ts src/db/seed.ts drizzle/ package.json package-lock.json README.md
git commit -m "Add versioned schema, seed script, and Postgres area enum

- topic_versions and sources tables
- topic_area Postgres enum (cardiac | airway | trauma | medical | drugs | operational)
- topics gains area, owner, current_version_id, updated_at; description column removed
- seed script inserts 4 example topics with rationale and citations
- README adds the post-pull migrate+seed steps"
```

---

## Task 2: API routes

Three endpoints: transactional `POST /api/topics`, filtered `GET /api/topics`, by-id `GET /api/topics/[id]`. Zod schemas at the boundary.

**Files:**
- Modify: `src/app/api/topics/route.ts`
- Create: `src/app/api/topics/[id]/route.ts`
- Create: `src/app/api/topics/route.test.ts` (Zod schema test)

- [ ] **Step 1: Write a failing test for the create-topic Zod schema**

The shape we expect: `{ name, summary, area, owner, guidance, rationale? }`. The schema must reject missing required fields and accept a valid payload.

Create `src/app/api/topics/route.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createTopicSchema } from "./route";

describe("createTopicSchema", () => {
  const valid = {
    name: "Test topic",
    summary: "A short summary.",
    area: "cardiac",
    owner: "Dr. Test",
    guidance: "Do the thing.",
  };

  it("accepts a valid payload (no rationale)", () => {
    expect(createTopicSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a valid payload with rationale", () => {
    const result = createTopicSchema.safeParse({
      ...valid,
      rationale: "Because the evidence says so.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid area", () => {
    const result = createTopicSchema.safeParse({ ...valid, area: "wizardry" });
    expect(result.success).toBe(false);
  });

  it("rejects missing summary", () => {
    const { summary: _, ...withoutSummary } = valid;
    const result = createTopicSchema.safeParse(withoutSummary);
    expect(result.success).toBe(false);
  });

  it("rejects empty owner", () => {
    const result = createTopicSchema.safeParse({ ...valid, owner: "" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test, watch it fail**

```bash
npm test
```

Expected: import error — `createTopicSchema` not exported from `./route`.

- [ ] **Step 3: Rewrite `src/app/api/topics/route.ts`**

Replace the whole file:

```ts
import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { topicArea, topics, topicVersions } from "@/db/schema";

const TOPIC_AREAS = topicArea.enumValues;

export const createTopicSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  summary: z.string().trim().min(1, "Summary is required").max(280),
  area: z.enum(TOPIC_AREAS),
  owner: z.string().trim().min(1, "Owner is required").max(120),
  guidance: z.string().trim().min(1, "Guidance is required").max(4000),
  rationale: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  area: z.enum(TOPIC_AREAS).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    area: url.searchParams.get("area") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q, area } = parsed.data;

  const whereClauses = [];
  if (area) whereClauses.push(eq(topics.area, area));
  if (q) {
    const pattern = `%${q}%`;
    whereClauses.push(
      or(
        ilike(topics.name, pattern),
        ilike(topicVersions.summary, pattern),
        ilike(topicVersions.guidance, pattern),
      )!,
    );
  }

  const rows = await db
    .select({
      id: topics.id,
      name: topics.name,
      area: topics.area,
      owner: topics.owner,
      updatedAt: topics.updatedAt,
      versionNumber: topicVersions.versionNumber,
      summary: topicVersions.summary,
      publishedAt: topicVersions.publishedAt,
    })
    .from(topics)
    .innerJoin(topicVersions, eq(topicVersions.id, topics.currentVersionId))
    .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
    .orderBy(desc(topics.updatedAt));

  const result = rows.map((r) => ({
    id: r.id,
    name: r.name,
    area: r.area,
    owner: r.owner,
    updatedAt: r.updatedAt,
    currentVersion: {
      versionNumber: r.versionNumber,
      summary: r.summary,
      publishedAt: r.publishedAt,
    },
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, summary, area, owner, guidance, rationale } = parsed.data;

  const created = await db.transaction(async (tx) => {
    const [topic] = await tx
      .insert(topics)
      .values({ name, area, owner })
      .returning();

    const [version] = await tx
      .insert(topicVersions)
      .values({
        topicId: topic.id,
        versionNumber: 1,
        summary,
        guidance,
        rationale,
      })
      .returning();

    await tx
      .update(topics)
      .set({ currentVersionId: version.id, updatedAt: new Date() })
      .where(eq(topics.id, topic.id));

    return { topic, version };
  });

  return NextResponse.json(
    {
      id: created.topic.id,
      name: created.topic.name,
      area: created.topic.area,
      owner: created.topic.owner,
      updatedAt: created.topic.updatedAt,
      currentVersion: {
        id: created.version.id,
        versionNumber: created.version.versionNumber,
        summary: created.version.summary,
        guidance: created.version.guidance,
        rationale: created.version.rationale,
        publishedAt: created.version.publishedAt,
      },
    },
    { status: 201 },
  );
}
```

- [ ] **Step 4: Run the schema test, watch it pass**

```bash
npm test
```

Expected: 5 schema tests pass (sanity test still passing too).

- [ ] **Step 5: Create the by-id route**

Create `src/app/api/topics/[id]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sources, topics, topicVersions } from "@/db/schema";

const idSchema = z.string().uuid();

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [row] = await db
    .select({
      id: topics.id,
      name: topics.name,
      area: topics.area,
      owner: topics.owner,
      updatedAt: topics.updatedAt,
      versionId: topicVersions.id,
      versionNumber: topicVersions.versionNumber,
      summary: topicVersions.summary,
      guidance: topicVersions.guidance,
      rationale: topicVersions.rationale,
      publishedAt: topicVersions.publishedAt,
    })
    .from(topics)
    .innerJoin(topicVersions, eq(topicVersions.id, topics.currentVersionId))
    .where(eq(topics.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sourceRows = await db
    .select()
    .from(sources)
    .where(eq(sources.topicVersionId, row.versionId));

  return NextResponse.json({
    id: row.id,
    name: row.name,
    area: row.area,
    owner: row.owner,
    updatedAt: row.updatedAt,
    currentVersion: {
      id: row.versionId,
      versionNumber: row.versionNumber,
      summary: row.summary,
      guidance: row.guidance,
      rationale: row.rationale,
      publishedAt: row.publishedAt,
      sources: sourceRows.map((s) => ({
        id: s.id,
        title: s.title,
        citation: s.citation,
        url: s.url,
      })),
    },
  });
}
```

- [ ] **Step 6: Manual smoke check the routes**

```bash
npm run dev
```

In another terminal:

```bash
# List, no filter
curl -s http://localhost:3000/api/topics | jq 'length'
# Expected: 4

# List, filter by area
curl -s 'http://localhost:3000/api/topics?area=cardiac' | jq 'length'
# Expected: 1

# Search
curl -s 'http://localhost:3000/api/topics?q=hypothermic' | jq '.[0].name'
# Expected: "Hypothermic patient — passive rewarming"

# By id (replace UUID with one from the list response)
TOPIC_ID=$(curl -s http://localhost:3000/api/topics | jq -r '.[0].id')
curl -s "http://localhost:3000/api/topics/$TOPIC_ID" | jq '.currentVersion.sources | length'
# Expected: a number ≥ 0

# Bad area
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/api/topics?area=wizardry'
# Expected: 400

# Bad id
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/api/topics/not-a-uuid'
# Expected: 404
```

If any expectation fails, fix it before committing. Stop the dev server.

- [ ] **Step 7: Run all tests**

```bash
npm test
```

Expected: all schema tests pass; sanity test passes.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/topics
git commit -m "Add filtered list, by-id, and transactional create routes

POST /api/topics now creates topic + v1 in one Drizzle transaction.
GET /api/topics?q=&area= filters by case-insensitive substring across
name/summary/guidance and by topic_area enum.
GET /api/topics/[id] returns the topic with current version + sources.
Zod schemas validated at the boundary; tested with Vitest."
```

---

## Task 3: Detail page `/topics/[id]`

Reads via Drizzle directly (Story 1 pattern). Renders the four-section journal layout from the spec.

**Files:**
- Create: `src/app/topics/[id]/page.tsx`
- Create: `src/app/topics/[id]/not-found.tsx`

- [ ] **Step 1: Create the not-found page**

Create `src/app/topics/[id]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function TopicNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
        404
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink">
        That topic does not exist.
      </h1>
      <p className="mt-4 text-base text-ink-muted">
        It may have been removed, or the link may be wrong.
      </p>
      <Link
        href="/topics"
        className="mt-8 inline-block font-mono text-xs uppercase tracking-[0.18em] text-accent hover:underline"
      >
        ← All topics
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create the detail page**

Create `src/app/topics/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sources, topics, topicVersions } from "@/db/schema";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const idSchema = z.string().uuid();

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();

  const [row] = await db
    .select({
      id: topics.id,
      name: topics.name,
      area: topics.area,
      owner: topics.owner,
      updatedAt: topics.updatedAt,
      versionId: topicVersions.id,
      versionNumber: topicVersions.versionNumber,
      summary: topicVersions.summary,
      guidance: topicVersions.guidance,
      rationale: topicVersions.rationale,
    })
    .from(topics)
    .innerJoin(topicVersions, eq(topicVersions.id, topics.currentVersionId))
    .where(eq(topics.id, id))
    .limit(1);

  if (!row) notFound();

  const sourceRows = await db
    .select()
    .from(sources)
    .where(eq(sources.topicVersionId, row.versionId));

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/topics"
        className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
      >
        ← All topics
      </Link>

      <p className="mt-12 font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
        Topic
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-ink leading-tight">
        {row.name}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-accent px-3 py-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-background">
          {row.area}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          {row.owner} · Last updated {dateFormatter.format(row.updatedAt)} · v
          {row.versionNumber}
        </span>
      </div>

      <hr className="my-8 border-rule" />

      <p className="font-serif text-xl italic leading-relaxed text-ink">
        {row.summary}
      </p>

      <hr className="my-8 border-rule" />

      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
        Guidance
      </p>
      <div className="mt-3 space-y-4 text-base leading-relaxed text-ink whitespace-pre-line">
        {row.guidance}
      </div>

      <hr className="my-8 border-rule" />

      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
        Rationale
      </p>
      {row.rationale ? (
        <div className="mt-3 space-y-4 text-base leading-relaxed text-ink whitespace-pre-line">
          {row.rationale}
        </div>
      ) : (
        <p className="mt-3 font-serif italic text-ink-muted">
          Not yet recorded — comes via the propose-and-approve flow.
        </p>
      )}

      <hr className="my-8 border-rule" />

      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
        Based on
      </p>
      {sourceRows.length === 0 ? (
        <p className="mt-3 font-serif italic text-ink-muted">
          No sources cited yet.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {sourceRows.map((s) => (
            <li key={s.id} className="py-4">
              <p className="font-serif text-base text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.citation}</p>
              {s.url && (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:underline"
                >
                  Open ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Manual smoke**

```bash
npm run dev
```

Open the dev server. Get a topic id from the API:

```bash
curl -s http://localhost:3000/api/topics | jq -r '.[0].id'
```

Visit `http://localhost:3000/topics/<that-id>`. Expected:
- All four sections render
- Area chip is oxblood
- "v1" badge appears in the meta line
- Last topic ("Patient handover" — has no rationale and no sources) shows the empty-state copy

Visit `http://localhost:3000/topics/00000000-0000-0000-0000-000000000000`. Expected: 404 page.

Visit `http://localhost:3000/topics/garbage`. Expected: 404 page.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/app/topics/[id]
git commit -m "Add topic detail page with rationale and sources

/topics/[id] is a server component that joins topics to current version
and sources, rendering the journal-article layout from the design spec.
Empty rationale and empty sources each show their own muted copy. UUID
validation falls through to a custom 404 page."
```

---

## Task 4: List page rewrite

Replaces the existing `/topics` with the search + chip layout. The create form is removed from this page (Task 5 reintroduces it at `/topics/new`).

**Files:**
- Modify: `src/app/topics/page.tsx`
- Delete: `src/app/topics/CreateTopicForm.tsx`

- [ ] **Step 1: Replace `src/app/topics/page.tsx`**

```tsx
import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { topicArea, topics, topicVersions } from "@/db/schema";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const TOPIC_AREAS = topicArea.enumValues;
type TopicArea = (typeof TOPIC_AREAS)[number];

const searchParamsSchema = z.object({
  q: z.string().trim().min(1).optional(),
  area: z.enum(TOPIC_AREAS).optional(),
});

const AREA_LABELS: Record<TopicArea, string> = {
  cardiac: "Cardiac",
  airway: "Airway",
  trauma: "Trauma",
  medical: "Medical",
  drugs: "Drugs",
  operational: "Operational",
};

function buildHref(area?: TopicArea, q?: string) {
  const params = new URLSearchParams();
  if (area) params.set("area", area);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/topics?${qs}` : "/topics";
}

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const parsed = searchParamsSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : undefined,
    area: typeof raw.area === "string" ? raw.area : undefined,
  });

  const { q, area } = parsed.success ? parsed.data : { q: undefined, area: undefined };

  const whereClauses = [];
  if (area) whereClauses.push(eq(topics.area, area));
  if (q) {
    const pattern = `%${q}%`;
    whereClauses.push(
      or(
        ilike(topics.name, pattern),
        ilike(topicVersions.summary, pattern),
        ilike(topicVersions.guidance, pattern),
      )!,
    );
  }

  const rows = await db
    .select({
      id: topics.id,
      name: topics.name,
      area: topics.area,
      updatedAt: topics.updatedAt,
      summary: topicVersions.summary,
    })
    .from(topics)
    .innerJoin(topicVersions, eq(topicVersions.id, topics.currentVersionId))
    .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
    .orderBy(desc(topics.updatedAt));

  const filterIsActive = Boolean(q || area);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="border-b border-rule pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
          Topics
        </p>
        <div className="mt-3 flex items-baseline justify-between gap-6">
          <h1 className="font-serif text-3xl text-ink">Operational guidance</h1>
          <Link
            href="/topics/new"
            className="font-mono text-xs uppercase tracking-[0.18em] text-accent hover:underline"
          >
            + New topic
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Each topic captures the current recommendation for one subject — what
          to do, and why.
        </p>
      </header>

      <section className="mt-10 space-y-6">
        <form method="get" action="/topics" className="space-y-4">
          {area && <input type="hidden" name="area" value={area} />}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search topics"
            className="block w-full rounded-sm border border-rule bg-surface px-4 py-2.5 font-sans text-base text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </form>

        <nav className="-mt-2 flex flex-wrap gap-2" aria-label="Filter by area">
          <Link
            href={buildHref(undefined, q)}
            className={`rounded-full px-3 py-1 font-sans text-sm transition-colors ${
              !area
                ? "bg-accent text-background"
                : "border border-rule bg-surface text-ink-muted hover:text-ink"
            }`}
          >
            All
          </Link>
          {TOPIC_AREAS.map((a) => (
            <Link
              key={a}
              href={buildHref(a, q)}
              className={`rounded-full px-3 py-1 font-sans text-sm transition-colors ${
                area === a
                  ? "bg-accent text-background"
                  : "border border-rule bg-surface text-ink-muted hover:text-ink"
              }`}
            >
              {AREA_LABELS[a]}
            </Link>
          ))}
        </nav>

        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-ink">
            {filterIsActive ? "Matching topics" : "All topics"}
          </h2>
          <span className="font-mono text-xs text-ink-subtle">
            {rows.length} {rows.length === 1 ? "topic" : "topics"}
          </span>
        </div>

        {rows.length === 0 ? (
          filterIsActive ? (
            <div className="rounded-sm border border-dashed border-rule bg-surface px-6 py-12 text-center">
              <p className="font-serif text-lg italic text-ink-muted">
                No topics match{q ? ` "${q}"` : ""}
                {area ? ` in ${AREA_LABELS[area]}` : ""}.
              </p>
              <Link
                href="/topics"
                className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.18em] text-accent hover:underline"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-rule bg-surface px-6 py-12 text-center">
              <p className="font-serif text-lg italic text-ink-muted">
                No topics yet.
              </p>
              <Link
                href="/topics/new"
                className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.18em] text-accent hover:underline"
              >
                Create the first one →
              </Link>
            </div>
          )
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {rows.map((row) => (
              <li key={row.id} className="py-6">
                <Link
                  href={`/topics/${row.id}`}
                  className="block transition-colors hover:text-accent"
                >
                  <h3 className="font-serif text-xl text-ink group-hover:text-accent">
                    {row.name}
                  </h3>
                  <p className="mt-2 text-base text-ink-muted">{row.summary}</p>
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-subtle">
                    {AREA_LABELS[row.area]} · Updated{" "}
                    {dateFormatter.format(row.updatedAt)}
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

- [ ] **Step 2: Delete the old form file**

```bash
git rm src/app/topics/CreateTopicForm.tsx
```

(Task 5 reintroduces this file under `src/app/topics/new/CreateTopicForm.tsx` with expanded fields.)

- [ ] **Step 3: Manual smoke**

```bash
npm run dev
```

Visit `http://localhost:3000/topics`. Expected:
- Header: eyebrow "Topics", h1 "Operational guidance", "+ New topic" link top right
- Search input below header (full width)
- Chip nav: "All" filled with oxblood, then six area chips outlined
- Four topics listed (the seed data), each clickable to its detail page

Visit `/topics?q=hypothermic`. Expected: one topic.

Visit `/topics?area=cardiac`. Expected: one topic, "Cardiac" chip is oxblood.

Visit `/topics?q=nonexistent`. Expected: "No topics match \"nonexistent\"" + "Clear filters" link.

Click the search box, type "adrenaline", press Enter. Expected: URL becomes `/topics?q=adrenaline`, list filters to one row.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/app/topics/page.tsx
git commit -m "Rewrite /topics: search + area chips + extended row

The list page is now a server component that reads q and area from
URL params, joins topics to the current version, and renders search
results. The active area chip is filled with oxblood (Story 4's
'show active filters clearly' criterion).

Empty state distinguishes between zero topics and zero matches.
The create form is removed from this page; Task 5 reintroduces it
at /topics/new."
```

---

## Task 5: Create page `/topics/new`

Moves and expands the create form. Adds five new fields beyond `name`. Component test for the form.

**Files:**
- Create: `src/app/topics/new/page.tsx`
- Create: `src/app/topics/new/CreateTopicForm.tsx`
- Create: `src/app/topics/new/CreateTopicForm.test.tsx`

- [ ] **Step 1: Write a failing test for `CreateTopicForm`**

Create `src/app/topics/new/CreateTopicForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateTopicForm } from "./CreateTopicForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const fillRequired = () => {
  fireEvent.change(screen.getByLabelText(/topic name/i), {
    target: { value: "Test topic" },
  });
  fireEvent.change(screen.getByLabelText(/summary/i), {
    target: { value: "Short summary" },
  });
  fireEvent.change(screen.getByLabelText(/area/i), {
    target: { value: "cardiac" },
  });
  fireEvent.change(screen.getByLabelText(/owner/i), {
    target: { value: "Dr. Test" },
  });
  fireEvent.change(screen.getByLabelText(/guidance/i), {
    target: { value: "Do the thing." },
  });
};

describe("CreateTopicForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all six fields", () => {
    render(<CreateTopicForm />);
    expect(screen.getByLabelText(/topic name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guidance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rationale/i)).toBeInTheDocument();
  });

  it("submits to /api/topics and redirects on 201", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ id: "f0e0b0a0-0000-0000-0000-000000000000" }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<CreateTopicForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: /create topic/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/topics",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("shows per-field errors from a 400 response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Validation failed",
          issues: { fieldErrors: { name: ["Name is required"] } },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<CreateTopicForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: /create topic/i }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test, watch it fail**

```bash
npm test
```

Expected: import error — `CreateTopicForm` not found.

- [ ] **Step 3: Create the form component**

Create `src/app/topics/new/CreateTopicForm.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const AREAS = [
  { value: "cardiac", label: "Cardiac" },
  { value: "airway", label: "Airway" },
  { value: "trauma", label: "Trauma" },
  { value: "medical", label: "Medical" },
  { value: "drugs", label: "Drugs" },
  { value: "operational", label: "Operational" },
] as const;

type FieldErrors = Partial<
  Record<"name" | "summary" | "area" | "owner" | "guidance" | "rationale", string[]>
>;

export function CreateTopicForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [area, setArea] = useState<string>("");
  const [owner, setOwner] = useState("");
  const [guidance, setGuidance] = useState("");
  const [rationale, setRationale] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const response = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        summary,
        area,
        owner,
        guidance,
        rationale: rationale.trim() || undefined,
      }),
    });

    if (response.ok) {
      const created = await response.json();
      router.push(`/topics/${created.id}`);
      return;
    }

    const payload = await response.json().catch(() => null);
    if (payload?.issues?.fieldErrors) {
      setFieldErrors(payload.issues.fieldErrors as FieldErrors);
    } else {
      setFormError(payload?.error ?? "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field
        id="topic-name"
        label="Topic name"
        value={name}
        onChange={setName}
        error={fieldErrors.name?.[0]}
        maxLength={120}
        required
        placeholder="e.g. Adrenaline in cardiac arrest"
      />
      <Field
        id="topic-summary"
        label="Summary"
        value={summary}
        onChange={setSummary}
        error={fieldErrors.summary?.[0]}
        maxLength={280}
        required
        placeholder="One short sentence — the punch line"
      />

      <div>
        <label
          htmlFor="topic-area"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Area
        </label>
        <select
          id="topic-area"
          name="area"
          required
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-invalid={Boolean(fieldErrors.area)}
        >
          <option value="" disabled>
            Choose an area…
          </option>
          {AREAS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        {fieldErrors.area?.[0] && (
          <p className="mt-1.5 font-sans text-xs text-accent">
            {fieldErrors.area[0]}
          </p>
        )}
      </div>

      <Field
        id="topic-owner"
        label="Owner"
        value={owner}
        onChange={setOwner}
        error={fieldErrors.owner?.[0]}
        maxLength={120}
        required
        placeholder="Your name or team"
      />

      <Textarea
        id="topic-guidance"
        label="Guidance"
        value={guidance}
        onChange={setGuidance}
        error={fieldErrors.guidance?.[0]}
        maxLength={4000}
        required
        rows={6}
        placeholder="The current recommendation, in detail."
      />

      <Textarea
        id="topic-rationale"
        label="Rationale (optional)"
        value={rationale}
        onChange={setRationale}
        error={fieldErrors.rationale?.[0]}
        maxLength={4000}
        rows={4}
        placeholder="Why this is the recommendation."
      />

      {formError && (
        <p className="font-sans text-sm text-accent" role="alert">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create topic"}
        </button>
      </div>
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

- [ ] **Step 4: Run the test, watch it pass**

```bash
npm test
```

Expected: 3 component tests pass, plus all the schema and sanity tests from earlier.

- [ ] **Step 5: Create the page wrapper**

Create `src/app/topics/new/page.tsx`:

```tsx
import Link from "next/link";
import { CreateTopicForm } from "./CreateTopicForm";

export default function NewTopicPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/topics"
        className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
      >
        ← All topics
      </Link>

      <header className="mt-12 border-b border-rule pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
          New topic
        </p>
        <h1 className="mt-3 font-serif text-3xl text-ink">
          Capture a new piece of guidance
        </h1>
        <p className="mt-4 text-base text-ink-muted">
          Give the team a place to refine this subject over time. Sources can
          be added later through the propose-and-approve flow.
        </p>
      </header>

      <section className="mt-10">
        <CreateTopicForm />
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Manual smoke**

```bash
npm run dev
```

Visit `http://localhost:3000/topics/new`. Expected:
- Form with six fields: name, summary, area dropdown, owner, guidance, rationale
- Area dropdown shows the six areas from the enum
- Submit button "Create topic"

Try submitting empty: HTML5 validation should block submission (the `required` attributes).

Fill all required fields with valid values, leave rationale blank, submit. Expected:
- Browser navigates to `/topics/<new-id>`
- Detail page shows the new topic with rationale empty-state copy

Visit `/topics`, expected: the new topic appears at the top (sorted by `updated_at` desc).

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/app/topics/new
git commit -m "Add /topics/new — expanded create form, moved off list page

Six fields: name, summary, area (enum dropdown), owner, guidance,
rationale (optional). On 201 the form pushes the user to the new
topic's detail page; on 400 it surfaces per-field errors from the
API's Zod feedback. Component tests for render, submit, and error
display."
```

---

## Task 6: Verify — lint, build, full smoke

`layout.tsx` already has a "Topics" link in the header (the project's existing nav was set up by Story 1's theme work). No header edits needed; this task is verification only.

- [ ] **Step 1: Lint**

```bash
npm run lint
```

Expected: no errors. Fix any.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean build. Fix any TypeScript errors.

- [ ] **Step 3: Full browser smoke — story by story**

```bash
npm run dev
```

Walk this checklist in the browser:

- **Story 2 (list)** — visit `/topics`. See four seeded topics. Each shows name, summary, area, last-updated.
- **Story 3 (search)** — type "hypothermic" in the search box, press Enter. URL becomes `/topics?q=hypothermic`. One topic shown. Type "asdfgh", press Enter. Empty-state with "Clear filters" link.
- **Story 4 (filter)** — click "Cardiac" chip. URL becomes `/topics?area=cardiac`. Cardiac chip is oxblood. One topic shown. Click "All" — chip resets, all topics return.
- **Story 4 + 3 combined** — click "Cardiac", then type "adrenaline" in search, submit. URL has both params. One topic. Click "Clear filters" — URL becomes `/topics`.
- **Story 5 (detail)** — click into the Adrenaline topic. See title, area chip, owner, last updated, v1, italic summary, Guidance section, Rationale section, Based-on with two sources. Click "Open ↗" on a source — opens in new tab (or just renders the link if URL is null).
- **Story 6 (rationale)** — same page, Rationale + Based on visible. Visit the Patient handover topic — see "Not yet recorded" rationale empty-state and "No sources cited yet" empty-state.
- **Story 1 still works** — click "+ New topic". Fill the form. Submit. Land on the new detail page with v1.

Stop the dev server.

- [ ] **Step 4: Run the whole test suite once more**

```bash
npm test
```

Expected: all tests pass.

This task produces no new commits — verification only.

---

## Self-review checklist (run before opening the PR)

- [ ] All seven tasks above are checked off.
- [ ] `npm run lint` clean.
- [ ] `npm run build` clean.
- [ ] `npm test` all passing.
- [ ] Browser smoke walked through every story's acceptance criteria from `docs/user-stories.md` lines 19–66.
- [ ] No TODO/FIXME/console.log left in the changed files.
- [ ] The detail-page meta line shows `v1` (forward-compat for Stories 19–21).
- [ ] The chip nav preserves the `q` param when an area is clicked, and vice versa (verify by clicking a chip with an active search).

---

## Out of scope (intentional — see spec)

- User table + login (deferred as future Story 22)
- Source input UX on the create form (belongs to Stories 12–18)
- Pagination, slug URLs, multi-area filter
- Editing topics outside the propose-approve flow
