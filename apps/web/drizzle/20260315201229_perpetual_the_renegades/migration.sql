DROP TABLE "element_group";--> statement-breakpoint
DROP TABLE "group";--> statement-breakpoint
ALTER TABLE "element" ALTER COLUMN "element_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "element_type";--> statement-breakpoint
CREATE TYPE "element_type" AS ENUM('actor', 'system', 'app', 'store', 'component');--> statement-breakpoint
ALTER TABLE "element" ALTER COLUMN "element_type" SET DATA TYPE "element_type" USING "element_type"::"element_type";