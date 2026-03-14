import { useState, useMemo, useCallback } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "#/components/ui/combobox";
import { TechIcon } from "#/components/technologies/tech-icon";
import { m } from "#/paraglide/messages";
import iconsIndex from "#/components/technologies/simple-icons-index.json";

type IconEntry = { slug: string; title: string };

const ALL_ICONS: IconEntry[] = (iconsIndex as [string, string][]).map(
  ([slug, title]) => ({ slug, title }),
);

const MAX_RESULTS = 50;

interface IconSlugPickerProps {
  value: string | null;
  onChange: (slug: string | null) => void;
}

export function IconSlugPicker({ value, onChange }: IconSlugPickerProps) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const results: IconEntry[] = [];
    for (const icon of ALL_ICONS) {
      if (icon.title.toLowerCase().includes(q) || icon.slug.includes(q)) {
        results.push(icon);
        if (results.length >= MAX_RESULTS) break;
      }
    }
    return results;
  }, [search]);

  const handleChange = useCallback(
    (newValue: IconEntry | null) => {
      onChange(newValue?.slug ?? null);
    },
    [onChange],
  );

  const selectedItem = useMemo(
    () => ALL_ICONS.find((icon) => icon.slug === value) ?? null,
    [value],
  );

  const toLabel = useCallback((icon: IconEntry) => icon.title, []);

  return (
    <Combobox
      items={filteredItems}
      value={selectedItem}
      onValueChange={handleChange}
      itemToStringValue={toLabel}
      itemToStringLabel={toLabel}
      onInputValueChange={setSearch}
      autoHighlight
    >
      <ComboboxInput
        placeholder={m.technology_placeholder_search()}
        showClear={!!value}
      />
      <ComboboxContent>
        <ComboboxEmpty>
            {search.trim()
              ? m.technology_picker_empty()
              : m.technology_picker_type_to_search()}
          </ComboboxEmpty>
        <ComboboxList>
          {(icon) => (
            <ComboboxItem key={icon.slug} value={icon}>
              <TechIcon slug={icon.slug} className="size-4 shrink-0" />
              {icon.title}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
