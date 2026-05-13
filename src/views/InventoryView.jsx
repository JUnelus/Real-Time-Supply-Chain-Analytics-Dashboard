import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Package } from "lucide-react";
import { SectionHeader, CustomTooltip } from "./viewShared";

export default function InventoryView({ inventoryData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={Package} title="Inventory by Category" badge="REAL-TIME" badgeColor="#00ffaa" />
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ffaa" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#00ffaa" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="bo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="category" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
              <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }} />
              <Bar dataKey="current" fill="url(#bc)" name="Current Stock" radius={[4, 4, 0, 0]} />
              <Bar dataKey="optimal" fill="url(#bo)" name="Optimal Level" radius={[4, 4, 0, 0]} />
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
                <div className="progress-fill" style={{ width: Math.min(100, ratio * 100) + "%", background: "linear-gradient(90deg, " + sc + "60, " + sc + ")" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

