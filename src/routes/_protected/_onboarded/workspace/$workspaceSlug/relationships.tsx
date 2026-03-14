import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { authClient } from "#/lib/auth-client";
import { getRelationships } from "#/lib/relationship.functions";
import { getElements } from "#/lib/element.functions";
import {
  getRelationshipColumns,
  type RelationshipRow,
} from "#/components/relationships/relationship-table-columns";
import { RelationshipFormDialog } from "#/components/relationships/relationship-form-dialog";
import { DeleteRelationshipDialog } from "#/components/relationships/delete-relationship-dialog";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Plus } from "lucide-react";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
  "/_protected/_onboarded/workspace/$workspaceSlug/relationships",
)({
  component: RelationshipsPage,
});

function RelationshipsPage() {
  const { workspace } = Route.useRouteContext();
  const { data: activeMember } = authClient.useActiveMember();
  const queryClient = useQueryClient();

  const memberRole = activeMember?.role;
  const canEdit = ["owner", "admin", "editor"].includes(memberRole ?? "");
  const canDelete = ["owner", "admin"].includes(memberRole ?? "");

  const getRelationshipsFn = useServerFn(getRelationships);
  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ["relationships", workspace.id],
    queryFn: () => getRelationshipsFn({ data: { workspaceId: workspace.id } }),
  });

  const getElementsFn = useServerFn(getElements);
  const { data: elements = [] } = useQuery({
    queryKey: ["elements", workspace.id],
    queryFn: () => getElementsFn({ data: { workspaceId: workspace.id } }),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editRelationship, setEditRelationship] = useState<RelationshipRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RelationshipRow | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const elementNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const el of elements) {
      map.set(el.id, el.name);
    }
    return map;
  }, [elements]);

  const elementTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const el of elements) {
      map.set(el.id, el.elementType);
    }
    return map;
  }, [elements]);

  const elementOptions = useMemo(
    () =>
      elements.map((el) => ({
        id: el.id,
        name: el.name,
      })),
    [elements],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["relationships", workspace.id] });
  };

  const columns = useMemo(
    () =>
      getRelationshipColumns({
        onEdit: (rel) => setEditRelationship(rel),
        onDelete: (rel) => setDeleteTarget(rel),
        canEdit,
        canDelete,
        elementNameMap,
        elementTypeMap: elementTypeMap as Map<string, import("#/lib/element.validators").ElementType>,
      }),
    [canEdit, canDelete, elementNameMap, elementTypeMap],
  );

  const table = useReactTable({
    data: relationships as RelationshipRow[],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      const rel = row.original;
      const sourceName = elementNameMap.get(rel.sourceElementId)?.toLowerCase() ?? "";
      const targetName = elementNameMap.get(rel.targetElementId)?.toLowerCase() ?? "";
      const desc = rel.description?.toLowerCase() ?? "";
      const tech = rel.technology?.toLowerCase() ?? "";
      return (
        sourceName.includes(search) ||
        targetName.includes(search) ||
        desc.includes(search) ||
        tech.includes(search)
      );
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{m.relationship_page_title()}</h1>
        {canEdit && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            {m.relationship_create_title()}
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={m.relationship_search_placeholder()}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{m.common_loading()}</p>
      ) : relationships.length === 0 ? (
        <p className="text-sm text-muted-foreground">{m.relationship_empty()}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getIsSorted() === "asc" && " \u2191"}
                      {header.column.getIsSorted() === "desc" && " \u2193"}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      {(createOpen || editRelationship) && (
        <RelationshipFormDialog
          open={createOpen || !!editRelationship}
          onOpenChange={(open) => {
            if (!open) {
              setCreateOpen(false);
              setEditRelationship(null);
            }
          }}
          workspaceId={workspace.id}
          relationship={
            editRelationship
              ? {
                  id: editRelationship.id,
                  sourceElementId: editRelationship.sourceElementId,
                  targetElementId: editRelationship.targetElementId,
                  direction: editRelationship.direction,
                  description: editRelationship.description,
                  technology: editRelationship.technology,
                }
              : undefined
          }
          elementOptions={elementOptions}
          onSuccess={invalidate}
        />
      )}

      {/* Delete Dialog */}
      <DeleteRelationshipDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        relationship={
          deleteTarget
            ? {
                id: deleteTarget.id,
                sourceName: elementNameMap.get(deleteTarget.sourceElementId) ?? "—",
                targetName: elementNameMap.get(deleteTarget.targetElementId) ?? "—",
              }
            : null
        }
        onSuccess={invalidate}
      />
    </div>
  );
}
