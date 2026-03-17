import { z } from "zod/v4";
import { ELEMENT_TYPES, ELEMENT_STATUSES } from "@archvault/shared/elements";

export type { ElementType, ElementStatus } from "@archvault/shared/elements";
export { validateElementHierarchy } from "@archvault/shared/elements";

// Re-export arrays for consumers that still reference the old names
export const elementTypes = ELEMENT_TYPES;
export const elementStatuses = ELEMENT_STATUSES;

// ── Element CRUD schemas ───────────────────────────────────────────────

export const createElementSchema = z.object({
  workspaceId: z.string(),
  parentElementId: z.string().optional(),
  elementType: z.enum(ELEMENT_TYPES),
  name: z.string().min(1).max(100),
  displayDescription: z.string().max(120).optional(),
  description: z.string().optional(),
  status: z.enum(ELEMENT_STATUSES).default("live"),
  external: z.boolean().default(false),
  metadataJson: z.record(z.string(), z.unknown()).optional(),
});

export const updateElementSchema = z.object({
  id: z.string(),
  parentElementId: z.string().nullable().optional(),
  name: z.string().min(1).max(100).optional(),
  displayDescription: z.string().max(120).nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(ELEMENT_STATUSES).optional(),
  external: z.boolean().optional(),
  metadataJson: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const deleteElementSchema = z.object({
  id: z.string(),
});

export const getElementsSchema = z.object({
  workspaceId: z.string(),
});

// ── Link schemas ───────────────────────────────────────────────────────

export const addLinkSchema = z.object({
  elementId: z.string(),
  url: z.string().url(),
  label: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateLinkSchema = z.object({
  id: z.string(),
  url: z.string().url().optional(),
  label: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const removeLinkSchema = z.object({
  id: z.string(),
});
