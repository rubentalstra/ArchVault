import type { AppNode } from "#/lib/types/diagram-nodes";

export function flowNodeToUpdate(node: AppNode) {
  return {
    id: node.data.diagramElementId,
    x: node.position.x,
    y: node.position.y,
    width: node.style?.width ? Number(node.style.width) : undefined,
    height: node.style?.height ? Number(node.style.height) : undefined,
    zIndex: node.zIndex,
  };
}
