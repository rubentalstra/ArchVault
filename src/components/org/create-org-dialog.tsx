import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
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
import { toast } from "sonner";
import { m } from "#/paraglide/messages";

interface CreateOrgDialogProps {
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

export function CreateOrgDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrgDialogProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", slug: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const slug = value.slug || slugify(value.name);

      const { data, error: createError } =
        await authClient.organization.create({
          name: value.name,
          slug,
        });

      if (createError) {
        setError(createError.message ?? m.org_create_failed());
        return;
      }

      if (data) {
        await authClient.organization.setActive({
          organizationId: data.id,
        });
      }

      toast.success(m.org_create_success());
      onOpenChange(false);
      onSuccess();
      navigate({ to: "/org/settings" });
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
          <DialogTitle>{m.org_create_title()}</DialogTitle>
          <DialogDescription>
            {m.org_create_description()}
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
                <Label htmlFor="create-org-name">{m.common_label_name()}</Label>
                <Input
                  id="create-org-name"
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
                  placeholder={m.org_placeholder_name()}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="slug">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-org-slug">{m.common_label_slug()}</Label>
                <Input
                  id="create-org-slug"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  onBlur={field.handleBlur}
                  placeholder={m.org_placeholder_slug()}
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? m.common_creating() : m.common_create()}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
