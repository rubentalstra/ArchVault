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
import {connection} from "./connections";

import { PATH_TYPES, LINE_STYLES, ANCHOR_POINTS } from "@archvault/shared/diagrams";

export const pathTypeEnum = pgEnum("path_type", [...PATH_TYPES]);

export const lineStyleEnum = pgEnum("line_style", [...LINE_STYLES]);

export const anchorPointEnum = pgEnum("anchor_point", [...ANCHOR_POINTS]);

export const diagramConnection = pgTable(
    "diagram_connection",
    {
        id: text("id").primaryKey(),
        diagramId: text("diagram_id")
            .notNull()
            .references(() => diagram.id, {onDelete: "cascade"}),
        connectionId: text("connection_id")
            .notNull()
            .references(() => connection.id, {onDelete: "cascade"}),
        pathType: pathTypeEnum("path_type").default("curved").notNull(),
        lineStyle: lineStyleEnum("line_style").default("solid").notNull(),
        sourceAnchor: anchorPointEnum("source_anchor").default("auto").notNull(),
        targetAnchor: anchorPointEnum("target_anchor").default("auto").notNull(),
        labelPosition: real("label_position").default(0.5).notNull(),
        controlPointsJson: jsonb("control_points_json"),
        styleJson: jsonb("style_json"),
    },
    (table) => [
        uniqueIndex("diagram_conn_diagram_connection_uidx").on(
            table.diagramId,
            table.connectionId,
        ),
        index("diagram_conn_diagram_id_idx").on(table.diagramId),
        index("diagram_conn_connection_id_idx").on(table.connectionId),
    ],
);
