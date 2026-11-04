import { test, type Page } from '@playwright/test';

// Any URL that doesn't exist; the preview server answers it with the custom 404 page (SPEC.md F5.5).
export const notFoundPath = '/does-not-exist';

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
