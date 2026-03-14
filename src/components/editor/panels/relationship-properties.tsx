import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useEditorStore } from "#/stores/editor-store";
import { updateRelationship } from "#/lib/relationship.functions";
import { updateDiagramRelationship } from "#/lib/diagram.functions";
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
import type { RelationshipDirection } from "#/lib/relationship.validators";
import type { PathType, LineStyle } from "#/lib/diagram.validators";

const EDGE_TYPE_TO_PATH_TYPE: Record<string, PathType> = {
  default: "curved",
  straight: "straight",
  step: "orthogonal",
};

const DIRECTION_OPTIONS: { value: RelationshipDirection; label: () => string }[] = [
  { value: "outgoing", label: () => m.relationship_direction_outgoing() },
  { value: "incoming", label: () => m.relationship_direction_incoming() },
  { value: "bidirectional", label: () => m.relationship_direction_bidirectional() },
  { value: "none", label: () => m.relationship_direction_none() },
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

export function RelationshipProperties({ edge }: { edge: AppEdge }) {
  const nodes = useEditorStore((s) => s.nodes);
  const setSelection = useEditorStore((s) => s.setSelection);

  const updateRelationshipFn = useServerFn(updateRelationship);
  const updateDiagramRelationshipFn = useServerFn(updateDiagramRelationship);

  const edgeData = edge.data!;
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  const [description, setDescription] = useState(edgeData.description ?? "");
  const [technology, setTechnology] = useState(edgeData.technology ?? "");

  useEffect(() => {
    setDescription(edgeData.description ?? "");
    setTechnology(edgeData.technology ?? "");
  }, [edgeData.description, edgeData.technology]);

  const saveRelationship = useCallback(
    async (field: string, value: unknown) => {
      try {
        await updateRelationshipFn({
          data: { id: edgeData.relationshipId, [field]: value },
        });
      } catch {
        toast.error(m.editor_panel_save_failed());
      }
    },
    [edgeData.relationshipId, updateRelationshipFn],
  );

  const saveDiagramRelationship = useCallback(
    async (field: string, value: unknown) => {
      try {
        await updateDiagramRelationshipFn({
          data: { id: edgeData.diagramRelationshipId, [field]: value },
        });
      } catch {
        toast.error(m.editor_panel_save_failed());
      }
    },
    [edgeData.diagramRelationshipId, updateDiagramRelationshipFn],
  );

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold">{m.editor_panel_relationship()}</h3>

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
        <Label>{m.relationship_label_direction()}</Label>
        <Select
          value={edgeData.direction}
          onValueChange={(v) => saveRelationship("direction", v)}
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
        <Label>{m.relationship_label_description()}</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description !== (edgeData.description ?? "")) {
              saveRelationship("description", description || null);
            }
          }}
          rows={2}
          placeholder={m.relationship_placeholder_description()}
        />
      </div>

      <div className="space-y-2">
        <Label>{m.relationship_label_technology()}</Label>
        <Input
          value={technology}
          onChange={(e) => setTechnology(e.target.value)}
          onBlur={() => {
            if (technology !== (edgeData.technology ?? "")) {
              saveRelationship("technology", technology || null);
            }
          }}
          placeholder={m.relationship_placeholder_technology()}
        />
      </div>

      <div className="space-y-2">
        <Label>{m.editor_panel_path_type()}</Label>
        <Select
          value={EDGE_TYPE_TO_PATH_TYPE[edge.type ?? "default"] ?? "curved"}
          onValueChange={(v) => saveDiagramRelationship("pathType", v)}
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
          onValueChange={(v) => saveDiagramRelationship("lineStyle", v)}
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
          onValueCommit={([v]) => saveDiagramRelationship("labelPosition", v)}
        />
      </div>
    </div>
  );
}
