CREATE TABLE "connection_technology" (
	"connection_id" text,
	"technology_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "connection_technology_pkey" PRIMARY KEY("connection_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "diagram_group" (
	"id" text PRIMARY KEY,
	"diagram_id" text NOT NULL,
	"group_id" text NOT NULL,
	"x" real NOT NULL,
	"y" real NOT NULL,
	"width" real NOT NULL,
	"height" real NOT NULL,
	"z_index" integer DEFAULT -1 NOT NULL,
	"style_json" jsonb,
	CONSTRAINT "diagram_group_diagram_group_uidx" UNIQUE("diagram_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" text PRIMARY KEY,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"color" varchar(7) NOT NULL,
	"parent_group_id" text,
	"description" text,
	"created_by" text,
	"updated_by" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_membership" (
	"element_id" text,
	"group_id" text,
	CONSTRAINT "group_membership_pkey" PRIMARY KEY("element_id","group_id")
);
--> statement-breakpoint
ALTER TABLE "element" ADD COLUMN "icon_technology_id" text;--> statement-breakpoint
ALTER TABLE "technology" ADD COLUMN "docs_url" text;--> statement-breakpoint
ALTER TABLE "technology" ADD COLUMN "updates_url" text;--> statement-breakpoint
ALTER TABLE "connection" ADD COLUMN "icon_technology_id" text;--> statement-breakpoint
ALTER TABLE "connection" DROP COLUMN "technology";--> statement-breakpoint
CREATE INDEX "connection_technology_technology_id_idx" ON "connection_technology" ("technology_id");--> statement-breakpoint
CREATE INDEX "diagram_group_diagram_id_idx" ON "diagram_group" ("diagram_id");--> statement-breakpoint
CREATE INDEX "diagram_group_group_id_idx" ON "diagram_group" ("group_id");--> statement-breakpoint
CREATE INDEX "group_workspace_id_idx" ON "group" ("workspace_id");--> statement-breakpoint
CREATE INDEX "group_parent_group_id_idx" ON "group" ("parent_group_id");--> statement-breakpoint
CREATE INDEX "group_membership_group_id_idx" ON "group_membership" ("group_id");--> statement-breakpoint
ALTER TABLE "element" ADD CONSTRAINT "element_icon_technology_id_technology_id_fkey" FOREIGN KEY ("icon_technology_id") REFERENCES "technology"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "connection_technology" ADD CONSTRAINT "connection_technology_connection_id_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connection"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connection_technology" ADD CONSTRAINT "connection_technology_technology_id_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technology"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_icon_technology_id_technology_id_fkey" FOREIGN KEY ("icon_technology_id") REFERENCES "technology"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagram_group" ADD CONSTRAINT "diagram_group_diagram_id_diagram_id_fkey" FOREIGN KEY ("diagram_id") REFERENCES "diagram"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagram_group" ADD CONSTRAINT "diagram_group_group_id_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_workspace_id_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_parent_group_id_group_id_fkey" FOREIGN KEY ("parent_group_id") REFERENCES "group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_updated_by_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_element_id_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "element"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_group_id_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE;