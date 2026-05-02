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
