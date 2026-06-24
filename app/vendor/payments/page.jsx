"use client";

import React, { useState, useMemo } from 'react';
import { getVendorPayments } from "../../services/adminCommunication";
import { useQuery } from "@tanstack/react-query";
import { 
  IoCardOutline, 
  IoCashOutline, 
  IoCheckmarkCircleOutline, 
  IoTimeOutline,
  IoCloseCircleOutline,
  IoDownloadOutline,
  IoCalendarOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoWalletOutline,
  IoReceiptOutline,
  IoRefreshOutline,
  IoCubeOutline,
  IoCheckmarkDone,
  IoClose,
} from "react-icons/io5";
import toast from "react-hot-toast";

function VendorPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vendorPayments'],
    queryFn: getVendorPayments,
    onError: (error) => toast.error("Failed to load payments: " + error.message),
  });

  // Safe data extraction
  const payments = Array.isArray(data?.data) ? data.data : [];
  const summary = data?.summary || {};

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];
    
    if (searchTerm) {
      result = result.filter(p => 
        p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.orderId?.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }
    
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === "amount") {
        aVal = a.amount || 0;
        bVal = b.amount || 0;
      } else if (sortBy === "createdAt") {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }
      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    
    return result;
  }, [payments, searchTerm, statusFilter, sortBy, sortOrder]);

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

  const getStatusBadge = (status) => {
    switch(status) {
      case "SUCCESS":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 flex items-center gap-1"><IoCheckmarkCircleOutline className="w-3 h-3" /> Success</span>;
      case "PENDING":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1"><IoTimeOutline className="w-3 h-3" /> Pending</span>;
      case "FAILED":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 flex items-center gap-1"><IoCloseCircleOutline className="w-3 h-3" /> Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  const handleExport = () => {
    if (!filteredPayments.length) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Transaction ID", "Order ID", "Amount", "Status", "Payment Method", "Date"];
    const rows = filteredPayments.map(p => [
      p.transactionId || "N/A",
      p.orderId?.orderId || "N/A",
      `₹${p.amount || 0}`,
      p.status || "N/A",
      p.paymentMethod || "N/A",
      new Date(p.createdAt).toLocaleString()
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported!");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl py-20" style={{ background: "var(--background)" }}>
        <IoRefreshOutline className="mb-4 animate-spin text-4xl text-blue-500" />
        <p style={{ color: "var(--foreground)", opacity: 0.65 }}>Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl py-20" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <IoWalletOutline className="text-5xl text-red-400" />
        </div>
        <p className="mb-3 text-red-400">{error.message}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <main className="space-y-8">
        {/* Header */}
        <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                    <IoWalletOutline className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                    Payments
                  </h1>
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Track all your transactions
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExport} className="px-4 py-2 hover:bg-gray-700/50 rounded-lg text-sm flex items-center gap-2 transition-colors border" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                  <IoDownloadOutline /> Export
                </button>
                <button onClick={() => refetch()} className="px-4 py-2 hover:bg-gray-700/50 rounded-lg text-sm transition-colors border" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <DashboardStatCard
            title="Total Transactions"
            value={summary.totalTransactions || 0}
            icon={IoCubeOutline}
            color="purple"
          />
          <DashboardStatCard
            title="Total Amount"
            value={summary.totalAmount || 0}
            icon={IoCashOutline}
            color="green"
            prefix="₹"
          />
          <DashboardStatCard
            title="Successful"
            value={summary.successfulTransactions || 0}
            icon={IoCheckmarkDone}
            color="emerald"
          />
          <DashboardStatCard
            title="Pending"
            value={summary.pendingTransactions || 0}
            icon={IoTimeOutline}
            color="yellow"
          />
          <DashboardStatCard
            title="Delivered Orders"
            value={summary.deliveredOrdersCount || 0}
            icon={IoCheckmarkCircleOutline}
            color="blue"
          />
          <DashboardStatCard
            title="Delivered Payment"
            value={summary.deliveredOrdersTotalPayment || 0}
            icon={IoWalletOutline}
            color="indigo"
            prefix="₹"
          />
        </div>

        {/* Search and Filter */}
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground)", opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search by Transaction ID or Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none transition-colors"
                style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm focus:outline-none transition-colors"
              style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
            >
              <option value="">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        {!filteredPayments.length ? (
          <div className="rounded-xl py-20 text-center" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
              <IoCardOutline className="text-5xl text-blue-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold" style={{ color: "var(--foreground)" }}>No Payments Found</h3>
            <p className="mx-auto max-w-md text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              No payment transactions found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--card-border)" }}>
            <table className="w-full">
              <thead style={{ background: "var(--card)", borderBottom: "1px solid var(--card-border)" }}>
                <tr className="text-left text-xs">
                  <th className="px-4 py-3 cursor-pointer" style={{ color: "var(--foreground)", opacity: 0.6 }} onClick={() => handleSort("orderId")}>
                    Order ID {sortBy === "orderId" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer" style={{ color: "var(--foreground)", opacity: 0.6 }} onClick={() => handleSort("amount")}>
                    Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" style={{ color: "var(--foreground)", opacity: 0.6 }} onClick={() => handleSort("status")}>
                    Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>Payment Method</th>
                  <th className="px-4 py-3 text-right cursor-pointer" style={{ color: "var(--foreground)", opacity: 0.6 }} onClick={() => handleSort("createdAt")}>
                    Date {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderBottom: "1px solid var(--card-border)" }}>
                {filteredPayments.map((payment, idx) => (
                  <tr key={payment._id || idx} className="hover:opacity-80 transition" style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono" style={{ color: "var(--foreground)", opacity: 0.7 }}>{payment.orderId?.orderId || "N/A"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold" style={{ color: "var(--foreground)" }}>₹{(payment.amount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm flex items-center gap-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                        <IoCardOutline className="w-3 h-3" />
                        {payment.paymentMethod || "ONLINE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      {new Date(payment.createdAt).toLocaleDateString()} <br />
                      <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{new Date(payment.createdAt).toLocaleTimeString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: "var(--card)", borderTop: "1px solid var(--card-border)" }}>
                <tr className="text-sm">
                  <td colSpan="2" className="px-4 py-3 text-right" style={{ color: "var(--foreground)", opacity: 0.6 }}>Total:</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: "var(--foreground)" }}>₹{(summary.totalAmount || 0).toLocaleString()}</td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Recent Payments Summary */}
        {filteredPayments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <IoCalendarOutline className="text-blue-500" /> Recent Transactions
              </h3>
              <div className="space-y-2">
                {filteredPayments.slice(0, 5).map((payment, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                    <div>
                      <p className="text-sm font-mono" style={{ color: "var(--foreground)" }}>{payment.transactionId?.slice(-12) || "N/A"}</p>
                      <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: "var(--foreground)" }}>₹{(payment.amount || 0).toLocaleString()}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <IoCashOutline className="text-green-400" /> Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between p-2 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                  <span style={{ color: "var(--foreground)", opacity: 0.6 }}>Total Successful Payments</span>
                  <span className="font-semibold text-green-400">{summary.successfulTransactions || 0}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                  <span style={{ color: "var(--foreground)", opacity: 0.6 }}>Total Pending Payments</span>
                  <span className="font-semibold text-yellow-400">{summary.pendingTransactions || 0}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                  <span style={{ color: "var(--foreground)", opacity: 0.6 }}>Success Rate</span>
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {summary.totalTransactions > 0 
                      ? Math.round((summary.successfulTransactions / summary.totalTransactions) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default VendorPaymentsPage;