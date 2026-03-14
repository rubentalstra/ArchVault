import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEditorStore } from "#/stores/editor-store";
import { getRelationships } from "#/lib/relationship.functions";
import { ArrowRight, ArrowLeft, ArrowLeftRight, Minus } from "lucide-react";
import { m } from "#/paraglide/messages";
import type { RelationshipDirection } from "#/lib/relationship.validators";

const DIRECTION_ICONS: Record<RelationshipDirection, React.ReactNode> = {
  outgoing: <ArrowRight className="size-4 shrink-0 text-muted-foreground" />,
  incoming: <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />,
  bidirectional: <ArrowLeftRight className="size-4 shrink-0 text-muted-foreground" />,
  none: <Minus className="size-4 shrink-0 text-muted-foreground" />,
};

export function ElementConnections({ elementId }: { elementId: string }) {
  const workspaceId = useEditorStore((s) => s.workspaceId);
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const setSelection = useEditorStore((s) => s.setSelection);

  const getRelationshipsFn = useServerFn(getRelationships);

  const { data: relationships } = useQuery({
    queryKey: ["relationships", workspaceId],
    queryFn: () => getRelationshipsFn({ data: { workspaceId: workspaceId! } }),
    enabled: !!workspaceId,
  });

  const elementRelationships = relationships?.filter(
    (r) => r.sourceElementId === elementId || r.targetElementId === elementId,
  );

  if (!elementRelationships?.length) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {m.editor_panel_no_connections()}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-4">
      {elementRelationships.map((rel) => {
        const isSource = rel.sourceElementId === elementId;
        const otherElementId = isSource ? rel.targetElementId : rel.sourceElementId;
        const otherNode = nodes.find((n) => n.data.elementId === otherElementId);
        const otherName = otherNode?.data.name ?? "Unknown";
        const edge = edges.find((e) => e.data?.relationshipId === rel.id);

        return (
          <button
            key={rel.id}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => {
              if (edge) {
                setSelection([], [edge.id]);
              }
            }}
          >
            {DIRECTION_ICONS[rel.direction as RelationshipDirection]}
            <span className="min-w-0 flex-1 truncate">{otherName}</span>
            {rel.description && (
              <span className="truncate text-xs text-muted-foreground">
                {rel.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
