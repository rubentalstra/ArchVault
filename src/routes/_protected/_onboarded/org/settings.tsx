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
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/_onboarded/org/settings")({
  component: OrgSettingsPage,
});

function OrgSettingsPage() {
  const { activeOrg } = Route.useRouteContext();
  const { data: activeMember } = authClient.useActiveMember();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isOwner = activeMember?.role === "owner";

  const form = useForm({
    defaultValues: {
      name: activeOrg?.name ?? "",
      slug: activeOrg?.slug ?? "",
      logo: activeOrg?.logo ?? "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: updateError } = await authClient.organization.update({
        data: {
          name: value.name,
          slug: value.slug,
          logo: value.logo || undefined,
        },
      });

      if (updateError) {
        setError(updateError.message ?? "Failed to update organization");
        return;
      }

      toast.success("Organization updated");
    },
  });

  const handleDelete = async () => {
    if (!activeOrg) return;
    setDeleteLoading(true);

    const { error: deleteError } = await authClient.organization.delete({
      organizationId: activeOrg.id,
    });

    setDeleteLoading(false);

    if (deleteError) {
      toast.error(deleteError.message ?? "Failed to delete organization");
      return;
    }

    toast.success("Organization deleted");
    setDeleteOpen(false);
    navigate({ to: "/dashboard" });
  };

  if (!activeOrg) return null;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Organization Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Update your organization details.
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
                  <Label htmlFor="settings-name">Name</Label>
                  <Input
                    id="settings-name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="slug">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="settings-slug">Slug</Label>
                  <Input
                    id="settings-slug"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      )
                    }
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="logo">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="settings-logo">Logo URL</Label>
                  <Input
                    id="settings-logo"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting} className="self-end">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this organization and all its data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Delete Organization
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{activeOrg.name}</strong>?
              This action cannot be undone. All organization data, members, and
              teams will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Organization"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
