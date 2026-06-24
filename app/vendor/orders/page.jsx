"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
import {
  IoCartOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCafeOutline,
  IoBicycleOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPersonOutline,
  IoReceiptOutline,
  IoLocationOutline,
  IoCashOutline,
  IoNotificationsOutline,
  IoVolumeHighOutline,
  IoWifiOutline,
  IoDownloadOutline,
  IoCubeOutline,
  IoTrendingUpOutline,
  IoTime,
  IoCheckmarkDone,
  IoClose,
} from "react-icons/io5";
import { getVendorOrders, getVendorOrderDetails, updateVendorOrderStatus } from "../../services/adminCommunication";
import { generateInvoicePDF } from "../../utils/invoiceGenerator";

function OrdersPage() {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const audioRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==================== SOCKET.IO CONNECTION ====================
  useEffect(() => {
    // Get vendor data from localStorage
    const userStr = localStorage.getItem('user');
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {}

    if (!user || user.role !== 'VENDOR') {
      console.log('Not a vendor, skipping socket connection');
      return;
    }

    const token = localStorage.getItem('token');
    const SOCKET_URL = process.env.NEXT_PUBLIC_BE_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      socketInstance.emit('vendor-join', user._id);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Listen for new orders
    socketInstance.on('new-order', (data) => {
      console.log('📦 New order received:', data);
      setNewOrderAlert(data);
      setShowAlert(true);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      toast.success(data.message, {
        duration: 5000,
        icon: '🛒',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
      
      // Auto-refetch orders
      refetch();
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setShowAlert(false);
        setNewOrderAlert(null);
      }, 5000);
    });

    // Listen for order status changes (from vendor self)
    socketInstance.on('order-status-changed', (data) => {
      console.log('📢 Order status changed:', data);
      refetch();
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Play notification sound on new order
  useEffect(() => {
    if (newOrderAlert && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio error:', e));
    }
  }, [newOrderAlert]);

  // ==================== QUERIES & MUTATIONS ====================
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: getVendorOrders,
  });

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await getVendorOrderDetails(orderId);
      setSelectedOrder(res.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to load order details: " + error.message);
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, statusData }) => updateVendorOrderStatus(orderId, statusData),
    onSuccess: (data) => {
      toast.success(data.message || "Order status updated successfully!");
      queryClient.invalidateQueries(["vendor-orders"]);
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
        order.buyerId?.phone?.includes(searchTerm)
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

  // Status Options for UI (Display values)
  const statusOptions = [
    { value: "PENDING", label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/20", nextStatus: "CONFIRMED", nextLabel: "Confirm Order" },
    { value: "CONFIRMED", label: "Confirmed", color: "text-blue-400", bg: "bg-blue-500/20", nextStatus: "PREPARING", nextLabel: "Start Preparing" },
    { value: "PREPARING", label: "Preparing", color: "text-purple-400", bg: "bg-purple-500/20", nextStatus: "READY", nextLabel: "Mark Ready" },
    { value: "READY", label: "Ready", color: "text-green-400", bg: "bg-green-500/20", nextStatus: "DELIVERED", nextLabel: "Mark Delivered" },
    { value: "DELIVERED", label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/20", nextStatus: null, nextLabel: null },
    { value: "CANCELLED", label: "Cancelled", color: "text-red-400", bg: "bg-red-500/20", nextStatus: null, nextLabel: null }
  ];

  const getStatusBadge = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${option?.bg} ${option?.color}`}>
        {option?.label || status}
      </span>
    );
  };

  // Get next status action for current status
  const getNextAction = (currentStatus) => {
    const option = statusOptions.find(s => s.value === currentStatus);
    if (option && option.nextStatus) {
      return { status: option.nextStatus, label: option.nextLabel };
    }
    return null;
  };

  // Extract seat numbers from specialInstructions
  const extractSeatNumbers = (specialInstructions) => {
    if (!specialInstructions) return 'N/A';
    const match = specialInstructions.match(/seat\s+([A-Z0-9,\s]+)/i);
    return match ? match[1].trim() : specialInstructions;
  };

  // Handle Status Update
  const handleStatusUpdate = (orderId, currentStatus) => {
    const nextAction = getNextAction(currentStatus);
    if (!nextAction) {
      toast.error("Cannot update this order further");
      return;
    }
    
    updateStatusMutation.mutate({ 
      orderId: orderId, 
      statusData: { status: nextAction.status }
    });
  };

  // Handle Cancel Order
  const handleCancelOrder = (orderId, currentStatus) => {
    if (currentStatus === "DELIVERED") {
      toast.error("Cannot cancel delivered order");
      return;
    }
    if (currentStatus === "CANCELLED") {
      toast.error("Order already cancelled");
      return;
    }
    
    updateStatusMutation.mutate({ 
      orderId: orderId, 
      statusData: { status: "CANCELLED" }
    });
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
        <p style={{ color: "var(--foreground)", opacity: 0.65 }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 pb-8" style={{ background: "var(--background)" }}>
      {/* Audio for notifications */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--card-border)",
          },
        }}
      />
      
      {/* Connection Status Badge */}
      <div className="fixed top-20 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
          isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          <IoWifiOutline className="w-3 h-3" />
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* New Order Alert Banner */}
      {showAlert && newOrderAlert && (
        <div className="fixed top-24 right-4 left-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <IoNotificationsOutline className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">New Order!</p>
                <p className="text-white/90 text-sm">Order #{newOrderAlert.orderId}</p>
                <p className="text-white/80 text-xs">Customer: {newOrderAlert.customerName}</p>
                <p className="text-white/80 text-xs">Amount: ₹{newOrderAlert.totalAmount}</p>
                <p className="text-white/70 text-xs mt-1">Items: {newOrderAlert.itemsCount}</p>
              </div>
              <button 
                onClick={() => setShowAlert(false)}
                className="text-white/70 hover:text-white"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="space-y-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Orders
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Manage and track customer orders in real-time.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="h-10 px-3 rounded-xl transition-all duration-300 hover:scale-105 border flex items-center gap-2 text-sm font-semibold"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            <IoRefreshOutline className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatCard
            title="Total Orders"
            value={summary.totalOrders || 0}
            icon={IoCubeOutline}
            color="purple"
          />
          <DashboardStatCard
            title="Total Revenue"
            value={summary.totalRevenue || 0}
            icon={IoTrendingUpOutline}
            color="green"
            prefix="₹"
          />
          <DashboardStatCard
            title="Pending"
            value={summary.pendingOrders || 0}
            icon={IoTime}
            color="yellow"
          />
          <DashboardStatCard
            title="Delivered"
            value={summary.deliveredOrders || 0}
            icon={IoCheckmarkDone}
            color="emerald"
          />
        </div>

        <section className="space-y-6">
          <div
            className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground)", opacity: 0.5 }} />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, Phone..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none transition-colors"
                  style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <IoCloseOutline className="hover:opacity-80" style={{ color: "var(--foreground)", opacity: 0.5 }} />
                  </button>
                )}
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 rounded-lg focus:outline-none transition-colors"
                style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
              >
                <option value="">All Status</option>
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-xl py-20 text-center" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
                <IoCartOutline className="text-5xl text-blue-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold" style={{ color: "var(--foreground)" }}>No Orders Found</h3>
              <p className="mx-auto max-w-md text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                Orders will appear here when customers place them.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--card-border)" }}>
                <table className="w-full min-w-[900px]">
                  <thead style={{ background: "var(--card)", borderBottom: "1px solid var(--card-border)" }}>
                    <tr className="text-left">
                      <th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Order ID</th>
                      <th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Customer</th>
                      <th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Seat</th>
                      <th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Items</th>
                      <th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Total</th>
                      <th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Status</th>
                      <th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Date</th>
                      <th className="px-4 py-3 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderBottom: "1px solid var(--card-border)" }}>
                    {paginatedOrders.map((order) => {
                      const nextAction = getNextAction(order.orderStatus);
                      const seatNumbers = extractSeatNumbers(order.specialInstructions);
                      return (
                        <tr key={order._id} className="hover:opacity-80 transition-colors" style={{ borderBottom: "1px solid var(--card-border)" }}>
                          <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--foreground)" }}>{order.orderId}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm" style={{ color: "var(--foreground)" }}>{order.buyerId?.name || "N/A"}</div>
                            <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{order.buyerId?.phone || "N/A"}</div>
                         </td>
                          <td className="px-4 py-3 text-sm font-medium text-blue-500">{seatNumbers}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>{order.items?.length || 0} items</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>₹{order.totalAmount}</td>
                          <td className="px-4 py-3">{getStatusBadge(order.orderStatus)}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                            {new Date(order.orderedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => fetchOrderDetails(order.orderId)}
                                className="p-1.5 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                                title="View Details"
                              >
                                <IoEyeOutline className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => generateInvoicePDF(order)}
                                className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors cursor-pointer"
                                title="Download Invoice"
                              >
                                <IoDownloadOutline className="w-4 h-4" />
                              </button>
                              {nextAction && (
                                <button
                                  onClick={() => handleStatusUpdate(order.orderId, order.orderStatus)}
                                  disabled={updateStatusMutation.isLoading}
                                  className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                  title={nextAction.label}
                                >
                                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                                </button>
                              )}
                              {order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED" && (
                                <button
                                  onClick={() => handleCancelOrder(order.orderId, order.orderStatus)}
                                  disabled={updateStatusMutation.isLoading}
                                  className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                  title="Cancel Order"
                                >
                                  <IoCloseCircleOutline className="w-4 h-4" />
                                </button>
                              )}
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
                    className="px-3 py-1.5 rounded-lg disabled:opacity-50 text-sm hover:opacity-80 transition"
                    style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                  >
                    <IoChevronBackOutline className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages} 
                    className="px-3 py-1.5 rounded-lg disabled:opacity-50 text-sm hover:opacity-80 transition"
                    style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                  >
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-2" style={{ background: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 p-4 flex justify-between items-center" style={{ background: "var(--card)", borderBottom: "1px solid var(--card-border)" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Order Details</h2>
                <p className="text-xs font-mono" style={{ color: "var(--foreground)", opacity: 0.6 }}>{selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:opacity-80 rounded-lg transition-colors">
                <IoClose className="text-2xl" style={{ color: "var(--foreground)", opacity: 0.6 }} />
              </button>
            </div>

            <div className="p-4 md:p-5 space-y-5">
              {/* Customer Info */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-medium mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <IoPersonOutline className="text-blue-500" /> Customer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Name</p><p style={{ color: "var(--foreground)" }}>{selectedOrder.buyerId?.name || "N/A"}</p></div>
                  <div><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Phone</p><p style={{ color: "var(--foreground)" }}>{selectedOrder.buyerId?.phone || "N/A"}</p></div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-medium mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <IoLocationOutline className="text-blue-500" /> Delivery Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Delivery Type</p><p style={{ color: "var(--foreground)" }}>{selectedOrder.deliveryType?.replace("_", " ") || "SEAT DELIVERY"}</p></div>
                  <div><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Payment</p><p className={selectedOrder.paymentStatus === "PAID" ? "text-green-400" : "text-yellow-400"}>{selectedOrder.paymentStatus || "PENDING"}</p></div>
                  <div><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Seat Number</p><p className="text-blue-500 font-semibold">{extractSeatNumbers(selectedOrder.specialInstructions)}</p></div>
                  {selectedOrder.scheduledFor && (
                    <div><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Scheduled For</p><p style={{ color: "var(--foreground)" }}>{new Date(selectedOrder.scheduledFor).toLocaleString()}</p></div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-medium mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}><IoReceiptOutline className="text-blue-500" /> Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                      <div><p className="font-medium" style={{ color: "var(--foreground)" }}>{item.productName}</p><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Qty: {item.quantity} × ₹{item.price}</p></div>
                      <p className="font-semibold" style={{ color: "var(--foreground)" }}>₹{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="space-y-2">
                  <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.6 }}>Subtotal</span><span style={{ color: "var(--foreground)" }}>₹{selectedOrder.subTotal}</span></div>
                  <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.6 }}>Tax (5% GST)</span><span style={{ color: "var(--foreground)" }}>₹{selectedOrder.tax}</span></div>
                  <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.6 }}>Delivery Charge</span><span style={{ color: "var(--foreground)" }}>₹{selectedOrder.deliveryCharge}</span></div>
                  <div className="pt-2 flex justify-between" style={{ borderTop: "1px solid var(--card-border)" }}><span className="font-bold" style={{ color: "var(--foreground)" }}>Total</span><span className="font-bold text-xl" style={{ color: "var(--foreground)" }}>₹{selectedOrder.totalAmount}</span></div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="rounded-lg p-4 flex justify-end" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <button
                  onClick={() => generateInvoicePDF(selectedOrder)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <IoDownloadOutline className="w-4 h-4" /> Download Invoice
                </button>
              </div>

              {/* Update Status Section */}
              {selectedOrder.orderStatus !== "DELIVERED" && selectedOrder.orderStatus !== "CANCELLED" && (
                <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                  <h3 className="font-medium mb-3" style={{ color: "var(--foreground)" }}>Update Order Status</h3>
                  <div className="flex flex-wrap gap-3">
                    {(() => {
                      const nextAction = getNextAction(selectedOrder.orderStatus);
                      return nextAction && (
                        <button onClick={() => handleStatusUpdate(selectedOrder.orderId, selectedOrder.orderStatus)} disabled={updateStatusMutation.isLoading} className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
                          <IoCheckmarkCircleOutline className="w-4 h-4" /> {nextAction.label}
                        </button>
                      );
                    })()}
                    <button onClick={() => handleCancelOrder(selectedOrder.orderId, selectedOrder.orderStatus)} disabled={updateStatusMutation.isLoading} className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition disabled:opacity-50 flex items-center gap-2">
                      <IoCloseCircleOutline className="w-4 h-4" /> Cancel Order
                    </button>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-medium mb-3" style={{ color: "var(--foreground)" }}>Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === "CONFIRMED" || selectedOrder.orderStatus !== "PENDING" ? 'bg-green-500/20' : 'bg-gray-700'}`}><IoCheckmarkCircleOutline className={`w-4 h-4 ${selectedOrder.orderStatus === "CONFIRMED" || selectedOrder.orderStatus !== "PENDING" ? 'text-green-400' : 'text-gray-500'}`} /></div><div><p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Order Confirmed</p><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{selectedOrder.confirmedAt ? new Date(selectedOrder.confirmedAt).toLocaleString() : 'Pending'}</p></div></div>
                  <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === "PREPARING" ? 'bg-blue-500/20' : 'bg-gray-700'}`}><IoCafeOutline className={`w-4 h-4 ${selectedOrder.orderStatus === "PREPARING" ? 'text-blue-400' : 'text-gray-500'}`} /></div><div><p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Preparing</p><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{selectedOrder.preparedAt ? new Date(selectedOrder.preparedAt).toLocaleString() : 'Pending'}</p></div></div>
                  <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === "READY" ? 'bg-yellow-500/20' : 'bg-gray-700'}`}><IoBicycleOutline className={`w-4 h-4 ${selectedOrder.orderStatus === "READY" ? 'text-yellow-400' : 'text-gray-500'}`} /></div><div><p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Ready for Delivery</p><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{selectedOrder.readyAt ? new Date(selectedOrder.readyAt).toLocaleString() : 'Pending'}</p></div></div>
                  <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === "DELIVERED" ? 'bg-emerald-500/20' : 'bg-gray-700'}`}><IoCheckmarkCircleOutline className={`w-4 h-4 ${selectedOrder.orderStatus === "DELIVERED" ? 'text-emerald-400' : 'text-gray-500'}`} /></div><div><p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Delivered</p><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleString() : 'Pending'}</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;