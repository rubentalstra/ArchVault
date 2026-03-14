import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { TechnologyBadge } from "#/components/technologies/technology-badge";
import { m } from "#/paraglide/messages";

interface WorkspaceTechnology {
  id: string;
  name: string;
  iconSlug: string | null;
}

interface TechnologyPickerProps {
  workspaceTechnologies: WorkspaceTechnology[];
  selectedTechnologyIds: string[];
  onChange: (technologyIds: string[]) => void;
}

export function TechnologyPicker({
  workspaceTechnologies,
  selectedTechnologyIds,
  onChange,
}: TechnologyPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? workspaceTechnologies.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()),
      )
    : workspaceTechnologies;

  const toggle = (techId: string) => {
    if (selectedTechnologyIds.includes(techId)) {
      onChange(selectedTechnologyIds.filter((id) => id !== techId));
    } else {
      onChange([...selectedTechnologyIds, techId]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-sm">
              {selectedTechnologyIds.length > 0
                ? `${selectedTechnologyIds.length} ${selectedTechnologyIds.length > 1 ? "technologies" : "technology"}`
                : m.technology_picker_title()}
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
                placeholder={m.technology_picker_search()}
                className="h-8 text-sm"
              />
            </div>
            <div className="max-h-48 overflow-y-auto px-1 pb-1">
              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                  {m.technology_picker_empty()}
                </p>
              ) : (
                filtered.map((tech) => {
                  const isSelected = selectedTechnologyIds.includes(tech.id);
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                      onClick={() => toggle(tech.id)}
                    >
                      <span
                        className={`flex size-4 items-center justify-center rounded-sm border ${isSelected ? "border-primary bg-primary text-primary-foreground" : ""}`}
                      >
                        {isSelected && <Check className="size-3" />}
                      </span>
                      <span className="text-sm">{tech.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {selectedTechnologyIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTechnologyIds
            .map((id) => workspaceTechnologies.find((t) => t.id === id))
            .filter(Boolean)
            .map((tech) => (
              <TechnologyBadge key={tech.id} name={tech.name} iconSlug={tech.iconSlug} />
            ))}
        </div>
      )}
    </div>
  );
}
