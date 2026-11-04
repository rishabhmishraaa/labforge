// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production URL on Vercel (SPEC.md Site facts). Set only here:
  // all absolute URLs (canonical, Open Graph, sitemap, robots.txt, JSON-LD) are built from this value.
  site: 'https://labforge-chi.vercel.app',
  // No trailing slashes: /pricing is built to dist/pricing.html (SPEC.md D4).
  // On Vercel, vercel.json `cleanUrls` serves that file at /pricing.
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
