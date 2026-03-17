import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { authClient } from "#/lib/auth-client";
import { listAllScimConnections } from "#/lib/scim.functions";
import { Button } from "#/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "#/components/ui/breadcrumb";
import { Separator } from "#/components/ui/separator";
import { SidebarTrigger } from "#/components/ui/sidebar";
import { toast } from "sonner";
import { GenerateScimTokenDialog } from "#/components/admin/generate-scim-token-dialog";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_protected/admin/scim")({
  component: SCIMPage,
});

interface SCIMConnectionRow {
  id: string;
  providerId: string;
  organizationId: string | null;
  organizationName: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
}

const columnHelper = createColumnHelper<SCIMConnectionRow>();

function SCIMPage() {
  const queryClient = useQueryClient();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deleteConnection, setDeleteConnection] = useState<SCIMConnectionRow | null>(null);

  const listConnectionsFn = useServerFn(listAllScimConnections);
  const { data: connections = [], isLoading: loading } = useQuery({
    queryKey: ["admin", "scim-connections"],
    queryFn: () => listConnectionsFn(),
  });

  const refetchConnections = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["admin", "scim-connections"] }),
    [queryClient],
  );

  const handleDelete = async () => {
    if (!deleteConnection) return;
    const { error } = await authClient.scim.deleteProviderConnection({
      providerId: deleteConnection.providerId,
    });
    if (error) {
      toast.error((error as { message?: string }).message ?? m.admin_scim_delete_failed());
    } else {
      toast.success(m.admin_scim_delete_success());
      refetchConnections();
    }
    setDeleteConnection(null);
  };

  const columns = [
    columnHelper.accessor("providerId", {
      header: m.admin_scim_column_provider_id(),
      cell: (info) => (
        <span className="font-mono text-sm">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("organizationName", {
      header: m.admin_scim_column_organization(),
      cell: (info) => {
        const name = info.getValue();
        return name ? (
          <span className="text-sm">{name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.accessor("userName", {
      header: m.admin_scim_column_owner(),
      cell: (info) => {
        const name = info.getValue();
        const email = info.row.original.userEmail;
        return name ? (
          <div className="flex flex-col">
            <span className="text-sm">{name}</span>
            {email && (
              <span className="text-xs text-muted-foreground">{email}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const row = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteConnection(row)}
              >
                <Trash2 className="size-4" />
                {m.admin_scim_delete_connection()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: connections,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{m.admin_scim_title()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{m.admin_scim_title()}</h2>
          <p className="text-sm text-muted-foreground">
            {m.admin_scim_description()}
          </p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Plus className="size-4" />
          {m.admin_scim_generate_token()}
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-sm">
          <span className="font-medium">{m.admin_scim_base_url()} </span>
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {typeof window !== "undefined" ? window.location.origin : ""}/api/auth/scim/v2
          </code>
        </p>
      </div>

      <div className="rounded-lg border overflow-auto">
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {m.common_loading()}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {m.admin_scim_empty()}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <GenerateScimTokenDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onSuccess={refetchConnections}
      />

      <AlertDialog
        open={!!deleteConnection}
        onOpenChange={(open) => !open && setDeleteConnection(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.admin_scim_delete_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.admin_scim_delete_confirm({ providerId: deleteConnection?.providerId ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{m.common_delete()}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
}
