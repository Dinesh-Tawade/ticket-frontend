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
  IoPricetagOutline
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-500/10 rounded-full p-4 mb-4">
          <IoBarChartOutline className="text-red-400 text-4xl" />
        </div>
        <p className="text-red-400 mb-3">{error.message || "Failed to load sales report"}</p>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
              <IoBarChartOutline className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sales Report</h1>
              <p className="text-gray-400 text-sm">Track your sales performance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExport} 
              className="px-4 py-2 bg-gray-800 rounded-lg text-white text-sm flex items-center gap-2 hover:bg-gray-700 transition"
            >
              <IoDownloadOutline /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <IoCashOutline className="text-green-400 text-lg" />
              <p className="text-gray-400 text-xs uppercase tracking-wide">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-white">₹{summary.totalRevenue?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <IoCartOutline className="text-blue-400 text-lg" />
              <p className="text-gray-400 text-xs uppercase tracking-wide">Total Orders</p>
            </div>
            <p className="text-2xl font-bold text-white">{summary.totalOrders || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <IoRestaurantOutline className="text-purple-400 text-lg" />
              <p className="text-gray-400 text-xs uppercase tracking-wide">Items Sold</p>
            </div>
            <p className="text-2xl font-bold text-white">{summary.totalItems || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <IoTrendingUpOutline className="text-orange-400 text-lg" />
              <p className="text-gray-400 text-xs uppercase tracking-wide">Avg Order Value</p>
            </div>
            <p className="text-2xl font-bold text-white">₹{summary.averageOrderValue?.toFixed(0) || 0}</p>
          </div>
        </div>

        {/* Period Info */}
        {(period.from || period.to) && (
          <div className="bg-gray-800/30 rounded-xl p-3 mb-6 text-center">
            <p className="text-gray-400 text-sm">
              📅 Report Period: {formatDate(period.from)} - {formatDate(period.to)}
            </p>
          </div>
        )}

        {/* Date Filter */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex flex-wrap gap-3 items-center">
            <IoCalendarOutline className="text-gray-400 text-xl" />
            <div className="flex flex-wrap gap-2">
              {['all', 'today', 'week', 'month', 'year', 'custom'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${
                    dateRange === range 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                  }`}
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
                  className="px-3 py-1.5 bg-gray-900 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:border-orange-500"
                />
                <span className="text-gray-500">to</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="px-3 py-1.5 bg-gray-900 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Daily Sales Chart (Summary) */}
        {dailySales.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <IoCalendarOutline className="text-orange-400" /> Daily Sales Trend
            </h3>
            <div className="space-y-3">
              {dailySales.slice(0, 7).map((day, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="w-24">
                    <span className="text-gray-400 text-sm">{day.date}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{ width: `${Math.min((day.revenue / (summary.totalRevenue || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white text-sm font-medium">₹{day.revenue}</span>
                    <span className="text-gray-500 text-xs ml-2">({day.orders} orders)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Products Table */}
        {topProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
            <IoBarChartOutline className="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No sales data available for this period</p>
            <p className="text-gray-500 text-sm mt-1">Try selecting a different date range</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr className="text-left text-gray-400 text-xs">
                    <th className="px-4 py-3 rounded-l-lg">#</th>
                    <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("productName")}>
                      Product Name {sortBy === "productName" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort("quantitySold")}>
                      Quantity Sold {sortBy === "quantitySold" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort("revenue")}>
                      Revenue {sortBy === "revenue" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {sortedProducts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3 text-gray-500 text-sm">{idx + 1}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">
                        {item.productName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium">
                          {item.quantitySold || 0} units
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-white font-semibold">
                        ₹{(item.revenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800 border-t border-gray-700">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-right text-gray-400 font-medium">Total:</td>
                    <td className="px-4 py-3 text-right text-white font-bold">
                      {summary.totalItems || 0} units
                    </td>
                    <td className="px-4 py-3 text-right text-white font-bold text-lg">
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
                  <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="text-orange-400 text-sm font-medium">
                        #{idx + 1} Best Seller
                      </span>
                    </div>
                    <p className="text-white font-semibold text-lg mb-2">{item.productName}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Quantity Sold:</span>
                      <span className="text-white font-medium">{item.quantitySold} units</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Revenue:</span>
                      <span className="text-green-400 font-semibold">₹{item.revenue?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VendorSalesReportPage;