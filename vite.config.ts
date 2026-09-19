import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Modul 8: Build pipeline modern — aliasing, code splitting, dan minifikasi esbuild.
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Pustaka validasi dipisah agar dapat di-cache terpisah oleh browser.
            if (id.includes('/zod/')) return 'zod';
            // Sisa dependensi (mis. class-variance-authority) masuk chunk vendor.
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
});
