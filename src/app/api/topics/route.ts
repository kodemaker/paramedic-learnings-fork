import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { topicArea, topics, topicVersions } from "@/db/schema";

const TOPIC_AREAS = topicArea.enumValues;

export const createTopicSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  summary: z.string().trim().min(1, "Summary is required").max(280),
  area: z.enum(TOPIC_AREAS),
  owner: z.string().trim().min(1, "Owner is required").max(120),
  guidance: z.string().trim().min(1, "Guidance is required").max(4000),
  rationale: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  area: z.enum(TOPIC_AREAS).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    area: url.searchParams.get("area") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q, area } = parsed.data;

  const whereClauses = [];
  if (area) whereClauses.push(eq(topics.area, area));
  if (q) {
    const pattern = `%${q}%`;
    whereClauses.push(
      or(
        ilike(topics.name, pattern),
        ilike(topicVersions.summary, pattern),
        ilike(topicVersions.guidance, pattern),
      )!,
    );
  }

  const rows = await db
    .select({
      id: topics.id,
      name: topics.name,
      area: topics.area,
      owner: topics.owner,
      updatedAt: topics.updatedAt,
      versionNumber: topicVersions.versionNumber,
      summary: topicVersions.summary,
      publishedAt: topicVersions.publishedAt,
    })
    .from(topics)
    .innerJoin(topicVersions, eq(topicVersions.id, topics.currentVersionId))
    .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
    .orderBy(desc(topics.updatedAt));

  const result = rows.map((r) => ({
    id: r.id,
    name: r.name,
    area: r.area,
    owner: r.owner,
    updatedAt: r.updatedAt,
    currentVersion: {
      versionNumber: r.versionNumber,
      summary: r.summary,
      publishedAt: r.publishedAt,
    },
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, summary, area, owner, guidance, rationale } = parsed.data;

  const created = await db.transaction(async (tx) => {
    const [topic] = await tx
      .insert(topics)
      .values({ name, area, owner })
      .returning();

    const [version] = await tx
      .insert(topicVersions)
      .values({
        topicId: topic.id,
        versionNumber: 1,
        summary,
        guidance,
        rationale,
      })
      .returning();

    await tx
      .update(topics)
      .set({ currentVersionId: version.id, updatedAt: new Date() })
      .where(eq(topics.id, topic.id));

    return { topic, version };
  });

  return NextResponse.json(
    {
      id: created.topic.id,
      name: created.topic.name,
      area: created.topic.area,
      owner: created.topic.owner,
      updatedAt: created.topic.updatedAt,
      currentVersion: {
        id: created.version.id,
        versionNumber: created.version.versionNumber,
        summary: created.version.summary,
        guidance: created.version.guidance,
        rationale: created.version.rationale,
        publishedAt: created.version.publishedAt,
      },
    },
    { status: 201 },
  );
}
