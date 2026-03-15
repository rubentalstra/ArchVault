import {
  pgTable,
  text,
  varchar,
  timestamp,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { workspace } from "./workspaces";
import { user } from "./auth-schema";

export const group = pgTable(
  "group",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: varchar("color", { length: 7 }).notNull(),
    parentGroupId: text("parent_group_id").references(
      (): AnyPgColumn => group.id,
      { onDelete: "set null" },
    ),
    description: text("description"),
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
    index("group_workspace_id_idx").on(table.workspaceId),
    index("group_parent_group_id_idx").on(table.parentGroupId),
  ],
);
