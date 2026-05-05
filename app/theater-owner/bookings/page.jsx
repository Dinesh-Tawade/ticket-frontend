'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import {
  getMyTheaterBookings,
  getTheaterBookings,
  getMyTheaters,
  verifyTicket,
  markTicketAsUsed,
} from "../../services/adminCommunication";
import {
  FaSpinner,
  FaEye,
  FaSearch,
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaFilm,
  FaTicketAlt,
  FaRupeeSign,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaQrcode,
  FaDownload,
  FaPrint,
  FaFilter,
  FaArrowLeft,
  FaArrowRight,
  FaStar,
  FaTheaterMasks,
  FaUsers,
  FaMoneyBillWave,
  FaSync,
} from 'react-icons/fa';
import { MdEventSeat, MdQrCodeScanner } from 'react-icons/md';
import { GiTheater } from 'react-icons/gi';
import { SiMyshows } from 'react-icons/si';

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ label, value, icon: Icon, color, subtitle }) => {
  const colorMap = {
    purple: "from-purple-500 to-indigo-600",
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-red-600",
    yellow: "from-yellow-500 to-amber-600",
    pink: "from-pink-500 to-rose-600",
    red: "from-red-500 to-rose-600",
  };
  
  const gradientClass = colorMap[color] || colorMap.purple;
  
  return (
    <div className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl group"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${gradientClass.split(' ')[1]} 0%, ${gradientClass.split(' ')[3]} 100%)` }} />
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              {label}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>{subtitle}</p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}>
            <Icon className="text-white text-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== BOOKING CARD COMPONENT ====================
const BookingCard = ({ booking, onView, onCheckIn, isCheckInMode }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'CONFIRMED': 
        return { color: 'bg-green-500', text: 'Confirmed', icon: <FaCheckCircle size={10} /> };
      case 'PENDING': 
        return { color: 'bg-yellow-500', text: 'Pending', icon: <FaHourglassHalf size={10} /> };
      case 'CANCELLED': 
        return { color: 'bg-red-500', text: 'Cancelled', icon: <FaTimesCircle size={10} /> };
      case 'EXPIRED': 
        return { color: 'bg-gray-500', text: 'Expired', icon: <FaTimesCircle size={10} /> };
      default: 
        return { color: 'bg-gray-500', text: status, icon: null };
    }
  };

  const statusConfig = getStatusConfig(booking.bookingStatus);
  const isCheckedIn = booking.isCheckedIn || false;
  const checkedInCount = booking.checkedInSeatsCount || 0;
  const totalSeats = booking.totalSeats || booking.seats?.length || 0;

  return (
    <div className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer ${
      isCheckInMode ? 'border-2 border-purple-500/50' : ''
    }`}
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
      onClick={() => onView(booking)}>
      
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaTicketAlt className="text-purple-500 text-sm" />
            <span className="text-xs font-mono" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              {booking.bookingId}
            </span>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color} text-white`}>
            {statusConfig.icon}
            {statusConfig.text}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
          <FaUser className="text-purple-400 text-xs" />
          <span className="font-medium">{booking.userId?.name || 'Guest'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Show Info */}
        <div className="space-y-1.5">
          <h4 className="font-semibold text-sm line-clamp-1" style={{ color: "var(--foreground)" }}>
            {booking.movieName || booking.showId?.movie?.name}
          </h4>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <div className="flex items-center gap-1">
              <FaCalendarAlt size={10} />
              <span>{formatDate(booking.showDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaClock size={10} />
              <span>{booking.showTime}</span>
            </div>
          </div>
        </div>

        {/* Seat Info */}
        <div className="flex flex-wrap gap-1">
          {booking.seats?.slice(0, 4).map((seat, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-mono"
              style={{ background: "var(--background)", color: "var(--foreground)" }}>
              {seat.rowName}{seat.seatNumber}
            </span>
          ))}
          {booking.seats?.length > 4 && (
            <span className="px-2 py-0.5 rounded-md text-xs" style={{ background: "var(--background)", color: "var(--foreground)", opacity: 0.6 }}>
              +{booking.seats.length - 4}
            </span>
          )}
        </div>

        {/* Price & Check-in Status */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-1">
            <FaRupeeSign className="text-green-500 text-xs" />
            <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{booking.totalAmount}</span>
          </div>
          {isCheckInMode ? (
            <button
              onClick={(e) => { e.stopPropagation(); onCheckIn(booking); }}
              disabled={isCheckedIn}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-50"
              style={{ background: isCheckedIn ? '#22c55e20' : '#a855f7', color: isCheckedIn ? '#22c55e' : 'white' }}
            >
              {isCheckedIn ? (
                <>✅ Checked In</>
              ) : checkedInCount > 0 ? (
                <>🔄 {checkedInCount}/{totalSeats} Checked</>
              ) : (
                <>🎟️ Check In</>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs" style={{ color: isCheckedIn ? '#22c55e' : '#f59e0b' }}>
              {isCheckedIn ? (
                <>✅ All {totalSeats} seats checked in</>
              ) : checkedInCount > 0 ? (
                <>🔄 {checkedInCount}/{totalSeats} seats checked in</>
              ) : (
                <>⏳ Not checked in</>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== BOOKING DETAILS MODAL ====================
const BookingDetailsModal = ({ isOpen, onClose, booking, onCheckIn }) => {
  const [qrData, setQrData] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  if (!isOpen || !booking) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const totalSeats = booking.totalSeats || booking.seats?.length || 0;
  const checkedInCount = booking.checkedInSeatsCount || 0;
  const isFullyCheckedIn = checkedInCount === totalSeats;

  const handleSeatCheckIn = async (seat) => {
    if (seat.isSeatCheckedIn) {
      toast.error('Seat already checked in');
      return;
    }
    toast.success(`Seat ${seat.rowName}${seat.seatNumber} checked in successfully`);
  };

  const getPaymentStatusConfig = (status) => {
    switch(status) {
      case 'PAID': return { color: 'text-green-500', bg: 'bg-green-500/10', text: 'Paid' };
      case 'PENDING': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', text: 'Pending' };
      case 'FREE': return { color: 'text-blue-500', bg: 'bg-blue-500/10', text: 'Free' };
      case 'FAILED': return { color: 'text-red-500', bg: 'bg-red-500/10', text: 'Failed' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', text: status };
    }
  };

  const paymentConfig = getPaymentStatusConfig(booking.paymentStatus);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="sticky top-0 p-5 border-b flex justify-between items-center" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Booking Details</h2>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>{booking.bookingId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl p-5" style={{ background: "var(--background)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <FaUser className="text-purple-500" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <FaUser className="text-purple-400" />
                <div>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Name</p>
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>{booking.userId?.name || 'Guest'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-purple-400" />
                <div>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Email</p>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{booking.userId?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-purple-400" />
                <div>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Phone</p>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{booking.userId?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Show Info */}
          <div className="rounded-xl p-5" style={{ background: "var(--background)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <SiMyshows className="text-purple-500" /> Show Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaFilm className="text-purple-400" />
                <div>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Movie</p>
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>{booking.movieName || booking.showId?.movie?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GiTheater className="text-purple-400" />
                <div>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Theater</p>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{booking.theaterId?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-purple-400" />
                <div>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Date</p>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{formatDate(booking.showDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaClock className="text-purple-400" />
                <div>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Time</p>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{booking.showTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seats & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seats Section */}
            <div className="rounded-xl p-5" style={{ background: "var(--background)" }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <MdEventSeat className="text-purple-500" /> Booked Seats ({totalSeats})
              </h3>
              <div className="space-y-2">
                {booking.seats?.map((seat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "var(--card)" }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        seat.category === 'NORMAL' ? 'bg-green-500' :
                        seat.category === 'EXECUTIVE' ? 'bg-blue-500' :
                        seat.category === 'PREMIUM' ? 'bg-purple-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-mono font-medium" style={{ color: "var(--foreground)" }}>
                        {seat.rowName}{seat.seatNumber}
                      </span>
                      <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>({seat.category})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">₹{seat.price}</span>
                      {!isFullyCheckedIn && !seat.isSeatCheckedIn && (
                        <button
                          onClick={() => handleSeatCheckIn(seat)}
                          className="px-2 py-1 rounded-lg text-xs bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      {seat.isSeatCheckedIn && (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <FaCheckCircle size={10} /> Checked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between" style={{ borderColor: "var(--card-border)" }}>
                <span className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>Total Amount</span>
                <span className="text-xl font-bold text-green-500">₹{booking.totalAmount}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-4">
              {/* Payment Status */}
              <div className="rounded-xl p-5" style={{ background: "var(--background)" }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <FaMoneyBillWave className="text-purple-500" /> Payment Status
                </h3>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${paymentConfig.bg}`}>
                  <span className={`text-sm font-medium ${paymentConfig.color}`}>{paymentConfig.text}</span>
                </div>
                {booking.paymentId && (
                  <p className="text-xs mt-3 font-mono" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                    Transaction ID: {booking.paymentId}
                  </p>
                )}
              </div>

              {/* Check-in Action */}
              {!isFullyCheckedIn && (
                <button
                  onClick={() => onCheckIn(booking)}
                  className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> Check In All Seats
                </button>
              )}
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="rounded-xl p-5" style={{ background: "var(--background)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <FaClock className="text-purple-500" /> Booking Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <FaTicketAlt className="text-purple-500 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Booked</p>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{new Date(booking.bookedAt).toLocaleString()}</p>
                </div>
              </div>
              {booking.confirmedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FaCheckCircle className="text-green-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Confirmed</p>
                    <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{new Date(booking.confirmedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {booking.checkedInAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FaUser className="text-blue-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Checked In</p>
                    <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{new Date(booking.checkedInAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== FILTER BAR ====================
const FilterBar = ({ theaters, selectedTheater, onTheaterChange, onStatusFilter, onDateFilter, onSearch, onClearFilters }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Theater Select */}
        <div className="relative">
          <select
            value={selectedTheater}
            onChange={(e) => onTheaterChange(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            <option value="all">All Theaters</option>
            {theaters.map((theater) => (
              <option key={theater._id} value={theater._id}>{theater.name}</option>
            ))}
          </select>
          <GiTheater className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-sm" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            onChange={(e) => onStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            <option value="all">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-sm" />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            onChange={(e) => onDateFilter(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          />
          <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-sm" />
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search by booking ID or customer name..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-sm" />
        </div>

        {/* Clear Filters */}
        <button
          onClick={onClearFilters}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        >
          <FaTimes size={12} /> Clear
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================
const BookingsPage = () => {
  const queryClient = useQueryClient();
  const [selectedTheater, setSelectedTheater] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [checkInMode, setCheckInMode] = useState(false);

  // Fetch theaters
  const { data: theatersData } = useQuery({
    queryKey: ['my-theaters'],
    queryFn: getMyTheaters,
  });
  const theaters = theatersData?.data || [];

  // Fetch bookings
  const { data: bookingsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['my-bookings', selectedTheater],
    queryFn: async () => {
      if (selectedTheater !== 'all') {
        return await getTheaterBookings(selectedTheater);
      }
      return await getMyTheaterBookings();
    },
  });

  let bookings = bookingsData?.data || [];
  
  // Apply filters
  if (statusFilter !== 'all') {
    bookings = bookings.filter(b => b.bookingStatus === statusFilter);
  }
  if (dateFilter) {
    bookings = bookings.filter(b => {
      const bookingDate = new Date(b.bookedAt).toISOString().split('T')[0];
      return bookingDate === dateFilter;
    });
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    bookings = bookings.filter(b => 
      b.bookingId?.toLowerCase().includes(query) ||
      b.userId?.name?.toLowerCase().includes(query) ||
      b.userId?.email?.toLowerCase().includes(query)
    );
  }

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: ({ bookingId }) => markTicketAsUsed(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      toast.success('Check-in successful!', {
        icon: '✅',
        style: { background: 'var(--card)', color: 'var(--foreground)' },
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Check-in failed', {
        icon: '❌',
        style: { background: 'var(--card)', color: 'var(--foreground)' },
      });
    },
  });

  // Stats calculations
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
  const pendingBookings = bookings.filter(b => b.bookingStatus === 'PENDING').length;
  const cancelledBookings = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const checkedInCount = bookings.filter(b => b.isCheckedIn).length;
  const totalTickets = bookings.reduce((sum, b) => sum + (b.totalSeats || b.seats?.length || 0), 0);
  const checkedInTickets = bookings.reduce((sum, b) => sum + (b.checkedInSeatsCount || 0), 0);

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCheckIn = (booking) => {
    if (booking.isCheckedIn) {
      toast.error('All seats already checked in');
      return;
    }
    checkInMutation.mutate({ bookingId: booking.bookingId });
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
    setSearchQuery('');
    setSelectedTheater('all');
    toast.success('Filters cleared!');
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-300" style={{ background: "var(--background)" }}>
      
      <Toaster position="top-right" />

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Bookings" value={totalBookings} icon={FaTicketAlt} color="purple" />
        <StatCard label="Confirmed" value={confirmedBookings} icon={FaCheckCircle} color="green" />
        <StatCard label="Pending" value={pendingBookings} icon={FaHourglassHalf} color="yellow" />
        <StatCard label="Cancelled" value={cancelledBookings} icon={FaTimesCircle} color="red" />
        <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={FaRupeeSign} color="pink" />
        <StatCard label="Check-ins" value={`${checkedInTickets}/${totalTickets}`} icon={FaUser} color="blue" subtitle={`${checkedInCount} bookings`} />
      </div>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Booking Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            View and manage all customer bookings, check-in tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCheckInMode(!checkInMode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              checkInMode ? 'bg-purple-500 text-white' : ''
            }`}
            style={!checkInMode ? { background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" } : {}}
          >
            <MdQrCodeScanner size={16} /> {checkInMode ? 'Exit Check-in Mode' : 'Check-in Mode'}
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            <FaSync className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        theaters={theaters}
        selectedTheater={selectedTheater}
        onTheaterChange={setSelectedTheater}
        onStatusFilter={setStatusFilter}
        onDateFilter={setDateFilter}
        onSearch={setSearchQuery}
        onClearFilters={handleClearFilters}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--card)" }}>
            <FaTicketAlt className="text-5xl text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>No Bookings Found</h3>
          <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            {selectedTheater !== 'all' 
              ? 'No bookings for this theater yet.' 
              : 'No bookings available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onView={handleView}
              onCheckIn={handleCheckIn}
              isCheckInMode={checkInMode}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        booking={selectedBooking}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
};

export default BookingsPage;