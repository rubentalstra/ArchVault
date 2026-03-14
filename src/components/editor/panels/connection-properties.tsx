import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useEditorStore } from "#/stores/editor-store";
import { updateConnection } from "#/lib/connection.functions";
import { updateDiagramConnection } from "#/lib/diagram.functions";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Badge } from "#/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Slider } from "#/components/ui/slider";
import { m } from "#/paraglide/messages";
import type { AppEdge } from "#/lib/types/diagram-nodes";
import type { ConnectionDirection } from "#/lib/connection.validators";
import type { PathType, LineStyle } from "#/lib/diagram.validators";

const EDGE_TYPE_TO_PATH_TYPE: Record<string, PathType> = {
  default: "curved",
  straight: "straight",
  step: "orthogonal",
};

const DIRECTION_OPTIONS: { value: ConnectionDirection; label: () => string }[] = [
  { value: "outgoing", label: () => m.connection_direction_outgoing() },
  { value: "incoming", label: () => m.connection_direction_incoming() },
  { value: "bidirectional", label: () => m.connection_direction_bidirectional() },
  { value: "none", label: () => m.connection_direction_none() },
];

const PATH_TYPE_OPTIONS: { value: PathType; label: string }[] = [
  { value: "curved", label: "Curved" },
  { value: "straight", label: "Straight" },
  { value: "orthogonal", label: "Orthogonal" },
];

const LINE_STYLE_OPTIONS: { value: LineStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

export function ConnectionProperties({ edge }: { edge: AppEdge }) {
  const nodes = useEditorStore((s) => s.nodes);
  const setSelection = useEditorStore((s) => s.setSelection);

  const updateConnectionFn = useServerFn(updateConnection);
  const updateDiagramConnectionFn = useServerFn(updateDiagramConnection);

  const edgeData = edge.data!;
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  const [description, setDescription] = useState(edgeData.description ?? "");
  const [technology, setTechnology] = useState(edgeData.technology ?? "");

  useEffect(() => {
    setDescription(edgeData.description ?? "");
    setTechnology(edgeData.technology ?? "");
  }, [edgeData.description, edgeData.technology]);

  const saveConnection = useCallback(
    async (field: string, value: unknown) => {
      try {
        await updateConnectionFn({
          data: { id: edgeData.connectionId, [field]: value },
        });
      } catch {
        toast.error(m.editor_panel_save_failed());
      }
    },
    [edgeData.connectionId, updateConnectionFn],
  );

  const saveDiagramConnection = useCallback(
    async (field: string, value: unknown) => {
      try {
        await updateDiagramConnectionFn({
          data: { id: edgeData.diagramConnectionId, [field]: value },
        });
      } catch {
        toast.error(m.editor_panel_save_failed());
      }
    },
    [edgeData.diagramConnectionId, updateDiagramConnectionFn],
  );

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold">{m.editor_panel_connection()}</h3>

      <div className="space-y-2">
        <Label>{m.editor_panel_source()}</Label>
        <Badge
          variant="outline"
          className="cursor-pointer"
          onClick={() => sourceNode && setSelection([sourceNode.id], [])}
        >
          {sourceNode?.data.name ?? "Unknown"}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label>{m.editor_panel_target()}</Label>
        <Badge
          variant="outline"
          className="cursor-pointer"
          onClick={() => targetNode && setSelection([targetNode.id], [])}
        >
          {targetNode?.data.name ?? "Unknown"}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label>{m.connection_label_direction()}</Label>
        <Select
          value={edgeData.direction}
          onValueChange={(v) => saveConnection("direction", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIRECTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{m.connection_label_description()}</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description !== (edgeData.description ?? "")) {
              saveConnection("description", description || null);
            }
          }}
          rows={2}
          placeholder={m.connection_placeholder_description()}
        />
      </div>

      <div className="space-y-2">
        <Label>{m.connection_label_technology()}</Label>
        <Input
          value={technology}
          onChange={(e) => setTechnology(e.target.value)}
          onBlur={() => {
            if (technology !== (edgeData.technology ?? "")) {
              saveConnection("technology", technology || null);
            }
          }}
          placeholder={m.connection_placeholder_technology()}
        />
      </div>

      <div className="space-y-2">
        <Label>{m.editor_panel_path_type()}</Label>
        <Select
          value={EDGE_TYPE_TO_PATH_TYPE[edge.type ?? "default"] ?? "curved"}
          onValueChange={(v) => saveDiagramConnection("pathType", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PATH_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{m.editor_panel_line_style()}</Label>
        <Select
          value={edgeData.lineStyle}
          onValueChange={(v) => saveDiagramConnection("lineStyle", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LINE_STYLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{m.editor_panel_label_position()}</Label>
        <Slider
          value={[edgeData.labelPosition]}
          min={0}
          max={1}
          step={0.05}
          onValueCommit={([v]) => saveDiagramConnection("labelPosition", v)}
        />
      </div>
    </div>
  );
}
