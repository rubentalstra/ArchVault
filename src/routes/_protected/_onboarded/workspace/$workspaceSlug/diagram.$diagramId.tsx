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
import type { DeeperDiagramInfo } from "#/lib/converters/diagram-to-flow";
import { DiagramCanvas } from "#/components/editor/diagram-canvas";
import { PropertiesPanel } from "#/components/editor/properties-panel";
import { ElementPickerSidebar } from "#/components/editor/element-picker-sidebar";
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
  const elementPickerOpen = useEditorStore((s) => s.elementPickerOpen);

  const memberRole = activeMember?.role;
  const readOnly = !["owner", "admin", "editor"].includes(memberRole ?? "");

  useEffect(() => {
    // Build deeper diagrams map from server data
    const deeperDiagramsMap = new Map<string, DeeperDiagramInfo[]>();
    if (diagramData.subFlowDiagrams) {
      for (const [elementId, diagrams] of Object.entries(
        diagramData.subFlowDiagrams as Record<string, DeeperDiagramInfo[]>,
      )) {
        deeperDiagramsMap.set(elementId, diagrams);
      }
    }

    const nodes = toFlowNodes(
      diagramData.elements,
      diagramData.diagram.diagramType as DiagramType,
      deeperDiagramsMap,
    );
    const elementIdToNodeId = buildElementIdToNodeIdMap(diagramData.elements);
    const edges = toFlowEdges(diagramData.connections, elementIdToNodeId);

    initDiagram({
      diagramId: diagramData.diagram.id,
      diagramType: diagramData.diagram.diagramType as DiagramType,
      workspaceId: diagramData.diagram.workspaceId,
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
          </div>
        </div>
      </header>

      <ReactFlowProvider>
        <div className="flex flex-1 overflow-hidden">
          {elementPickerOpen && !readOnly && (
            <div className="w-72 shrink-0 overflow-y-auto">
              <ElementPickerSidebar />
            </div>
          )}
          <div className="flex-1">
            <DiagramCanvas readOnly={readOnly} />
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
      </ReactFlowProvider>
    </div>
  );
}
