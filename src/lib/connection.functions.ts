import {createServerFn} from "@tanstack/react-start";
import {and, eq, isNull, inArray} from "drizzle-orm";
import {db} from "./database";
import {connection, element, tag, connectionTag} from "./schema";
import {
    createConnectionSchema,
    updateConnectionSchema,
    deleteConnectionSchema,
    getConnectionsSchema,
    validateConnectionEndpoints,
} from "./connection.validators";
import {assertRole, getSessionAndOrg} from "./auth.helpers";

// NOTE: No module-level helper functions that reference `db`.
// All helpers are inlined into handlers so the bundler can tree-shake
// server-only imports (`db`, `pg`) from the client bundle.

// ── Connection CRUD ─────────────────────────────────────────────────

export const getConnections = createServerFn({method: "GET"})
    .inputValidator((input: unknown) => getConnectionsSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor", "viewer"]);

        const connections = await db
            .select()
            .from(connection)
            .where(
                and(
                    eq(connection.workspaceId, data.workspaceId),
                    isNull(connection.deletedAt),
                ),
            );

        const connectionIds = connections.map((r) => r.id);
        const tagRows = connectionIds.length > 0
            ? await db.select().from(connectionTag).where(inArray(connectionTag.connectionId, connectionIds))
            : [];
        const uniqueTagIds = [...new Set(tagRows.map((r) => r.tagId))];
        const tags = uniqueTagIds.length > 0
            ? await db.select().from(tag).where(inArray(tag.id, uniqueTagIds))
            : [];
        const tagMap = new Map(tags.map((t) => [t.id, t]));

        return connections.map((rel) => ({
            ...rel,
            tags: tagRows
                .filter((r) => r.connectionId === rel.id)
                .map((r) => tagMap.get(r.tagId))
                .filter(Boolean),
        }));
    });

export const createConnection = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => createConnectionSchema.parse(input))
    .handler(async ({data}) => {
        const {session, memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        const endpoints = validateConnectionEndpoints(data.sourceElementId, data.targetElementId);
        if (!endpoints.valid) throw new Error(endpoints.message);

        // Inline helper: assert element belongs to workspace
        async function assertElementInWorkspace(elementId: string, workspaceId: string) {
            const [el] = await db
                .select({id: element.id, workspaceId: element.workspaceId})
                .from(element)
                .where(and(eq(element.id, elementId), isNull(element.deletedAt)));
            if (!el) throw new Error("Element not found");
            if (el.workspaceId !== workspaceId)
                throw new Error("Element belongs to a different workspace");
        }

        await assertElementInWorkspace(data.sourceElementId, data.workspaceId);
        await assertElementInWorkspace(data.targetElementId, data.workspaceId);

        const id = crypto.randomUUID();
        const [created] = await db
            .insert(connection)
            .values({
                id,
                workspaceId: data.workspaceId,
                sourceElementId: data.sourceElementId,
                targetElementId: data.targetElementId,
                direction: data.direction,
                description: data.description ?? null,
                technology: data.technology ?? null,
                createdBy: session.user.id,
                updatedBy: session.user.id,
            })
            .returning();

        return created;
    });

export const updateConnection = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => updateConnectionSchema.parse(input))
    .handler(async ({data}) => {
        const {session, memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        // Inline helper
        async function assertElementInWorkspace(elementId: string, workspaceId: string) {
            const [el] = await db
                .select({id: element.id, workspaceId: element.workspaceId})
                .from(element)
                .where(and(eq(element.id, elementId), isNull(element.deletedAt)));
            if (!el) throw new Error("Element not found");
            if (el.workspaceId !== workspaceId)
                throw new Error("Element belongs to a different workspace");
        }

        const {id, ...updates} = data;

        const [existing] = await db
            .select()
            .from(connection)
            .where(and(eq(connection.id, id), isNull(connection.deletedAt)));
        if (!existing) throw new Error("Connection not found");

        const newSourceId = updates.sourceElementId ?? existing.sourceElementId;
        const newTargetId = updates.targetElementId ?? existing.targetElementId;

        const endpoints = validateConnectionEndpoints(newSourceId, newTargetId);
        if (!endpoints.valid) throw new Error(endpoints.message);

        if (updates.sourceElementId) {
            await assertElementInWorkspace(updates.sourceElementId, existing.workspaceId);
        }
        if (updates.targetElementId) {
            await assertElementInWorkspace(updates.targetElementId, existing.workspaceId);
        }

        const [updated] = await db
            .update(connection)
            .set({...updates, updatedBy: session.user.id})
            .where(eq(connection.id, id))
            .returning();

        if (!updated) throw new Error("Connection not found");
        return updated;
    });

export const deleteConnection = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => deleteConnectionSchema.parse(input))
    .handler(async ({data}) => {
        const {session, memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin"]);

        const [updated] = await db
            .update(connection)
            .set({deletedAt: new Date(), updatedBy: session.user.id})
            .where(and(eq(connection.id, data.id), isNull(connection.deletedAt)))
            .returning();

        if (!updated) throw new Error("Connection not found");
        return {success: true};
    });
