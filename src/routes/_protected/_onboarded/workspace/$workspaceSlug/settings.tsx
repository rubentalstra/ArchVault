import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { toast } from "sonner";
import {
  updateWorkspace,
  deleteWorkspace,
} from "#/lib/workspace.functions";

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
        toast.success("Workspace updated");

        if (value.slug !== workspace.slug) {
          navigate({
            to: "/workspace/$workspaceSlug/settings",
            params: { workspaceSlug: value.slug },
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update workspace",
        );
      }
    },
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteWorkspace({ data: { id: workspace.id } });
      toast.success("Workspace deleted");
      setDeleteOpen(false);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete workspace",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Workspace Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            {canEdit
              ? "Update your workspace details."
              : "Workspace details (read-only)."}
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
                  <Label htmlFor="ws-settings-name">Name</Label>
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
                  <Label htmlFor="ws-settings-slug">Slug</Label>
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
                  <Label htmlFor="ws-settings-desc">Description</Label>
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
                  <Label htmlFor="ws-settings-emoji">Icon Emoji</Label>
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
                    {isSubmitting ? "Saving..." : "Save Changes"}
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
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this workspace and all its data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Delete Workspace
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{workspace.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Workspace"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
