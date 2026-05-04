CREATE TYPE "public"."source_type" AS ENUM('debrief', 'research');--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "topic_version_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "citation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "source_type" "source_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "event_date" date;
