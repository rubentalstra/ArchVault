import { useState } from "react";
import { Check, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Button } from "#/components/ui/button";
import { TagBadge } from "#/components/tags/tag-badge";
import { m } from "#/paraglide/messages";

interface WorkspaceTag {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

interface TagFilterProps {
  workspaceTags: WorkspaceTag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagFilter({ workspaceTags, selectedTagIds, onChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);

  const toggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="size-4" />
          {selectedTagIds.length > 0
            ? m.tag_filter_count({ count: selectedTagIds.length })
            : m.tag_filter_title()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="flex flex-col">
          {selectedTagIds.length > 0 && (
            <div className="border-b px-2 py-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-start p-0 text-xs text-muted-foreground"
                onClick={() => onChange([])}
              >
                {m.tag_filter_clear()}
              </Button>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto px-1 py-1">
            {workspaceTags.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                {m.tag_picker_empty()}
              </p>
            ) : (
              workspaceTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                    onClick={() => toggle(tag.id)}
                  >
                    <span className={`flex size-4 items-center justify-center rounded-sm border ${isSelected ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <TagBadge name={tag.name} color={tag.color} icon={tag.icon} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
