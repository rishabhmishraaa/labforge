import { expect, test, type APIRequestContext } from '@playwright/test';
import { SITE } from './helpers';

// F7 — Sitemap & robots.txt (SPEC.md). Run against the production build (local preview, or BASE_URL).
const indexable = ['/', '/pricing', '/about'];

const locs = (xml: string, parent: 'sitemap' | 'url') =>
	[...xml.matchAll(new RegExp(`<${parent}>\\s*<loc>([^<]+)</loc>`, 'g'))].map((m) => m[1].trim());

/** Sitemap locs are absolute production URLs; fetch them from the preview server by path. */
async function fetchXml(request: APIRequestContext, url: string) {
	const response = await request.get(new URL(url, SITE).pathname);
	expect(response.status(), `GET ${url}`).toBe(200);
	return response.text();
}

/** Same URL with or without a trailing slash counts as one (SPEC F7.3); the root stays "/". */
const normalize = (url: string) => {
	const u = new URL(url);
	return `${u.origin}${u.pathname.replace(/\/+$/, '') || '/'}`;
};

test('F7.3 sitemap lists exactly the three indexable pages', async ({ request }) => {
	const index = await fetchXml(request, '/sitemap-index.xml');
	const sitemaps = locs(index, 'sitemap');
	expect(sitemaps.length, 'sitemap-index references at least one sitemap').toBeGreaterThan(0);

	const urls: string[] = [];
	for (const sitemap of sitemaps) {
		expect(sitemap.startsWith(`${SITE}/`), `${sitemap} is under site`).toBe(true);
		urls.push(...locs(await fetchXml(request, sitemap), 'url'));
	}

	expect(urls.map(normalize).sort()).toEqual(indexable.map((path) => normalize(`${SITE}${path}`)).sort());
	expect(new Set(urls).size, 'no duplicate URLs').toBe(urls.length);
	// Same format as the canonical links: no 404 page, no ".html", no trailing slash except on the root.
	for (const url of urls) {
		expect(url).not.toMatch(/404|\.html$/);
		expect(url === `${SITE}/` || !url.endsWith('/'), `${url} has no trailing slash`).toBe(true);
	}
});

test('F7.4 robots.txt is plain text with User-agent and Sitemap lines', async ({ request }) => {
	const response = await request.get('/robots.txt');
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toContain('text/plain');

	const lines = (await response.text()).split(/\r?\n/).map((line) => line.trim());
	expect(lines).toContain('User-agent: *');
	expect(lines).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
});

test('F7.6 robots.txt does not disallow the indexable pages', async ({ request }) => {
	const text = await (await request.get('/robots.txt')).text();
	const disallowed = [...text.matchAll(/^\s*Disallow:\s*(\S*)/gim)].map((m) => m[1]).filter(Boolean);
	for (const path of indexable) {
		const blockedBy = disallowed.filter((rule) => path.startsWith(rule));
		expect(blockedBy, `rules blocking ${path}`).toEqual([]);
	}
});
