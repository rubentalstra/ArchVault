import { useState, useMemo, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Search, Check, X } from "lucide-react";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible";
import { useEditorStore } from "#/stores/editor-store";
import { getElements } from "#/lib/element.functions";
import { addDiagramElement } from "#/lib/diagram.functions";
import { validateElementForDiagram } from "#/lib/diagram.validators";
import { useDnD, DEFAULT_SIZES } from "#/components/editor/dnd-context";
import { m } from "#/paraglide/messages";
import type { AppNode } from "#/lib/types/diagram-nodes";
import type { ElementType } from "#/lib/element.validators";
import type { DiagramType, DisplayMode } from "#/lib/diagram.validators";

type CreatedDiagramElement = { id: string };

interface WorkspaceElement {
  id: string;
  name: string;
  elementType: ElementType;
  parentElementId: string | null;
  status: string;
  external: boolean;
}

const ELEMENT_TYPE_LABELS: Record<ElementType, () => string> = {
  actor: () => m.element_type_actor(),
  system: () => m.element_type_system(),
  app: () => m.element_type_app(),
  store: () => m.element_type_store(),
  component: () => m.element_type_component(),
};

const ELEMENT_TYPE_ORDER: ElementType[] = ["actor", "system", "app", "store", "component"];

const SUB_FLOW_ELIGIBLE: Record<DiagramType, ElementType[]> = {
  system_context: [],
  container: ["system"],
  component: ["app"],
};

const SUB_FLOW_SIZES: Record<ElementType, { width: number; height: number }> = {
  actor: { width: 160, height: 100 },
  system: { width: 500, height: 400 },
  app: { width: 500, height: 400 },
  store: { width: 180, height: 110 },
  component: { width: 160, height: 100 },
};

export function ElementPickerSidebar() {
  const workspaceId = useEditorStore((s) => s.workspaceId);
  const diagramId = useEditorStore((s) => s.diagramId);
  const diagramType = useEditorStore((s) => s.diagramType);
  const nodes = useEditorStore((s) => s.nodes);
  const addNode = useEditorStore((s) => s.addNode);
  const toggleElementPicker = useEditorStore((s) => s.toggleElementPicker);
  const [search, setSearch] = useState("");
  const reactFlow = useReactFlow();
  const { startDrag } = useDnD();

  const getElementsFn = useServerFn(getElements);
  const addDiagramElementFn = useServerFn(addDiagramElement);

  const { data: elements = [] } = useQuery<WorkspaceElement[]>({
    queryKey: ["elements", workspaceId],
    queryFn: async () =>
      (await getElementsFn({ data: { workspaceId: workspaceId! } })) as WorkspaceElement[],
    enabled: !!workspaceId,
  });

  const onDiagramElementIds = useMemo(
    () => new Set(nodes.map((n) => n.data.elementId)),
    [nodes],
  );

  const groupedElements = useMemo(() => {
    if (!diagramType) return new Map<ElementType, WorkspaceElement[]>();

    const filtered = elements.filter((el) => {
      if (!validateElementForDiagram(diagramType, el.elementType).valid) return false;
      if (search && !el.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    const grouped = new Map<ElementType, WorkspaceElement[]>();
    for (const type of ELEMENT_TYPE_ORDER) {
      const items = filtered.filter((el) => el.elementType === type);
      if (items.length > 0) {
        grouped.set(type, items);
      }
    }
    return grouped;
  }, [elements, diagramType, search]);

  const handleAddElement = useCallback(
    async (el: WorkspaceElement, displayMode: DisplayMode, flowPos?: { x: number; y: number }) => {
      if (!diagramId || !diagramType) return;

      const isSubFlow = displayMode === "sub_flow";
      const size = isSubFlow ? SUB_FLOW_SIZES[el.elementType] : DEFAULT_SIZES[el.elementType];

      // Use provided flow position or fall back to viewport center
      let position: { x: number; y: number };
      if (flowPos) {
        position = flowPos;
      } else {
        const containerEl = document.querySelector(".react-flow");
        const containerWidth = containerEl?.clientWidth ?? 800;
        const containerHeight = containerEl?.clientHeight ?? 600;
        const centerScreen = { x: containerWidth / 2, y: containerHeight / 2 };
        position = reactFlow.screenToFlowPosition(centerScreen);
      }

      try {
        const created = (await addDiagramElementFn({
          data: {
            diagramId,
            elementId: el.id,
            x: position.x - size.width / 2,
            y: position.y - size.height / 2,
            width: size.width,
            height: size.height,
            displayMode,
          },
        })) as CreatedDiagramElement;

        if (!created) return;

        const parentNode = el.parentElementId
          ? nodes.find((n) => n.data.elementId === el.parentElementId && n.data.isSubFlow)
          : null;

        const nodePosition = parentNode
          ? {
              x: position.x - size.width / 2 - parentNode.position.x,
              y: position.y - size.height / 2 - parentNode.position.y,
            }
          : { x: position.x - size.width / 2, y: position.y - size.height / 2 };

        const newNode: AppNode = {
          id: created.id,
          type: el.elementType,
          position: nodePosition,
          ...(isSubFlow ? { style: { width: size.width, height: size.height } } : {}),
          zIndex: isSubFlow ? -1 : 0,
          data: {
            elementId: el.id,
            diagramElementId: created.id,
            name: el.name,
            displayDescription: null,
            status: el.status as "planned" | "live" | "deprecated",
            external: el.external,
            technologies: [],
            iconTechSlug: null,
            isSubFlow,
            deeperDiagrams: [],
          },
          ...(parentNode ? { parentId: parentNode.id, extent: "parent" as const } : {}),
        } as AppNode;

        addNode(newNode);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : m.editor_panel_save_failed());
      }
    },
    [diagramId, diagramType, reactFlow, addDiagramElementFn, addNode, nodes],
  );

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h3 className="text-sm font-semibold">{m.editor_picker_title()}</h3>
        <Button variant="ghost" size="icon-sm" onClick={toggleElementPicker}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={m.editor_picker_search()}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1">
        {groupedElements.size === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            {m.editor_picker_empty()}
          </p>
        ) : (
          Array.from(groupedElements.entries()).map(([type, items]) => (
            <Collapsible key={type} defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-accent">
                {ELEMENT_TYPE_LABELS[type]()}
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {items.map((el) => {
                  const alreadyOnDiagram = onDiagramElementIds.has(el.id);
                  const canBeSubFlow = diagramType
                    ? SUB_FLOW_ELIGIBLE[diagramType].includes(el.elementType)
                    : false;

                  return (
                    <div
                      key={el.id}
                      className={`mx-1 mb-0.5 flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                        alreadyOnDiagram
                          ? "text-muted-foreground opacity-50"
                          : "hover:bg-accent cursor-pointer"
                      }`}
                    >
                      {alreadyOnDiagram ? (
                        <>
                          <Check className="size-3.5 shrink-0" />
                          <span className="truncate">{el.name}</span>
                        </>
                      ) : canBeSubFlow ? (
                        <>
                          <span className="truncate flex-1">{el.name}</span>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleAddElement(el, "normal")}
                            >
                              {m.editor_picker_add_as_card()}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleAddElement(el, "sub_flow")}
                            >
                              {m.editor_picker_add_as_container()}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <button
                          className="flex w-full items-center gap-2 text-left touch-none"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const elName = el.name;
                            startDrag(e, elName, async (flowPos) => {
                              await handleAddElement(el, "normal", flowPos);
                            });
                          }}
                        >
                          <span className="truncate">{el.name}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}
