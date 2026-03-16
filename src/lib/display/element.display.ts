import {
  User,
  Box,
  Package,
  Database,
  Cpu,
  Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { m } from "#/paraglide/messages";
import type { ElementType, ElementStatus } from "@archvault/shared/elements";

// ── Type labels (Paraglide i18n) ────────────────────────────────────

export const ELEMENT_TYPE_LABELS: Record<ElementType, () => string> = {
  actor: () => m.element_type_actor(),
  system: () => m.element_type_system(),
  app: () => m.element_type_app(),
  store: () => m.element_type_store(),
  component: () => m.element_type_component(),
};

// ── Status labels (Paraglide i18n) ──────────────────────────────────

export const ELEMENT_STATUS_LABELS: Record<ElementStatus, () => string> = {
  planned: () => m.element_status_planned(),
  live: () => m.element_status_live(),
  deprecated: () => m.element_status_deprecated(),
};

// ── Type icons (Lucide) ─────────────────────────────────────────────

export const ELEMENT_TYPE_ICONS: Record<ElementType, LucideIcon> = {
  actor: User,
  system: Server,
  app: Package,
  store: Database,
  component: Cpu,
};

// ── Type icons for canvas/nav (Box variant for system) ──────────────

export const ELEMENT_TYPE_NAV_ICONS: Record<string, LucideIcon> = {
  actor: User,
  system: Box,
  app: Package,
  store: Database,
  component: Cpu,
};

// ── Status dot colors (simple bg classes for small dots) ────────────

export const STATUS_DOT_COLORS: Record<ElementStatus, string> = {
  planned: "bg-blue-500",
  live: "bg-green-500",
  deprecated: "bg-red-500",
};

// ── Status badge colors (full badge styling with dark mode) ─────────

export const STATUS_BADGE_COLORS: Record<ElementStatus, string> = {
  planned: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  live: "text-green-600 bg-green-100 dark:bg-green-900/30",
  deprecated: "text-red-600 bg-red-100 dark:bg-red-900/30",
};

// ── New element names (Paraglide i18n) ──────────────────────────────

export const NEW_ELEMENT_NAMES: Record<ElementType, () => string> = {
  actor: () => m.editor_new_actor(),
  system: () => m.editor_new_system(),
  app: () => m.editor_new_app(),
  store: () => m.editor_new_store(),
  component: () => m.editor_new_component(),
};

// ── Status options for select dropdowns ─────────────────────────────

export const STATUS_OPTIONS: { value: ElementStatus; label: () => string }[] = [
  { value: "planned", label: () => m.element_status_planned() },
  { value: "live", label: () => m.element_status_live() },
  { value: "deprecated", label: () => m.element_status_deprecated() },
];
