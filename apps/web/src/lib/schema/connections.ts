import {
    pgTable,
    pgEnum,
    text,
    timestamp,
    index,
} from "drizzle-orm/pg-core";
import {workspace} from "./workspaces";
import {element} from "./elements";
import {user} from "./auth-schema";
import {technology} from "./technologies";

import { CONNECTION_DIRECTIONS } from "@archvault/shared/connections";

export const connectionDirectionEnum = pgEnum("connection_direction", [...CONNECTION_DIRECTIONS]);

export const connection = pgTable(
    "connection",
    {
        id: text("id").primaryKey(),
        workspaceId: text("workspace_id")
            .notNull()
            .references(() => workspace.id, {onDelete: "cascade"}),
        sourceElementId: text("source_element_id")
            .notNull()
            .references(() => element.id, {onDelete: "cascade"}),
        targetElementId: text("target_element_id")
            .notNull()
            .references(() => element.id, {onDelete: "cascade"}),
        direction: connectionDirectionEnum("direction")
            .default("outgoing")
            .notNull(),
        description: text("description"),
        iconTechnologyId: text("icon_technology_id").references(
            () => technology.id,
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
        index("connection_workspace_id_idx").on(table.workspaceId),
        index("connection_source_element_id_idx").on(table.sourceElementId),
        index("connection_target_element_id_idx").on(table.targetElementId),
    ],
);
