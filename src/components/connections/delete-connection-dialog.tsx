import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { toast } from "sonner";
import { m } from "#/paraglide/messages";
import { deleteConnection } from "#/lib/connection.functions";

interface DeleteConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: { id: string; sourceName: string; targetName: string } | null;
  onSuccess: () => void;
}

export function DeleteConnectionDialog({
  open,
  onOpenChange,
  connection: rel,
  onSuccess,
}: DeleteConnectionDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!rel) return;
    setLoading(true);
    try {
      await deleteConnection({ data: { id: rel.id } });
      toast.success(m.connection_delete_success());
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : m.connection_delete_failed(),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!rel) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.connection_delete_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.connection_delete_confirm({
              source: rel.sourceName,
              target: rel.targetName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? m.common_deleting() : m.common_delete()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
