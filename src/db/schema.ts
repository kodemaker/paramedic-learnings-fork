import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const topicArea = pgEnum("topic_area", [
  "cardiac",
  "airway",
  "trauma",
  "medical",
  "drugs",
  "operational",
]);

export const sourceType = pgEnum("source_type", ["debrief", "research"]);

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  area: topicArea("area").notNull(),
  owner: text("owner").notNull(),
  // Pointer to current version. No FK constraint on this column to avoid
  // circular-reference issues during the create transaction; integrity is
  // maintained by the application.
  currentVersionId: uuid("current_version_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const topicVersions = pgTable("topic_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  summary: text("summary").notNull(),
  guidance: text("guidance").notNull(),
  rationale: text("rationale"),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nullable: a source exists before being linked to a topic version.
  // Linking happens in Stories 15/18.
  topicVersionId: uuid("topic_version_id").references(() => topicVersions.id, {
    onDelete: "cascade",
  }),
  sourceType: sourceType("source_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  // Required at the Zod layer when sourceType === "debrief".
  eventDate: date("event_date"),
  // Required at the Zod layer when sourceType === "research".
  citation: text("citation"),
  url: text("url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type TopicVersion = typeof topicVersions.$inferSelect;
export type NewTopicVersion = typeof topicVersions.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type TopicArea = (typeof topicArea.enumValues)[number];
export type SourceType = (typeof sourceType.enumValues)[number];
