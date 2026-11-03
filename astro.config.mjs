// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // No trailing slashes: /pricing is built to dist/pricing.html (SPEC.md D4).
  trailingSlash: 'never',
  build: {
    format: 'file'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
