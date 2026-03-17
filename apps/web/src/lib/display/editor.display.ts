import { User, Box, Package, Database, Cpu } from "lucide-react";
import { createElement } from "react";
import { m } from "#/paraglide/messages";
import type { ElementType } from "@archvault/shared/elements";

// ── Add element options (for toolbar & context menu) ────────────────

export const ADD_ELEMENT_OPTIONS: {
  type: ElementType;
  label: () => string;
  icon: React.ReactNode;
}[] = [
  { type: "actor", label: () => m.editor_toolbar_add_actor(), icon: createElement(User, { className: "mr-2 size-4" }) },
  { type: "system", label: () => m.editor_toolbar_add_system(), icon: createElement(Box, { className: "mr-2 size-4" }) },
  { type: "app", label: () => m.editor_toolbar_add_app(), icon: createElement(Package, { className: "mr-2 size-4" }) },
  { type: "store", label: () => m.editor_toolbar_add_store(), icon: createElement(Database, { className: "mr-2 size-4" }) },
  { type: "component", label: () => m.editor_toolbar_add_component(), icon: createElement(Cpu, { className: "mr-2 size-4" }) },
];
