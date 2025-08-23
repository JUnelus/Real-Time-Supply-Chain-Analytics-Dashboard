import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, Truck, AlertTriangle, CheckCircle, Clock, DollarSign, Activity, Users, Database, Cpu } from 'lucide-react';

const SupplyChainDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const [kpiData, setKpiData] = useState({
    onTimeDelivery: 94.2,
    inventoryTurnover: 8.7,
    orderAccuracy: 98.5,
    costPerShipment: 45.30,
    warehouseUtilization: 82.3,
    customerSatisfaction: 4.6
  });
  
  const [performanceData, setPerformanceData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [shipmentData, setShipmentData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      updateDashboardData();
    }, 3000);
    
    // Initialize data
    initializeData();
    
    return () => clearInterval(interval);
  }, []);

  const initializeData = () => {
    // Initialize performance trends
    const basePerformance = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      onTime: 88 + Math.random() * 12,
      accuracy: 95 + Math.random() * 5,
      efficiency: 75 + Math.random() * 20
    }));
    setPerformanceData(basePerformance);

    // Initialize inventory data
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Automotive'];
    const inventory = categories.map(category => ({
      category,
      current: Math.floor(Math.random() * 1000) + 200,
      optimal: Math.floor(Math.random() * 800) + 400,
      turnover: (Math.random() * 10 + 2).toFixed(1)
    }));
    setInventoryData(inventory);

    // Initialize shipment status
    const statuses = [
      { name: 'Delivered', value: 65, color: '#00ff88' },
      { name: 'In Transit', value: 25, color: '#00d4ff' },
      { name: 'Processing', value: 8, color: '#ffd93d' },
      { name: 'Delayed', value: 2, color: '#ff6b6b' }
    ];
    setShipmentData(statuses);

    // Generate initial alerts
    generateAlerts();
    generateAIInsights();
  };

  const updateDashboardData = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      // Update KPIs with small random variations
      setKpiData(prev => ({
        onTimeDelivery: Math.max(85, Math.min(99, prev.onTimeDelivery + (Math.random() - 0.5) * 2)),
        inventoryTurnover: Math.max(5, Math.min(12, prev.inventoryTurnover + (Math.random() - 0.5) * 0.5)),
        orderAccuracy: Math.max(95, Math.min(99.9, prev.orderAccuracy + (Math.random() - 0.5) * 1)),
        costPerShipment: Math.max(35, Math.min(55, prev.costPerShipment + (Math.random() - 0.5) * 3)),
        warehouseUtilization: Math.max(70, Math.min(95, prev.warehouseUtilization + (Math.random() - 0.5) * 3)),
        customerSatisfaction: Math.max(4.0, Math.min(5.0, prev.customerSatisfaction + (Math.random() - 0.5) * 0.2))
      }));

      // Update performance data (shift data and add new point)
      setPerformanceData(prev => {
        const newData = [...prev.slice(1)];
        const lastHour = prev[prev.length - 1].hour;
        newData.push({
          hour: (lastHour + 1) % 24,
          onTime: 88 + Math.random() * 12,
          accuracy: 95 + Math.random() * 5,
          efficiency: 75 + Math.random() * 20
        });
        return newData;
      });

      // Occasionally generate new alerts and insights
      if (Math.random() < 0.3) {
        generateAlerts();
      }
      if (Math.random() < 0.2) {
        generateAIInsights();
      }

      setIsProcessing(false);
    }, 1000);
  };

  const generateAlerts = () => {
    const alertTypes = [
      { type: 'warning', icon: AlertTriangle, message: 'Inventory levels low for Electronics category', priority: 'Medium' },
      { type: 'error', icon: AlertTriangle, message: 'Shipment delay detected - Route optimization recommended', priority: 'High' },
      { type: 'info', icon: CheckCircle, message: 'AI model suggests 15% improvement in delivery routes', priority: 'Low' },
      { type: 'success', icon: TrendingUp, message: 'Customer satisfaction increased by 0.3 points this week', priority: 'Low' },
      { type: 'warning', icon: Clock, message: 'Peak demand period approaching - scale resources', priority: 'High' }
    ];
    
    const newAlerts = alertTypes.slice(0, Math.floor(Math.random() * 4) + 1).map(alert => ({
      ...alert,
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString()
    }));
    
    setAlerts(newAlerts);
  };

  const generateAIInsights = () => {
    const insights = [
      {
        title: "Demand Forecasting",
        description: "ML model predicts 23% increase in Electronics demand next week",
        confidence: 87,
        action: "Recommend increasing inventory by 150 units"
      },
      {
        title: "Route Optimization",
        description: "AI identified 3 inefficient delivery routes",
        confidence: 92,
        action: "Potential savings: $1,200/week with route optimization"
      },
      {
        title: "Anomaly Detection",
        description: "Unusual pattern in West Coast shipment delays detected",
        confidence: 78,
        action: "Investigate carrier performance metrics"
      },
      {
        title: "Customer Behavior Analysis",
        description: "NLP analysis reveals 15% increase in express delivery requests",
        confidence: 85,
        action: "Consider premium shipping tier pricing strategy"
      }
    ];
    
    const selectedInsights = insights.slice(0, Math.floor(Math.random() * 3) + 1);
    setAiInsights(selectedInsights);
  };

  const KPICard = ({ title, value, change, icon: Icon, format = '' }) => {
    const isPositive = change >= 0;
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              {typeof value === 'number' ? value.toFixed(format === '%' ? 1 : 2) : value}{format}
            </div>
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AlertItem = ({ alert }) => {
    const colorMap = {
      error: 'border-red-500 bg-red-500/10',
      warning: 'border-yellow-500 bg-yellow-500/10',
      info: 'border-blue-500 bg-blue-500/10',
      success: 'border-green-500 bg-green-500/10'
    };

    const iconColorMap = {
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
      success: 'text-green-400'
    };

    return (
      <div className={`p-4 rounded-lg border ${colorMap[alert.type]} mb-3`}>
        <div className="flex items-start space-x-3">
          <alert.icon className={`w-5 h-5 mt-0.5 ${iconColorMap[alert.type]}`} />
          <div className="flex-1">
            <p className="text-white text-sm">{alert.message}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span>{alert.timestamp}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                alert.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                alert.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {alert.priority}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AIInsightCard = ({ insight }) => (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-xl border border-purple-500/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-semibold">{insight.title}</h4>
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-purple-300">{insight.confidence}%</span>
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
      <div className="text-xs text-blue-300 bg-blue-500/10 p-2 rounded">
        💡 {insight.action}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Supply Chain Intelligence Hub
            </h1>
            <p className="text-gray-400 mt-2">Real-time analytics powered by AI/ML • Data refreshed every 3 seconds</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-mono text-blue-400">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleDateString()}
            </div>
            {isProcessing && (
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <KPICard
            title="On-Time Delivery"
            value={kpiData.onTimeDelivery}
            change={Math.random() * 4 - 2}
            icon={Truck}
            format="%"
          />
          <KPICard
            title="Inventory Turnover"
            value={kpiData.inventoryTurnover}
            change={Math.random() * 2 - 1}
            icon={Package}
            format="x"
          />
          <KPICard
            title="Order Accuracy"
            value={kpiData.orderAccuracy}
            change={Math.random() * 1}
            icon={CheckCircle}
            format="%"
          />
          <KPICard
            title="Cost per Shipment"
            value={kpiData.costPerShipment}
            change={-(Math.random() * 3)}
            icon={DollarSign}
            format="$"
          />
          <KPICard
            title="Warehouse Utilization"
            value={kpiData.warehouseUtilization}
            change={Math.random() * 2 - 1}
            icon={Database}
            format="%"
          />
          <KPICard
            title="Customer Rating"
            value={kpiData.customerSatisfaction}
            change={Math.random() * 0.5}
            icon={Users}
            format="/5"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Trends */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-semibold">Real-Time Performance Trends</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="onTime" stroke="#00ff88" strokeWidth={2} name="On-Time %" />
                  <Line type="monotone" dataKey="accuracy" stroke="#00d4ff" strokeWidth={2} name="Accuracy %" />
                  <Line type="monotone" dataKey="efficiency" stroke="#ffd93d" strokeWidth={2} name="Efficiency %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shipment Status */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Current Shipment Status</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shipmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {shipmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Insights */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">ML DRIVEN</span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {aiInsights.length > 0 ? (
                aiInsights.map((insight, index) => (
                  <AIInsightCard key={index} insight={insight} />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>AI models are analyzing data patterns...</p>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Alerts */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-semibold">Real-Time Alerts</h3>
              <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">{alerts.length} ACTIVE</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>All systems operational</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Analysis */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-semibold">Inventory Analysis by Category</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="current" fill="#00ff88" name="Current Stock" />
                <Bar dataKey="optimal" fill="#00d4ff" name="Optimal Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🚀 Built with React, Recharts, and real-time data processing • Demonstrating Client Success AI/Data Engineering skills</p>
          <p className="mt-1">✨ Features: Real-time dashboards, ML insights, anomaly detection, and client-ready visualizations</p>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainDashboard;