import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEditorStore } from "#/stores/editor-store";
import { getConnections } from "#/lib/connection.functions";
import { ArrowRight, ArrowLeft, ArrowLeftRight, Minus } from "lucide-react";
import { m } from "#/paraglide/messages";
import type { ConnectionDirection } from "#/lib/connection.validators";

const DIRECTION_ICONS: Record<ConnectionDirection, React.ReactNode> = {
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

  const getConnectionsFn = useServerFn(getConnections);

  const { data: connections } = useQuery({
    queryKey: ["connections", workspaceId],
    queryFn: () => getConnectionsFn({ data: { workspaceId: workspaceId! } }),
    enabled: !!workspaceId,
  });

  const elementConnections = connections?.filter(
    (r) => r.sourceElementId === elementId || r.targetElementId === elementId,
  );

  if (!elementConnections?.length) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {m.editor_panel_no_connections()}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-4">
      {elementConnections.map((rel) => {
        const isSource = rel.sourceElementId === elementId;
        const otherElementId = isSource ? rel.targetElementId : rel.sourceElementId;
        const otherNode = nodes.find((n) => n.data.elementId === otherElementId);
        const otherName = otherNode?.data.name ?? "Unknown";
        const edge = edges.find((e) => e.data?.connectionId === rel.id);

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
            {DIRECTION_ICONS[rel.direction]}
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
