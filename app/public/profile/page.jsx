"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaTicketAlt,
  FaStar,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";
import useTheme from "@/app/hooks/useTheme";
import Header from "@/app/components/public/Header";
import Footer from "@/app/components/public/Footer";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

function ProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userData, setUserData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Check auth and load user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        const userDataParsed = JSON.parse(storedUser);
        setUserData(userDataParsed);
        // Assuming userData has the user object
        setFormData({
          name: userDataParsed.name || "",
          email: userDataParsed.email || "",
          phone: userDataParsed.phone || "",
          address: userDataParsed.address || "",
        });
        setPreviewImage(userDataParsed.profileImage || null);
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
    
    setIsCheckingAuth(false);
  }, []);

  // Load user data into form - now handled in the auth check useEffect

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      if (profileImage) {
        data.append("profilePicture", profileImage);
      }

      await axios.put(`${BE_URL}/auth/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      dispatch(getCurrentUser(true)); // Refresh user data
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
      setPreviewImage(userData.profileImage || null);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check for authentication
  const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
  const storedUser = typeof window !== "undefined" && localStorage.getItem("user");
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(212,175,55,0.1)" }}>
            <FaUser className="text-[#d4af37]" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Profile...</h2>
          <p className="text-white/50 text-sm mb-6">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  if (!hasToken || !storedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(212,175,55,0.1)" }}>
            <FaUser className="text-[#d4af37]" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Please Sign In</h2>
          <p className="text-white/50 text-sm mb-6">You need to be logged in to view your profile.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #d4af37, #b8860b)", color: "#000" }}
          >
            <FaTicketAlt size={14} />
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Header />
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <a href="/" className="opacity-60 hover:text-[#d4af37] transition-colors" style={{ color: "var(--foreground)" }}>Home</a>
            <span className="opacity-20" style={{ color: "var(--foreground)" }}>/</span>
            <span className="text-[#d4af37]">My Profile</span>
          </div>

          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}
              >
                My Profile
              </h1>
              <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Manage your account settings and preferences</p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #d4af37, #b8860b)",
                  color: "#000",
                }}
              >
                <FaEdit size={14} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{ 
              background: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.05)", 
              border: "1px solid rgba(34,197,94,0.3)" 
            }}
          >
            <FaCheckCircle className="text-green-500" />
            <span className="text-sm" style={{ color: isDark ? "#4ade80" : "#16a34a" }}>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ 
              background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)", 
              border: "1px solid rgba(239,68,68,0.3)" 
            }}
          >
            <p className="text-sm" style={{ color: isDark ? "#f87171" : "#dc2626" }}>{errorMessage}</p>
          </div>
        )}

        {/* Profile Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
          }}
        >
          {/* Gold Top Accent */}
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg, #d4af37, #f4d03f, #d4af37)" }}
          />

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div
                    className="w-28 h-28 rounded-full overflow-hidden"
                    style={{
                      border: "3px solid #d4af37",
                      boxShadow: "0 0 30px rgba(212,175,55,0.2)",
                    }}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "rgba(212,175,55,0.1)" }}
                      >
                        <FaUser className="text-[#d4af37]" size={40} />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{
                        background: "linear-gradient(135deg, #d4af37, #b8860b)",
                        border: "2px solid #1a1a1a",
                      }}
                    >
                      <FaCamera className="text-black" size={16} />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {isEditing && (
                  <p className="mt-3 text-xs opacity-40" style={{ color: "var(--foreground)" }}>Click camera icon to change photo</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium opacity-60 mb-2 uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                    <FaUser className="inline mr-2" size={12} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: "1px solid",
                      borderColor: isEditing ? "rgba(212,175,55,0.5)" : "var(--card-border)",
                      color: "var(--foreground)",
                    }}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium opacity-60 mb-2 uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                    <FaEnvelope className="inline mr-2" size={12} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3.5 rounded-xl outline-none cursor-not-allowed opacity-50"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: "1px solid var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <p className="mt-1 text-xs opacity-40" style={{ color: "var(--foreground)" }}>Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium opacity-60 mb-2 uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                    <FaPhone className="inline mr-2" size={12} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: "1px solid",
                      borderColor: isEditing ? "rgba(212,175,55,0.5)" : "var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                {/* Role Badge */}
                <div>
                  <label className="block text-xs font-medium opacity-60 mb-2 uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                    <FaStar className="inline mr-2" size={12} />
                    Account Type
                  </label>
                  <div
                    className="w-full px-4 py-3.5 rounded-xl flex items-center justify-between"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: "1px solid var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <span className="capitalize">{userData?.role?.toLowerCase() || "User"}</span>
                    <span
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: "rgba(212,175,55,0.15)",
                        color: "#d4af37",
                      }}
                    >
                      Verified
                    </span>
                  </div>
                </div>

                {/* Address - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium opacity-60 mb-2 uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                    <FaMapMarkerAlt className="inline mr-2" size={12} />
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-300 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: "1px solid",
                      borderColor: isEditing ? "rgba(212,175,55,0.5)" : "var(--card-border)",
                      color: "var(--foreground)",
                    }}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-4 mt-8 pt-6" style={{ borderTop: "1px solid var(--card-border)" }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ 
                    border: "1px solid var(--card-border)", 
                    color: "var(--foreground)",
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  }}
                >
                  <FaTimes size={14} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-70"
                  style={{
                    background: "linear-gradient(135deg, #d4af37, #b8860b)",
                    color: "#000",
                    boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
                  }}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaSave size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
              )}
            </form>
          </div>
        </div>

        {/* Stats Section */}
        {/* <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Bookings", value: userData?.bookingsCount || "0", icon: FaTicketAlt },
            { label: "Member Since", value: userData?.createdAt ? new Date(userData.createdAt).getFullYear() : "2024", icon: FaStar },
            { label: "Status", value: "Active", icon: FaCheckCircle },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-4 rounded-xl text-center"
              style={{
                background: isDark ? "rgba(212,175,55,0.05)" : "rgba(212,175,55,0.03)",
                border: "1px solid rgba(212,175,55,0.15)",
              }}
            >
              <stat.icon className="text-[#d4af37] mx-auto mb-2" size={20} />
              <div
                className="text-2xl font-bold"
                style={{ color: "#d4af37", fontFamily: "'Playfair Display', serif" }}
              >
                {stat.value}
              </div>
              <div className="text-xs opacity-40 mt-1 uppercase tracking-wide" style={{ color: "var(--foreground)" }}>{stat.label}</div>
            </div>
          ))}
        </div> */}
      </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfilePage;
