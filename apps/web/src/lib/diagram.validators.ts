import { z } from "zod/v4";
import {
  DIAGRAM_TYPES,
  PATH_TYPES,
  LINE_STYLES,
  ANCHOR_POINTS,
  DISPLAY_MODES,
} from "@archvault/shared/diagrams";

export type {
  DiagramType,
  PathType,
  LineStyle,
  AnchorPoint,
  DisplayMode,
  AncestrySegment,
} from "@archvault/shared/diagrams";

export {
  REQUIRES_PARENT_SUB_FLOW,
  validateDisplayMode,
  validateChildPlacement,
  validateElementForDiagram,
} from "@archvault/shared/diagrams";

// Re-export arrays for consumers that still reference the old names
export const diagramTypes = DIAGRAM_TYPES;
export const pathTypes = PATH_TYPES;
export const lineStyles = LINE_STYLES;
export const anchorPoints = ANCHOR_POINTS;
export const displayModes = DISPLAY_MODES;

// ── Ancestry ────────────────────────────────────────────────────────

export const getDiagramAncestrySchema = z.object({
  diagramId: z.string(),
  workspaceId: z.string(),
});

// ── Diagram CRUD schemas ────────────────────────────────────────────

export const createDiagramSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  diagramType: z.enum(DIAGRAM_TYPES),
  gridSize: z.number().int().min(5).max(100).default(20),
  snapToGrid: z.boolean().default(true),
});

export const updateDiagramSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  gridSize: z.number().int().min(5).max(100).optional(),
  snapToGrid: z.boolean().optional(),
});

export const deleteDiagramSchema = z.object({
  id: z.string(),
});

export const getDiagramsSchema = z.object({
  workspaceId: z.string(),
});

export const getDiagramSchema = z.object({
  id: z.string(),
});

export const getDiagramDataSchema = z.object({
  id: z.string(),
});

// ── Diagram Element schemas ─────────────────────────────────────────

export const addDiagramElementSchema = z.object({
  diagramId: z.string(),
  elementId: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  zIndex: z.number().int().default(0),
  displayMode: z.enum(DISPLAY_MODES).default("normal"),
  styleJson: z.record(z.string(), z.unknown()).optional(),
});

export const updateDiagramElementSchema = z.object({
  id: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  zIndex: z.number().int().optional(),
  displayMode: z.enum(DISPLAY_MODES).optional(),
  styleJson: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const removeDiagramElementSchema = z.object({
  id: z.string(),
});

export const batchUpdateDiagramElementsSchema = z.object({
  updates: z.array(z.object({
    id: z.string(),
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    zIndex: z.number().int().optional(),
  })).min(1).max(100),
});

// ── Diagram Connection schemas ─────────────────────────────────────

export const addDiagramConnectionSchema = z.object({
  diagramId: z.string(),
  connectionId: z.string(),
  pathType: z.enum(PATH_TYPES).default("curved"),
  lineStyle: z.enum(LINE_STYLES).default("solid"),
  sourceAnchor: z.enum(ANCHOR_POINTS).default("auto"),
  targetAnchor: z.enum(ANCHOR_POINTS).default("auto"),
  labelPosition: z.number().min(0).max(1).default(0.5),
  controlPointsJson: z.record(z.string(), z.unknown()).optional(),
  styleJson: z.record(z.string(), z.unknown()).optional(),
});

export const updateDiagramConnectionSchema = z.object({
  id: z.string(),
  pathType: z.enum(PATH_TYPES).optional(),
  lineStyle: z.enum(LINE_STYLES).optional(),
  sourceAnchor: z.enum(ANCHOR_POINTS).optional(),
  targetAnchor: z.enum(ANCHOR_POINTS).optional(),
  labelPosition: z.number().min(0).max(1).optional(),
  controlPointsJson: z.record(z.string(), z.unknown()).nullable().optional(),
  styleJson: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const removeDiagramConnectionSchema = z.object({
  id: z.string(),
});
