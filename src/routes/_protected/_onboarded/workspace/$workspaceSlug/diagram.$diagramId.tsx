import { useCallback, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { authClient } from "#/lib/auth-client";
import { getDiagramData, getDiagrams } from "#/lib/diagram.functions";
import { useEditorStore } from "#/stores/editor-store";
import {
  toFlowNodes,
  toFlowEdges,
  buildElementIdToNodeIdMap,
} from "#/lib/converters/diagram-to-flow";
import { DiagramCanvas } from "#/components/editor/diagram-canvas";
import { PropertiesPanel } from "#/components/editor/properties-panel";
import { Badge } from "#/components/ui/badge";
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
import { m } from "#/paraglide/messages";
import type { DiagramType } from "#/lib/diagram.validators";
import type { AppNode } from "#/lib/types/diagram-nodes";

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
  const propertiesPanelOpen = useEditorStore((s) => s.propertiesPanelOpen);
  const workspaceId = useEditorStore((s) => s.workspaceId);
  const navigate = useNavigate();

  const memberRole = activeMember?.role;
  const readOnly = !["owner", "admin", "editor"].includes(memberRole ?? "");

  const getDiagramsFn = useServerFn(getDiagrams);

  const { data: diagrams } = useQuery({
    queryKey: ["diagrams", workspaceId],
    queryFn: () => getDiagramsFn({ data: { workspaceId: workspaceId! } }),
    enabled: !!workspaceId,
  });

  useEffect(() => {
    const nodes = toFlowNodes(
      diagramData.elements,
      diagramData.diagram.diagramType as DiagramType,
      diagramData.diagram.scopeElementId,
    );
    const elementIdToNodeId = buildElementIdToNodeIdMap(diagramData.elements);
    const edges = toFlowEdges(diagramData.connections, elementIdToNodeId);

    initDiagram({
      diagramId: diagramData.diagram.id,
      diagramType: diagramData.diagram.diagramType as DiagramType,
      workspaceId: diagramData.diagram.workspaceId,
      scopeElementId: diagramData.diagram.scopeElementId,
      nodes,
      edges,
      gridSize: diagramData.diagram.gridSize,
      snapToGrid: diagramData.diagram.snapToGrid,
    });

    return () => {
      reset();
    };
  }, [diagramData, initDiagram, reset]);

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: AppNode) => {
      if (!diagrams) return;
      const childDiagram = diagrams.find(
        (d) => d.scopeElementId === node.data.elementId,
      );
      if (childDiagram) {
        navigate({
          to: "/workspace/$workspaceSlug/diagram/$diagramId",
          params: { workspaceSlug: workspace.slug, diagramId: childDiagram.id },
        });
      }
    },
    [diagrams, navigate, workspace.slug],
  );

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
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ReactFlowProvider>
            <DiagramCanvas
              readOnly={readOnly}
              onNodeDoubleClick={onNodeDoubleClick}
            />
          </ReactFlowProvider>
        </div>
        {propertiesPanelOpen && (
          <div className="nowheel nopan w-80 shrink-0 border-l overflow-y-auto">
            <PropertiesPanel
              diagramName={diagramData.diagram.name}
              diagramDescription={diagramData.diagram.description}
            />
          </div>
        )}
      </div>
    </div>
  );
}
