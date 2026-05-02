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
