import { desc } from "drizzle-orm";
import { db } from "@/db";
import { topics } from "@/db/schema";
import { CreateTopicForm } from "./CreateTopicForm";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function TopicsPage() {
  const allTopics = await db
    .select()
    .from(topics)
    .orderBy(desc(topics.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="border-b border-rule pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
          Topics
        </p>
        <h1 className="mt-3 text-3xl text-ink">Operational guidance</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Each topic captures the current recommendation for one subject — what
          to do, and why. Add a new topic to give the team a place to refine
          guidance over time.
        </p>
      </header>

      <section className="mt-10 grid gap-12 lg:grid-cols-[1fr_minmax(0,_22rem)]">
        <div>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-serif text-xl text-ink">All topics</h2>
            <span className="font-mono text-xs text-ink-subtle">
              {allTopics.length} {allTopics.length === 1 ? "topic" : "topics"}
            </span>
          </div>

          {allTopics.length === 0 ? (
            <div className="rounded-sm border border-dashed border-rule bg-surface px-6 py-12 text-center">
              <p className="font-serif text-lg italic text-ink-muted">
                No topics yet.
              </p>
              <p className="mt-2 font-sans text-sm text-ink-subtle">
                Create the first one using the form on the right.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-rule border-y border-rule">
              {allTopics.map((topic) => (
                <li key={topic.id} className="py-6">
                  <article>
                    <h3 className="font-serif text-xl text-ink">
                      {topic.name}
                    </h3>
                    <p className="mt-2 text-base text-ink-muted">
                      {topic.description}
                    </p>
                    <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-subtle">
                      Created {dateFormatter.format(topic.createdAt)}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:border-l lg:border-rule lg:pl-12">
          <h2 className="font-serif text-xl text-ink">New topic</h2>
          <p className="mt-2 mb-6 font-sans text-sm text-ink-muted">
            A short, recognisable name and a first pass at the guidance is
            enough to start.
          </p>
          <CreateTopicForm />
        </aside>
      </section>
    </div>
  );
}
