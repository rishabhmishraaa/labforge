import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect, test, type Page, type Request } from '@playwright/test';
import { forEachPage, isExpectedNotFoundMessage, notFoundPath, pages } from './helpers';

// Tailwind's default --font-sans, read from the installed theme so the F9.12 check follows Tailwind's own definition
// instead of a hard-coded copy (the stack changed between Tailwind versions).
const normalizeFontStack = (stack: string) =>
	stack
		.split(',')
		.map((f) => f.trim().replace(/^['"]|['"]$/g, ''))
		.join(', ');
const themeCss = readFileSync(createRequire(import.meta.url).resolve('tailwindcss/theme.css'), 'utf8');
const tailwindDefaultSans = normalizeFontStack(themeCss.match(/--font-sans:\s*([^;]+);/)![1].replace(/\s+/g, ' '));

// F9 — Performance & accessibility (SPEC.md). Every test runs on every page, including the 404.
// Lighthouse (F9.1, F9.2) is checked manually; F9.6 is a [Build] check.

const toggle = (page: Page) => page.locator('header button[data-theme-toggle]');

test('F9.3 no console errors or warnings on load or while toggling the theme', async ({ page }) => {
	const messages: string[] = [];
	let current = '';
	page.on('console', (msg) => {
		if ((msg.type() === 'error' || msg.type() === 'warning') && !isExpectedNotFoundMessage(msg)) {
			messages.push(`${current} [${msg.type()}] ${msg.text()}`);
		}
	});
	page.on('pageerror', (err) => messages.push(`${current} [pageerror] ${err.message}`));

	await forEachPage(page, async (path) => {
		current = path;
		await page.waitForLoadState('load');
		await toggle(page).click();
		await toggle(page).click();
	});
	expect(messages).toEqual([]);
});

test('F9.4 every request goes to the site origin', async ({ page, baseURL }) => {
	const origin = new URL(baseURL!).origin;
	for (const path of pages) {
		await test.step(path, async () => {
			const requests: string[] = [];
			const onRequest = (req: Request) => requests.push(req.url());
			page.on('request', onRequest);
			await page.goto(path, { waitUntil: 'load' });
			page.off('request', onRequest);

			expect(requests.length, 'page made requests').toBeGreaterThan(0);
			const thirdParty = requests.filter((url) => !url.startsWith('data:') && new URL(url).origin !== origin);
			expect(thirdParty, 'third-party requests').toEqual([]);
		});
	}
});

test('F9.5 each page loads at most 20 KB of JavaScript', async ({ page }) => {
	const LIMIT = 20 * 1024;
	for (const path of pages) {
		await test.step(path, async () => {
			const external: Promise<number>[] = [];
			const onResponse = (res: import('@playwright/test').Response) => {
				if (res.request().resourceType() === 'script') external.push(res.body().then((b) => b.length));
			};
			page.on('response', onResponse);
			await page.goto(path, { waitUntil: 'load' });
			page.off('response', onResponse);

			// Inline JS only: JSON-LD (application/ld+json) is data, not JavaScript.
			const inline = await page.evaluate(() =>
				[...document.querySelectorAll('script:not([src])')]
					.filter((s) => ['', 'module', 'text/javascript', 'application/javascript'].includes(s.getAttribute('type') ?? ''))
					.reduce((sum, s) => sum + new TextEncoder().encode(s.textContent ?? '').length, 0),
			);
			const externalBytes = (await Promise.all(external)).reduce((a, b) => a + b, 0);
			const total = inline + externalBytes;
			expect(total, `JS bytes on ${path}: inline ${inline} + external ${externalBytes}`).toBeLessThanOrEqual(LIMIT);
		});
	}
});

test('F9.7 images have alt, width and height; raster images use astro:assets', async ({ page }) => {
	await forEachPage(page, async () => {
		const images = await page.locator('img').evaluateAll((imgs) =>
			imgs.map((img) => ({
				src: img.getAttribute('src') ?? '',
				alt: img.getAttribute('alt'),
				width: img.getAttribute('width'),
				height: img.getAttribute('height'),
			})),
		);
		for (const img of images) {
			expect(img.alt, `${img.src} has an alt attribute`).not.toBeNull();
			expect(img.width, `${img.src} has width`).toBeTruthy();
			expect(img.height, `${img.src} has height`).toBeTruthy();
			// astro:assets (<Image>/<Picture>) serves processed raster images from /_astro/.
			if (/\.(png|jpe?g|webp|avif|gif)(\?|$)/i.test(img.src)) {
				expect(new URL(img.src, 'http://x').pathname, `${img.src} comes from astro:assets`).toMatch(/^\/_astro\//);
			}
		}
	});
});

test('F9.8 no horizontal scrolling at 360, 768 and 1280 px', async ({ page }) => {
	for (const width of [360, 768, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await forEachPage(page, async (path) => {
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(width);
		});
	}
});

test('F9.9 every link and button is reachable by Tab and shows a focus indicator', async ({ page }) => {
	await forEachPage(page, async () => {
		// Tag every link and button so focus stops can be matched to them.
		const total = await page.evaluate(() => {
			const els = [...document.querySelectorAll<HTMLElement>('a[href], button')];
			els.forEach((el, i) => el.setAttribute('data-f9', String(i)));
			return els.length;
		});
		const summaries = await page.locator('summary').count();
		expect(total, 'page has links and buttons').toBeGreaterThan(0);

		const reached = new Map<number, { label: string; outline: string; shadow: string; ok: boolean }>();
		for (let i = 0; i < total + summaries + 5; i++) {
			await page.keyboard.press('Tab');
			const stop = await page.evaluate(() => {
				const el = document.activeElement as HTMLElement | null;
				if (!el || el === document.body) return { done: true } as const;
				const index = el.getAttribute('data-f9');
				if (index === null) return { done: false, index: null } as const;
				const s = getComputedStyle(el);
				const hasOutline = s.outlineStyle !== 'none' && s.outlineWidth !== '0px';
				return {
					done: false,
					index: Number(index),
					label: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim()}" ${el.getAttribute('href') ?? ''}`,
					outline: `${s.outlineStyle} ${s.outlineWidth}`,
					shadow: s.boxShadow,
					ok: hasOutline || s.boxShadow !== 'none',
				} as const;
			});
			if (stop.done) break;
			if (stop.index === null) continue;
			if (reached.has(stop.index)) break; // focus wrapped around
			reached.set(stop.index, stop);
		}

		const unreached = await page.evaluate(
			(seen) =>
				[...document.querySelectorAll<HTMLElement>('[data-f9]')]
					.filter((el) => !seen.includes(Number(el.dataset.f9)))
					.map((el) => `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim()}"`),
			[...reached.keys()],
		);
		expect(unreached, 'links/buttons not reached by Tab').toEqual([]);

		const noIndicator = [...reached.values()].filter((r) => !r.ok).map((r) => `${r.label} (outline ${r.outline}, shadow ${r.shadow})`);
		expect(noIndicator, 'focused without a visible indicator').toEqual([]);
	});
});

test('F9.10 header links and buttons, the theme toggle and every CTA are at least 24x24 px', async ({ page }) => {
	for (const width of [1280, 360]) {
		await page.setViewportSize({ width, height: 900 });
		await forEachPage(page, async (path) => {
			// The CTAs on each page (hero + final CTA on /, the home link on the 404), so this can't pass with none.
			const expectedCtas: Record<string, number> = { '/': 2, [notFoundPath]: 1 };
			await expect(page.locator('[data-cta]')).toHaveCount(expectedCtas[path] ?? 0);
			await expect(toggle(page)).toHaveCount(1);

			const targets = page.locator('header a, header button, [data-cta]');
			for (const target of await targets.all()) {
				const box = (await target.boundingBox())!;
				const label = (await target.getAttribute('aria-label')) ?? (await target.innerText()).trim();
				expect(box, `"${label}" is rendered`).not.toBeNull();
				expect(box.width, `"${label}" width at ${width}px`).toBeGreaterThanOrEqual(24);
				expect(box.height, `"${label}" height at ${width}px`).toBeGreaterThanOrEqual(24);
			}
		});
	}
});

test('F9.11 reduced motion: no animation or transition longer than 0.01s', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await forEachPage(page, async () => {
		const slow = await page.evaluate(() => {
			const seconds = (value: string) =>
				value.split(',').map((v) => {
					const t = v.trim();
					return t.endsWith('ms') ? parseFloat(t) / 1000 : parseFloat(t) || 0;
				});
			const found: string[] = [];
			for (const el of document.querySelectorAll('*')) {
				for (const pseudo of [null, '::before', '::after']) {
					const s = getComputedStyle(el, pseudo);
					const max = Math.max(...seconds(s.animationDuration), ...seconds(s.transitionDuration));
					if (max > 0.01) found.push(`${el.tagName.toLowerCase()}${pseudo ?? ''}.${el.className} → ${max}s`);
				}
			}
			return found;
		});
		expect(slow).toEqual([]);
	});
});

test('F9.12 no web fonts: no font requests, no @font-face, system font stack', async ({ page }) => {
	const fontRequests: string[] = [];
	page.on('request', (req) => {
		if (req.resourceType() === 'font') fontRequests.push(req.url());
	});

	await forEachPage(page, async () => {
		const inlineCss = await page.locator('style').allTextContents();
		const sheetUrls = await page
			.locator('link[rel="stylesheet"]')
			.evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).href));
		const sheets = await Promise.all(sheetUrls.map(async (url) => (await page.request.get(url)).text()));
		for (const css of [...inlineCss, ...sheets]) expect(css).not.toContain('@font-face');

		const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
		expect(normalizeFontStack(family), 'body uses Tailwind default system font stack').toBe(tailwindDefaultSans);
	});
	expect(fontRequests).toEqual([]);
});
