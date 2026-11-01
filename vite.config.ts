import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs so the built site works from any path (artifact hosting, GitHub Pages).
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    // three is ~150KB gzip on its own, and lives in the lazy engine chunk.
    chunkSizeWarningLimit: 700,
  },
});
