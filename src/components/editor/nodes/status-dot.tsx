import type { ElementStatus } from "#/lib/element.validators";

const STATUS_COLORS: Record<ElementStatus, string> = {
  planned: "bg-blue-500",
  live: "bg-green-500",
  deprecated: "bg-red-500",
};

export function StatusDot({ status }: { status: ElementStatus }) {
  return (
    <span
      className={`inline-block size-2 shrink-0 rounded-full ${STATUS_COLORS[status]}`}
      title={status}
    />
  );
}
