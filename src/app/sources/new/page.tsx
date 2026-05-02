import Link from "next/link";
import { SubmitSourceForm } from "./SubmitSourceForm";

export const metadata = {
  title: "Submit a source · Paramedic Learnings",
};

export default function NewSourcePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/sources"
        className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
      >
        ← All sources
      </Link>

      <p className="mt-12 font-mono text-xs uppercase tracking-[0.22em] text-ink-subtle">
        Submission
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-ink leading-tight">
        Submit a source
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-muted">
        Capture a debrief from the field or share a research finding. Both
        feed the propose-and-approve loop.
      </p>

      <hr className="my-8 border-rule" />

      <SubmitSourceForm />
    </div>
  );
}
