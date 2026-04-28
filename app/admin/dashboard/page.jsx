"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/services/adminCommunication"; // ✅ correct import
import AOS from "aos";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fix hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Init AOS
  useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init({ duration: 800, once: true });
    }
  }, []);

  // ✅ Fetch API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        console.log("API RESPONSE:", res);

        // ✅ Safe data handling
        if (res?.data) {
          setStats(res.data);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (err) {
        console.log("API ERROR:", err);

        // 🔥 fallback data (so UI empty na lage)
        setStats({
          totalUsers: 0,
          vendors: 0,
          theaterOwners: 0,
          buyers: 0,
          superAdmins: 0,
          activeUsers: 0,
        });

        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 🚨 Prevent hydration mismatch
  if (!mounted) return null;

  // 🔄 Loader
  if (loading) {
    return (
      <div className="p-6 text-gray-500 text-lg animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">Welcome Admin 👋</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="text-red-500 bg-red-100 p-3 rounded">
          {error}
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-6">

        <Card title="Total Users" value={stats.totalUsers} color="blue" delay="0" />
        <Card title="Vendors" value={stats.vendors} color="green" delay="100" />
        <Card title="Theater Owners" value={stats.theaterOwners} color="purple" delay="200" />
        <Card title="Buyers" value={stats.buyers} color="pink" delay="0" />
        <Card title="Super Admins" value={stats.superAdmins} color="yellow" delay="100" />
        <Card title="Active Users" value={stats.activeUsers} color="teal" delay="200" />

      </div>

      {/* OVERVIEW */}
      <div
        data-aos="zoom-in"
        className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-md"
      >
        <h2 className="text-lg font-semibold mb-2">Overview</h2>
        <p className="text-gray-600">
          This dashboard shows real-time stats of your ticket booking platform.
        </p>
      </div>

    </div>
  );
}

//
// 🔥 REUSABLE CARD COMPONENT
//
function Card({ title, value, color, delay }) {
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className={`
        text-white p-6 rounded-xl shadow-lg 
        transition transform hover:scale-105
        bg-${color}-500
      `}
    >
      <h3 className="text-lg mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}