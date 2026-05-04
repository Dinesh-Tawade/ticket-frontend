"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../../services/adminCommunication";
import {
  FaFilm,
  FaCalendarAlt,
  FaTicketAlt,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaUser,
  FaCreditCard,
  FaIdCard,
  FaBuilding,
} from "react-icons/fa";
import { MdEventSeat, MdMovie, MdLocationOn, MdTheaters } from "react-icons/md";
import { GiTheaterCurtains } from "react-icons/gi";
import useTheme from "@/app/hooks/useTheme";

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) return;

    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-[34px] font-black tracking-tighter leading-none transition-all duration-300" style={{ color: "var(--foreground)" }}>
      {count}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    blue: "#3b82f6",
    green: "#22c55e",
    purple: "#a855f7",
    yellow: "#eab308",
    red: "#ef4444",
    indigo: "#6366f1"
  };
  const themeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors" style={{ color: "var(--foreground)", opacity: 0.5 }}>{label}</div>
        <AnimatedCounter value={value} />
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `${themeColor}15`, border: `1px solid ${themeColor}30` }}>
        <Icon className="text-xl transition-transform group-hover:scale-110" style={{ color: themeColor }} />
      </div>
    </div>
  );
};

const TheaterBookingsManagement = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: bookingsData,
   
    refetch,
  } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-700";
      case "PENDING":
        return "bg-yellow-700 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "FAILED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getFilteredBookings = () => {
    if (!bookingsData?.data) return [];

    let filtered = [...bookingsData.data];

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((booking) => booking.bookingStatus === filterStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.movieName?.toLowerCase().includes(term) ||
          booking.bookingId?.toLowerCase().includes(term) ||
          booking.userId?.name?.toLowerCase().includes(term) ||
          booking.userId?.email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredBookings = getFilteredBookings();
  const summary = bookingsData?.summary;
  const hasFilters = searchTerm || filterStatus !== "ALL";

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterStatus("ALL");
  }, []);


  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="pl-5 pr-5">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <GiTheaterCurtains className="text-white text-xl animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight transition-colors duration-300" style={{ color: "var(--foreground)" }}>
                  Theater Bookings
                </h1>
                <p className="text-xs font-medium transition-colors duration-300" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Manage and track all your theater bookings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <FaSpinner className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5 mx-auto">
        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatsCard label="Total Bookings" value={summary.totalBookings} icon={FaTicketAlt} color="blue" />
            <StatsCard label="Total Revenue" value={`₹${summary.totalRevenue?.toLocaleString() || 0}`} icon={FaRupeeSign} color="green" />
            <StatsCard label="Confirmed" value={summary.confirmedBookings} icon={FaCheckCircle} color="green" />
            <StatsCard label="Cancelled" value={summary.cancelledBookings} icon={FaTimesCircle} color="red" />
            <StatsCard label="Total Seats" value={summary.totalSeatsBooked} icon={MdEventSeat} color="purple" />
          </div>
        )}

        {/* Search and Filters */}
        <div className="rounded-xl p-5 mb-8 flex flex-wrap gap-3 items-center shadow-lg transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex-1 min-w-[220px] relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--foreground)", opacity: 0.4 }} />
            <input
              type="text"
              placeholder="Search by movie, booking ID, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "bg-transparent border border-card-border hover:bg-white/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-transparent text-red-500 font-bold text-xs flex items-center gap-1.5 hover:bg-red-500/10 transition-all duration-300 hover:scale-105"
            >
              <FaTimes className="text-[10px]" /> Clear
            </button>
          )}

          <div className="ml-auto text-xs font-semibold" style={{ color: "var(--foreground)", opacity: 0.4 }}>
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl text-center py-16 px-8 shadow-xl transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "var(--background)" }}>
              <FaTicketAlt className="text-3xl" style={{ color: "var(--foreground)", opacity: 0.2 }} />
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--foreground)" }}>No bookings found</h3>
            <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              {hasFilters ? "Try adjusting your filters" : "Bookings will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking, idx) => (
              <div
                key={booking._id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <BookingCard
                  booking={booking}
                  isExpanded={selectedBooking === booking._id}
                  onToggle={() => setSelectedBooking(selectedBooking === booking._id ? null : booking._id)}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                  getStatusBadgeStyle={getStatusBadgeStyle}
                  getPaymentStatusStyle={getPaymentStatusStyle}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Booking Card Component
const BookingCard = ({
  booking,
  isExpanded,
  onToggle,
  formatDate,
  formatDateTime,
  getStatusBadgeStyle,
  getPaymentStatusStyle,
}) => {
  return (
    <div
      className="group rounded-2xl overflow-hidden flex flex-col shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
      onClick={onToggle}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
                <MdMovie className="text-blue-500 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                  {booking.movieName}
                </h3>
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  <FaIdCard className="text-xs" />
                  <span>{booking.bookingId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Section */}
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>User</div>
              <div className="flex items-center gap-1 mt-1">
                <FaUser className="text-blue-500 text-xs" />
                <span className="font-medium" style={{ color: "var(--foreground)" }}>{booking.userId?.name}</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>{booking.userId?.email}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Show Date & Time</div>
              <div className="flex items-center gap-1 mt-1">
                <FaCalendarAlt className="text-blue-500 text-xs" />
                <span style={{ color: "var(--foreground)" }}>{formatDate(booking.showDate)}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <FaClock className="text-blue-500 text-xs" />
                <span style={{ color: "var(--foreground)" }}>{booking.showTime}</span>
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Seats & Amount</div>
              <div className="flex items-center gap-1 mt-1">
                <MdEventSeat className="text-blue-500 text-xs" />
                <span style={{ color: "var(--foreground)" }}>{booking.totalSeats} seats</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <FaRupeeSign className="text-green-500 text-xs" />
                <span className="font-semibold text-green-600 dark:text-green-400">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Right Section - Status Badges */}
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(booking.bookingStatus)}`}>
              {booking.bookingStatus}
            </span>
  
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t p-5 transition-all duration-300" style={{ borderColor: "var(--card-border)", background: "rgba(0,0,0,0.02)" }}>
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <FaTicketAlt className="text-blue-500 text-sm" />
              Booking Details
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted">Booked At:</span>
                <span className="ml-2" style={{ color: "var(--foreground)" }}>{formatDateTime(booking.bookedAt)}</span>
              </div>
              <div>
                <span className="text-muted">Expires At:</span>
                <span className="ml-2" style={{ color: "var(--foreground)" }}>{formatDateTime(booking.expiresAt)}</span>
              </div>
              {booking.cancelledAt && (
                <div>
                  <span className="text-muted">Cancelled At:</span>
                  <span className="ml-2" style={{ color: "var(--foreground)" }}>{formatDateTime(booking.cancelledAt)}</span>
                </div>
              )}
              {booking.cancelledBy && (
                <div>
                  <span className="text-muted">Cancelled By:</span>
                  <span className="ml-2" style={{ color: "var(--foreground)" }}>{booking.cancelledBy}</span>
                </div>
              )}
            </div>

            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <MdEventSeat className="text-blue-500" />
                Seat Details:
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {booking.seats?.map((seat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                  >
                    <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Row {seat.rowName}, Seat {seat.seatNumber}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                      {seat.category} - ₹{seat.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                <FaCreditCard className="text-blue-500" />
                <span>Payment ID: {booking.bookingId}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterBookingsManagement;