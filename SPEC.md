# SPEC.md — LabForge marketing site

This is the feature spec for the LabForge marketing site. A feature is done when every acceptance criterion in its section passes (see `AGENTS.md` → Definition of done).

## Product facts

All site copy must stay within these facts. Do not invent customers, numbers, certifications, integrations, team members, or company history.

- LabForge gives training teams and software companies ready-to-use, hands-on cloud lab environments (Azure and AWS sandboxes).
- Labs launch in the browser and are used for courses, workshops, and product demos.
- Labs auto-delete after a time limit to control cost.
- Audience: L&D managers, technical trainers, DevRel teams.
- LabForge is a fictional product.

### Copy rule

- **Allowed:** explaining direct consequences of the facts and what they mean for the reader. For example, "launch in the browser" → learners don't install anything or configure cloud accounts; "auto-delete after a time limit" → no forgotten resources running up a bill.
- **Not allowed:** numbers, customers, logos, integrations, certifications, performance claims, or features not in the facts.

## Site facts

- Pages: `/` (home), `/pricing`, `/about`, and a custom 404.
- Site URL: **`https://labforge-chi.vercel.app`** (the production deployment on Vercel). It is set once, in `astro.config.mjs` → `site`. All absolute URLs (canonical, Open Graph, sitemap, robots.txt, JSON-LD) are derived from `site`.
- URLs have no trailing slash: `trailingSlash: 'never'` and `build.format: 'file'` (for example `/pricing`, built to `dist/pricing.html`). The home page URL is `https://labforge-chi.vercel.app/`, because a root URL always ends in `/`.
- Hosting: Vercel. `vercel.json` sets `"cleanUrls": true` and `"trailingSlash": false`, so `/pricing` serves `pricing.html` and `/pricing.html` redirects to `/pricing` (`astro preview` does the first mapping on its own; Vercel needs the setting).
- Fonts: system font stack only, no web fonts.
- Example pricing (USD), shown with a visible notice that prices are examples:

  | Plan       | Price              | Seats  | Lab hours / month | Max lab duration | Highlight      |
  | ---------- | ------------------ | ------ | ----------------- | ---------------- | -------------- |
  | Starter    | $49/month          | 5      | 50                | 2 hours          | —              |
  | Team       | $199/month         | 25     | 300               | 8 hours          | "Most popular" |
  | Enterprise | "Contact us"       | Custom | Custom            | Custom           | —              |

  Every plan also lists "Azure and AWS sandboxes" and "Labs auto-delete after the time limit". "Seats" means learners who can have a lab running at the same time.

## How criteria are verified

| Tag            | Meaning                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `[Playwright]` | Automated test in the Playwright suite (F10), run against the production build. Includes file/output checks run from the test suite. |
| `[Build]`      | Checked by running a command (`npm run build`, `npm test`, …) and inspecting its exit code or the `dist/` output. |
| `[Lighthouse]` | Lighthouse run manually in Chrome DevTools (Lighthouse panel, "Mobile" device, all four categories) against the production build (`npm run build`, then `npm run preview`). |
| `[Manual]`     | Human review. Used only where automation isn't realistic.                                                     |

"Every page" means `/`, `/pricing`, `/about`, and the 404 page unless a criterion says otherwise.

---

## F1. Base layout & navigation

**Goal:** Every page renders through one shared layout that loads Tailwind and provides the same header, navigation, and footer.

**Acceptance criteria**

1. **F1.1** A layout component exists at `src/layouts/BaseLayout.astro`, it imports `src/styles/global.css`, and every page in `src/pages/` renders through it. `[Manual]`
2. **F1.2** Tailwind's base styles apply on every page: the computed `margin` of `<body>` is `0px`. `[Playwright]`
3. **F1.3** Every page has `<html lang="en">`. `[Playwright]`
4. **F1.4** Every page has exactly one `<header>`, one `<main id="main-content">`, and one `<footer>` as direct landmarks of the layout. `[Playwright]`
5. **F1.5** The header contains a `<nav>` with `aria-label="Main"` holding links to `/`, `/pricing`, and `/about`. Each link returns HTTP 200. `[Playwright]`
6. **F1.6** On `/`, `/pricing`, and `/about`, the nav link for the current page has `aria-current="page"`, and no other nav link does. `[Playwright]`
7. **F1.7** A skip link with `href="#main-content"` is the first focusable element on every page. `[Playwright]`
8. **F1.8** The skip link is not visible until focused (bounding box ≤ 1×1 px or outside the viewport), and is visible inside the viewport when focused. `[Playwright]`
9. **F1.9** Activating the skip link with Enter moves focus into `<main id="main-content">` (`document.activeElement` is `main` or inside it). `[Playwright]`
10. **F1.10** Every page has exactly one `<h1>`, and heading levels do not skip (no `h3` without a preceding `h2`, and so on). `[Playwright]`
11. **F1.11** The footer contains links to `/`, `/pricing`, and `/about`. `[Playwright]`
12. **F1.12** The footer on every page contains the visible text "LabForge is a fictional product built as a portfolio project." `[Playwright]`
13. **F1.13** The header contains the LabForge logo as an inline SVG inside a link to `/`. The link's accessible name is "LabForge home". `[Playwright]`
14. **F1.14** `public/favicon.svg` is a LabForge placeholder favicon (not the Astro default), and every page links it with `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`. The Astro default `public/favicon.ico` is removed, and no page links it. `[Playwright]`
15. **F1.15** The nav is always visible with no hamburger or collapsible menu: at a 360 px viewport, all three nav links and the theme toggle are visible without any interaction. `[Playwright]`
16. **F1.16** `npm run build` exits with code 0. `[Build]`

**Out of scope:** hamburger or collapsible mobile menu, breadcrumbs, search, multi-language support, final brand design (the logo and favicon are placeholders).

---

## F2. Light/dark theme

**Goal:** The site supports light and dark themes, follows the system setting on first visit, and remembers the user's choice without a flash of the wrong theme.

**Acceptance criteria**

1. **F2.1** Dark mode is class-based: `src/styles/global.css` declares `@custom-variant dark (&:where(.dark, .dark *));`, and the dark theme is active exactly when `<html>` has the class `dark`. `[Manual]`
2. **F2.2** With no `theme` key in `localStorage` and the browser emulating `prefers-color-scheme: dark`, `<html>` has class `dark` after load. With `prefers-color-scheme: light`, it does not. `[Playwright]`
3. **F2.3** Clicking the theme toggle switches the `dark` class on `<html>` and writes `"dark"` or `"light"` to `localStorage` under the key `theme`. `[Playwright]`
4. **F2.4** After a reload, a stored `theme` value takes precedence over `prefers-color-scheme` (for example stored `"light"` + system dark → `<html>` has no `dark` class). `[Playwright]`
5. **F2.5** No flash of the wrong theme: the raw HTML of every page contains an inline `<script>` in `<head>` that sets the theme class, and this script appears before the first `<link rel="stylesheet">` and before `<body>`. `[Playwright]`
6. **F2.6** With `theme = "dark"` stored and system set to light, `<html>` already has class `dark` when `DOMContentLoaded` fires. `[Playwright]`
7. **F2.7** The toggle is a `<button>` present in the header on every page. It has an `aria-label` that names the action (for example "Switch to dark theme"), and the label updates after each toggle. `[Playwright]`
8. **F2.8** The toggle is reachable with Tab and is activated by both Enter and Space. `[Playwright]`
9. **F2.9** When focused by keyboard, the toggle has a visible focus indicator: computed `outline-style` is not `none`, or computed `box-shadow` is not `none`. `[Playwright]`
10. **F2.10** If `localStorage` throws on access, the page still loads, uses the system theme, and logs no console errors. `[Playwright]`
11. **F2.11** Lighthouse's `color-contrast` audit passes on every page in both themes (dark is checked with DevTools "Emulate CSS prefers-color-scheme: dark"). `[Lighthouse]`
12. **F2.12** Theme logic uses plain `<script>` tags only; no client-side framework is added. `[Manual]`

**Out of scope:** more than two themes, per-page themes, an explicit "system" option in the toggle, animated theme transitions.

---

## F3. Home page

**Goal:** `/` explains what LabForge is, who it is for, and how it works, and leads visitors to a call to action.

**Acceptance criteria**

1. **F3.1** `/` returns HTTP 200, and its `<main>` contains these sections in this order: hero, features, how it works, testimonials, FAQ, final CTA. Each is a `<section>` with `aria-labelledby` pointing to its heading's `id`. `[Playwright]`
2. **F3.2** The hero contains the page's only `<h1>`, a supporting paragraph, and a CTA `<a>` with the text "View pricing" and `href="/pricing"`. `[Playwright]`
3. **F3.3** The hero text mentions Azure and AWS, and that labs launch in the browser. `[Playwright]`
4. **F3.4** The features section has between 4 and 6 items (inclusive). Each item has an `<h3>` and a non-empty description. `[Playwright]`
5. **F3.5** The features section includes an item about auto-deleting labs after a time limit. `[Playwright]`
6. **F3.6** The how-it-works section contains an `<ol>` with exactly 3 `<li>` steps, and each step has a heading and a non-empty description. `[Playwright]`
7. **F3.7** The testimonials section contains at least 2 testimonials. Each has its quote in a `<blockquote>` and a visible attribution (name and role). `[Playwright]`
8. **F3.8** The testimonials section shows visible text stating that the testimonials are fictional placeholders. `[Playwright]`
9. **F3.9** Testimonial names are clearly fictional placeholders and no real company names or logos are used. `[Manual]`
10. **F3.10** The FAQ has at least 4 questions. Each is a `<details>` element with the question in `<summary>` and the answer inside the same `<details>`. `[Playwright]`
11. **F3.11** Each FAQ item opens and closes with the keyboard (Enter on the focused `<summary>`). `[Playwright]`
12. **F3.12** FAQ questions and answers come from a single data source (for example `src/data/faq.ts`) that is also used by the JSON-LD in F8.4. `[Manual]`
13. **F3.13** The final CTA section has a heading and a CTA `<a>` with the text "View pricing" and `href="/pricing"`. `[Playwright]`
14. **F3.14** All copy on the page stays within the "Product facts" list above. `[Manual]`

**Out of scope:** real customer testimonials or logos, carousels or sliders, video, newsletter signup, contact or signup forms, analytics.

---

## F4. Pricing page

**Goal:** `/pricing` presents LabForge's plans so visitors can compare them.

**Acceptance criteria**

1. **F4.1** `/pricing` returns HTTP 200 and has exactly one `<h1>`. `[Playwright]`
2. **F4.2** The page shows exactly three plans, in this order: Starter, Team, Enterprise. Each plan has a heading with its name, a price, and a `<ul>` listing its seats, lab hours per month, max lab duration, "Azure and AWS sandboxes", and "Labs auto-delete after the time limit". `[Playwright]`
3. **F4.3** Prices and limits exactly match the "Example pricing" table in Site facts: Starter "$49/month", 5 seats, 50 lab hours/month, 2-hour max lab duration; Team "$199/month", 25 seats, 300 lab hours/month, 8-hour max lab duration; Enterprise "Contact us", with custom seats, lab hours, and max lab duration. `[Playwright]`
4. **F4.4** Only the Team plan is highlighted, and it shows the visible text "Most popular" (not only a color difference). `[Playwright]`
5. **F4.5** The page shows the visible text "Example pricing for a fictional product. Prices are in USD." above the plans. `[Playwright]`
6. **F4.6** Plan data comes from a single data file, `src/data/pricing.ts`. Both this page and the `offers` in F8.3 render from it. `[Manual]`

**Out of scope:** per-plan CTA buttons (there is no signup or contact page yet), checkout or payments, currency switching, monthly/annual toggle, a pricing calculator, a feature-comparison table.

---

## F5. About page & custom 404

**Goal:** `/about` describes LabForge and its audience, and unknown URLs show a branded 404 page that links back into the site.

**Acceptance criteria**

1. **F5.1** `/about` returns HTTP 200 and has exactly one `<h1>`. `[Playwright]`
2. **F5.2** The About page names all three audiences: L&D managers, technical trainers, and DevRel teams. `[Playwright]`
3. **F5.3** The About page contains no team members, photos of people, founding dates, funding details, or office locations (none are in the product facts). `[Manual]`
4. **F5.4** `src/pages/404.astro` exists, and `npm run build` outputs `dist/404.html`. `[Build]`
5. **F5.5** Requesting a URL that doesn't exist (for example `/does-not-exist`) on the preview server returns HTTP status 404 and shows the custom 404 page. `[Playwright]`
6. **F5.6** The 404 page uses `BaseLayout` (header, nav, and footer present), has exactly one `<h1>`, and contains a link to `/`. `[Playwright]`
7. **F5.7** The 404 page has `<meta name="robots" content="noindex">`. `[Playwright]`

**Out of scope:** team bios, a careers page, a contact form, a search box on the 404 page.

---

## F6. SEO meta & Open Graph

**Goal:** Every page has unique, length-limited metadata and complete social sharing tags, generated from one component.

**Acceptance criteria**

1. **F6.1** `astro.config.mjs` sets `site: 'https://labforge-chi.vercel.app'`, `trailingSlash: 'never'`, and `build: { format: 'file' }`. The string `labforge-chi.vercel.app` appears nowhere else in `src/` or `public/`. `[Playwright]`
2. **F6.2** Every page has exactly one `<title>`, 1–60 characters long, and no two pages share the same title. `[Playwright]`
3. **F6.3** Every page has exactly one `<meta name="description">` with content 1–160 characters long, and no two pages share the same description. `[Playwright]`
4. **F6.4** `/`, `/pricing`, and `/about` each have exactly one `<link rel="canonical">` whose `href` is exactly `https://labforge-chi.vercel.app/`, `https://labforge-chi.vercel.app/pricing`, and `https://labforge-chi.vercel.app/about` respectively (no trailing slash except on the root). The 404 page has no canonical link. `[Playwright]`
5. **F6.5** `/`, `/pricing`, and `/about` each have `og:title`, `og:description`, `og:url`, `og:image`, and `og:type`. `og:url` equals the canonical URL, and `og:image` is an absolute `https://` URL that starts with `site`. `[Playwright]`
6. **F6.6** `og:image` points to `/og-image.png` (as an absolute URL). The file `public/og-image.png` returns HTTP 200 on the preview server with content type `image/png` and is exactly 1200×630 px. `[Playwright]`
7. **F6.7** The OG image is a placeholder created without new dependencies: an HTML source file in the repo is screenshotted at 1200×630 with Playwright (installed in F10), and the command that regenerates it is documented in `AGENTS.md`. `[Manual]`
8. **F6.8** `/`, `/pricing`, and `/about` each have `<meta name="twitter:card" content="summary_large_image">`. `[Playwright]`
9. **F6.9** All of the tags above are rendered by one SEO component (for example `src/components/Seo.astro`) that takes `title` and `description` props. Pages do not write these tags directly. `[Manual]`

**Out of scope:** per-page generated OG images, `twitter:site`/`twitter:creator` handles, hreflang tags, a web app manifest.

---

## F7. Sitemap & robots.txt

**Goal:** Search engines can discover every indexable page through a generated sitemap referenced from robots.txt.

**Acceptance criteria**

1. **F7.1** `@astrojs/sitemap` (approved dependency) is in `dependencies` and registered in `integrations` in `astro.config.mjs`. `[Build]`
2. **F7.2** After `npm run build`, `dist/sitemap-index.xml` exists and references at least one sitemap file that also exists in `dist/`. `[Build]`
3. **F7.3** The sitemap URLs, taken together, are exactly `https://labforge-chi.vercel.app/`, `https://labforge-chi.vercel.app/pricing`, and `https://labforge-chi.vercel.app/about` (compared after URL normalization, so the root with or without `/` counts as the same), with no 404 page and no other URLs. `[Playwright]`
4. **F7.4** `/robots.txt` returns HTTP 200 with content type `text/plain` and contains `User-agent: *` and the line `Sitemap: https://labforge-chi.vercel.app/sitemap-index.xml`. `[Playwright]`
5. **F7.5** `robots.txt` is generated from `site` by an endpoint (`src/pages/robots.txt.ts`), not stored as a static file in `public/`, so the domain is set only in `astro.config.mjs` (F6.1). `[Manual]`
6. **F7.6** `robots.txt` does not disallow `/`, `/pricing`, or `/about`. `[Playwright]`

**Out of scope:** submitting the sitemap to Google Search Console, image or video sitemaps, `lastmod`/`priority`/`changefreq` tuning.

---

## F8. JSON-LD structured data

**Goal:** Pages describe LabForge to search engines with valid schema.org JSON-LD that matches what visitors see.

**Acceptance criteria**

1. **F8.1** Every `<script type="application/ld+json">` on every page parses with `JSON.parse` without error and has `"@context": "https://schema.org"`. `[Playwright]`
2. **F8.2** Every page has exactly one `Organization` object with `name` set to `"LabForge"` and `url` equal to `site`. `[Playwright]`
3. **F8.3** `/` has exactly one `SoftwareApplication` object with non-empty `name`, `description`, `applicationCategory`, and `operatingSystem`, plus an `offers` array generated from `src/data/pricing.ts`. That array has exactly two `Offer` items, Starter (`"price": "49"`) and Team (`"price": "199"`), each with `"priceCurrency": "USD"`. Enterprise has no numeric price and is omitted. `[Playwright]`
4. **F8.4** `/` has exactly one `FAQPage` object. Its `mainEntity` array has the same number of `Question` items as the visible FAQ (F3.10), in the same order, and each `Question.name` and `acceptedAnswer.text` exactly equals the visible question and answer text (after trimming and collapsing whitespace). `[Playwright]`
5. **F8.5** `SoftwareApplication` and `FAQPage` appear only on `/`. `[Playwright]`
6. **F8.6** JSON-LD values are not hard-coded copies of page text: FAQ items come from the same data source as the visible FAQ (F3.12), offers come from `src/data/pricing.ts` (F4.6), and URLs are derived from `site`. `[Manual]`
7. **F8.7** After deployment, `/` has 0 errors in the Schema.org Validator, and no Rich Results Test errors other than the missing aggregateRating/review notice. (Google's Software App rich result requires a rating or review, which a fictional product can't have without inventing one.) Valid markup is the goal; whether Google displays rich results is not a criterion. `[Manual]`

**Out of scope:** `Product`/`Offer` markup on `/pricing`, `BreadcrumbList`, `WebSite` with `SearchAction`, review/rating markup.

---

## F9. Performance & accessibility

**Goal:** The production site scores 95+ in every Lighthouse category on mobile and can be used with keyboard and assistive technology.

**Acceptance criteria**

1. **F9.1** On the production build (`npm run build`, then `npm run preview`), Lighthouse run manually in Chrome DevTools with the "Mobile" device setting scores `/`, `/pricing`, and `/about` at ≥ 95 in each of Performance, Accessibility, Best Practices, and SEO. `[Lighthouse]`
2. **F9.2** The 404 page scores ≥ 95 in Performance, Accessibility, and Best Practices. (SEO is excluded because `noindex` fails Lighthouse's "is crawlable" audit by design.) Note: Lighthouse refuses to audit pages that return a non-200 status, so the 404 page is audited as a 200 copy (the same built `404.html` served at a URL that returns 200). `[Lighthouse]`
3. **F9.3** No console errors or warnings appear on any page during load or while toggling the theme. `[Playwright]`
4. **F9.4** Every network request made while loading any page goes to the site's own origin (no third-party fonts, scripts, or images). `[Playwright]`
5. **F9.5** The total JavaScript loaded by any page (inline and external, uncompressed) is ≤ 20 KB. `[Playwright]`
6. **F9.6** `package.json` contains no client-side UI framework or framework integration (React, Vue, Svelte, Solid, Preact, Alpine, or their `@astrojs/*` integrations). `[Build]`
7. **F9.7** Every `<img>` has an `alt` attribute and explicit `width` and `height` attributes. Raster images in `src/` are rendered with `astro:assets` (`<Image>` or `<Picture>`). `[Playwright]`
8. **F9.8** At viewport widths of 360, 768, and 1280 px, no page scrolls horizontally (`document.documentElement.scrollWidth` ≤ viewport width). `[Playwright]`
9. **F9.9** Every link and button can be reached with Tab, and each shows a visible focus indicator when focused (computed `outline-style` is not `none`, or `box-shadow` is not `none`). `[Playwright]`
10. **F9.10** Every link and button in the header, the theme toggle, and every CTA has a bounding box of at least 24×24 CSS px. `[Playwright]`
11. **F9.11** With `prefers-reduced-motion: reduce` emulated, no element has a computed `animation-duration` or `transition-duration` above `0.01s`. `[Playwright]`
12. **F9.12** No page loads web fonts: no network request has resource type `font`, and no CSS contains `@font-face`. Text uses Tailwind's default system font stack. `[Playwright]`

**Out of scope:** CDN, caching, or edge configuration on Vercel; automated or CI Lighthouse runs; Real User Monitoring; WCAG AAA conformance.

---

## F10. Automated tests

**Goal:** A Playwright suite automatically checks every `[Playwright]` criterion in this spec against the production build.

**Acceptance criteria**

1. **F10.1** `@playwright/test` (approved dev dependency) is in `devDependencies`, and `playwright.config.ts` exists at the project root. `[Build]`
2. **F10.2** `package.json` has a `test` script that runs Playwright, and `npm test` exits with code 0. `[Build]`
3. **F10.3** The Playwright config's `webServer` builds the site and serves it with `npm run preview`, so tests run against the production build, not the dev server. `[Manual]`
4. **F10.4** Every `[Playwright]` criterion in this spec has at least one test whose title starts with the criterion ID (for example `F1.7 skip link is first focusable element`). `[Manual]`
5. **F10.5** Tests live in `tests/`, and `playwright.config.ts` defines exactly one project, which uses Chromium. Firefox and WebKit are not configured. `[Build]`
6. **F10.6** `npx playwright test --repeat-each=3` exits with code 0, so no test is flaky across three runs. `[Build]`
7. **F10.7** `AGENTS.md` → Commands lists the test command in place of "To be added". `[Manual]`

**Out of scope:** visual regression or screenshot tests (the one-off OG image screenshot in F6.7 is not a test), CI/GitHub Actions setup, automated Lighthouse runs, Firefox/WebKit/mobile-device projects, unit tests.

---

## Build order

| #  | Feature | Why this position |
| -- | ------- | ----------------- |
| 1  | **F1** Base layout & navigation | Every other feature renders inside the layout. It also fixes the current gap where `global.css` isn't imported anywhere, so Tailwind doesn't apply yet. |
| 2  | **F10** Automated tests (setup + F1 tests) | Setting up Playwright early lets each later feature ship with its own tests and meet the Definition of done as it goes, instead of testing everything at the end. |
| 3  | **F2** Light/dark theme | It changes `<head>` and the header, and every later component's colors need `dark:` variants. Doing it before content means styling each section once. |
| 4  | **F6** SEO meta & Open Graph | It sets `site`, `trailingSlash`, and the SEO component in the layout. Pages built afterwards only pass props, and F7 and F8 depend on `site`. The OG image uses Playwright, which is already installed in step 2. |
| 5  | **F3** Home page | The largest page. It creates the FAQ data that F8 needs. |
| 6  | **F4** Pricing page | Independent of the home page. It creates `src/data/pricing.ts`, which F8's `offers` need. |
| 7  | **F5** About & 404 | Small. The 404 page must exist before the sitemap so F7.3 can confirm it's excluded. |
| 8  | **F7** Sitemap & robots.txt | Needs all pages and `site` to be in place. |
| 9  | **F8** JSON-LD | Needs the visible FAQ (F3), the pricing data (F4), and `site` (F6). |
| 10 | **F9** Performance & accessibility | A final audit of the whole site. Its budgets (F9.4, F9.5, F9.10) should still be kept in mind from step 1 so this step finds little to fix. |

---

## Decisions

Decisions made on 2026-11-03 that resolve the earlier open questions. The criteria above already reflect them.

| #   | Topic | Decision | Criteria affected |
| --- | ----- | -------- | ----------------- |
| D1  | Pricing | Example pricing in USD with a visible "examples" notice: Starter $49/month (5 seats, 50 lab hours/month, 2-hour max lab duration); Team $199/month (25 seats, 300 lab hours/month, 8-hour max lab duration), highlighted "Most popular"; Enterprise "Contact us" (custom limits). Plan limits were chosen for this spec and are illustrative. | Site facts, F4.2–F4.6 |
| D2  | CTAs | The hero and final CTAs both say "View pricing" and link to `/pricing`. Pricing plans have no CTA buttons, because there is no signup or contact page. | F3.2, F3.13, F4 out of scope |
| D3  | Fictional notice | The footer states "LabForge is a fictional product built as a portfolio project." | F1.12 |
| D4  | URLs | No trailing slashes: `trailingSlash: 'never'` with `build.format: 'file'`. | Site facts, F6.1, F6.4, F7.3 |
| D5  | Brand assets | Placeholders: a simple SVG logo and SVG favicon, and a 1200×630 PNG OG image created without new dependencies (screenshotted from an HTML file with Playwright once F10 installs it). | F1.13, F1.14, F6.6, F6.7 |
| D6  | Lighthouse | Run manually in Chrome DevTools. No Lighthouse dependency. | Verification tags, F2.11, F9.1, F9.2 |
| D7  | Mobile nav | No hamburger menu; the nav is always visible. | F1.15, F1 out of scope |
| D8  | Test browsers | Chromium only. | F10.5 |
| D9  | JS budget | Keep the 20 KB per-page JavaScript limit. | F9.5 |
| D10 | Structured data | Valid markup is enough; rich-result display is not a goal. `SoftwareApplication` includes `offers` generated from the pricing data (Starter and Team; Enterprise is omitted because it has no numeric price). | F8.3, F8.6, F8.7 |
| D11 | Fonts | System font stack, no web fonts. | Site facts, F9.12 |
