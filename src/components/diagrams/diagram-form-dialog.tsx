import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { toast } from "sonner";
import { m } from "#/paraglide/messages";
import { diagramTypes } from "#/lib/diagram.validators";
import type { DiagramType } from "#/lib/diagram.validators";
import {
  createDiagram,
  updateDiagram,
} from "#/lib/diagram.functions";

interface DiagramData {
  id: string;
  name: string;
  description: string | null;
  diagramType: DiagramType;
  gridSize: number;
  snapToGrid: boolean;
}

interface DiagramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  diagram?: DiagramData;
  onSuccess: () => void;
}

const TYPE_LABELS: Record<DiagramType, () => string> = {
  system_context: () => `${m.diagram_level_1()} — ${m.diagram_type_system_context()}`,
  container: () => `${m.diagram_level_2()} — ${m.diagram_type_container()}`,
  component: () => `${m.diagram_level_3()} — ${m.diagram_type_component()}`,
};

const TYPE_DESCRIPTIONS: Record<DiagramType, () => string> = {
  system_context: () => m.diagram_level_1_description(),
  container: () => m.diagram_level_2_description(),
  component: () => m.diagram_level_3_description(),
};

export function DiagramFormDialog({
  open,
  onOpenChange,
  workspaceId,
  diagram: editDiagram,
  onSuccess,
}: DiagramFormDialogProps) {
  const isEdit = !!editDiagram;
  const [selectedType, setSelectedType] = useState<DiagramType>(
    editDiagram?.diagramType ?? "system_context",
  );

  const form = useForm({
    defaultValues: {
      diagramType: editDiagram?.diagramType ?? ("system_context" as DiagramType),
      name: editDiagram?.name ?? "",
      description: editDiagram?.description ?? "",
      gridSize: editDiagram?.gridSize ?? 20,
      snapToGrid: editDiagram?.snapToGrid ?? true,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit) {
          await updateDiagram({
            data: {
              id: editDiagram.id,
              name: value.name,
              description: value.description || null,
              gridSize: value.gridSize,
              snapToGrid: value.snapToGrid,
            },
          });
          toast.success(m.diagram_edit_success());
        } else {
          await createDiagram({
            data: {
              workspaceId,
              name: value.name,
              description: value.description || undefined,
              diagramType: value.diagramType,
              gridSize: value.gridSize,
              snapToGrid: value.snapToGrid,
            },
          });
          toast.success(m.diagram_create_success());
        }
        onOpenChange(false);
        onSuccess();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : isEdit
              ? m.diagram_edit_failed()
              : m.diagram_create_failed(),
        );
      }
    },
  });

  const handleTypeChange = (newType: DiagramType) => {
    form.setFieldValue("diagramType", newType);
    setSelectedType(newType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? m.diagram_edit_title() : m.diagram_create_title()}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? m.diagram_edit_description() : m.diagram_create_description()}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {/* Diagram Type (create only) */}
          {!isEdit && (
            <form.Field name="diagramType">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>{m.diagram_label_level()}</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={field.state.value}
                    onChange={(e) => handleTypeChange(e.target.value as DiagramType)}
                  >
                    {diagramTypes.map((type) => (
                      <option key={type} value={type}>
                        {TYPE_LABELS[type]()}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {TYPE_DESCRIPTIONS[field.state.value]()}
                  </p>
                </div>
              )}
            </form.Field>
          )}

          {/* Name */}
          <form.Field name="name">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.diagram_label_name()}</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.diagram_placeholder_name()}
                />
              </div>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.diagram_label_description()}</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.diagram_placeholder_description()}
                />
              </div>
            )}
          </form.Field>

          {/* Grid Size */}
          <form.Field name="gridSize">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.diagram_label_grid_size()}</Label>
                <Input
                  type="number"
                  min={5}
                  max={100}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>

          {/* Snap to Grid */}
          <form.Field name="snapToGrid">
            {(field) => (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="snapToGrid"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                <Label htmlFor="snapToGrid">{m.diagram_label_snap_to_grid()}</Label>
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {m.common_cancel()}
            </Button>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? m.common_saving()
                    : isEdit
                      ? m.common_save_changes()
                      : m.common_create()}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
