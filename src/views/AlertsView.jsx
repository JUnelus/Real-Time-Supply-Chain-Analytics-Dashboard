import React from "react";
import { Bell, CheckCircle } from "lucide-react";
import { SectionHeader, AlertItem } from "./viewShared";

export default function AlertsView({ alerts, onDismiss }) {
  const counts = [
    { label: "Critical", count: alerts.filter((a) => a.type === "error").length, color: "#f87171" },
    { label: "Warning", count: alerts.filter((a) => a.type === "warning").length, color: "#fbbf24" },
    { label: "Info", count: alerts.filter((a) => a.type === "info").length, color: "#00e5ff" },
    { label: "Success", count: alerts.filter((a) => a.type === "success").length, color: "#00ffaa" },
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
        {alerts.length > 0 ? alerts.map((a) => <AlertItem key={a.id} alert={a} onDismiss={onDismiss} />) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#334155" }}>
            <CheckCircle size={40} style={{ margin: "0 auto 12px", display: "block", color: "#00ffaa", opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: 14 }}>All systems operational - no active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}

