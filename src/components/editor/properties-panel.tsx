import { useEditorStore } from "#/stores/editor-store";
import { ScrollArea } from "#/components/ui/scroll-area";
import { DiagramSettings } from "./panels/diagram-settings";
import { ElementProperties } from "./panels/element-properties";
import { RelationshipProperties } from "./panels/relationship-properties";
import { MultiSelectPanel } from "./panels/multi-select-panel";

interface PropertiesPanelProps {
  diagramName: string;
  diagramDescription: string | null;
}

export function PropertiesPanel({ diagramName, diagramDescription }: PropertiesPanelProps) {
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useEditorStore((s) => s.selectedEdgeIds);
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);

  const totalSelected = selectedNodeIds.length + selectedEdgeIds.length;

  // Multi-select: more than 1 node
  if (selectedNodeIds.length > 1) {
    return (
      <ScrollArea className="h-full">
        <MultiSelectPanel />
      </ScrollArea>
    );
  }

  // Single node selected
  if (selectedNodeIds.length === 1) {
    const node = nodes.find((n) => n.id === selectedNodeIds[0]);
    if (node) {
      return (
        <ScrollArea className="h-full">
          <ElementProperties key={node.id} node={node} />
        </ScrollArea>
      );
    }
  }

  // Single edge selected
  if (selectedEdgeIds.length === 1 && selectedNodeIds.length === 0) {
    const edge = edges.find((e) => e.id === selectedEdgeIds[0]);
    if (edge?.data) {
      return (
        <ScrollArea className="h-full">
          <RelationshipProperties key={edge.id} edge={edge} />
        </ScrollArea>
      );
    }
  }

  // Nothing selected → diagram settings
  if (totalSelected === 0) {
    return (
      <ScrollArea className="h-full">
        <DiagramSettings
          diagramName={diagramName}
          diagramDescription={diagramDescription}
        />
      </ScrollArea>
    );
  }

  return null;
}
