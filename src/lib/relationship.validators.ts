import { z } from "zod/v4";

export const relationshipDirections = ["outgoing", "incoming", "bidirectional", "none"] as const;
export type RelationshipDirection = (typeof relationshipDirections)[number];

// ── Relationship CRUD schemas ────────────────────────────────────────

export const createRelationshipSchema = z.object({
  workspaceId: z.string(),
  sourceElementId: z.string(),
  targetElementId: z.string(),
  direction: z.enum(relationshipDirections).default("outgoing"),
  description: z.string().optional(),
  technology: z.string().optional(),
});

export const updateRelationshipSchema = z.object({
  id: z.string(),
  sourceElementId: z.string().optional(),
  targetElementId: z.string().optional(),
  direction: z.enum(relationshipDirections).optional(),
  description: z.string().nullable().optional(),
  technology: z.string().nullable().optional(),
});

export const deleteRelationshipSchema = z.object({
  id: z.string(),
});

export const getRelationshipsSchema = z.object({
  workspaceId: z.string(),
});

// ── Endpoint validation ──────────────────────────────────────────────

export function validateRelationshipEndpoints(
  sourceId: string,
  targetId: string,
): { valid: boolean; message?: string } {
  if (sourceId === targetId) {
    return { valid: false, message: "Source and target cannot be the same element." };
  }
  return { valid: true };
}
