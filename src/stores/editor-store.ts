import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import type { NodeChange, EdgeChange } from "@xyflow/react";
import type { AppNode, AppEdge } from "#/lib/types/diagram-nodes";

interface EditorState {
  nodes: AppNode[];
  edges: AppEdge[];
  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => void;
  mode: "select" | "pan";
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  diagramId: string | null;
  gridSize: number;
  snapToGrid: boolean;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: AppEdge[]) => void;
  setMode: (mode: "select" | "pan") => void;
  setSelection: (nodeIds: string[], edgeIds: string[]) => void;
  initDiagram: (params: {
    diagramId: string;
    nodes: AppNode[];
    edges: AppEdge[];
    gridSize: number;
    snapToGrid: boolean;
  }) => void;
  reset: () => void;
}

const initialState = {
  nodes: [] as AppNode[],
  edges: [] as AppEdge[],
  mode: "select" as const,
  selectedNodeIds: [] as string[],
  selectedEdgeIds: [] as string[],
  diagramId: null as string | null,
  gridSize: 20,
  snapToGrid: true,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setMode: (mode) => set({ mode }),
  setSelection: (nodeIds, edgeIds) =>
    set({ selectedNodeIds: nodeIds, selectedEdgeIds: edgeIds }),
  initDiagram: ({ diagramId, nodes, edges, gridSize, snapToGrid }) =>
    set({ diagramId, nodes, edges, gridSize, snapToGrid }),
  reset: () => set(initialState),
}));
