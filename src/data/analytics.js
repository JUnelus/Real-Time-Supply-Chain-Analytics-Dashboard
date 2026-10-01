// Real statistics behind the live "Anomaly Detection" insight.
//
// The dashboard charts a rolling 24-hour on-time delivery series. This module
// scores every hour against the series' own mean and standard deviation
// (a z-score), flags hours beyond a threshold, and turns the result into the
// text and figures shown on the AI Insights card. Everything here is pure and
// unit-tested; nothing is hardcoded.

export const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// Sample standard deviation (n - 1). Returns 0 for fewer than two points.
export function stdDev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1));
}

// Error function, Abramowitz & Stegun formula 7.1.26 (|error| < 1.5e-7).
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  return sign * (1 - poly * Math.exp(-ax * ax));
}

// Standard normal CDF: P(Z <= z).
export const normalCdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

// Two-sided tail probability: P(|Z| >= |z|) under the baseline distribution.
export const twoSidedP = (z) => 2 * (1 - normalCdf(Math.abs(z)));

export const DEFAULT_Z_THRESHOLD = 2;

/**
 * Score a time series and flag anomalous points.
 *
 * @param {Array<{hour:number}>} points  series points, oldest first
 * @param {{key?: string, threshold?: number}} opts  field to score and |z| cut-off
 * @returns null for an empty series, otherwise the scored series plus summary
 */
export function detectAnomalies(points, { key = "onTime", threshold = DEFAULT_Z_THRESHOLD } = {}) {
  if (!points || points.length === 0) return null;

  const values = points.map((p) => p[key]);
  const m = mean(values);
  const sd = stdDev(values);

  const scored = points.map((p) => ({ hour: p.hour, value: p[key], z: sd === 0 ? 0 : (p[key] - m) / sd }));
  const anomalies = scored.filter((s) => Math.abs(s.z) >= threshold).sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  const mostExtreme = scored.reduce((best, s) => (Math.abs(s.z) > Math.abs(best.z) ? s : best), scored[0]);
  const latest = scored[scored.length - 1];

  // How unlikely the most extreme hour is under the baseline, as a percentage.
  // Capped at 99 so the card never claims certainty.
  const anomalyScore = Math.min(99, Math.round((1 - twoSidedP(mostExtreme.z)) * 100));

  return {
    key,
    n: points.length,
    mean: m,
    stdDev: sd,
    threshold,
    scored,
    anomalies,
    mostExtreme,
    latest,
    anomalyScore,
    status: anomalies.length > 0 ? "anomaly" : "normal",
  };
}

export const formatHour = (h) => `${String(h).padStart(2, "0")}:00`;
const signed = (z) => `${z >= 0 ? "+" : "-"}${Math.abs(z).toFixed(1)}`;

/**
 * Build the AI Insights card content for the on-time delivery series.
 * Returns null when there is no data to analyse.
 */
export function buildAnomalyInsight(points, opts) {
  const r = detectAnomalies(points, opts);
  if (!r) return null;

  const meanTxt = `${r.mean.toFixed(1)}%`;
  const sdTxt = r.stdDev.toFixed(1);
  const x = r.mostExtreme;

  let description;
  let action;
  if (r.status === "anomaly") {
    const direction = x.z < 0 ? "below" : "above";
    const hours = r.anomalies.map((a) => formatHour(a.hour));
    const plural = hours.length > 1;
    description =
      `On-time delivery ${x.z < 0 ? "dropped" : "spiked"} to ${x.value.toFixed(1)}% at ${formatHour(x.hour)}, ` +
      `${Math.abs(x.z).toFixed(1)}σ ${direction} the ${r.n}-hour mean of ${meanTxt} (σ ${sdTxt}). ` +
      `${r.anomalies.length} of ${r.n} hours exceed the ${r.threshold}σ threshold.`;
    action = `Review carrier and route performance for ${plural ? "hours" : "hour"} ${hours.join(", ")}`;
  } else {
    description =
      `All ${r.n} hours of on-time delivery sit within ${r.threshold}σ of the ${r.n}-hour mean of ${meanTxt} (σ ${sdTxt}). ` +
      `Largest deviation: ${formatHour(x.hour)} at ${x.value.toFixed(1)}% (z ${signed(x.z)}).`;
    action = "No intervention needed - keep monitoring the live series";
  }

  return {
    title: "Anomaly Detection",
    source: "live",
    status: r.status,
    confidence: r.anomalyScore,
    confidenceLabel: "anomaly score",
    description,
    action,
    stats: [
      { label: "mean", value: meanTxt },
      { label: "σ", value: sdTxt },
      { label: "latest z", value: signed(r.latest.z) },
      { label: "flagged", value: `${r.anomalies.length}/${r.n}` },
      // The score needed to flag an hour, so the headline score can be read against it.
      { label: "threshold", value: `${r.threshold}σ ≈ ${Math.round((1 - twoSidedP(r.threshold)) * 100)}%` },
    ],
  };
}
