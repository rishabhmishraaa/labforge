import { test, type ConsoleMessage, type Page } from '@playwright/test';

// The production site URL, as set in astro.config.mjs → `site`. Expected absolute URLs (canonical, Open Graph,
// sitemap, robots.txt, JSON-LD) are built from it. Tests may run against any server (see BASE_URL in
// playwright.config.ts); the page content always uses this URL.
export const SITE = 'https://labforge-chi.vercel.app';

// Any URL that doesn't exist; the preview server answers it with the custom 404 page (SPEC.md F5.5).
export const notFoundPath = '/does-not-exist';

/**
 * Chromium logs the 404 page's own document response (expected, F5.5) as the console error
 * "Failed to load resource: the server responded with a status of 404". Only that message, for that URL, is allowed;
 * any other failed resource or console error still counts. Used by every console-error test (F2.10, F9.3).
 */
export function isExpectedNotFoundMessage(msg: ConsoleMessage): boolean {
	return msg.type() === 'error' && msg.text().includes('status of 404') && msg.location().url.endsWith(notFoundPath);
}

// Pages that are indexed: canonical, Open Graph and nav-state criteria apply only to these (F1.6, F6.4, F6.5, F6.8).
export const indexablePages = ['/', '/pricing', '/about'] as const;

// "Every page" in SPEC.md: the indexable pages plus the 404. Layout-level criteria run on all of them.
export const pages = [...indexablePages, notFoundPath] as const;

/** Runs `check` on each page (all pages by default) as its own step, so a failure names the page. */
export async function forEachPage(
	page: Page,
	check: (path: string) => Promise<void>,
	paths: readonly string[] = pages,
) {
	for (const path of paths) {
		await test.step(path, async () => {
			await page.goto(path);
			await check(path);
		});
	}
}
