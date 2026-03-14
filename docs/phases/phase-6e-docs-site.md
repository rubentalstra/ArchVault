# Phase 6e — Documentation Site (Starlight)

## Status: Not Started

## Goal

Build a documentation site using Starlight (Astro), deployed to GitHub Pages via GitHub Actions. Covers user guides,
self-hosting, block format specification, API reference, and contributing guidelines.

## Prerequisites

- Phases 5a, 5b, 5c — complete

## Tasks

### Starlight Setup

- [ ] Create docs site in `docs-site/` directory:
    ```bash
    pnpm create astro@latest docs-site -- --template starlight
    ```
- [ ] Configure `docs-site/astro.config.mjs`:
    ```ts
    import { defineConfig } from 'astro/config';
    import starlight from '@astrojs/starlight';

    export default defineConfig({
      site: 'https://archvault.github.io',
      base: '/Archvault/',
      integrations: [
        starlight({
          title: 'Archvault Docs',
          logo: { src: './src/assets/logo.svg' },
          social: { github: 'https://github.com/archvault/archvault' },
          defaultLocale: 'en',
          locales: {
            en: { label: 'English' },
            nl: { label: 'Nederlands' },
          },
          sidebar: [
            { label: 'Getting Started', autogenerate: { directory: 'getting-started' } },
            { label: 'Guides', autogenerate: { directory: 'guides' } },
            { label: 'Self-Hosting', autogenerate: { directory: 'self-hosting' } },
            { label: 'Block Format', autogenerate: { directory: 'blocks' } },
            { label: 'API Reference', autogenerate: { directory: 'reference' } },
            { label: 'Contributing', autogenerate: { directory: 'contributing' } },
          ],
          editLink: { baseUrl: 'https://github.com/archvault/archvault/edit/main/docs-site/' },
          customCss: ['./src/styles/custom.css'],
        }),
      ],
    });
    ```
- [ ] Add custom CSS to match Archvault brand colors
- [ ] Add logo asset

### Documentation Content

- [ ] **Getting Started:**
    - `introduction.mdx` — What is Archvault, C4 model overview, screenshots
    - `quick-start.mdx` — Docker Compose quick start (5 min setup)
    - `concepts.mdx` — Core concepts: workspaces, elements, relationships, diagrams, blocks
- [ ] **Guides:**
    - `creating-diagrams.mdx` — Step-by-step guide to creating C4 diagrams
    - `using-blocks.mdx` — How to browse, install, and create blocks
    - `collaboration.mdx` — Organizations, teams, roles, permissions
    - `keyboard-shortcuts.mdx` — Full shortcut reference
    - `flows.mdx` — Creating and playing step-by-step flows
    - `export-import.mdx` — Exporting diagrams (PNG/SVG/JSON) and workspace backup
- [ ] **Self-Hosting:**
    - `docker-compose.mdx` — Production deployment guide
    - `environment-variables.mdx` — Full env var reference with descriptions
    - `reverse-proxy.mdx` — Caddy/Nginx configuration
    - `backup-restore.mdx` — Database backup and restore procedures
    - `upgrading.mdx` — How to upgrade between versions
- [ ] **Block Format:**
    - `specification.mdx` — Full block JSON format with annotated examples
    - `input-types.mdx` — Text, select, boolean inputs with examples
    - `templates.mdx` — `{{placeholder}}` syntax, `conditional_on` logic
    - `block-types.mdx` — System, container, component block rules
    - `community-registry.mdx` — How to submit blocks to the community registry
- [ ] **API Reference:**
    - `server-functions.mdx` — Server function reference (elements, relationships, diagrams, blocks)
    - `data-model.mdx` — Database schema reference (all tables)
    - `types.mdx` — TypeScript type reference (AppNode, AppEdge, Block, etc.)
- [ ] **Contributing:**
    - `development-setup.mdx` — Local dev environment setup
    - `code-style.mdx` — Conventions, patterns, linting
    - `testing.mdx` — How to write and run tests
    - `pull-requests.mdx` — PR process and review guidelines

### Starlight Features to Enable

- [ ] **Pagefind search** (built-in, zero config)
- [ ] **Dark mode** toggle (built-in)
- [ ] **i18n** (English + Dutch)
- [ ] **Edit on GitHub** links on every page
- [ ] **Code blocks** with syntax highlighting (Shiki, built-in)
- [ ] **Admonitions** (note, tip, caution, danger callouts)

### GitHub Actions — Docs Deployment

Uses the official [`withastro/action@v5`](https://github.com/withastro/action) for build + artifact upload,
which handles pnpm detection, caching, and output directory automatically.

- [ ] Create `.github/workflows/deploy-docs.yml`:
    ```yaml
    name: Deploy Docs to GitHub Pages

    on:
      push:
        branches: [main]
        paths: ['docs-site/**']
      workflow_dispatch:

    permissions:
      contents: read
      pages: write
      id-token: write

    concurrency:
      group: pages
      cancel-in-progress: true

    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout repository
            uses: actions/checkout@v6
          - name: Install, build, and upload docs site
            uses: withastro/action@v5
            with:
              path: docs-site
              package-manager: pnpm@latest

      deploy:
        needs: build
        runs-on: ubuntu-latest
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        steps:
          - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v4
    ```

### Project README

- [ ] Update root `README.md` with:
    - Project overview + screenshot
    - Quick start (Docker Compose)
    - Link to full documentation site
    - Tech stack summary
    - Contributing link
    - License

## Key Files

```
docs-site/
├── astro.config.mjs
├── package.json
├── src/
│   ├── assets/logo.svg
│   ├── content/docs/
│   │   ├── getting-started/
│   │   ├── guides/
│   │   ├── self-hosting/
│   │   ├── blocks/
│   │   ├── reference/
│   │   └── contributing/
│   └── styles/custom.css
└── public/

.github/workflows/
└── deploy-docs.yml

README.md
```

## Verification

- [ ] Docs site builds locally (`cd docs-site && pnpm build`)
- [ ] Docs site deploys to GitHub Pages on push to main
- [ ] Pagefind search indexes all content and returns results
- [ ] Dark mode toggle works
- [ ] All doc pages render correctly with proper sidebar navigation
- [ ] i18n works (English + Dutch)
- [ ] Edit on GitHub links point to correct files
- [ ] Root README has overview, quick start, and docs link
- [ ] `pnpm dev` and `pnpm build` succeed (main app)
