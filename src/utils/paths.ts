/**
 * Normalizes a URL path to the site's public form: no ".html" (build.format 'file'),
 * no trailing slash, and "/" for the home page. Used for nav state and canonical URLs.
 */
export function normalizePath(path: string): string {
	const trimmed = path.replace(/\.html$/, '').replace(/\/+$/, '');
	return trimmed === '' || trimmed === '/index' ? '/' : trimmed;
}
