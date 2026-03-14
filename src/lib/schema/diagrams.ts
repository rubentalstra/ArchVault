import {
    pgTable,
    pgEnum,
    text,
    integer,
    boolean,
    timestamp,
    index,
    type AnyPgColumn,
} from "drizzle-orm/pg-core";
import {workspace} from "./workspaces";
import {element} from "./elements";
import {user} from "./auth-schema";
import {diagramRevision} from "./diagram-revisions";

export const diagramTypeEnum = pgEnum("diagram_type", [
    "context",
    "app",
    "component",
]);

export const diagram = pgTable(
    "diagram",
    {
        id: text("id").primaryKey(),
        workspaceId: text("workspace_id")
            .notNull()
            .references(() => workspace.id, {onDelete: "cascade"}),
        name: text("name").notNull(),
        description: text("description"),
        diagramType: diagramTypeEnum("diagram_type").notNull(),
        scopeElementId: text("scope_element_id").references(
            () => element.id,
            {onDelete: "set null"},
        ),
        gridSize: integer("grid_size").default(20).notNull(),
        snapToGrid: boolean("snap_to_grid").default(true).notNull(),
        currentRevisionId: text("current_revision_id").references(
            (): AnyPgColumn => diagramRevision.id,
            {onDelete: "set null"},
        ),
        sourceBlockInstallationId: text("source_block_installation_id"),
        createdBy: text("created_by").references(() => user.id, {
            onDelete: "set null",
        }),
        updatedBy: text("updated_by").references(() => user.id, {
            onDelete: "set null",
        }),
        deletedAt: timestamp("deleted_at"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("diagram_workspace_id_idx").on(table.workspaceId),
        index("diagram_scope_element_id_idx").on(table.scopeElementId),
    ],
);
