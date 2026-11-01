import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    // three is ~150KB gzip on its own, and lives in the lazy engine chunk.
    chunkSizeWarningLimit: 700,
  },
});
