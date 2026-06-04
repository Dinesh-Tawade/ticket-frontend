"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  getVendorDashboardStats, 
  getVendorSalesReport 
} from "../../services/adminCommunication";
import toast from "react-hot-toast";
import { 
  IoStorefrontOutline, 
  IoCubeOutline,
  IoCartOutline,
  IoCashOutline,
  IoWarningOutline
} from "react-icons/io5";
import { 
  FaSpinner, FaBoxOpen, FaClipboardList, 
  FaMoneyBillWave, FaChartLine, FaCheckCircle
} from "react-icons/fa";
import { 
  AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from "recharts";

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-[34px] font-black tracking-tighter leading-none">
      {count.toLocaleString()}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    blue: { light: "#3b82f6", dark: "#2563eb" },
    green: { light: "#22c55e", dark: "#16a34a" },
    purple: { light: "#a855f7", dark: "#9333ea" },
    yellow: { light: "#eab308", dark: "#ca8a04" },
    red: { light: "#ef4444", dark: "#dc2626" },
    indigo: { light: "#6366f1", dark: "#4f46e5" },
    orange: { light: "#f97316", dark: "#ea580c" }
  };
  const themeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>{label}</div>
        <div className="flex items-baseline gap-1">
          {label.includes("Revenue") && <span className="text-xl font-bold">₹</span>}
          <AnimatedCounter value={value} />
        </div>
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `${themeColor.light}15`, border: `1px solid ${themeColor.light}30` }}>
        <Icon className="text-xl transition-transform group-hover:scale-110" style={{ color: themeColor.light }} />
      </div>
    </div>
  );
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg p-3 shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <p className="text-xs font-bold mb-1" style={{ color: "var(--foreground)" }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes("Revenue") ? "₹" : ""}{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function VendorDashboardPage() {
  // Fetch Dashboard Stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['vendor-dashboard-stats'],
    queryFn: getVendorDashboardStats,
    retry: 1,
    onError: (error) => {
      toast.error('Failed to load dashboard stats');
    }
  });

  // Fetch Sales Report for Charts (last 30 days)
  const { data: reportData, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['vendor-sales-report', 'month'],
    queryFn: () => getVendorSalesReport({ period: 'month' }),
    retry: 1
  });

  const isLoading = statsLoading || reportLoading;

  const dashboardData = statsData?.data || {};
  const store = dashboardData?.store || {};
  const products = dashboardData?.products || {};
  const orders = dashboardData?.orders || {};
  const revenue = dashboardData?.revenue || {};

  const report = reportData?.data || {};
  const dailySales = report?.dailySales || [];
  const topProducts = report?.topProducts || [];

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <IoStorefrontOutline className="text-blue-500 text-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 pb-8" style={{ background: "var(--background)" }}>
      {/* Header Section */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <IoStorefrontOutline className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  Vendor Dashboard
                </h1>
                <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Welcome back, <span className="font-medium text-blue-500">{store?.name || 'Vendor'}</span>! Here is your store overview.
                </p>
              </div>
            </div>

            <button
              onClick={() => { refetchStats(); refetchReport(); }}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
            >
              <FaSpinner className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning */}
      {products.lowStock > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3 mb-8 hover:bg-yellow-500/20 transition-all cursor-pointer" onClick={() => window.location.href = '/vendor/products'}>
          <IoWarningOutline className="text-yellow-400 text-2xl animate-pulse" />
          <div>
            <p className="text-yellow-400 font-bold">Low Stock Alert</p>
            <p className="text-gray-400 text-sm">{products.lowStock} product(s) are running low on stock. Please restock soon.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard label="Total Revenue" value={revenue.total || 0} icon={FaMoneyBillWave} color="green" />
        <StatsCard label="Today's Revenue" value={revenue.today || 0} icon={FaChartLine} color="blue" />
        <StatsCard label="Total Orders" value={(orders.pending || 0) + (orders.today || 0)} icon={FaClipboardList} color="purple" />
        <StatsCard label="Pending Orders" value={orders.pending || 0} icon={IoCartOutline} color="orange" />
        <StatsCard label="Total Products" value={products.total || 0} icon={FaBoxOpen} color="indigo" />
        <StatsCard label="Store Status" value={store?.status === 'ACTIVE' ? 1 : 0} icon={store?.status === 'ACTIVE' ? FaCheckCircle : IoWarningOutline} color={store?.status === 'ACTIVE' ? "green" : "red"} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Revenue Trend</h2>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Last 30 Days</p>
            </div>
          </div>
          
          {dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.5 }} 
                       tickFormatter={(str) => {
                         const date = new Date(str);
                         return date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' });
                       }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.5 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No sales data available for this period.
            </div>
          )}
        </div>

        {/* Top Products Pie Chart */}
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Top Products</h2>
          </div>
          
          {topProducts.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={topProducts.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="quantitySold"
                  >
                    {topProducts.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span style={{ color: "var(--foreground)", opacity: 0.8 }}>{product.productName}</span>
                    </div>
                    <span className="font-bold" style={{ color: "var(--foreground)" }}>{product.quantitySold}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-center px-4">
              Not enough data to display top products.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}