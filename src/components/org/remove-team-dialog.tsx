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

interface RemoveTeamDialogProps {
  team: { id: string; name: string } | null;
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RemoveTeamDialog({
  team,
  organizationId,
  open,
  onOpenChange,
  onSuccess,
}: RemoveTeamDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!team) return;
    setLoading(true);

    const { error } = await authClient.organization.removeTeam({
      teamId: team.id,
      organizationId,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Failed to delete team");
      return;
    }

    toast.success(`Team "${team.name}" deleted`);
    onOpenChange(false);
    onSuccess();
  };

  if (!team) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Team</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the team &ldquo;{team.name}&rdquo;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Team"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
