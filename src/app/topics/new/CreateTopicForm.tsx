"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { topicArea, type TopicArea } from "@/db/schema";
import { AREA_LABELS } from "../_constants";

const AREAS = topicArea.enumValues.map((value) => ({
  value,
  label: AREA_LABELS[value],
}));

type FieldErrors = Partial<
  Record<"name" | "summary" | "area" | "owner" | "guidance" | "rationale", string[]>
>;

export function CreateTopicForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [area, setArea] = useState<TopicArea | "">("");
  const [owner, setOwner] = useState("");
  const [guidance, setGuidance] = useState("");
  const [rationale, setRationale] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          summary,
          area,
          owner,
          guidance,
          rationale: rationale.trim() || undefined,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        router.push(`/topics/${created.id}`);
        return;
      }

      const payload = await response.json().catch(() => null);
      if (payload?.issues?.fieldErrors) {
        setFieldErrors(payload.issues.fieldErrors as FieldErrors);
      } else {
        setFormError(payload?.error ?? "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field
        id="topic-name"
        label="Topic name"
        value={name}
        onChange={setName}
        error={fieldErrors.name?.[0]}
        maxLength={120}
        required
        placeholder="e.g. Adrenaline in cardiac arrest"
      />
      <Field
        id="topic-summary"
        label="Summary"
        value={summary}
        onChange={setSummary}
        error={fieldErrors.summary?.[0]}
        maxLength={280}
        required
        placeholder="One short sentence — the punch line"
      />

      <div>
        <label
          htmlFor="topic-area"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Area
        </label>
        <select
          id="topic-area"
          name="area"
          required
          value={area}
          onChange={(e) => setArea(e.target.value as TopicArea | "")}
          className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-invalid={Boolean(fieldErrors.area)}
        >
          <option value="" disabled>
            Choose an area…
          </option>
          {AREAS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        {fieldErrors.area?.[0] && (
          <p className="mt-1.5 font-sans text-xs text-accent">
            {fieldErrors.area[0]}
          </p>
        )}
      </div>

      <Field
        id="topic-owner"
        label="Owner"
        value={owner}
        onChange={setOwner}
        error={fieldErrors.owner?.[0]}
        maxLength={120}
        required
        placeholder="Your name or team"
      />

      <Textarea
        id="topic-guidance"
        label="Guidance"
        value={guidance}
        onChange={setGuidance}
        error={fieldErrors.guidance?.[0]}
        maxLength={4000}
        required
        rows={6}
        placeholder="The current recommendation, in detail."
      />

      <Textarea
        id="topic-rationale"
        label="Rationale (optional)"
        value={rationale}
        onChange={setRationale}
        error={fieldErrors.rationale?.[0]}
        maxLength={4000}
        rows={4}
        placeholder="Why this is the recommendation."
      />

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
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  required,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-sans text-sm font-medium text-ink"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p className="mt-1.5 font-sans text-xs text-accent">{error}</p>
      )}
    </div>
  );
}

function Textarea({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  required,
  rows,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength: number;
  required?: boolean;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-sans text-sm font-medium text-ink"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        required={required}
        maxLength={maxLength}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base leading-relaxed text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p className="mt-1.5 font-sans text-xs text-accent">{error}</p>
      )}
    </div>
  );
}
