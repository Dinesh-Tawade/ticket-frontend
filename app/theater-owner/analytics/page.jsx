"use client";

import React from "react";
import { FaChartLine, FaTicketAlt, FaDollarSign, FaUsers, FaCalendarAlt } from "react-icons/fa";

const AnalyticsPage = () => {
  const stats = [
    { label: "Total Revenue", value: "₹4,52,800", change: "+12%", icon: FaDollarSign, color: "green" },
    { label: "Total Bookings", value: "1,245", change: "+8%", icon: FaTicketAlt, color: "blue" },
    { label: "Average Occupancy", value: "78%", change: "+5%", icon: FaUsers, color: "purple" },
    { label: "Shows This Month", value: "48", change: "+15%", icon: FaCalendarAlt, color: "yellow" },
  ];

  const monthlyRevenue = [
    { month: "Jan", amount: 42000 },
    { month: "Feb", amount: 38000 },
    { month: "Mar", amount: 52000 },
    { month: "Apr", amount: 48000 },
    { month: "May", amount: 61000 },
    { month: "Jun", amount: 55000 },
  ];

  const topMovies = [
    { name: "Inception", bookings: 245, revenue: 73500 },
    { name: "The Dark Knight", bookings: 198, revenue: 59400 },
    { name: "Interstellar", bookings: 156, revenue: 46800 },
    { name: "Avatar", bookings: 134, revenue: 40200 },
  ];

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          Analytics
        </h1>
        <p style={{ color: "var(--foreground)", opacity: 0.6 }}>
          Insights and statistics for your theater performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon style={{ color: `var(--${stat.color})`, fontSize: "1.5rem" }} />
              <span style={{ color: `var(--${stat.color})` }} className="text-sm font-medium">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              {stat.value}
            </p>
            <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-6 rounded-xl border"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Monthly Revenue
          </h2>
          <div className="space-y-4">
            {monthlyRevenue.map((item) => (
              <div key={item.month} className="flex items-center gap-4">
                <span className="w-10 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {item.month}
                </span>
                <div className="flex-1 h-8 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.amount / 65000) * 100}%`,
                      background: "var(--purple)",
                    }}
                  />
                </div>
                <span className="w-20 text-right text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  ₹{(item.amount / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-6 rounded-xl border"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Top Performing Movies
          </h2>
          <div className="space-y-3">
            {topMovies.map((movie, index) => (
              <div
                key={movie.name}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: index < 3 ? "var(--purple)" : "var(--card-border)",
                      color: "white",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium" style={{ color: "var(--foreground)" }}>
                    {movie.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: "var(--green)" }}>
                    ₹{movie.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs opacity-60" style={{ color: "var(--foreground)" }}>
                    {movie.bookings} bookings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
