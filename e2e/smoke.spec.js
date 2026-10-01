import { test, expect } from "@playwright/test";

// One distinctive section title per view, used to prove each lazy chunk loads.
const VIEWS = [
  { nav: "Overview", title: "Overview Dashboard", marker: "Global Region Performance" },
  { nav: "Performance", title: "Performance Analytics", marker: "24-Hour Performance Breakdown" },
  { nav: "Inventory", title: "Inventory Management", marker: "Inventory by Category" },
  { nav: "Shipments", title: "Shipment Tracking", marker: "Carrier Performance Matrix" },
  { nav: "AI Insights", title: "AI-Powered Insights", marker: "Model Performance Metrics" },
  { nav: "Alerts", title: "Alerts & Notifications", marker: "Active Alerts" },
];

test.describe("dashboard smoke test", () => {
  let pageErrors;

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") pageErrors.push(msg.text());
    });
    await page.goto("./");
    await expect(page.getByRole("heading", { name: "Supply Chain Intelligence Hub" })).toBeVisible();
  });

  test.afterEach(() => {
    expect(pageErrors, "no page or console errors").toEqual([]);
  });

  test("loads the production bundle under the Pages base path", async ({ page }) => {
    const script = page.locator('script[type="module"]');
    await expect(script).toHaveAttribute("src", /^\/Real-Time-Supply-Chain-Analytics-Dashboard\/assets\/index-.*\.js$/);
    await expect(page.getByText("On-Time Delivery")).toBeVisible();
  });

  test("every sidebar entry opens its view", async ({ page }) => {
    for (const view of VIEWS) {
      await page.getByRole("button", { name: new RegExp(`^${view.nav}`) }).click();
      await expect(page.getByTestId("view-title")).toHaveText(view.title);
      await expect(page.getByText(view.marker, { exact: true })).toBeVisible();
    }
  });

  test("KPI trend badges stay stable between data refreshes while the clock ticks", async ({ page }) => {
    // Regression test for the render-time randomness that made the trend
    // arrows flip every second. Sample twice inside one refresh window.
    const badges = page.getByTestId("kpi-change");
    await expect(badges).toHaveCount(6);
    const clock = page.getByTestId("clock");

    const t0 = await badges.allTextContents();
    const clock0 = await clock.textContent();
    await page.waitForTimeout(1200);
    const t1 = await badges.allTextContents();
    const clock1 = await clock.textContent();

    expect(t1).toEqual(t0);
    expect(clock1).not.toBe(clock0);
  });

  test("dismissing an alert lowers the sidebar count", async ({ page }) => {
    const count = page.getByTestId("alert-count");
    const before = Number(await count.textContent());
    expect(before).toBeGreaterThanOrEqual(2);

    await page.getByRole("button", { name: /^Alerts/ }).click();
    await expect(page.getByText(`${before} ACTIVE`)).toBeVisible();
    await page.getByRole("button", { name: "x" }).first().click();
    await expect(page.getByText(`${before - 1} ACTIVE`)).toBeVisible();
    await expect(count).toHaveText(String(before - 1));
  });
});
