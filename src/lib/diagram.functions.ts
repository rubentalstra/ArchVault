import {createServerFn} from "@tanstack/react-start";
import {and, eq, isNull} from "drizzle-orm";
import {db} from "./database";
import {
    diagram,
    diagramElement,
    diagramConnection,
    element,
    technology,
    elementTechnology,
    connectionTechnology,
    connection,
} from "./schema";
import {
    createDiagramSchema,
    updateDiagramSchema,
    deleteDiagramSchema,
    getDiagramsSchema,
    getDiagramSchema,
    getDiagramDataSchema,
    addDiagramElementSchema,
    updateDiagramElementSchema,
    removeDiagramElementSchema,
    addDiagramConnectionSchema,
    updateDiagramConnectionSchema,
    removeDiagramConnectionSchema,
    validateDiagramScope,
    validateElementForDiagram,
} from "./diagram.validators";
import type {DiagramType} from "./diagram.validators";
import type {ElementType} from "./element.validators";
import {assertRole, getSessionAndOrg} from "./auth.helpers";

// NOTE: No module-level helper functions that reference `db`.
// All helpers are inlined into handlers so the bundler can tree-shake
// server-only imports (`db`, `pg`) from the client bundle.

// ── Diagram CRUD ──────────────────────────────────────────────────────

export const getDiagrams = createServerFn({method: "GET"})
    .inputValidator((input: unknown) => getDiagramsSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor", "viewer"]);

        const {sql: sqlTag, count} = await import("drizzle-orm");

        const elementCountSubquery = db
            .select({
                diagramId: diagramElement.diagramId,
                count: count().as("element_count"),
            })
            .from(diagramElement)
            .groupBy(diagramElement.diagramId)
            .as("ec");

        const rows = await db
            .select({
                id: diagram.id,
                workspaceId: diagram.workspaceId,
                name: diagram.name,
                description: diagram.description,
                diagramType: diagram.diagramType,
                scopeElementId: diagram.scopeElementId,
                gridSize: diagram.gridSize,
                snapToGrid: diagram.snapToGrid,
                createdAt: diagram.createdAt,
                updatedAt: diagram.updatedAt,
                scopeElementName: element.name,
                elementCount: sqlTag<number>`coalesce(${elementCountSubquery.count}, 0)`.as("element_count"),
            })
            .from(diagram)
            .leftJoin(element, eq(diagram.scopeElementId, element.id))
            .leftJoin(elementCountSubquery, eq(diagram.id, elementCountSubquery.diagramId))
            .where(
                and(
                    eq(diagram.workspaceId, data.workspaceId),
                    isNull(diagram.deletedAt),
                ),
            );

        return rows;
    });

export const getDiagram = createServerFn({method: "GET"})
    .inputValidator((input: unknown) => getDiagramSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor", "viewer"]);

        const [d] = await db
            .select()
            .from(diagram)
            .where(and(eq(diagram.id, data.id), isNull(diagram.deletedAt)));
        if (!d) throw new Error("Diagram not found");

        const elements = await db
            .select()
            .from(diagramElement)
            .where(eq(diagramElement.diagramId, data.id));

        const connections = await db
            .select()
            .from(diagramConnection)
            .where(eq(diagramConnection.diagramId, data.id));

        return {...d, diagramElements: elements, diagramConnections: connections};
    });

export const getDiagramData = createServerFn({method: "GET"})
    .inputValidator((input: unknown) => getDiagramDataSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor", "viewer"]);

        const [d] = await db
            .select()
            .from(diagram)
            .where(and(eq(diagram.id, data.id), isNull(diagram.deletedAt)));
        if (!d) throw new Error("Diagram not found");

        const elements = await db
            .select({
                id: diagramElement.id,
                diagramId: diagramElement.diagramId,
                elementId: diagramElement.elementId,
                x: diagramElement.x,
                y: diagramElement.y,
                width: diagramElement.width,
                height: diagramElement.height,
                zIndex: diagramElement.zIndex,
                elementName: element.name,
                elementType: element.elementType,
                displayDescription: element.displayDescription,
                status: element.status,
                external: element.external,
                parentElementId: element.parentElementId,
                iconTechnologyId: element.iconTechnologyId,
            })
            .from(diagramElement)
            .leftJoin(element, eq(diagramElement.elementId, element.id))
            .where(
                and(
                    eq(diagramElement.diagramId, data.id),
                    isNull(element.deletedAt),
                ),
            );

        // Auto-inject scope element if missing from diagram_element table
        if (d.scopeElementId) {
            const scopeOnDiagram = elements.some(e => e.elementId === d.scopeElementId);
            if (!scopeOnDiagram) {
                const [scopeEl] = await db
                    .select({
                        name: element.name,
                        elementType: element.elementType,
                        displayDescription: element.displayDescription,
                        status: element.status,
                        external: element.external,
                        parentElementId: element.parentElementId,
                        iconTechnologyId: element.iconTechnologyId,
                    })
                    .from(element)
                    .where(and(eq(element.id, d.scopeElementId), isNull(element.deletedAt)));

                if (scopeEl) {
                    // Compute bounding box from children on this diagram
                    const children = elements.filter(e => e.parentElementId === d.scopeElementId);
                    const PAD = 60;
                    const HEADER = 50;
                    let bounds: { x: number; y: number; width: number; height: number };
                    if (children.length === 0) {
                        bounds = {x: 100, y: 50, width: 600, height: 500};
                    } else {
                        const minX = Math.min(...children.map(c => c.x)) - PAD;
                        const minY = Math.min(...children.map(c => c.y)) - PAD - HEADER;
                        const maxX = Math.max(...children.map(c => c.x + c.width)) + PAD;
                        const maxY = Math.max(...children.map(c => c.y + c.height)) + PAD;
                        bounds = {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
                    }

                    // Persist as diagram_element so it's not re-created on every load
                    const scopeDeId = crypto.randomUUID();
                    await db.insert(diagramElement).values({
                        id: scopeDeId,
                        diagramId: d.id,
                        elementId: d.scopeElementId,
                        x: bounds.x,
                        y: bounds.y,
                        width: bounds.width,
                        height: bounds.height,
                        zIndex: -1,
                    });

                    // Prepend to elements array (parent must come before children)
                    elements.unshift({
                        id: scopeDeId,
                        diagramId: d.id,
                        elementId: d.scopeElementId,
                        x: bounds.x,
                        y: bounds.y,
                        width: bounds.width,
                        height: bounds.height,
                        zIndex: -1,
                        elementName: scopeEl.name,
                        elementType: scopeEl.elementType,
                        displayDescription: scopeEl.displayDescription,
                        status: scopeEl.status,
                        external: scopeEl.external,
                        parentElementId: scopeEl.parentElementId,
                        iconTechnologyId: scopeEl.iconTechnologyId,
                    });
                }
            }
        }

        const connections = await db
            .select({
                id: diagramConnection.id,
                diagramId: diagramConnection.diagramId,
                connectionId: diagramConnection.connectionId,
                pathType: diagramConnection.pathType,
                lineStyle: diagramConnection.lineStyle,
                sourceAnchor: diagramConnection.sourceAnchor,
                targetAnchor: diagramConnection.targetAnchor,
                labelPosition: diagramConnection.labelPosition,
                sourceElementId: connection.sourceElementId,
                targetElementId: connection.targetElementId,
                direction: connection.direction,
                description: connection.description,
                iconTechnologyId: connection.iconTechnologyId,
            })
            .from(diagramConnection)
            .leftJoin(
                connection,
                eq(diagramConnection.connectionId, connection.id),
            )
            .where(
                and(
                    eq(diagramConnection.diagramId, data.id),
                    isNull(connection.deletedAt),
                ),
            );

        const {inArray} = await import("drizzle-orm");

        // Fetch technologies for all elements on this diagram
        const elementIds = elements.map((e) => e.elementId);
        let elementTechMap = new Map<string, string[]>();
        if (elementIds.length > 0) {
            const techs = await db
                .select({
                    elementId: elementTechnology.elementId,
                    name: technology.name,
                    sortOrder: elementTechnology.sortOrder,
                })
                .from(elementTechnology)
                .innerJoin(technology, eq(elementTechnology.technologyId, technology.id))
                .where(inArray(elementTechnology.elementId, elementIds));

            elementTechMap = new Map<string, string[]>();
            for (const t of techs.sort((a, b) => a.sortOrder - b.sortOrder)) {
                const existing = elementTechMap.get(t.elementId) ?? [];
                existing.push(t.name);
                elementTechMap.set(t.elementId, existing);
            }
        }

        // Fetch icon technology slugs for elements
        const elementIconTechIds = [...new Set(elements.map((e) => e.iconTechnologyId).filter(Boolean))] as string[];
        const elementIconTechs = elementIconTechIds.length > 0
            ? await db.select({id: technology.id, iconSlug: technology.iconSlug}).from(technology).where(inArray(technology.id, elementIconTechIds))
            : [];
        const elementIconTechMap = new Map(elementIconTechs.map((t) => [t.id, t.iconSlug]));

        // Fetch technologies for all connections on this diagram
        const connectionIds = connections.map((c) => c.connectionId);
        let connTechMap = new Map<string, string[]>();
        if (connectionIds.length > 0) {
            const connTechs = await db
                .select({
                    connectionId: connectionTechnology.connectionId,
                    name: technology.name,
                    sortOrder: connectionTechnology.sortOrder,
                })
                .from(connectionTechnology)
                .innerJoin(technology, eq(connectionTechnology.technologyId, technology.id))
                .where(inArray(connectionTechnology.connectionId, connectionIds));

            connTechMap = new Map<string, string[]>();
            for (const t of connTechs.sort((a, b) => a.sortOrder - b.sortOrder)) {
                const existing = connTechMap.get(t.connectionId) ?? [];
                existing.push(t.name);
                connTechMap.set(t.connectionId, existing);
            }
        }

        // Fetch icon technology slugs for connections
        const connIconTechIds = [...new Set(connections.map((c) => c.iconTechnologyId).filter(Boolean))] as string[];
        const connIconTechs = connIconTechIds.length > 0
            ? await db.select({id: technology.id, iconSlug: technology.iconSlug}).from(technology).where(inArray(technology.id, connIconTechIds))
            : [];
        const connIconTechMap = new Map(connIconTechs.map((t) => [t.id, t.iconSlug]));

        const elementsWithTech = elements.map((e) => ({
            ...e,
            technologies: elementTechMap.get(e.elementId) ?? [],
            iconTechSlug: e.iconTechnologyId ? (elementIconTechMap.get(e.iconTechnologyId) ?? null) : null,
        }));

        const connectionsWithTech = connections.map((c) => ({
            ...c,
            technologies: connTechMap.get(c.connectionId) ?? [],
            iconTechSlug: c.iconTechnologyId ? (connIconTechMap.get(c.iconTechnologyId) ?? null) : null,
        }));

        return {diagram: d, elements: elementsWithTech, connections: connectionsWithTech};
    });

export const createDiagram = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => createDiagramSchema.parse(input))
    .handler(async ({data}) => {
        const {session, memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        // Inline helper: fetch element type
        async function fetchElementType(elementId: string): Promise<{ type: ElementType; workspaceId: string }> {
            const [el] = await db
                .select({type: element.elementType, workspaceId: element.workspaceId})
                .from(element)
                .where(and(eq(element.id, elementId), isNull(element.deletedAt)));
            if (!el) throw new Error("Element not found");
            return {type: el.type, workspaceId: el.workspaceId};
        }

        if (data.scopeElementId) {
            const scopeEl = await fetchElementType(data.scopeElementId);
            const validation = validateDiagramScope(
                data.diagramType,
                scopeEl.type,
            );
            if (!validation.valid) throw new Error(validation.message);
        } else {
            const validation = validateDiagramScope(
                data.diagramType,
                null,
            );
            if (!validation.valid) throw new Error(validation.message);
        }

        const id = crypto.randomUUID();
        const [created] = await db
            .insert(diagram)
            .values({
                id,
                workspaceId: data.workspaceId,
                name: data.name,
                description: data.description ?? null,
                diagramType: data.diagramType,
                scopeElementId: data.scopeElementId ?? null,
                gridSize: data.gridSize,
                snapToGrid: data.snapToGrid,
                createdBy: session.user.id,
                updatedBy: session.user.id,
            })
            .returning();

        // Auto-add scope element as container on the diagram
        if (data.scopeElementId) {
            await db.insert(diagramElement).values({
                id: crypto.randomUUID(),
                diagramId: id,
                elementId: data.scopeElementId,
                x: 100,
                y: 50,
                width: 600,
                height: 500,
                zIndex: -1,
            });
        }

        return created;
    });

export const updateDiagram = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => updateDiagramSchema.parse(input))
    .handler(async ({data}) => {
        const {session, memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        // Inline helper
        async function fetchElementType(elementId: string): Promise<{ type: ElementType; workspaceId: string }> {
            const [el] = await db
                .select({type: element.elementType, workspaceId: element.workspaceId})
                .from(element)
                .where(and(eq(element.id, elementId), isNull(element.deletedAt)));
            if (!el) throw new Error("Element not found");
            return {type: el.type, workspaceId: el.workspaceId};
        }

        const {id, ...updates} = data;

        const [existing] = await db
            .select()
            .from(diagram)
            .where(and(eq(diagram.id, id), isNull(diagram.deletedAt)));
        if (!existing) throw new Error("Diagram not found");

        if (updates.scopeElementId !== undefined) {
            if (updates.scopeElementId) {
                const scopeEl = await fetchElementType(updates.scopeElementId);
                const validation = validateDiagramScope(
                    existing.diagramType,
                    scopeEl.type,
                );
                if (!validation.valid) throw new Error(validation.message);
            } else {
                const validation = validateDiagramScope(
                    existing.diagramType,
                    null,
                );
                if (!validation.valid) throw new Error(validation.message);
            }
        }

        const [updated] = await db
            .update(diagram)
            .set({...updates, updatedBy: session.user.id})
            .where(eq(diagram.id, id))
            .returning();

        if (!updated) throw new Error("Diagram not found");
        return updated;
    });

export const deleteDiagram = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => deleteDiagramSchema.parse(input))
    .handler(async ({data}) => {
        const {session, memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin"]);

        const [updated] = await db
            .update(diagram)
            .set({deletedAt: new Date(), updatedBy: session.user.id})
            .where(and(eq(diagram.id, data.id), isNull(diagram.deletedAt)))
            .returning();

        if (!updated) throw new Error("Diagram not found");
        return {success: true};
    });

// ── Diagram Element CRUD ─────────────────────────────────────────────

export const addDiagramElement = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => addDiagramElementSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        // Inline helpers
        async function assertDiagramInWorkspace(diagramId: string) {
            const [d] = await db
                .select({
                    id: diagram.id,
                    workspaceId: diagram.workspaceId,
                    diagramType: diagram.diagramType,
                })
                .from(diagram)
                .where(and(eq(diagram.id, diagramId), isNull(diagram.deletedAt)));
            if (!d) throw new Error("Diagram not found");
            return d;
        }

        async function fetchElementType(elementId: string): Promise<{ type: ElementType; workspaceId: string }> {
            const [el] = await db
                .select({type: element.elementType, workspaceId: element.workspaceId})
                .from(element)
                .where(and(eq(element.id, elementId), isNull(element.deletedAt)));
            if (!el) throw new Error("Element not found");
            return {type: el.type, workspaceId: el.workspaceId};
        }

        const d = await assertDiagramInWorkspace(data.diagramId);
        const el = await fetchElementType(data.elementId);

        const validation = validateElementForDiagram(
            d.diagramType,
            el.type,
        );
        if (!validation.valid) throw new Error(validation.message);

        const id = crypto.randomUUID();
        const [created] = await db
            .insert(diagramElement)
            .values({
                id,
                diagramId: data.diagramId,
                elementId: data.elementId,
                x: data.x,
                y: data.y,
                width: data.width,
                height: data.height,
                zIndex: data.zIndex,
                styleJson: data.styleJson ?? null,
            })
            .onConflictDoNothing()
            .returning();

        return created ?? null;
    });

export const updateDiagramElement = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => updateDiagramElementSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        const {id, ...updates} = data;
        const [updated] = await db
            .update(diagramElement)
            .set(updates)
            .where(eq(diagramElement.id, id))
            .returning();

        if (!updated) throw new Error("Diagram element not found");
        return updated;
    });

export const removeDiagramElement = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => removeDiagramElementSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        const [deleted] = await db
            .delete(diagramElement)
            .where(eq(diagramElement.id, data.id))
            .returning();

        if (!deleted) throw new Error("Diagram element not found");
        return {success: true};
    });

// ── Diagram Connection CRUD ─────────────────────────────────────────

export const addDiagramConnection = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => addDiagramConnectionSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        const id = crypto.randomUUID();
        const [created] = await db
            .insert(diagramConnection)
            .values({
                id,
                diagramId: data.diagramId,
                connectionId: data.connectionId,
                pathType: data.pathType,
                lineStyle: data.lineStyle,
                sourceAnchor: data.sourceAnchor,
                targetAnchor: data.targetAnchor,
                labelPosition: data.labelPosition,
                controlPointsJson: data.controlPointsJson ?? null,
                styleJson: data.styleJson ?? null,
            })
            .onConflictDoNothing()
            .returning();

        return created ?? null;
    });

export const updateDiagramConnection = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => updateDiagramConnectionSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        const {id, ...updates} = data;
        const [updated] = await db
            .update(diagramConnection)
            .set(updates)
            .where(eq(diagramConnection.id, id))
            .returning();

        if (!updated) throw new Error("Diagram connection not found");
        return updated;
    });

export const removeDiagramConnection = createServerFn({method: "POST"})
    .inputValidator((input: unknown) => removeDiagramConnectionSchema.parse(input))
    .handler(async ({data}) => {
        const {memberRole} = await getSessionAndOrg();
        assertRole(memberRole, ["owner", "admin", "editor"]);

        const [deleted] = await db
            .delete(diagramConnection)
            .where(eq(diagramConnection.id, data.id))
            .returning();

        if (!deleted) throw new Error("Diagram connection not found");
        return {success: true};
    });
