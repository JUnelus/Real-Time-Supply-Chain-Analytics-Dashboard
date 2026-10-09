import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, BarChart2, TrendingUp } from "lucide-react";
import { SectionHeader, CustomTooltip } from "./viewShared";
import { forecastDemand, formatHour, DEFAULT_FORECAST_HOURS } from "../data/analytics";

export default function PerformanceView({ performanceData, demandData = [] }) {
  // Actual hourly orders followed by the forecast hours; both series share a
  // stack so each hour renders as a single bar in the matching colour.
  const fc = forecastDemand(demandData);
  const volume = [
    ...demandData.map((d) => ({ label: formatHour(d.hour), actual: d.orders })),
    ...(fc ? fc.forecast.map((f) => ({ label: formatHour(f.hour), forecast: f.orders })) : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="glass rounded-2xl" style={{ padding: 24 }}>
        <SectionHeader icon={Activity} title="24-Hour Performance Breakdown" badge="24H" badgeColor="#00ffaa" />
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
              <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} domain={[70, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 16 }} />
              <Line type="monotone" dataKey="onTime" stroke="#00ffaa" strokeWidth={2} name="On-Time %" dot={false} activeDot={{ r: 4, fill: "#00ffaa" }} />
              <Line type="monotone" dataKey="accuracy" stroke="#00e5ff" strokeWidth={2} name="Accuracy %" dot={false} activeDot={{ r: 4, fill: "#00e5ff" }} />
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
              <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} domain={[70, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }} />
              <Bar dataKey="efficiency" fill="#a855f7" name="Efficiency %" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="onTime" fill="#00e5ff" name="On-Time %" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {demandData.length > 0 && (
        <div className="glass rounded-2xl" style={{ padding: 24 }}>
          <SectionHeader icon={TrendingUp} title={`Order Volume & ${DEFAULT_FORECAST_HOURS}-Hour Forecast`} badge="LIVE" badgeColor="#00ffaa" />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} interval={2} />
                <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }} />
                <Bar dataKey="actual" stackId="volume" fill="#00e5ff" name="Orders" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="forecast" stackId="volume" fill="#a855f7" name="Forecast" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

