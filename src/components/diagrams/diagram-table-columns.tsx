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
import { DIAGRAM_TYPE_LABELS, DIAGRAM_TYPE_COLORS } from "#/lib/display/diagram.display";
import type { DiagramType } from "@archvault/shared/diagrams";

export interface DiagramRow {
  id: string;
  name: string;
  diagramType: DiagramType;
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
          <Badge variant="secondary" className={DIAGRAM_TYPE_COLORS[type]}>
            {DIAGRAM_TYPE_LABELS[type]()}
          </Badge>
        );
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
