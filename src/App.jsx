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
  mkDemand,
  advanceDemand,
  mkInventory,
  stepInventory,
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

// Layout (widths, collapse to an icon rail, phone top bar) lives in index.css
// under ".sidebar" / ".nav-btn" so it can respond to viewport breakpoints.
function Sidebar({ active, setActive, alertCount }) {
  return (
    <div className="sidebar sidebar-bg">
      <div className="sidebar-brand">
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00e5ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <GitBranch size={18} color="white" />
        </div>
        <div className="sidebar-brand-text">
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>Supply Chain</div>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>INTELLIGENCE HUB</div>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Main menu">
        <p className="nav-menu-heading">MAIN MENU</p>
        {NAV.map((item) => {
          const on = active === item.id;
          const showBadge = item.id === "alerts" && alertCount > 0;
          // Labels are hidden on tablet widths, so give the button an explicit name.
          const name = showBadge ? `${item.label} (${alertCount} active)` : item.label;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} aria-current={on ? "page" : undefined} aria-label={name} title={item.label} className={"nav-btn" + (on ? " is-active" : "")}>
              <item.icon size={16} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {showBadge && <span data-testid="alert-count" className="alert-badge">{alertCount}</span>}
              {on && <ChevronRight size={12} className="nav-chevron" />}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ffaa", flexShrink: 0 }} className="animate-pulse-glow" title="All Systems Operational" />
        <span className="sidebar-footer-text" style={{ fontSize: 11, color: "#475569" }}>All Systems Operational</span>
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
    <div className="topbar">
      <div style={{ minWidth: 0 }}>
        <h1 className="gradient-text-cyan topbar-title">Supply Chain Intelligence Hub</h1>
        <p className="topbar-subtitle">Real-time analytics powered by AI/ML · Live updates every 3s</p>
      </div>
      <div className="topbar-right">
        {isProcessing && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={12} style={{ color: "#00e5ff" }} className="animate-spin-slow" />
            <span style={{ fontSize: 11, color: "#00e5ff" }}>Refreshing...</span>
          </div>
        )}
        <button onClick={onRefresh} style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 8, padding: "6px 12px", color: "#00e5ff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
          <RefreshCw size={12} /> Refresh
        </button>
        <div style={{ textAlign: "right" }}>
          <div data-testid="clock" className="clock">{time.toLocaleTimeString()}</div>
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
  const [demand, setDemand] = useState(mkDemand);
  const [inv, setInv] = useState(mkInventory);
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
      setDemand(advanceDemand);
      setInv(stepInventory);
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
    performance: <PerformanceView performanceData={perf} demandData={demand} />,
    inventory: <InventoryView inventoryData={inv} />,
    shipments: <ShipmentsView shipmentData={SHIPMENT_STATUS} regionData={regions} />,
    ai: <AIView performanceData={perf} inventoryData={inv} demandData={demand} />,
    alerts: <AlertsView alerts={alerts} onDismiss={dismissAlert} />,
  };

  return (
    <div className="app-shell">
      <Sidebar active={activeTab} setActive={setActiveTab} alertCount={alerts.length} />
      <div className="main-col">
        <TopBar isProcessing={isProcessing} onRefresh={refresh} />
        <div className="content">
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
