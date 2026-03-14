import { useState } from "react";
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

interface CreateTeamDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTeamDialog({
  organizationId,
  open,
  onOpenChange,
  onSuccess,
}: CreateTeamDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      setError(null);

      const { error: createError } = await authClient.organization.createTeam({
        name: value.name,
        organizationId,
      });

      if (createError) {
        setError(createError.message ?? m.org_create_team_failed());
        return;
      }

      toast.success(m.org_create_team_success({ name: value.name }));
      onOpenChange(false);
      onSuccess();
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
          <DialogTitle>{m.org_create_team_title()}</DialogTitle>
          <DialogDescription>
            {m.org_create_team_description()}
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
                <Label htmlFor="team-name">{m.org_label_team_name()}</Label>
                <Input
                  id="team-name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.org_placeholder_team_name()}
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? m.common_creating() : m.org_create_team_title()}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
