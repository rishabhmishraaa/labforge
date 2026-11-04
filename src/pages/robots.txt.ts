// robots.txt (SPEC.md F7.4–F7.6). Generated from `site` so the domain is set only in astro.config.mjs (F6.1, F7.5).
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	if (!site) {
		throw new Error('robots.txt: set `site` in astro.config.mjs; the Sitemap URL depends on it.');
	}

	const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('/sitemap-index.xml', site).href}`, ''].join('\n');

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
