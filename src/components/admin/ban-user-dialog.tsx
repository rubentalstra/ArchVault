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
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { toast } from "sonner";
import { BAN_DURATIONS } from "#/lib/admin.utils";
import type { AdminUser } from "./user-table-columns";

interface BanUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BanUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: BanUserDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      banReason: "",
      durationIndex: "4", // default to "Permanent"
    },
    onSubmit: async ({ value }) => {
      if (!user) return;
      setError(null);

      const duration = BAN_DURATIONS[Number(value.durationIndex)];

      const { error: banError } = await authClient.admin.banUser({
        userId: user.id,
        banReason: value.banReason || undefined,
        banExpiresIn: duration.seconds,
      });

      if (banError) {
        setError(banError.message ?? "Failed to ban user");
        return;
      }

      toast.success(`${user.name} has been banned`);
      onOpenChange(false);
      onSuccess();
    },
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban {user.name} ({user.email}) from the platform.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {error && <p className="text-sm text-destructive">{error}</p>}

          <form.Field name="banReason">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ban-reason">Reason</Label>
                <Textarea
                  id="ban-reason"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Reason for banning this user..."
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="durationIndex">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Duration</Label>
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
                    {BAN_DURATIONS.map((d, i) => (
                      <SelectItem key={d.label} value={String(i)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Banning..." : "Ban User"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
