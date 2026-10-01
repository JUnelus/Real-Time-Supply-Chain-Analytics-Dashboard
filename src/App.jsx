import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import {
  Home,
  Activity,
  Package,
  Truck,
  Cpu,
  Bell,
  RefreshCw,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import {
  INITIAL_KPI,
  stepKpi,
  mkKpiChanges,
  mkSparks,
  mkPerformance,
  advancePerformance,
  mkInventory,
  SHIPMENT_STATUS,
  BASE_REGIONS,
  stepRegions,
  mkAlerts,
} from "./data/simulation";

const OverviewView = lazy(() => import("./views/OverviewView"));
const PerformanceView = lazy(() => import("./views/PerformanceView"));
const InventoryView = lazy(() => import("./views/InventoryView"));
const ShipmentsView = lazy(() => import("./views/ShipmentsView"));
const AIView = lazy(() => import("./views/AIView"));
const AlertsView = lazy(() => import("./views/AlertsView"));

// How often simulated data refreshes, and how long the "Refreshing..." state
// is shown before the new values land.
export const REFRESH_INTERVAL_MS = 3000;
export const REFRESH_LATENCY_MS = 800;

const NAV = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "performance", label: "Performance", icon: Activity },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "shipments", label: "Shipments", icon: Truck },
  { id: "ai", label: "AI Insights", icon: Cpu },
  { id: "alerts", label: "Alerts", icon: Bell },
];

const TITLES = {
  overview: "Overview Dashboard",
  performance: "Performance Analytics",
  inventory: "Inventory Management",
  shipments: "Shipment Tracking",
  ai: "AI-Powered Insights",
  alerts: "Alerts & Notifications",
};

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
        {NAV.map((item) => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} aria-current={on ? "page" : undefined} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: on ? "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(168,85,247,0.1))" : "transparent", color: on ? "#f1f5f9" : "#64748b", fontSize: 13, fontWeight: on ? 600 : 400, marginBottom: 2, borderLeft: on ? "2px solid #00e5ff" : "2px solid transparent", transition: "all 0.2s" }}>
              <item.icon size={16} style={{ color: on ? "#00e5ff" : "#475569" }} />
              {item.label}
              {item.id === "alerts" && alertCount > 0 && (
                <span data-testid="alert-count" style={{ marginLeft: "auto", fontSize: 10, background: "#ef4444", color: "white", borderRadius: 20, padding: "1px 6px", fontWeight: 700 }}>{alertCount}</span>
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

function TopBar({ isProcessing, onRefresh }) {
  // The clock is local to the top bar so its 1s tick re-renders only this
  // component rather than the whole dashboard and every chart in it.
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

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
            <span style={{ fontSize: 11, color: "#00e5ff" }}>Refreshing...</span>
          </div>
        )}
        <button onClick={onRefresh} style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 8, padding: "6px 12px", color: "#00e5ff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={12} /> Refresh
        </button>
        <div style={{ textAlign: "right" }}>
          <div data-testid="clock" style={{ fontFamily: "monospace", fontSize: 16, color: "#00e5ff", fontWeight: 600 }}>{time.toLocaleTimeString()}</div>
          <div style={{ fontSize: 11, color: "#334155" }}>{time.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
        </div>
      </div>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="glass rounded-2xl" style={{ minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 13 }}>
      Loading dashboard view...
    </div>
  );
}

export default function SupplyChainDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isProcessing, setIsProcessing] = useState(false);

  // All simulated data is seeded lazily on first render so there is no empty
  // first paint, then advanced on a fixed interval by `refresh`.
  const [alerts, setAlerts] = useState(() => mkAlerts());
  const [perf, setPerf] = useState(mkPerformance);
  const [inv] = useState(mkInventory);
  const [regions, setRegions] = useState(BASE_REGIONS);
  const [sparks, setSparks] = useState(mkSparks);
  const [kpi, setKpi] = useState(INITIAL_KPI);
  // Generated once per refresh (not during render) so the trend arrows on the
  // KPI cards stay stable between data updates.
  const [kpiChanges, setKpiChanges] = useState(mkKpiChanges);

  const pendingRefresh = useRef(null);

  const refresh = useCallback(() => {
    setIsProcessing(true);
    clearTimeout(pendingRefresh.current);
    pendingRefresh.current = setTimeout(() => {
      setKpi(stepKpi);
      setPerf(advancePerformance);
      setSparks(mkSparks());
      setKpiChanges(mkKpiChanges());
      setRegions(stepRegions());
      if (Math.random() < 0.35) setAlerts(mkAlerts());
      setIsProcessing(false);
    }, REFRESH_LATENCY_MS);
  }, []);

  useEffect(() => {
    const upd = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(upd);
      clearTimeout(pendingRefresh.current);
    };
  }, [refresh]);

  const dismissAlert = (id) => setAlerts((p) => p.filter((a) => a.id !== id));

  const viewByTab = {
    overview: <OverviewView kpiData={kpi} kpiChanges={kpiChanges} sparkSets={sparks} performanceData={perf} shipmentData={SHIPMENT_STATUS} regionData={regions} />,
    performance: <PerformanceView performanceData={perf} />,
    inventory: <InventoryView inventoryData={inv} />,
    shipments: <ShipmentsView shipmentData={SHIPMENT_STATUS} regionData={regions} />,
    ai: <AIView performanceData={perf} />,
    alerts: <AlertsView alerts={alerts} onDismiss={dismissAlert} />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#070b14" }}>
      <Sidebar active={activeTab} setActive={setActiveTab} alertCount={alerts.length} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar isProcessing={isProcessing} onRefresh={refresh} />
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13 }}>
            <span style={{ color: "#334155" }}>Dashboard</span>
            <ChevronRight size={14} style={{ color: "#1e293b" }} />
            <span data-testid="view-title" style={{ color: "#94a3b8" }}>{TITLES[activeTab]}</span>
          </div>

          <Suspense fallback={<LoadingPanel />}>
            {viewByTab[activeTab]}
          </Suspense>

          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: 11, color: "#1e293b" }}>
            Supply Chain Intelligence Hub · React + Recharts + Tailwind CSS · Real-time AI/ML analytics
          </div>
        </div>
      </div>
    </div>
  );
}
