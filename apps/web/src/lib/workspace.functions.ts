import {createServerFn} from "@tanstack/react-start";
import {and, eq, isNull} from "drizzle-orm";
import {db} from "./database";
import {workspace} from "./schema";
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
} from "./workspace.validators";
import {assertRole, getActiveMember, getSessionAndMember} from "./auth.helpers";

export const getWorkspaces = createServerFn({method: "GET"}).handler(
    async () => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor", "viewer"]);

        return db
            .select()
            .from(workspace)
            .where(
                and(
                    eq(workspace.organizationId, member.organizationId),
                    isNull(workspace.deletedAt),
                ),
            );
    },
);

export const getWorkspaceBySlug = createServerFn({method: "GET"}).inputValidator((input: { slug: string }) => input)
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor", "viewer"]);

        const [ws] = await db
            .select()
            .from(workspace)
            .where(
                and(
                    eq(workspace.organizationId, member.organizationId),
                    eq(workspace.slug, data.slug),
                    isNull(workspace.deletedAt),
                ),
            );

        if (!ws) throw new Error("Workspace not found");
        return ws;
    });

export const createWorkspace = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => createWorkspaceSchema.parse(input))
    .handler(async ({data}) => {
        const {session, member} = await getSessionAndMember();
        assertRole(member.role, ["owner", "admin", "editor"]);

        const id = crypto.randomUUID();

        const [created] = await db
            .insert(workspace)
            .values({
                id,
                organizationId: member.organizationId,
                name: data.name,
                slug: data.slug,
                description: data.description,
                color: data.color,
                createdBy: session.user.id,
            })
            .returning();

        return created;
    });

export const updateWorkspace = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => updateWorkspaceSchema.parse(input))
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin", "editor"]);

        const {id, ...updates} = data;

        const [updated] = await db
            .update(workspace)
            .set(updates)
            .where(
                and(eq(workspace.id, id), eq(workspace.organizationId, member.organizationId)),
            )
            .returning();

        if (!updated) throw new Error("Workspace not found");
        return updated;
    });

export const assertWorkspaceAdmin = createServerFn({method: "GET"}).handler(
    async () => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin"]);
    },
);

export const deleteWorkspace = createServerFn({method: "POST"})
    .inputValidator((input: { id: string }) => input)
    .handler(async ({data}) => {
        const member = await getActiveMember();
        assertRole(member.role, ["owner", "admin"]);

        const [deleted] = await db
            .update(workspace)
            .set({deletedAt: new Date()})
            .where(
                and(eq(workspace.id, data.id), eq(workspace.organizationId, member.organizationId)),
            )
            .returning();

        if (!deleted) throw new Error("Workspace not found");
        return deleted;
    });
