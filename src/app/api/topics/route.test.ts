import { describe, it, expect } from "vitest";
import { createTopicSchema } from "./route";

describe("createTopicSchema", () => {
  const valid = {
    name: "Test topic",
    summary: "A short summary.",
    area: "cardiac",
    owner: "Dr. Test",
    guidance: "Do the thing.",
  };

  it("accepts a valid payload (no rationale)", () => {
    expect(createTopicSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a valid payload with rationale", () => {
    const result = createTopicSchema.safeParse({
      ...valid,
      rationale: "Because the evidence says so.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid area", () => {
    const result = createTopicSchema.safeParse({ ...valid, area: "wizardry" });
    expect(result.success).toBe(false);
  });

  it("rejects missing summary", () => {
    const { summary: _, ...withoutSummary } = valid;
    const result = createTopicSchema.safeParse(withoutSummary);
    expect(result.success).toBe(false);
  });

  it("rejects empty owner", () => {
    const result = createTopicSchema.safeParse({ ...valid, owner: "" });
    expect(result.success).toBe(false);
  });
});
