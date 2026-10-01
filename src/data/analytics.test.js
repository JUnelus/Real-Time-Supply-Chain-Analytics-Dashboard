import { describe, it, expect } from "vitest";
import {
  mean,
  stdDev,
  erf,
  normalCdf,
  twoSidedP,
  detectAnomalies,
  buildAnomalyInsight,
  formatHour,
  DEFAULT_Z_THRESHOLD,
  dailyDemand,
  analyzeInventory,
  buildReorderInsight,
  DEFAULT_LEAD_TIME_DAYS,
  DEFAULT_SAFETY_DAYS,
} from "./analytics";

// 24 hours of a steady series with one clear dip at hour 14.
const mkSeries = (overrides = {}) =>
  Array.from({ length: 24 }, (_, hour) => ({ hour, onTime: overrides[hour] ?? 94 + (hour % 3) })); // values 94, 95, 96

describe("descriptive statistics", () => {
  it("computes the mean and sample standard deviation", () => {
    expect(mean([2, 4, 4, 4, 5, 5, 7, 9])).toBe(5);
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });
  it("handles degenerate inputs", () => {
    expect(mean([])).toBe(0);
    expect(stdDev([])).toBe(0);
    expect(stdDev([7])).toBe(0);
    expect(stdDev([3, 3, 3])).toBe(0);
  });
});

describe("normal distribution helpers", () => {
  it("matches reference values of erf", () => {
    expect(erf(0)).toBeCloseTo(0, 7); // approximation error bound is 1.5e-7
    expect(erf(0.5)).toBeCloseTo(0.5205, 4);
    expect(erf(1)).toBeCloseTo(0.8427, 4);
    expect(erf(-1)).toBeCloseTo(-0.8427, 4);
    expect(erf(3)).toBeCloseTo(0.99998, 5);
  });
  it("matches reference values of the normal CDF", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
    expect(normalCdf(3)).toBeCloseTo(0.99865, 4);
  });
  it("gives the familiar two-sided tail probabilities", () => {
    expect(twoSidedP(0)).toBeCloseTo(1, 6);
    expect(twoSidedP(1)).toBeCloseTo(0.3173, 3);
    expect(twoSidedP(2)).toBeCloseTo(0.0455, 3);
    expect(twoSidedP(-2)).toBeCloseTo(0.0455, 3);
    expect(twoSidedP(3)).toBeCloseTo(0.0027, 3);
  });
});

describe("detectAnomalies", () => {
  it("returns null for an empty or missing series", () => {
    expect(detectAnomalies([])).toBeNull();
    expect(detectAnomalies(undefined)).toBeNull();
  });

  it("scores a flat series as all-zero z with no anomalies", () => {
    const r = detectAnomalies(Array.from({ length: 5 }, (_, hour) => ({ hour, onTime: 95 })));
    expect(r.stdDev).toBe(0);
    expect(r.scored.every((s) => s.z === 0)).toBe(true);
    expect(r.anomalies).toEqual([]);
    expect(r.status).toBe("normal");
    expect(r.anomalyScore).toBe(0);
  });

  it("flags a single deep dip, reports its hour and a negative z", () => {
    const r = detectAnomalies(mkSeries({ 14: 80 }));
    expect(r.n).toBe(24);
    expect(r.status).toBe("anomaly");
    expect(r.anomalies).toHaveLength(1);
    expect(r.anomalies[0].hour).toBe(14);
    expect(r.anomalies[0].value).toBe(80);
    expect(r.anomalies[0].z).toBeLessThan(-DEFAULT_Z_THRESHOLD);
    expect(r.mostExtreme.hour).toBe(14);
    expect(r.anomalyScore).toBeGreaterThanOrEqual(95);
  });

  it("orders multiple anomalies by severity", () => {
    const r = detectAnomalies(mkSeries({ 3: 82, 14: 70 }));
    expect(r.anomalies.map((a) => a.hour)).toEqual([14, 3]);
  });

  it("leaves a modest wobble unflagged at the default threshold", () => {
    const r = detectAnomalies(mkSeries({ 14: 93.5 }));
    expect(r.status).toBe("normal");
    expect(r.anomalies).toEqual([]);
  });

  it("respects a custom threshold and a custom field", () => {
    const strict = detectAnomalies(mkSeries({ 14: 93.5 }), { threshold: 1 });
    expect(strict.anomalies.length).toBeGreaterThan(0);

    const series = Array.from({ length: 10 }, (_, hour) => ({ hour, onTime: 90, accuracy: hour === 4 ? 60 : 98 }));
    const byAccuracy = detectAnomalies(series, { key: "accuracy" });
    expect(byAccuracy.key).toBe("accuracy");
    expect(byAccuracy.anomalies[0].hour).toBe(4);
  });

  it("reports the latest point and caps the anomaly score at 99", () => {
    const r = detectAnomalies(mkSeries({ 23: 20 }));
    expect(r.latest.hour).toBe(23);
    expect(r.latest.value).toBe(20);
    expect(r.anomalyScore).toBe(99);
  });
});

describe("buildAnomalyInsight", () => {
  it("returns null without data", () => {
    expect(buildAnomalyInsight([])).toBeNull();
  });

  it("describes a detected dip with its hour, magnitude and an action", () => {
    const ins = buildAnomalyInsight(mkSeries({ 14: 80 }));
    expect(ins.title).toBe("Anomaly Detection");
    expect(ins.source).toBe("live");
    expect(ins.status).toBe("anomaly");
    expect(ins.confidenceLabel).toBe("anomaly score");
    expect(ins.description).toContain("dropped to 80.0% at 14:00");
    expect(ins.description).toMatch(/\d\.\dσ below the 24-hour mean/);
    expect(ins.description).toContain("1 of 24 hours exceed the 2σ threshold");
    expect(ins.action).toBe("Review carrier and route performance for hour 14:00");
    expect(ins.stats.map((s) => s.label)).toEqual(["mean", "σ", "latest z", "flagged", "threshold"]);
    expect(ins.stats[3].value).toBe("1/24");
    expect(ins.stats[4].value).toBe("2σ ≈ 95%");
  });

  it("pluralises the action and lists every flagged hour", () => {
    const ins = buildAnomalyInsight(mkSeries({ 3: 82, 14: 70 }));
    expect(ins.action).toBe("Review carrier and route performance for hours 14:00, 03:00");
  });

  it("describes a quiet series and recommends no action", () => {
    const ins = buildAnomalyInsight(mkSeries());
    expect(ins.status).toBe("normal");
    expect(ins.description).toContain("All 24 hours of on-time delivery sit within 2σ");
    expect(ins.description).toMatch(/Largest deviation: \d\d:00 at \d+\.\d% \(z [+-]\d\.\d\)/);
    expect(ins.action).toContain("No intervention needed");
    expect(ins.stats[3].value).toBe("0/24");
  });
});

describe("formatHour", () => {
  it("zero-pads to HH:00", () => {
    expect(formatHour(0)).toBe("00:00");
    expect(formatHour(9)).toBe("09:00");
    expect(formatHour(23)).toBe("23:00");
  });
});

// Inventory rows: optimal x turnover / 365 gives the daily burn rate.
// Books: 600 x 7.3 / 365 = 12/day -> reorder point 12 x 21 = 252.
// Sports: 400 x 3.65 / 365 = 4/day -> reorder point 84.
const INVENTORY = [
  { category: "Books", current: 480, optimal: 600, turnover: "7.3" },
  { category: "Sports", current: 300, optimal: 400, turnover: "3.65" },
];

describe("dailyDemand", () => {
  it("derives units per day from optimal stock and annual turnover", () => {
    expect(dailyDemand(INVENTORY[0])).toBeCloseTo(12, 6);
    expect(dailyDemand({ optimal: 1000, turnover: "0" })).toBe(0);
  });
});

describe("analyzeInventory", () => {
  it("returns null without rows", () => {
    expect(analyzeInventory([])).toBeNull();
    expect(analyzeInventory(undefined)).toBeNull();
  });

  it("uses a 21-day window by default and reports all-clear when stock is above it", () => {
    expect(DEFAULT_LEAD_TIME_DAYS + DEFAULT_SAFETY_DAYS).toBe(21);
    const r = analyzeInventory(INVENTORY);
    expect(r.status).toBe("ok");
    expect(r.flagged).toEqual([]);
    expect(r.healthPct).toBe(100);
    expect(r.totalOrderQty).toBe(0);
    const books = r.scored.find((s) => s.category === "Books");
    expect(books.reorderPoint).toBeCloseTo(252, 6);
    expect(books.daysOfCover).toBeCloseTo(40, 6);
  });

  it("sorts by days of cover so the tightest category comes first", () => {
    const r = analyzeInventory(INVENTORY);
    expect(r.tightest.category).toBe("Books"); // 40 days vs Sports' 75
    expect(r.scored.map((s) => s.category)).toEqual(["Books", "Sports"]);
  });

  it("flags categories at or below the reorder point and sizes the order to reach optimal", () => {
    const rows = [{ ...INVENTORY[0], current: 200 }, INVENTORY[1]];
    const r = analyzeInventory(rows);
    expect(r.status).toBe("reorder");
    expect(r.flagged.map((f) => f.category)).toEqual(["Books"]);
    expect(r.flagged[0].orderQty).toBe(400);
    expect(r.totalOrderQty).toBe(400);
    expect(r.healthPct).toBe(50);
  });

  it("treats exactly-at-reorder-point as needing an order", () => {
    const r = analyzeInventory([{ ...INVENTORY[0], current: 252 }]);
    expect(r.status).toBe("reorder");
  });

  it("respects custom lead time and safety days", () => {
    const r = analyzeInventory(INVENTORY, { leadTimeDays: 30, safetyDays: 15 }); // 45 days -> Books RP 540
    expect(r.flagged.map((f) => f.category)).toEqual(["Books"]);
    expect(r.scored.find((s) => s.category === "Books").reorderPoint).toBeCloseTo(540, 6);
  });

  it("handles a zero-turnover category without dividing by zero", () => {
    const r = analyzeInventory([{ category: "Art", current: 10, optimal: 100, turnover: "0" }]);
    expect(r.scored[0].daysOfCover).toBe(Infinity);
    expect(r.scored[0].belowReorder).toBe(false);
  });
});

describe("buildReorderInsight", () => {
  it("returns null without rows", () => {
    expect(buildReorderInsight([])).toBeNull();
  });

  it("describes the all-clear state with the tightest category", () => {
    const ins = buildReorderInsight(INVENTORY);
    expect(ins.title).toBe("Inventory Prediction");
    expect(ins.source).toBe("live");
    expect(ins.status).toBe("ok");
    expect(ins.confidence).toBe(100);
    expect(ins.confidenceLabel).toBe("above reorder point");
    expect(ins.description).toContain("All 2 categories sit above their reorder points (14-day lead time + 7 days safety)");
    expect(ins.description).toContain("Tightest is Books with 40.0 days of cover: 480 units at 12.0/day against a reorder point of 252.");
    expect(ins.action).toBe("No purchase orders needed - reorder Books once it drops to 252 units");
    expect(ins.stats.map((s) => s.label)).toEqual(["tightest cover", "lead time", "to reorder", "order qty"]);
    expect(ins.stats[0].value).toBe("40.0d");
    expect(ins.stats[2].value).toBe("0/2");
  });

  it("describes a reorder with quantities for every flagged category", () => {
    const rows = [{ ...INVENTORY[0], current: 200 }, { ...INVENTORY[1], current: 50 }];
    const ins = buildReorderInsight(rows);
    expect(ins.status).toBe("reorder");
    expect(ins.confidence).toBe(0);
    // Sports: 50 / 4 = 12.5 days of cover, the tightest.
    expect(ins.description).toContain("Sports holds 50 units against a burn rate of 4.0/day, about 12.5 days of cover - below its reorder point of 84 units");
    expect(ins.description).toContain("2 of 2 categories are at or below their reorder point.");
    expect(ins.action).toBe("Order 350 units of Sports and 400 Books to restore optimal stock");
    expect(ins.stats[2].value).toBe("2/2");
    expect(ins.stats[3].value).toBe("750");
  });
});
