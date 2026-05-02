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
});
