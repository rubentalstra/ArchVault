import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
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
import { toast } from "sonner";
import {
  updateWorkspace,
  deleteWorkspace,
} from "#/lib/workspace.functions";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
  "/_protected/_onboarded/workspace/$workspaceSlug/settings",
)({
  component: WorkspaceSettingsPage,
});

function WorkspaceSettingsPage() {
  const { workspace } = Route.useRouteContext();
  const { data: activeMember } = authClient.useActiveMember();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const memberRole = activeMember?.role;
  const canEdit = ["owner", "admin", "editor"].includes(memberRole ?? "");
  const canDelete = ["owner", "admin"].includes(memberRole ?? "");

  const form = useForm({
    defaultValues: {
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description ?? "",
      iconEmoji: workspace.iconEmoji ?? "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await updateWorkspace({
          data: {
            id: workspace.id,
            name: value.name,
            slug: value.slug,
            description: value.description || undefined,
            iconEmoji: value.iconEmoji || undefined,
          },
        });
        toast.success(m.workspace_settings_update_success());

        if (value.slug !== workspace.slug) {
          navigate({
            to: "/workspace/$workspaceSlug/settings",
            params: { workspaceSlug: value.slug },
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : m.workspace_settings_update_failed(),
        );
      }
    },
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteWorkspace({ data: { id: workspace.id } });
      toast.success(m.workspace_delete_workspace_success());
      setDeleteOpen(false);
      navigate({ to: "/org" });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : m.workspace_delete_workspace_failed(),
      );
    } finally {
      setDeleteLoading(false);
    }
  };

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
                <BreadcrumbPage>
                  {m.workspace_settings_title()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="mb-6 text-2xl font-bold">
            {m.workspace_settings_title()}
          </h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{m.workspace_settings_general()}</CardTitle>
              <CardDescription>
                {canEdit
                  ? m.workspace_settings_description_edit()
                  : m.workspace_settings_description_readonly()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <p className="mb-4 text-sm text-destructive">{error}</p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="flex flex-col gap-4"
              >
                <form.Field name="name">
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="ws-settings-name">
                        {m.common_label_name()}
                      </Label>
                      <Input
                        id="ws-settings-name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={!canEdit}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="slug">
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="ws-settings-slug">
                        {m.common_label_slug()}
                      </Label>
                      <Input
                        id="ws-settings-slug"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          )
                        }
                        onBlur={field.handleBlur}
                        disabled={!canEdit}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="description">
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="ws-settings-desc">
                        {m.common_label_description()}
                      </Label>
                      <Textarea
                        id="ws-settings-desc"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={!canEdit}
                        rows={3}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="iconEmoji">
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="ws-settings-emoji">
                        {m.workspace_label_icon_emoji()}
                      </Label>
                      <Input
                        id="ws-settings-emoji"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={!canEdit}
                        placeholder="📁"
                        className="w-20"
                      />
                    </div>
                  )}
                </form.Field>

                {canEdit && (
                  <form.Subscribe selector={(s) => s.isSubmitting}>
                    {(isSubmitting) => (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="self-end"
                      >
                        {isSubmitting
                          ? m.common_saving()
                          : m.common_save_changes()}
                      </Button>
                    )}
                  </form.Subscribe>
                )}
              </form>
            </CardContent>
          </Card>

          {canDelete && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">
                  {m.workspace_danger_zone()}
                </CardTitle>
                <CardDescription>
                  {m.workspace_danger_zone_description()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  {m.workspace_delete_workspace()}
                </Button>
              </CardContent>
            </Card>
          )}

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {m.workspace_delete_workspace()}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {m.workspace_delete_workspace_confirm({
                    name: workspace.name,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading
                    ? m.common_deleting()
                    : m.workspace_delete_workspace()}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
