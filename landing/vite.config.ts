import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Base path is set via env var so the same code deploys cleanly to either:
  //   • GitHub Pages (subpath): VITE_BASE_PATH=/crido/  (set in workflow)
  //   • Vercel / custom domain (root): VITE_BASE_PATH unset → defaults to '/'
  base: process.env.VITE_BASE_PATH || '/',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5180,
  },
})
