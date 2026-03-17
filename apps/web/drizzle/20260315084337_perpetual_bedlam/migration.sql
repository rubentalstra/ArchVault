CREATE TYPE "display_mode" AS ENUM('normal', 'sub_flow');--> statement-breakpoint
ALTER TABLE "diagram" DROP CONSTRAINT "diagram_scope_element_id_element_id_fkey";--> statement-breakpoint
DROP INDEX "diagram_scope_element_id_idx";--> statement-breakpoint
ALTER TABLE "diagram_element" ADD COLUMN "display_mode" "display_mode" DEFAULT 'normal'::"display_mode" NOT NULL;--> statement-breakpoint
ALTER TABLE "diagram" DROP COLUMN "scope_element_id";