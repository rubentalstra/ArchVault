import { createColumnHelper } from "@tanstack/react-table";
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
import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatRelativeDate } from "#/lib/admin.utils";
import { m } from "#/paraglide/messages";
import { ELEMENT_TYPE_ICONS } from "#/lib/display/element.display";
import { CONNECTION_DIRECTION_ICONS, CONNECTION_DIRECTION_LABELS } from "#/lib/display/connection.display";
import type { ConnectionDirection } from "@archvault/shared/connections";
import type { ElementType } from "@archvault/shared/elements";
import { TagBadge } from "#/components/tags/tag-badge";

export interface ConnectionRow {
  id: string;
  sourceElementId: string;
  targetElementId: string;
  direction: ConnectionDirection;
  description: string | null;
  technologies: { technologyId: string; name: string; iconSlug: string | null }[];
  tags: { id: string; name: string; color: string; icon: string | null }[];
  updatedAt: string | Date;
}

export interface ConnectionTableActions {
  onEdit: (rel: ConnectionRow) => void;
  onDelete: (rel: ConnectionRow) => void;
  canEdit: boolean;
  canDelete: boolean;
  elementNameMap: Map<string, string>;
  elementTypeMap: Map<string, ElementType>;
}


const columnHelper = createColumnHelper<ConnectionRow>();

export function getConnectionColumns(actions: ConnectionTableActions) {
  return [
    columnHelper.accessor("sourceElementId", {
      header: m.connection_column_source(),
      enableSorting: true,
      cell: (info) => {
        const id = info.getValue();
        const name = actions.elementNameMap.get(id) ?? "\u2014";
        const type = actions.elementTypeMap.get(id);
        const Icon = type ? ELEMENT_TYPE_ICONS[type] : null;
        return (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
            <span className="text-sm font-medium">{name}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("targetElementId", {
      header: m.connection_column_target(),
      enableSorting: true,
      cell: (info) => {
        const id = info.getValue();
        const name = actions.elementNameMap.get(id) ?? "\u2014";
        const type = actions.elementTypeMap.get(id);
        const Icon = type ? ELEMENT_TYPE_ICONS[type] : null;
        return (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
            <span className="text-sm font-medium">{name}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("direction", {
      header: m.connection_column_direction(),
      enableSorting: true,
      cell: (info) => {
        const dir = info.getValue();
        const Icon = CONNECTION_DIRECTION_ICONS[dir];
        return (
          <div className="flex items-center gap-1.5">
            <Icon className="size-4 text-muted-foreground" />
            <span className="text-sm">{CONNECTION_DIRECTION_LABELS[dir]()}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("description", {
      header: m.connection_column_description(),
      enableSorting: false,
      cell: (info) => {
        const desc = info.getValue();
        if (!desc) return <span className="text-muted-foreground">\u2014</span>;
        return <span className="text-sm">{desc}</span>;
      },
    }),
    columnHelper.accessor("technologies", {
      header: m.connection_column_technology(),
      enableSorting: false,
      cell: (info) => {
        const techs = info.getValue();
        if (!techs || techs.length === 0) return <span className="text-muted-foreground">\u2014</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {techs.map((t) => (
              <Badge key={t.technologyId} variant="secondary" className="text-xs">
                {t.name}
              </Badge>
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor("tags", {
      header: m.connection_column_tags(),
      enableSorting: false,
      cell: (info) => {
        const tags = info.getValue();
        if (!tags || tags.length === 0) return <span className="text-muted-foreground">\u2014</span>;
        const visible = tags.slice(0, 3);
        const remaining = tags.length - visible.length;
        return (
          <div className="flex flex-wrap gap-1">
            {visible.map((t) => (
              <TagBadge key={t.id} name={t.name} color={t.color} icon={t.icon} />
            ))}
            {remaining > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{remaining}
              </Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("updatedAt", {
      header: m.connection_column_updated(),
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
        const rel = info.row.original;
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
                <DropdownMenuItem onClick={() => actions.onEdit(rel)}>
                  <Pencil className="size-4" />
                  {m.connection_edit_title()}
                </DropdownMenuItem>
              )}
              {actions.canEdit && actions.canDelete && <DropdownMenuSeparator />}
              {actions.canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => actions.onDelete(rel)}
                >
                  <Trash2 className="size-4" />
                  {m.connection_delete_title()}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];
}
