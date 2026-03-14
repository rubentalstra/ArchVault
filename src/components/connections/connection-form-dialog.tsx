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
import {
  connectionDirections,
  validateConnectionEndpoints,
} from "#/lib/connection.validators";
import type { ConnectionDirection } from "#/lib/connection.validators";
import {
  createConnection,
  updateConnection,
} from "#/lib/connection.functions";
import { addConnectionTag, removeConnectionTag } from "#/lib/tag.functions";
import { addConnectionTechnology, removeConnectionTechnology } from "#/lib/technology.functions";
import { TagPicker } from "#/components/tags/tag-picker";
import { TechnologyPicker } from "#/components/technologies/technology-picker";

interface ConnectionData {
  id: string;
  sourceElementId: string;
  targetElementId: string;
  direction: ConnectionDirection;
  description: string | null;
  technologies: { technologyId: string; name: string; iconSlug: string | null }[];
  tags: { id: string; name: string; color: string; icon: string | null }[];
}

interface ElementOption {
  id: string;
  name: string;
}

interface WorkspaceTag {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

interface WorkspaceTechnology {
  id: string;
  name: string;
  iconSlug: string | null;
}

interface ConnectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  connection?: ConnectionData;
  elementOptions: ElementOption[];
  workspaceTags?: WorkspaceTag[];
  workspaceTechnologies?: WorkspaceTechnology[];
  onSuccess: () => void;
}

const DIRECTION_LABELS: Record<ConnectionDirection, () => string> = {
  outgoing: () => m.connection_direction_outgoing(),
  incoming: () => m.connection_direction_incoming(),
  bidirectional: () => m.connection_direction_bidirectional(),
  none: () => m.connection_direction_none(),
};

export function ConnectionFormDialog({
  open,
  onOpenChange,
  workspaceId,
  connection: editConnection,
  elementOptions,
  workspaceTags = [],
  workspaceTechnologies = [],
  onSuccess,
}: ConnectionFormDialogProps) {
  const isEdit = !!editConnection;
  const [endpointError, setEndpointError] = useState<string | null>(null);
  const [localTagIds, setLocalTagIds] = useState<string[]>(
    editConnection?.tags?.map((t) => t.id) ?? [],
  );
  const [localTechnologyIds, setLocalTechnologyIds] = useState<string[]>(
    editConnection?.technologies?.map((t) => t.technologyId) ?? [],
  );

  const form = useForm({
    defaultValues: {
      sourceElementId: editConnection?.sourceElementId ?? "",
      targetElementId: editConnection?.targetElementId ?? "",
      direction: editConnection?.direction ?? ("outgoing" as ConnectionDirection),
      description: editConnection?.description ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        const validation = validateConnectionEndpoints(
          value.sourceElementId,
          value.targetElementId,
        );
        if (!validation.valid) {
          setEndpointError(validation.message ?? null);
          return;
        }
        setEndpointError(null);

        if (isEdit) {
          await updateConnection({
            data: {
              id: editConnection.id,
              sourceElementId: value.sourceElementId,
              targetElementId: value.targetElementId,
              direction: value.direction,
              description: value.description || null,
            },
          });

          // Sync tags
          const existingTagIds = new Set(editConnection.tags.map((t) => t.id));
          const currentTagIds = new Set(localTagIds);

          for (const tagId of existingTagIds) {
            if (!currentTagIds.has(tagId)) {
              await removeConnectionTag({ data: { connectionId: editConnection.id, tagId } });
            }
          }
          for (const tagId of currentTagIds) {
            if (!existingTagIds.has(tagId)) {
              await addConnectionTag({ data: { connectionId: editConnection.id, tagId } });
            }
          }

          // Sync technologies
          const existingTechIds = new Set(editConnection.technologies.map((t) => t.technologyId));
          const currentTechIds = new Set(localTechnologyIds);

          for (const techId of existingTechIds) {
            if (!currentTechIds.has(techId)) {
              await removeConnectionTechnology({ data: { connectionId: editConnection.id, technologyId: techId } });
            }
          }
          for (const techId of currentTechIds) {
            if (!existingTechIds.has(techId)) {
              await addConnectionTechnology({ data: { connectionId: editConnection.id, technologyId: techId } });
            }
          }

          toast.success(m.connection_edit_success());
        } else {
          const created = await createConnection({
            data: {
              workspaceId,
              sourceElementId: value.sourceElementId,
              targetElementId: value.targetElementId,
              direction: value.direction,
              description: value.description || undefined,
            },
          });
          // Add tags and technologies to newly created connection
          for (const tagId of localTagIds) {
            await addConnectionTag({ data: { connectionId: created.id, tagId } });
          }
          for (const techId of localTechnologyIds) {
            await addConnectionTechnology({ data: { connectionId: created.id, technologyId: techId } });
          }

          toast.success(m.connection_create_success());
        }
        onOpenChange(false);
        onSuccess();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : isEdit
              ? m.connection_edit_failed()
              : m.connection_create_failed(),
        );
      }
    },
  });

  const handleEndpointChange = (sourceId: string, targetId: string) => {
    if (sourceId && targetId) {
      const result = validateConnectionEndpoints(sourceId, targetId);
      setEndpointError(result.valid ? null : (result.message ?? null));
    } else {
      setEndpointError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? m.connection_edit_title() : m.connection_create_title()}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? m.connection_edit_description() : m.connection_create_description()}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {/* Source Element */}
          <form.Field name="sourceElementId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.connection_label_source()}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    handleEndpointChange(e.target.value, form.getFieldValue("targetElementId"));
                  }}
                >
                  <option value="">{m.connection_placeholder_select_source()}</option>
                  {elementOptions.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* Target Element */}
          <form.Field name="targetElementId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.connection_label_target()}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    handleEndpointChange(form.getFieldValue("sourceElementId"), e.target.value);
                  }}
                >
                  <option value="">{m.connection_placeholder_select_target()}</option>
                  {elementOptions.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.name}
                    </option>
                  ))}
                </select>
                {endpointError && (
                  <p className="text-xs text-destructive">{endpointError}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Direction */}
          <form.Field name="direction">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.connection_label_direction()}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as ConnectionDirection)}
                >
                  {connectionDirections.map((dir) => (
                    <option key={dir} value={dir}>
                      {DIRECTION_LABELS[dir]()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.connection_label_description()}</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.connection_placeholder_description()}
                />
              </div>
            )}
          </form.Field>

          {/* Technologies */}
          {workspaceTechnologies.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>{m.technology_picker_title()}</Label>
              <TechnologyPicker
                workspaceTechnologies={workspaceTechnologies}
                selectedTechnologyIds={localTechnologyIds}
                onChange={setLocalTechnologyIds}
              />
            </div>
          )}

          {/* Tags */}
          {workspaceTags.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>{m.tag_picker_title()}</Label>
              <TagPicker
                workspaceTags={workspaceTags}
                selectedTagIds={localTagIds}
                onChange={setLocalTagIds}
              />
            </div>
          )}

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
