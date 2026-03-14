# Phase 7b — Flows (Step-by-Step Sequences)

## Status: Not Started

## Goal

Add a Flows feature where users define numbered step-by-step interaction sequences that show how data moves through
the system. Users can play through flows like a slideshow, with each step highlighting the active relationship.

## Prerequisites

- Phase 7a (Connection Highlighting & Edge Animation) — complete (reuses highlight + animation infrastructure)

## What is a Flow?

A **Flow** is an ordered sequence of steps overlaid on a diagram, showing how a user request (or data) travels
through the architecture. Example:

```
Flow: "User places an order"
  Step 1: User → Web App           "Submits order form"
  Step 2: Web App → API Gateway    "POST /api/orders"
  Step 3: API Gateway → Order Service  "Routes to order handler"
  Step 4: Order Service → Database  "INSERT order record"
  Step 5: Order Service → Email     "Send confirmation email"
  Step 6: Email → User              "Order confirmation"
```

Each step references a relationship on the diagram. When playing the flow, steps highlight one at a time with
animated edges showing data direction.

## Data Model

**`flows`** (a named sequence within a diagram):

| Column                     | Type           | Notes                       |
|----------------------------|----------------|-----------------------------|
| `id`                       | uuid, PK       |                             |
| `diagram_id`               | FK → diagrams  |                             |
| `name`                     | text           | e.g. "User places an order" |
| `description`              | text, nullable | Optional longer description |
| `created_by`               | FK → users     |                             |
| `created_at`, `updated_at` | timestamps     |                             |

**`flow_steps`** (ordered steps within a flow):

| Column               | Type               | Notes                                         |
|----------------------|--------------------|-----------------------------------------------|
| `id`                 | uuid, PK           |                                               |
| `flow_id`            | FK → flows         |                                               |
| `step_number`        | integer            | 1-based ordering                              |
| `relationship_id`    | FK → relationships | Which relationship this step traverses        |
| `label`              | text               | Step description, e.g. "Submits order form"   |
| `direction_override` | enum, nullable     | Override relationship direction for this step |

## Tasks

### Flow CRUD

- [ ] Drizzle schema for `flows` and `flow_steps` tables
- [ ] Run migration
- [ ] Server functions: create/update/delete flow
- [ ] Server functions: add/remove/reorder steps within a flow
- [ ] Validation: step's relationship must exist on the flow's diagram

### Flow List & Editor

- [ ] "Flows" tab in the diagram side panel (alongside Properties)
- [ ] Flow list: shows all flows for the current diagram
- [ ] Create flow dialog: name + description
- [ ] Flow step editor:
    - Ordered list of steps (drag to reorder)
    - Add step: click a relationship on the canvas → adds as next step
    - Each step shows: step number, source → target names, label (editable)
    - Remove step button
    - Direction override (optional — use relationship's direction by default)

### Flow Player

- [ ] "Play" button on a flow → enters flow playback mode:
    - All elements and edges dim to low opacity
    - Step 1 highlights: source node, target node, and the edge between them animate
    - Step number badge shows on the edge label (e.g., "① Submits order form")
    - "Next step" / "Previous step" buttons (or arrow keys)
    - Progress indicator: "Step 2 of 6"
- [ ] "Play all" mode: auto-advance through steps with a configurable delay (2-3 seconds per step)
- [ ] "Show all steps" mode: all steps highlighted simultaneously with numbered badges on each edge
- [ ] Exit playback: press Escape or click "Exit" button → restore normal canvas state

### Flow Step Badges on Canvas

- [ ] When a flow is active (selected in the panel), show numbered step badges on the canvas:
    - Small numbered circles on the edges (①, ②, ③...)
    - Badge positioned near the edge label
    - Badges are view-only (not interactive in this mode)
- [ ] When no flow is active, badges are hidden

### Integration with Export

- [ ] Flow steps included in diagram JSON export
- [ ] Flow steps included in revision snapshots
- [ ] PNG/SVG export option: "Include flow step numbers" (renders badges in export)

## CLI Commands

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Key Files

- `src/lib/schema/flows.ts` — Drizzle schemas for flows + flow_steps
- `src/lib/server/flows.ts` — flow CRUD server functions
- `src/components/editor/panels/flow-list.tsx` — flows tab in side panel
- `src/components/editor/panels/flow-step-editor.tsx` — step list with drag reorder
- `src/components/editor/flow-player.tsx` — playback controls and logic
- `src/components/editor/flow-step-badge.tsx` — numbered badge on canvas edges

## Design Notes

- **Flows are per-diagram:** A flow belongs to a specific diagram. The same conceptual flow can be recreated on
  different diagrams that show different levels of detail.
- **Steps reference relationships, not edges:** A flow step points to a `relationship_id` (phase 2b data), not a
  `diagram_relationship_id` (phase 3a visual data). This means the flow is meaningful even if the diagram's visual
  layout changes.
- **Direction override:** Sometimes a relationship is bidirectional, but in a specific flow the data moves in only
  one direction for that step. The `direction_override` lets the flow show the correct direction without changing
  the relationship's base direction.
- **Reuses phase 7a infrastructure:** The highlight/dim logic and edge animation from 7a are reused by the flow
  player. The player just controls which elements are highlighted at each step.

## Verification

- [ ] Create a flow with multiple steps
- [ ] Steps reference valid relationships on the diagram
- [ ] Step editor supports drag to reorder
- [ ] Flow player highlights steps one at a time
- [ ] "Play all" auto-advances through steps
- [ ] "Show all steps" displays all numbered badges simultaneously
- [ ] Arrow keys navigate between steps
- [ ] Escape exits playback mode
- [ ] Numbered badges appear on canvas edges when flow is active
- [ ] Flows included in export and revisions
- [ ] `pnpm dev` and `pnpm build` succeed
