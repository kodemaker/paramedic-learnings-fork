"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type FieldErrors = {
  name?: string[];
  description?: string[];
};

export function CreateTopicForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const response = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (response.ok) {
      setName("");
      setDescription("");
      router.refresh();
      setSubmitting(false);
      return;
    }

    const payload = await response.json().catch(() => null);
    if (payload?.issues?.fieldErrors) {
      setFieldErrors(payload.issues.fieldErrors as FieldErrors);
    } else {
      setFormError(payload?.error ?? "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label
          htmlFor="topic-name"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Topic name
        </label>
        <input
          id="topic-name"
          name="name"
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          placeholder="e.g. Adrenaline in cardiac arrest"
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "topic-name-error" : undefined}
        />
        {fieldErrors.name?.[0] && (
          <p
            id="topic-name-error"
            className="mt-1.5 font-sans text-xs text-accent"
          >
            {fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="topic-description"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Initial guidance
        </label>
        <textarea
          id="topic-description"
          name="description"
          required
          maxLength={2000}
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base leading-relaxed text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          placeholder="A short summary of the current recommendation. You can refine this later."
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={
            fieldErrors.description ? "topic-description-error" : undefined
          }
        />
        {fieldErrors.description?.[0] && (
          <p
            id="topic-description-error"
            className="mt-1.5 font-sans text-xs text-accent"
          >
            {fieldErrors.description[0]}
          </p>
        )}
      </div>

      {formError && (
        <p className="font-sans text-sm text-accent" role="alert">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create topic"}
        </button>
        <span className="font-mono text-xs text-ink-subtle">
          Saved instantly. You can edit later.
        </span>
      </div>
    </form>
  );
}
