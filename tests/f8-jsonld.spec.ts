import { expect, test, type Page } from '@playwright/test';
import { forEachPage, notFoundPath } from './helpers';

// F8 — JSON-LD structured data (SPEC.md).
// Expected offers are copied from the SPEC.md pricing table on purpose, not imported from src/data/pricing.ts.
const SITE = 'https://labforge.example.com';

type JsonObject = Record<string, any>;

const scripts = (page: Page) => page.locator('script[type="application/ld+json"]').allTextContents();

/** Every JSON-LD object on the page (parse errors are reported by F8.1). */
const jsonLd = async (page: Page): Promise<JsonObject[]> => (await scripts(page)).map((s) => JSON.parse(s));

const ofType = (objects: JsonObject[], type: string) => objects.filter((o) => o['@type'] === type);

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

test('F8.1 every JSON-LD block parses and uses the schema.org context', async ({ page }) => {
	await forEachPage(page, async () => {
		const blocks = await scripts(page);
		expect(blocks.length, 'page has JSON-LD').toBeGreaterThan(0);
		for (const block of blocks) {
			let parsed: JsonObject | undefined;
			expect(() => (parsed = JSON.parse(block)), block).not.toThrow();
			expect(parsed!['@context']).toBe('https://schema.org');
		}
	});
});

test('F8.2 every page has exactly one Organization for LabForge', async ({ page }) => {
	await forEachPage(page, async () => {
		const orgs = ofType(await jsonLd(page), 'Organization');
		expect(orgs).toHaveLength(1);
		expect(orgs[0].name).toBe('LabForge');
		// `site` as an absolute URL; the root always ends in "/" (SPEC Site facts).
		expect(orgs[0].url).toBe(`${SITE}/`);
	});
});

test('F8.3 home has one SoftwareApplication with Starter and Team offers', async ({ page }) => {
	await page.goto('/');
	const apps = ofType(await jsonLd(page), 'SoftwareApplication');
	expect(apps).toHaveLength(1);
	const app = apps[0];
	for (const key of ['name', 'description', 'applicationCategory', 'operatingSystem']) {
		expect(typeof app[key], key).toBe('string');
		expect(app[key].trim().length, key).toBeGreaterThan(0);
	}
	expect(app.offers).toEqual([
		{ '@type': 'Offer', name: 'Starter', price: '49', priceCurrency: 'USD' },
		{ '@type': 'Offer', name: 'Team', price: '199', priceCurrency: 'USD' },
	]);
});

test('F8.4 FAQPage matches the visible FAQ exactly and in order', async ({ page }) => {
	await page.goto('/');
	const faqPages = ofType(await jsonLd(page), 'FAQPage');
	expect(faqPages).toHaveLength(1);

	// The FAQ as rendered on the page, not the data file.
	const visible = await page.locator('#faq details').evaluateAll((items) =>
		items.map((item) => ({
			question: item.querySelector(':scope > summary')?.textContent ?? '',
			answer: [...item.children]
				.filter((child) => child.tagName !== 'SUMMARY')
				.map((child) => child.textContent ?? '')
				.join(' '),
		})),
	);
	expect(visible.length, 'visible FAQ items').toBeGreaterThanOrEqual(4);

	const entities: JsonObject[] = faqPages[0].mainEntity;
	expect(entities).toHaveLength(visible.length);
	entities.forEach((entity, i) => {
		expect(entity['@type'], `item ${i + 1}`).toBe('Question');
		expect(entity.acceptedAnswer?.['@type'], `item ${i + 1}`).toBe('Answer');
		expect(squash(entity.name), `question ${i + 1}`).toBe(squash(visible[i].question));
		expect(squash(entity.acceptedAnswer.text), `answer ${i + 1}`).toBe(squash(visible[i].answer));
	});
});

test('F8.5 SoftwareApplication and FAQPage appear only on the home page', async ({ page }) => {
	await forEachPage(
		page,
		async () => {
			const objects = await jsonLd(page);
			expect(ofType(objects, 'SoftwareApplication')).toHaveLength(0);
			expect(ofType(objects, 'FAQPage')).toHaveLength(0);
		},
		['/pricing', '/about', notFoundPath],
	);
});
