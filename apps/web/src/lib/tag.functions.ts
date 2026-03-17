import {createServerFn} from "@tanstack/react-start";
import {and, eq} from "drizzle-orm";
import {db} from "./database";
import {tag, elementTag, connectionTag} from "./schema";
import {
    createTagSchema,
    updateTagSchema,
    deleteTagSchema,
    getTagsSchema,
    addElementTagSchema,
    removeElementTagSchema,
    addConnectionTagSchema,
    removeConnectionTagSchema,
} from "./tag.validators";
import {assertRole, getActiveMember} from "./auth.helpers";

// ── Tag CRUD ─────────────────────────────────────────────────────────

export const getTags = createServerFn({method: "GET"})
    .inputValidator((input: unknown) => getTagsSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor", "viewer"]);

        return db
            .select()
            .from(tag)
            .where(eq(tag.workspaceId, data.workspaceId));
    });

export const createTag = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => createTagSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor"]);

        const id = crypto.randomUUID();
        const [created] = await db
            .insert(tag)
            .values({
                id,
                workspaceId: data.workspaceId,
                name: data.name,
                color: data.color,
                icon: data.icon ?? null,
            })
            .returning();

        return created;
    });

export const updateTag = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => updateTagSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor"]);

        const {id, ...updates} = data;
        const [updated] = await db
            .update(tag)
            .set(updates)
            .where(eq(tag.id, id))
            .returning();

        if (!updated) throw new Error("Tag not found");
        return updated;
    });

export const deleteTag = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => deleteTagSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin"]);

        const [deleted] = await db
            .delete(tag)
            .where(eq(tag.id, data.id))
            .returning();

        if (!deleted) throw new Error("Tag not found");
        return {success: true};
    });

// ── Element tag assignment ───────────────────────────────────────────

export const addElementTag = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => addElementTagSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor"]);

        await db
            .insert(elementTag)
            .values({
                elementId: data.elementId,
                tagId: data.tagId,
            })
            .onConflictDoNothing();

        return {success: true};
    });

export const removeElementTag = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => removeElementTagSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor"]);

        await db
            .delete(elementTag)
            .where(
                and(
                    eq(elementTag.elementId, data.elementId),
                    eq(elementTag.tagId, data.tagId),
                ),
            );

        return {success: true};
    });

// ── Connection tag assignment ───────────────────────────────────────

export const addConnectionTag = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => addConnectionTagSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor"]);

        await db
            .insert(connectionTag)
            .values({
                connectionId: data.connectionId,
                tagId: data.tagId,
            })
            .onConflictDoNothing();

        return {success: true};
    });

export const removeConnectionTag = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => removeConnectionTagSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor"]);

        await db
            .delete(connectionTag)
            .where(
                and(
                    eq(connectionTag.connectionId, data.connectionId),
                    eq(connectionTag.tagId, data.tagId),
                ),
            );

        return {success: true};
    });
