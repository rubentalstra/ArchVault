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
      toast.error(error.message ?? "Failed to remove user");
      return;
    }

    toast.success(`${user.name} has been removed`);
    onOpenChange(false);
    onSuccess();
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {user.name} ({user.email})? This
            action cannot be undone. All user data will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove User"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
