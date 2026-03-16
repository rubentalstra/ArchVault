// ── Element enums & types ───────────────────────────────────────────

export const ELEMENT_TYPES = ["actor", "system", "app", "store", "component"] as const;
export type ElementType = (typeof ELEMENT_TYPES)[number];

export const ELEMENT_STATUSES = ["planned", "live", "deprecated"] as const;
export type ElementStatus = (typeof ELEMENT_STATUSES)[number];

// ── Display ordering ────────────────────────────────────────────────

export const ELEMENT_TYPE_ORDER: ElementType[] = ["actor", "system", "app", "store", "component"];

// ── Default element sizes ───────────────────────────────────────────

export const DEFAULT_ELEMENT_SIZES: Record<ElementType, { width: number; height: number }> = {
  actor: { width: 160, height: 100 },
  system: { width: 200, height: 120 },
  app: { width: 180, height: 110 },
  store: { width: 180, height: 110 },
  component: { width: 160, height: 100 },
};

export const SUB_FLOW_ELEMENT_SIZES: Record<ElementType, { width: number; height: number }> = {
  actor: { width: 160, height: 100 },
  system: { width: 500, height: 400 },
  app: { width: 500, height: 400 },
  store: { width: 180, height: 110 },
  component: { width: 160, height: 100 },
};

// ── Minimap node colors (hex) ───────────────────────────────────────

export const ELEMENT_TYPE_COLORS: Record<ElementType, string> = {
  actor: "#60a5fa",
  system: "#34d399",
  app: "#a78bfa",
  store: "#22c55e",
  component: "#fb923c",
};

// ── Hierarchy rules ─────────────────────────────────────────────────

export const VALID_PARENTS: Record<ElementType, ElementType[] | null> = {
  actor: null,
  system: null,
  app: ["system"],
  store: ["system"],
  component: ["app"],
};

export const VALID_CHILDREN: Record<ElementType, ElementType[]> = {
  actor: [],
  system: ["app", "store"],
  app: ["component"],
  store: [],
  component: [],
};

// ── Hierarchy validation ────────────────────────────────────────────

export function validateElementHierarchy(
  elementType: ElementType,
  parentType: ElementType | null | undefined,
): { valid: boolean; message?: string } {
  const allowedParents = VALID_PARENTS[elementType];

  if (!allowedParents) {
    return parentType
      ? { valid: false, message: `A ${elementType} cannot have a parent element.` }
      : { valid: true };
  }

  if (!parentType) {
    if (elementType === "app" || elementType === "store" || elementType === "component") {
      return {
        valid: false,
        message: `A ${elementType} must be nested under ${allowedParents.join(" or ")}.`,
      };
    }
    return { valid: true };
  }

  if (!allowedParents.includes(parentType)) {
    return {
      valid: false,
      message: `A ${elementType} must be nested under ${allowedParents.join(" or ")}, not ${parentType}.`,
    };
  }

  return { valid: true };
}
