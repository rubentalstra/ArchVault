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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteMemberDialog({
  organizationId,
  open,
  onOpenChange,
  onSuccess,
}: InviteMemberDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", role: "viewer" as string },
    onSubmit: async ({ value }) => {
      setError(null);

      const { error: inviteError } =
        await authClient.organization.inviteMember({
          email: value.email,
          role: value.role as "admin" | "editor" | "viewer",
          organizationId,
        });

      if (inviteError) {
        setError(inviteError.message ?? "Failed to send invitation");
        return;
      }

      toast.success(`Invitation sent to ${value.email}`);
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
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this organization.
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
          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="colleague@example.com"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(val: string | null) => {
                    if (val) field.handleChange(val);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Invitation"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
