import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://junelus.github.io/Real-Time-Supply-Chain-Analytics-Dashboard/
// so production assets need the repo name as the base path. Local dev stays at "/".
const REPO_BASE = '/Real-Time-Supply-Chain-Analytics-Dashboard/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPO_BASE : '/',
  plugins: [react(), tailwindcss()],
}))
