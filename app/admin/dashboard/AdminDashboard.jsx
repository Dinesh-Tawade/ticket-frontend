"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getDashboardStats } from "@/app/services/adminCommunication";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FaSpinner, FaUsers, FaUserCheck, FaUserShield, FaTheaterMasks, FaStore, FaUserCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
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

// Stats Card Component
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
    orange: "#f97316",
    pink: "#ec4899"
  };
  const themeColor = colorMap[color] || colorMap.blue;

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

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { data: stats = {}, refetch } = useQuery({
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

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Header Section */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className=" mx-auto px-8">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <MdDashboard className="text-white text-xl animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight transition-colors duration-300" style={{ color: "var(--foreground)" }}>
                  {t("app.Dashboard")}
                </h1>
                <p className="text-xs font-medium transition-colors duration-300" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Welcome to Admin Dashboard! Here's an overview of your platform.
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

      <div className="mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatsCard
            label={t("app.Total Users")}
            value={dashboardStats.totalUsers}
            icon={FaUsers}
            color="blue"
          />
          <StatsCard
            label={t("app.Active Users")}
            value={dashboardStats.activeUsers}
            icon={FaUserCheck}
            color="green"
          />
          <StatsCard
            label={t("app.Super Admins")}
            value={dashboardStats.superAdmins}
            icon={FaUserShield}
            color="purple"
          />
          <StatsCard
            label={t("app.Theater Owners")}
            value={dashboardStats.theaterOwners}
            icon={FaTheaterMasks}
            color="indigo"
          />
          <StatsCard
            label={t("app.Vendors")}
            value={dashboardStats.vendors}
            icon={FaStore}
            color="yellow"
          />
          <StatsCard
            label={t("app.Buyers")}
            value={dashboardStats.buyers}
            icon={FaUserCircle}
            color="red"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;