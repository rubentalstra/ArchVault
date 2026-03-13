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
      toast.error(error.message ?? "Failed to remove member");
      return;
    }

    toast.success(`${member.user.name} has been removed`);
    onOpenChange(false);
    onSuccess();
  };

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {member.user.name} (
            {member.user.email}) from this organization? They will lose access
            to all organization resources.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove Member"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
