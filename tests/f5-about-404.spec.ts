import { expect, test } from '@playwright/test';
import { indexablePages, notFoundPath } from './helpers';

// F5 — About page & custom 404 (SPEC.md).

test('F5.1 about returns 200 and has one h1', async ({ page }) => {
	const response = await page.goto('/about');
	expect(response?.status()).toBe(200);
	await expect(page.locator('h1')).toHaveCount(1);
});

test('F5.2 about names all three audiences', async ({ page }) => {
	await page.goto('/about');
	const text = await page.locator('main').innerText();
	for (const audience of [/L&D managers/i, /technical trainers/i, /DevRel teams/i]) {
		expect(text).toMatch(audience);
	}
});

test('F5.5 unknown URL returns HTTP 404 and shows the custom 404 page', async ({ page }) => {
	// The real status code from the preview server, not just the page content.
	const response = await page.goto(notFoundPath);
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1, name: 'Page not found', exact: true })).toBeVisible();

	const direct = await page.request.get(notFoundPath);
	expect(direct.status()).toBe(404);
});

test('F5.6 404 page uses the base layout, has one h1 and links home', async ({ page }) => {
	await page.goto(notFoundPath);
	await expect(page.locator('header')).toHaveCount(1);
	await expect(page.locator('header nav[aria-label="Main"]')).toHaveCount(1);
	await expect(page.locator('footer')).toHaveCount(1);
	await expect(page.locator('h1')).toHaveCount(1);
	const home = page.locator('main a[href="/"]');
	await expect(home).toHaveCount(1);
	await expect(home).toBeVisible();
});

test('F5.7 404 page is noindex and indexable pages are not', async ({ page }) => {
	await page.goto(notFoundPath);
	const robots = page.locator('head meta[name="robots"]');
	await expect(robots).toHaveCount(1);
	await expect(robots).toHaveAttribute('content', 'noindex');

	// Guard: the noindex option must not leak onto pages that should be indexed.
	for (const path of indexablePages) {
		await test.step(path, async () => {
			await page.goto(path);
			await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
		});
	}
});
