CREATE TYPE "relationship_direction" AS ENUM('outgoing', 'incoming', 'bidirectional', 'none');--> statement-breakpoint
CREATE TABLE "relationship" (
	"id" text PRIMARY KEY,
	"workspace_id" text NOT NULL,
	"source_element_id" text NOT NULL,
	"target_element_id" text NOT NULL,
	"direction" "relationship_direction" DEFAULT 'outgoing'::"relationship_direction" NOT NULL,
	"description" text,
	"technology" text,
	"source_block_installation_id" text,
	"created_by" text,
	"updated_by" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "relationship_workspace_id_idx" ON "relationship" ("workspace_id");--> statement-breakpoint
CREATE INDEX "relationship_source_element_id_idx" ON "relationship" ("source_element_id");--> statement-breakpoint
CREATE INDEX "relationship_target_element_id_idx" ON "relationship" ("target_element_id");--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_workspace_id_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_source_element_id_element_id_fkey" FOREIGN KEY ("source_element_id") REFERENCES "element"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_target_element_id_element_id_fkey" FOREIGN KEY ("target_element_id") REFERENCES "element"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_updated_by_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL;