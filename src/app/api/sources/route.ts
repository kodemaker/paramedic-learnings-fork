import { z } from "zod";

const debriefInputSchema = z.object({
  sourceType: z.literal("debrief"),
  title: z.string().trim().min(1, "Title is required").max(200),
  eventDate: z.string().date(),
  content: z.string().trim().min(1, "Content is required").max(10_000),
});

export const createSourceSchema = debriefInputSchema;
