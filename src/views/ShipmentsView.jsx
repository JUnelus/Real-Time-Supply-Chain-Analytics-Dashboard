import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Truck, Globe, Map } from "lucide-react";
import { SectionHeader, RegionRow, CustomTooltip, SHIPMENT_COLORS } from "./viewShared";

const CARRIERS = [
  { name: "FastFreight Co.", total: 2450, onTime: 97.2, delay: 0.8, rating: 4.8, status: "Excellent" },
  { name: "Global Express", total: 1890, onTime: 94.5, delay: 2.1, rating: 4.5, status: "Good" },
  { name: "PrimeLogistics", total: 1340, onTime: 91.8, delay: 3.4, rating: 4.2, status: "Good" },
  { name: "SwiftShip LLC", total: 980, onTime: 88.3, delay: 5.2, rating: 3.9, status: "Fair" },
  { name: "OceanRoute Ltd.", total: 620, onTime: 85.1, delay: 6.8, rating: 3.6, status: "Poor" },
];

const STATUS_COLOR = { Excellent: "#00ffaa", Good: "#00e5ff", Fair: "#fbbf24", Poor: "#f87171" };

export default function ShipmentsView({ shipmentData, regionData }) {
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
                {["Carrier", "Total Shipments", "On-Time %", "Avg Delay", "Rating", "Status"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#475569", fontWeight: 500, fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CARRIERS.map((c, i) => {
                const sc = STATUS_COLOR[c.status] || "#64748b";
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                    <td style={{ padding: "12px", color: "#fbbf24" }}>{"*".repeat(Math.round(c.rating))}<span style={{ color: "#334155" }}>{"*".repeat(5 - Math.round(c.rating))}</span></td>
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

