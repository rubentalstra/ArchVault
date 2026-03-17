import { useState } from "react";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { TAG_COLOR_PRESETS } from "#/lib/tag.validators";
import { m } from "#/paraglide/messages";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <span
            className="size-4 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-6 gap-2">
            {TAG_COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                className="flex size-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: value === color ? "var(--color-foreground)" : "transparent",
                }}
                onClick={() => {
                  onChange(color);
                  setCustomColor(color);
                  setOpen(false);
                }}
              >
                {value === color && <Check className="size-4 text-white" />}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{m.tag_label_color()}</Label>
            <div className="flex gap-2">
              <Input
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#000000"
                className="font-mono text-sm"
                maxLength={7}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
                      onChange(customColor);
                      setOpen(false);
                    }
                  }
                }}
              />
              <span
                className="size-9 shrink-0 rounded-md border"
                style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(customColor) ? customColor : value }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
