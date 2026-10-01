import { test, expect } from "@playwright/test";

// The page body must never scroll horizontally at any supported width, every
// view must stay reachable from the nav, and the overview must not keep its
// two-column layout once the viewport is too narrow for it.
const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, columns: 1, sidebarOnTop: true },
  { name: "tablet", width: 820, height: 1180, columns: 1, sidebarOnTop: false },
  { name: "desktop", width: 1440, height: 900, columns: 2, sidebarOnTop: false },
];

const noHorizontalOverflow = (page) =>
  page.evaluate(() => ({
    docScroll: document.documentElement.scrollWidth,
    docClient: document.documentElement.clientWidth,
    contentScroll: document.querySelector(".content").scrollWidth,
    contentClient: document.querySelector(".content").clientWidth,
  }));

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("lays out without horizontal overflow and keeps every view reachable", async ({ page }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("./");
      await expect(page.getByRole("heading", { name: "Supply Chain Intelligence Hub" })).toBeVisible();
      await expect(page.getByText("On-Time Delivery")).toBeVisible();

      // Overview chart/shipment grid collapses below the desktop breakpoint.
      const cols = await page.locator(".grid-main-side").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(cols).toBe(vp.columns);

      // Sidebar becomes a top bar on phones.
      const shell = await page.locator(".app-shell").evaluate((el) => getComputedStyle(el).flexDirection);
      expect(shell).toBe(vp.sidebarOnTop ? "column" : "row");

      // Nav buttons keep an accessible name even when their labels are hidden.
      for (const label of ["Overview", "Performance", "Inventory", "Shipments", "AI Insights", "Alerts"]) {
        await expect(page.getByRole("button", { name: new RegExp(`^${label}`) })).toBeVisible();
      }

      for (const [nav, marker] of [
        ["Performance", "24-Hour Performance Breakdown"],
        ["Shipments", "Carrier Performance Matrix"],
        ["AI Insights", "Model Performance Metrics"],
        ["Alerts", "Active Alerts"],
      ]) {
        await page.getByRole("button", { name: new RegExp(`^${nav}`) }).click();
        await expect(page.getByText(marker, { exact: true })).toBeVisible();
        const m = await noHorizontalOverflow(page);
        expect(m.docScroll, `${nav}: document overflow`).toBeLessThanOrEqual(m.docClient);
        expect(m.contentScroll, `${nav}: content overflow`).toBeLessThanOrEqual(m.contentClient);
      }

      expect(errors).toEqual([]);
    });
  });
}
