CREATE TYPE "public"."topic_area" AS ENUM('cardiac', 'airway', 'trauma', 'medical', 'drugs', 'operational');
--> statement-breakpoint
ALTER TABLE "topics" DROP COLUMN "description";
--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "area" "topic_area" NOT NULL;
--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "owner" text NOT NULL;
--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "current_version_id" uuid;
--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
CREATE TABLE "topic_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"summary" text NOT NULL,
	"guidance" text NOT NULL,
	"rationale" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "topic_versions" ADD CONSTRAINT "topic_versions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_version_id" uuid NOT NULL,
	"title" text NOT NULL,
	"citation" text NOT NULL,
	"url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_topic_version_id_topic_versions_id_fk" FOREIGN KEY ("topic_version_id") REFERENCES "public"."topic_versions"("id") ON DELETE cascade ON UPDATE no action;
