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
import { deleteTechnology } from "#/lib/technology.functions";

interface DeleteTechnologyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technology: { id: string; name: string; assignedCount: number } | null;
  onSuccess: () => void;
}

export function DeleteTechnologyDialog({
  open,
  onOpenChange,
  technology: tech,
  onSuccess,
}: DeleteTechnologyDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!tech) return;
    setLoading(true);
    try {
      await deleteTechnology({ data: { id: tech.id } });
      toast.success(m.technology_delete_success());
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : m.technology_delete_failed(),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.technology_delete_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {tech ? m.technology_delete_confirm({ name: tech.name }) : ""}
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
