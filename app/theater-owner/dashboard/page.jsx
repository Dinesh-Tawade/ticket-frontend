"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  FaFilm,
  FaCalendarAlt,
  FaTicketAlt,
  FaDollarSign,
  FaUsers,
  FaStar,
} from "react-icons/fa";
import "../../i18n";

const TheaterOwnerDashboard = () => {
  const { t } = useTranslation();

  // Mock stats - replace with actual API calls
  const stats = {
    totalShows: 24,
    upcomingShows: 8,
    totalBookings: 156,
    revenue: 45280,
    occupancy: 78,
    avgRating: 4.5,
  };

  const quickActions = [
    { label: "Add Show", path: "/theater-owner/shows", icon: FaFilm, color: "purple" },
    { label: "View Bookings", path: "/theater-owner/bookings", icon: FaTicketAlt, color: "blue" },
    { label: "Edit Theater", path: "/theater-owner/theater", icon: FaCalendarAlt, color: "green" },
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
        Theater Owner Dashboard
      </h1>
      <p className="mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
        Welcome back! Here is what is happening with your theater today.
      </p>

      {/* Stats Grid */}
      <div
        className="grid gap-4 mb-8"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
        <StatCard
          title="Total Shows"
          value={stats.totalShows}
          icon={FaFilm}
          color="purple"
          subtitle="This month"
        />
        <StatCard
          title="Upcoming Shows"
          value={stats.upcomingShows}
          icon={FaCalendarAlt}
          color="blue"
          subtitle="Next 7 days"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={FaTicketAlt}
          color="green"
          subtitle="All time"
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          icon={FaDollarSign}
          color="indigo"
          subtitle="This month"
        />
        <StatCard
          title="Occupancy"
          value={`${stats.occupancy}%`}
          icon={FaUsers}
          color="yellow"
          subtitle="Average fill rate"
        />
        <StatCard
          title="Rating"
          value={stats.avgRating}
          icon={FaStar}
          color="red"
          subtitle="User reviews"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--foreground)" }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          {quickActions.map((action) => (
            <QuickActionButton key={action.label} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBookings />
        <UpcomingShows />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorMap = {
    purple: "#9333ea",
    blue: "#2563eb",
    green: "#16a34a",
    indigo: "#4f46e5",
    yellow: "#ca8a04",
    red: "#dc2626",
  };

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
          <p
            className="text-2xl font-bold"
            style={{ color: colorMap[color] || color }}
          >
            {value}
          </p>
          <p className="text-xs mt-1 opacity-50" style={{ color: "var(--foreground)" }}>
            {subtitle}
          </p>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ background: `${colorMap[color]}20` }}
        >
          <Icon style={{ color: colorMap[color] }} className="text-xl" />
        </div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ label, path, icon: Icon, color }) => {
  const colorMap = {
    purple: "#9333ea",
    blue: "#2563eb",
    green: "#16a34a",
  };

  return (
    <a
      href={path}
      className="flex items-center gap-3 px-5 py-3 rounded-lg border transition-all duration-200 hover:shadow-md"
      style={{
        background: "var(--card)",
        borderColor: "var(--card-border)",
        color: "var(--foreground)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <Icon style={{ color: colorMap[color] }} />
      <span className="font-medium">{label}</span>
    </a>
  );
};

const RecentBookings = () => {
  const bookings = [
    { id: 1, movie: "Inception", customer: "John Doe", seats: "A1, A2", amount: 600, time: "2 hours ago" },
    { id: 2, movie: "The Dark Knight", customer: "Jane Smith", seats: "B5", amount: 300, time: "4 hours ago" },
    { id: 3, movie: "Interstellar", customer: "Mike Johnson", seats: "C3, C4, C5", amount: 900, time: "Yesterday" },
  ];

  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        background: "var(--card)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Recent Bookings
        </h3>
        <a
          href="/theater-owner/bookings"
          className="text-sm hover:underline"
          style={{ color: "var(--purple)" }}
        >
          View All
        </a>
      </div>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: "rgba(0,0,0,0.03)" }}
          >
            <div>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>
                {booking.movie}
              </p>
              <p className="text-xs opacity-60" style={{ color: "var(--foreground)" }}>
                {booking.customer} • {booking.seats}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold" style={{ color: "var(--green)" }}>
                ₹{booking.amount}
              </p>
              <p className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>
                {booking.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UpcomingShows = () => {
  const shows = [
    { id: 1, movie: "Avatar: The Way of Water", time: "Today, 7:00 PM", screen: "Screen 1", booked: 45, total: 60 },
    { id: 2, movie: "Spider-Man: No Way Home", time: "Today, 9:30 PM", screen: "Screen 2", booked: 32, total: 60 },
    { id: 3, movie: "The Matrix Resurrections", time: "Tomorrow, 6:00 PM", screen: "Screen 1", booked: 12, total: 60 },
  ];

  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        background: "var(--card)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Upcoming Shows
        </h3>
        <a
          href="/theater-owner/shows"
          className="text-sm hover:underline"
          style={{ color: "var(--purple)" }}
        >
          Manage Shows
        </a>
      </div>
      <div className="space-y-3">
        {shows.map((show) => (
          <div
            key={show.id}
            className="p-3 rounded-lg"
            style={{ background: "rgba(0,0,0,0.03)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium" style={{ color: "var(--foreground)" }}>
                {show.movie}
              </p>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{ background: "var(--purple)", color: "white" }}
              >
                {show.screen}
              </span>
            </div>
            <p className="text-xs opacity-60 mb-2" style={{ color: "var(--foreground)" }}>
              {show.time}
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="rounded-full h-2 transition-all"
                style={{
                  width: `${(show.booked / show.total) * 100}%`,
                  background: "var(--green)",
                }}
              />
            </div>
            <p className="text-xs mt-1 opacity-60" style={{ color: "var(--foreground)" }}>
              {show.booked}/{show.total} seats booked
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheaterOwnerDashboard;
