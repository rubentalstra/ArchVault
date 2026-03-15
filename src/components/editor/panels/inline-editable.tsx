import { useState, useRef, useCallback, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { cn } from "#/lib/utils";

interface InlineEditableProps {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  className?: string;
  textClassName?: string;
}

export function InlineEditable({
  value,
  onSave,
  placeholder,
  multiline = false,
  maxLength,
  className,
  textClassName,
}: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (!editing) return;
    const el = multiline ? textareaRef.current : inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, [editing, multiline]);

  const commit = useCallback(async () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) {
      await onSave(trimmed);
    }
  }, [draft, value, onSave]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        void commit();
      }
      if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void commit();
      }
    },
    [commit, cancel, multiline],
  );

  if (editing) {
    if (multiline) {
      return (
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          rows={2}
          className={cn("text-sm", className)}
        />
      );
    }

    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        className={cn("text-sm", className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent",
        className,
      )}
    >
      <span
        className={cn(
          "min-w-0 flex-1 text-sm",
          !value && "italic text-muted-foreground",
          textClassName,
        )}
      >
        {value || placeholder}
      </span>
      <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
