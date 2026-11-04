import { expect, test } from '@playwright/test';

// F4 — Pricing page (SPEC.md). All tests run on "/pricing".
// Expected values are copied from the SPEC.md "Example pricing" table on purpose, not imported from
// src/data/pricing.ts, so a typo in the data file fails these tests.

const shared = ['Azure and AWS sandboxes', 'Labs auto-delete after the time limit'];

const expected = [
	{
		name: 'Starter',
		price: '$49/month',
		items: ['5 seats', '50 lab hours per month', '2-hour max lab duration', ...shared],
	},
	{
		name: 'Team',
		price: '$199/month',
		items: ['25 seats', '300 lab hours per month', '8-hour max lab duration', ...shared],
	},
	{
		name: 'Enterprise',
		price: 'Contact us',
		items: ['Custom seats', 'Custom lab hours per month', 'Custom max lab duration', ...shared],
	},
];

const NOTICE = 'Example pricing for a fictional product. Prices are in USD.';

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

test.beforeEach(async ({ page }) => {
	await page.goto('/pricing');
});

test('F4.1 pricing returns 200 and has one h1', async ({ page }) => {
	const response = await page.request.get('/pricing');
	expect(response.status()).toBe(200);
	await expect(page.locator('h1')).toHaveCount(1);
});

test('F4.2 three plans in order, each with heading, price and feature list', async ({ page }) => {
	const plans = page.locator('main article');
	await expect(plans).toHaveCount(3);
	await expect(plans.locator('h2')).toHaveText(['Starter', 'Team', 'Enterprise']);

	for (const plan of await plans.all()) {
		await expect(plan.locator('[data-price]')).toHaveText(/\S/);
		const items = plan.locator('ul > li');
		await expect(items).toHaveCount(5);
		const texts = (await items.allInnerTexts()).map(squash);
		for (const item of shared) expect(texts).toContain(item);
	}
});

test('F4.3 prices and limits match the example pricing table', async ({ page }) => {
	const plans = page.locator('main article');
	await expect(plans).toHaveCount(expected.length);
	for (const [i, plan] of expected.entries()) {
		await test.step(plan.name, async () => {
			const card = plans.nth(i);
			await expect(card.locator('h2')).toHaveText(plan.name);
			expect(squash(await card.locator('[data-price]').innerText())).toBe(plan.price);
			expect((await card.locator('ul > li').allInnerTexts()).map(squash)).toEqual(plan.items);
		});
	}
});

test('F4.4 only the Team plan is highlighted, with visible "Most popular" text', async ({ page }) => {
	const badge = page.getByText('Most popular', { exact: true });
	await expect(badge).toHaveCount(1);
	await expect(badge).toBeVisible();

	const card = (name: string) => page.locator('main article').filter({ has: page.getByRole('heading', { name, exact: true }) });
	await expect(card('Team').getByText('Most popular', { exact: true })).toBeVisible();
	for (const name of ['Starter', 'Enterprise']) {
		await expect(card(name)).toHaveCount(1);
		await expect(card(name).getByText('Most popular')).toHaveCount(0);
	}

	// The highlight is also visual: Team's border differs from the other plans'.
	const border = (name: string) => card(name).evaluate((el) => getComputedStyle(el).borderTopColor);
	expect(await border('Team')).not.toBe(await border('Starter'));
	expect(await border('Starter')).toBe(await border('Enterprise'));
});

test('F4.5 example-pricing notice is visible above the plans', async ({ page }) => {
	const notice = page.getByText(NOTICE, { exact: true });
	await expect(notice).toHaveCount(1);
	await expect(notice).toBeVisible();

	const firstPlan = page.locator('main article').first();
	// DOM order: the notice comes before the first plan.
	const before = await notice.evaluate(
		(el, plan) => !!(el.compareDocumentPosition(plan as Node) & Node.DOCUMENT_POSITION_FOLLOWING),
		await firstPlan.elementHandle(),
	);
	expect(before, 'notice precedes the first plan in the DOM').toBe(true);

	// Visual order, at mobile and desktop widths.
	for (const width of [360, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		const n = (await notice.boundingBox())!;
		const p = (await firstPlan.boundingBox())!;
		expect(n.y + n.height, `notice bottom ≤ first plan top at ${width}px`).toBeLessThanOrEqual(p.y);
	}
});
