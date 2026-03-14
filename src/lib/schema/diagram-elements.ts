import {
    pgTable,
    text,
    real,
    integer,
    jsonb,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import {diagram} from "./diagrams";
import {element} from "./elements";

export const diagramElement = pgTable(
    "diagram_element",
    {
        id: text("id").primaryKey(),
        diagramId: text("diagram_id")
            .notNull()
            .references(() => diagram.id, {onDelete: "cascade"}),
        elementId: text("element_id")
            .notNull()
            .references(() => element.id, {onDelete: "cascade"}),
        x: real("x").default(0).notNull(),
        y: real("y").default(0).notNull(),
        width: real("width").default(200).notNull(),
        height: real("height").default(120).notNull(),
        zIndex: integer("z_index").default(0).notNull(),
        styleJson: jsonb("style_json"),
    },
    (table) => [
        uniqueIndex("diagram_element_diagram_element_uidx").on(
            table.diagramId,
            table.elementId,
        ),
        index("diagram_element_diagram_id_idx").on(table.diagramId),
        index("diagram_element_element_id_idx").on(table.elementId),
    ],
);
