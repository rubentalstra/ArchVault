import { z } from "zod/v4";

export const connectionDirections = ["outgoing", "incoming", "bidirectional", "none"] as const;
export type ConnectionDirection = (typeof connectionDirections)[number];

// ── Connection CRUD schemas ────────────────────────────────────────

export const createConnectionSchema = z.object({
  workspaceId: z.string(),
  sourceElementId: z.string(),
  targetElementId: z.string(),
  direction: z.enum(connectionDirections).default("outgoing"),
  description: z.string().optional(),
});

export const updateConnectionSchema = z.object({
  id: z.string(),
  sourceElementId: z.string().optional(),
  targetElementId: z.string().optional(),
  direction: z.enum(connectionDirections).optional(),
  description: z.string().nullable().optional(),
});

export const deleteConnectionSchema = z.object({
  id: z.string(),
});

export const getConnectionsSchema = z.object({
  workspaceId: z.string(),
});

// ── Endpoint validation ──────────────────────────────────────────────

export function validateConnectionEndpoints(
  sourceId: string,
  targetId: string,
): { valid: boolean; message?: string } {
  if (sourceId === targetId) {
    return { valid: false, message: "Source and target cannot be the same element." };
  }
  return { valid: true };
}
