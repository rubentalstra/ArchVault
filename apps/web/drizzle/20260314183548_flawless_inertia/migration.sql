CREATE TYPE "connection_direction" AS ENUM('outgoing', 'incoming', 'bidirectional', 'none');--> statement-breakpoint
CREATE TABLE "connection" (
	"id" text PRIMARY KEY,
	"workspace_id" text NOT NULL,
	"source_element_id" text NOT NULL,
	"target_element_id" text NOT NULL,
	"direction" "connection_direction" DEFAULT 'outgoing'::"connection_direction" NOT NULL,
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
CREATE TABLE "connection_tag" (
	"connection_id" text,
	"tag_id" text,
	CONSTRAINT "connection_tag_pkey" PRIMARY KEY("connection_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "diagram_connection" (
	"id" text PRIMARY KEY,
	"diagram_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"path_type" "path_type" DEFAULT 'curved'::"path_type" NOT NULL,
	"line_style" "line_style" DEFAULT 'solid'::"line_style" NOT NULL,
	"source_anchor" "anchor_point" DEFAULT 'auto'::"anchor_point" NOT NULL,
	"target_anchor" "anchor_point" DEFAULT 'auto'::"anchor_point" NOT NULL,
	"label_position" real DEFAULT 0.5 NOT NULL,
	"control_points_json" jsonb,
	"style_json" jsonb
);
--> statement-breakpoint
ALTER TABLE "relationship_tag" DROP CONSTRAINT "relationship_tag_relationship_id_relationship_id_fkey";--> statement-breakpoint
ALTER TABLE "diagram_relationship" DROP CONSTRAINT "diagram_relationship_relationship_id_relationship_id_fkey";--> statement-breakpoint
DROP TABLE "relationship";--> statement-breakpoint
DROP TABLE "relationship_tag";--> statement-breakpoint
DROP TABLE "diagram_relationship";--> statement-breakpoint
ALTER TABLE "diagram" ALTER COLUMN "diagram_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "diagram_type";--> statement-breakpoint
CREATE TYPE "diagram_type" AS ENUM('context', 'app', 'component');--> statement-breakpoint
ALTER TABLE "diagram" ALTER COLUMN "diagram_type" SET DATA TYPE "diagram_type" USING "diagram_type"::"diagram_type";--> statement-breakpoint
CREATE INDEX "connection_workspace_id_idx" ON "connection" ("workspace_id");--> statement-breakpoint
CREATE INDEX "connection_source_element_id_idx" ON "connection" ("source_element_id");--> statement-breakpoint
CREATE INDEX "connection_target_element_id_idx" ON "connection" ("target_element_id");--> statement-breakpoint
CREATE INDEX "connection_tag_tag_id_idx" ON "connection_tag" ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "diagram_conn_diagram_connection_uidx" ON "diagram_connection" ("diagram_id","connection_id");--> statement-breakpoint
CREATE INDEX "diagram_conn_diagram_id_idx" ON "diagram_connection" ("diagram_id");--> statement-breakpoint
CREATE INDEX "diagram_conn_connection_id_idx" ON "diagram_connection" ("connection_id");--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_workspace_id_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_source_element_id_element_id_fkey" FOREIGN KEY ("source_element_id") REFERENCES "element"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_target_element_id_element_id_fkey" FOREIGN KEY ("target_element_id") REFERENCES "element"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_updated_by_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "connection_tag" ADD CONSTRAINT "connection_tag_connection_id_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connection"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connection_tag" ADD CONSTRAINT "connection_tag_tag_id_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagram_connection" ADD CONSTRAINT "diagram_connection_diagram_id_diagram_id_fkey" FOREIGN KEY ("diagram_id") REFERENCES "diagram"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagram_connection" ADD CONSTRAINT "diagram_connection_connection_id_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connection"("id") ON DELETE CASCADE;--> statement-breakpoint
DROP TYPE "relationship_direction";