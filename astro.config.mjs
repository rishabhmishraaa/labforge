// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Placeholder (SPEC.md): replace with the real Vercel URL before launch.
  // All absolute URLs (canonical, Open Graph) are built from this value.
  site: 'https://labforge.example.com',
  // No trailing slashes: /pricing is built to dist/pricing.html (SPEC.md D4).
  trailingSlash: 'never',
  build: {
    format: 'file'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
