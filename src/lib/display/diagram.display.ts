import { Box, Package, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { m } from "#/paraglide/messages";
import type { DiagramType } from "@archvault/shared/diagrams";

// ── Type labels (Paraglide i18n) ────────────────────────────────────

export const DIAGRAM_TYPE_LABELS: Record<DiagramType, () => string> = {
  system_context: () => `${m.diagram_level_1()} — ${m.diagram_type_system_context()}`,
  container: () => `${m.diagram_level_2()} — ${m.diagram_type_container()}`,
  component: () => `${m.diagram_level_3()} — ${m.diagram_type_component()}`,
};

// ── Type descriptions (Paraglide i18n) ──────────────────────────────

export const DIAGRAM_TYPE_DESCRIPTIONS: Record<DiagramType, () => string> = {
  system_context: () => m.diagram_level_1_description(),
  container: () => m.diagram_level_2_description(),
  component: () => m.diagram_level_3_description(),
};

// ── Type icons (Lucide) ─────────────────────────────────────────────

export const DIAGRAM_TYPE_ICONS: Record<DiagramType, LucideIcon> = {
  system_context: Box,
  container: Package,
  component: Cpu,
};

// ── Type colors (Tailwind badge classes) ────────────────────────────

export const DIAGRAM_TYPE_COLORS: Record<DiagramType, string> = {
  system_context: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  container: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  component: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};
