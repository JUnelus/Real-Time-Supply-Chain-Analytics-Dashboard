// Client-side simulation layer.
//
// Every number the dashboard shows comes from the functions in this file; there
// is no backend or external API. They are kept as pure, side-effect-free
// functions so they can be unit-tested directly and so App.jsx is left with
// only state and timer orchestration.

import { DAILY_DEMAND_PROFILE } from "./analytics";

export const rnd = (min, max) => Math.random() * (max - min) + min;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------------------------------------------------------------------------
// Headline KPIs
// ---------------------------------------------------------------------------

export const INITIAL_KPI = {
  onTimeDelivery: 94.2,
  inventoryTurnover: 8.7,
  orderAccuracy: 98.5,
  costPerShipment: 45.3,
  warehouseUtilization: 82.3,
  customerSatisfaction: 4.6,
};

// Each refresh nudges a metric by up to ±drift and clamps it into [min, max],
// so values drift like a live feed without ever leaving a plausible range.
export const KPI_BOUNDS = {
  onTimeDelivery: { drift: 1, min: 85, max: 99 },
  inventoryTurnover: { drift: 0.3, min: 5, max: 12 },
  orderAccuracy: { drift: 0.5, min: 95, max: 99.9 },
  costPerShipment: { drift: 2, min: 35, max: 55 },
  warehouseUtilization: { drift: 1.5, min: 70, max: 95 },
  customerSatisfaction: { drift: 0.1, min: 4.0, max: 5.0 },
};

export function stepKpi(prev) {
  return Object.fromEntries(
    Object.entries(KPI_BOUNDS).map(([key, { drift, min, max }]) => [key, clamp(prev[key] + rnd(-drift, drift), min, max)])
  );
}

// Period-over-period change shown on each KPI card, keyed by the card's short id.
export const KPI_CHANGE_RANGES = {
  otd: [-2, 4],
  inv: [-1, 2],
  oa: [0, 1],
  cps: [-3, 2],
  wu: [-1, 2],
  cr: [0, 0.5],
};

export const mkKpiChanges = () =>
  Object.fromEntries(Object.entries(KPI_CHANGE_RANGES).map(([key, [lo, hi]]) => [key, rnd(lo, hi)]));

// Sparkline series behind each KPI card.
export const SPARK_POINTS = 10;
const SPARK_RANGES = {
  otd: [88, 98],
  inv: [6, 11],
  oa: [96, 99.9],
  cps: [35, 55],
  wu: [70, 92],
  cr: [4.1, 5.0],
};

export const mkSparks = () =>
  Object.fromEntries(
    Object.entries(SPARK_RANGES).map(([key, [lo, hi]]) => [key, Array.from({ length: SPARK_POINTS }, () => ({ v: rnd(lo, hi) }))])
  );

// ---------------------------------------------------------------------------
// 24-hour performance window
// ---------------------------------------------------------------------------

export const PERF_HOURS = 24;

// Roughly one hour in twelve suffers a disruption (carrier delay, weather,
// capacity squeeze) that pulls on-time delivery well below its normal
// 88-100% band. This gives the live anomaly detector in analytics.js real
// outliers to find rather than uniform noise.
export const DISRUPTION_RATE = 0.08;
export const DISRUPTION_DROP = [8, 16];
export const ON_TIME_RANGE = [88, 100];

const mkPerfPoint = (hour) => {
  const disrupted = Math.random() < DISRUPTION_RATE;
  const onTime = rnd(...ON_TIME_RANGE) - (disrupted ? rnd(...DISRUPTION_DROP) : 0);
  return { hour, onTime, accuracy: rnd(95, 100), efficiency: rnd(75, 95), disrupted };
};

export const mkPerformance = () => Array.from({ length: PERF_HOURS }, (_, i) => mkPerfPoint(i));

// Drops the oldest hour and appends the next one so the chart scrolls left
// while always holding exactly PERF_HOURS points. An empty window is re-seeded.
export function advancePerformance(prev) {
  if (!prev || prev.length === 0) return mkPerformance();
  const last = prev[prev.length - 1];
  return [...prev.slice(1), mkPerfPoint((last.hour + 1) % 24)];
}

// ---------------------------------------------------------------------------
// Hourly order volume (demand)
// ---------------------------------------------------------------------------

// orders = BASE x level x daily profile x noise. `level` is a slow random walk
// carried from hour to hour, so the series has a genuine underlying trend for
// the demand forecast in analytics.js to recover, on top of the known
// intraday shape.
export const BASE_ORDERS_PER_HOUR = 320;
export const DEMAND_LEVEL_DRIFT = [-0.015, 0.02];
export const DEMAND_LEVEL_BOUNDS = [0.6, 1.6];
export const DEMAND_NOISE = [0.96, 1.04];

const mkDemandPoint = (hour, prevLevel) => {
  const level = clamp(prevLevel * (1 + rnd(...DEMAND_LEVEL_DRIFT)), ...DEMAND_LEVEL_BOUNDS);
  const orders = Math.max(0, Math.round(BASE_ORDERS_PER_HOUR * level * DAILY_DEMAND_PROFILE[hour % 24] * rnd(...DEMAND_NOISE)));
  return { hour, orders, level };
};

export function mkDemand() {
  const out = [];
  let level = 1;
  for (let h = 0; h < PERF_HOURS; h++) {
    const p = mkDemandPoint(h, level);
    level = p.level;
    out.push(p);
  }
  return out;
}

// Same rolling-window behaviour as the performance series.
export function advanceDemand(prev) {
  if (!prev || prev.length === 0) return mkDemand();
  const last = prev[prev.length - 1];
  return [...prev.slice(1), mkDemandPoint((last.hour + 1) % 24, last.level)];
}

// ---------------------------------------------------------------------------
// Inventory, shipments, regions
// ---------------------------------------------------------------------------

export const INVENTORY_CATEGORIES = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books", "Automotive"];

export const mkInventory = () =>
  INVENTORY_CATEGORIES.map((category) => ({
    category,
    current: Math.floor(rnd(200, 1200)),
    optimal: Math.floor(rnd(400, 1200)),
    turnover: rnd(2, 12).toFixed(1),
  }));

// Each refresh consumes about one simulated day of stock at the category's
// burn rate (optimal x turnover / 365, +/-50%). Once a category falls to
// RESTOCK_THRESHOLD of optimal a delivery arrives and stock returns to optimal,
// so the Inventory view and the live reorder insight keep moving.
export const RESTOCK_THRESHOLD = 0.15;

export function stepInventory(prev) {
  return prev.map((row) => {
    const burn = (row.optimal * Number(row.turnover)) / 365;
    const next = row.current - burn * rnd(0.5, 1.5);
    if (next <= row.optimal * RESTOCK_THRESHOLD) return { ...row, current: row.optimal };
    return { ...row, current: Math.max(0, Math.round(next)) };
  });
}

export const SHIPMENT_STATUS = [
  { name: "Delivered", value: 65 },
  { name: "In Transit", value: 25 },
  { name: "Processing", value: 8 },
  { name: "Delayed", value: 2 },
];

export const BASE_REGIONS = [
  { region: "North America", shipments: 1240, onTime: 96.2, color: "#00e5ff" },
  { region: "Europe", shipments: 980, onTime: 94.7, color: "#a855f7" },
  { region: "Asia Pacific", shipments: 1580, onTime: 91.3, color: "#00ffaa" },
  { region: "Latin America", shipments: 420, onTime: 88.5, color: "#fbbf24" },
  { region: "Middle East", shipments: 310, onTime: 90.1, color: "#f87171" },
];

export const stepRegions = () => BASE_REGIONS.map((r) => ({ ...r, onTime: clamp(r.onTime + rnd(-0.5, 0.5), 80, 99) }));

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export const ALERT_POOL = [
  { type: "error", message: "Shipment delay on Route I-90 - carrier ETA +4h", priority: "High" },
  { type: "warning", message: "Electronics inventory below reorder point (142 units)", priority: "Medium" },
  { type: "warning", message: "Peak demand approaching - scale warehouse resources", priority: "High" },
  { type: "info", message: "AI model recommends 15% improvement in delivery routes", priority: "Low" },
  { type: "success", message: "Customer satisfaction increased 0.3 pts this week", priority: "Low" },
  { type: "error", message: "West Coast distribution center at 94% capacity", priority: "High" },
];

export const MIN_ALERTS = 2;

// Returns between MIN_ALERTS and the full pool. `now` is injectable so tests
// can pin the ids and timestamps.
export function mkAlerts(now = new Date()) {
  const count = Math.floor(rnd(MIN_ALERTS, ALERT_POOL.length + 1));
  return ALERT_POOL.slice(0, count).map((a, i) => ({
    ...a,
    id: `${now.getTime()}-${i}`,
    timestamp: now.toLocaleTimeString(),
  }));
}
