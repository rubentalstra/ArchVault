import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { authClient } from "#/lib/auth-client";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from "#/lib/tag.functions";
import { TAG_COLOR_PRESETS } from "#/lib/tag.validators";
import { TagBadge } from "#/components/tags/tag-badge";
import { ColorPicker } from "#/components/tags/color-picker";
import { IconPicker } from "#/components/tags/icon-picker";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
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
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
  "/_protected/_onboarded/workspace/$workspaceSlug/tags",
)({
  component: TagsPage,
});

interface TagData {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

function getTagColumns({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  onEdit: (tag: TagData) => void;
  onDelete: (tag: TagData) => void;
  canEdit: boolean;
  canDelete: boolean;
}): ColumnDef<TagData>[] {
  const columns: ColumnDef<TagData>[] = [
    {
      accessorKey: "name",
      header: () => m.tag_label_name(),
      cell: ({ row }) => (
        <TagBadge
          name={row.original.name}
          color={row.original.color}
          icon={row.original.icon}
        />
      ),
    },
    {
      accessorKey: "color",
      header: () => m.tag_label_color(),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="size-4 rounded-full"
            style={{ backgroundColor: row.original.color }}
          />
          <span className="text-sm text-muted-foreground">
            {row.original.color}
          </span>
        </div>
      ),
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      id: "actions",
      header: () => m.common_label_actions(),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="mr-2 size-4" />
                {m.tag_edit_title()}
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem onClick={() => onDelete(row.original)}>
                <Trash2 className="mr-2 size-4" />
                {m.tag_delete_title()}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });
  }

  return columns;
}

function TagsPage() {
  const { workspace } = Route.useRouteContext();
  const { data: activeMember } = authClient.useActiveMember();
  const queryClient = useQueryClient();

  const memberRole = activeMember?.role;
  const canEdit = ["owner", "admin", "editor"].includes(memberRole ?? "");
  const canDelete = ["owner", "admin"].includes(memberRole ?? "");

  const getTagsFn = useServerFn(getTags);
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags", workspace.id],
    queryFn: () => getTagsFn({ data: { workspaceId: workspace.id } }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editTag, setEditTag] = useState<TagData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TagData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLOR_PRESETS[0]);
  const [icon, setIcon] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tags", workspace.id] });
  };

  const openCreate = () => {
    setEditTag(null);
    setName("");
    setColor(TAG_COLOR_PRESETS[0]);
    setIcon(null);
    setFormOpen(true);
  };

  const openEdit = (tag: TagData) => {
    setEditTag(tag);
    setName(tag.name);
    setColor(tag.color);
    setIcon(tag.icon);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (editTag) {
        await updateTag({
          data: {
            id: editTag.id,
            name: name.trim(),
            color,
            icon,
          },
        });
        toast.success(m.tag_edit_success());
      } else {
        await createTag({
          data: {
            workspaceId: workspace.id,
            name: name.trim(),
            color,
            icon: icon ?? undefined,
          },
        });
        toast.success(m.tag_create_success());
      }
      setFormOpen(false);
      invalidate();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : editTag
            ? m.tag_edit_failed()
            : m.tag_create_failed(),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTag({ data: { id: deleteTarget.id } });
      toast.success(m.tag_delete_success());
      setDeleteTarget(null);
      invalidate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : m.tag_delete_failed(),
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = getTagColumns({
    onEdit: openEdit,
    onDelete: (tag) => setDeleteTarget(tag),
    canEdit,
    canDelete,
  });

  const table = useReactTable({
    data: tags as TagData[],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      return row.original.name.toLowerCase().includes(search);
    },
  });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
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
              <BreadcrumbItem>
                <BreadcrumbPage>{m.tag_manager_title()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-auto p-4 pt-0">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{m.tag_manager_title()}</h2>
          {canEdit && (
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              {m.tag_create_title()}
            </Button>
          )}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={m.tag_placeholder_search()}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            {m.common_loading()}
          </p>
        ) : tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {m.tag_manager_empty()}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
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
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editTag ? m.tag_edit_title() : m.tag_create_title()}
              </DialogTitle>
              <DialogDescription>
                {m.tag_manager_description()}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>{m.tag_label_name()}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={m.tag_placeholder_name()}
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{m.tag_label_color()}</Label>
                <ColorPicker value={color} onChange={setColor} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{m.tag_label_icon()}</Label>
                <IconPicker value={icon} onChange={setIcon} />
              </div>

              {name.trim() && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Preview</Label>
                  <TagBadge name={name.trim()} color={color} icon={icon} />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                {m.common_cancel()}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
                {submitting
                  ? m.common_saving()
                  : editTag
                    ? m.common_save_changes()
                    : m.common_create()}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{m.tag_delete_title()}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget
                  ? m.tag_delete_confirm({ name: deleteTarget.name })
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? m.common_deleting() : m.common_delete()}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
