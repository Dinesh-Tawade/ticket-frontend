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
} from "react-icons/io5";
import { getVendorOrders, getVendorOrderDetails, updateVendorOrderStatus } from "../../services/adminCommunication";

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Audio for notifications */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      <Toaster position="top-right" />
      
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
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 shadow-2xl">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <IoCartOutline className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Orders Management</h1>
              <p className="text-gray-400 text-sm">Manage and track customer orders</p>
            </div>
          </div>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
          >
            <IoRefreshOutline className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Total Orders</p>
            <p className="text-xl font-bold text-white">{summary.totalOrders || 0}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Total Revenue</p>
            <p className="text-xl font-bold text-green-400">₹{(summary.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Pending</p>
            <p className="text-xl font-bold text-yellow-400">{summary.pendingOrders || 0}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Preparing</p>
            <p className="text-xl font-bold text-blue-400">{summary.preparingOrders || 0}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Delivered</p>
            <p className="text-xl font-bold text-emerald-400">{summary.deliveredOrders || 0}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Cancelled</p>
            <p className="text-xl font-bold text-red-400">{summary.cancelledOrders || 0}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, Phone..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <IoCloseOutline className="text-gray-500 hover:text-white" />
                </button>
              )}
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Status</option>
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
            <IoCartOutline className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
            <p className="text-gray-400">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Order ID</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Customer</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Seat</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Items</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Total</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedOrders.map((order) => {
                    const nextAction = getNextAction(order.orderStatus);
                    const seatNumbers = extractSeatNumbers(order.specialInstructions);
                    return (
                      <tr key={order._id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 text-white text-sm font-mono">{order.orderId}</td>
                        <td className="px-4 py-3">
                          <div className="text-white text-sm">{order.buyerId?.name || "N/A"}</div>
                          <div className="text-gray-500 text-xs">{order.buyerId?.phone || "N/A"}</div>
                         </td>
                        <td className="px-4 py-3 text-orange-400 text-sm font-medium">{seatNumbers}</td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{order.items?.length || 0} items</td>
                        <td className="px-4 py-3 text-white text-sm font-medium">₹{order.totalAmount}</td>
                        <td className="px-4 py-3">{getStatusBadge(order.orderStatus)}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">
                          {new Date(order.orderedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => fetchOrderDetails(order.orderId)}
                              className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                              title="View Details"
                            >
                              <IoEyeOutline className="w-4 h-4" />
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
                  className="px-3 py-1.5 bg-gray-800 rounded-lg disabled:opacity-50 text-white text-sm hover:bg-gray-700 transition"
                >
                  <IoChevronBackOutline className="w-4 h-4" />
                </button>
                <span className="px-4 py-1.5 text-white text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="px-3 py-1.5 bg-gray-800 rounded-lg disabled:opacity-50 text-white text-sm hover:bg-gray-700 transition"
                >
                  <IoChevronForwardOutline className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <p className="text-gray-400 text-xs font-mono">{selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                <IoCloseOutline className="text-gray-400 text-2xl" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer Info */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <IoPersonOutline className="text-orange-400" /> Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-gray-400 text-xs">Name</p><p className="text-white">{selectedOrder.buyerId?.name || "N/A"}</p></div>
                  <div><p className="text-gray-400 text-xs">Phone</p><p className="text-white">{selectedOrder.buyerId?.phone || "N/A"}</p></div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <IoLocationOutline className="text-orange-400" /> Delivery Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-gray-400 text-xs">Delivery Type</p><p className="text-white">{selectedOrder.deliveryType?.replace("_", " ") || "SEAT DELIVERY"}</p></div>
                  <div><p className="text-gray-400 text-xs">Payment</p><p className={`${selectedOrder.paymentStatus === "PAID" ? "text-green-400" : "text-yellow-400"}`}>{selectedOrder.paymentStatus || "PENDING"}</p></div>
                  <div><p className="text-gray-400 text-xs">Seat Number</p><p className="text-orange-400 font-semibold">{extractSeatNumbers(selectedOrder.specialInstructions)}</p></div>
                  {selectedOrder.scheduledFor && (
                    <div><p className="text-gray-400 text-xs">Scheduled For</p><p className="text-white">{new Date(selectedOrder.scheduledFor).toLocaleString()}</p></div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2"><IoReceiptOutline className="text-orange-400" /> Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <div><p className="text-white font-medium">{item.productName}</p><p className="text-gray-400 text-xs">Qty: {item.quantity} × ₹{item.price}</p></div>
                      <p className="text-white font-semibold">₹{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">₹{selectedOrder.subTotal}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Tax (5% GST)</span><span className="text-white">₹{selectedOrder.tax}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Delivery Charge</span><span className="text-white">₹{selectedOrder.deliveryCharge}</span></div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between"><span className="text-white font-bold">Total</span><span className="text-white font-bold text-xl">₹{selectedOrder.totalAmount}</span></div>
                </div>
              </div>

              {/* Update Status Section */}
              {selectedOrder.orderStatus !== "DELIVERED" && selectedOrder.orderStatus !== "CANCELLED" && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Update Order Status</h3>
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
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === "CONFIRMED" || selectedOrder.orderStatus !== "PENDING" ? 'bg-green-500/20' : 'bg-gray-700'}`}><IoCheckmarkCircleOutline className={`w-4 h-4 ${selectedOrder.orderStatus === "CONFIRMED" || selectedOrder.orderStatus !== "PENDING" ? 'text-green-400' : 'text-gray-500'}`} /></div><div><p className="text-white text-sm font-medium">Order Confirmed</p><p className="text-gray-500 text-xs">{selectedOrder.confirmedAt ? new Date(selectedOrder.confirmedAt).toLocaleString() : 'Pending'}</p></div></div>
                  <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === "PREPARING" ? 'bg-blue-500/20' : 'bg-gray-700'}`}><IoCafeOutline className={`w-4 h-4 ${selectedOrder.orderStatus === "PREPARING" ? 'text-blue-400' : 'text-gray-500'}`} /></div><div><p className="text-white text-sm font-medium">Preparing</p><p className="text-gray-500 text-xs">{selectedOrder.preparedAt ? new Date(selectedOrder.preparedAt).toLocaleString() : 'Pending'}</p></div></div>
                  <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === "READY" ? 'bg-yellow-500/20' : 'bg-gray-700'}`}><IoBicycleOutline className={`w-4 h-4 ${selectedOrder.orderStatus === "READY" ? 'text-yellow-400' : 'text-gray-500'}`} /></div><div><p className="text-white text-sm font-medium">Ready for Delivery</p><p className="text-gray-500 text-xs">{selectedOrder.readyAt ? new Date(selectedOrder.readyAt).toLocaleString() : 'Pending'}</p></div></div>
                  <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === "DELIVERED" ? 'bg-emerald-500/20' : 'bg-gray-700'}`}><IoCheckmarkCircleOutline className={`w-4 h-4 ${selectedOrder.orderStatus === "DELIVERED" ? 'text-emerald-400' : 'text-gray-500'}`} /></div><div><p className="text-white text-sm font-medium">Delivered</p><p className="text-gray-500 text-xs">{selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleString() : 'Pending'}</p></div></div>
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