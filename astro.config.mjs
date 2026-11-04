// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Placeholder (SPEC.md): replace with the real Vercel URL before launch.
  // All absolute URLs (canonical, Open Graph, sitemap, robots.txt, JSON-LD) are built from this value.
  site: 'https://labforge.example.com',
  // No trailing slashes: /pricing is built to dist/pricing.html (SPEC.md D4).
  trailingSlash: 'never',
  build: {
    format: 'file'
  },
  integrations: [
    // Sitemap of the indexable pages (SPEC.md F7). The 404 page is excluded explicitly (F7.3),
    // so it stays out even if the integration's own defaults change.
    sitemap({
      filter: (page) => new URL(page).pathname.replace(/\/$/, '') !== '/404'
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
