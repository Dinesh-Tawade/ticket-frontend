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
  FaSyncAlt as FaRefresh,
} from "react-icons/fa";
import { LiaTheaterMasksSolid } from "react-icons/lia";
import { GiTheater } from "react-icons/gi";
import { SiMyshows } from "react-icons/si";
import { MdEventSeat } from "react-icons/md";
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
    <div className="text-[34px] font-black tracking-tighter leading-none transition-all duration-300" style={{ color: "var(--foreground)" }}>
      {count}
    </div>
  );
};

// Stats Card Component (Same as TheaterShowsManagement)
const StatsCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    blue: "#3b82f6",
    green: "#22c55e",
    purple: "#a855f7",
    yellow: "#eab308",
    red: "#ef4444",
    indigo: "#6366f1",
    cyan: "#06b6d4",
    emerald: "#10b981",
    orange: "#f97316"
  };
  const themeColor = colorMap[color] || colorMap.purple;

  return (
    <div className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors" style={{ color: "var(--foreground)", opacity: 0.5 }}>{label}</div>
        <AnimatedCounter value={value} />
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `${themeColor}15`, border: `1px solid ${themeColor}30` }}>
        <Icon className="text-xl transition-transform group-hover:scale-110" style={{ color: themeColor }} />
      </div>
    </div>
  );
};

const OwnerDashboard = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStatsOwner,
  });

  const getStats = data?.data || {};

  // Calculate stats for display
  const stats = useMemo(() => ({
    totalShows: getStats.totalShows || 0,
    totalTheaters: getStats.totalTheaters || 0,
    totalScreens: getStats.totalScreens || 0,
    activeShows: getStats.activeShows || 0,
    upcomingShows: getStats.upcomingShows || 0,
    totalBookings: getStats.totalBookings || 0,
    totalRevenue: getStats.totalRevenue || 0,
    totalSeatsBooked: getStats.totalSeatsBooked || 0,
  }), [getStats]);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Header Section - Same as TheaterShowsManagement */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="mx-auto px-8">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <LiaTheaterMasksSolid className="text-white text-xl animate-pulse" />
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
              <button
                onClick={() => refetch()}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <FaSpinner className="text-sm" />
              </button>
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

        {/* Loading State (if needed) */}
        
      </div>
    </div>
  );
};

export default OwnerDashboard;