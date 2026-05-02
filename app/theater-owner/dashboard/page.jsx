"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {getDashboardStatsOwner} from "../../services/adminCommunication"

import {
  FaFilm,
  FaCalendarAlt,
  FaTicketAlt,
  FaDollarSign,
  FaUsers,
  FaStar,
  FaRupeeSign ,
} from "react-icons/fa";
import { LiaTheaterMasksSolid } from "react-icons/lia";
import { GiTheater } from "react-icons/gi";
import { SiMyshows } from "react-icons/si";
import { MdEventSeat } from "react-icons/md";

import "../../i18n";

const OwnerDashboard = () => {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStatsOwner,
  });



  // ✅ extract actual data
  const getStats = data?.data || {};
  console.log("API test",getStats);


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
          value={getStats.activeShows || 0}
          icon={FaFilm}
          color="purple"
          subtitle="This month"
        />
        <StatCard
          title="Total Theater"
          value={getStats.totalTheaters || 0}
          icon={LiaTheaterMasksSolid }
          color="purple"
          subtitle="This month"
        />
          <StatCard
          title="Total Screens"
          value={getStats.totalScreens || 0}
          icon={GiTheater}
          color="purple"
          subtitle="This month"
        />
        <StatCard
          title="Active Shows"
          value={getStats.activeShows || 0}
          icon={SiMyshows }
          color="purple"
          subtitle="This month"
        />

        <StatCard
          title="Upcoming Shows"
          value={getStats.upcomingShows || 0}
          icon={FaCalendarAlt}
          color="blue"
          subtitle="Next 7 days"
        />

        <StatCard
          title="Total Bookings"
          value={getStats.totalBookings || 0}
          icon={FaTicketAlt}
          color="green"
          subtitle="All time"
        />

        <StatCard
          title="Revenue"
          value={`₹${getStats.totalRevenue?.toLocaleString() || 0}`}
          icon={FaRupeeSign }
          color="indigo"
          subtitle="This month"
        />

        <StatCard
          title="Total Seats Booked"
          value={getStats.totalSeatsBooked || 0}
          icon={MdEventSeat }
          color="green"
          subtitle="All time"
        />


      </div>

      {/* Quick Actions */}


      {/* Static Sections */}

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

          <p className="text-2xl font-bold" style={{ color: colorMap[color] }}>
            {value}
          </p>

          <p className="text-xs mt-1 opacity-50" style={{ color: "var(--foreground)" }}>
            {subtitle}
          </p>
        </div>

        <div className="p-3 rounded-lg" style={{ background: `${colorMap[color]}20` }}>
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
    <div className="p-6 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--card-border)", boxShadow: "var(--card-shadow)" }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
        Recent Bookings
      </h3>

      {bookings.map((b) => (
        <div key={b.id} className="flex justify-between p-2">
          <span>{b.movie}</span>
          <span>₹{b.amount}</span>
        </div>
      ))}
    </div>
  );
};

const UpcomingShows = () => {
  const shows = [
    { id: 1, movie: "Avatar", booked: 45, total: 60 },
    { id: 2, movie: "Spider-Man", booked: 32, total: 60 },
  ];

  return (
    <div className="p-6 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--card-border)", boxShadow: "var(--card-shadow)" }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
        Upcoming Shows
      </h3>

      {shows.map((s) => (
        <div key={s.id} className="p-2">
          <p>{s.movie}</p>
          <div className="bg-gray-700 h-2">
            <div style={{ width: `${(s.booked / s.total) * 100}%`, background: "green", height: "100%" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default OwnerDashboard;