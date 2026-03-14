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
import { deleteDiagram } from "#/lib/diagram.functions";

interface DeleteDiagramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagram: { id: string; name: string } | null;
  onSuccess: () => void;
}

export function DeleteDiagramDialog({
  open,
  onOpenChange,
  diagram: d,
  onSuccess,
}: DeleteDiagramDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!d) return;
    setLoading(true);
    try {
      await deleteDiagram({ data: { id: d.id } });
      toast.success(m.diagram_delete_success());
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : m.diagram_delete_failed(),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!d) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.diagram_delete_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.diagram_delete_confirm({ name: d.name })}
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
