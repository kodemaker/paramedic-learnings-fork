import { describe, it, expect } from "vitest";
import { createSourceSchema } from "./route";

describe("createSourceSchema", () => {
  const validDebrief = {
    sourceType: "debrief",
    title: "Cardiac arrest in the field",
    eventDate: "2026-04-15",
    content: "Patient went into VF en route. CPR initiated within 60s.",
  };

  it("accepts a valid debrief payload", () => {
    expect(createSourceSchema.safeParse(validDebrief).success).toBe(true);
  });

  const validResearch = {
    sourceType: "research",
    title: "Adrenaline timing in OHCA",
    citation: "Smith et al. 2025, NEJM",
    url: "https://www.nejm.org/example",
    content: "Meta-analysis of 12 trials suggesting earlier dosing improves ROSC.",
  };

  it("accepts a valid research payload", () => {
    expect(createSourceSchema.safeParse(validResearch).success).toBe(true);
  });

  it("accepts a research payload without optional url", () => {
    const { url, ...withoutUrl } = validResearch;
    void url;
    expect(createSourceSchema.safeParse(withoutUrl).success).toBe(true);
  });

  it("rejects a debrief without eventDate", () => {
    const { eventDate, ...withoutDate } = validDebrief;
    void eventDate;
    expect(createSourceSchema.safeParse(withoutDate).success).toBe(false);
  });

  it("rejects a debrief with malformed eventDate", () => {
    const result = createSourceSchema.safeParse({
      ...validDebrief,
      eventDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a research payload without citation", () => {
    const { citation, ...withoutCitation } = validResearch;
    void citation;
    expect(createSourceSchema.safeParse(withoutCitation).success).toBe(false);
  });

  it("rejects an unknown sourceType", () => {
    const result = createSourceSchema.safeParse({
      ...validDebrief,
      sourceType: "incident",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = createSourceSchema.safeParse({ ...validDebrief, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty content", () => {
    const result = createSourceSchema.safeParse({
      ...validDebrief,
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a research payload with an invalid url", () => {
    const result = createSourceSchema.safeParse({
      ...validResearch,
      url: "not a url",
    });
    expect(result.success).toBe(false);
  });
});
