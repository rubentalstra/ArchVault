import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { toast } from "sonner";
import { createWorkspace } from "#/lib/workspace.functions";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", slug: "", description: "", iconEmoji: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const slug = value.slug || slugify(value.name);

      try {
        await createWorkspace({
          data: {
            name: value.name,
            slug,
            description: value.description || undefined,
            iconEmoji: value.iconEmoji || undefined,
          },
        });

        toast.success("Workspace created!");
        onOpenChange(false);
        onSuccess();
        navigate({ to: "/workspace/$workspaceSlug", params: { workspaceSlug: slug } });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create workspace",
        );
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (val) {
          form.reset();
          setError(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace within your organization.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

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
                <Label htmlFor="create-ws-name">Name</Label>
                <Input
                  id="create-ws-name"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    const slugField = form.getFieldValue("slug");
                    if (
                      !slugField ||
                      slugField === slugify(field.state.value)
                    ) {
                      form.setFieldValue("slug", slugify(e.target.value));
                    }
                  }}
                  onBlur={field.handleBlur}
                  placeholder="My Workspace"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="slug">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-ws-slug">Slug</Label>
                <Input
                  id="create-ws-slug"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  onBlur={field.handleBlur}
                  placeholder="my-workspace"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-ws-desc">Description</Label>
                <Textarea
                  id="create-ws-desc"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="What is this workspace for?"
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="iconEmoji">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-ws-emoji">Icon Emoji</Label>
                <Input
                  id="create-ws-emoji"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="📁"
                  className="w-20"
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
