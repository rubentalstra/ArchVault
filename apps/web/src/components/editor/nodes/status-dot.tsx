import { STATUS_DOT_COLORS } from "#/lib/display/element.display";
import type { ElementStatus } from "@archvault/shared/elements";

export function StatusDot({ status }: { status: ElementStatus }) {
  return (
    <span
      className={`inline-block size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[status]}`}
      title={status}
    />
  );
}
