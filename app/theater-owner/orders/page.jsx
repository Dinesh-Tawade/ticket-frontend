import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaRupeeSign, FaBox, FaCheckCircle, FaTimesCircle, FaSpinner, FaHourglassHalf, FaTruck } from 'react-icons/fa';
import axios from 'axios';
import { BE_URL, getAuthHeader } from '@/utils/api';

const TheaterOwnerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BE_URL}/theater-owner/orders`, getAuthHeader());
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`${BE_URL}/theater-owner/orders/${orderId}`, getAuthHeader());
      if (res.data.success) {
        setSelectedOrder(res.data.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { bg: 'bg-yellow-500/20', color: 'text-yellow-400', icon: FaHourglassHalf, label: 'Pending' },
      'CONFIRMED': { bg: 'bg-blue-500/20', color: 'text-blue-400', icon: FaCheckCircle, label: 'Confirmed' },
      'PREPARING': { bg: 'bg-purple-500/20', color: 'text-purple-400', icon: FaSpinner, label: 'Preparing' },
      'READY': { bg: 'bg-orange-500/20', color: 'text-orange-400', icon: FaBox, label: 'Ready' },
      'DELIVERED': { bg: 'bg-green-500/20', color: 'text-green-400', icon: FaCheckCircle, label: 'Delivered' },
      'CANCELLED': { bg: 'bg-red-500/20', color: 'text-red-400', icon: FaTimesCircle, label: 'Cancelled' },
      'SCHEDULED': { bg: 'bg-indigo-500/20', color: 'text-indigo-400', icon: FaCalendarAlt, label: 'Scheduled' },
    };
    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.specialInstructions?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || order.orderStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Extract seat numbers
  const extractSeatNumbers = (specialInstructions) => {
    if (!specialInstructions) return 'N/A';
    const match = specialInstructions.match(/seat\s+([A-Z0-9,\s]+)/i);
    return match ? match[1].trim() : specialInstructions;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <FaBox className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <p className="text-gray-400 text-sm">Track your food orders</p>
            </div>
          </div>
          <button 
            onClick={fetchOrders} 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
          >
            <FaClock /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Total Orders</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{orders.filter(o => o.orderStatus === 'PENDING').length}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Preparing</p>
            <p className="text-2xl font-bold text-blue-400">{orders.filter(o => o.orderStatus === 'PREPARING').length}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Delivered</p>
            <p className="text-2xl font-bold text-green-400">{orders.filter(o => o.orderStatus === 'DELIVERED').length}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="Search by Order ID or Seat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
            <FaBox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
            <p className="text-gray-400">Your food orders will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Order ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Seat</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Items</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Total</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-white text-sm font-mono">{order.orderId}</td>
                    <td className="px-4 py-3 text-orange-400 text-sm font-medium">{extractSeatNumbers(order.specialInstructions)}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{order.items?.length || 0} items</td>
                    <td className="px-4 py-3 text-white text-sm font-medium"><FaRupeeSign /> {order.totalAmount}</td>
                    <td className="px-4 py-3">{getStatusBadge(order.orderStatus)}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(order.orderedAt).toLocaleDateString()}
                      {order.scheduledFor && (
                        <div className="text-xs text-indigo-400 mt-1">
                          <FaCalendarAlt className="inline mr-1" />
                          {new Date(order.scheduledFor).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => fetchOrderDetails(order.orderId)}
                        className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <FaTimesCircle className="text-gray-400 text-2xl" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Status</h3>
                <div className="text-2xl">{getStatusBadge(selectedOrder.orderStatus)}</div>
                {selectedOrder.scheduledFor && selectedOrder.orderStatus === 'SCHEDULED' && (
                  <p className="text-indigo-400 text-sm mt-2">
                    <FaCalendarAlt className="inline mr-1" />
                    Scheduled for: {new Date(selectedOrder.scheduledFor).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-orange-400" /> Delivery Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-gray-400 text-xs">Delivery Type</p><p className="text-white">{selectedOrder.deliveryType?.replace("_", " ") || "SEAT DELIVERY"}</p></div>
                  <div><p className="text-gray-400 text-xs">Seat Number</p><p className="text-orange-400 font-semibold">{extractSeatNumbers(selectedOrder.specialInstructions)}</p></div>
                  <div><p className="text-gray-400 text-xs">Payment Method</p><p className="text-white">{selectedOrder.paymentMethod}</p></div>
                  <div><p className="text-gray-400 text-xs">Payment Status</p><p className={`${selectedOrder.paymentStatus === "PAID" ? "text-green-400" : "text-yellow-400"}`}>{selectedOrder.paymentStatus || "PENDING"}</p></div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2"><FaBox className="text-orange-400" /> Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <div><p className="text-white font-medium">{item.productName}</p><p className="text-gray-400 text-xs">Qty: {item.quantity} × <FaRupeeSign /> {item.price}</p></div>
                      <p className="text-white font-semibold"><FaRupeeSign /> {item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white"><FaRupeeSign /> {selectedOrder.subTotal}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Tax (5% GST)</span><span className="text-white"><FaRupeeSign /> {selectedOrder.tax}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Delivery Charge</span><span className="text-white"><FaRupeeSign /> {selectedOrder.deliveryCharge}</span></div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between"><span className="text-white font-bold">Total</span><span className="text-white font-bold text-xl"><FaRupeeSign /> {selectedOrder.totalAmount}</span></div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Order Date</span><span className="text-white">{new Date(selectedOrder.orderedAt).toLocaleString()}</span></div>
                  {selectedOrder.scheduledFor && (
                    <div className="flex justify-between"><span className="text-gray-400">Scheduled For</span><span className="text-white">{new Date(selectedOrder.scheduledFor).toLocaleString()}</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterOwnerOrdersPage;
