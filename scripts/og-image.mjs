// Generates public/og-image.png (1200x630) by screenshotting scripts/og-card.html
// with the Playwright Chromium already installed for tests (SPEC.md D5, F6.7).
// Usage: npm run og:image
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const WIDTH = 1200;
const HEIGHT = 630;
const source = fileURLToPath(new URL('./og-card.html', import.meta.url));
const output = fileURLToPath(new URL('../public/og-image.png', import.meta.url));

const browser = await chromium.launch();
try {
	const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
	await page.goto(pathToFileURL(source).href);
	await page.screenshot({ path: output, type: 'png' });
} finally {
	await browser.close();
}

// Confirm the size from the PNG header (IHDR width/height at bytes 16-23).
const png = readFileSync(output);
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width !== WIDTH || height !== HEIGHT) {
	throw new Error(`Expected ${WIDTH}x${HEIGHT}, got ${width}x${height}`);
}
console.log(`Wrote ${output} (${width}x${height}, ${(png.length / 1024).toFixed(1)} KB)`);
