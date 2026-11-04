import { expect, test, type Page } from '@playwright/test';
import { forEachPage, isExpectedNotFoundMessage, pages } from './helpers';

// F2 — Light/dark theme (SPEC.md). The system setting is emulated with colorScheme.
// Each test gets a fresh browser context, so localStorage starts empty.

const html = (page: Page) => page.locator('html');
const toggle = (page: Page) => page.locator('header button[data-theme-toggle]');
const storedTheme = (page: Page) => page.evaluate(() => localStorage.getItem('theme'));

test('F2.2 first visit follows prefers-color-scheme', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await forEachPage(page, async () => {
		expect(await storedTheme(page)).toBeNull();
		await expect(html(page)).toHaveClass(/(^|\s)dark(\s|$)/);
	});

	await page.emulateMedia({ colorScheme: 'light' });
	await forEachPage(page, async () => {
		await expect(html(page)).not.toHaveClass(/(^|\s)dark(\s|$)/);
	});
});

test('F2.3 toggle flips the dark class and stores the choice', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await forEachPage(page, async () => {
		await page.evaluate(() => localStorage.removeItem('theme'));
		await page.reload();
		await expect(html(page)).not.toHaveClass(/(^|\s)dark(\s|$)/);

		await toggle(page).click();
		await expect(html(page)).toHaveClass(/(^|\s)dark(\s|$)/);
		expect(await storedTheme(page)).toBe('dark');

		await toggle(page).click();
		await expect(html(page)).not.toHaveClass(/(^|\s)dark(\s|$)/);
		expect(await storedTheme(page)).toBe('light');
	});
});

test('F2.4 stored theme overrides system preference after reload', async ({ page }) => {
	await forEachPage(page, async () => {
		await page.evaluate(() => localStorage.setItem('theme', 'light'));
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.reload();
		await expect(html(page)).not.toHaveClass(/(^|\s)dark(\s|$)/);

		await page.evaluate(() => localStorage.setItem('theme', 'dark'));
		await page.emulateMedia({ colorScheme: 'light' });
		await page.reload();
		await expect(html(page)).toHaveClass(/(^|\s)dark(\s|$)/);
	});
});

test('F2.5 inline theme script is in head before stylesheets and body', async ({ request }) => {
	for (const path of pages) {
		await test.step(path, async () => {
			const source = await (await request.get(path)).text();
			const headEnd = source.indexOf('</head>');
			const bodyStart = source.indexOf('<body');
			const firstStylesheet = source.search(/<link[^>]+rel="stylesheet"/);

			// Inline = a <script> with no src attribute that reads the stored theme and sets the class.
			const inline = [...source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].find(
				(m) => m[1].includes("localStorage.getItem('theme')") && m[1].includes("classList.toggle('dark'"),
			);
			expect(inline, 'inline theme script exists').toBeTruthy();
			expect(inline![0]).not.toMatch(/type="module"/);

			const at = inline!.index!;
			expect(at, 'script is inside <head>').toBeLessThan(headEnd);
			expect(firstStylesheet, 'page has a stylesheet').toBeGreaterThan(-1);
			expect(at, 'script comes before the first stylesheet').toBeLessThan(firstStylesheet);
			expect(at, 'script comes before <body>').toBeLessThan(bodyStart);
		});
	}
});

test('F2.6 stored dark theme is applied before first paint', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	// Runs before any page script on every navigation.
	await page.addInitScript(() => {
		const w = window as unknown as { __darkAtBody?: boolean; __darkAtDCL?: boolean };
		document.addEventListener('DOMContentLoaded', () => {
			w.__darkAtDCL = document.documentElement.classList.contains('dark');
		});
		// When <body> is first inserted, nothing below <head> has been parsed or painted yet.
		// Observe `document` (not documentElement), because <html> may not exist yet when this runs.
		new MutationObserver((_, observer) => {
			if (document.body) {
				w.__darkAtBody = document.documentElement.classList.contains('dark');
				observer.disconnect();
			}
		}).observe(document, { childList: true, subtree: true });
		localStorage.setItem('theme', 'dark');
	});

	await forEachPage(page, async () => {
		const result = await page.evaluate(() => {
			const w = window as unknown as { __darkAtBody?: boolean; __darkAtDCL?: boolean };
			return { atBody: w.__darkAtBody, atDCL: w.__darkAtDCL };
		});
		expect(result).toEqual({ atBody: true, atDCL: true });
	});
});

test('F2.7 header toggle is a button whose aria-label names the action', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await forEachPage(page, async () => {
		await page.evaluate(() => localStorage.removeItem('theme'));
		await page.reload();
		await expect(toggle(page)).toHaveCount(1);
		expect(await toggle(page).evaluate((el) => el.tagName)).toBe('BUTTON');

		await expect(toggle(page)).toHaveAttribute('aria-label', 'Switch to dark theme');
		await toggle(page).click();
		await expect(toggle(page)).toHaveAttribute('aria-label', 'Switch to light theme');
		await toggle(page).click();
		await expect(toggle(page)).toHaveAttribute('aria-label', 'Switch to dark theme');
	});
});

async function tabToToggle(page: Page) {
	for (let i = 0; i < 10; i++) {
		await page.keyboard.press('Tab');
		if (await toggle(page).evaluate((el) => el === document.activeElement)) return;
	}
	throw new Error('Theme toggle was not reached within 10 Tab presses');
}

test('F2.8 toggle is reachable with Tab and works with Enter and Space', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await forEachPage(page, async () => {
		await page.evaluate(() => localStorage.removeItem('theme'));
		await page.reload();
		await tabToToggle(page);
		await expect(toggle(page)).toBeFocused();

		await page.keyboard.press('Enter');
		await expect(html(page)).toHaveClass(/(^|\s)dark(\s|$)/);

		await page.keyboard.press('Space');
		await expect(html(page)).not.toHaveClass(/(^|\s)dark(\s|$)/);
	});
});

test('F2.9 toggle shows a visible focus indicator when focused by keyboard', async ({ page }) => {
	await forEachPage(page, async () => {
		await tabToToggle(page);
		const style = await toggle(page).evaluate((el) => {
			const s = getComputedStyle(el);
			return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
		});
		const hasOutline = style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
		const hasShadow = style.boxShadow !== 'none';
		expect(hasOutline || hasShadow, `focus style ${JSON.stringify(style)}`).toBe(true);
	});
});

test('F2.10 page works with system theme when localStorage throws', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error' && !isExpectedNotFoundMessage(msg)) errors.push(msg.text());
	});
	page.on('pageerror', (err) => errors.push(err.message));

	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			configurable: true,
			get() {
				throw new DOMException('Storage is blocked', 'SecurityError');
			},
		});
	});
	await page.emulateMedia({ colorScheme: 'dark' });

	await forEachPage(page, async () => {
		await expect(html(page)).toHaveClass(/(^|\s)dark(\s|$)/);
		await toggle(page).click();
		await expect(html(page)).not.toHaveClass(/(^|\s)dark(\s|$)/);
	});
	expect(errors).toEqual([]);
});
