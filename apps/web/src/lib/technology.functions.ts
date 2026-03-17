import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "./database";
import { technology, elementTechnology, connectionTechnology, element, connection } from "./schema";
import {
  createTechnologySchema,
  updateTechnologySchema,
  deleteTechnologySchema,
  getTechnologiesSchema,
  addElementTechnologySchema,
  removeElementTechnologySchema,
  reorderElementTechnologiesSchema,
  addConnectionTechnologySchema,
  removeConnectionTechnologySchema,
  reorderConnectionTechnologiesSchema,
  setElementIconTechnologySchema,
  setConnectionIconTechnologySchema,
} from "./technology.validators";
import { assertRole, getActiveMember } from "./auth.helpers";

// ── Technology CRUD ─────────────────────────────────────────────────

export const getTechnologies = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => getTechnologiesSchema.parse(input))
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor", "viewer"]);

    const { count, sql: sqlTag } = await import("drizzle-orm");

    const elementCount = db
      .select({
        technologyId: elementTechnology.technologyId,
        count: count().as("element_count"),
      })
      .from(elementTechnology)
      .groupBy(elementTechnology.technologyId)
      .as("ec");

    const connectionCount = db
      .select({
        technologyId: connectionTechnology.technologyId,
        count: count().as("connection_count"),
      })
      .from(connectionTechnology)
      .groupBy(connectionTechnology.technologyId)
      .as("cc");

    return db
      .select({
        id: technology.id,
        workspaceId: technology.workspaceId,
        name: technology.name,
        description: technology.description,
        website: technology.website,
        iconSlug: technology.iconSlug,
        docsUrl: technology.docsUrl,
        updatesUrl: technology.updatesUrl,
        createdAt: technology.createdAt,
        updatedAt: technology.updatedAt,
        assignedCount: sqlTag<number>`coalesce(${elementCount.count}, 0) + coalesce(${connectionCount.count}, 0)`.as(
          "assigned_count",
        ),
      })
      .from(technology)
      .leftJoin(elementCount, eq(technology.id, elementCount.technologyId))
      .leftJoin(connectionCount, eq(technology.id, connectionCount.technologyId))
      .where(eq(technology.workspaceId, data.workspaceId));
  });

export const createTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createTechnologySchema.parse(input))
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    const id = crypto.randomUUID();
    const [created] = await db
      .insert(technology)
      .values({
        id,
        workspaceId: data.workspaceId,
        name: data.name,
        description: data.description ?? null,
        website: data.website ?? null,
        iconSlug: data.iconSlug ?? null,
        docsUrl: data.docsUrl ?? null,
        updatesUrl: data.updatesUrl ?? null,
      })
      .returning();

    return created;
  });

export const updateTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateTechnologySchema.parse(input))
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    const { id, ...updates } = data;
    const [updated] = await db
      .update(technology)
      .set(updates)
      .where(eq(technology.id, id))
      .returning();

    if (!updated) throw new Error("Technology not found");
    return updated;
  });

export const deleteTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteTechnologySchema.parse(input))
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin"]);

    const [deleted] = await db
      .delete(technology)
      .where(eq(technology.id, data.id))
      .returning();

    if (!deleted) throw new Error("Technology not found");
    return { success: true };
  });

// ── Element technology assignment ───────────────────────────────────

export const addElementTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    addElementTechnologySchema.parse(input),
  )
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    await db
      .insert(elementTechnology)
      .values({
        elementId: data.elementId,
        technologyId: data.technologyId,
        sortOrder: data.sortOrder,
      })
      .onConflictDoNothing();

    return { success: true };
  });

export const removeElementTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    removeElementTechnologySchema.parse(input),
  )
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    await db
      .delete(elementTechnology)
      .where(
        and(
          eq(elementTechnology.elementId, data.elementId),
          eq(elementTechnology.technologyId, data.technologyId),
        ),
      );

    return { success: true };
  });

export const reorderElementTechnologies = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    reorderElementTechnologiesSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    await Promise.all(
      data.orderedTechnologyIds.map((technologyId, index) =>
        db
          .update(elementTechnology)
          .set({ sortOrder: index })
          .where(
            and(
              eq(elementTechnology.elementId, data.elementId),
              eq(elementTechnology.technologyId, technologyId),
            ),
          ),
      ),
    );

    return { success: true };
  });

// ── Connection technology assignment ────────────────────────────────

export const addConnectionTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    addConnectionTechnologySchema.parse(input),
  )
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    await db
      .insert(connectionTechnology)
      .values({
        connectionId: data.connectionId,
        technologyId: data.technologyId,
        sortOrder: data.sortOrder,
      })
      .onConflictDoNothing();

    return { success: true };
  });

export const removeConnectionTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    removeConnectionTechnologySchema.parse(input),
  )
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    await db
      .delete(connectionTechnology)
      .where(
        and(
          eq(connectionTechnology.connectionId, data.connectionId),
          eq(connectionTechnology.technologyId, data.technologyId),
        ),
      );

    return { success: true };
  });

export const reorderConnectionTechnologies = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    reorderConnectionTechnologiesSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    await Promise.all(
      data.orderedTechnologyIds.map((technologyId, index) =>
        db
          .update(connectionTechnology)
          .set({ sortOrder: index })
          .where(
            and(
              eq(connectionTechnology.connectionId, data.connectionId),
              eq(connectionTechnology.technologyId, technologyId),
            ),
          ),
      ),
    );

    return { success: true };
  });

// ── Icon technology ─────────────────────────────────────────────────

export const setElementIconTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    setElementIconTechnologySchema.parse(input),
  )
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    const [updated] = await db
      .update(element)
      .set({ iconTechnologyId: data.technologyId })
      .where(eq(element.id, data.elementId))
      .returning();

    if (!updated) throw new Error("Element not found");
    return { success: true };
  });

export const setConnectionIconTechnology = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    setConnectionIconTechnologySchema.parse(input),
  )
  .handler(async ({ data }) => {
    const member = await getActiveMember();
    assertRole(member.role, ["owner", "admin", "editor"]);

    const [updated] = await db
      .update(connection)
      .set({ iconTechnologyId: data.technologyId })
      .where(eq(connection.id, data.connectionId))
      .returning();

    if (!updated) throw new Error("Connection not found");
    return { success: true };
  });
