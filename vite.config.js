import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/serviceportal/static/inflight-login/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Basic optimizations
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // CSS code splitting
    cssCodeSplit: true
  },
  // Development optimizations
  server: {
    hmr: true,
    open: false
  },
  // CSS optimizations
  css: {
    devSourcemap: false
  }
})

