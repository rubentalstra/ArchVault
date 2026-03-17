import { type ReactNode, useState } from "react";

interface TechIconProps {
  slug: string;
  className?: string;
  fallback?: ReactNode;
}

export function TechIcon({ slug, className = "size-5", fallback }: TechIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed && fallback) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}`}
      alt={slug}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
