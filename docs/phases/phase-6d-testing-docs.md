# Phase 6d — E2E Testing & CI

## Status: Not Started

## Goal

Add end-to-end tests with Playwright covering full user workflows, and set up GitHub Actions CI to run them on
every PR. Note: unit tests are written alongside each phase — this phase adds E2E tests only.

## Prerequisites

- Phases 5a, 5b, 5c — complete

## Testing Strategy (across all phases)

Tests are written **alongside each phase**, not deferred:

| Phase | Tests Written                                                  |
|-------|----------------------------------------------------------------|
| 2a    | Element CRUD, hierarchy validation, technology/link CRUD       |
| 2b    | Relationship CRUD, direction validation, self-ref prevention   |
| 2c    | Tag CRUD, assignment, filtering                                |
| 3a    | Diagram CRUD, scope validation, element/relationship placement |
| 4a    | Block parsing, template resolution, conditional logic          |
| 4b    | All official blocks pass schema validation                     |
| 4c    | Block install/uninstall, installation tracking                 |

## Tasks

### Playwright Setup

- [ ] Install and configure Playwright (`pnpm add -D @playwright/test`)
- [ ] Create `playwright.config.ts`:
    - Base URL: `http://localhost:3000`
    - Browsers: Chromium (primary), Firefox, WebKit
    - Screenshot on failure
    - Video on retry
    - Web server: auto-start dev server before tests

### E2E Test Suites

- [ ] **Auth flow:** sign up → verify → log in → log out
- [ ] **Organization + workspace:** create org → invite member → create workspace
- [ ] **Element CRUD:** create person, system, container, component → verify in tree and table
- [ ] **Relationship creation:** create 2 elements → create relationship → verify in table
- [ ] **Diagram editor:** open diagram → add elements → drag → add relationship → save → reload → verify
- [ ] **Block install:** open browser → pick block → fill inputs → install → verify elements created
- [ ] **Export/import:** export workspace JSON → import into new workspace → verify entities match
- [ ] **Permissions:** viewer can't edit, admin can manage members, owner can delete

### GitHub Actions — E2E Tests

- [ ] Create `.github/workflows/e2e-tests.yml`:
    ```yaml
    name: E2E Tests

    on:
      pull_request:
        branches: [main]

    jobs:
      e2e:
        runs-on: ubuntu-latest
        services:
          postgres:
            image: postgres:16
            env:
              POSTGRES_USER: archvault
              POSTGRES_PASSWORD: test
              POSTGRES_DB: archvault_test
            ports: ['5432:5432']
            options: >-
              --health-cmd pg_isready
              --health-interval 10s
              --health-timeout 5s
              --health-retries 5
        steps:
          - uses: actions/checkout@v4
          - uses: pnpm/action-setup@v4
          - uses: actions/setup-node@v4
            with:
              node-version: 22
              cache: pnpm
          - run: pnpm install --frozen-lockfile
          - run: pnpm exec playwright install --with-deps chromium
          - run: pnpm build
          - run: pnpm test:e2e
            env:
              DATABASE_URL: postgresql://archvault:test@localhost:5432/archvault_test
          - uses: actions/upload-artifact@v4
            if: failure()
            with:
              name: playwright-report
              path: playwright-report/
    ```

### GitHub Actions — Unit Tests & Lint

- [ ] Create `.github/workflows/ci.yml`:
    ```yaml
    name: CI

    on:
      pull_request:
        branches: [main]
      push:
        branches: [main]

    jobs:
      lint-and-test:
        runs-on: ubuntu-latest
        services:
          postgres:
            image: postgres:16
            env:
              POSTGRES_USER: archvault
              POSTGRES_PASSWORD: test
              POSTGRES_DB: archvault_test
            ports: ['5432:5432']
            options: >-
              --health-cmd pg_isready
              --health-interval 10s
              --health-timeout 5s
              --health-retries 5
        steps:
          - uses: actions/checkout@v4
          - uses: pnpm/action-setup@v4
          - uses: actions/setup-node@v4
            with:
              node-version: 22
              cache: pnpm
          - run: pnpm install --frozen-lockfile
          - run: pnpm lint
          - run: pnpm build
          - run: pnpm test
            env:
              DATABASE_URL: postgresql://archvault:test@localhost:5432/archvault_test
    ```

## Key Files

```
tests/e2e/
├── auth.spec.ts
├── organization.spec.ts
├── elements.spec.ts
├── relationships.spec.ts
├── diagrams.spec.ts
├── blocks.spec.ts
├── export-import.spec.ts
└── permissions.spec.ts

playwright.config.ts

.github/workflows/
├── ci.yml                     — lint + unit tests on PR and push
└── e2e-tests.yml              — Playwright E2E on PR
```

## Verification

- [ ] All E2E tests pass locally (`pnpm test:e2e`)
- [ ] E2E tests pass in GitHub Actions CI
- [ ] Unit tests + lint run in CI on every PR
- [ ] Playwright report uploads as artifact on failure
- [ ] `pnpm dev` and `pnpm build` succeed
