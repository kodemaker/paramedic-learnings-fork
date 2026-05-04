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
