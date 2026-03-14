CREATE TABLE "workspace" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"icon_emoji" text,
	"settings_json" text,
	"created_by" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "workspace_org_id_idx" ON "workspace" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_org_slug_uidx" ON "workspace" ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "workspace_created_by_idx" ON "workspace" ("created_by");--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;