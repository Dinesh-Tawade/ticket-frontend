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
  IoReceiptOutline
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-400 mb-3">{error.message}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-orange-500 rounded-lg text-white">
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <IoWalletOutline className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Payments</h1>
              <p className="text-gray-400 text-sm">Track all your transactions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="px-4 py-2 bg-gray-800 rounded-lg text-white text-sm flex items-center gap-2">
              <IoDownloadOutline /> Export
            </button>
            <button onClick={() => refetch()} className="px-4 py-2 bg-gray-800 rounded-lg text-white text-sm">
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs">Total Transactions</p>
            <p className="text-2xl font-bold text-white">{summary.totalTransactions || 0}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs">Total Amount</p>
            <p className="text-2xl font-bold text-green-400">₹{(summary.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs">Successful</p>
            <p className="text-2xl font-bold text-green-400">{summary.successfulTransactions || 0}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{summary.pendingTransactions || 0}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by Transaction ID or Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
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
          <div className="text-center py-12 bg-gray-800/30 rounded-xl">
            <IoCardOutline className="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No payment transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr className="text-left text-gray-400 text-xs">
                  {/* <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("transactionId")}>
                    Transaction ID {sortBy === "transactionId" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th> */}
                  <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("orderId")}>
                    Order ID {sortBy === "orderId" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort("amount")}>
                    Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("status")}>
                    Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort("createdAt")}>
                    Date {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredPayments.map((payment, idx) => (
                  <tr key={payment._id || idx} className="hover:bg-gray-800/50 transition-colors">
                    {/* <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <IoReceiptOutline className="text-gray-500 w-4 h-4" />
                        <span className="text-white text-sm font-mono">{payment.transactionId || "N/A"}</span>
                      </div>
                    </td> */}
                    <td className="px-4 py-3">
                      <span className="text-gray-300 text-sm font-mono">{payment.orderId?.orderId || "N/A"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-semibold">₹{(payment.amount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300 text-sm flex items-center gap-1">
                        <IoCardOutline className="w-3 h-3" />
                        {payment.paymentMethod || "ONLINE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()} <br />
                      <span className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleTimeString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-800 border-t border-gray-700">
                <tr className="text-sm">
                  <td colSpan="2" className="px-4 py-3 text-right text-gray-400">Total:</td>
                  <td className="px-4 py-3 text-right text-white font-bold">₹{(summary.totalAmount || 0).toLocaleString()}</td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Recent Payments Summary */}
        {filteredPayments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <IoCalendarOutline className="text-orange-400" /> Recent Transactions
              </h3>
              <div className="space-y-2">
                {filteredPayments.slice(0, 5).map((payment, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-mono">{payment.transactionId?.slice(-12) || "N/A"}</p>
                      <p className="text-gray-500 text-xs">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">₹{(payment.amount || 0).toLocaleString()}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <IoCashOutline className="text-green-400" /> Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-gray-900 rounded-lg">
                  <span className="text-gray-400">Total Successful Payments</span>
                  <span className="text-green-400 font-semibold">{summary.successfulTransactions || 0}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-900 rounded-lg">
                  <span className="text-gray-400">Total Pending Payments</span>
                  <span className="text-yellow-400 font-semibold">{summary.pendingTransactions || 0}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-900 rounded-lg">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-white font-semibold">
                    {summary.totalTransactions > 0 
                      ? Math.round((summary.successfulTransactions / summary.totalTransactions) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorPaymentsPage;