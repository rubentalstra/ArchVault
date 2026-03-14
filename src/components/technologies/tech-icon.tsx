import { lazy, Suspense, useMemo } from "react";
import type { ComponentType, SVGProps } from "react";

// Cache for loaded icon components
const iconCache = new Map<string, ComponentType<SVGProps<SVGSVGElement>>>();
const iconPromiseCache = new Map<string, Promise<{ default: ComponentType<SVGProps<SVGSVGElement>> }>>();

function toComponentName(slug: string): string {
  // Simple Icons naming: slug "nodedotjs" → "SiNodedotjs", "react" → "SiReact"
  // Capitalize first letter
  return `Si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
}

function loadIcon(slug: string) {
  const componentName = toComponentName(slug);

  if (!iconPromiseCache.has(slug)) {
    const promise = import(`@icons-pack/react-simple-icons/icons/${componentName}.mjs`)
      .then((mod) => {
        const component = mod.default as ComponentType<SVGProps<SVGSVGElement>>;
        iconCache.set(slug, component);
        return { default: component };
      })
      .catch(() => {
        // Icon not found — return null placeholder
        const Placeholder: ComponentType<SVGProps<SVGSVGElement>> = () => null;
        iconCache.set(slug, Placeholder);
        return { default: Placeholder };
      });
    iconPromiseCache.set(slug, promise);
  }

  return iconPromiseCache.get(slug)!;
}

interface TechIconProps {
  slug: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function TechIcon({ slug, className = "size-5", fallback }: TechIconProps) {
  // Check synchronous cache first
  const cached = iconCache.get(slug);
  if (cached) {
    const Icon = cached;
    return <Icon className={className} />;
  }

  // Use lazy for async loading
  const LazyIcon = useMemo(
    () => lazy(() => loadIcon(slug)),
    [slug],
  );

  return (
    <Suspense fallback={fallback ?? null}>
      <LazyIcon className={className} />
    </Suspense>
  );
}
