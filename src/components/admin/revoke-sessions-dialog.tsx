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

interface RevokeSessionsDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RevokeSessionsDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: RevokeSessionsDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await authClient.admin.revokeUserSessions({
      userId: user.id,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Failed to revoke sessions");
      return;
    }

    toast.success(`All sessions for ${user.name} have been revoked`);
    onOpenChange(false);
    onSuccess();
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke Sessions</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revoke all active sessions for {user.name} (
            {user.email})? They will be signed out from all devices.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleRevoke} disabled={loading}>
            {loading ? "Revoking..." : "Revoke All Sessions"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
