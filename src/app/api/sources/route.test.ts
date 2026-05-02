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
});
