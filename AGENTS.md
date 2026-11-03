# AGENTS.md — LabForge

## 1. Project overview

LabForge is a marketing site for a fictional cloud-labs product. It is a static Astro site.

Goals:

- Lighthouse 95+ in all four categories (Performance, Accessibility, Best Practices, SEO).
- Solid technical SEO: unique titles and meta descriptions, canonical URLs, sitemap, robots.txt, structured data where relevant.
- Light and dark theme.

## 2. Stack & versions

Only what is installed (see `package.json`):

| Package             | Version | Notes                                      |
| ------------------- | ------- | ------------------------------------------ |
| `astro`             | ^7.4.5  | Framework                                  |
| `tailwindcss`       | ^4.3.4  | Tailwind CSS v4                            |
| `@tailwindcss/vite` | ^4.3.4  | Loads Tailwind as a Vite plugin            |
| Node.js             | >=22.23.4 | Set in `package.json` `engines`          |

TypeScript uses the `astro/tsconfigs/strict` preset (`tsconfig.json`).

Tailwind setup:

- Tailwind v4 is loaded through `@tailwindcss/vite` in `astro.config.mjs` (`vite.plugins: [tailwindcss()]`).
- `src/styles/global.css` is the entry stylesheet (`@import "tailwindcss";`). Theme tokens and any custom CSS go here.
- Do **not** use the deprecated `@astrojs/tailwind` integration, and don't add a `tailwind.config.js`; v4 is configured in CSS.

## 3. Commands

Run from the project root (PowerShell):

| Task       | Command                         |
| ---------- | ------------------------------- |
| Dev server | `npm run dev`                   |
| Build      | `npm run build` (output: `dist/`) |
| Preview    | `npm run preview` (serves the build) |
| Tests      | _To be added_                   |
| Lint/check | _To be added_                   |

When an agent starts the dev server, use background mode so it doesn't block the session:

```
npx astro dev --background
```

Manage it with `npx astro dev stop`, `npx astro dev status`, and `npx astro dev logs`.

## 4. Project structure

```
public/            Static assets served as-is (favicons, robots.txt, og images)
src/
  pages/           Routes; each .astro file becomes a page (index.astro = /)
  layouts/         Page shells (<html>, <head>, SEO meta, header/footer)
  components/      Reusable .astro components
  styles/
    global.css     Tailwind entry stylesheet
  assets/          Images processed by Astro's image pipeline (use <Image />)
astro.config.mjs   Astro + Vite config (Tailwind plugin lives here)
```

`src/layouts/`, `src/components/`, and `src/assets/` don't exist yet; create them when first needed.

## 5. Conventions

- **TypeScript** in component frontmatter. Type props with an `interface Props`.
- **Semantic HTML**: `header`, `nav`, `main`, `section`, `article`, `footer`; one `h1` per page; no skipped heading levels.
- **Styling**: Tailwind utility classes. Write custom CSS only when utilities can't do it cleanly, and note why in a comment.
- **Accessibility**:
  - Meaningful `alt` text on images (`alt=""` for decorative ones).
  - Every form control has a `<label>`.
  - Visible focus states on all interactive elements; never remove outlines without a replacement.
  - Sufficient color contrast in both light and dark themes.
- **Environment**: development is on Windows with PowerShell. Use PowerShell syntax in commands and docs (no `&&` chaining in Windows PowerShell 5.1; use `;` or `if ($?) { ... }`).

Astro docs: https://docs.astro.build. Check the relevant guide before related work:

- [Routing (pages, dynamic routes, middleware)](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling and Tailwind](https://docs.astro.build/en/guides/styling/)
- [Images](https://docs.astro.build/en/guides/images/)

## 6. Rules / boundaries

- **Never add a dependency without asking first** and explaining why it's needed.
- **Keep each change scoped to the task.** Don't refactor unrelated files.
- **No client-side JS frameworks** (React, Vue, Svelte, etc.). Use a plain `<script>` only when necessary.
- **Work on a feature branch.** Never commit directly to `main`.
- **Ask before anything hard to undo**: pushing, deleting files, rewriting git history.
- **A feature isn't done until it meets its acceptance criteria in `SPEC.md`.**

## 7. Definition of done

A change is done when all of these are true:

- [ ] `npm run build` passes.
- [ ] Tests pass (once a test setup exists).
- [ ] No errors in the browser console.
- [ ] Acceptance criteria in `SPEC.md` are met.

## 8. Git & PR conventions

- **Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`, followed by a short imperative summary (e.g. `feat: add theme toggle`).
- **One feature per branch**, named `<type>/<short-name>` (e.g. `feat/theme-toggle`).
- **PR descriptions** use this template:

  ```markdown
  ## What

  ## Why

  ## How I verified it
  <!-- Commands run and their results; which SPEC.md criteria are met -->

  ## Out of scope / follow-ups
  ```

- **Before saying a task is done**, run `npm run build` and report the result. Never claim something passes without having run it.
