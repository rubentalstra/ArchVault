import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { TagBadge } from "#/components/tags/tag-badge";
import { m } from "#/paraglide/messages";

interface WorkspaceTag {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

interface TagPickerProps {
  workspaceTags: WorkspaceTag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagPicker({ workspaceTags, selectedTagIds, onChange }: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? workspaceTags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : workspaceTags;

  const toggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-sm">
              {selectedTagIds.length > 0
                ? `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? "s" : ""}`
                : m.tag_picker_title()}
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="flex flex-col">
            <div className="p-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={m.tag_picker_search()}
                className="h-8 text-sm"
              />
            </div>
            <div className="max-h-48 overflow-y-auto px-1 pb-1">
              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                  {m.tag_picker_empty()}
                </p>
              ) : (
                filtered.map((tag) => {
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
      {selectedTagIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTagIds
            .map((id) => workspaceTags.find((t) => t.id === id))
            .filter(Boolean)
            .map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} icon={tag.icon} />
            ))}
        </div>
      )}
    </div>
  );
}
