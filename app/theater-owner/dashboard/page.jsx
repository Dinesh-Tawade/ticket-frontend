"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getDashboardStatsOwner } from "../../services/adminCommunication";
import {
  FaFilm,
  FaCalendarAlt,
  FaTicketAlt,
  FaRupeeSign,
  FaSpinner,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import { LiaTheaterMasksSolid } from "react-icons/lia";
import { GiTheater } from "react-icons/gi";
import { SiMyshows } from "react-icons/si";
import { MdEventSeat } from "react-icons/md";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../../i18n";
import useTheme from "@/app/hooks/useTheme";

// ==================== ANIMATED COUNTER COMPONENT ====================
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
    <div className="text-[28px] lg:text-[34px] font-black tracking-tighter leading-none transition-all duration-300">
      {count}
    </div>
  );
};

// ==================== STATS CARD COMPONENT ====================
const StatsCard = ({ label, value, icon: Icon, color, trend, trendValue }) => {
  const colorMap = {
    blue: { bg: "#3b82f615", border: "#3b82f630", text: "#3b82f6" },
    green: { bg: "#22c55e15", border: "#22c55e30", text: "#22c55e" },
    purple: { bg: "#a855f715", border: "#a855f730", text: "#a855f7" },
    yellow: { bg: "#eab30815", border: "#eab30830", text: "#eab308" },
    red: { bg: "#ef444415", border: "#ef444430", text: "#ef4444" },
    indigo: { bg: "#6366f115", border: "#6366f130", text: "#6366f1" },
    cyan: { bg: "#06b6d415", border: "#06b6d430", text: "#06b6d4" },
    emerald: { bg: "#10b98115", border: "#10b98130", text: "#10b981" },
    orange: { bg: "#f9731615", border: "#f9731630", text: "#f97316" },
  };
  const themeColor = colorMap[color] || colorMap.purple;

  return (
    <div className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <div className="flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors" style={{ color: "var(--foreground)", opacity: 0.5 }}>
          {label}
        </div>
        <AnimatedCounter value={value} />
        {trend && (
          <div className={`text-[10px] font-medium mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}%
          </div>
        )}
      </div>
      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: themeColor.bg, border: `1px solid ${themeColor.border}` }}>
        <Icon className="text-lg lg:text-xl transition-transform group-hover:scale-110" style={{ color: themeColor.text }} />
      </div>
    </div>
  );
};

// ==================== REVENUE CHART COMPONENT ====================
const RevenueChart = ({ data, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e0e0e0"} />
        <XAxis 
          dataKey="date" 
          stroke={isDark ? "#888" : "#666"} 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          stroke={isDark ? "#888" : "#666"} 
          tick={{ fontSize: 12 }}
          tickLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "8px",
            color: "var(--foreground)",
          }}
          formatter={(value) => [`₹${value}`, "Revenue"]}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#a855f7"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          name="Revenue (₹)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ==================== BOOKINGS CHART COMPONENT ====================
const BookingsChart = ({ data, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e0e0e0"} />
        <XAxis 
          dataKey="date" 
          stroke={isDark ? "#888" : "#666"} 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          stroke={isDark ? "#888" : "#666"} 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "8px",
            color: "var(--foreground)",
          }}
        />
        <Legend />
        <Bar dataKey="bookings" fill="#22c55e" radius={[8, 8, 0, 0]} name="Bookings" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ==================== SHOWS DISTRIBUTION PIE CHART ====================
const ShowsDistributionChart = ({ activeShows, upcomingShows, completedShows, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const data = [
    { name: "Active Shows", value: activeShows || 0, color: "#22c55e" },
    { name: "Upcoming Shows", value: upcomingShows || 0, color: "#eab308" },
    { name: "Completed Shows", value: completedShows || 0, color: "#6b7280" },
  ].filter(item => item.value > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No show data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: isDark ? "#888" : "#666", strokeWidth: 1 }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "8px",
            color: "var(--foreground)",
          }}
          formatter={(value) => [`${value} Shows`, "Count"]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ==================== SEAT OCCUPANCY CHART ====================
const SeatOccupancyChart = ({ totalSeats, bookedSeats, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const occupancyRate = totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0;
  const availableSeats = totalSeats - bookedSeats;

  const data = [
    { name: "Booked", value: bookedSeats || 0, color: "#a855f7" },
    { name: "Available", value: availableSeats || 0, color: "#e5e7eb" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-3xl font-bold" style={{ color: "#a855f7" }}>{occupancyRate}%</div>
        <div className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>Occupancy Rate</div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              color: "var(--foreground)",
            }}
            formatter={(value) => [`${value} Seats`, "Count"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const OwnerDashboard = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [chartType, setChartType] = useState("area");
  const [timeRange, setTimeRange] = useState("week");

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStatsOwner,
  });

  const getStats = data?.data || {};

  // Generate mock chart data (replace with actual API data)
  const generateChartData = () => {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 12;
    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        bookings: Math.floor(Math.random() * 50) + 10,
      });
    }
    return data;
  };

  const chartData = generateChartData();

  // Stats for display
  const stats = useMemo(() => ({
    totalShows: getStats.totalShows || 0,
    totalTheaters: getStats.totalTheaters || 0,
    totalScreens: getStats.totalScreens || 0,
    activeShows: getStats.activeShows || 0,
    upcomingShows: getStats.upcomingShows || 0,
    completedShows: (getStats.totalShows || 0) - (getStats.activeShows || 0) - (getStats.upcomingShows || 0),
    totalBookings: getStats.totalBookings || 0,
    totalRevenue: getStats.totalRevenue || 0,
    totalSeatsBooked: getStats.totalSeatsBooked || 0,
    totalSeats: (getStats.totalSeatsBooked || 0) * 3, // Mock total seats
  }), [getStats]);

  return (
    <div className="min-h-screen transition-colors duration-300 p-4 md:p-6 lg:p-8" style={{ background: "var(--background)" }}>
      {/* Header Section */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-6 md:mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <LiaTheaterMasksSolid className="text-white text-lg md:text-xl animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight transition-colors duration-300" style={{ color: "var(--foreground)" }}>
                  Theater Owner Dashboard
                </h1>
                <p className="text-xs font-medium transition-colors duration-300" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Welcome back! Here is what is happening with your theater today.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm border transition-all duration-300"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 12 Months</option>
              </select>
            
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto">
        {/* Stats Grid - 4 columns as per design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Shows"
            value={stats.totalShows}
            icon={SiMyshows}
            color="purple"
          />
          <StatsCard
            label="Total Theaters"
            value={stats.totalTheaters}
            icon={LiaTheaterMasksSolid}
            color="blue"
          />
          <StatsCard
            label="Total Screens"
            value={stats.totalScreens}
            icon={GiTheater}
            color="indigo"
          />
          <StatsCard
            label="Active Shows"
            value={stats.activeShows}
            icon={FaFilm}
            color="green"
          />
          <StatsCard
            label="Upcoming Shows"
            value={stats.upcomingShows}
            icon={FaCalendarAlt}
            color="yellow"
          />
          <StatsCard
            label="Total Bookings"
            value={stats.totalBookings}
            icon={FaTicketAlt}
            color="cyan"
          />
          <StatsCard
            label="Revenue"
            value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={FaRupeeSign}
            color="emerald"
          />
          <StatsCard
            label="Seats Booked"
            value={stats.totalSeatsBooked}
            icon={MdEventSeat}
            color="orange"
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 flex flex-col items-center gap-3" style={{ background: "var(--card)" }}>
            <FaSpinner className="animate-spin text-3xl" style={{ color: "var(--primary)" }} />
            <p style={{ color: "var(--foreground)" }}>Loading dashboard data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;