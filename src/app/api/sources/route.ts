import { z } from "zod";

const debriefInputSchema = z.object({
  sourceType: z.literal("debrief"),
  title: z.string().trim().min(1, "Title is required").max(200),
  eventDate: z.string().date(),
  content: z.string().trim().min(1, "Content is required").max(10_000),
});

const researchInputSchema = z.object({
  sourceType: z.literal("research"),
  title: z.string().trim().min(1, "Title is required").max(200),
  citation: z.string().trim().min(1, "Citation is required").max(500),
  url: z
    .string()
    .url()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  content: z.string().trim().min(1, "Summary is required").max(10_000),
});

export const createSourceSchema = z.discriminatedUnion("sourceType", [
  debriefInputSchema,
  researchInputSchema,
]);
