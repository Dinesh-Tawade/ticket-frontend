"use client";

import React from "react";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit } from "react-icons/fa";

const TheaterPage = () => {
  const theater = {
    name: "PVR Cinemas",
    location: "Mall of India, Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    phone: "+91 120 1234567",
    email: "contact@pvrcinemas.com",
    screens: 4,
    totalSeats: 240,
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            My Theater
          </h1>
          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Manage your theater details and information
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ background: "var(--purple)" }}
        >
          <FaEdit /> Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="p-6 rounded-xl border"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
          }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Theater Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(147, 51, 234, 0.1)" }}
              >
                <FaBuilding style={{ color: "var(--purple)", fontSize: "1.25rem" }} />
              </div>
              <div>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Theater Name</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{theater.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(37, 99, 235, 0.1)" }}
              >
                <FaMapMarkerAlt style={{ color: "var(--blue)", fontSize: "1.25rem" }} />
              </div>
              <div>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Address</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{theater.location}</p>
                <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {theater.city}, {theater.state}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(22, 163, 74, 0.1)" }}
              >
                <FaPhone style={{ color: "var(--green)", fontSize: "1.25rem" }} />
              </div>
              <div>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Contact Number</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{theater.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(220, 38, 38, 0.1)" }}
              >
                <FaEnvelope style={{ color: "var(--red)", fontSize: "1.25rem" }} />
              </div>
              <div>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Email</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{theater.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-xl border"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
          }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Theater Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-lg text-center"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-3xl font-bold mb-1" style={{ color: "var(--purple)" }}>{theater.screens}</p>
              <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Total Screens</p>
            </div>
            <div
              className="p-4 rounded-lg text-center"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-3xl font-bold mb-1" style={{ color: "var(--blue)" }}>{theater.totalSeats}</p>
              <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Total Seats</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterPage;
