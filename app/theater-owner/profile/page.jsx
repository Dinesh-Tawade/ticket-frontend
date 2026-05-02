"use client";

import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaEdit } from "react-icons/fa";

const ProfilePage = () => {
  const profile = {
    name: "Rajesh Kumar",
    email: "rajesh@pvrcinemas.com",
    phone: "+91 98765 43210",
    role: "THEATER_OWNER",
    theater: "PVR Cinemas",
    joinedDate: "January 2023",
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            My Profile
          </h1>
          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Manage your personal information
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ background: "var(--purple)" }}
        >
          <FaEdit /> Edit Profile
        </button>
      </div>

      <div className="max-w-2xl">
        <div
          className="p-6 rounded-xl border"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="flex items-center gap-6 mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: "var(--purple)", color: "white" }}
            >
              {profile.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
                {profile.name}
              </h2>
              <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
                {profile.role.replace("_", " ")}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--blue)" }}>
                Member since {profile.joinedDate}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <FaUser style={{ color: "var(--purple)", fontSize: "1.25rem" }} />
              <div>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Full Name</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{profile.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <FaEnvelope style={{ color: "var(--blue)", fontSize: "1.25rem" }} />
              <div>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Email Address</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <FaPhone style={{ color: "var(--green)", fontSize: "1.25rem" }} />
              <div>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Phone Number</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{profile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <FaBuilding style={{ color: "var(--indigo)", fontSize: "1.25rem" }} />
              <div>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Theater</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{profile.theater}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
