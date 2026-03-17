import { X, Star } from "lucide-react";
import { Badge } from "#/components/ui/badge";

interface TechnologyBadgeProps {
  name: string;
  iconSlug?: string | null;
  isIcon?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function TechnologyBadge({
  name,
  isIcon,
  onRemove,
  className,
}: TechnologyBadgeProps) {
  return (
    <Badge variant="secondary" className={`gap-1 ${className ?? ""}`}>
      {isIcon && <Star className="size-3 fill-current" />}
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-sm hover:bg-muted"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}
