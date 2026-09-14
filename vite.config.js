import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative asset paths for GitHub Pages compatibility
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
