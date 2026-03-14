# Phase 4a — Block Schemas & Validation

## Status: Not Started

## Goal

Define the block JSON format, Zod validators, and template resolution engine for reusable architecture templates.

## Prerequisites

- Phase 3f (Revisions) — complete

## What is a Block?

A **block** is a reusable architecture template defined as a JSON file. When a user "installs" a block into their
workspace, it creates a set of elements + relationships based on the template, with user-provided inputs substituted
into names, descriptions, and technologies.

Example: A "REST API + PostgreSQL" container block might create:

- An API Server container (technology: user picks Node.js/Go/Python)
- A PostgreSQL database container
- A relationship: API Server → PostgreSQL (technology: "SQL/TCP")

## Block JSON Format

```jsonc
{
  "schema_version": "1.0",
  "block_type": "container",          // "system" | "container" | "component"
  "metadata": {
    "name": "REST API + PostgreSQL",
    "summary": "A REST API server with PostgreSQL database",
    "description": "Creates an API server and PostgreSQL database...",
    "icon": "server",                  // Lucide icon name
    "category": "backend",            // For filtering in the browser
    "tags": ["api", "database", "rest"],
    "author": "archvault",            // "archvault" for official blocks
    "version": "1.0.0"
  },
  "inputs": [
    {
      "key": "api_name",
      "label": "API Server Name",
      "type": "text",                  // "text" | "select" | "boolean"
      "default": "API Server",
      "required": true
    },
    {
      "key": "language",
      "label": "Language",
      "type": "select",
      "options": ["Node.js", "Go", "Python"],
      "default": "Node.js"
    },
    {
      "key": "include_cache",
      "label": "Include Redis Cache?",
      "type": "boolean",
      "default": false
    }
  ],
  "elements": [
    {
      "template_key": "api",
      "element_type": "container",
      "name": "{{api_name}}",
      "display_description": "REST API built with {{language}}",
      "technology": "{{language}}",
      "external": false
    },
    {
      "template_key": "db",
      "element_type": "container",
      "name": "Database",
      "display_description": "Primary data store",
      "technology": "PostgreSQL"
    },
    {
      "template_key": "cache",
      "element_type": "container",
      "name": "Cache",
      "technology": "Redis",
      "conditional_on": "include_cache"   // only created if input is true
    }
  ],
  "relationships": [
    {
      "source": "api",                 // references template_key
      "target": "db",
      "direction": "outgoing",
      "description": "Reads/writes data",
      "technology": "SQL/TCP"
    },
    {
      "source": "api",
      "target": "cache",
      "direction": "outgoing",
      "description": "Caches responses",
      "technology": "Redis Protocol",
      "conditional_on": "include_cache"
    }
  ]
}
```

## Block Types & Rules

| Block Type  | Creates                      | Requires Parent Element?            |
|-------------|------------------------------|-------------------------------------|
| `system`    | Persons, Systems             | No — creates top-level elements     |
| `container` | Containers (+ relationships) | Yes — user picks a target System    |
| `component` | Components (+ relationships) | Yes — user picks a target Container |

## Data Model

No DB tables in this phase — blocks are JSON files. The `block_installations` table is created in phase 4c.

## Tasks

- [ ] Define Zod schema for block JSON format (`BlockSchema`):
    - `schema_version` (literal "1.0")
    - `block_type` (enum)
    - `metadata` (name, summary, description, icon, category, tags, author, version)
    - `inputs[]` (key, label, type, options, default, required)
    - `elements[]` (template_key, element_type, name, display_description, technology, external, conditional_on)
    - `relationships[]` (source, target, direction, description, technology, conditional_on)
- [ ] Separate Zod refinements per block type:
    - System block: element_type must be `person` or `system`
    - Container block: element_type must be `container`
    - Component block: element_type must be `component`
- [ ] `parseBlock(json)` — validate block JSON against schema, return typed result or error
- [ ] Template validation:
    - All `{{input_key}}` references must match a defined input
    - All `conditional_on` values must reference a boolean input
    - All relationship `source`/`target` must reference a valid `template_key`
    - `template_key` values must be unique within a block
- [ ] Template resolution engine `resolveBlock(block, inputs)`:
    - Replace all `{{input_key}}` placeholders with user-provided values
    - Filter out elements/relationships where `conditional_on` input is false
    - Return resolved elements[] and relationships[] ready to create in DB
- [ ] Unit tests for:
    - Valid block parsing (all 3 types)
    - Invalid block detection (missing fields, bad references, type mismatches)
    - Template resolution with various inputs
    - Conditional element inclusion/exclusion

## Key Files

- `src/lib/blocks/block-schema.ts` — Zod schema for block JSON format
- `src/lib/blocks/parse-block.ts` — parse + validate block JSON
- `src/lib/blocks/resolve-block.ts` — template resolution engine
- `src/lib/blocks/types.ts` — TypeScript types for Block, BlockInput, BlockElement, etc.
- `tests/blocks/parse-block.test.ts` — validation tests
- `tests/blocks/resolve-block.test.ts` — resolution tests

## Verification

- [ ] Valid blocks of all 3 types parse without errors
- [ ] Invalid blocks produce clear, specific validation errors
- [ ] Template resolution replaces all `{{placeholders}}` correctly
- [ ] `conditional_on` correctly includes/excludes elements and relationships
- [ ] All unit tests pass
- [ ] `pnpm dev` and `pnpm build` succeed
