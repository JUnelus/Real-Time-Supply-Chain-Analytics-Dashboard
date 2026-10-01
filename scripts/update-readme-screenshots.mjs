import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { preview as vitePreview } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const screenshotsDir = path.join(projectRoot, "docs", "screenshots");
// vite preview serves the production build under the same base path as GitHub Pages.
const previewUrl = "http://127.0.0.1:4173/Real-Time-Supply-Chain-Analytics-Dashboard/";

const targets = [
  { navLabel: "Overview", file: "overview.png" },
  { navLabel: "Performance", file: "performance.png" },
  { navLabel: "Inventory", file: "inventory.png" },
  { navLabel: "Shipments", file: "shipments.png" },
  { navLabel: "AI Insights", file: "ai-insights.png" },
  { navLabel: "Alerts", file: "alerts.png" },
];

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.httpServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function run() {
  await mkdir(screenshotsDir, { recursive: true });

  let browser;
  let previewServer;

  try {
    previewServer = await vitePreview({
      root: projectRoot,
      preview: {
        host: "127.0.0.1",
        port: 4173,
        strictPort: true,
      },
      logLevel: "error",
    });

    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1720, height: 980 } });

    await page.goto(previewUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Supply Chain Intelligence Hub", { timeout: 15000 });

    for (const target of targets) {
      await page.locator("button", { hasText: target.navLabel }).first().click();
      await page.waitForTimeout(900);

      // The content pane scrolls internally, so a full-page capture would only
      // show the first viewport. Grow the viewport to the pane's full height.
      const contentHeight = await page.evaluate(() => {
        const pane = document.querySelector(".content");
        return pane.scrollHeight + pane.getBoundingClientRect().top;
      });
      await page.setViewportSize({ width: 1720, height: Math.min(2600, Math.ceil(contentHeight) + 8) });
      await page.waitForTimeout(500);

      const outputPath = path.join(screenshotsDir, target.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      console.log(`Saved ${outputPath}`);
    }

    // Phone-width capture of the overview, to show the responsive layout.
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await mobile.goto(previewUrl, { waitUntil: "networkidle" });
    await mobile.waitForSelector("text=On-Time Delivery", { timeout: 15000 });
    await mobile.waitForTimeout(900);
    const mobilePath = path.join(screenshotsDir, "mobile-overview.png");
    await mobile.screenshot({ path: mobilePath, fullPage: false });
    console.log(`Saved ${mobilePath}`);
    await mobile.close();
  } finally {
    if (browser) {
      await browser.close();
    }

    if (previewServer) {
      await closeServer(previewServer);
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});



