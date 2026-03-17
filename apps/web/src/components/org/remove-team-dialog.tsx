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
import { m } from "#/paraglide/messages";

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
      toast.error(error.message ?? m.org_delete_team_failed());
      return;
    }

    toast.success(m.org_delete_team_success({ name: team.name }));
    onOpenChange(false);
    onSuccess();
  };

  if (!team) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.org_delete_team_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.org_delete_team_confirm({ name: team.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? m.common_deleting() : m.org_delete_team_title()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
