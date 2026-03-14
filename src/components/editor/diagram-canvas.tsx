import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  SelectionMode,
} from "@xyflow/react";
import type { OnSelectionChangeFunc } from "@xyflow/react";
import { useServerFn } from "@tanstack/react-start";
import { useCallback } from "react";
import { useEditorStore } from "#/stores/editor-store";
import { nodeTypes } from "#/components/editor/nodes";
import { updateDiagramElement, removeDiagramElement } from "#/lib/diagram.functions";
import { removeDiagramRelationship } from "#/lib/diagram.functions";
import { flowNodeToUpdate } from "#/lib/converters/flow-to-diagram";
import type { AppNode, AppEdge } from "#/lib/types/diagram-nodes";

interface DiagramCanvasProps {
  readOnly?: boolean;
}

const NODE_COLOR_MAP: Record<string, string> = {
  person: "#60a5fa",
  system: "#34d399",
  container: "#a78bfa",
  component: "#fb923c",
  group: "#94a3b8",
};

function getNodeColor(node: { type?: string }) {
  return NODE_COLOR_MAP[node.type ?? ""] ?? "#94a3b8";
}

export function DiagramCanvas({ readOnly = false }: DiagramCanvasProps) {
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const onNodesChange = useEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
  const mode = useEditorStore((s) => s.mode);
  const gridSize = useEditorStore((s) => s.gridSize);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const setSelection = useEditorStore((s) => s.setSelection);

  const updateDiagramElementFn = useServerFn(updateDiagramElement);
  const removeDiagramElementFn = useServerFn(removeDiagramElement);
  const removeDiagramRelationshipFn = useServerFn(removeDiagramRelationship);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: AppNode) => {
      const update = flowNodeToUpdate(node);
      updateDiagramElementFn({ data: update });
    },
    [updateDiagramElementFn],
  );

  const onNodesDelete = useCallback(
    (deletedNodes: AppNode[]) => {
      for (const node of deletedNodes) {
        removeDiagramElementFn({ data: { id: node.data.diagramElementId } });
      }
    },
    [removeDiagramElementFn],
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: AppEdge[]) => {
      for (const edge of deletedEdges) {
        if (edge.data) {
          removeDiagramRelationshipFn({
            data: { id: edge.data.diagramRelationshipId },
          });
        }
      }
    },
    [removeDiagramRelationshipFn],
  );

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      setSelection(
        selectedNodes.map((n) => n.id),
        selectedEdges.map((e) => e.id),
      );
    },
    [setSelection],
  );

  const onResizeEnd = useCallback(
    (_event: unknown, { id }: { id: string }) => {
      const node = useEditorStore.getState().nodes.find((n) => n.id === id);
      if (node) {
        const update = flowNodeToUpdate(node);
        updateDiagramElementFn({ data: update });
      }
    },
    [updateDiagramElementFn],
  );

  // Unused for now but keeping the callback reference for future NodeResizer onResizeEnd
  void onResizeEnd;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={readOnly ? undefined : onNodesChange}
      onEdgesChange={readOnly ? undefined : onEdgesChange}
      onNodeDragStop={readOnly ? undefined : onNodeDragStop}
      onNodesDelete={readOnly ? undefined : onNodesDelete}
      onEdgesDelete={readOnly ? undefined : onEdgesDelete}
      onSelectionChange={onSelectionChange}
      colorMode="system"
      snapToGrid={snapToGrid}
      snapGrid={[gridSize, gridSize]}
      fitView
      selectNodesOnDrag={false}
      selectionMode={SelectionMode.Partial}
      panOnDrag={mode === "pan" ? true : [1]}
      selectionOnDrag={mode === "select"}
      deleteKeyCode={readOnly ? null : "Backspace"}
      selectionKeyCode="Shift"
      panActivationKeyCode="Space"
      nodesDraggable={!readOnly}
      nodesConnectable={!readOnly}
      elementsSelectable={!readOnly}
    >
      <Background variant={BackgroundVariant.Dots} gap={gridSize} />
      <Controls showInteractive={false} />
      <MiniMap nodeColor={getNodeColor} zoomable pannable />
    </ReactFlow>
  );
}
