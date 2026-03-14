import { useState } from "react";
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
import { Textarea } from "#/components/ui/textarea";
import { toast } from "sonner";
import { m } from "#/paraglide/messages";
import { createTechnology, updateTechnology } from "#/lib/technology.functions";
import { IconSlugPicker } from "#/components/technologies/icon-slug-picker";

interface TechnologyData {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  iconSlug: string | null;
  docsUrl: string | null;
  updatesUrl: string | null;
}

interface TechnologyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  technology?: TechnologyData;
  onSuccess: () => void;
}

export function TechnologyFormDialog({
  open,
  onOpenChange,
  workspaceId,
  technology: editTech,
  onSuccess,
}: TechnologyFormDialogProps) {
  const isEdit = !!editTech;
  const [name, setName] = useState(editTech?.name ?? "");
  const [description, setDescription] = useState(editTech?.description ?? "");
  const [website, setWebsite] = useState(editTech?.website ?? "");
  const [iconSlug, setIconSlug] = useState(editTech?.iconSlug ?? "");
  const [docsUrl, setDocsUrl] = useState(editTech?.docsUrl ?? "");
  const [updatesUrl, setUpdatesUrl] = useState(editTech?.updatesUrl ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateTechnology({
          data: {
            id: editTech.id,
            name: name.trim(),
            description: description.trim() || null,
            website: website.trim() || null,
            iconSlug: iconSlug.trim() || null,
            docsUrl: docsUrl.trim() || null,
            updatesUrl: updatesUrl.trim() || null,
          },
        });
        toast.success(m.technology_edit_success());
      } else {
        await createTechnology({
          data: {
            workspaceId,
            name: name.trim(),
            description: description.trim() || undefined,
            website: website.trim() || undefined,
            iconSlug: iconSlug.trim() || undefined,
            docsUrl: docsUrl.trim() || undefined,
            updatesUrl: updatesUrl.trim() || undefined,
          },
        });
        toast.success(m.technology_create_success());
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isEdit
            ? m.technology_edit_failed()
            : m.technology_create_failed(),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? m.technology_edit_title() : m.technology_create_title()}
          </DialogTitle>
          <DialogDescription>
            {m.technology_manager_description()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{m.technology_label_name()}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={m.technology_placeholder_name()}
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{m.technology_label_description()}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={m.technology_placeholder_description()}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{m.technology_label_website()}</Label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={m.technology_placeholder_website()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{m.technology_label_docs_url()}</Label>
            <Input
              value={docsUrl}
              onChange={(e) => setDocsUrl(e.target.value)}
              placeholder={m.technology_placeholder_docs_url()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{m.technology_label_updates_url()}</Label>
            <Input
              value={updatesUrl}
              onChange={(e) => setUpdatesUrl(e.target.value)}
              placeholder={m.technology_placeholder_updates_url()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{m.technology_label_icon()}</Label>
            <IconSlugPicker
              value={iconSlug || null}
              onChange={(slug) => setIconSlug(slug ?? "")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {m.common_cancel()}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting
              ? m.common_saving()
              : isEdit
                ? m.common_save_changes()
                : m.common_create()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
