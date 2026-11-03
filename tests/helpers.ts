import { test, type Page } from '@playwright/test';

// Pages every layout-level criterion is checked on.
// The 404 page arrives in F5; add it to this list then.
export const pages = ['/', '/pricing', '/about'] as const;

/** Runs `check` on each page as its own step, so a failure names the page. */
export async function forEachPage(page: Page, check: (path: string) => Promise<void>) {
	for (const path of pages) {
		await test.step(path, async () => {
			await page.goto(path);
			await check(path);
		});
	}
}
