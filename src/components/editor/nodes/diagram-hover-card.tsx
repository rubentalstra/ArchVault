import { Link, useParams } from "@tanstack/react-router";
import { ZoomIn } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "#/components/ui/hover-card";
import { m } from "#/paraglide/messages";
import type { DiagramType } from "#/lib/diagram.validators";

interface DeeperDiagram {
  id: string;
  name: string;
  diagramType: DiagramType;
}

interface DiagramHoverCardProps {
  diagrams: DeeperDiagram[];
  level: "container" | "component";
}

export function DiagramHoverCard({ diagrams, level }: DiagramHoverCardProps) {
  const { workspaceSlug } = useParams({ strict: false });

  const levelLabel = level === "container"
    ? m.editor_hover_level_2()
    : m.editor_hover_level_3();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          className="absolute left-2 top-2 z-10 rounded-md bg-background/80 p-1 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
          onClick={(e) => e.stopPropagation()}
        >
          <ZoomIn className="size-4 text-primary" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="start" className="w-64">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ZoomIn className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{levelLabel}</span>
          </div>
          <div className="space-y-1">
            {diagrams.map((d) => (
              <Link
                key={d.id}
                to="/workspace/$workspaceSlug/diagram/$diagramId"
                params={{ workspaceSlug, diagramId: d.id }}
                className="block rounded-sm px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
