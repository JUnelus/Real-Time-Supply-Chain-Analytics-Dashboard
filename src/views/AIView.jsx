import React from "react";
import { Cpu } from "lucide-react";
import { SectionHeader, AIInsightCard } from "./viewShared";
import { buildAnomalyInsight, buildReorderInsight } from "../data/analytics";

// Illustrative insight copy. Each card is tagged SAMPLE in the UI. Two cards
// are replaced at render time by live computations (see data/analytics.js):
// Anomaly Detection over the 24-hour on-time series, and Inventory Prediction
// from each category's burn rate and reorder point.
const SAMPLE_INSIGHTS = [
  { title: "Demand Forecasting", source: "sample", confidence: 87, description: "ML model predicts 23% increase in Electronics demand next week based on seasonal patterns and market signals.", action: "Recommend increasing inventory by 150 units" },
  { title: "Route Optimization", source: "sample", confidence: 92, description: "AI identified 3 inefficient delivery routes in the Southeast corridor. Rerouting can save 2.4 hours per truck.", action: "Potential savings: $1,200/week with route optimization" },
  { title: "Anomaly Detection", source: "sample", confidence: 78, description: "Unusual pattern in West Coast shipment delays detected - 340% above baseline, likely weather or carrier disruption.", action: "Investigate carrier performance metrics immediately" },
  { title: "Customer Behavior", source: "sample", confidence: 85, description: "NLP analysis of 12,000 customer reviews reveals 15% increase in express delivery requests and premium tier interest.", action: "Consider premium shipping tier pricing strategy" },
  { title: "Inventory Prediction", source: "sample", confidence: 81, description: "Predictive model forecasts stockout risk for Automotive parts within 8 days based on current burn rate.", action: "Reorder 400 units to maintain safety stock buffer" },
  { title: "Cost Optimization", source: "sample", confidence: 89, description: "AI identified consolidation opportunities across 5 warehouse locations, reducing storage overhead by 18%.", action: "Consolidate SKUs across Dallas & Houston facilities" },
];

const ML_STATS = [
  { label: "Demand Forecast MAPE", value: "4.2%", sub: "Mean Absolute % Error", color: "#00ffaa" },
  { label: "Route Opt Savings", value: "$48K", sub: "Month-to-date", color: "#00e5ff" },
  { label: "Anomaly Precision", value: "93.1%", sub: "True positive rate", color: "#a855f7" },
  { label: "Models in Production", value: "12", sub: "Active ML pipelines", color: "#fbbf24" },
];

export default function AIView({ performanceData = [], inventoryData = [] }) {
  const live = {
    "Anomaly Detection": buildAnomalyInsight(performanceData),
    "Inventory Prediction": buildReorderInsight(inventoryData),
  };
  const insights = SAMPLE_INSIGHTS.map((ins) => live[ins.title] ?? ins);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="grid-cards-lg">
        {insights.map((ins) => <AIInsightCard key={ins.title} insight={ins} />)}
      </div>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={Cpu} title="Model Performance Metrics" badge="ML STATS" badgeColor="#a855f7" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16 }}>
          {ML_STATS.map((m, i) => (
            <div key={i} className="glass glass-hover rounded-xl" style={{ padding: 18 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
