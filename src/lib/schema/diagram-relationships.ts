import {
    pgTable,
    pgEnum,
    text,
    real,
    jsonb,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import {diagram} from "./diagrams";
import {relationship} from "./relationships";

export const pathTypeEnum = pgEnum("path_type", [
    "straight",
    "curved",
    "orthogonal",
]);

export const lineStyleEnum = pgEnum("line_style", [
    "solid",
    "dashed",
    "dotted",
]);

export const anchorPointEnum = pgEnum("anchor_point", [
    "auto",
    "top",
    "bottom",
    "left",
    "right",
]);

export const diagramRelationship = pgTable(
    "diagram_relationship",
    {
        id: text("id").primaryKey(),
        diagramId: text("diagram_id")
            .notNull()
            .references(() => diagram.id, {onDelete: "cascade"}),
        relationshipId: text("relationship_id")
            .notNull()
            .references(() => relationship.id, {onDelete: "cascade"}),
        pathType: pathTypeEnum("path_type").default("curved").notNull(),
        lineStyle: lineStyleEnum("line_style").default("solid").notNull(),
        sourceAnchor: anchorPointEnum("source_anchor").default("auto").notNull(),
        targetAnchor: anchorPointEnum("target_anchor").default("auto").notNull(),
        labelPosition: real("label_position").default(0.5).notNull(),
        controlPointsJson: jsonb("control_points_json"),
        styleJson: jsonb("style_json"),
    },
    (table) => [
        uniqueIndex("diagram_rel_diagram_relationship_uidx").on(
            table.diagramId,
            table.relationshipId,
        ),
        index("diagram_rel_diagram_id_idx").on(table.diagramId),
        index("diagram_rel_relationship_id_idx").on(table.relationshipId),
    ],
);
