import type { ElementType } from "./elements";

// ── Diagram enums & types ───────────────────────────────────────────

export const DIAGRAM_TYPES = ["system_context", "container", "component"] as const;
export type DiagramType = (typeof DIAGRAM_TYPES)[number];

export const PATH_TYPES = ["straight", "curved", "orthogonal"] as const;
export type PathType = (typeof PATH_TYPES)[number];

export const LINE_STYLES = ["solid", "dashed", "dotted"] as const;
export type LineStyle = (typeof LINE_STYLES)[number];

export const ANCHOR_POINTS = ["auto", "top", "bottom", "left", "right"] as const;
export type AnchorPoint = (typeof ANCHOR_POINTS)[number];

export const DISPLAY_MODES = ["normal", "sub_flow"] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];

// ── Ancestry ────────────────────────────────────────────────────────

export interface AncestrySegment {
  diagramId: string;
  diagramName: string;
  diagramType: string;
  linkElementId: string;
  linkElementName: string;
  linkElementType: string;
  siblings: {
    elementId: string;
    elementName: string;
    elementType: string;
    deeperDiagramId: string | null;
    deeperDiagramName: string | null;
  }[];
}

// ── Rule maps ───────────────────────────────────────────────────────

export const ALLOWED_ELEMENT_TYPES: Record<DiagramType, ElementType[]> = {
  system_context: ["actor", "system"],
  container: ["actor", "system", "app", "store"],
  component: ["actor", "system", "app", "store", "component"],
};

export const VALID_SUB_FLOW_TYPES: Record<DiagramType, ElementType[]> = {
  system_context: [],
  container: ["system"],
  component: ["app"],
};

export const REQUIRES_PARENT_SUB_FLOW: Record<DiagramType, ElementType[]> = {
  system_context: [],
  container: ["app", "store"],
  component: ["component"],
};

// ── Validation functions ────────────────────────────────────────────

export function validateDisplayMode(
  diagramType: DiagramType,
  elementType: ElementType,
  displayMode: DisplayMode,
): { valid: boolean; message?: string } {
  if (displayMode === "normal") return { valid: true };
  const allowed = VALID_SUB_FLOW_TYPES[diagramType];
  if (!allowed.includes(elementType)) {
    return { valid: false, message: `A ${elementType} cannot be a sub-flow on a ${diagramType} diagram.` };
  }
  return { valid: true };
}

export function validateChildPlacement(
  diagramType: DiagramType,
  elementType: ElementType,
  parentElementId: string | null,
  subFlowElementIds: Set<string>,
): { valid: boolean; message?: string } {
  const required = REQUIRES_PARENT_SUB_FLOW[diagramType];
  if (!required.includes(elementType)) return { valid: true };

  if (!parentElementId || !subFlowElementIds.has(parentElementId)) {
    return { valid: false, message: `A ${elementType} must be placed inside a sub-flow container.` };
  }
  return { valid: true };
}

export function validateElementForDiagram(
  diagramType: DiagramType,
  elementType: ElementType,
): { valid: boolean; message?: string } {
  const allowed = ALLOWED_ELEMENT_TYPES[diagramType];
  if (!allowed.includes(elementType)) {
    return {
      valid: false,
      message: `A ${elementType} cannot be placed on a ${diagramType} diagram.`,
    };
  }
  return { valid: true };
}
