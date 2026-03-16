import {
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { m } from "#/paraglide/messages";
import type { ConnectionDirection } from "@archvault/shared/connections";

// ── Direction labels (Paraglide i18n) ───────────────────────────────

export const CONNECTION_DIRECTION_LABELS: Record<ConnectionDirection, () => string> = {
  outgoing: () => m.connection_direction_outgoing(),
  incoming: () => m.connection_direction_incoming(),
  bidirectional: () => m.connection_direction_bidirectional(),
  none: () => m.connection_direction_none(),
};

// ── Direction icons (Lucide) ────────────────────────────────────────

export const CONNECTION_DIRECTION_ICONS: Record<ConnectionDirection, LucideIcon> = {
  outgoing: ArrowRight,
  incoming: ArrowLeft,
  bidirectional: ArrowLeftRight,
  none: Minus,
};
