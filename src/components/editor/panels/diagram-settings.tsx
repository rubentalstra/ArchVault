import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useEditorStore } from "#/stores/editor-store";
import { updateDiagram } from "#/lib/diagram.functions";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Switch } from "#/components/ui/switch";
import { m } from "#/paraglide/messages";

export function DiagramSettings({
  diagramName,
  diagramDescription,
}: {
  diagramName: string;
  diagramDescription: string | null;
}) {
  const diagramId = useEditorStore((s) => s.diagramId);
  const gridSize = useEditorStore((s) => s.gridSize);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);

  const [name, setName] = useState(diagramName);
  const [description, setDescription] = useState(diagramDescription ?? "");

  const updateDiagramFn = useServerFn(updateDiagram);

  const handleNameBlur = useCallback(async () => {
    if (!diagramId || name === diagramName) return;
    try {
      await updateDiagramFn({ data: { id: diagramId, name } });
      toast.success(m.editor_panel_save_success());
    } catch {
      toast.error(m.editor_panel_save_failed());
    }
  }, [diagramId, name, diagramName, updateDiagramFn]);

  const handleDescriptionBlur = useCallback(async () => {
    if (!diagramId || description === (diagramDescription ?? "")) return;
    try {
      await updateDiagramFn({
        data: { id: diagramId, description: description || null },
      });
      toast.success(m.editor_panel_save_success());
    } catch {
      toast.error(m.editor_panel_save_failed());
    }
  }, [diagramId, description, diagramDescription, updateDiagramFn]);

  const handleGridSizeBlur = useCallback(
    async (value: number) => {
      if (!diagramId) return;
      try {
        await updateDiagramFn({ data: { id: diagramId, gridSize: value } });
      } catch {
        toast.error(m.editor_panel_save_failed());
      }
    },
    [diagramId, updateDiagramFn],
  );

  const handleSnapToggle = useCallback(
    async (checked: boolean) => {
      if (!diagramId) return;
      try {
        await updateDiagramFn({ data: { id: diagramId, snapToGrid: checked } });
      } catch {
        toast.error(m.editor_panel_save_failed());
      }
    },
    [diagramId, updateDiagramFn],
  );

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold">{m.editor_panel_diagram_settings()}</h3>

      <div className="space-y-2">
        <Label htmlFor="diagram-name">{m.diagram_label_name()}</Label>
        <Input
          id="diagram-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagram-description">{m.diagram_label_description()}</Label>
        <Textarea
          id="diagram-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grid-size">{m.diagram_label_grid_size()}</Label>
        <Input
          id="grid-size"
          type="number"
          min={5}
          max={100}
          defaultValue={gridSize}
          onBlur={(e) => handleGridSizeBlur(Number(e.target.value))}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="snap-to-grid">{m.diagram_label_snap_to_grid()}</Label>
        <Switch
          id="snap-to-grid"
          checked={snapToGrid}
          onCheckedChange={handleSnapToggle}
        />
      </div>
    </div>
  );
}
