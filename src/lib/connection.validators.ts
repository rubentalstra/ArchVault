import { z } from "zod/v4";
import { CONNECTION_DIRECTIONS } from "@archvault/shared/connections";

export type { ConnectionDirection } from "@archvault/shared/connections";
export { validateConnectionEndpoints } from "@archvault/shared/connections";

// Re-export array for consumers that still reference the old name
export const connectionDirections = CONNECTION_DIRECTIONS;

// ── Connection CRUD schemas ────────────────────────────────────────

export const createConnectionSchema = z.object({
  workspaceId: z.string(),
  sourceElementId: z.string(),
  targetElementId: z.string(),
  direction: z.enum(CONNECTION_DIRECTIONS).default("outgoing"),
  description: z.string().optional(),
});

export const updateConnectionSchema = z.object({
  id: z.string(),
  sourceElementId: z.string().optional(),
  targetElementId: z.string().optional(),
  direction: z.enum(CONNECTION_DIRECTIONS).optional(),
  description: z.string().nullable().optional(),
});

export const deleteConnectionSchema = z.object({
  id: z.string(),
});

export const getConnectionsSchema = z.object({
  workspaceId: z.string(),
});
