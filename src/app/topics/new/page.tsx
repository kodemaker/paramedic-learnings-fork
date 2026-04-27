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
