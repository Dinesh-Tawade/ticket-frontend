'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import {
  getMyShowsOwner,
  getTheaterShows,
  getMyTheaters,
  updateShowStatusOwner,
} from "../../services/adminCommunication";
import {
  FaSpinner,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaFilm,
  FaStar,
  FaLanguage,
  FaTag,
  FaTicketAlt,
  FaRupeeSign,
  FaInfoCircle,
  FaCheckCircle,
  FaBan,
  FaHourglassHalf,
  FaPlayCircle,
  FaFilter,
  FaCalendarWeek,
  FaTheaterMasks,
  FaChartLine,
  FaUsers,
  FaMoneyBillWave,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';
import { MdTheaters, MdLocalMovies, MdRefresh } from 'react-icons/md';
import { GiTheater } from 'react-icons/gi';
import { SiMyshows } from 'react-icons/si';

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ label, value, icon: Icon, color, trend }) => {
  const colorMap = {
    purple: "from-purple-500 to-indigo-600",
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-red-600",
    yellow: "from-yellow-500 to-amber-600",
    pink: "from-pink-500 to-rose-600",
  };
  
  return (
    <div className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl group"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${colorMap[color].split(' ')[1]} 0%, ${colorMap[color].split(' ')[3]} 100%)` }} />
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              {label}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="text-white text-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SHOW CARD COMPONENT ====================
const ShowCard = ({ show, onView, onStatusChange }) => {
  const getStatusConfig = (status) => {
    switch(status) {
      case 'BOOKING_OPEN': 
        return { color: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'Booking Open', icon: <FaPlayCircle size={12} /> };
      case 'COMING_SOON': 
        return { color: 'bg-gradient-to-r from-yellow-500 to-amber-500', text: 'Coming Soon', icon: <FaHourglassHalf size={12} /> };
      case 'HOUSE_FULL': 
        return { color: 'bg-gradient-to-r from-red-500 to-rose-500', text: 'House Full', icon: <FaBan size={12} /> };
      case 'COMPLETED': 
        return { color: 'bg-gradient-to-r from-gray-500 to-gray-600', text: 'Completed', icon: <FaCheckCircle size={12} /> };
      case 'CANCELLED': 
        return { color: 'bg-gradient-to-r from-gray-700 to-gray-800', text: 'Cancelled', icon: <FaTimes size={12} /> };
      default: 
        return { color: 'bg-gradient-to-r from-purple-500 to-indigo-600', text: status, icon: <FaInfoCircle size={12} /> };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const availableSeats = show.availableSeats || (show.totalSeats - (show.bookedSeatsCount || 0));
  const occupancyRate = show.totalSeats > 0 ? ((show.bookedSeatsCount / show.totalSeats) * 100).toFixed(0) : 0;
  const statusConfig = getStatusConfig(show.status);

  return (
    <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
      onClick={() => onView(show)}>
      
      {/* Movie Banner */}
      <div className="relative h-36 bg-gradient-to-r from-purple-600 to-indigo-600">
        {show.movie?.poster ? (
          <img src={show.movie.poster} alt={show.movie.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdLocalMovies className="text-5xl text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Rating Badge */}
        {show.movie?.rating > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-white text-xs font-medium">{show.movie.rating}</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-lg ${statusConfig.color} text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm`}>
          {statusConfig.icon}
          {statusConfig.text}
        </div>

        {/* Trending Badge */}
        {show.movie?.isTrending && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-red-500/80 backdrop-blur-sm flex items-center gap-1">
            <span className="text-white text-xs">🔥 Trending</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1 line-clamp-1" style={{ color: "var(--foreground)" }}>
          {show.movie?.name}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--background)", color: "var(--foreground)", opacity: 0.7 }}>
            {show.movie?.genre}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaLanguage size={10} /> {show.movie?.language}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaClock size={10} /> {show.movie?.duration}m
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            <FaCalendarAlt className="text-purple-400 text-xs" />
            <span className="text-xs">{formatDate(show.showDate)}</span>
            <FaClock className="text-purple-400 text-xs ml-2" />
            <span className="text-xs">{show.startTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              <GiTheater className="text-purple-400 text-xs" />
              <span className="text-xs">Screen {show.screenNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              <FaTicketAlt className="text-purple-400 text-xs" />
              <span className="text-xs font-medium">{availableSeats}/{show.totalSeats}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: "var(--foreground)", opacity: 0.5 }}>Occupancy</span>
            <span className="font-medium" style={{ color: occupancyRate > 50 ? '#22c55e' : '#f59e0b' }}>{occupancyRate}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--background)" }}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${occupancyRate}%`,
                background: `linear-gradient(90deg, ${occupancyRate > 50 ? '#22c55e' : '#f59e0b'}, ${occupancyRate > 70 ? '#10b981' : '#f97316'})`
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onView(show); }}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 hover:gap-3"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            <FaEye size={12} /> View Details
          </button>
          <select
            onClick={(e) => e.stopPropagation()}
            value={show.status}
            onChange={(e) => onStatusChange(show._id, e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all focus:outline-none"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            <option value="COMING_SOON">Coming Soon</option>
            <option value="BOOKING_OPEN">Open Booking</option>
            <option value="CANCELLED">Cancel Show</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// ==================== SHOW DETAILS MODAL ====================
const ShowDetailsModal = ({ isOpen, onClose, show }) => {
  if (!isOpen || !show) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const availableSeats = show.availableSeats || (show.totalSeats - (show.bookedSeatsCount || 0));
  const occupancyRate = show.totalSeats > 0 ? ((show.bookedSeatsCount / show.totalSeats) * 100).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative h-56 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
          {show.movie?.poster ? (
            <img src={show.movie.poster} alt={show.movie.name} className="w-full h-full object-cover rounded-t-2xl" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MdLocalMovies className="text-6xl text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-t-2xl" />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{show.movie?.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                show.status === 'BOOKING_OPEN' ? 'bg-green-500' :
                show.status === 'COMING_SOON' ? 'bg-yellow-500' :
                show.status === 'HOUSE_FULL' ? 'bg-red-500' : 'bg-gray-500'
              } text-white`}>
                {show.status?.replace('_', ' ')}
              </div>
              {show.movie?.isTrending && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/80 text-white">
                  🔥 Trending
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-xl" style={{ background: "var(--background)" }}>
              <FaStar className="mx-auto mb-1 text-yellow-500" />
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{show.movie?.rating || 'N/A'}</p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Rating</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: "var(--background)" }}>
              <FaClock className="mx-auto mb-1 text-purple-500" />
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{show.movie?.duration}m</p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Duration</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: "var(--background)" }}>
              <FaLanguage className="mx-auto mb-1 text-blue-500" />
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{show.movie?.language}</p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Language</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: "var(--background)" }}>
              <FaTicketAlt className="mx-auto mb-1 text-green-500" />
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{availableSeats}/{show.totalSeats}</p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Seats Available</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: "var(--background)" }}>
              <FaUsers className="mx-auto mb-1 text-orange-500" />
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{occupancyRate}%</p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Occupancy</p>
            </div>
          </div>

          {/* Show Schedule */}
          <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <FaCalendarWeek className="text-purple-500" /> Show Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--card)" }}>
                <FaCalendarAlt className="text-purple-500" />
                <span style={{ color: "var(--foreground)" }}>{formatDate(show.showDate)}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--card)" }}>
                <FaClock className="text-purple-500" />
                <span style={{ color: "var(--foreground)" }}>{show.startTime} - {show.endTime}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--card)" }}>
                <GiTheater className="text-purple-500" />
                <span style={{ color: "var(--foreground)" }}>Screen {show.screenNumber}</span>
              </div>
              {show.isPaid && (
                <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--card)" }}>
                  <FaMoneyBillWave className="text-purple-500" />
                  <span style={{ color: "var(--foreground)" }}>Starting from ₹{show.basePrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seat Categories */}
          {show.seatCategories && show.seatCategories.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <MdTheaters className="text-purple-500" /> Seat Categories & Pricing
              </h3>
              <div className="space-y-2">
                {show.seatCategories.map((category, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--card)" }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        category.category === 'NORMAL' ? 'bg-green-500' :
                        category.category === 'EXECUTIVE' ? 'bg-blue-500' :
                        category.category === 'PREMIUM' ? 'bg-purple-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-medium" style={{ color: "var(--foreground)" }}>{category.category}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>{category.availableSeats || category.totalSeats} seats left</span>
                      <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>₹{category.pricePerSeat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Movie Description */}
          {show.movie?.description && (
            <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
              <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <FaInfoCircle className="text-purple-500" /> About the Movie
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                {show.movie.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== FILTER BAR COMPONENT ====================
const FilterBar = ({ theaters, selectedTheater, onTheaterChange, onStatusFilter, onDateFilter, onClearFilters }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
          <FaTheaterMasks className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-sm" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            onChange={(e) => onStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            <option value="all">All Status</option>
            <option value="COMING_SOON">Coming Soon</option>
            <option value="BOOKING_OPEN">Booking Open</option>
            <option value="HOUSE_FULL">House Full</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
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

        {/* Clear Filters */}
        <button
          onClick={onClearFilters}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        >
          <FaTimes size={12} /> Clear Filters
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================
const ShowsPage = () => {
  const queryClient = useQueryClient();
  const [selectedTheater, setSelectedTheater] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedShow, setSelectedShow] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch all theaters
  const { data: theatersData, isLoading: theatersLoading } = useQuery({
    queryKey: ['my-theaters'],
    queryFn: getMyTheaters,
  });
  const theaters = theatersData?.data || [];

  // Fetch shows based on filters
  const { data: showsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['my-shows', selectedTheater],
    queryFn: async () => {
      if (selectedTheater !== 'all') {
        return await getTheaterShows(selectedTheater);
      }
      return await getMyShowsOwner();
    },
  });

  let shows = showsData?.data || [];
  
  // Apply filters
  if (statusFilter !== 'all') {
    shows = shows.filter(show => show.status === statusFilter);
  }
  if (dateFilter) {
    shows = shows.filter(show => {
      const showDate = new Date(show.showDate).toISOString().split('T')[0];
      return showDate === dateFilter;
    });
  }

  // Update show status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => updateShowStatusOwner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-shows']);
      toast.success('Show status updated successfully!', {
        icon: '✅',
        style: { background: 'var(--card)', color: 'var(--foreground)' },
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update show status', {
        icon: '❌',
        style: { background: 'var(--card)', color: 'var(--foreground)' },
      });
    },
  });

  // Stats calculations
  const totalShows = shows.length;
  const bookingOpenShows = shows.filter(s => s.status === 'BOOKING_OPEN').length;
  const comingSoonShows = shows.filter(s => s.status === 'COMING_SOON').length;
  const completedShows = shows.filter(s => s.status === 'COMPLETED').length;
  const totalBookings = shows.reduce((sum, s) => sum + (s.bookedSeatsCount || 0), 0);
  const totalRevenue = shows.reduce((sum, s) => sum + ((s.bookedSeatsCount || 0) * (s.basePrice || 100)), 0);
  const averageOccupancy = shows.length > 0 
    ? shows.reduce((sum, s) => sum + ((s.bookedSeatsCount / s.totalSeats) * 100), 0) / shows.length 
    : 0;

  const handleStatusChange = (showId, newStatus) => {
    updateStatusMutation.mutate({ id: showId, data: { status: newStatus } });
  };

  const handleView = (show) => {
    setSelectedShow(show);
    setIsDetailsModalOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
    setSelectedTheater('all');
    toast.success('Filters cleared!', {
      icon: '🔄',
      style: { background: 'var(--card)', color: 'var(--foreground)' },
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-300" style={{ background: "var(--background)" }}>
      
      {/* Toast Container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Shows" value={totalShows} icon={SiMyshows} color="purple" trend={12} />
        <StatCard label="Booking Open" value={bookingOpenShows} icon={FaPlayCircle} color="green" />
        <StatCard label="Coming Soon" value={comingSoonShows} icon={FaHourglassHalf} color="yellow" />
        <StatCard label="Completed" value={completedShows} icon={FaCheckCircle} color="blue" />
        <StatCard label="Total Bookings" value={totalBookings} icon={FaTicketAlt} color="orange" />
        <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={FaRupeeSign} color="pink" />
      </div>

      {/* Header Title & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Shows Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Manage all your movie shows, track bookings and update status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl text-sm" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <span className="font-medium" style={{ color: "var(--foreground)" }}>Avg. Occupancy: </span>
            <span className={`font-bold ${averageOccupancy > 50 ? 'text-green-500' : 'text-yellow-500'}`}>
              {averageOccupancy.toFixed(1)}%
            </span>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 hover:gap-3 disabled:opacity-50"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            <MdRefresh className={`text-base ${isFetching ? 'animate-spin' : ''}`} />
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
        onClearFilters={handleClearFilters}
      />

      {/* Loading State */}
      {(isLoading || theatersLoading) ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Loading shows...</p>
        </div>
      ) : shows.length === 0 ? (
        // Empty State
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--card)" }}>
            <SiMyshows className="text-5xl text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>No Shows Found</h3>
          <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            {selectedTheater !== 'all' 
              ? 'No shows scheduled for this theater yet.' 
              : 'You haven\'t created any shows yet.'}
          </p>
          {selectedTheater !== 'all' && (
            <button
              onClick={() => setSelectedTheater('all')}
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90"
            >
              View All Theaters
            </button>
          )}
        </div>
      ) : (
        // Shows Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {shows.map((show) => (
            <ShowCard
              key={show._id}
              show={show}
              onView={handleView}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Show Details Modal */}
      <ShowDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        show={selectedShow}
      />
    </div>
  );
};

export default ShowsPage;