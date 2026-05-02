"use client";

import React from "react";
import { FaPlus, FaFilm, FaEdit, FaTrash } from "react-icons/fa";

const ShowsPage = () => {
  const shows = [
    { id: 1, movie: "Inception", date: "2024-01-15", time: "19:00", screen: "Screen 1", price: 300, status: "active" },
    { id: 2, movie: "The Dark Knight", date: "2024-01-15", time: "21:30", screen: "Screen 2", price: 350, status: "active" },
    { id: 3, movie: "Interstellar", date: "2024-01-16", time: "18:00", screen: "Screen 1", price: 300, status: "upcoming" },
  ];

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Shows Management
          </h1>
          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Manage your theater shows and schedules
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ background: "var(--purple)" }}
        >
          <FaPlus /> Add Show
        </button>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--card)",
          borderColor: "var(--card-border)",
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Movie</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Screen</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: "var(--foreground)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show) => (
              <tr key={show.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FaFilm style={{ color: "var(--purple)" }} />
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>{show.movie}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{show.date}</td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{show.time}</td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{show.screen}</td>
                <td className="px-6 py-4 text-sm font-medium" style={{ color: "var(--green)" }}>₹{show.price}</td>
                <td className="px-6 py-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: show.status === "active" ? "rgba(74, 222, 128, 0.2)" : "rgba(192, 132, 252, 0.2)",
                      color: show.status === "active" ? "var(--green)" : "var(--purple)",
                    }}
                  >
                    {show.status === "active" ? "Active" : "Upcoming"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 rounded-lg transition-all hover:opacity-80"
                      style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--blue)" }}
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      className="p-2 rounded-lg transition-all hover:opacity-80"
                      style={{ background: "rgba(220, 38, 38, 0.1)", color: "var(--red)" }}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShowsPage;
