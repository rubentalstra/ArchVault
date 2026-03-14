import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { authClient } from "#/lib/auth-client";
import { getDiagramData } from "#/lib/diagram.functions";
import { useEditorStore } from "#/stores/editor-store";
import {
  toFlowNodes,
  toFlowEdges,
  buildElementIdToNodeIdMap,
} from "#/lib/converters/diagram-to-flow";
import { DiagramCanvas } from "#/components/editor/diagram-canvas";
import { Button } from "#/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { Separator } from "#/components/ui/separator";
import { SidebarTrigger } from "#/components/ui/sidebar";
import { Toggle } from "#/components/ui/toggle";
import { Badge } from "#/components/ui/badge";
import { MousePointer2, Hand } from "lucide-react";
import { m } from "#/paraglide/messages";
import type { DiagramType } from "#/lib/diagram.validators";

export const Route = createFileRoute(
  "/_protected/_onboarded/workspace/$workspaceSlug/diagram/$diagramId",
)({
  beforeLoad: async ({ params }) => {
    const diagramData = await getDiagramData({
      data: { id: params.diagramId },
    });
    return { diagramData };
  },
  component: DiagramEditorPage,
});

function DiagramEditorPage() {
  const { workspace, diagramData } = Route.useRouteContext();
  const { data: activeMember } = authClient.useActiveMember();
  const initDiagram = useEditorStore((s) => s.initDiagram);
  const reset = useEditorStore((s) => s.reset);
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);

  const memberRole = activeMember?.role;
  const readOnly = !["owner", "admin", "editor"].includes(memberRole ?? "");

  useEffect(() => {
    const nodes = toFlowNodes(
      diagramData.elements,
      diagramData.diagram.diagramType as DiagramType,
      diagramData.diagram.scopeElementId,
    );
    const elementIdToNodeId = buildElementIdToNodeIdMap(diagramData.elements);
    const edges = toFlowEdges(diagramData.relationships, elementIdToNodeId);

    initDiagram({
      diagramId: diagramData.diagram.id,
      nodes,
      edges,
      gridSize: diagramData.diagram.gridSize,
      snapToGrid: diagramData.diagram.snapToGrid,
    });

    return () => {
      reset();
    };
  }, [diagramData, initDiagram, reset]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex flex-1 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  render={
                    <Link
                      to="/workspace/$workspaceSlug"
                      params={{ workspaceSlug: workspace.slug }}
                    />
                  }
                >
                  {workspace.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  render={
                    <Link
                      to="/workspace/$workspaceSlug/diagrams"
                      params={{ workspaceSlug: workspace.slug }}
                    />
                  }
                >
                  {m.diagram_nav_title()}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{diagramData.diagram.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-2">
            {readOnly && (
              <Badge variant="secondary">{m.canvas_readonly()}</Badge>
            )}
            {!readOnly && (
              <div className="flex items-center gap-1 rounded-lg border bg-card p-0.5">
                <Toggle
                  size="sm"
                  pressed={mode === "select"}
                  onPressedChange={() => setMode("select")}
                  aria-label={m.canvas_mode_select()}
                >
                  <MousePointer2 className="size-4" />
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={mode === "pan"}
                  onPressedChange={() => setMode("pan")}
                  aria-label={m.canvas_mode_pan()}
                >
                  <Hand className="size-4" />
                </Toggle>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1">
        <ReactFlowProvider>
          <DiagramCanvas readOnly={readOnly} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
