import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
        Operational reference
      </p>
      <h1 className="mt-4 text-3xl text-ink">
        Trusted guidance for ambulance personnel.
      </h1>
      <p className="mt-6 text-lg text-ink-muted">
        Capture clinical and operational topics, attach the evidence behind
        them, and keep recommendations current as new field learning and
        research arrives.
      </p>

      <div className="mt-10 flex items-center gap-5">
        <Link
          href="/topics"
          className="inline-flex items-center rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-background transition-colors hover:bg-accent-hover"
        >
          Browse topics
        </Link>
        <Link
          href="/topics"
          className="font-sans text-sm font-medium text-ink underline-offset-4 hover:underline"
        >
          Create the first topic →
        </Link>
      </div>

      <hr className="mt-16 border-t border-rule" />

      <p className="mt-6 font-mono text-xs text-ink-subtle">
        Begin with Story 1 — Create a topic manually.
      </p>
    </div>
  );
}
