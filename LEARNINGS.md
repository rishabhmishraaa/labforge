# Learnings

Notes from building LabForge with an AI coding agent. Each entry has three parts: what happened, why, and what I changed.

## 1. A production-only bug that every test missed

- **What happened:** all tests passed locally, but on Vercel `/pricing` and `/about` returned 404.
- **Why:** Astro builds `pricing.html` (`build.format: 'file'`). `astro preview`, which the tests ran against, maps `/pricing` to `pricing.html` automatically. Vercel doesn't. The tests only ever saw the preview server.
- **What I changed:** added `vercel.json` with `"cleanUrls": true` and `"trailingSlash": false`. Added `BASE_URL` support to `playwright.config.ts`, so the same suite can run against production: `$env:BASE_URL="https://labforge-chi.vercel.app"; npm test`.

## 2. Copy overcorrection

- **What happened:** a strict "don't invent facts" rule produced flat, repetitive copy that restated the same few facts in nearly the same words.
- **Why:** the rule only said what was forbidden, so the safest reading was to repeat the facts word for word.
- **What I changed:** added a **Copy rule** to `SPEC.md` that defines what is allowed: explaining direct consequences of the facts (for example "launch in the browser" → learners don't install anything). Numbers, customers, integrations and unlisted features stay forbidden. PR descriptions quote every new line of copy next to the fact it's based on.

## 3. File edits through shell commands

- **What happened:** the agent wrote files with shell heredocs (`cat > file <<EOF`). One such command triggered a false "dangerous rm" warning. It also replaced a file without showing a reviewable diff.
- **Why:** to a reviewer, a shell command that overwrites a file looks the same as one that deletes it, and the change isn't shown as a diff.
- **What I changed:** added a rule to `AGENTS.md` §6: create and edit files with the agent's file tools (Write/Edit), not shell commands, so every change shows up as a reviewable diff.

## 4. "Done" before the PR existed

- **What happened:** in the deploy-fix task, the agent pushed the branch about 4 minutes before it opened the PR, because it first waited for a Vercel preview deployment that never appeared. In that window the work looked finished but there was no PR (#11).
- **Why:** a pushed branch and a progress summary look like a finished task.
- **What I changed:** (1) verify the end state, meaning the PR URL, not the agent's summary; (2) check any account of past events, the agent's or my own, against evidence: title, body, timestamps.

## 5. Rules that worked

- **What happened:** the boundaries in `AGENTS.md` changed the agent's behavior in useful ways:
  - it asked before deleting the default `public/favicon.ico`;
  - it flagged that `global.css` wasn't imported anywhere (so Tailwind wasn't applied) instead of silently fixing it;
  - when a preview server it hadn't started blocked the tests, it asked before stopping it.
- **Why:** "ask before anything hard to undo" and "keep each change scoped" are concrete enough to act on.
- **What I changed:** nothing. These rules stay as they are.

## 6. Reviewing changes to existing tests

- **What happened:** every PR's diff of existing tests was reviewed, not just the new ones.
  - One refactor made tests stricter.
  - One narrowly scoped exception was accepted: Chromium logs the 404 page's own `status of 404` response as a console error, so console-error tests ignore that one message for that one URL.
- **Why:** an agent fixing a failing test can just as easily weaken it. Changes to existing tests are where that would show.
- **What I changed:** the 404 exception was later moved into one function, `isExpectedNotFoundMessage()` in `tests/helpers.ts`, used by both F2.10 and F9.3, so there's a single definition to review.

## 7. Mutation checks prove the tests can fail

- **What happened:** for each feature, code was broken on purpose to confirm the matching test fails:
  - removing `is:inline` from the theme script failed the no-flash tests;
  - changing a price, the site protocol, or the FAQ text in the JSON-LD failed the matching tests.
  - Not every break failed something. Removing the sitemap's 404 filter didn't fail F7.3, because the integration already drops the 404 page by default. A different break (filtering out `/about`) showed that F7.3 does fail when the sitemap is wrong.
- **Why:** a passing test only means something if it can fail. Some checks, like "every image has alt text" on a site with no images, pass with nothing to check.
- **What I changed:** mutation checks became a standard step before every PR. The work is staged first, and every break is reverted with the file tools.

## 8. Lighthouse and the 404 page

- **What happened:** Lighthouse refused to audit the 404 page.
- **Why:** Lighthouse won't audit pages that return a non-200 status, and the 404 page correctly returns 404.
- **What I changed:** the 404 page is audited as a 200 copy (the same built `404.html` served at a URL that returns 200), noted in `SPEC.md` F9.2.

## 9. Structured data we can't honestly complete

- **What happened:** F8.7 asked for zero errors in Google's Rich Results Test, but Google's Software App rich result requires `aggregateRating` or `review`.
- **Why:** a fictional product has no ratings, and inventing them would break the Copy rule.
- **What I changed:** reworded F8.7 to a validity check: 0 errors in the Schema.org Validator, and no Rich Results Test errors other than the missing aggregateRating/review notice.
