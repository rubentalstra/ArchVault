# Phase 4b — Official Blocks

## Status: Not Started

## Goal

Create 8-12 official blocks bundled with the app, covering common architecture patterns across system, container,
and component levels.

## Prerequisites

- Phase 4a (Block Schemas & Validation) — complete

## Storage

Official blocks are **bundled in the repo** as JSON files in the `blocks/official/` directory, organized by type.
They ship with the app and are available immediately — no network requests needed.

## Planned Blocks

### System Blocks (top-level architecture starters)

| Block Name                | Creates                                                                                      |
|---------------------------|----------------------------------------------------------------------------------------------|
| **Web App + API + DB**    | User (person), Web App (system), API (system), Database (system), relationships between them |
| **Microservices Starter** | User, API Gateway, 2-3 microservices, message broker, database                               |
| **SaaS Platform**         | End User, Admin, Web App, API, Auth Service, Database, Email                                 |

### Container Blocks (inside a system)

| Block Name                | Creates (inside a target System)                               |
|---------------------------|----------------------------------------------------------------|
| **REST API + PostgreSQL** | API container, PostgreSQL container, relationship              |
| **API + Cache + DB**      | API, Redis cache (conditional), PostgreSQL, relationships      |
| **Frontend + BFF + API**  | SPA frontend, BFF (Backend for Frontend), API, relationships   |
| **Message Queue Workers** | Queue (RabbitMQ/Kafka), N worker containers, dead letter queue |

### Component Blocks (inside a container)

| Block Name        | Creates (inside a target Container)                         |
|-------------------|-------------------------------------------------------------|
| **Auth Module**   | Auth controller, User service, Token service, relationships |
| **CRUD Service**  | Controller, Service, Repository components, relationships   |
| **Event Handler** | Event listener, Processor, Publisher components             |

## Tasks

- [ ] Create directory structure: `blocks/official/{system,container,component}/`
- [ ] Write system blocks (3 blocks):
    - `web-app-api-db.json`
    - `microservices-starter.json`
    - `saas-platform.json`
- [ ] Write container blocks (4 blocks):
    - `rest-api-postgres.json`
    - `api-cache-db.json`
    - `frontend-bff-api.json`
    - `message-queue-workers.json`
- [ ] Write component blocks (3 blocks):
    - `auth-module.json`
    - `crud-service.json`
    - `event-handler.json`
- [ ] Validate all blocks against Zod schemas (automated test)
- [ ] Test template resolution for each block with sample inputs
- [ ] Create `blocks/official/index.ts` — exports list of all official blocks with metadata for the browser
- [ ] Each block has meaningful inputs (e.g., language choice, optional components, naming)

## Key Files

- `blocks/official/system/web-app-api-db.json`
- `blocks/official/system/microservices-starter.json`
- `blocks/official/system/saas-platform.json`
- `blocks/official/container/rest-api-postgres.json`
- `blocks/official/container/api-cache-db.json`
- `blocks/official/container/frontend-bff-api.json`
- `blocks/official/container/message-queue-workers.json`
- `blocks/official/component/auth-module.json`
- `blocks/official/component/crud-service.json`
- `blocks/official/component/event-handler.json`
- `blocks/official/index.ts` — block registry index
- `tests/blocks/official-blocks.test.ts` — validates all official blocks

## Verification

- [ ] All blocks pass schema validation (automated test)
- [ ] Template resolution works with sample inputs for each block
- [ ] Conditional elements work (e.g., optional Redis cache)
- [ ] Blocks cover diverse, practical architecture patterns
- [ ] `pnpm dev` and `pnpm build` succeed
