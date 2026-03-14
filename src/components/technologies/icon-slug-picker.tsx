import { useState, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { TechIcon } from "#/components/technologies/tech-icon";
import { m } from "#/paraglide/messages";

// Common technology icon slugs — curated subset for fast search
// Users can still type a slug manually if they know it
const POPULAR_SLUGS = [
  "react", "vuedotjs", "angular", "svelte", "nextdotjs", "nuxtdotjs",
  "typescript", "javascript", "nodedotjs", "deno", "bun",
  "python", "go", "rust", "java", "csharp", "kotlin", "swift", "ruby", "php",
  "postgresql", "mysql", "mongodb", "redis", "sqlite", "mariadb",
  "docker", "kubernetes", "terraform", "ansible",
  "amazonaws", "googlecloud", "microsoftazure", "cloudflare", "vercel", "netlify",
  "git", "github", "gitlab", "bitbucket",
  "linux", "ubuntu", "debian", "apple", "windows",
  "nginx", "apache", "caddy",
  "graphql", "grpc", "openapi",
  "tailwindcss", "sass", "css3", "html5",
  "figma", "storybook",
  "jest", "vitest", "playwright", "cypress",
  "webpack", "vite", "esbuild", "rollup",
  "eslint", "prettier",
  "electron", "tauri",
  "firebase", "supabase", "prisma", "drizzle",
  "stripe", "auth0",
  "rabbitmq", "apachekafka",
  "elastic", "grafana", "prometheus", "datadog",
  "spring", "django", "flask", "fastapi", "express", "nestjs", "rails",
  "dotnet", "blazor",
  "flutter", "reactnative", "expo",
  "unity", "unrealengine",
  "openai", "anthropic",
];

interface IconSlugPickerProps {
  value: string | null;
  onChange: (slug: string | null) => void;
}

export function IconSlugPicker({ value, onChange }: IconSlugPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return POPULAR_SLUGS;
    const q = search.toLowerCase();
    return POPULAR_SLUGS.filter((slug) => slug.includes(q));
  }, [search]);

  const handleSelect = useCallback(
    (slug: string) => {
      onChange(slug);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {value ? (
              <span className="flex items-center gap-2">
                <TechIcon slug={value} className="size-4" />
                <span className="text-sm">{value}</span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {m.technology_icon_label()}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="flex flex-col">
            <div className="p-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={m.technology_placeholder_search()}
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto px-1 pb-1">
              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                  {m.technology_picker_empty()}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-0.5">
                  {filtered.map((slug) => (
                    <button
                      key={slug}
                      type="button"
                      className={`flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-accent ${
                        value === slug ? "bg-accent" : ""
                      }`}
                      onClick={() => handleSelect(slug)}
                    >
                      <TechIcon slug={slug} className="size-4 shrink-0" />
                      <span className="truncate">{slug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {value && (
        <div className="flex items-center gap-2">
          <TechIcon slug={value} className="size-5" />
          <span className="text-sm">{value}</span>
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto rounded-sm p-0.5 hover:bg-muted"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
