"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { sourceType, type SourceType } from "@/db/schema";
import { SOURCE_TYPE_LABELS } from "../_constants";

const SOURCE_TYPES = sourceType.enumValues.map((value) => ({
  value,
  label: SOURCE_TYPE_LABELS[value],
}));

type FieldErrors = Partial<
  Record<
    | "sourceType"
    | "title"
    | "eventDate"
    | "content"
    | "citation"
    | "url",
    string[]
  >
>;

export function SubmitSourceForm() {
  const router = useRouter();
  const [type, setType] = useState<SourceType | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [citation, setCitation] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Implementation comes in Task 9.
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label
          htmlFor="source-type"
          className="mb-1.5 block font-sans text-sm font-medium text-ink"
        >
          Source type
        </label>
        <select
          id="source-type"
          name="sourceType"
          required
          value={type}
          onChange={(e) => setType(e.target.value as SourceType | "")}
          className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-invalid={Boolean(fieldErrors.sourceType)}
        >
          <option value="" disabled>
            Choose a source type…
          </option>
          {SOURCE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {type !== "" && (
        <Field
          id="source-title"
          label="Title"
          value={title}
          onChange={setTitle}
          error={fieldErrors.title?.[0]}
          maxLength={200}
          required
          placeholder="Short, descriptive headline"
        />
      )}

      {type === "debrief" && (
        <>
          <div>
            <label
              htmlFor="source-event-date"
              className="mb-1.5 block font-sans text-sm font-medium text-ink"
            >
              Event date
            </label>
            <input
              id="source-event-date"
              name="eventDate"
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="block w-full rounded-sm border border-rule bg-surface px-3 py-2 font-sans text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              aria-invalid={Boolean(fieldErrors.eventDate)}
            />
            {fieldErrors.eventDate?.[0] && (
              <p className="mt-1.5 font-sans text-xs text-accent">
                {fieldErrors.eventDate[0]}
              </p>
            )}
          </div>
          <Textarea
            id="source-content"
            label="Content"
            value={content}
            onChange={setContent}
            error={fieldErrors.content?.[0]}
            maxLength={10_000}
            required
            rows={8}
            placeholder="What happened in the field — sequence of events, observations, outcome."
          />
        </>
      )}

      {type === "research" && (
        <>
          <Field
            id="source-citation"
            label="Citation"
            value={citation}
            onChange={setCitation}
            error={fieldErrors.citation?.[0]}
            maxLength={500}
            required
            placeholder="e.g. Smith et al. 2025, NEJM 392:1234"
          />
          <Field
            id="source-url"
            label="URL (optional)"
            value={url}
            onChange={setUrl}
            error={fieldErrors.url?.[0]}
            maxLength={2000}
            placeholder="https://…"
          />
          <Textarea
            id="source-summary"
            label="Summary"
            value={content}
            onChange={setContent}
            error={fieldErrors.content?.[0]}
            maxLength={10_000}
            required
            rows={8}
            placeholder="Key findings and how they relate to current practice."
          />
        </>
      )}

      {formError && (
        <p className="font-sans text-sm text-accent" role="alert">
          {formError}
        </p>
      )}

      {type !== "" && (
        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit source"}
          </button>
        </div>
      )}
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
