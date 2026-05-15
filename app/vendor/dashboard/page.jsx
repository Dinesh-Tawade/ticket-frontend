"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  IoStorefrontOutline, 
  IoCubeOutline,
  IoCartOutline,
  IoStatsChartOutline,
  IoCashOutline,
  IoArrowUpOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoArrowForwardOutline,
  IoEyeOutline,
  IoWarningOutline
} from 'react-icons/io5';
import { getVendorDashboardStats } from '../../services/adminCommunication';
import toast from 'react-hot-toast';

function VendorDashboardPage() {
  // Fetch Dashboard Stats
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['vendor-dashboard-stats'],
    queryFn: getVendorDashboardStats,
    retry: 1,
    onError: (error) => {
      toast.error('Failed to load dashboard stats: ' + error.message);
    }
  });

  // Extract data from API response
  const dashboardData = statsData?.data || {};
  const store = dashboardData?.store || {};
  const products = dashboardData?.products || {};
  const orders = dashboardData?.orders || {};
  const revenue = dashboardData?.revenue || {};

  // Stat Cards based on actual API response
  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(revenue.total || 0).toLocaleString()}`,
      icon: <IoCashOutline className="w-6 h-6" />,
      bgGradient: 'from-green-500 to-emerald-600',
      iconColor: 'text-green-400',
      subtitle: `Today: ₹${(revenue.today || 0).toLocaleString()}`
    },
    {
      title: 'Total Orders',
      value: (orders.pending || 0) + (orders.today || 0),
      icon: <IoCartOutline className="w-6 h-6" />,
      bgGradient: 'from-blue-500 to-indigo-600',
      iconColor: 'text-blue-400',
      subtitle: `Pending: ${orders.pending || 0}`
    },
    {
      title: 'Total Products',
      value: products.total || 0,
      icon: <IoCubeOutline className="w-6 h-6" />,
      bgGradient: 'from-purple-500 to-pink-600',
      iconColor: 'text-purple-400',
      subtitle: products.lowStock > 0 ? `${products.lowStock} low stock` : 'All in stock'
    },
    {
      title: 'Store Status',
      value: store?.status === 'ACTIVE' ? 'Active' : 'Inactive',
      icon: <IoStorefrontOutline className="w-6 h-6" />,
      bgGradient: store?.status === 'ACTIVE' ? 'from-emerald-500 to-teal-600' : 'from-orange-500 to-red-600',
      iconColor: store?.status === 'ACTIVE' ? 'text-emerald-400' : 'text-orange-400',
      subtitle: store?.isOpen ? 'Open for orders' : 'Currently closed'
    },
  ];

  // Order Status Summary
  const orderStatusSummary = [
    { status: 'Pending Orders', count: orders.pending || 0, icon: <IoTimeOutline />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { status: "Today's Orders", count: orders.today || 0, icon: <IoArrowUpOutline />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  // Low Stock Warning
  const hasLowStock = products.lowStock > 0;

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <IoStorefrontOutline className="text-purple-400 text-2xl animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <IoCloseCircleOutline className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Vendor Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, <span className="text-white font-medium">{store?.name || 'Vendor'}</span>! Here's your store overview.
          </p>
        </div>
        <div className="px-3 py-2 bg-gray-800 rounded-lg">
          <span className="text-gray-400 text-sm">Today: </span>
          <span className="text-white text-sm font-medium">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Low Stock Warning */}
      {hasLowStock && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <IoWarningOutline className="text-yellow-400 text-xl" />
          <div>
            <p className="text-yellow-400 font-medium">Low Stock Alert</p>
            <p className="text-gray-400 text-sm">{products.lowStock} product(s) are running low on stock. Please restock soon.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/vendor/products'}
            className="ml-auto px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
          >
            View Products
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient}/10 backdrop-blur-sm border border-gray-700 rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.bgGradient}/20 ${card.iconColor}`}>
                  {card.icon}
                </div>
                <IoArrowForwardOutline className="text-gray-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">{card.title}</h3>
              <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              <p className="text-xs text-gray-500 mt-2">{card.subtitle}</p>
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/5 group-hover:bg-white/10 transition-all"></div>
          </div>
        ))}
      </div>

      {/* Order Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Summary */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoStatsChartOutline className="text-purple-400 text-lg" />
            <h2 className="text-lg font-semibold text-white">Order Summary</h2>
          </div>
          <div className="space-y-3">
            {orderStatusSummary.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    <div className={`${item.color}`}>{item.icon}</div>
                  </div>
                  <span className="text-gray-300">{item.status}</span>
                </div>
                <span className="text-white font-semibold text-xl">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Store Performance */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoEyeOutline className="text-blue-400 text-lg" />
            <h2 className="text-lg font-semibold text-white">Store Performance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Store Status</span>
                <span className={store?.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>
                  {store?.status === 'ACTIVE' ? '🟢 Active' : '🔴 Inactive'}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Store Availability</span>
                <span className={store?.isOpen ? 'text-green-400' : 'text-orange-400'}>
                  {store?.isOpen ? 'Open for orders' : 'Currently closed'}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Total Products</span>
                <span className="text-white font-medium">{products.total || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Today's Orders</span>
                <span className="text-white font-medium">{orders.today || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((orders.today / 100) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => window.location.href = '/vendor/products/add'}
          className="group flex items-center justify-between p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-orange-500/50 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-all">
              <IoCubeOutline className="text-orange-400 text-lg" />
            </div>
            <span className="text-white font-medium">Add New Product</span>
          </div>
          <IoArrowForwardOutline className="text-gray-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => window.location.href = '/vendor/store'}
          className="group flex items-center justify-between p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-emerald-500/50 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-all">
              <IoStorefrontOutline className="text-emerald-400 text-lg" />
            </div>
            <span className="text-white font-medium">Manage Store</span>
          </div>
          <IoArrowForwardOutline className="text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => window.location.href = '/vendor/orders'}
          className="group flex items-center justify-between p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-purple-500/50 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-all">
              <IoCartOutline className="text-purple-400 text-lg" />
            </div>
            <span className="text-white font-medium">View Orders</span>
          </div>
          {orders.pending > 0 && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              {orders.pending} pending
            </span>
          )}
          <IoArrowForwardOutline className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <IoArrowUpOutline className="text-orange-400 text-lg" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Pro Tip: Boost Your Sales</h4>
            <p className="text-gray-400 text-sm">
              Add high-quality product images and offer combo deals to increase average order value. 
              Customers love discounts and visually appealing food photos!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorDashboardPage;