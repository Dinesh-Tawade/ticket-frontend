"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getDashboardStats } from "@/app/services/adminCommunication";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  FaSpinner, FaUsers, FaUserCheck, FaUserShield, 
  FaTheaterMasks, FaStore, FaUserCircle, 
  FaChartLine, FaChartPie, FaChartBar, 
  FaCalendarAlt, FaDownload 
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { 
  FiTrendingUp, FiBarChart2, FiPieChart, 
  FiActivity, FiUserPlus, FiLogIn 
} from "react-icons/fi";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, RadialBarChart, 
  RadialBar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, LabelList
} from 'recharts';
import "../../i18n";
import useTheme from "@/app/hooks/useTheme";

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) return;

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
    cyan: { light: "#06b6d4", dark: "#0891b2" },
    emerald: { light: "#10b981", dark: "#059669" },
    orange: { light: "#f97316", dark: "#ea580c" },
    pink: { light: "#ec4899", dark: "#db2777" }
  };
  const themeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>{label}</div>
        <AnimatedCounter value={value} />
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `${themeColor.light}15`, border: `1px solid ${themeColor.light}30` }}>
        <Icon className="text-xl transition-transform group-hover:scale-110" style={{ color: themeColor.light }} />
      </div>
    </div>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg p-3 shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <p className="text-xs font-bold mb-1" style={{ color: "var(--foreground)" }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: stats = {}, refetch, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const getStats = stats?.data || {};

  const dashboardStats = useMemo(() => ({
    totalUsers: getStats?.totalUsers || 0,
    activeUsers: getStats?.activeUsers || 0,
    superAdmins: getStats?.superAdmins || 0,
    theaterOwners: getStats?.theaterOwners || 0,
    vendors: getStats?.vendors || 0,
    buyers: getStats?.buyers || 0,
  }), [getStats]);

  // Prepare data for different charts
  const userDistributionData = [
    { name: "Super Admins", value: dashboardStats.superAdmins, color: "#a855f7" },
    { name: "Theater Owners", value: dashboardStats.theaterOwners, color: "#6366f1" },
    { name: "Vendors", value: dashboardStats.vendors, color: "#f97316" },
    { name: "Buyers", value: dashboardStats.buyers, color: "#ef4444" },
  ];

  const userStatusData = [
    { name: "Active Users", value: dashboardStats.activeUsers, color: "#22c55e" },
    { name: "Inactive Users", value: dashboardStats.totalUsers - dashboardStats.activeUsers, color: "#6b7280" },
  ];

  const roleComparisonData = [
    { role: "Super Admin", count: dashboardStats.superAdmins, percentage: ((dashboardStats.superAdmins / dashboardStats.totalUsers) * 100).toFixed(1) },
    { role: "Theater Owner", count: dashboardStats.theaterOwners, percentage: ((dashboardStats.theaterOwners / dashboardStats.totalUsers) * 100).toFixed(1) },
    { role: "Vendor", count: dashboardStats.vendors, percentage: ((dashboardStats.vendors / dashboardStats.totalUsers) * 100).toFixed(1) },
    { role: "Buyer", count: dashboardStats.buyers, percentage: ((dashboardStats.buyers / dashboardStats.totalUsers) * 100).toFixed(1) },
  ];

  // Mock data for trends
  const monthlyTrendData = [
    { month: "Jan", users: 120, active: 95 },
    { month: "Feb", users: 135, active: 108 },
    { month: "Mar", users: 148, active: 120 },
    { month: "Apr", users: 162, active: 135 },
    { month: "May", users: 180, active: 152 },
    { month: "Jun", users: dashboardStats.totalUsers, active: dashboardStats.activeUsers },
  ];

  const weeklyActivityData = [
    { day: "Mon", newUsers: 45, logins: 320 },
    { day: "Tue", newUsers: 52, logins: 345 },
    { day: "Wed", newUsers: 48, logins: 338 },
    { day: "Thu", newUsers: 61, logins: 362 },
    { day: "Fri", newUsers: 58, logins: 358 },
    { day: "Sat", newUsers: 35, logins: 280 },
    { day: "Sun", newUsers: 28, logins: 245 },
  ];

  const radialData = [
    { name: "Fill Rate", value: (dashboardStats.activeUsers / dashboardStats.totalUsers) * 100 || 0, fill: "#3b82f6" }
  ];

  const radarData = [
    { subject: "Super Admins", A: dashboardStats.superAdmins, fullMark: 100 },
    { subject: "Theater Owners", A: dashboardStats.theaterOwners, fullMark: 500 },
    { subject: "Vendors", A: dashboardStats.vendors, fullMark: 1000 },
    { subject: "Buyers", A: dashboardStats.buyers, fullMark: 5000 },
  ];

  const chartColors = isDark ? 
    { text: "#e2e8f0", grid: "#334155", tooltip: "#1e293b" } : 
    { text: "#334155", grid: "#e2e8f0", tooltip: "#ffffff" };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      {/* Header Section */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <MdDashboard className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  {t("app.Dashboard")}
                </h1>
                <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {t("app.Welcome to Admin Dashboard! Here's an overview of your platform.")}
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border flex items-center gap-2"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <FaSpinner className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatsCard label="Total Users" value={dashboardStats.totalUsers} icon={FaUsers} color="blue" />
        <StatsCard label="Active Users" value={dashboardStats.activeUsers} icon={FaUserCheck} color="green" />
        <StatsCard label="Super Admins" value={dashboardStats.superAdmins} icon={FaUserShield} color="purple" />
        <StatsCard label="Theater Owners" value={dashboardStats.theaterOwners} icon={FaTheaterMasks} color="indigo" />
        <StatsCard label="Vendors" value={dashboardStats.vendors} icon={FaStore} color="orange" />
        <StatsCard label="Buyers" value={dashboardStats.buyers} icon={FaUserCircle} color="red" />
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Pie Chart - User Distribution */}
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-blue-500 text-xl" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>User Distribution by Role</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart - Active vs Inactive */}
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-green-500 text-xl" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>User Activity Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStatusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {userStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Role Comparison */}
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-purple-500 text-xl" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Role-wise User Count</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="role" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart - Monthly Trend */}
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-yellow-500 text-xl" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Monthly User Growth Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrendData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="month" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="active" stroke="#82ca9d" fillOpacity={1} fill="url(#colorActive)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Weekly Activity */}
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-cyan-500" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Weekly Activity Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="day" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="newUsers" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="logins" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radial Bar Chart - Fill Rate */}
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-red-500 text-xl" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>User Engagement Rate</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="100%" 
              barSize={20} 
              data={radialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                minAngle={15}
                background
                clockWise={true}
                dataKey="value"
                cornerRadius={10}
                fill="#3b82f6"
                label={{ position: 'insideStart', fill: '#fff', formatter: (value) => `${value.toFixed(0)}%` }}
              />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip formatter={(value) => `${value.toFixed(0)}%`} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart - Role Distribution */}
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-orange-500 text-xl" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Role Distribution Radar</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke={chartColors.grid} />
              <PolarAngleAxis dataKey="subject" stroke={chartColors.text} />
              <PolarRadiusAxis stroke={chartColors.text} />
              <Radar name="Users" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="text-3xl font-black" style={{ color: "var(--foreground)" }}>
            {((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100 || 0).toFixed(1)}%
          </div>
          <div className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>Active User Rate</div>
        </div>
        <div className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="text-3xl font-black" style={{ color: "var(--foreground)" }}>
            {dashboardStats.theaterOwners + dashboardStats.vendors}
          </div>
          <div className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>Business Partners</div>
        </div>
        <div className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="text-3xl font-black" style={{ color: "var(--foreground)" }}>
            {dashboardStats.buyers}
          </div>
          <div className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>Total Customers</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;