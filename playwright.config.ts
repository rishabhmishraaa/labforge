import { defineConfig, devices } from '@playwright/test';

// Default: build the site and test the production build on a local preview server. A dedicated port (not Astro's
// default 4321) and no server reuse mean tests never hit a running dev server.
// With BASE_URL set (for example the live Vercel site), tests run against that URL and no local server is started.
const PORT = 4322;
const remoteURL = process.env.BASE_URL?.replace(/\/+$/, '');
const baseURL = remoteURL || `http://localhost:${PORT}`;

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	// No retries: a flaky test should fail, not be hidden.
	retries: 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL,
	},
	// Chromium only (SPEC.md D8).
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: remoteURL
		? undefined
		: {
				command: `npm run build && npm run preview -- --port ${PORT}`,
				url: baseURL,
				reuseExistingServer: false,
				timeout: 120_000,
			},
});
