import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Truck, Activity, Globe, Package, CheckCircle, DollarSign, Database, Users } from "lucide-react";
import { KPICard, SectionHeader, RegionRow, CustomTooltip, SHIPMENT_COLORS } from "./viewShared";

const rnd = (min, max) => Math.random() * (max - min) + min;

export default function OverviewView({ kpiData, sparkSets, performanceData, shipmentData, regionData }) {
  const kpis = [
    { title: "On-Time Delivery", value: kpiData.onTimeDelivery, unit: "%", change: rnd(-2, 4), icon: Truck, color: "#00e5ff", key: "otd" },
    { title: "Inventory Turnover", value: kpiData.inventoryTurnover, unit: "x", change: rnd(-1, 2), icon: Package, color: "#00ffaa", key: "inv" },
    { title: "Order Accuracy", value: kpiData.orderAccuracy, unit: "%", change: rnd(0, 1), icon: CheckCircle, color: "#a855f7", key: "oa" },
    { title: "Cost per Shipment", value: kpiData.costPerShipment, unit: "$", change: rnd(-3, 0), icon: DollarSign, color: "#fbbf24", key: "cps" },
    { title: "Warehouse Utilization", value: kpiData.warehouseUtilization, unit: "%", change: rnd(-1, 2), icon: Database, color: "#f87171", key: "wu" },
    { title: "Customer Rating", value: kpiData.customerSatisfaction, unit: "/5", change: rnd(0, 0.5), icon: Users, color: "#c084fc", key: "cr" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16 }}>
        {kpis.map((k) => <KPICard key={k.key} title={k.title} value={k.value} unit={k.unit} change={k.change} icon={k.icon} accentColor={k.color} sparkData={sparkSets[k.key]} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <SectionHeader icon={Activity} title="Real-Time Performance Trends" badge="LIVE" badgeColor="#00ffaa" />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  {[ ["ot", "#00ffaa"], ["ac", "#00e5ff"], ["ef", "#a855f7"] ].map(([id, c]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
                <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} domain={[70, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }} />
                <Area type="monotone" dataKey="onTime" stroke="#00ffaa" fill="url(#ot)" strokeWidth={2} name="On-Time %" dot={false} />
                <Area type="monotone" dataKey="accuracy" stroke="#00e5ff" fill="url(#ac)" strokeWidth={2} name="Accuracy %" dot={false} />
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

