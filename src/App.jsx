import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
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

const OverviewView = lazy(() => import("./views/OverviewView"));
const PerformanceView = lazy(() => import("./views/PerformanceView"));
const InventoryView = lazy(() => import("./views/InventoryView"));
const ShipmentsView = lazy(() => import("./views/ShipmentsView"));
const AIView = lazy(() => import("./views/AIView"));
const AlertsView = lazy(() => import("./views/AlertsView"));

const rnd = (min, max) => Math.random() * (max - min) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const BASE_REGIONS = [
  { region: "North America", shipments: 1240, onTime: 96.2, color: "#00e5ff" },
  { region: "Europe", shipments: 980, onTime: 94.7, color: "#a855f7" },
  { region: "Asia Pacific", shipments: 1580, onTime: 91.3, color: "#00ffaa" },
  { region: "Latin America", shipments: 420, onTime: 88.5, color: "#fbbf24" },
  { region: "Middle East", shipments: 310, onTime: 90.1, color: "#f87171" },
];

const NAV = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "performance", label: "Performance", icon: Activity },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "shipments", label: "Shipments", icon: Truck },
  { id: "ai", label: "AI Insights", icon: Cpu },
  { id: "alerts", label: "Alerts", icon: Bell },
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
        {NAV.map((item) => {
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
            <span style={{ fontSize: 11, color: "#00e5ff" }}>Refreshing...</span>
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

function LoadingPanel() {
  return (
    <div className="glass rounded-2xl" style={{ minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 13 }}>
      Loading dashboard view...
    </div>
  );
}

export default function SupplyChainDashboard() {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [isProcessing, setIsProcessing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [perf, setPerf] = useState([]);
  const [inv, setInv] = useState([]);
  const [shipment, setShipment] = useState([]);
  const [regions, setRegions] = useState(BASE_REGIONS);
  const [sparks, setSparks] = useState({});
  const [kpi, setKpi] = useState({ onTimeDelivery: 94.2, inventoryTurnover: 8.7, orderAccuracy: 98.5, costPerShipment: 45.3, warehouseUtilization: 82.3, customerSatisfaction: 4.6 });

  const mkSparks = () => {
    const s = (n, lo, hi) => Array.from({ length: n }, () => ({ v: rnd(lo, hi) }));
    return { otd: s(10, 88, 98), inv: s(10, 6, 11), oa: s(10, 96, 99.9), cps: s(10, 35, 55), wu: s(10, 70, 92), cr: s(10, 4.1, 5.0) };
  };

  const mkAlerts = useCallback(() => {
    const pool = [
      { type: "error", message: "Shipment delay on Route I-90 - carrier ETA +4h", priority: "High" },
      { type: "warning", message: "Electronics inventory below reorder point (142 units)", priority: "Medium" },
      { type: "warning", message: "Peak demand approaching - scale warehouse resources", priority: "High" },
      { type: "info", message: "AI model recommends 15% improvement in delivery routes", priority: "Low" },
      { type: "success", message: "Customer satisfaction increased 0.3 pts this week", priority: "Low" },
      { type: "error", message: "West Coast distribution center at 94% capacity", priority: "High" },
    ];

    setAlerts(
      pool
        .slice(0, Math.floor(rnd(2, pool.length + 1)))
        .map((a) => ({ ...a, id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString() }))
    );
  }, []);

  const init = useCallback(() => {
    setPerf(Array.from({ length: 24 }, (_, i) => ({ hour: i, onTime: rnd(88, 100), accuracy: rnd(95, 100), efficiency: rnd(75, 95) })));
    setInv(["Electronics", "Clothing", "Home & Garden", "Sports", "Books", "Automotive"].map((c) => ({ category: c, current: Math.floor(rnd(200, 1200)), optimal: Math.floor(rnd(400, 1200)), turnover: rnd(2, 12).toFixed(1) })));
    setShipment([{ name: "Delivered", value: 65 }, { name: "In Transit", value: 25 }, { name: "Processing", value: 8 }, { name: "Delayed", value: 2 }]);
    setSparks(mkSparks());
    mkAlerts();
  }, [mkAlerts]);

  const refresh = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      setKpi((p) => ({
        onTimeDelivery: clamp(p.onTimeDelivery + rnd(-1, 1), 85, 99),
        inventoryTurnover: clamp(p.inventoryTurnover + rnd(-0.3, 0.3), 5, 12),
        orderAccuracy: clamp(p.orderAccuracy + rnd(-0.5, 0.5), 95, 99.9),
        costPerShipment: clamp(p.costPerShipment + rnd(-2, 2), 35, 55),
        warehouseUtilization: clamp(p.warehouseUtilization + rnd(-1.5, 1.5), 70, 95),
        customerSatisfaction: clamp(p.customerSatisfaction + rnd(-0.1, 0.1), 4.0, 5.0),
      }));

      setPerf((p) => {
        const n = [...p.slice(1)];
        n.push({ hour: (p[p.length - 1].hour + 1) % 24, onTime: rnd(88, 100), accuracy: rnd(95, 100), efficiency: rnd(75, 95) });
        return n;
      });

      setSparks(mkSparks());
      setRegions(BASE_REGIONS.map((r) => ({ ...r, onTime: clamp(r.onTime + rnd(-0.5, 0.5), 80, 99) })));
      if (Math.random() < 0.35) mkAlerts();
      setIsProcessing(false);
    }, 800);
  }, [mkAlerts]);

  useEffect(() => {
    init();
    const tick = setInterval(() => setTime(new Date()), 1000);
    const upd = setInterval(refresh, 3000);
    return () => {
      clearInterval(tick);
      clearInterval(upd);
    };
  }, [init, refresh]);

  const dismissAlert = (id) => setAlerts((p) => p.filter((a) => a.id !== id));

  const titles = {
    overview: "Overview Dashboard",
    performance: "Performance Analytics",
    inventory: "Inventory Management",
    shipments: "Shipment Tracking",
    ai: "AI-Powered Insights",
    alerts: "Alerts & Notifications",
  };

  const viewByTab = {
    overview: <OverviewView kpiData={kpi} sparkSets={sparks} performanceData={perf} shipmentData={shipment} regionData={regions} />,
    performance: <PerformanceView performanceData={perf} />,
    inventory: <InventoryView inventoryData={inv} />,
    shipments: <ShipmentsView shipmentData={shipment} regionData={regions} />,
    ai: <AIView />,
    alerts: <AlertsView alerts={alerts} onDismiss={dismissAlert} />,
  };

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
