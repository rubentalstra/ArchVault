import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { toast } from "sonner";
import type { OrgMember } from "./member-table-columns";
import { m } from "#/paraglide/messages";

interface RemoveMemberDialogProps {
  member: OrgMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RemoveMemberDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: RemoveMemberDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!member) return;
    setLoading(true);

    const { error } = await authClient.organization.removeMember({
      memberIdOrEmail: member.id,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? m.org_remove_member_failed());
      return;
    }

    toast.success(m.org_remove_member_success({ name: member.user.name }));
    onOpenChange(false);
    onSuccess();
  };

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.org_remove_member_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.org_remove_member_confirm({ name: member.user.name, email: member.user.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? m.common_removing() : m.org_remove_member_submit()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
