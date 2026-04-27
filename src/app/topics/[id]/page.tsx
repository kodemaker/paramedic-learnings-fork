import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sources, topics, topicVersions } from "@/db/schema";
import { SectionLabel } from "../_components/SectionLabel";

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

      <SectionLabel>Guidance</SectionLabel>
      <div className="mt-3 space-y-4 text-base leading-relaxed text-ink whitespace-pre-line">
        {row.guidance}
      </div>

      <hr className="my-8 border-rule" />

      <SectionLabel>Rationale</SectionLabel>
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

      <SectionLabel>Based on</SectionLabel>
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
