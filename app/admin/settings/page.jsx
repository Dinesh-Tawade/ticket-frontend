"use client";

import React, { useMemo, useState } from "react";
import {
  getBookingSettings,
  getAllShowsAdmin,
  updateShow,
  setAllShowsPaymentMode,
  updateGlobalSettings,
} from "../../services/adminCommunication";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import useTheme from "@/app/hooks/useTheme";
import {
  FaBolt,
  FaCheckCircle,
  FaCog,
  FaEdit,
  FaExclamationTriangle,
  FaFilm,
  FaGift,
  FaInfoCircle,
  FaMoneyBillWave,
  FaSave,
  FaSpinner,
  FaTheaterMasks,
  FaTimes,
  FaToggleOn,
} from "react-icons/fa";
import { MdSettings } from "react-icons/md";

const tabs = [
  { id: "shows", label: "Show Payment Settings", icon: FaFilm },
  { id: "booking", label: "Booking Settings", icon: FaToggleOn },
  { id: "bulk", label: "Bulk Actions", icon: FaBolt },
  { id: "theaters", label: "Theater Settings", icon: FaTheaterMasks },
];

const statusStyles = {
  BOOKING_OPEN: { color: "#22c55e", label: "BOOKING OPEN" },
  BOOKING_CLOSED: { color: "#ef4444", label: "BOOKING CLOSED" },
  CANCELLED: { color: "#6b7280", label: "CANCELLED" },
  UPCOMING: { color: "#3b82f6", label: "UPCOMING" },
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div
    className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 overflow-hidden relative hover:shadow-xl hover:scale-105"
    style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    <div className="relative">
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>
        {label}
      </div>
      <div className="text-[34px] font-black tracking-tighter leading-none" style={{ color: "var(--foreground)" }}>
        {value}
      </div>
    </div>
    <div
      className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon className="text-xl" style={{ color }} />
    </div>
  </div>
);

const Pill = ({ children, color }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
  >
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
    {children}
  </span>
);

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [selectedShow, setSelectedShow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("shows");

  const { data: showsData, isLoading: showsLoading } = useQuery({
    queryKey: ["admin-shows"],
    queryFn: getAllShowsAdmin,
  });

  const { data: bookingSettingsData, isLoading: bookingSettingsLoading } = useQuery({
    queryKey: ["booking-settings"],
    queryFn: getBookingSettings,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateShow(id, data),
    onSuccess: () => {
      toast.success("Show updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-shows"] });
      setIsModalOpen(false);
      setSelectedShow(null);
    },
    onError: (error) => {
      toast.error("Failed to update show: " + error.message);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: setAllShowsPaymentMode,
    onSuccess: () => {
      toast.success("All shows updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-shows"] });
    },
    onError: (error) => {
      toast.error("Failed to update shows: " + error.message);
    },
  });

  const bookingSettingsMutation = useMutation({
    mutationFn: updateGlobalSettings,
    onSuccess: () => {
      toast.success("Booking settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["booking-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-booking-settings"] });
      queryClient.invalidateQueries({ queryKey: ["show-booking-status"] });
    },
    onError: (error) => {
      toast.error("Failed to update booking settings: " + error.message);
    },
  });

  const shows = showsData?.data || [];
  const paidShows = shows.filter((show) => show.isPaid).length;
  const freeShows = shows.length - paidShows;
  const openShows = shows.filter((show) => show.status === "BOOKING_OPEN").length;
  const isUpdatingShow = updateMutation.isPending || updateMutation.isLoading;
  const isBulkUpdating = bulkUpdateMutation.isPending || bulkUpdateMutation.isLoading;
  const bookingSettings = bookingSettingsData?.data || {};
  const isBookingEnabled = bookingSettings.isBookingEnabled === true;
  const isSavingBookingSettings = bookingSettingsMutation.isPending || bookingSettingsMutation.isLoading;

  const activeTabMeta = useMemo(() => tabs.find((tab) => tab.id === activeTab) || tabs[0], [activeTab]);

  const handleUpdateShow = (show) => {
    setSelectedShow(show);
    setIsModalOpen(true);
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updateData = {
      isPaid: formData.get("isPaid") === "true",
      basePrice: parseInt(formData.get("basePrice")) || 0,
      status: formData.get("status"),
    };
    updateMutation.mutate({ id: selectedShow._id, data: updateData });
  };

  const handleBulkUpdate = (isPaid) => {
    const mode = isPaid ? "PAID" : "FREE";
    if (window.confirm(`Are you sure you want to set ALL shows to ${mode} mode?\n\nThis will affect all existing and future shows.`)) {
      bulkUpdateMutation.mutate({ isPaid });
    }
  };

  const handleBookingSettingsSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    bookingSettingsMutation.mutate({
      isBookingEnabled: formData.get("isBookingEnabled") === "true",
      disabledReason: formData.get("disabledReason") || "Online booking is temporarily disabled.",
      maxTicketsPerBooking: Number(formData.get("maxTicketsPerBooking")) || 40,
    });
  };

  const handleBookingToggle = (isEnabled) => {
    bookingSettingsMutation.mutate({
      isBookingEnabled: isEnabled,
      disabledReason: bookingSettings.disabledReason || "Online booking is temporarily disabled.",
      maxTicketsPerBooking: bookingSettings.maxTicketsPerBooking || 40,
    });
  };

  return (
    <div className="min-h-screen transition-colors duration-300 p-4 sm:p-6" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />

      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <MdSettings className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  Admin Settings
                </h1>
                <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Manage system-wide show payment modes and theater defaults.
                </p>
              </div>
            </div>

            <div
              className="px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <FaCog className="text-blue-500" />
              {theme} mode
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Shows" value={shows.length} icon={FaFilm} color="#3b82f6" />
        <StatCard label="Paid Shows" value={paidShows} icon={FaMoneyBillWave} color="#22c55e" />
        <StatCard label="Free Shows" value={freeShows} icon={FaGift} color="#6366f1" />
        <StatCard label="Booking Open" value={openShows} icon={FaCheckCircle} color="#10b981" />
      </div>

      <div className="rounded-xl p-2 mb-6 flex flex-wrap gap-2" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300"
              style={{
                background: active ? "linear-gradient(135deg, #3b82f6, #4f46e5)" : "transparent",
                color: active ? "#ffffff" : "var(--foreground)",
                opacity: active ? 1 : 0.65,
              }}
            >
              <Icon className="text-sm" />
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "shows" && (
        <div className="space-y-6">
          <div className="rounded-xl p-5 flex gap-3 transition-all duration-300 hover:shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <FaInfoCircle className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>How it works</h3>
              <p className="text-sm leading-6" style={{ color: "var(--foreground)", opacity: 0.65 }}>
                Paid shows require payment before booking confirmation. Free shows confirm immediately without payment.
                Use Edit on any show to change its payment mode, base price, or booking status.
              </p>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "var(--card-border)" }}>
              <div className="flex items-center gap-2">
                <activeTabMeta.icon className="text-blue-500 text-lg" />
                <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>All Shows</h2>
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--foreground)", opacity: 0.55 }}>
                {shows.length} records
              </span>
            </div>

            {showsLoading ? (
              <div className="p-10 flex items-center justify-center gap-3" style={{ color: "var(--foreground)" }}>
                <FaSpinner className="animate-spin text-blue-500" />
                <span className="text-sm font-semibold">Loading shows...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ background: "var(--background)" }}>
                    <tr>
                      {["Movie", "Theater", "Date", "Time", "Mode", "Price", "Status", "Action"].map((heading) => (
                        <th key={heading} className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((show) => {
                      const status = statusStyles[show.status] || { color: "#6b7280", label: show.status?.replace("_", " ") || "N/A" };
                      return (
                        <tr key={show._id} className="transition-colors" style={{ borderTop: "1px solid var(--card-border)" }}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: "var(--foreground)" }}>
                            {show.movie?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--foreground)", opacity: 0.65 }}>
                            {show.theater?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--foreground)", opacity: 0.65 }}>
                            {new Date(show.showDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--foreground)", opacity: 0.65 }}>
                            {show.startTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Pill color={show.isPaid ? "#22c55e" : "#3b82f6"}>{show.isPaid ? "PAID" : "FREE"}</Pill>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                            {show.isPaid ? `Rs. ${show.basePrice || 0}` : "Rs. 0"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Pill color={status.color}>{status.label}</Pill>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleUpdateShow(show)}
                              className="px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all duration-300 hover:scale-105"
                              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "#3b82f6" }}
                            >
                              <FaEdit />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="space-y-6">
          <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <FaBolt className="text-yellow-500 text-lg" />
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Bulk Payment Mode Update</h2>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.65 }}>
              Update all shows at once. This will override individual show payment settings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-[1.02]" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <FaMoneyBillWave className="text-green-500 text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>Set All Shows to Paid</h3>
                <p className="text-sm mb-5" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Users will need to pay for all tickets.
                </p>
                <button
                  onClick={() => handleBulkUpdate(true)}
                  disabled={isBulkUpdating}
                  className="w-full px-4 py-3 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                >
                  {isBulkUpdating ? "Updating..." : "Make All Shows Paid"}
                </button>
              </div>

              <div className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-[1.02]" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <FaGift className="text-blue-500 text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>Set All Shows to Free</h3>
                <p className="text-sm mb-5" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  All tickets will be completely free.
                </p>
                <button
                  onClick={() => handleBulkUpdate(false)}
                  disabled={isBulkUpdating}
                  className="w-full px-4 py-3 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #4f46e5)" }}
                >
                  {isBulkUpdating ? "Updating..." : "Make All Shows Free"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 flex gap-3" style={{ background: "rgba(234, 179, 8, 0.08)", border: "1px solid rgba(234, 179, 8, 0.25)" }}>
            <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-yellow-500 mb-1">Warning</h3>
              <p className="text-sm leading-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                This action will affect all shows in the system. Existing bookings will not be affected.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "booking" && (
        <div className="space-y-6">
          <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaToggleOn className={isBookingEnabled ? "text-green-500 text-lg" : "text-red-500 text-lg"} />
                  <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Global Booking Control</h2>
                </div>
                <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.65 }}>
                  Enable or disable ticket booking for all public users.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Pill color={isBookingEnabled ? "#22c55e" : "#ef4444"}>
                  {isBookingEnabled ? "BOOKING ENABLED" : "BOOKING DISABLED"}
                </Pill>
                <button
                  type="button"
                  onClick={() => handleBookingToggle(!isBookingEnabled)}
                  disabled={isSavingBookingSettings}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isBookingEnabled
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : "linear-gradient(135deg, #22c55e, #16a34a)",
                  }}
                >
                  {isSavingBookingSettings ? <FaSpinner className="animate-spin" /> : <FaToggleOn />}
                  {isSavingBookingSettings
                    ? "Updating..."
                    : isBookingEnabled
                    ? "Disable Booking"
                    : "Enable Booking"}
                </button>
              </div>
            </div>

            {bookingSettingsLoading ? (
              <div className="p-8 flex items-center gap-3" style={{ color: "var(--foreground)" }}>
                <FaSpinner className="animate-spin text-blue-500" />
                <span className="text-sm font-semibold">Loading booking settings...</span>
              </div>
            ) : (
              <form
                key={`${isBookingEnabled}-${bookingSettings.updatedAt || "new"}`}
                onSubmit={handleBookingSettingsSubmit}
                className="space-y-4 max-w-3xl"
              >
                <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                  <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>
                    Booking Availability
                  </label>
                  <select
                    name="isBookingEnabled"
                    defaultValue={String(isBookingEnabled)}
                    className="w-full md:w-72 px-3 py-2 rounded-xl border outline-none"
                    style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  >
                    <option value="true">Enable booking for users</option>
                    <option value="false">Disable booking for users</option>
                  </select>
                </div>

                <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                  <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>
                    Disabled Message
                  </label>
                  <textarea
                    name="disabledReason"
                    defaultValue={bookingSettings.disabledReason || "Online booking is temporarily disabled."}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border outline-none resize-none"
                    style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                  <p className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.55 }}>
                    Users will see this message when booking is disabled.
                  </p>
                </div>

                <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                  <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>
                    Maximum Seats Per Booking
                  </label>
                  <input
                    type="number"
                    name="maxTicketsPerBooking"
                    min="1"
                    defaultValue={bookingSettings.maxTicketsPerBooking || 40}
                    className="w-full md:w-64 px-3 py-2 rounded-xl border outline-none"
                    style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingBookingSettings}
                  className="px-4 py-3 rounded-xl text-white font-bold flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #4f46e5)" }}
                >
                  {isSavingBookingSettings ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {isSavingBookingSettings ? "Saving..." : "Save Booking Settings"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === "theaters" && (
        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <FaTheaterMasks className="text-blue-500 text-lg" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>General Theater Settings</h2>
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.65 }}>
            Configure global theater preferences and defaults.
          </p>

          <div className="space-y-4 max-w-3xl">
            <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>
                Default Payment Mode for New Shows
              </label>
              <select className="w-full md:w-64 px-3 py-2 rounded-xl border outline-none" style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                <option value="paid">Paid (Default)</option>
                <option value="free">Free</option>
              </select>
              <p className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.55 }}>
                This setting will apply to all new shows created.
              </p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>
                Default Ticket Price (Rs.)
              </label>
              <input
                type="number"
                defaultValue="200"
                className="w-full md:w-64 px-3 py-2 rounded-xl border outline-none"
                style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              />
              <p className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.55 }}>
                Default price for new paid shows.
              </p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>
                Maximum Seats Per Booking
              </label>
              <input
                type="number"
                defaultValue="10"
                className="w-full md:w-64 px-3 py-2 rounded-xl border outline-none"
                style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              />
              <p className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.55 }}>
                Limit how many seats a user can book at once.
              </p>
            </div>

            <button className="px-4 py-3 rounded-xl text-white font-bold flex items-center gap-2 transition-all duration-300 hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #3b82f6, #4f46e5)" }}>
              <FaSave />
              Save Theater Settings
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedShow && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ background: "rgba(0, 0, 0, 0.7)" }}>
          <div className="rounded-xl p-6 max-w-md w-full shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black" style={{ color: "var(--foreground)" }}>Edit Show Payment Mode</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-105"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitUpdate}>
              <div className="mb-4 p-4 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <p className="text-sm mb-1" style={{ color: "var(--foreground)", opacity: 0.65 }}>Movie: <span className="font-bold" style={{ color: "var(--foreground)" }}>{selectedShow.movie?.name}</span></p>
                <p className="text-sm mb-1" style={{ color: "var(--foreground)", opacity: 0.65 }}>Theater: <span className="font-bold" style={{ color: "var(--foreground)" }}>{selectedShow.theater?.name}</span></p>
                <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.65 }}>Date: <span className="font-bold" style={{ color: "var(--foreground)" }}>{new Date(selectedShow.showDate).toLocaleDateString()}</span></p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>Payment Mode</label>
                <select
                  name="isPaid"
                  defaultValue={String(selectedShow.isPaid)}
                  className="w-full px-3 py-2 rounded-xl border outline-none"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  <option value="true">Paid (users must pay)</option>
                  <option value="false">Free (no payment required)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>Ticket Price (Rs.)</label>
                <input
                  type="number"
                  name="basePrice"
                  defaultValue={selectedShow.basePrice}
                  className="w-full px-3 py-2 rounded-xl border outline-none"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  min="0"
                />
                <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.55 }}>Only applicable for paid shows.</p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--foreground)" }}>Booking Status</label>
                <select
                  name="status"
                  defaultValue={selectedShow.status}
                  className="w-full px-3 py-2 rounded-xl border outline-none"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="BOOKING_OPEN">Open for Booking</option>
                  <option value="HOUSE_FULL">House Full</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="BOOKING_CLOSED">Closed for Booking</option>
                  <option value="UPCOMING">Upcoming</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border font-bold transition-all hover:scale-[1.02]"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingShow}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-bold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #4f46e5)" }}
                >
                  {isUpdatingShow ? "Updating..." : "Update Show"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettingsPage;
