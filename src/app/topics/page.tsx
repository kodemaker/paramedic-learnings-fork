import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { topicArea, topics, topicVersions } from "@/db/schema";
import { AREA_LABELS } from "./_constants";

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
                  className="group block transition-colors"
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
