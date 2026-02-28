import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: ['es2020', 'safari14'],
    minify: 'esbuild',
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://amituofo.pages.dev',
        changeOrigin: true,
      },
    },
  },
});
