import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: ['es2020', 'safari14'],
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // 将核心模块打包在一起
          'core': [
            './src/js/state.js',
            './src/js/utils.js',
            './src/js/api.js'
          ]
        }
      }
    }
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
