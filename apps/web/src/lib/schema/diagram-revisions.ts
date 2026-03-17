import {
    pgTable,
    text,
    integer,
    timestamp,
    jsonb,
    index,
} from "drizzle-orm/pg-core";
import {user} from "./auth-schema";

export const diagramRevision = pgTable(
    "diagram_revision",
    {
        id: text("id").primaryKey(),
        diagramId: text("diagram_id").notNull(),
        revisionNumber: integer("revision_number").notNull(),
        snapshotJson: jsonb("snapshot_json").notNull(),
        note: text("note"),
        createdBy: text("created_by").references(() => user.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("diagram_revision_diagram_id_idx").on(table.diagramId),
    ],
);
