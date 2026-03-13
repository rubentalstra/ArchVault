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
        setError(createError.message ?? "Failed to create team");
        return;
      }

      toast.success(`Team "${value.name}" created`);
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
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Create a new team within this organization.
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
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Engineering"
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Team"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
