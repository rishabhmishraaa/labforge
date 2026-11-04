import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { forEachPage, indexablePages, notFoundPath, pages } from './helpers';

// F6 — SEO meta & Open Graph (SPEC.md).
const SITE = 'https://labforge.example.com';
const root = fileURLToPath(new URL('..', import.meta.url));

const canonicalFor: Record<string, string> = {
	'/': `${SITE}/`,
	'/pricing': `${SITE}/pricing`,
	'/about': `${SITE}/about`,
};

const meta = (page: Page, attr: 'name' | 'property', key: string) => page.locator(`head meta[${attr}="${key}"]`);

function filesUnder(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = join(dir, entry.name);
		return entry.isDirectory() ? filesUnder(full) : [full];
	});
}

test('F6.1 site is set once in astro.config.mjs and nowhere else', async () => {
	const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8');
	expect(config).toContain(`site: '${SITE}'`);
	expect(config).toContain(`trailingSlash: 'never'`);
	expect(config).toMatch(/build:\s*\{\s*format:\s*'file'\s*\}/);

	const offenders = ['src', 'public']
		.flatMap((dir) => filesUnder(join(root, dir)))
		.filter((file) => readFileSync(file, 'latin1').includes('labforge.example.com'))
		.map((file) => file.slice(root.length));
	expect(offenders, 'files that hard-code the site domain').toEqual([]);
});

test('F6.2 each page has one unique title of 1–60 characters', async ({ page }) => {
	const titles = new Set<string>();
	await forEachPage(page, async () => {
		await expect(page.locator('head title')).toHaveCount(1);
		const title = await page.title();
		expect(title.length, `title "${title}"`).toBeGreaterThanOrEqual(1);
		expect(title.length, `title "${title}"`).toBeLessThanOrEqual(60);
		titles.add(title);
	});
	expect(titles.size, 'all titles are different').toBe(pages.length);
});

test('F6.3 each page has one unique meta description of 1–160 characters', async ({ page }) => {
	const descriptions = new Set<string>();
	await forEachPage(page, async () => {
		const description = meta(page, 'name', 'description');
		await expect(description).toHaveCount(1);
		const content = (await description.getAttribute('content')) ?? '';
		expect(content.length, `description "${content}"`).toBeGreaterThanOrEqual(1);
		expect(content.length, `description "${content}"`).toBeLessThanOrEqual(160);
		descriptions.add(content);
	});
	expect(descriptions.size, 'all descriptions are different').toBe(pages.length);
});

test('F6.4 canonical URL is absolute with no trailing slash', async ({ page }) => {
	await forEachPage(page, async (path) => {
		const canonical = page.locator('head link[rel="canonical"]');
		await expect(canonical).toHaveCount(1);
		await expect(canonical).toHaveAttribute('href', canonicalFor[path]);
	}, indexablePages);

	await forEachPage(page, async () => {
		await expect(page.locator('head link[rel="canonical"]'), '404 page has no canonical link').toHaveCount(0);
	}, [notFoundPath]);
});

test('F6.5 Open Graph tags are present and use absolute URLs', async ({ page }) => {
	await forEachPage(page, async (path) => {
		for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) {
			const tag = meta(page, 'property', key);
			await expect(tag, key).toHaveCount(1);
			await expect(tag, key).toHaveAttribute('content', /\S/);
		}
		const canonical = await page.locator('head link[rel="canonical"]').getAttribute('href');
		await expect(meta(page, 'property', 'og:url')).toHaveAttribute('content', canonical!);
		await expect(meta(page, 'property', 'og:url')).toHaveAttribute('content', canonicalFor[path]);
		await expect(meta(page, 'property', 'og:type')).toHaveAttribute('content', 'website');

		const image = (await meta(page, 'property', 'og:image').getAttribute('content'))!;
		expect(new URL(image).protocol).toBe('https:');
		expect(image.startsWith(`${SITE}/`), `og:image ${image} starts with site`).toBe(true);
		// F6.5 lists only /, /pricing and /about; the noindex 404 page has no canonical, so it gets no OG tags.
	}, indexablePages);
});

test('F6.6 og:image is a 1200x630 PNG served from /og-image.png', async ({ page }) => {
	await forEachPage(page, async () => {
		await expect(meta(page, 'property', 'og:image')).toHaveAttribute('content', `${SITE}/og-image.png`);
	}, indexablePages);

	const response = await page.request.get('/og-image.png');
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toContain('image/png');

	const png = await response.body();
	expect(png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'PNG signature').toBe(
		true,
	);
	// IHDR chunk: width and height are big-endian uint32 at bytes 16 and 20.
	expect({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) }).toEqual({ width: 1200, height: 630 });
});

test('F6.8 twitter:card is summary_large_image', async ({ page }) => {
	await forEachPage(page, async () => {
		const card = meta(page, 'name', 'twitter:card');
		await expect(card).toHaveCount(1);
		await expect(card).toHaveAttribute('content', 'summary_large_image');
		// F6.8 lists only /, /pricing and /about.
	}, indexablePages);
});
