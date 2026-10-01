import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://junelus.github.io/Real-Time-Supply-Chain-Analytics-Dashboard/
// so production assets need the repo name as the base path. Local dev stays at "/".
const REPO_BASE = '/Real-Time-Supply-Chain-Analytics-Dashboard/'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // Production builds and `vite preview` use the Pages base path; `vite dev` stays at '/'.
  base: command === 'build' || isPreview ? REPO_BASE : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    // Playwright owns e2e/; keep Vitest from picking those specs up.
    exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
    css: false,
  },
}))
