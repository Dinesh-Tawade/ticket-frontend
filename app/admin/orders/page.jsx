"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import {
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaReceipt,
  FaMapMarkerAlt,
  FaTrash,
  FaCoffee,
  FaBicycle,
  FaDownload
} from "react-icons/fa";
import {
  getAdminOrders,
  getAdminOrderDetails,
  updateAdminOrderStatus
} from "../../services/adminCommunication";
import { generateInvoicePDF } from "../../utils/invoiceGenerator";

function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==================== QUERIES & MUTATIONS ====================
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
  });

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await getAdminOrderDetails(orderId);
      setSelectedOrder(res.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to load order details: " + error.message);
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, statusData }) => updateAdminOrderStatus(orderId, statusData),
    onSuccess: (data) => {
      toast.success(data.message || "Order status updated successfully!");
      queryClient.invalidateQueries(["admin-orders"]);
      if (selectedOrder) {
        fetchOrderDetails(selectedOrder.orderId);
      }
    },
    onError: (error) => {
      toast.error("Failed to update status: " + (error.response?.data?.message || error.message));
    },
  });

  const orders = ordersData?.data || [];
  const summary = ordersData?.summary || {};

  // Filter Orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    if (searchTerm) {
      result = result.filter(order =>
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerId?.phone?.includes(searchTerm) ||
        order.storeId?.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.theaterId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus) {
      result = result.filter(order => order.orderStatus === selectedStatus);
    }
    
    return result;
  }, [orders, searchTerm, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Status Options for UI
  const statusOptions = [
    { value: "PENDING", label: "Pending", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30", nextStatus: "CONFIRMED", nextLabel: "Confirm Order" },
    { value: "CONFIRMED", label: "Confirmed", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30", nextStatus: "PREPARING", nextLabel: "Start Preparing" },
    { value: "PREPARING", label: "Preparing", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30", nextStatus: "READY", nextLabel: "Mark Ready" },
    { value: "READY", label: "Ready", color: "text-green-500", bg: "bg-green-500/10 border-green-500/30", nextStatus: "DELIVERED", nextLabel: "Mark Delivered" },
    { value: "DELIVERED", label: "Delivered", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30", nextStatus: null, nextLabel: null },
    { value: "CANCELLED", label: "Cancelled", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30", nextStatus: null, nextLabel: null }
  ];

  const getStatusBadge = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${option?.bg} ${option?.color}`}>
        {option?.label || status}
      </span>
    );
  };

  const getNextAction = (currentStatus) => {
    const option = statusOptions.find(s => s.value === currentStatus);
    if (option && option.nextStatus) {
      return { status: option.nextStatus, label: option.nextLabel };
    }
    return null;
  };

  const extractSeatNumbers = (specialInstructions) => {
    if (!specialInstructions) return 'N/A';
    const match = specialInstructions.match(/seat\s+([A-Z0-9,\s]+)/i);
    return match ? match[1].trim() : specialInstructions;
  };

  const handleStatusUpdate = (orderId, currentStatus) => {
    const nextAction = getNextAction(currentStatus);
    if (!nextAction) return;
    
    updateStatusMutation.mutate({ 
      orderId: orderId, 
      statusData: { status: nextAction.status }
    });
  };

  const handleCancelOrder = (orderId, currentStatus) => {
    if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    updateStatusMutation.mutate({ 
      orderId: orderId, 
      statusData: { status: "CANCELLED" }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ background: "var(--background)" }}>
        <div className="flex items-center gap-3">
          <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Loading system orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <FaShoppingCart className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  All Food Orders
                </h1>
                <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Global food ordering dashboard to monitor, track, and update system-wide customer orders.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => refetch()}
              className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all hover:scale-105"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <FaSpinner className={`text-sm ${updateStatusMutation.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {[
          { label: "Total Orders", value: summary.totalOrders || 0, color: "text-blue-500" },
          { label: "Total Revenue", value: `₹${(summary.totalRevenue || 0).toLocaleString()}`, color: "text-green-500" },
          { label: "Pending", value: summary.pendingOrders || 0, color: "text-yellow-500" },
          { label: "Preparing", value: summary.preparingOrders || 0, color: "text-purple-500" },
          { label: "Delivered", value: summary.deliveredOrders || 0, color: "text-emerald-500" },
          { label: "Cancelled", value: summary.cancelledOrders || 0, color: "text-red-500" }
        ].map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl p-4 flex flex-col justify-center transition-all duration-300 hover:shadow-lg"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              {stat.label}
            </div>
            <div className={`text-2xl font-black tracking-tight ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="rounded-xl p-4 mb-6 flex flex-wrap gap-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="flex-1 min-w-[260px] relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground)", opacity: 0.4 }} />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Vendor, Theater..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-10 py-2 rounded-lg border text-sm outline-none transition-all focus:border-blue-500"
            style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <FaTimes style={{ color: "var(--foreground)", opacity: 0.5 }} />
            </button>
          )}
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 rounded-lg border text-sm outline-none"
          style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
        >
          <option value="">All Status</option>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <FaShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--foreground)", opacity: 0.2 }} />
          <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>No orders found</h3>
          <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>No food orders match your search filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ borderColor: "var(--card-border)" }}>
            <table className="w-full min-w-max border-collapse">
              <thead style={{ background: "var(--background)" }}>
                <tr className="text-left border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                  <th className="px-6 py-4 opacity-70">Order ID</th>
                  <th className="px-6 py-4 opacity-70">Customer</th>
                  <th className="px-6 py-4 opacity-70">Seat</th>
                  <th className="px-6 py-4 opacity-70">Vendor / Theater</th>
                  <th className="px-6 py-4 opacity-70">Items</th>
                  <th className="px-6 py-4 opacity-70">Total</th>
                  <th className="px-6 py-4 opacity-70">Status</th>
                  <th className="px-6 py-4 opacity-70">Date</th>
                  <th className="px-6 py-4 opacity-70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm" style={{ divideColor: "var(--card-border)" }}>
                {paginatedOrders.map((order) => {
                  const nextAction = getNextAction(order.orderStatus);
                  const seatNumbers = extractSeatNumbers(order.specialInstructions);
                  return (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors" style={{ background: "var(--card)", color: "var(--foreground)" }}>
                      <td className="px-6 py-4 font-mono font-bold">#{order.orderId || order._id.slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{order.buyerId?.name || "Guest"}</div>
                        <div className="text-xs opacity-60">{order.buyerId?.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-orange-500 font-bold">{seatNumbers}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{order.storeId?.storeName || "N/A"}</div>
                        <div className="text-xs opacity-60">{order.theaterId?.name || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 opacity-80">{order.items?.length || 0} items</td>
                      <td className="px-6 py-4 font-bold">₹{order.totalAmount}</td>
                      <td className="px-6 py-4">{getStatusBadge(order.orderStatus)}</td>
                      <td className="px-6 py-4 opacity-70">{new Date(order.orderedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => fetchOrderDetails(order.orderId)}
                            className="p-1.5 rounded-lg border hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                            style={{ borderColor: "var(--card-border)" }}
                            title="View Details"
                          >
                            <FaEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => generateInvoicePDF(order)}
                            className="p-1.5 rounded-lg border text-indigo-500 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                            style={{ borderColor: "var(--card-border)" }}
                            title="Download Invoice"
                          >
                            <FaDownload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="px-3 py-2 rounded-lg border disabled:opacity-50 hover:bg-white/5 transition"
                style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <FaChevronLeft className="w-3 h-3" />
              </button>
              <span className="px-4 py-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="px-3 py-2 rounded-lg border disabled:opacity-50 hover:bg-white/5 transition"
                style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 p-4 border-b flex justify-between items-center" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Order Details</h2>
                <p className="text-xs font-mono opacity-60" style={{ color: "var(--foreground)" }}>{selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors" style={{ color: "var(--foreground)" }}>
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer Details */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <FaUser className="text-blue-500" /> Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="opacity-60" style={{ color: "var(--foreground)" }}>Name</p>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>{selectedOrder.buyerId?.name || "Guest"}</p>
                  </div>
                  <div>
                    <p className="opacity-60" style={{ color: "var(--foreground)" }}>Phone</p>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>{selectedOrder.buyerId?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <FaMapMarkerAlt className="text-blue-500" /> Delivery Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="opacity-60" style={{ color: "var(--foreground)" }}>Delivery Type</p>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>{selectedOrder.deliveryType?.replace("_", " ") || "SEAT DELIVERY"}</p>
                  </div>
                  <div>
                    <p className="opacity-60" style={{ color: "var(--foreground)" }}>Payment Status</p>
                    <p className={`font-semibold ${selectedOrder.paymentStatus === "PAID" ? "text-green-500" : "text-yellow-500"}`}>{selectedOrder.paymentStatus || "PENDING"}</p>
                  </div>
                  <div className="mt-2">
                    <p className="opacity-60" style={{ color: "var(--foreground)" }}>Seat Number</p>
                    <p className="font-bold text-orange-500">{extractSeatNumbers(selectedOrder.specialInstructions)}</p>
                  </div>
                  <div className="mt-2">
                    <p className="opacity-60" style={{ color: "var(--foreground)" }}>Assigned Store</p>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>{selectedOrder.storeId?.storeName || "N/A"}</p>
                  </div>
                  {selectedOrder.scheduledFor && (
                    <div className="mt-2">
                      <p className="opacity-60" style={{ color: "var(--foreground)" }}>Scheduled For</p>
                      <p className="font-semibold text-blue-500">{new Date(selectedOrder.scheduledFor).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Summary */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <FaReceipt className="text-blue-500" /> Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--foreground)" }}>{item.productName}</p>
                        <p className="text-xs opacity-60" style={{ color: "var(--foreground)" }}>Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-bold" style={{ color: "var(--foreground)" }}>₹{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between opacity-80" style={{ color: "var(--foreground)" }}>
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subTotal}</span>
                  </div>
                  <div className="flex justify-between opacity-80" style={{ color: "var(--foreground)" }}>
                    <span>Tax (5% GST)</span>
                    <span>₹{selectedOrder.tax}</span>
                  </div>
                  <div className="flex justify-between opacity-80" style={{ color: "var(--foreground)" }}>
                    <span>Delivery Charge</span>
                    <span>₹{selectedOrder.deliveryCharge}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                    <span>Total Amount</span>
                    <span className="text-lg text-blue-500 font-bold">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="rounded-lg p-4 flex justify-end" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <button
                  onClick={() => generateInvoicePDF(selectedOrder)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FaDownload className="text-sm" />
                  Download Invoice
                </button>
              </div>



              {/* Timeline */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-semibold mb-3" style={{ color: "var(--foreground)" }}>Order Timeline</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Order Confirmed", date: selectedOrder.confirmedAt, icon: FaCheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
                    { label: "Preparing", date: selectedOrder.preparedAt, icon: FaCoffee, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Ready for Delivery", date: selectedOrder.readyAt, icon: FaBicycle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                    { label: "Delivered", date: selectedOrder.deliveredAt, icon: FaCheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" }
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.date ? step.bg : 'bg-gray-200/10'}`}>
                        <step.icon className={`w-4 h-4 ${step.date ? step.color : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--foreground)" }}>{step.label}</p>
                        <p className="text-xs opacity-60" style={{ color: "var(--foreground)" }}>
                          {step.date ? new Date(step.date).toLocaleString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
