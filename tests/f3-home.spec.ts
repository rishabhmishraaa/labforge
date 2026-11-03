import { expect, test, type Locator } from '@playwright/test';

// F3 — Home page (SPEC.md). All tests run on "/".

const nonEmptyText = async (locator: Locator) => {
	await expect(locator).toBeVisible();
	expect((await locator.innerText()).trim().length, 'text is not empty').toBeGreaterThan(0);
};

test.beforeEach(async ({ page }) => {
	const response = await page.goto('/');
	expect(response?.status()).toBe(200);
});

test('F3.1 home has the six sections in order, each labelled by its heading', async ({ page }) => {
	const ids = await page.locator('main > section').evaluateAll((sections) => sections.map((s) => s.id));
	expect(ids).toEqual(['hero', 'features', 'how-it-works', 'testimonials', 'faq', 'final-cta']);

	for (const id of ids) {
		const section = page.locator(`main > section#${id}`);
		const labelId = await section.getAttribute('aria-labelledby');
		expect(labelId, `#${id} has aria-labelledby`).toBeTruthy();
		const heading = section.locator(`#${labelId}`);
		await expect(heading, `#${id} label points to a heading inside the section`).toHaveCount(1);
		expect(await heading.evaluate((el) => /^H[1-6]$/.test(el.tagName))).toBe(true);
		await nonEmptyText(heading);
		// The accessible name of the region is the heading text.
		await expect(page.getByRole('region', { name: (await heading.innerText()).trim(), exact: true })).toHaveAttribute(
			'id',
			id,
		);
	}
});

test('F3.2 hero has the only h1, a paragraph and a View pricing CTA', async ({ page }) => {
	await expect(page.locator('h1')).toHaveCount(1);
	await expect(page.locator('#hero h1')).toHaveCount(1);
	await nonEmptyText(page.locator('#hero p').first());

	const cta = page.locator('#hero').getByRole('link', { name: 'View pricing', exact: true });
	await expect(cta).toHaveCount(1);
	await expect(cta).toHaveAttribute('href', '/pricing');

	const [response] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/pricing')), cta.click()]);
	expect(response.status()).toBe(200);
	await expect(page).toHaveURL(/\/pricing$/);
});

test('F3.3 hero mentions Azure, AWS and launching in the browser', async ({ page }) => {
	const text = await page.locator('#hero').innerText();
	expect(text).toContain('Azure');
	expect(text).toContain('AWS');
	expect(text).toMatch(/launch\w* in the browser/i);
});

test('F3.4 features section has 4–6 items with h3 and description', async ({ page }) => {
	const items = page.locator('#features article');
	const count = await items.count();
	expect(count).toBeGreaterThanOrEqual(4);
	expect(count).toBeLessThanOrEqual(6);
	for (const item of await items.all()) {
		await expect(item.locator('h3')).toHaveCount(1);
		await nonEmptyText(item.locator('h3'));
		await nonEmptyText(item.locator('p'));
	}
});

test('F3.5 a feature covers auto-deleting labs after a time limit', async ({ page }) => {
	const texts = await page.locator('#features article').allInnerTexts();
	expect(texts.some((t) => /auto-delete/i.test(t) && /time limit/i.test(t)), JSON.stringify(texts)).toBe(true);
});

test('F3.6 how it works is an ordered list of exactly 3 steps', async ({ page }) => {
	const steps = page.locator('#how-it-works ol > li');
	await expect(steps).toHaveCount(3);
	for (const step of await steps.all()) {
		await nonEmptyText(step.locator('h3'));
		await nonEmptyText(step.locator('p'));
	}
});

test('F3.7 at least 2 testimonials with blockquote and attribution', async ({ page }) => {
	const figures = page.locator('#testimonials figure');
	expect(await figures.count()).toBeGreaterThanOrEqual(2);
	for (const figure of await figures.all()) {
		await expect(figure.locator('blockquote')).toHaveCount(1);
		await nonEmptyText(figure.locator('blockquote'));

		const caption = figure.locator('figcaption');
		await expect(caption).toBeVisible();
		const name = (await caption.locator('cite').innerText()).trim();
		expect(name.length, 'name').toBeGreaterThan(0);
		const role = (await caption.innerText()).replace(name, '').replace(/^[\s,]+/, '').trim();
		expect(role.length, 'role').toBeGreaterThan(0);
	}
});

test('F3.8 testimonials show a visible fictional-placeholder notice', async ({ page }) => {
	await expect(
		page
			.locator('#testimonials')
			.getByText('These testimonials are fictional placeholders. LabForge is a fictional product.', { exact: true }),
	).toBeVisible();
});

test('F3.10 FAQ has at least 4 details items with summary and answer', async ({ page }) => {
	const items = page.locator('#faq details');
	expect(await items.count()).toBeGreaterThanOrEqual(4);
	for (const item of await items.all()) {
		await expect(item.locator(':scope > summary')).toHaveCount(1);
		await nonEmptyText(item.locator(':scope > summary'));
		// The answer is inside the same <details>, outside the <summary>.
		const answer = await item.evaluate((el) =>
			[...el.children]
				.filter((child) => child.tagName !== 'SUMMARY')
				.map((child) => child.textContent ?? '')
				.join(' ')
				.trim(),
		);
		expect(answer.length, 'answer text').toBeGreaterThan(0);
	}
});

test('F3.11 FAQ items open and close with Enter', async ({ page }) => {
	const items = page.locator('#faq details');
	// Guard against passing vacuously when there are no <details> items.
	expect(await items.count()).toBeGreaterThanOrEqual(4);
	for (const item of await items.all()) {
		const summary = item.locator(':scope > summary');
		const answer = item.locator(':scope > :not(summary)').first();

		await summary.focus();
		await expect(summary).toBeFocused();
		await expect(item).not.toHaveAttribute('open');
		await expect(answer).toBeHidden();

		await page.keyboard.press('Enter');
		await expect(item).toHaveAttribute('open', '');
		await expect(answer).toBeVisible();

		await page.keyboard.press('Enter');
		await expect(item).not.toHaveAttribute('open');
		await expect(answer).toBeHidden();
	}
});

test('F3.13 final CTA has a heading and a View pricing link', async ({ page }) => {
	await expect(page.locator('#final-cta h2')).toHaveCount(1);
	await nonEmptyText(page.locator('#final-cta h2'));
	const cta = page.locator('#final-cta').getByRole('link', { name: 'View pricing', exact: true });
	await expect(cta).toHaveCount(1);
	await expect(cta).toHaveAttribute('href', '/pricing');
});
