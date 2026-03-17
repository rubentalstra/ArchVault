ALTER TABLE "diagram" ALTER COLUMN "diagram_type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "diagram" SET "diagram_type" = 'system_context' WHERE "diagram_type" = 'context';--> statement-breakpoint
UPDATE "diagram" SET "diagram_type" = 'container' WHERE "diagram_type" = 'app';--> statement-breakpoint
DROP TYPE "diagram_type";--> statement-breakpoint
CREATE TYPE "diagram_type" AS ENUM('system_context', 'container', 'component');--> statement-breakpoint
ALTER TABLE "diagram" ALTER COLUMN "diagram_type" SET DATA TYPE "diagram_type" USING "diagram_type"::"diagram_type";
