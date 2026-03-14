import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatRelativeDate } from "#/lib/admin.utils";
import { m } from "#/paraglide/messages";
import type { DiagramType } from "#/lib/diagram.validators";

export interface DiagramRow {
  id: string;
  name: string;
  diagramType: DiagramType;
  scopeElementName: string | null;
  elementCount: number;
  updatedAt: string | Date;
}

export interface DiagramTableActions {
  onEdit: (diagram: DiagramRow) => void;
  onDelete: (diagram: DiagramRow) => void;
  canEdit: boolean;
  canDelete: boolean;
  workspaceSlug: string;
}

const TYPE_LABELS: Record<DiagramType, () => string> = {
  system_context: () => `${m.diagram_level_1()} — ${m.diagram_type_system_context()}`,
  container: () => `${m.diagram_level_2()} — ${m.diagram_type_container()}`,
  component: () => `${m.diagram_level_3()} — ${m.diagram_type_component()}`,
};

const TYPE_COLORS: Record<DiagramType, string> = {
  system_context: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  container: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  component: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

const columnHelper = createColumnHelper<DiagramRow>();

export function getDiagramColumns(actions: DiagramTableActions) {
  return [
    columnHelper.accessor("name", {
      header: m.diagram_column_name(),
      enableSorting: true,
      cell: (info) => (
        <Link
          to="/workspace/$workspaceSlug/diagram/$diagramId"
          params={{
            workspaceSlug: actions.workspaceSlug,
            diagramId: info.row.original.id,
          }}
          className="text-sm font-medium text-primary hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("diagramType", {
      header: m.diagram_column_type(),
      enableSorting: true,
      cell: (info) => {
        const type = info.getValue();
        return (
          <Badge variant="secondary" className={TYPE_COLORS[type]}>
            {TYPE_LABELS[type]()}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("scopeElementName", {
      header: m.diagram_column_scope(),
      enableSorting: false,
      cell: (info) => {
        const name = info.getValue();
        if (!name) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm">{name}</span>;
      },
    }),
    columnHelper.accessor("elementCount", {
      header: m.diagram_column_elements(),
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("updatedAt", {
      header: m.diagram_column_updated(),
      enableSorting: true,
      cell: (info) => {
        const date = info.getValue();
        return (
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm text-muted-foreground">
                {formatRelativeDate(date)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {new Date(date).toLocaleString()}
            </TooltipContent>
          </Tooltip>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const d = info.row.original;
        if (!actions.canEdit && !actions.canDelete) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.canEdit && (
                <DropdownMenuItem onClick={() => actions.onEdit(d)}>
                  <Pencil className="size-4" />
                  {m.diagram_edit_title()}
                </DropdownMenuItem>
              )}
              {actions.canEdit && actions.canDelete && <DropdownMenuSeparator />}
              {actions.canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => actions.onDelete(d)}
                >
                  <Trash2 className="size-4" />
                  {m.diagram_delete_title()}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];
}
