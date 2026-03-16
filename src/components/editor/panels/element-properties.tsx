import {useCallback, useEffect, useMemo, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useServerFn} from "@tanstack/react-start";
import {toast} from "sonner";
import {useReactFlow} from "@xyflow/react";
import {useEditorStore} from "#/stores/editor-store";
import {getElementById, updateElement, addLink, removeLink} from "#/lib/element.functions";
import {
    getTechnologies,
    addElementTechnology,
    removeElementTechnology,
    setElementIconTechnology
} from "#/lib/technology.functions";
import {getTags, addElementTag, removeElementTag} from "#/lib/tag.functions";
import {Label} from "#/components/ui/label";
import {Textarea} from "#/components/ui/textarea";
import {Badge} from "#/components/ui/badge";
import {Button} from "#/components/ui/button";
import {Input} from "#/components/ui/input";
import {Switch} from "#/components/ui/switch";
import {Separator} from "#/components/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "#/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "#/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {ScrollArea} from "#/components/ui/scroll-area";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "#/components/ui/accordion";
import {TechIcon} from "#/components/technologies/tech-icon";
import {StatusDot} from "#/components/editor/nodes/status-dot";
import {InlineEditable} from "./inline-editable";
import {
    X, Plus, ExternalLink, BookOpen, History, Tag, Check,
    Box, Package, Cpu, Database, User, ChevronRight,
    MoreHorizontal, ImageIcon, Trash2,
} from "lucide-react";
import {m} from "#/paraglide/messages";
import {ElementConnections} from "./element-connections";
import type {ElementStatus} from "#/lib/element.validators";
import type {AppNode} from "#/lib/types/diagram-nodes";

interface ElementDetails {
    id: string;
    parentElementId: string | null;
    description: string | null;
    iconTechnologyId: string | null;
    technologies: { technologyId: string; name: string; iconSlug: string | null }[];
    links: { id: string; url: string; label: string | null }[];
    tags?: { tagId: string }[];
}

const STATUS_OPTIONS: { value: ElementStatus; label: () => string }[] = [
    {value: "planned", label: () => m.element_status_planned()},
    {value: "live", label: () => m.element_status_live()},
    {value: "deprecated", label: () => m.element_status_deprecated()},
];

function getNodeTypeIcon(type: string | undefined, className = "size-10 shrink-0 text-foreground") {
    switch (type) {
        case "system":
            return <Box className={className}/>;
        case "app":
            return <Package className={className}/>;
        case "component":
            return <Cpu className={className}/>;
        case "store":
            return <Database className={className}/>;
        case "actor":
            return <User className={className}/>;
        default:
            return <Box className={className}/>;
    }
}

const ELEMENT_TYPE_LABELS: Record<string, () => string> = {
    actor: () => m.element_type_actor(),
    system: () => m.element_type_system(),
    app: () => m.element_type_app(),
    store: () => m.element_type_store(),
    component: () => m.element_type_component(),
};

export function ElementProperties({node}: { node: AppNode }) {
    const workspaceId = useEditorStore((s) => s.workspaceId);
    const updateNodeData = useEditorStore((s) => s.updateNodeData);
    const queryClient = useQueryClient();

    const getElementByIdFn = useServerFn(getElementById);
    const updateElementFn = useServerFn(updateElement);

    const {data: element} = useQuery<ElementDetails>({
        queryKey: ["element", node.data.elementId],
        queryFn: async () => (await getElementByIdFn({data: {id: node.data.elementId}})) as ElementDetails,
    });

    const [description, setDescription] = useState("");

    useEffect(() => {
        if (element) {
            setDescription(element.description ?? "");
        }
    }, [element]);

    const saveField = useCallback(
        async (field: string, value: unknown) => {
            try {
                await updateElementFn({
                    data: {id: node.data.elementId, [field]: value},
                });
                void queryClient.invalidateQueries({queryKey: ["element", node.data.elementId]});
            } catch {
                toast.error(m.editor_panel_save_failed());
            }
        },
        [node.data.elementId, updateElementFn, queryClient],
    );

    const handleNameSave = useCallback(
        async (value: string) => {
            await saveField("name", value);
            updateNodeData(node.id, {name: value});
        },
        [node.id, saveField, updateNodeData],
    );

    const handleDisplayDescriptionSave = useCallback(
        async (value: string) => {
            await saveField("displayDescription", value || null);
            updateNodeData(node.id, {displayDescription: value || null});
        },
        [node.id, saveField, updateNodeData],
    );

    const handleDescriptionBlur = useCallback(async () => {
        if (!element || description === (element.description ?? "")) return;
        await saveField("description", description || null);
    }, [description, element, saveField]);

    const handleExternalChange = useCallback(
        async (external: boolean) => {
            await saveField("external", external);
            updateNodeData(node.id, {external});
        },
        [node.id, saveField, updateNodeData],
    );

    const handleStatusChange = useCallback(
        (status: string | null) => {
            if (!status) return;
            void saveField("status", status);
            updateNodeData(node.id, {status: status as ElementStatus});
        },
        [node.id, saveField, updateNodeData],
    );

    return (
        <div className="flex h-full flex-col">
            {/* Header: Icon + Name */}
            <div className="flex items-start gap-3 px-4 pt-4 pb-1">
                {node.type !== "actor" && (
                    <div className="shrink-0 rounded-lg border bg-muted/50 p-1.5">
                        {node.data.iconTechSlug ? (
                            <TechIcon
                                slug={node.data.iconTechSlug}
                                className="size-10"
                                fallback={getNodeTypeIcon(node.type)}
                            />
                        ) : (
                            getNodeTypeIcon(node.type)
                        )}
                    </div>
                )}
                <div className="min-w-0 flex-1 pt-1">
                    <InlineEditable
                        value={node.data.name}
                        onSave={handleNameSave}
                        placeholder={m.element_placeholder_name()}
                        textClassName="font-semibold text-base"
                    />
                </div>
            </div>

            {/* Display description */}
            <div className="px-4 pb-2">
                <InlineEditable
                    value={node.data.displayDescription ?? ""}
                    onSave={handleDisplayDescriptionSave}
                    placeholder={m.element_placeholder_display_description()}
                    multiline
                    maxLength={120}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="flex flex-1 flex-col">
                <TabsList className="mx-4 grid w-auto grid-cols-2">
                    <TabsTrigger value="details">{m.editor_panel_element_details()}</TabsTrigger>
                    <TabsTrigger value="connections">{m.editor_panel_element_connections()}</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                        {/* Property rows */}
                        <PropertyRow label={m.element_label_type()}>
                            <Badge variant="outline">{node.type}</Badge>
                        </PropertyRow>

                        <PropertyRow label={m.element_label_external()}>
                            <Switch
                                checked={node.data.external}
                                onCheckedChange={handleExternalChange}
                            />
                        </PropertyRow>

                        <PropertyRow label={m.element_label_status()}>
                            <Select value={node.data.status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-7 w-auto border-none bg-transparent shadow-none">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <StatusDot status={opt.value}/>
                                                {opt.label()}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </PropertyRow>

                        {element?.parentElementId && (
                            <ParentElementCard parentElementId={element.parentElementId}/>
                        )}

                        <Separator/>

                        {/* Technologies */}
                        {element && (
                            <>
                                <TechnologiesSection
                                    elementId={element.id}
                                    workspaceId={workspaceId}
                                    technologies={element.technologies}
                                    iconTechnologyId={element.iconTechnologyId}
                                    nodeId={node.id}
                                    updateNodeData={updateNodeData}
                                />
                                <Separator/>
                                <TagsSection elementId={element.id} workspaceId={workspaceId}/>
                                <Separator/>
                                <LinksSection elementId={element.id} links={element.links}/>
                                <Separator/>
                            </>
                        )}

                        {/* Full description */}
                        <div className="space-y-2 p-4">
                            <Label className="text-xs text-muted-foreground">
                                {m.element_label_description()}
                            </Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={handleDescriptionBlur}
                                rows={4}
                                placeholder={m.element_placeholder_description()}
                            />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="connections" className="flex-1 overflow-y-auto">
                    <ElementConnections elementId={node.data.elementId}/>
                </TabsContent>
            </Tabs>
        </div>
    );
}

/* ── Property Row ─────────────────────────────────────────────────── */

function PropertyRow({
                         label,
                         children,
                     }: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-10 items-center gap-2 px-4 py-1.5">
            <span className="w-24 shrink-0 text-sm text-muted-foreground">{label}</span>
            <div className="flex min-w-0 flex-1 items-center">{children}</div>
        </div>
    );
}

/* ── Parent Element Card ──────────────────────────────────────────── */

function ParentElementCard({parentElementId}: { parentElementId: string }) {
    const nodes = useEditorStore((s) => s.nodes);
    const setSelection = useEditorStore((s) => s.setSelection);
    const reactFlow = useReactFlow();

    const parentNode = nodes.find((n) => n.data.elementId === parentElementId);
    if (!parentNode) return null;

    const handleClick = () => {
        setSelection([parentNode.id], []);
        void reactFlow.fitView({nodes: [{id: parentNode.id}], duration: 300, padding: 0.5});
    };

    return (
        <div className="px-4 py-1.5">
            <span className="mb-1.5 block text-xs text-muted-foreground">
                {m.element_label_parent()}
            </span>
            <button
                onClick={handleClick}
                className="flex w-full items-center gap-3 rounded-lg border bg-muted/30 p-2.5 text-left transition-colors hover:bg-accent"
            >
                <div className="shrink-0 rounded-md border bg-background p-1.5">
                    {parentNode.data.iconTechSlug ? (
                        <TechIcon
                            slug={parentNode.data.iconTechSlug}
                            className="size-5"
                            fallback={getNodeTypeIcon(parentNode.type, "size-5 shrink-0 text-muted-foreground")}
                        />
                    ) : (
                        getNodeTypeIcon(parentNode.type, "size-5 shrink-0 text-muted-foreground")
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{parentNode.data.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {ELEMENT_TYPE_LABELS[parentNode.type]?.() ?? parentNode.type}
                    </span>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground"/>
            </button>
        </div>
    );
}

/* ── Technologies Section ─────────────────────────────────────────── */

function TechnologiesSection({
                                 elementId,
                                 workspaceId,
                                 technologies,
                                 iconTechnologyId,
                                 nodeId,
                                 updateNodeData,
                             }: {
    elementId: string;
    workspaceId: string | null;
    technologies: { technologyId: string; name: string; iconSlug: string | null }[];
    iconTechnologyId: string | null;
    nodeId: string;
    updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
}) {
    const queryClient = useQueryClient();
    const getTechnologiesFn = useServerFn(getTechnologies);
    const addElementTechnologyFn = useServerFn(addElementTechnology);
    const removeElementTechnologyFn = useServerFn(removeElementTechnology);
    const setElementIconTechnologyFn = useServerFn(setElementIconTechnology);

    const {data: allTechs} = useQuery({
        queryKey: ["technologies", workspaceId],
        queryFn: () => getTechnologiesFn({data: {workspaceId: workspaceId!}}),
        enabled: !!workspaceId,
    });

    const assignedIds = new Set(technologies.map((t) => t.technologyId));

    const handleToggle = useCallback(
        async (technologyId: string) => {
            try {
                if (assignedIds.has(technologyId)) {
                    // Clear icon first if removing the icon technology
                    if (iconTechnologyId === technologyId) {
                        await setElementIconTechnologyFn({data: {elementId, technologyId: null}});
                        updateNodeData(nodeId, {iconTechSlug: null});
                    }
                    await removeElementTechnologyFn({data: {elementId, technologyId}});
                    const updatedTechs = technologies.filter((t) => t.technologyId !== technologyId).map((t) => t.name);
                    updateNodeData(nodeId, {technologies: updatedTechs});
                } else {
                    await addElementTechnologyFn({data: {elementId, technologyId}});
                    const addedTech = allTechs?.find((t) => t.id === technologyId);
                    if (addedTech) {
                        const updatedTechs = [...technologies.map((t) => t.name), addedTech.name];
                        updateNodeData(nodeId, {technologies: updatedTechs});
                    }
                }
                void queryClient.invalidateQueries({queryKey: ["element", elementId]});
            } catch {
                toast.error(m.editor_panel_save_failed());
            }
        },
        [elementId, assignedIds, addElementTechnologyFn, removeElementTechnologyFn, setElementIconTechnologyFn, queryClient, technologies, nodeId, updateNodeData, allTechs, iconTechnologyId],
    );

    const handleSetIcon = useCallback(
        async (technologyId: string | null) => {
            try {
                await setElementIconTechnologyFn({data: {elementId, technologyId}});
                // Update canvas node icon
                const tech = technologyId ? technologies.find((t) => t.technologyId === technologyId) : null;
                updateNodeData(nodeId, {iconTechSlug: tech?.iconSlug ?? null});
                void queryClient.invalidateQueries({queryKey: ["element", elementId]});
            } catch {
                toast.error(m.editor_panel_save_failed());
            }
        },
        [elementId, setElementIconTechnologyFn, queryClient, technologies, nodeId, updateNodeData],
    );

    return (
        <div className="py-2">
            <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-xs text-muted-foreground">
          {m.element_label_technologies()}
        </span>
            </div>

            <div className="space-y-2 px-4">
                {technologies.length > 0 && (
                    <Accordion className="rounded-lg border bg-muted/20">
                        {technologies.map((tech) => {
                            const full = allTechs?.find((t) => t.id === tech.technologyId);
                            return (
                                <AccordionItem key={tech.technologyId} value={tech.technologyId}
                                               className="border-b last:border-b-0">
                                    <AccordionTrigger className="gap-2 px-3 py-2 hover:no-underline">
                                        {tech.iconSlug && (
                                            <TechIcon slug={tech.iconSlug} className="size-4 shrink-0"/>
                                        )}
                                        <span className="min-w-0 flex-1 truncate text-sm">{tech.name}</span>
                                        {iconTechnologyId === tech.technologyId && (
                                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                                                {m.technology_icon_label()}
                                            </Badge>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger render={
                                                <button
                                                    type="button"
                                                    className="shrink-0 rounded-sm p-1 hover:bg-muted"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="size-3.5"/>
                                                </button>
                                            }/>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() =>
                                                    void handleSetIcon(
                                                        iconTechnologyId === tech.technologyId ? null : tech.technologyId,
                                                    )
                                                }>
                                                    <ImageIcon className="mr-2 size-4"/>
                                                    {iconTechnologyId === tech.technologyId ? m.technology_clear_icon() : m.technology_set_as_icon()}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => void handleToggle(tech.technologyId)}>
                                                    <Trash2 className="mr-2 size-4"/>
                                                    {m.common_remove()}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-3">
                                        <div className="flex flex-col gap-1.5">
                                            {(full?.website || full?.docsUrl || full?.updatesUrl) && (
                                                <div className="-ml-1 flex flex-wrap items-center gap-1">
                                                    {full.website && (
                                                        <a href={full.website} target="_blank"
                                                           rel="noopener noreferrer">
                                                            <Button variant="ghost" size="sm"
                                                                    className="h-6 gap-1 px-2 text-xs">
                                                                <ExternalLink
                                                                    className="size-3"/> {m.technology_label_website()}
                                                            </Button>
                                                        </a>
                                                    )}
                                                    {full.docsUrl && (
                                                        <a href={full.docsUrl} target="_blank"
                                                           rel="noopener noreferrer">
                                                            <Button variant="ghost" size="sm"
                                                                    className="h-6 gap-1 px-2 text-xs">
                                                                <BookOpen
                                                                    className="size-3"/> {m.technology_label_docs_url()}
                                                            </Button>
                                                        </a>
                                                    )}
                                                    {full.updatesUrl && (
                                                        <a href={full.updatesUrl} target="_blank"
                                                           rel="noopener noreferrer">
                                                            <Button variant="ghost" size="sm"
                                                                    className="h-6 gap-1 px-2 text-xs">
                                                                <History
                                                                    className="size-3"/> {m.technology_label_updates_url()}
                                                            </Button>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {full?.description && (
                                                <p className="text-xs leading-snug text-muted-foreground">{full.description}</p>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}

                <Popover>
                    <PopoverTrigger render={
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                            <Plus className="size-3.5"/>
                            {m.technology_picker_title()}
                        </Button>
                    }/>
                    <PopoverContent className="w-56 p-0" align="start">
                        <ScrollArea className="max-h-48">
                            <div className="p-1">
                                {allTechs?.map((tech) => (
                                    <button
                                        key={tech.id}
                                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                        onClick={() => handleToggle(tech.id)}
                                    >
                                        {tech.iconSlug && (
                                            <TechIcon slug={tech.iconSlug} className="size-4 shrink-0"/>
                                        )}
                                        <span
                                            className={`flex size-4 items-center justify-center rounded-sm border ${assignedIds.has(tech.id) ? "border-primary bg-primary text-primary-foreground" : ""}`}
                                        >
                      {assignedIds.has(tech.id) && <Check className="size-3"/>}
                    </span>
                                        <span className="flex-1 text-left">{tech.name}</span>
                                    </button>
                                ))}
                                {(!allTechs || allTechs.length === 0) && (
                                    <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                                        {m.technology_picker_empty()}
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

/* ── Tags Section ─────────────────────────────────────────────────── */

function TagsSection({
                         elementId,
                         workspaceId,
                     }: {
    elementId: string;
    workspaceId: string | null;
}) {
    const queryClient = useQueryClient();
    const getTagsFn = useServerFn(getTags);
    const addElementTagFn = useServerFn(addElementTag);
    const removeElementTagFn = useServerFn(removeElementTag);
    const getElementByIdFn = useServerFn(getElementById);

    const {data: allTags} = useQuery({
        queryKey: ["tags", workspaceId],
        queryFn: () => getTagsFn({data: {workspaceId: workspaceId!}}),
        enabled: !!workspaceId,
    });

    const {data: element} = useQuery({
        queryKey: ["element", elementId],
        queryFn: () => getElementByIdFn({data: {id: elementId}}),
    });

    const elementTagIds = useMemo(
        () =>
            new Set(
                (element as { tags?: { tagId: string }[] })?.tags?.map((t) => t.tagId) ?? [],
            ),
        [element],
    );

    const handleToggleTag = useCallback(
        async (tagId: string) => {
            try {
                if (elementTagIds.has(tagId)) {
                    await removeElementTagFn({data: {elementId, tagId}});
                } else {
                    await addElementTagFn({data: {elementId, tagId}});
                }
                void queryClient.invalidateQueries({queryKey: ["element", elementId]});
            } catch {
                toast.error(m.editor_panel_save_failed());
            }
        },
        [elementId, elementTagIds, addElementTagFn, removeElementTagFn, queryClient],
    );

    if (!allTags?.length) return null;

    return (
        <div className="py-2">
            <div className="px-4 py-1.5">
                <span className="text-xs text-muted-foreground">{m.tag_picker_title()}</span>
            </div>
            <div className="px-4">
                <Popover>
                    <PopoverTrigger render={
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                            <Tag className="size-3.5"/>
                            {m.tag_picker_title()}
                        </Button>
                    }/>
                    <PopoverContent className="w-56 p-0" align="start">
                        <ScrollArea className="max-h-48">
                            <div className="p-1">
                                {allTags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                        onClick={() => void handleToggleTag(tag.id)}
                                    >
                                        <div
                                            className="size-3 rounded-full"
                                            style={{backgroundColor: tag.color ?? undefined}}
                                        />
                                        <span className="flex-1 text-left">{tag.name}</span>
                                        {elementTagIds.has(tag.id) && (
                                            <span className="text-xs text-primary">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

/* ── Links Section ────────────────────────────────────────────────── */

function LinksSection({
                          elementId,
                          links,
                      }: {
    elementId: string;
    links: { id: string; url: string; label: string | null }[];
}) {
    const [newUrl, setNewUrl] = useState("");
    const queryClient = useQueryClient();
    const addLinkFn = useServerFn(addLink);
    const removeLinkFn = useServerFn(removeLink);

    const handleAdd = useCallback(async () => {
        if (!newUrl.trim()) return;
        try {
            await addLinkFn({data: {elementId, url: newUrl.trim()}});
            void queryClient.invalidateQueries({queryKey: ["element", elementId]});
            setNewUrl("");
        } catch {
            toast.error(m.editor_panel_save_failed());
        }
    }, [newUrl, elementId, addLinkFn, queryClient]);

    const handleRemove = useCallback(
        async (id: string) => {
            try {
                await removeLinkFn({data: {id}});
                void queryClient.invalidateQueries({queryKey: ["element", elementId]});
            } catch {
                toast.error(m.editor_panel_save_failed());
            }
        },
        [elementId, removeLinkFn, queryClient],
    );

    return (
        <div className="py-2">
            <div className="px-4 py-1.5">
                <span className="text-xs text-muted-foreground">{m.element_label_links()}</span>
            </div>
            <div className="space-y-1 px-4">
                {links.map((link) => (
                    <div key={link.id} className="flex items-center gap-1 text-sm">
                        <ExternalLink className="size-3 shrink-0 text-muted-foreground"/>
                        <span className="min-w-0 flex-1 truncate">{link.label || link.url}</span>
                        <button
                            onClick={() => handleRemove(link.id)}
                            className="shrink-0 rounded-sm p-0.5 hover:bg-muted"
                        >
                            <X className="size-3"/>
                        </button>
                    </div>
                ))}
                <div className="flex gap-1">
                    <Input
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder={m.element_link_placeholder_url()}
                        className="h-8 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <Button size="sm" variant="outline" onClick={handleAdd} className="h-8 shrink-0">
                        <Plus className="size-3"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
