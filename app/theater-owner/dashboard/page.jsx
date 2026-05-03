"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getDashboardStatsOwner } from "../../services/adminCommunication";
import {
  FaFilm,
  FaCalendarAlt,
  FaTicketAlt,
  FaRupeeSign,
  FaSpinner,
} from "react-icons/fa";
import { LiaTheaterMasksSolid } from "react-icons/lia";
import { GiTheater } from "react-icons/gi";
import { SiMyshows } from "react-icons/si";
import { MdEventSeat } from "react-icons/md";

import "../../i18n";

const OwnerDashboard = () => {
  const { t } = useTranslation();

  const { data, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStatsOwner,
  });

  const getStats = data?.data || {};

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl">
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

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Shows"
            value={getStats.totalShows || 0}
            icon={SiMyshows}
            color="purple"
            subtitle="All time"
          />
          <StatCard
            title="Total Theater"
            value={getStats.totalTheaters || 0}
            icon={LiaTheaterMasksSolid}
            color="blue"
            subtitle="Total venues"
          />
          <StatCard
            title="Total Screens"
            value={getStats.totalScreens || 0}
            icon={GiTheater}
            color="indigo"
            subtitle="Active screens"
          />
          <StatCard
            title="Active Shows"
            value={getStats.activeShows || 0}
            icon={FaFilm}
            color="green"
            subtitle="Currently running"
          />
          <StatCard
            title="Upcoming Shows"
            value={getStats.upcomingShows || 0}
            icon={FaCalendarAlt}
            color="yellow"
            subtitle="Next 7 days"
          />
          <StatCard
            title="Total Bookings"
            value={getStats.totalBookings || 0}
            icon={FaTicketAlt}
            color="cyan"
            subtitle="All time"
          />
          <StatCard
            title="Revenue"
            value={`₹${getStats.totalRevenue?.toLocaleString() || 0}`}
            icon={FaRupeeSign}
            color="emerald"
            subtitle="This month"
          />
          <StatCard
            title="Total Seats Booked"
            value={getStats.totalSeatsBooked || 0}
            icon={MdEventSeat}
            color="orange"
            subtitle="Total occupancy"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorMap = {
    purple: "#9333ea",
    blue: "#2563eb",
    indigo: "#6366f1",
    green: "#22c55e",
    yellow: "#eab308",
    cyan: "#06b6d4",
    emerald: "#10b981",
    orange: "#f97316",
  };

  const themeColor = colorMap[color] || colorMap.purple;

  return (
    <div
      className="p-5 rounded-xl border transition-all duration-300 hover:shadow-lg"
      style={{
        background: "var(--card)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-70 mb-1" style={{ color: "var(--foreground)" }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: themeColor }}>
            {value}
          </p>
          <p className="text-xs mt-1 opacity-50" style={{ color: "var(--foreground)" }}>
            {subtitle}
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: `${themeColor}20` }}>
          <Icon style={{ color: themeColor }} className="text-xl" />
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;