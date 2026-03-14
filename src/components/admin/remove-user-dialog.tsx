import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "#/components/ui/alert-dialog";
import { toast } from "sonner";
import type { AdminUser } from "./user-table-columns";
import { m } from "#/paraglide/messages";

interface RemoveUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RemoveUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: RemoveUserDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await authClient.admin.removeUser({
      userId: user.id,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? m.admin_remove_user_failed());
      return;
    }

    toast.success(m.admin_remove_user_success({ name: user.name }));
    onOpenChange(false);
    onSuccess();
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.admin_remove_user_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.admin_remove_user_confirm({ name: user.name, email: user.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? m.common_removing() : m.admin_remove_user_submit()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
