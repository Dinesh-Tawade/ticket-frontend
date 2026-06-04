"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getDashboardStatsOwner, getMyShowsOwner, getMyTheaterBookings, getPublicShows, getMyBookings, getMe } from "../../services/adminCommunication";
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
  FaLanguage,
  FaCheckCircle,
  FaHourglassHalf,
  FaBan,
} from "react-icons/fa";
import { LiaTheaterMasksSolid } from "react-icons/lia";
import { GiTheater } from "react-icons/gi";
import { SiMyshows } from "react-icons/si";
import { MdEventSeat, MdLocalMovies } from "react-icons/md";
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

// ==================== BOOKING STATUS DISTRIBUTION CHART ====================
const BookingStatusChart = ({ confirmed, pending, cancelled, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const data = [
    { name: "Confirmed", value: confirmed || 0, color: "#22c55e" },
    { name: "Pending", value: pending || 0, color: "#eab308" },
    { name: "Cancelled", value: cancelled || 0, color: "#ef4444" },
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
        <p className="text-gray-500">No booking data available</p>
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
          formatter={(value) => [`${value} Bookings`, "Count"]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const OwnerDashboard = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [chartType, setChartType] = useState("area");
  const [timeRange, setTimeRange] = useState("week");

  const { data: dashboardData, refetch, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStatsOwner,
  });

  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getMe,
  });

  const { data: publicShowsData, isLoading: showsLoading } = useQuery({
    queryKey: ["public-shows"],
    queryFn: getPublicShows,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
  });

  const getStats = dashboardData?.data || {};
  const allShows = publicShowsData?.data || publicShowsData || [];
  const bookings = bookingsData?.data || bookingsData || [];
  const userAccessibleSeats = profileData?.data?.accessibleSeats || [];

  // Filter shows based on accessible seats (same logic as shows page)
  const getAccessibleSeatsForTheater = (theaterId) => {
    if (!theaterId || !userAccessibleSeats.length) return [];
    const theaterIdStr = theaterId?._id || theaterId;
    
    for (const access of userAccessibleSeats) {
      const accessTheaterId = access.theaterId?.$oid || access.theaterId;
      if (accessTheaterId === theaterIdStr || accessTheaterId?.toString() === theaterIdStr?.toString()) {
        if (access.isActive !== false && access.seatNumbers?.length) {
          return access.seatNumbers;
        }
      }
    }
    return [];
  };

  const shows = useMemo(() => {
    return allShows.filter(show => {
      const theaterId = show.theaterId?._id || show.theaterId;
      return getAccessibleSeatsForTheater(theaterId).length > 0;
    });
  }, [allShows, userAccessibleSeats]);

  // Generate real chart data from bookings
  const generateChartData = () => {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 12;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate revenue and bookings for this date
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.showDate || b.createdAt).toISOString().split('T')[0];
        return bookingDate === dateStr;
      });
      
      const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayRevenue,
        bookings: dayBookings.length,
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  // Calculate real stats from shows data (same logic as shows page)
  const calculateShowStats = () => {
    const now = new Date();
    const activeShows = shows.filter(show => {
      const showDate = new Date(show.showDate);
      return showDate >= now && show.status === 'ACTIVE';
    }).length;
    
    const upcomingShows = shows.filter(show => {
      const showDate = new Date(show.showDate);
      return showDate > now && show.status === 'UPCOMING';
    }).length;
    
    const completedShows = shows.filter(show => {
      const showDate = new Date(show.showDate);
      return showDate < now || show.status === 'COMPLETED';
    }).length;

    // Calculate stats from shows page
    const assignedSeats = userAccessibleSeats.reduce((total, access) => {
      if (access.isActive === false) return total;
      return total + (access.seatNumbers?.length || 0);
    }, 0);

    const theaterIds = new Set(
      shows
        .map((show) => show.theaterId?._id || show.theaterId)
        .filter(Boolean)
        .map((id) => id.toString())
    );

    const languages = new Set(
      shows
        .map((show) => show.movie?.language)
        .filter(Boolean)
    );
    
    return {
      totalShows: shows.length,
      activeShows,
      upcomingShows,
      completedShows,
      assignedSeats,
      activeTheaters: theaterIds.size,
      languages: languages.size,
    };
  };

  const showStats = calculateShowStats();

  // Calculate real stats from bookings data
  const calculateBookingStats = () => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'BOOKED').length;
    const pendingBookings = bookings.filter(b => b.bookingStatus === 'PENDING').length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;
    const totalRevenue = bookings.reduce((sum, b) => {
      if (b.bookingStatus !== 'CANCELLED') {
        return sum + (b.totalAmount || 0);
      }
      return sum;
    }, 0);
    const totalSeatsBooked = bookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      totalSeatsBooked,
    };
  };

  const bookingStats = calculateBookingStats();

  // Stats for display - combining API stats with calculated stats
  const stats = useMemo(() => ({
    // From shows page
    totalShows: showStats.totalShows || 0,
    activeShows: showStats.activeShows || 0,
    upcomingShows: showStats.upcomingShows || 0,
    completedShows: showStats.completedShows || 0,
    assignedSeats: showStats.assignedSeats || 0,
    activeTheaters: showStats.activeTheaters || 0,
    languages: showStats.languages || 0,
    // From bookings page
    totalBookings: bookingStats.totalBookings || 0,
    confirmedBookings: bookingStats.confirmedBookings || 0,
    pendingBookings: bookingStats.pendingBookings || 0,
    cancelledBookings: bookingStats.cancelledBookings || 0,
    totalRevenue: bookingStats.totalRevenue || 0,
    totalSeatsBooked: bookingStats.totalSeatsBooked || 0,
    // From dashboard API (fallback)
    totalTheaters: getStats.totalTheaters || showStats.activeTheaters || 0,
    totalScreens: getStats.totalScreens || 0,
    totalSeats: (bookingStats.totalSeatsBooked || 0) * 3, // Estimate total seats
  }), [getStats, showStats, bookingStats]);

  const isLoading = dashboardLoading || showsLoading || bookingsLoading;

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
        {/* Stats Grid - Shows Page Stats */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Shows Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              label="Available Shows"
              value={stats.totalShows}
              icon={MdLocalMovies}
              color="purple"
            />
            <StatsCard
              label="Assigned Seats"
              value={stats.assignedSeats}
              icon={MdEventSeat}
              color="orange"
            />
            <StatsCard
              label="Active Theaters"
              value={stats.activeTheaters}
              icon={GiTheater}
              color="blue"
            />
            <StatsCard
              label="Languages"
              value={stats.languages}
              icon={FaLanguage}
              color="cyan"
            />
          </div>
        </div>

        {/* Stats Grid - Show Status */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Show Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
              label="Completed Shows"
              value={stats.completedShows}
              icon={SiMyshows}
              color="gray"
            />
          </div>
        </div>

        {/* Stats Grid - Bookings Page Stats */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Bookings Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              label="Total Bookings"
              value={stats.totalBookings}
              icon={FaTicketAlt}
              color="purple"
            />
            <StatsCard
              label="Confirmed"
              value={stats.confirmedBookings}
              icon={FaCheckCircle}
              color="green"
            />
            <StatsCard
              label="Pending"
              value={stats.pendingBookings}
              icon={FaHourglassHalf}
              color="yellow"
            />
            <StatsCard
              label="Cancelled"
              value={stats.cancelledBookings}
              icon={FaBan}
              color="red"
            />
          </div>
        </div>

        {/* Stats Grid - Revenue & Seats */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Revenue & Seats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="rounded-xl p-6 transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Revenue Trend</h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              <FaChartLine />
              {timeRange === "week" ? "Last 7 Days" : timeRange === "month" ? "Last 30 Days" : "Last 12 Months"}
            </div>
          </div>
          <RevenueChart data={chartData} isLoading={isLoading} />
        </div>

        {/* Bookings Chart */}
        <div className="rounded-xl p-6 transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Bookings Trend</h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              <FaChartBar />
              {timeRange === "week" ? "Last 7 Days" : timeRange === "month" ? "Last 30 Days" : "Last 12 Months"}
            </div>
          </div>
          <BookingsChart data={chartData} isLoading={isLoading} />
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Shows Distribution Chart */}
        <div className="rounded-xl p-6 transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Shows Distribution</h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              <FaChartPie />
              By Status
            </div>
          </div>
          <ShowsDistributionChart
            activeShows={stats.activeShows}
            upcomingShows={stats.upcomingShows}
            completedShows={stats.completedShows}
            isLoading={isLoading}
          />
        </div>

        {/* Booking Status Distribution Chart */}
        <div className="rounded-xl p-6 transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Booking Status</h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              <FaChartPie />
              By Status
            </div>
          </div>
          <BookingStatusChart
            confirmed={stats.confirmedBookings}
            pending={stats.pendingBookings}
            cancelled={stats.cancelledBookings}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Seat Occupancy Chart */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="rounded-xl p-6 transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Seat Occupancy</h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              <MdEventSeat />
              {stats.totalSeatsBooked} / {stats.totalSeats} Seats
            </div>
          </div>
          <SeatOccupancyChart
            totalSeats={stats.totalSeats}
            bookedSeats={stats.totalSeatsBooked}
            isLoading={isLoading}
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