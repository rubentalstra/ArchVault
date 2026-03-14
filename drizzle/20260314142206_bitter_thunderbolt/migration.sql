CREATE TYPE "diagram_type" AS ENUM('context', 'container', 'component');--> statement-breakpoint
CREATE TYPE "anchor_point" AS ENUM('auto', 'top', 'bottom', 'left', 'right');--> statement-breakpoint
CREATE TYPE "line_style" AS ENUM('solid', 'dashed', 'dotted');--> statement-breakpoint
CREATE TYPE "path_type" AS ENUM('straight', 'curved', 'orthogonal');--> statement-breakpoint
CREATE TABLE "diagram_revision" (
	"id" text PRIMARY KEY,
	"diagram_id" text NOT NULL,
	"revision_number" integer NOT NULL,
	"snapshot_json" jsonb NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagram" (
	"id" text PRIMARY KEY,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"diagram_type" "diagram_type" NOT NULL,
	"scope_element_id" text,
	"grid_size" integer DEFAULT 20 NOT NULL,
	"snap_to_grid" boolean DEFAULT true NOT NULL,
	"current_revision_id" text,
	"source_block_installation_id" text,
	"created_by" text,
	"updated_by" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagram_element" (
	"id" text PRIMARY KEY,
	"diagram_id" text NOT NULL,
	"element_id" text NOT NULL,
	"x" real DEFAULT 0 NOT NULL,
	"y" real DEFAULT 0 NOT NULL,
	"width" real DEFAULT 200 NOT NULL,
	"height" real DEFAULT 120 NOT NULL,
	"z_index" integer DEFAULT 0 NOT NULL,
	"style_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "diagram_relationship" (
	"id" text PRIMARY KEY,
	"diagram_id" text NOT NULL,
	"relationship_id" text NOT NULL,
	"path_type" "path_type" DEFAULT 'curved'::"path_type" NOT NULL,
	"line_style" "line_style" DEFAULT 'solid'::"line_style" NOT NULL,
	"source_anchor" "anchor_point" DEFAULT 'auto'::"anchor_point" NOT NULL,
	"target_anchor" "anchor_point" DEFAULT 'auto'::"anchor_point" NOT NULL,
	"label_position" real DEFAULT 0.5 NOT NULL,
	"control_points_json" jsonb,
	"style_json" jsonb
);
--> statement-breakpoint
CREATE INDEX "diagram_revision_diagram_id_idx" ON "diagram_revision" ("diagram_id");--> statement-breakpoint
CREATE INDEX "diagram_workspace_id_idx" ON "diagram" ("workspace_id");--> statement-breakpoint
CREATE INDEX "diagram_scope_element_id_idx" ON "diagram" ("scope_element_id");--> statement-breakpoint
CREATE UNIQUE INDEX "diagram_element_diagram_element_uidx" ON "diagram_element" ("diagram_id","element_id");--> statement-breakpoint
CREATE INDEX "diagram_element_diagram_id_idx" ON "diagram_element" ("diagram_id");--> statement-breakpoint
CREATE INDEX "diagram_element_element_id_idx" ON "diagram_element" ("element_id");--> statement-breakpoint
CREATE UNIQUE INDEX "diagram_rel_diagram_relationship_uidx" ON "diagram_relationship" ("diagram_id","relationship_id");--> statement-breakpoint
CREATE INDEX "diagram_rel_diagram_id_idx" ON "diagram_relationship" ("diagram_id");--> statement-breakpoint
CREATE INDEX "diagram_rel_relationship_id_idx" ON "diagram_relationship" ("relationship_id");--> statement-breakpoint
ALTER TABLE "diagram_revision" ADD CONSTRAINT "diagram_revision_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagram" ADD CONSTRAINT "diagram_workspace_id_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagram" ADD CONSTRAINT "diagram_scope_element_id_element_id_fkey" FOREIGN KEY ("scope_element_id") REFERENCES "element"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagram" ADD CONSTRAINT "diagram_current_revision_id_diagram_revision_id_fkey" FOREIGN KEY ("current_revision_id") REFERENCES "diagram_revision"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagram" ADD CONSTRAINT "diagram_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagram" ADD CONSTRAINT "diagram_updated_by_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagram_element" ADD CONSTRAINT "diagram_element_diagram_id_diagram_id_fkey" FOREIGN KEY ("diagram_id") REFERENCES "diagram"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagram_element" ADD CONSTRAINT "diagram_element_element_id_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "element"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagram_relationship" ADD CONSTRAINT "diagram_relationship_diagram_id_diagram_id_fkey" FOREIGN KEY ("diagram_id") REFERENCES "diagram"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagram_relationship" ADD CONSTRAINT "diagram_relationship_relationship_id_relationship_id_fkey" FOREIGN KEY ("relationship_id") REFERENCES "relationship"("id") ON DELETE CASCADE;