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
