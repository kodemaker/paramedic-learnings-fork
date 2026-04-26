import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sources, topics, topicVersions } from "@/db/schema";

const idSchema = z.string().uuid();

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [row] = await db
    .select({
      id: topics.id,
      name: topics.name,
      area: topics.area,
      owner: topics.owner,
      updatedAt: topics.updatedAt,
      versionId: topicVersions.id,
      versionNumber: topicVersions.versionNumber,
      summary: topicVersions.summary,
      guidance: topicVersions.guidance,
      rationale: topicVersions.rationale,
      publishedAt: topicVersions.publishedAt,
    })
    .from(topics)
    .innerJoin(topicVersions, eq(topicVersions.id, topics.currentVersionId))
    .where(eq(topics.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sourceRows = await db
    .select()
    .from(sources)
    .where(eq(sources.topicVersionId, row.versionId));

  return NextResponse.json({
    id: row.id,
    name: row.name,
    area: row.area,
    owner: row.owner,
    updatedAt: row.updatedAt,
    currentVersion: {
      id: row.versionId,
      versionNumber: row.versionNumber,
      summary: row.summary,
      guidance: row.guidance,
      rationale: row.rationale,
      publishedAt: row.publishedAt,
      sources: sourceRows.map((s) => ({
        id: s.id,
        title: s.title,
        citation: s.citation,
        url: s.url,
      })),
    },
  });
}
