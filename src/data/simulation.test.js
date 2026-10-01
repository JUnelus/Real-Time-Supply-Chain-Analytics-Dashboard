import { describe, it, expect, vi, afterEach } from "vitest";
import {
  clamp,
  INITIAL_KPI,
  KPI_BOUNDS,
  stepKpi,
  KPI_CHANGE_RANGES,
  mkKpiChanges,
  SPARK_POINTS,
  mkSparks,
  PERF_HOURS,
  DISRUPTION_RATE,
  DISRUPTION_DROP,
  ON_TIME_RANGE,
  mkPerformance,
  advancePerformance,
  INVENTORY_CATEGORIES,
  mkInventory,
  stepInventory,
  RESTOCK_THRESHOLD,
  BASE_REGIONS,
  stepRegions,
  ALERT_POOL,
  MIN_ALERTS,
  mkAlerts,
} from "./simulation";

afterEach(() => vi.restoreAllMocks());

describe("clamp", () => {
  it("returns the value when inside the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("pins to the nearest bound when outside the range", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe("stepKpi", () => {
  it("produces the same metric keys as the initial KPI set", () => {
    expect(Object.keys(stepKpi(INITIAL_KPI)).sort()).toEqual(Object.keys(INITIAL_KPI).sort());
  });

  it("moves each metric by no more than its configured drift", () => {
    const next = stepKpi(INITIAL_KPI);
    for (const [key, { drift }] of Object.entries(KPI_BOUNDS)) {
      expect(Math.abs(next[key] - INITIAL_KPI[key])).toBeLessThanOrEqual(drift + 1e-9);
    }
  });

  it("clamps every metric into its bounds even from a wildly out-of-range start", () => {
    const tooHigh = Object.fromEntries(Object.keys(KPI_BOUNDS).map((k) => [k, 1e6]));
    const tooLow = Object.fromEntries(Object.keys(KPI_BOUNDS).map((k) => [k, -1e6]));
    for (const [key, { min, max }] of Object.entries(KPI_BOUNDS)) {
      expect(stepKpi(tooHigh)[key]).toBe(max);
      expect(stepKpi(tooLow)[key]).toBe(min);
    }
  });
});

describe("mkKpiChanges", () => {
  it("returns one change per KPI card inside its configured range", () => {
    const changes = mkKpiChanges();
    expect(Object.keys(changes).sort()).toEqual(Object.keys(KPI_CHANGE_RANGES).sort());
    for (const [key, [lo, hi]] of Object.entries(KPI_CHANGE_RANGES)) {
      expect(changes[key]).toBeGreaterThanOrEqual(lo);
      expect(changes[key]).toBeLessThanOrEqual(hi);
    }
  });
});

describe("mkSparks", () => {
  it("builds a fixed-length numeric series for every KPI card", () => {
    const sparks = mkSparks();
    expect(Object.keys(sparks).sort()).toEqual(Object.keys(KPI_CHANGE_RANGES).sort());
    for (const series of Object.values(sparks)) {
      expect(series).toHaveLength(SPARK_POINTS);
      for (const point of series) expect(typeof point.v).toBe("number");
    }
  });
});

describe("performance window", () => {
  it("seeds 24 hourly points labelled 0 through 23", () => {
    const perf = mkPerformance();
    expect(perf).toHaveLength(PERF_HOURS);
    expect(perf.map((p) => p.hour)).toEqual(Array.from({ length: 24 }, (_, i) => i));
    for (const p of perf) {
      // Normal band is 88-100; a disrupted hour may drop by up to DISRUPTION_DROP[1].
      expect(p.onTime).toBeGreaterThanOrEqual(ON_TIME_RANGE[0] - DISRUPTION_DROP[1]);
      expect(p.onTime).toBeLessThanOrEqual(ON_TIME_RANGE[1]);
      expect(typeof p.disrupted).toBe("boolean");
      expect(p.accuracy).toBeGreaterThanOrEqual(95);
      expect(p.efficiency).toBeLessThanOrEqual(95);
    }
  });

  it("drops the oldest hour, appends the next one, and wraps at midnight", () => {
    const perf = mkPerformance();
    const next = advancePerformance(perf);
    expect(next).toHaveLength(PERF_HOURS);
    expect(next[0]).toEqual(perf[1]);
    expect(next[next.length - 1].hour).toBe(0);
  });

  it("keeps advancing the hour counter across several steps", () => {
    let perf = mkPerformance();
    for (let i = 0; i < 5; i++) perf = advancePerformance(perf);
    expect(perf[perf.length - 1].hour).toBe(4);
    expect(perf[0].hour).toBe(5);
  });

  it("marks an hour as disrupted and drops its on-time rate when the roll is low", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // below DISRUPTION_RATE, and rnd() returns each range's minimum
    const [p] = mkPerformance();
    expect(p.disrupted).toBe(true);
    expect(p.onTime).toBe(ON_TIME_RANGE[0] - DISRUPTION_DROP[0]);
  });

  it("leaves an hour undisturbed when the roll is above the disruption rate", () => {
    vi.spyOn(Math, "random").mockReturnValue(DISRUPTION_RATE + 0.4);
    const [p] = mkPerformance();
    expect(p.disrupted).toBe(false);
    expect(p.onTime).toBeGreaterThanOrEqual(ON_TIME_RANGE[0]);
  });

  it("re-seeds a full window when given an empty one", () => {
    expect(advancePerformance([])).toHaveLength(PERF_HOURS);
    expect(advancePerformance(undefined)).toHaveLength(PERF_HOURS);
  });
});

describe("mkInventory", () => {
  it("returns one row per category with integer stock levels and a one-decimal turnover", () => {
    const inv = mkInventory();
    expect(inv.map((r) => r.category)).toEqual(INVENTORY_CATEGORIES);
    for (const row of inv) {
      expect(Number.isInteger(row.current)).toBe(true);
      expect(Number.isInteger(row.optimal)).toBe(true);
      expect(row.current).toBeGreaterThanOrEqual(200);
      expect(row.current).toBeLessThan(1200);
      expect(row.turnover).toMatch(/^\d+\.\d$/);
    }
  });
});

describe("stepInventory", () => {
  const row = { category: "Books", current: 500, optimal: 600, turnover: "7.3" }; // burn 12/day

  it("consumes about a day of stock at the burn rate and keeps the other fields", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // rnd(0.5, 1.5) -> 1.0
    const [next] = stepInventory([row]);
    expect(next.current).toBe(488);
    expect(next).toMatchObject({ category: "Books", optimal: 600, turnover: "7.3" });
  });

  it("restocks to optimal once stock falls to the threshold", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const low = { ...row, current: Math.ceil(row.optimal * RESTOCK_THRESHOLD) + 5 }; // 95 -> 83, at or under 90
    expect(stepInventory([low])[0].current).toBe(600);
  });

  it("never goes negative and does not mutate the input", () => {
    const input = [{ ...row, turnover: "0" }];
    const out = stepInventory(input);
    expect(out[0].current).toBe(500);
    expect(out[0]).not.toBe(input[0]);
    expect(input[0].current).toBe(500);
  });
});

describe("stepRegions", () => {
  it("keeps region identity and only nudges the on-time rate within bounds", () => {
    const regions = stepRegions();
    expect(regions.map((r) => r.region)).toEqual(BASE_REGIONS.map((r) => r.region));
    regions.forEach((r, i) => {
      expect(r.shipments).toBe(BASE_REGIONS[i].shipments);
      expect(r.color).toBe(BASE_REGIONS[i].color);
      expect(Math.abs(r.onTime - BASE_REGIONS[i].onTime)).toBeLessThanOrEqual(0.5 + 1e-9);
      expect(r.onTime).toBeGreaterThanOrEqual(80);
      expect(r.onTime).toBeLessThanOrEqual(99);
    });
  });
});

describe("mkAlerts", () => {
  it("returns between MIN_ALERTS and the full pool, drawn in pool order", () => {
    for (let i = 0; i < 50; i++) {
      const alerts = mkAlerts();
      expect(alerts.length).toBeGreaterThanOrEqual(MIN_ALERTS);
      expect(alerts.length).toBeLessThanOrEqual(ALERT_POOL.length);
      alerts.forEach((a, idx) => expect(a.message).toBe(ALERT_POOL[idx].message));
    }
  });

  it("hits both ends of the count range", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(mkAlerts()).toHaveLength(MIN_ALERTS);
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(mkAlerts()).toHaveLength(ALERT_POOL.length);
  });

  it("gives every alert a unique id and a timestamp from the supplied clock", () => {
    const now = new Date(2026, 0, 15, 9, 30, 0);
    const alerts = mkAlerts(now);
    const ids = alerts.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of alerts) {
      expect(a.id.startsWith(`${now.getTime()}-`)).toBe(true);
      expect(a.timestamp).toBe(now.toLocaleTimeString());
    }
  });

  it("does not mutate the shared alert pool", () => {
    const before = JSON.stringify(ALERT_POOL);
    mkAlerts();
    expect(JSON.stringify(ALERT_POOL)).toBe(before);
  });
});
