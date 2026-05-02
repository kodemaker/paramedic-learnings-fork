import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sources } from "@/db/schema";

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

export async function GET() {
  const rows = await db
    .select({
      id: sources.id,
      sourceType: sources.sourceType,
      title: sources.title,
      createdAt: sources.createdAt,
    })
    .from(sources)
    .orderBy(desc(sources.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const [created] =
    data.sourceType === "debrief"
      ? await db
          .insert(sources)
          .values({
            sourceType: "debrief",
            title: data.title,
            eventDate: data.eventDate,
            content: data.content,
          })
          .returning()
      : await db
          .insert(sources)
          .values({
            sourceType: "research",
            title: data.title,
            citation: data.citation,
            url: data.url,
            content: data.content,
          })
          .returning();

  return NextResponse.json(created, { status: 201 });
}
