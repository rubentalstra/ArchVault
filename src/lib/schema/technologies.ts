import {
  pgTable,
  text,
  integer,
  timestamp,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { workspace } from "./workspaces";
import { element } from "./elements";
import { connection } from "./connections";

export const technology = pgTable(
  "technology",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    website: text("website"),
    iconSlug: text("icon_slug"),
    docsUrl: text("docs_url"),
    updatesUrl: text("updates_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("technology_workspace_id_idx").on(table.workspaceId)],
);

export const elementTechnology = pgTable(
  "element_technology",
  {
    elementId: text("element_id")
      .notNull()
      .references(() => element.id, { onDelete: "cascade" }),
    technologyId: text("technology_id")
      .notNull()
      .references(() => technology.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.elementId, table.technologyId] }),
    index("element_technology_technology_id_idx").on(table.technologyId),
  ],
);

export const connectionTechnology = pgTable(
  "connection_technology",
  {
    connectionId: text("connection_id")
      .notNull()
      .references(() => connection.id, { onDelete: "cascade" }),
    technologyId: text("technology_id")
      .notNull()
      .references(() => technology.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.connectionId, table.technologyId] }),
    index("connection_technology_technology_id_idx").on(table.technologyId),
  ],
);
