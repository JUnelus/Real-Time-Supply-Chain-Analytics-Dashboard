import { defineConfig, devices } from "@playwright/test";

// The production bundle is built with the GitHub Pages base path (see
// vite.config.js), so the preview server exposes the app under it too.
const BASE_PATH = "/Real-Time-Supply-Chain-Analytics-Dashboard/";
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}${BASE_PATH}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Build then serve the real production bundle, so the smoke test exercises
  // exactly what GitHub Pages deploys.
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
