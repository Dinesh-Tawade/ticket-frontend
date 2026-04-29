"use client";

import React from "react";
import { getDashboardStats } from "@/app/services/adminCommunication";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import "../../i18n";

const AdminDashboard = () => {
  const { t } = useTranslation();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const getStats = stats?.data || {};

  return (
    <div className="p-6 min-h-screen">
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
        {t("app.Dashboard")}
      </h1>

      {isLoading ? (
        <div style={{ textAlign: "center" }}>Loading...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <Card title={t("app.Total Users")} value={getStats?.totalUsers} color="blue" />
          <Card title={t("app.Active Users")} value={getStats?.activeUsers} color="green" />
          <Card title={t("app.Super Admins")} value={getStats?.superAdmins} color="purple" />
          <Card title={t("app.Theater Owners")} value={getStats?.theaterOwners} color="indigo" />
          <Card title={t("app.Vendors")} value={getStats?.vendors} color="yellow" />
          <Card title={t("app.Buyers")} value={getStats?.buyers} color="red" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


/// 🎯 Card Component (global CSS driven)
const Card = ({ title, value, color = "blue" }) => {
  return (
    <div className="card">
      <p style={{ fontSize: "14px", opacity: 0.7 }}>{title}</p>

      <p className={`text-${color}`} style={{ fontSize: "28px", fontWeight: "bold" }}>
        {value || 0}
      </p>

      <div className={`accent bg-${color}`} />
    </div>
  );
};