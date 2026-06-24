"use client";

import React, { useState, useMemo } from 'react';
import { getVendorSalesReport } from "../../services/adminCommunication";
import { useQuery } from "@tanstack/react-query";
import { 
  IoBarChartOutline, 
  IoDownloadOutline, 
  IoCalendarOutline,
  IoCartOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoRestaurantOutline,
  IoPricetagOutline,
  IoRefreshOutline,
  IoCubeOutline,
  IoTime,
  IoCheckmarkDone,
} from "react-icons/io5";
import toast from "react-hot-toast";

function VendorSalesReportPage() {
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("quantitySold");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vendorSalesReport', dateRange, startDate, endDate],
    queryFn: () => {
      let params = {};
      if (dateRange === "today") {
        params = { period: "today" };
      } else if (dateRange === "week") {
        params = { period: "week" };
      } else if (dateRange === "month") {
        params = { period: "month" };
      } else if (dateRange === "year") {
        params = { period: "year" };
      } else if (dateRange === "custom" && startDate && endDate) {
        params = { fromDate: startDate, toDate: endDate };
      }
      return getVendorSalesReport(params);
    },
    enabled: true,
  });

  // Extract data from backend response
  const reportData = data?.data || {};
  const summary = reportData?.summary || {};
  const dailySales = reportData?.dailySales || [];
  const topProducts = reportData?.topProducts || [];
  const period = reportData?.period || {};

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort products
  const sortedProducts = useMemo(() => {
    if (!Array.isArray(topProducts) || topProducts.length === 0) return [];
    
    return [...topProducts].sort((a, b) => {
      let aVal = a[sortBy] || 0;
      let bVal = b[sortBy] || 0;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [topProducts, sortBy, sortOrder]);

  // Handle export to CSV
  const handleExport = () => {
    if (!Array.isArray(topProducts) || topProducts.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const headers = ["Product Name", "Quantity Sold", "Revenue (₹)"];
    const rows = topProducts.map(item => [
      item.productName || "N/A",
      item.quantitySold || 0,
      item.revenue || 0
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  const colorMap = {
    blue: "#3b82f6",
    green: "#22c55e",
    purple: "#a855f7",
    yellow: "#eab308",
    indigo: "#6366f1",
    cyan: "#06b6d4",
    emerald: "#10b981",
    orange: "#f97316",
    red: "#ef4444",
  };

  const DashboardStatCard = ({ title, value, icon: Icon, color = "blue", prefix = "" }) => {
    const themeColor = colorMap[color] || colorMap.blue;
    const displayValue = `${prefix}${Number(value || 0).toLocaleString()}`;

    return (
      <div
        className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>
            {title}
          </div>
          <div className="text-[34px] font-black tracking-tighter leading-none" style={{ color: "var(--foreground)" }}>
            {displayValue}
          </div>
        </div>
        <div
          className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
          style={{ background: `${themeColor}15`, border: `1px solid ${themeColor}30` }}
        >
          <Icon className="text-xl transition-transform group-hover:scale-110" style={{ color: themeColor }} />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl py-20" style={{ background: "var(--background)" }}>
        <IoRefreshOutline className="mb-4 animate-spin text-4xl text-blue-500" />
        <p style={{ color: "var(--foreground)", opacity: 0.65 }}>Loading sales report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl py-20" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <IoBarChartOutline className="text-5xl text-red-400" />
        </div>
        <p className="mb-3 text-red-400">{error.message || "Failed to load sales report"}</p>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 pb-8" style={{ background: "var(--background)" }}>
      <main className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Sales Report
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Track your sales performance
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExport} 
              className="px-4 py-2 hover:bg-gray-750 rounded-lg text-sm flex items-center gap-2 transition-colors border shadow-sm"
              style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <IoDownloadOutline /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatCard
            title="Total Revenue"
            value={summary.totalRevenue || 0}
            icon={IoCashOutline}
            color="green"
            prefix="₹"
          />
          <DashboardStatCard
            title="Total Orders"
            value={summary.totalOrders || 0}
            icon={IoCartOutline}
            color="blue"
          />
          <DashboardStatCard
            title="Items Sold"
            value={summary.totalItems || 0}
            icon={IoCubeOutline}
            color="purple"
          />
          <DashboardStatCard
            title="Avg Order Value"
            value={summary.averageOrderValue?.toFixed(0) || 0}
            icon={IoTrendingUpOutline}
            color="indigo"
            prefix="₹"
          />
        </div>

        {/* Period Info */}
        {(period.from || period.to) && (
          <div className="rounded-xl p-3 mb-6 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              📅 Report Period: {formatDate(period.from)} - {formatDate(period.to)}
            </p>
          </div>
        )}

        {/* Date Filter */}
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex flex-wrap gap-3 items-center">
            <IoCalendarOutline className="text-xl" style={{ color: "var(--foreground)", opacity: 0.6 }} />
            <div className="flex flex-wrap gap-2">
              {['all', 'today', 'week', 'month', 'year', 'custom'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${
                    dateRange === range 
                      ? 'bg-blue-500 text-white' 
                      : ''
                  }`}
                  style={{ 
                    background: dateRange === range ? '' : 'var(--background)',
                    border: '1px solid var(--card-border)',
                    color: dateRange === range ? '' : 'var(--foreground)'
                  }}
                >
                  {range === 'all' ? 'All Time' : range}
                </button>
              ))}
            </div>
            {dateRange === "custom" && (
              <div className="flex gap-2 items-center">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="px-3 py-1.5 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                />
                <span style={{ color: "var(--foreground)", opacity: 0.5 }}>to</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="px-3 py-1.5 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Daily Sales Chart (Summary) */}
        {dailySales.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <IoCalendarOutline className="text-blue-500" /> Daily Sales Trend
            </h3>
            <div className="space-y-3">
              {dailySales.slice(0, 7).map((day, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="w-24">
                    <span className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>{day.date}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--background)" }}>
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{ width: `${Math.min((day.revenue / (summary.totalRevenue || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>₹{day.revenue}</span>
                    <span className="text-xs ml-2" style={{ color: "var(--foreground)", opacity: 0.5 }}>({day.orders} orders)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Products Table */}
        {topProducts.length === 0 ? (
          <div className="rounded-xl py-20 text-center" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
              <IoBarChartOutline className="text-5xl text-blue-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold" style={{ color: "var(--foreground)" }}>No Sales Data</h3>
            <p className="mx-auto max-w-md text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              No sales data available for this period. Try selecting a different date range.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--card-border)" }}>
              <table className="w-full min-w-[600px]">
                <thead style={{ background: "var(--card)", borderBottom: "1px solid var(--card-border)" }}>
                  <tr className="text-left text-xs">
                    <th className="px-4 py-3 rounded-l-lg" style={{ color: "var(--foreground)", opacity: 0.6 }}>#</th>
                    <th className="px-4 py-3 cursor-pointer" style={{ color: "var(--foreground)", opacity: 0.6 }} onClick={() => handleSort("productName")}>
                      Product Name {sortBy === "productName" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-right cursor-pointer" style={{ color: "var(--foreground)", opacity: 0.6 }} onClick={() => handleSort("quantitySold")}>
                      Quantity Sold {sortBy === "quantitySold" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-right cursor-pointer" style={{ color: "var(--foreground)", opacity: 0.6 }} onClick={() => handleSort("revenue")}>
                      Revenue {sortBy === "revenue" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody style={{ borderBottom: "1px solid var(--card-border)" }}>
                  {sortedProducts.map((item, idx) => (
                    <tr key={idx} className="hover:opacity-80 transition" style={{ borderBottom: "1px solid var(--card-border)" }}>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {item.productName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: "var(--foreground)" }}>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium">
                          {item.quantitySold || 0} units
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--foreground)" }}>
                        ₹{(item.revenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ background: "var(--card)", borderTop: "1px solid var(--card-border)" }}>
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-right font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Total:</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: "var(--foreground)" }}>
                      {summary.totalItems || 0} units
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg" style={{ color: "var(--foreground)" }}>
                      ₹{(summary.totalRevenue || 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Top 3 Products Highlight */}
            {sortedProducts.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {sortedProducts.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="text-blue-500 text-sm font-medium">
                        #{idx + 1} Best Seller
                      </span>
                    </div>
                    <p className="font-semibold text-lg mb-2" style={{ color: "var(--foreground)" }}>{item.productName}</p>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--foreground)", opacity: 0.6 }}>Quantity Sold:</span>
                      <span className="font-medium" style={{ color: "var(--foreground)" }}>{item.quantitySold} units</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span style={{ color: "var(--foreground)", opacity: 0.6 }}>Revenue:</span>
                      <span className="font-semibold text-green-400">₹{item.revenue?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default VendorSalesReportPage;