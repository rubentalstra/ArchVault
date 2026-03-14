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
  relationshipDirections,
  validateRelationshipEndpoints,
} from "#/lib/relationship.validators";
import type { RelationshipDirection } from "#/lib/relationship.validators";
import {
  createRelationship,
  updateRelationship,
} from "#/lib/relationship.functions";
import { addRelationshipTag, removeRelationshipTag } from "#/lib/tag.functions";
import { TagPicker } from "#/components/tags/tag-picker";

interface RelationshipData {
  id: string;
  sourceElementId: string;
  targetElementId: string;
  direction: RelationshipDirection;
  description: string | null;
  technology: string | null;
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

interface RelationshipFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  relationship?: RelationshipData;
  elementOptions: ElementOption[];
  workspaceTags?: WorkspaceTag[];
  onSuccess: () => void;
}

const DIRECTION_LABELS: Record<RelationshipDirection, () => string> = {
  outgoing: () => m.relationship_direction_outgoing(),
  incoming: () => m.relationship_direction_incoming(),
  bidirectional: () => m.relationship_direction_bidirectional(),
  none: () => m.relationship_direction_none(),
};

export function RelationshipFormDialog({
  open,
  onOpenChange,
  workspaceId,
  relationship: editRelationship,
  elementOptions,
  workspaceTags = [],
  onSuccess,
}: RelationshipFormDialogProps) {
  const isEdit = !!editRelationship;
  const [endpointError, setEndpointError] = useState<string | null>(null);
  const [localTagIds, setLocalTagIds] = useState<string[]>(
    editRelationship?.tags?.map((t) => t.id) ?? [],
  );

  const form = useForm({
    defaultValues: {
      sourceElementId: editRelationship?.sourceElementId ?? "",
      targetElementId: editRelationship?.targetElementId ?? "",
      direction: editRelationship?.direction ?? ("outgoing" as RelationshipDirection),
      description: editRelationship?.description ?? "",
      technology: editRelationship?.technology ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        const validation = validateRelationshipEndpoints(
          value.sourceElementId,
          value.targetElementId,
        );
        if (!validation.valid) {
          setEndpointError(validation.message ?? null);
          return;
        }
        setEndpointError(null);

        if (isEdit) {
          await updateRelationship({
            data: {
              id: editRelationship.id,
              sourceElementId: value.sourceElementId,
              targetElementId: value.targetElementId,
              direction: value.direction,
              description: value.description || null,
              technology: value.technology || null,
            },
          });
          // Sync tags
          const existingTagIds = new Set(editRelationship.tags.map((t) => t.id));
          const currentTagIds = new Set(localTagIds);

          for (const tagId of existingTagIds) {
            if (!currentTagIds.has(tagId)) {
              await removeRelationshipTag({ data: { relationshipId: editRelationship.id, tagId } });
            }
          }
          for (const tagId of currentTagIds) {
            if (!existingTagIds.has(tagId)) {
              await addRelationshipTag({ data: { relationshipId: editRelationship.id, tagId } });
            }
          }

          toast.success(m.relationship_edit_success());
        } else {
          const created = await createRelationship({
            data: {
              workspaceId,
              sourceElementId: value.sourceElementId,
              targetElementId: value.targetElementId,
              direction: value.direction,
              description: value.description || undefined,
              technology: value.technology || undefined,
            },
          });
          // Add tags to newly created relationship
          for (const tagId of localTagIds) {
            await addRelationshipTag({ data: { relationshipId: created.id, tagId } });
          }

          toast.success(m.relationship_create_success());
        }
        onOpenChange(false);
        onSuccess();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : isEdit
              ? m.relationship_edit_failed()
              : m.relationship_create_failed(),
        );
      }
    },
  });

  const handleEndpointChange = (sourceId: string, targetId: string) => {
    if (sourceId && targetId) {
      const result = validateRelationshipEndpoints(sourceId, targetId);
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
            {isEdit ? m.relationship_edit_title() : m.relationship_create_title()}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? m.relationship_edit_description() : m.relationship_create_description()}
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
                <Label>{m.relationship_label_source()}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    handleEndpointChange(e.target.value, form.getFieldValue("targetElementId"));
                  }}
                >
                  <option value="">{m.relationship_placeholder_select_source()}</option>
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
                <Label>{m.relationship_label_target()}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    handleEndpointChange(form.getFieldValue("sourceElementId"), e.target.value);
                  }}
                >
                  <option value="">{m.relationship_placeholder_select_target()}</option>
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
                <Label>{m.relationship_label_direction()}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as RelationshipDirection)}
                >
                  {relationshipDirections.map((dir) => (
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
                <Label>{m.relationship_label_description()}</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.relationship_placeholder_description()}
                />
              </div>
            )}
          </form.Field>

          {/* Technology */}
          <form.Field name="technology">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>{m.relationship_label_technology()}</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={m.relationship_placeholder_technology()}
                />
              </div>
            )}
          </form.Field>

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
