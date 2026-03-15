import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useEditorStore } from "#/stores/editor-store";
import { createElement } from "#/lib/element.functions";
import { addDiagramElement } from "#/lib/diagram.functions";
import { m } from "#/paraglide/messages";
import type { AppNode } from "#/lib/types/diagram-nodes";
import type { ElementType } from "#/lib/element.validators";
import type { ElementStatus } from "#/lib/element.validators";

type CreatedElement = { id: string; name: string; status: ElementStatus; external: boolean };
type CreatedDiagramElement = { id: string };

/** MIME type used for drag-and-drop data transfer */
export const DND_ELEMENT_TYPE = "application/archvault-element-type";

const DEFAULT_SIZES: Record<ElementType, { width: number; height: number }> = {
  actor: { width: 160, height: 100 },
  group: { width: 320, height: 220 },
  system: { width: 200, height: 120 },
  app: { width: 180, height: 110 },
  store: { width: 180, height: 110 },
  component: { width: 160, height: 100 },
};

const NEW_ELEMENT_NAMES: Record<ElementType, () => string> = {
  actor: () => m.editor_new_actor(),
  group: () => m.editor_new_system(),
  system: () => m.editor_new_system(),
  app: () => m.editor_new_app(),
  store: () => m.editor_new_store(),
  component: () => m.editor_new_component(),
};

/** Detect if a flow position lands inside a sub-flow container node */
function findSubFlowParent(
  flowPos: { x: number; y: number },
  nodes: AppNode[],
): AppNode | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (!node.data.isSubFlow) continue;

    const nodeWidth = Number(node.style?.width ?? 0);
    const nodeHeight = Number(node.style?.height ?? 0);
    if (nodeWidth === 0 || nodeHeight === 0) continue;

    if (
      flowPos.x >= node.position.x &&
      flowPos.x <= node.position.x + nodeWidth &&
      flowPos.y >= node.position.y &&
      flowPos.y <= node.position.y + nodeHeight
    ) {
      return node;
    }
  }
  return null;
}

/**
 * Hook that provides onDragOver + onDrop handlers for the React Flow canvas.
 * Draggable items set `dataTransfer` with `DND_ELEMENT_TYPE` as the key.
 */
export function useDropElement() {
  const addNode = useEditorStore((s) => s.addNode);
  const setSelection = useEditorStore((s) => s.setSelection);
  const reactFlow = useReactFlow();

  const createElementFn = useServerFn(createElement);
  const addDiagramElementFn = useServerFn(addDiagramElement);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      const elementType = event.dataTransfer.getData(DND_ELEMENT_TYPE) as ElementType | "";
      if (!elementType) return;

      const store = useEditorStore.getState();
      if (!store.workspaceId || !store.diagramId) return;

      const flowPos = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Detect if dropping inside a sub-flow container
      const parentNode = findSubFlowParent(flowPos, store.nodes);
      const parentElementId = parentNode ? parentNode.data.elementId : null;

      const size = DEFAULT_SIZES[elementType];

      try {
        const newElement = (await createElementFn({
          data: {
            workspaceId: store.workspaceId,
            elementType,
            name: NEW_ELEMENT_NAMES[elementType](),
            ...(parentElementId ? { parentElementId } : {}),
          },
        })) as CreatedElement;

        const diagramElement = (await addDiagramElementFn({
          data: {
            diagramId: store.diagramId,
            elementId: newElement.id,
            x: flowPos.x,
            y: flowPos.y,
            width: size.width,
            height: size.height,
          },
        })) as CreatedDiagramElement;

        // Compute position (parent-relative if inside sub-flow)
        const position = parentNode
          ? { x: flowPos.x - parentNode.position.x, y: flowPos.y - parentNode.position.y }
          : { x: flowPos.x, y: flowPos.y };

        const isResizable = elementType === "group";

        const newNode: AppNode = {
          id: diagramElement.id,
          type: elementType,
          position,
          ...(isResizable ? { style: { width: size.width, height: size.height } } : {}),
          zIndex: 0,
          data: {
            elementId: newElement.id,
            diagramElementId: diagramElement.id,
            name: newElement.name,
            displayDescription: null,
            status: newElement.status,
            external: newElement.external,
            technologies: [],
            iconTechSlug: null,
            isSubFlow: false,
            deeperDiagrams: [],
          },
          ...(parentNode ? { parentId: parentNode.id, extent: "parent" as const } : {}),
        } as unknown as AppNode;

        addNode(newNode);
        setSelection([newNode.id], []);
      } catch {
        toast.error(m.editor_panel_save_failed());
      }
    },
    [reactFlow, createElementFn, addDiagramElementFn, addNode, setSelection],
  );

  return { onDragOver, onDrop };
}
