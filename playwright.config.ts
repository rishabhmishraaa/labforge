import { defineConfig, devices } from '@playwright/test';

// Dedicated port (not Astro's default 4321) and no server reuse, so tests
// always run against a fresh production build, never a running dev server.
const PORT = 4322;
const baseURL = `http://localhost:${PORT}`;

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
	webServer: {
		command: `npm run build && npm run preview -- --port ${PORT}`,
		url: baseURL,
		reuseExistingServer: false,
		timeout: 120_000,
	},
});
