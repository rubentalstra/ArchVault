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
      toast.error(error.message ?? m.admin_revoke_sessions_failed());
      return;
    }

    toast.success(m.admin_revoke_sessions_success({ name: user.name }));
    onOpenChange(false);
    onSuccess();
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.admin_revoke_sessions_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.admin_revoke_sessions_confirm({ name: user.name, email: user.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
          <Button onClick={handleRevoke} disabled={loading}>
            {loading ? m.admin_revoking() : m.admin_revoke_sessions_submit()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
