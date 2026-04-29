"use client";

import React from "react";
import { getDashboardStats } from "@/app/services/adminCommunication";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import "../../i18n";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const {
    data: stats = {},

    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

const getStats = stats?.data || {};

  console.log("Dashboard Stats:", getStats);

  // ✅ Safe percentage
  const getPercentage = (value) => {
    if (!stats?.totalUsers) return 0;
    return ((value || 0) / stats.totalUsers * 100).toFixed(1);
  };



  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8"> {t("app.Dashboard")}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ">
        <Card title={t("app.Total Users")} value={getStats?.totalUsers} />
        <Card title={t("app.Active Users")} value={getStats?.activeUsers}  />
        <Card title={t("app.Super Admins")} value={getStats?.superAdmins}  />
        <Card title={t("app.Theater Owners")} value={getStats?.theaterOwners} />
        <Card title={t("app.Vendors")} value={getStats?.vendors} />
        <Card title={t("app.Buyers")} value={getStats?.buyers} />
      </div>

      

      {/* Refresh */}
      
    </div>
  );
};

export default AdminDashboard;


/// ✅ Safe Tailwind Colors
const colorMap = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  red: "text-red-600",
  yellow: "text-yellow-600",
  indigo: "text-indigo-600",
};


const Card = ({ title, value, color }) => {
  return (
    <div className="border rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>
        {value || 0}
      </p>
    </div>
  );




  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-sm">{value}%</span>
      </div>

      <div className="w-full rounded-full h-2">
        <div
          className={`${bgMap[color]} h-2 rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};