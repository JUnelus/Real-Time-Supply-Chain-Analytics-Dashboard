/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Zap,
} from "lucide-react";

export const SHIPMENT_COLORS = ["#00ffaa", "#00e5ff", "#fbbf24", "#f87171"];

const ALERT_CFG = {
  error: { border: "#f87171", bg: "rgba(248,113,113,0.08)", label: "Critical" },
  warning: { border: "#fbbf24", bg: "rgba(251,191,36,0.08)", label: "Warning" },
  info: { border: "#00e5ff", bg: "rgba(0,229,255,0.08)", label: "Info" },
  success: { border: "#00ffaa", bg: "rgba(0,255,170,0.08)", label: "Success" },
};

export function CustomTooltip({ active, payload, label }) {
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

export function KPICard({ title, value, unit, change, icon, accentColor, sparkData }) {
  const positive = change >= 0;
  const fmt = typeof value === "number" ? value.toFixed(unit === "/5" || unit === "x" ? 1 : 1) : value;

  return (
    <div className="glass glass-hover rounded-2xl" style={{ padding: 20, position: "relative", overflow: "hidden", cursor: "default" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: accentColor, opacity: 0.07, filter: "blur(20px)", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accentColor + "25", border: "1px solid " + accentColor + "45", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon ? React.createElement(icon, { size: 16, style: { color: accentColor } }) : null}
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
                <linearGradient id={"sg" + title.replace(/\s/g, "")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={accentColor} strokeWidth={1.5} fill={"url(#sg" + title.replace(/\s/g, "") + ")"} dot={false} />
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

export function SectionHeader({ icon, title, badge, badgeColor }) {
  const bc = badgeColor || "#00e5ff";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      {icon ? React.createElement(icon, { size: 18, style: { color: bc } }) : null}
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>{title}</h3>
      {badge && (
        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: bc + "20", color: bc, border: "1px solid " + bc + "30", fontWeight: 600, letterSpacing: 0.5 }}>{badge}</span>
      )}
    </div>
  );
}

export function RegionRow({ r }) {
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

export function AlertItem({ alert, onDismiss }) {
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
        <button onClick={() => onDismiss(alert.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: 2, fontSize: 18, lineHeight: 1 }}>x</button>
      </div>
    </div>
  );
}

export function AIInsightCard({ insight }) {
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


