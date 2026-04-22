import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import {
  Package, Truck, CheckCircle, DollarSign, Activity, Users, Database,
  Cpu, BarChart2, Globe, Bell, Home, Zap, RefreshCw, ChevronRight,
  ArrowUpRight, ArrowDownRight, GitBranch, Map, TrendingUp, Shield
} from "lucide-react";
const rnd = (min, max) => Math.random() * (max - min) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const SHIPMENT_COLORS = ["#00ffaa", "#00e5ff", "#fbbf24", "#f87171"];
const BASE_REGIONS = [
  { region: "North America", shipments: 1240, onTime: 96.2, color: "#00e5ff" },
  { region: "Europe",        shipments: 980,  onTime: 94.7, color: "#a855f7" },
  { region: "Asia Pacific",  shipments: 1580, onTime: 91.3, color: "#00ffaa" },
  { region: "Latin America", shipments: 420,  onTime: 88.5, color: "#fbbf24" },
  { region: "Middle East",   shipments: 310,  onTime: 90.1, color: "#f87171" },
];
const CARRIERS = [
  { name: "FastFreight Co.",  total: 2450, onTime: 97.2, delay: 0.8, rating: 4.8, status: "Excellent" },
  { name: "Global Express",   total: 1890, onTime: 94.5, delay: 2.1, rating: 4.5, status: "Good"      },
  { name: "PrimeLogistics",   total: 1340, onTime: 91.8, delay: 3.4, rating: 4.2, status: "Good"      },
  { name: "SwiftShip LLC",    total: 980,  onTime: 88.3, delay: 5.2, rating: 3.9, status: "Fair"      },
  { name: "OceanRoute Ltd.",  total: 620,  onTime: 85.1, delay: 6.8, rating: 3.6, status: "Poor"      },
];
const AI_INSIGHTS = [
  { title: "Demand Forecasting",   confidence: 87, description: "ML model predicts 23% increase in Electronics demand next week based on seasonal patterns and market signals.", action: "Recommend increasing inventory by 150 units" },
  { title: "Route Optimization",   confidence: 92, description: "AI identified 3 inefficient delivery routes in the Southeast corridor. Rerouting can save 2.4 hours per truck.", action: "Potential savings: $1,200/week with route optimization" },
  { title: "Anomaly Detection",    confidence: 78, description: "Unusual pattern in West Coast shipment delays detected — 340% above baseline, likely weather or carrier disruption.", action: "Investigate carrier performance metrics immediately" },
  { title: "Customer Behavior",    confidence: 85, description: "NLP analysis of 12,000 customer reviews reveals 15% increase in express delivery requests and premium tier interest.", action: "Consider premium shipping tier pricing strategy" },
  { title: "Inventory Prediction", confidence: 81, description: "Predictive model forecasts stockout risk for Automotive parts within 8 days based on current burn rate.", action: "Reorder 400 units to maintain safety stock buffer" },
  { title: "Cost Optimization",    confidence: 89, description: "AI identified consolidation opportunities across 5 warehouse locations, reducing storage overhead by 18%.", action: "Consolidate SKUs across Dallas & Houston facilities" },
];
const ML_STATS = [
  { label: "Demand Forecast MAPE", value: "4.2%",  sub: "Mean Absolute % Error", color: "#00ffaa" },
  { label: "Route Opt Savings",    value: "$48K",  sub: "Month-to-date",          color: "#00e5ff" },
  { label: "Anomaly Precision",    value: "93.1%", sub: "True positive rate",      color: "#a855f7" },
  { label: "Models in Production", value: "12",    sub: "Active ML pipelines",     color: "#fbbf24" },
];
// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "rgba(7,11,20,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(20px)", fontSize: 12 }}>
      <p style={{ color: "#9ca3af", marginBottom: 6, margin: "0 0 6px" }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "#e5e7eb" }}>{p.name}: </span>
          <span style={{ color: p.color, fontWeight: 600 }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
// ── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, unit, change, icon: Icon, accentColor, sparkData }) {
  const positive = change >= 0;
  const fmt = typeof value === "number" ? value.toFixed(unit === "/5" || unit === "x" ? 1 : 1) : value;
  return (
    <div className="glass glass-hover rounded-2xl" style={{ padding: 20, position: "relative", overflow: "hidden", cursor: "default" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: accentColor, opacity: 0.07, filter: "blur(20px)", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accentColor + "25", border: "1px solid " + accentColor + "45", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} style={{ color: accentColor }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: positive ? "#00ffaa" : "#f87171", background: positive ? "rgba(0,255,170,0.1)" : "rgba(248,113,113,0.1)", padding: "2px 8px", borderRadius: 20 }}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9" }}>{fmt}</span>
        <span style={{ fontSize: 13, color: "#64748b", marginLeft: 4 }}>{unit}</span>
      </div>
      <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12, margin: "0 0 12px" }}>{title}</p>
      {sparkData && (
        <div style={{ height: 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={"sg" + title.replace(/\s/g,"")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={accentColor} strokeWidth={1.5} fill={"url(#sg" + title.replace(/\s/g,"") + ")"} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="progress-bar" style={{ marginTop: 8 }}>
        <div className="progress-fill" style={{ width: Math.min(100, Math.abs(parseFloat(fmt))) + "%", background: "linear-gradient(90deg, " + accentColor + "80, " + accentColor + ")" }} />
      </div>
    </div>
  );
}
// ── Alert Item ────────────────────────────────────────────────────────────────
const ALERT_CFG = {
  error:   { border: "#f87171", bg: "rgba(248,113,113,0.08)", label: "Critical" },
  warning: { border: "#fbbf24", bg: "rgba(251,191,36,0.08)",  label: "Warning"  },
  info:    { border: "#00e5ff", bg: "rgba(0,229,255,0.08)",   label: "Info"     },
  success: { border: "#00ffaa", bg: "rgba(0,255,170,0.08)",   label: "Success"  },
};
function AlertItem({ alert, onDismiss }) {
  const c = ALERT_CFG[alert.type] || ALERT_CFG.info;
  return (
    <div className="animate-slide-in" style={{ background: c.bg, border: "1px solid " + c.border + "30", borderLeft: "3px solid " + c.border, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.border, marginTop: 6, flexShrink: 0 }} className={alert.type === "error" ? "animate-pulse-glow" : ""} />
          <div>
            <p style={{ color: "#e2e8f0", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{alert.message}</p>
            <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#475569" }}>{alert.timestamp}</span>
              <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: c.border + "20", color: c.border, fontWeight: 600 }}>{c.label}</span>
              <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: "#64748b" }}>{alert.priority}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onDismiss(alert.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: 2, fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}
// ── AI Insight Card ───────────────────────────────────────────────────────────
function AIInsightCard({ insight }) {
  return (
    <div className="glass glass-hover rounded-xl animate-fade-up" style={{ padding: 20, background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(0,229,255,0.06))", border: "1px solid rgba(168,85,247,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={14} style={{ color: "#a855f7" }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{insight.title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(168,85,247,0.15)", padding: "3px 10px", borderRadius: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7" }} />
          <span style={{ fontSize: 11, color: "#c4b5fd" }}>{insight.confidence}% confidence</span>
        </div>
      </div>
      <div className="progress-bar" style={{ marginBottom: 10 }}>
        <div className="progress-fill" style={{ width: insight.confidence + "%", background: "linear-gradient(90deg, #a855f780, #a855f7)" }} />
      </div>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}>{insight.description}</p>
      <div style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#7dd3fc", display: "flex", alignItems: "center", gap: 8 }}>
        <Zap size={12} style={{ color: "#00e5ff", flexShrink: 0 }} />
        {insight.action}
      </div>
    </div>
  );
}
// ── Region Row ────────────────────────────────────────────────────────────────
function RegionRow({ r }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0, boxShadow: "0 0 8px " + r.color + "80" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: "#cbd5e1" }}>{r.region}</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{r.shipments.toLocaleString()} shipments</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: r.onTime + "%", background: "linear-gradient(90deg, " + r.color + "60, " + r.color + ")" }} />
        </div>
      </div>
      <span style={{ fontSize: 13, color: r.color, fontWeight: 600, width: 44, textAlign: "right", flexShrink: 0 }}>{r.onTime.toFixed(1)}%</span>
    </div>
  );
}
// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, badge, badgeColor }) {
  const bc = badgeColor || "#00e5ff";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <Icon size={18} style={{ color: bc }} />
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>{title}</h3>
      {badge && (
        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: bc + "20", color: bc, border: "1px solid " + bc + "30", fontWeight: 600, letterSpacing: 0.5 }}>{badge}</span>
      )}
    </div>
  );
}
// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: "overview",    label: "Overview",    icon: Home     },
  { id: "performance", label: "Performance", icon: Activity },
  { id: "inventory",   label: "Inventory",   icon: Package  },
  { id: "shipments",   label: "Shipments",   icon: Truck    },
  { id: "ai",          label: "AI Insights", icon: Cpu      },
  { id: "alerts",      label: "Alerts",      icon: Bell     },
];
function Sidebar({ active, setActive, alertCount }) {
  return (
    <div className="sidebar-bg" style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00e5ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GitBranch size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>Supply Chain</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>INTELLIGENCE HUB</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px" }}>
        <p style={{ fontSize: 10, color: "#334155", letterSpacing: 1.5, padding: "8px", margin: "0 0 4px" }}>MAIN MENU</p>
        {NAV.map(item => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: on ? "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(168,85,247,0.1))" : "transparent", color: on ? "#f1f5f9" : "#64748b", fontSize: 13, fontWeight: on ? 600 : 400, marginBottom: 2, borderLeft: on ? "2px solid #00e5ff" : "2px solid transparent", transition: "all 0.2s" }}>
              <item.icon size={16} style={{ color: on ? "#00e5ff" : "#475569" }} />
              {item.label}
              {item.id === "alerts" && alertCount > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 10, background: "#ef4444", color: "white", borderRadius: 20, padding: "1px 6px", fontWeight: 700 }}>{alertCount}</span>
              )}
              {on && <ChevronRight size={12} style={{ marginLeft: "auto", color: "#00e5ff" }} />}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ffaa" }} className="animate-pulse-glow" />
          <span style={{ fontSize: 11, color: "#475569" }}>All Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
// ── Top Bar ───────────────────────────────────────────────────────────────────
function TopBar({ time, isProcessing, onRefresh }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,11,20,0.85)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div>
        <h1 className="gradient-text-cyan" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Supply Chain Intelligence Hub</h1>
        <p style={{ margin: 0, fontSize: 12, color: "#475569", marginTop: 2 }}>Real-time analytics powered by AI/ML · Live updates every 3s</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {isProcessing && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={12} style={{ color: "#00e5ff" }} className="animate-spin-slow" />
            <span style={{ fontSize: 11, color: "#00e5ff" }}>Refreshing…</span>
          </div>
        )}
        <button onClick={onRefresh} style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 8, padding: "6px 12px", color: "#00e5ff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={12} /> Refresh
        </button>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "monospace", fontSize: 16, color: "#00e5ff", fontWeight: 600 }}>{time.toLocaleTimeString()}</div>
          <div style={{ fontSize: 11, color: "#334155" }}>{time.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
        </div>
      </div>
    </div>
  );
}
// ── Overview View ─────────────────────────────────────────────────────────────
function OverviewView({ kpiData, sparkSets, performanceData, shipmentData, regionData }) {
  const kpis = [
    { title: "On-Time Delivery",       value: kpiData.onTimeDelivery,       unit: "%",  change: rnd(-2,4),   icon: Truck,       color: "#00e5ff", key: "otd" },
    { title: "Inventory Turnover",     value: kpiData.inventoryTurnover,    unit: "x",  change: rnd(-1,2),   icon: Package,     color: "#00ffaa", key: "inv" },
    { title: "Order Accuracy",         value: kpiData.orderAccuracy,        unit: "%",  change: rnd(0,1),    icon: CheckCircle, color: "#a855f7", key: "oa"  },
    { title: "Cost per Shipment",      value: kpiData.costPerShipment,      unit: "$",  change: rnd(-3,0),   icon: DollarSign,  color: "#fbbf24", key: "cps" },
    { title: "Warehouse Utilization",  value: kpiData.warehouseUtilization, unit: "%",  change: rnd(-1,2),   icon: Database,    color: "#f87171", key: "wu"  },
    { title: "Customer Rating",        value: kpiData.customerSatisfaction, unit: "/5", change: rnd(0,0.5),  icon: Users,       color: "#c084fc", key: "cr"  },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16 }}>
        {kpis.map(k => <KPICard key={k.key} title={k.title} value={k.value} unit={k.unit} change={k.change} icon={k.icon} accentColor={k.color} sparkData={sparkSets[k.key]} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <SectionHeader icon={Activity} title="Real-Time Performance Trends" badge="LIVE" badgeColor="#00ffaa" />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  {[["ot","#00ffaa"],["ac","#00e5ff"],["ef","#a855f7"]].map(([id,c]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={c} stopOpacity={0}   />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
                <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} domain={[70,100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }} />
                <Area type="monotone" dataKey="onTime"     stroke="#00ffaa" fill="url(#ot)" strokeWidth={2} name="On-Time %"    dot={false} />
                <Area type="monotone" dataKey="accuracy"   stroke="#00e5ff" fill="url(#ac)" strokeWidth={2} name="Accuracy %"   dot={false} />
                <Area type="monotone" dataKey="efficiency" stroke="#a855f7" fill="url(#ef)" strokeWidth={2} name="Efficiency %" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <SectionHeader icon={Truck} title="Shipment Status" badgeColor="#00e5ff" />
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shipmentData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                  {shipmentData.map((_, i) => <Cell key={i} fill={SHIPMENT_COLORS[i % 4]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {shipmentData.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: SHIPMENT_COLORS[i % 4] }} />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{s.name}</span>
                </div>
                <span style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 600 }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={Globe} title="Global Region Performance" badgeColor="#00e5ff" />
        {regionData.map((r, i) => <RegionRow key={i} r={r} />)}
      </div>
    </div>
  );
}
// ── Performance View ──────────────────────────────────────────────────────────
function PerformanceView({ performanceData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={Activity} title="24-Hour Performance Breakdown" badge="24H" badgeColor="#00ffaa" />
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
              <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} domain={[70,100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 16 }} />
              <Line type="monotone" dataKey="onTime"     stroke="#00ffaa" strokeWidth={2} name="On-Time %"    dot={false} activeDot={{ r: 4, fill: "#00ffaa" }} />
              <Line type="monotone" dataKey="accuracy"   stroke="#00e5ff" strokeWidth={2} name="Accuracy %"   dot={false} activeDot={{ r: 4, fill: "#00e5ff" }} />
              <Line type="monotone" dataKey="efficiency" stroke="#a855f7" strokeWidth={2} name="Efficiency %" dot={false} activeDot={{ r: 4, fill: "#a855f7" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={BarChart2} title="Hourly Efficiency Comparison" badgeColor="#a855f7" />
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData.slice(-12)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
              <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} domain={[70,100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }} />
              <Bar dataKey="efficiency" fill="#a855f7" name="Efficiency %" radius={[4,4,0,0]} opacity={0.85} />
              <Bar dataKey="onTime"     fill="#00e5ff" name="On-Time %"   radius={[4,4,0,0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
// ── Inventory View ────────────────────────────────────────────────────────────
function InventoryView({ inventoryData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={Package} title="Inventory by Category" badge="REAL-TIME" badgeColor="#00ffaa" />
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ffaa" stopOpacity={0.9} /><stop offset="100%" stopColor="#00ffaa" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="bo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.9} /><stop offset="100%" stopColor="#00e5ff" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="category" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
              <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }} />
              <Bar dataKey="current" fill="url(#bc)" name="Current Stock" radius={[4,4,0,0]} />
              <Bar dataKey="optimal" fill="url(#bo)" name="Optimal Level" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16 }}>
        {inventoryData.map((item, i) => {
          const ratio = item.current / item.optimal;
          const sc = ratio >= 0.9 ? "#00ffaa" : ratio >= 0.6 ? "#fbbf24" : "#f87171";
          const sl = ratio >= 0.9 ? "Optimal" : ratio >= 0.6 ? "Low" : "Critical";
          return (
            <div key={i} className="glass glass-hover rounded-xl" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{item.category}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: sc + "20", color: sc, fontWeight: 600 }}>{sl}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: "#f1f5f9" }}>{item.current.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>of {item.optimal.toLocaleString()} optimal · {item.turnover}x turnover</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: Math.min(100, ratio*100) + "%", background: "linear-gradient(90deg, " + sc + "60, " + sc + ")" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── Shipments View ────────────────────────────────────────────────────────────
const STATUS_COLOR = { Excellent: "#00ffaa", Good: "#00e5ff", Fair: "#fbbf24", Poor: "#f87171" };
function ShipmentsView({ shipmentData, regionData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <SectionHeader icon={Truck} title="Shipment Status Breakdown" badgeColor="#00e5ff" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shipmentData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                  {shipmentData.map((_, i) => <Cell key={i} fill={SHIPMENT_COLORS[i % 4]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <SectionHeader icon={Globe} title="Region On-Time Rates" badgeColor="#00ffaa" />
          {regionData.map((r, i) => <RegionRow key={i} r={r} />)}
        </div>
      </div>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={Map} title="Carrier Performance Matrix" badgeColor="#fbbf24" />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Carrier","Total Shipments","On-Time %","Avg Delay","Rating","Status"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#475569", fontWeight: 500, fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CARRIERS.map((c, i) => {
                const sc = STATUS_COLOR[c.status] || "#64748b";
                return (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px", color: "#e2e8f0", fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: "12px", color: "#94a3b8" }}>{c.total.toLocaleString()}</td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: c.onTime + "%", background: sc }} />
                        </div>
                        <span style={{ color: sc, fontSize: 12, fontWeight: 600 }}>{c.onTime}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px", color: "#94a3b8" }}>{c.delay}h</td>
                    <td style={{ padding: "12px", color: "#fbbf24" }}>{"★".repeat(Math.round(c.rating))}<span style={{ color: "#334155" }}>{"★".repeat(5 - Math.round(c.rating))}</span></td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: sc + "20", color: sc, fontWeight: 600 }}>{c.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// ── AI View ───────────────────────────────────────────────────────────────────
function AIView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px,1fr))", gap: 16 }}>
        {AI_INSIGHTS.map((ins, i) => <AIInsightCard key={i} insight={ins} />)}
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
// ── Alerts View ───────────────────────────────────────────────────────────────
function AlertsView({ alerts, onDismiss }) {
  const counts = [
    { label: "Critical", count: alerts.filter(a => a.type === "error").length,   color: "#f87171" },
    { label: "Warning",  count: alerts.filter(a => a.type === "warning").length, color: "#fbbf24" },
    { label: "Info",     count: alerts.filter(a => a.type === "info").length,    color: "#00e5ff" },
    { label: "Success",  count: alerts.filter(a => a.type === "success").length, color: "#00ffaa" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {counts.map((s, i) => (
          <div key={i} className="glass rounded-xl" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{s.label} Alerts</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={Bell} title="Active Alerts" badge={alerts.length + " ACTIVE"} badgeColor="#f87171" />
        {alerts.length > 0 ? alerts.map(a => <AlertItem key={a.id} alert={a} onDismiss={onDismiss} />) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#334155" }}>
            <CheckCircle size={40} style={{ margin: "0 auto 12px", display: "block", color: "#00ffaa", opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: 14 }}>All systems operational — no active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}
// ── Main App ──────────────────────────────────────────────────────────────────
export default function SupplyChainDashboard() {
  const [time,         setTime]         = useState(new Date());
  const [activeTab,    setActiveTab]    = useState("overview");
  const [isProcessing, setIsProcessing] = useState(false);
  const [alerts,       setAlerts]       = useState([]);
  const [perf,         setPerf]         = useState([]);
  const [inv,          setInv]          = useState([]);
  const [shipment,     setShipment]     = useState([]);
  const [regions,      setRegions]      = useState(BASE_REGIONS);
  const [sparks,       setSparks]       = useState({});
  const [kpi, setKpi] = useState({ onTimeDelivery: 94.2, inventoryTurnover: 8.7, orderAccuracy: 98.5, costPerShipment: 45.30, warehouseUtilization: 82.3, customerSatisfaction: 4.6 });
  const mkSparks = () => {
    const s = (n,lo,hi) => Array.from({length:n}, () => ({ v: rnd(lo,hi) }));
    return { otd: s(10,88,98), inv: s(10,6,11), oa: s(10,96,99.9), cps: s(10,35,55), wu: s(10,70,92), cr: s(10,4.1,5.0) };
  };
  const mkAlerts = useCallback(() => {
    const pool = [
      { type: "error",   message: "Shipment delay on Route I-90 — carrier ETA +4h",          priority: "High"   },
      { type: "warning", message: "Electronics inventory below reorder point (142 units)",     priority: "Medium" },
      { type: "warning", message: "Peak demand approaching — scale warehouse resources",       priority: "High"   },
      { type: "info",    message: "AI model recommends 15% improvement in delivery routes",   priority: "Low"    },
      { type: "success", message: "Customer satisfaction increased 0.3 pts this week",        priority: "Low"    },
      { type: "error",   message: "West Coast distribution center at 94% capacity",           priority: "High"   },
    ];
    setAlerts(pool.slice(0, Math.floor(rnd(2, pool.length+1))).map(a => ({ ...a, id: Date.now()+Math.random(), timestamp: new Date().toLocaleTimeString() })));
  }, []);
  const init = useCallback(() => {
    setPerf(Array.from({length:24}, (_, i) => ({ hour: i, onTime: rnd(88,100), accuracy: rnd(95,100), efficiency: rnd(75,95) })));
    setInv(["Electronics","Clothing","Home & Garden","Sports","Books","Automotive"].map(c => ({ category: c, current: Math.floor(rnd(200,1200)), optimal: Math.floor(rnd(400,1200)), turnover: rnd(2,12).toFixed(1) })));
    setShipment([{ name:"Delivered",value:65 },{ name:"In Transit",value:25 },{ name:"Processing",value:8 },{ name:"Delayed",value:2 }]);
    setSparks(mkSparks());
    mkAlerts();
  }, [mkAlerts]);
  const refresh = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      setKpi(p => ({
        onTimeDelivery:       clamp(p.onTimeDelivery       + rnd(-1,1),   85, 99),
        inventoryTurnover:    clamp(p.inventoryTurnover    + rnd(-0.3,.3), 5, 12),
        orderAccuracy:        clamp(p.orderAccuracy        + rnd(-.5,.5),  95, 99.9),
        costPerShipment:      clamp(p.costPerShipment      + rnd(-2,2),    35, 55),
        warehouseUtilization: clamp(p.warehouseUtilization + rnd(-1.5,1.5),70, 95),
        customerSatisfaction: clamp(p.customerSatisfaction + rnd(-.1,.1),  4.0, 5.0),
      }));
      setPerf(p => { const n=[...p.slice(1)]; n.push({ hour:(p[p.length-1].hour+1)%24, onTime:rnd(88,100), accuracy:rnd(95,100), efficiency:rnd(75,95) }); return n; });
      setSparks(mkSparks());
      setRegions(BASE_REGIONS.map(r => ({ ...r, onTime: clamp(r.onTime+rnd(-.5,.5), 80, 99) })));
      if (Math.random() < 0.35) mkAlerts();
      setIsProcessing(false);
    }, 800);
  }, [mkAlerts]);
  useEffect(() => {
    init();
    const tick = setInterval(() => setTime(new Date()), 1000);
    const upd  = setInterval(refresh, 3000);
    return () => { clearInterval(tick); clearInterval(upd); };
  }, [init, refresh]);
  const dismissAlert = id => setAlerts(p => p.filter(a => a.id !== id));
  const views = {
    overview:    <OverviewView    kpiData={kpi} sparkSets={sparks} performanceData={perf} shipmentData={shipment} regionData={regions} />,
    performance: <PerformanceView performanceData={perf} />,
    inventory:   <InventoryView   inventoryData={inv} />,
    shipments:   <ShipmentsView   shipmentData={shipment} regionData={regions} />,
    ai:          <AIView />,
    alerts:      <AlertsView      alerts={alerts} onDismiss={dismissAlert} />,
  };
  const titles = { overview:"Overview Dashboard", performance:"Performance Analytics", inventory:"Inventory Management", shipments:"Shipment Tracking", ai:"AI-Powered Insights", alerts:"Alerts & Notifications" };
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#070b14" }}>
      <Sidebar active={activeTab} setActive={setActiveTab} alertCount={alerts.length} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar time={time} isProcessing={isProcessing} onRefresh={refresh} />
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13 }}>
            <span style={{ color: "#334155" }}>Dashboard</span>
            <ChevronRight size={14} style={{ color: "#1e293b" }} />
            <span style={{ color: "#94a3b8" }}>{titles[activeTab]}</span>
          </div>
          {views[activeTab]}
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: 11, color: "#1e293b" }}>
            Supply Chain Intelligence Hub · React + Recharts + Tailwind CSS · Real-time AI/ML analytics
          </div>
        </div>
      </div>
    </div>
  );
}
