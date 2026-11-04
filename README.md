# LabForge

A static marketing site for a fictional cloud-labs product, built with Astro and Tailwind CSS by directing an AI coding agent against a testable spec.

**Live:** https://labforge-chi.vercel.app

> LabForge is a fictional product built as a portfolio project. There is nothing to sign up for, and the testimonials and prices on the site are labelled as placeholders and examples.

## What this project demonstrates

- **Directing an AI coding agent** with [`AGENTS.md`](AGENTS.md) (stack, conventions, boundaries, definition of done) and [`SPEC.md`](SPEC.md) (features written as testable acceptance criteria with IDs like `F4.3`).
- **Reviewing every PR**: each feature landed as one pull request with a description that maps tests to criteria and quotes all new copy next to the product fact it's based on.
- **68 Playwright tests mapped to criterion IDs**: every `[Playwright]` criterion in the spec has a test whose title starts with its ID (for example `F5.5 unknown URL returns HTTP 404 and shows the custom 404 page`).
- **Mutation-checking the tests**: code was broken on purpose (wrong price, missing `noindex`, a 300 ms transition, a third-party script, …) to confirm the matching test fails, then reverted.
- **Lighthouse 100 on all main pages** (mobile), in all four categories.

## Features

- **Light/dark theme without a flash**: follows the system setting on first visit, remembers the choice in `localStorage`, and sets the theme with an inline script before first paint.
- **Technical SEO**: unique titles and meta descriptions, Open Graph and Twitter tags, canonical URLs without trailing slashes, a generated sitemap and `robots.txt`, and JSON-LD for `Organization`, `SoftwareApplication` (offers built from the pricing data) and `FAQPage` (built from the same data as the visible FAQ). The 404 page is `noindex` with no canonical link.
- **Accessible layout**: a skip link, one `h1` per page with no skipped heading levels, visible focus states on every link and button, touch targets of at least 24×24 px, and no motion when reduced motion is requested.
- **Small and first-party**: system fonts only, no third-party requests, and under 1 KB of JavaScript per page.

## Stack

| Package | Version |
| ------- | ------- |
| [Astro](https://astro.build) | ^7.4.5 |
| [Tailwind CSS](https://tailwindcss.com) (via `@tailwindcss/vite`) | ^4.3.4 |
| `@astrojs/sitemap` | ^3.7.4 |
| `@playwright/test` (Chromium only) | ^1.64.1 |
| Node.js | >=22.23.4 |

Hosted on Vercel as a static site. `vercel.json` enables `cleanUrls`, so `/pricing` serves `pricing.html`. No client-side framework is used.

## Project structure

```
public/            Static assets (favicon.svg, og-image.png)
scripts/           og-image.mjs + og-card.html: regenerate the Open Graph image
src/
  pages/           index, pricing, about, 404, robots.txt.ts (endpoint)
  layouts/         BaseLayout.astro: <head>, header, footer, theme script
  components/      Header, Footer, ThemeToggle, Seo
    home/          Home page sections and the shared CtaLink
    jsonld/        One component per schema.org type, plus the JsonLd renderer
  data/            All copy and data (pricing.ts, faq.ts, …), reused by pages and JSON-LD
  utils/           paths.ts (URL normalization)
  styles/          global.css: Tailwind entry and dark-mode variant
tests/             Playwright specs, one per feature (f1-layout … f9-perf-a11y) + helpers.ts
astro.config.mjs   site URL, URL format, sitemap integration, Tailwind
playwright.config.ts
vercel.json
```

## Commands

Run from the project root (PowerShell):

| Task | Command |
| ---- | ------- |
| Install | `npm install`, then once: `npx playwright install chromium` |
| Dev server | `npm run dev` |
| Build | `npm run build` (output: `dist/`) |
| Test | `npm test` (builds, serves the production build on port 4322, runs Playwright) |
| Test against production | `$env:BASE_URL="https://labforge-chi.vercel.app"; npm test` (no local server; `Remove-Item Env:BASE_URL` to go back) |
| OG image | `npm run og:image` (regenerates `public/og-image.png` at 1200×630) |

## How it was built

Every feature followed the same loop:

1. **Spec**: the feature and its acceptance criteria are written in [`SPEC.md`](SPEC.md), with decisions recorded in its Decisions table.
2. **Plan mode**: the agent reads the spec and code and proposes a plan. Nothing is changed until the plan is approved.
3. **Branch**: one feature per branch (`feat/…`, `fix/…`, `docs/…`), never on `main`.
4. **PR**: the agent implements the feature with tests, runs `npm test` and `npx playwright test --repeat-each=3`, mutation-checks the new tests, and opens a PR describing what was verified.
5. **Review**: I review the diff, including every change to existing tests, and check claims against evidence.
6. **Squash merge** into `main`.

The rules the agent works under are in [`AGENTS.md`](AGENTS.md). What went wrong, what worked, and what changed as a result is in [`LEARNINGS.md`](LEARNINGS.md).
