import { z } from "zod/v4";

// ── Technology CRUD schemas ─────────────────────────────────────────

export const createTechnologySchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  iconSlug: z.string().optional(),
  docsUrl: z.string().url().optional(),
  updatesUrl: z.string().url().optional(),
});

export const updateTechnologySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  website: z.string().url().nullable().optional(),
  iconSlug: z.string().nullable().optional(),
  docsUrl: z.string().url().nullable().optional(),
  updatesUrl: z.string().url().nullable().optional(),
});

export const deleteTechnologySchema = z.object({
  id: z.string(),
});

export const getTechnologiesSchema = z.object({
  workspaceId: z.string(),
});

// ── Element technology assignment schemas ────────────────────────────

export const addElementTechnologySchema = z.object({
  elementId: z.string(),
  technologyId: z.string(),
  sortOrder: z.number().int().default(0),
});

export const removeElementTechnologySchema = z.object({
  elementId: z.string(),
  technologyId: z.string(),
});

export const reorderElementTechnologiesSchema = z.object({
  elementId: z.string(),
  orderedTechnologyIds: z.array(z.string()),
});

// ── Connection technology assignment schemas ─────────────────────────

export const addConnectionTechnologySchema = z.object({
  connectionId: z.string(),
  technologyId: z.string(),
  sortOrder: z.number().int().default(0),
});

export const removeConnectionTechnologySchema = z.object({
  connectionId: z.string(),
  technologyId: z.string(),
});

export const reorderConnectionTechnologiesSchema = z.object({
  connectionId: z.string(),
  orderedTechnologyIds: z.array(z.string()),
});

// ── Icon technology schemas ─────────────────────────────────────────

export const setElementIconTechnologySchema = z.object({
  elementId: z.string(),
  technologyId: z.string().nullable(),
});

export const setConnectionIconTechnologySchema = z.object({
  connectionId: z.string(),
  technologyId: z.string().nullable(),
});
