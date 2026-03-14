import { useState } from "react";
import { Check, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { TAG_ICON_MAP } from "#/components/tags/tag-badge";
import { TAG_ICONS } from "#/lib/tag.validators";
import { m } from "#/paraglide/messages";

interface IconPickerProps {
  value: string | null;
  onChange: (icon: string | null) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? TAG_ICONS.filter((name) => name.includes(search.toLowerCase()))
    : TAG_ICONS;

  const SelectedIcon = value ? TAG_ICON_MAP[value as keyof typeof TAG_ICON_MAP] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon className="size-4" />
              <span className="text-sm">{value}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{m.tag_picker_no_icon()}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="flex flex-col gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={m.tag_placeholder_search()}
            className="h-8 text-sm"
          />
          <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto">
            <button
              type="button"
              className={`flex size-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent ${!value ? "border-primary bg-accent" : ""}`}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              {!value ? <Check className="size-3" /> : <X className="size-3" />}
            </button>
            {filtered.map((name) => {
              const Icon = TAG_ICON_MAP[name];
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  className={`flex size-8 items-center justify-center rounded-md border hover:bg-accent ${isSelected ? "border-primary bg-accent" : ""}`}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
