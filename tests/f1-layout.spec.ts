import { expect, test, type Page } from '@playwright/test';

// F1 — Base layout & navigation (SPEC.md). Each test checks one criterion on every page.
// The 404 page arrives in F5; add it to this list then.
const pages = ['/', '/pricing', '/about'] as const;
const navPaths = ['/', '/pricing', '/about'];

async function forEachPage(page: Page, check: (path: string) => Promise<void>) {
	for (const path of pages) {
		await test.step(path, async () => {
			await page.goto(path);
			await check(path);
		});
	}
}

const hrefsOf = (page: Page, selector: string) =>
	page.locator(selector).evaluateAll((els) => els.map((el) => el.getAttribute('href')));

test('F1.2 Tailwind base styles reset body margin', async ({ page }) => {
	await forEachPage(page, async () => {
		const margin = await page.evaluate(() => getComputedStyle(document.body).margin);
		expect(margin).toBe('0px');
	});
});

test('F1.3 html has lang="en"', async ({ page }) => {
	await forEachPage(page, async () => {
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});
});

test('F1.4 page has one header, main#main-content and footer', async ({ page }) => {
	await forEachPage(page, async () => {
		await expect(page.locator('header')).toHaveCount(1);
		await expect(page.locator('main')).toHaveCount(1);
		await expect(page.locator('main')).toHaveAttribute('id', 'main-content');
		await expect(page.locator('footer')).toHaveCount(1);
	});
});

test('F1.5 main nav links to all pages and each returns 200', async ({ page }) => {
	await forEachPage(page, async () => {
		await expect(page.locator('header nav[aria-label="Main"]')).toHaveCount(1);
		const hrefs = await hrefsOf(page, 'header nav[aria-label="Main"] a');
		expect(hrefs).toEqual(navPaths);
		for (const href of hrefs) {
			const response = await page.request.get(href!);
			expect(response.status(), `GET ${href}`).toBe(200);
		}
	});
});

test('F1.6 only the current page\'s nav link has aria-current="page"', async ({ page }) => {
	await forEachPage(page, async (path) => {
		const current = page.locator('nav[aria-label="Main"] a[aria-current="page"]');
		await expect(current).toHaveCount(1);
		await expect(current).toHaveAttribute('href', path);
		// No link anywhere else on the page claims to be the current page.
		await expect(page.locator('[aria-current]')).toHaveCount(1);
	});
});

test('F1.7 skip link is first focusable element', async ({ page }) => {
	await forEachPage(page, async () => {
		const firstFocusableHref = await page.evaluate(() => {
			const selector =
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
			return document.querySelector(selector)?.getAttribute('href') ?? null;
		});
		expect(firstFocusableHref).toBe('#main-content');

		await page.keyboard.press('Tab');
		await expect(page.locator(':focus')).toHaveAttribute('href', '#main-content');
	});
});

test('F1.8 skip link is hidden until focused and visible when focused', async ({ page }) => {
	await forEachPage(page, async () => {
		const skipLink = page.locator('a[href="#main-content"]');
		const viewport = page.viewportSize()!;

		const before = await skipLink.boundingBox();
		const hidden =
			before === null ||
			(before.width <= 1 && before.height <= 1) ||
			before.x + before.width <= 0 ||
			before.y + before.height <= 0 ||
			before.x >= viewport.width ||
			before.y >= viewport.height;
		expect(hidden, `skip link box before focus: ${JSON.stringify(before)}`).toBe(true);

		await page.keyboard.press('Tab');
		await expect(skipLink).toBeFocused();
		await expect(skipLink).toBeVisible();
		await expect(skipLink).toBeInViewport({ ratio: 1 });
		const after = await skipLink.boundingBox();
		expect(after!.width).toBeGreaterThan(1);
		expect(after!.height).toBeGreaterThan(1);
	});
});

test('F1.9 Enter on skip link moves focus into main', async ({ page }) => {
	await forEachPage(page, async () => {
		await page.keyboard.press('Tab');
		await expect(page.locator('a[href="#main-content"]')).toBeFocused();
		await page.keyboard.press('Enter');
		await expect
			.poll(() => page.evaluate(() => document.activeElement?.closest('#main-content') !== null))
			.toBe(true);
	});
});

test('F1.10 page has one h1 and no skipped heading levels', async ({ page }) => {
	await forEachPage(page, async () => {
		await expect(page.locator('h1')).toHaveCount(1);
		const levels = await page
			.locator('h1, h2, h3, h4, h5, h6')
			.evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
		expect(levels[0], 'first heading is the h1').toBe(1);
		let highest = 0;
		for (const level of levels) {
			expect(level, `heading levels ${JSON.stringify(levels)} skip a level`).toBeLessThanOrEqual(highest + 1);
			highest = Math.max(highest, level);
		}
	});
});

test('F1.11 footer links to all pages', async ({ page }) => {
	await forEachPage(page, async () => {
		const hrefs = await hrefsOf(page, 'footer a');
		for (const path of navPaths) expect(hrefs).toContain(path);
	});
});

test('F1.12 footer shows the fictional-product notice', async ({ page }) => {
	await forEachPage(page, async () => {
		const notice = page
			.locator('footer')
			.getByText('LabForge is a fictional product built as a portfolio project.', { exact: true });
		await expect(notice).toBeVisible();
	});
});

test('F1.13 header logo is an inline SVG link to / named "LabForge home"', async ({ page }) => {
	await forEachPage(page, async () => {
		const logo = page.locator('header').getByRole('link', { name: 'LabForge home', exact: true });
		await expect(logo).toHaveCount(1);
		await expect(logo).toHaveAttribute('href', '/');
		await expect(logo.locator('svg')).toHaveCount(1);
		await expect(logo.locator('svg')).toBeVisible();
	});
});

test('F1.14 SVG favicon is linked and favicon.ico is gone', async ({ page }) => {
	await forEachPage(page, async () => {
		const icons = page.locator('link[rel="icon"]');
		await expect(icons).toHaveCount(1);
		await expect(icons).toHaveAttribute('href', '/favicon.svg');
		await expect(icons).toHaveAttribute('type', 'image/svg+xml');
		await expect(page.locator('link[href*="favicon.ico"]')).toHaveCount(0);
	});

	const svg = await page.request.get('/favicon.svg');
	expect(svg.status()).toBe(200);
	expect(svg.headers()['content-type']).toContain('image/svg+xml');

	const ico = await page.request.get('/favicon.ico');
	expect(ico.status()).toBe(404);
});

test('F1.15 nav is fully visible at 360 px with no collapsible menu', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await forEachPage(page, async () => {
		const header = page.locator('header');
		const links = header.locator('nav[aria-label="Main"] a');
		await expect(links).toHaveCount(navPaths.length);
		for (const link of await links.all()) {
			await expect(link).toBeVisible();
			await expect(link).toBeInViewport({ ratio: 1 });
		}
		await expect(header.locator('[aria-expanded], details')).toHaveCount(0);
		// TODO(F2): also assert the theme toggle is visible at 360 px once it exists.
	});
});
