import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
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
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { m } from "#/paraglide/messages";
import { TagBadge } from "#/components/tags/tag-badge";
import { ColorPicker } from "#/components/tags/color-picker";
import { IconPicker } from "#/components/tags/icon-picker";
import { TAG_COLOR_PRESETS } from "#/lib/tag.validators";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from "#/lib/tag.functions";

interface TagManagerProps {
  workspaceId: string;
  canEdit: boolean;
  canDelete: boolean;
}

interface TagData {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

export function TagManager({ workspaceId, canEdit, canDelete }: TagManagerProps) {
  const queryClient = useQueryClient();
  const getTagsFn = useServerFn(getTags);
  const { data: tags = [] } = useQuery({
    queryKey: ["tags", workspaceId],
    queryFn: () => getTagsFn({ data: { workspaceId } }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editTag, setEditTag] = useState<TagData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TagData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLOR_PRESETS[0]);
  const [icon, setIcon] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] });
  };

  const openCreate = () => {
    setEditTag(null);
    setName("");
    setColor(TAG_COLOR_PRESETS[0]);
    setIcon(null);
    setFormOpen(true);
  };

  const openEdit = (tag: TagData) => {
    setEditTag(tag);
    setName(tag.name);
    setColor(tag.color);
    setIcon(tag.icon);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (editTag) {
        await updateTag({
          data: {
            id: editTag.id,
            name: name.trim(),
            color,
            icon,
          },
        });
        toast.success(m.tag_edit_success());
      } else {
        await createTag({
          data: {
            workspaceId,
            name: name.trim(),
            color,
            icon: icon ?? undefined,
          },
        });
        toast.success(m.tag_create_success());
      }
      setFormOpen(false);
      invalidate();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : editTag
            ? m.tag_edit_failed()
            : m.tag_create_failed(),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTag({ data: { id: deleteTarget.id } });
      toast.success(m.tag_delete_success());
      setDeleteTarget(null);
      invalidate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : m.tag_delete_failed(),
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{m.tag_manager_title()}</CardTitle>
              <CardDescription>{m.tag_manager_description()}</CardDescription>
            </div>
            {canEdit && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                {m.tag_create_title()}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">{m.tag_manager_empty()}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <TagBadge name={tag.name} color={tag.color} icon={tag.icon} />
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(tag)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(tag)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTag ? m.tag_edit_title() : m.tag_create_title()}
            </DialogTitle>
            <DialogDescription>
              {editTag ? m.tag_edit_title() : m.tag_create_title()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>{m.tag_label_name()}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={m.tag_placeholder_name()}
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{m.tag_label_color()}</Label>
              <ColorPicker value={color} onChange={setColor} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{m.tag_label_icon()}</Label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>

            {name.trim() && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Preview</Label>
                <TagBadge name={name.trim()} color={color} icon={icon} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {m.common_cancel()}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
              {submitting
                ? m.common_saving()
                : editTag
                  ? m.common_save_changes()
                  : m.common_create()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.tag_delete_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? m.tag_delete_confirm({ name: deleteTarget.name })
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? m.common_deleting() : m.common_delete()}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
