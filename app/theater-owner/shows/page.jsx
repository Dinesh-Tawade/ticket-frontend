"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showService } from "../../services/adminCommunication";
import { FaSyncAlt as FaRefresh } from "react-icons/fa";
import {
  FaFilm,
  FaCalendarAlt,
  FaTicketAlt,
  FaRupeeSign,
  FaEye,
  FaEdit,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaStar,
  FaTheaterMasks,
  FaChartLine,
  FaArrowRight,
  FaSpinner,
  FaPlus,
  FaSearch,
  FaTimes,
  FaBuilding,
} from "react-icons/fa";
import { MdEventSeat, MdMovie, MdScreenShare, MdLocationOn, MdTheaters } from "react-icons/md";
import { GiTheater, GiTheaterCurtains } from "react-icons/gi";
import { SiMyshows } from "react-icons/si";
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

const TheaterShowsManagement = () => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedShow, setSelectedShow] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [localShows, setLocalShows] = useState(null);
  const [selectedTheater, setSelectedTheater] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const {
    data: showsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-shows"],
    queryFn: showService.getMyShows,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (showsData?.data) {
      setLocalShows(showsData);
    }
  }, [showsData]);

  const updateStatusMutation = useMutation({
    mutationFn: showService.updateShowStatus,
    onSuccess: (response, variables) => {
      if (localShows?.data) {
        const updatedShows = localShows.data.map((show) =>
          show._id === variables.id
            ? { ...show, status: variables.data.status }
            : show
        );
        setLocalShows({ ...localShows, data: updatedShows });
      }
      queryClient.invalidateQueries({ queryKey: ["my-shows"] });
      toast.success(`Show status updated to ${getStatusDisplayText(variables.data.status)}`);
      setSelectedShow(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const getStatusDisplayText = (status) => {
    const statusMap = {
      COMING_SOON: "Coming Soon",
      BOOKING_OPEN: "Booking Open",
      CANCELLED: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'COMING_SOON':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'BOOKING_OPEN':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const groupShowsByTheater = (shows) => {
    if (!shows || !shows.data) return {};
    const grouped = {};
    shows.data.forEach((show) => {
      const theaterId = show.theaterId?._id || show.theaterId;
      if (!grouped[theaterId]) {
        grouped[theaterId] = {
          theaterInfo: show.theaterId,
          shows: [],
        };
      }
      grouped[theaterId].shows.push(show);
    });
    return grouped;
  };

  const getBookingStats = (show) => {
    let totalSeats = 0;
    let bookedSeats = 0;
    show.seatCategories?.forEach((category) => {
      category.rows?.forEach((row) => {
        row.seats?.forEach((seat) => {
          totalSeats++;
          if (seat.isBooked) bookedSeats++;
        });
      });
    });
    const availableSeats = totalSeats - bookedSeats;
    const occupancyRate = totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0;
    return { totalSeats, bookedSeats, availableSeats, occupancyRate };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleUpdateStatus = async (showId, status) => {
    if (localShows?.data) {
      const optimisticShows = localShows.data.map((show) =>
        show._id === showId ? { ...show, status: status } : show
      );
      setLocalShows({ ...localShows, data: optimisticShows });
    }
    updateStatusMutation.mutate({ id: showId, data: { status } });
  };

  const statusOptions = [
    { value: "COMING_SOON", label: "Coming Soon", color: "yellow" },
    { value: "BOOKING_OPEN", label: "Booking Open", color: "green" },
    { value: "CANCELLED", label: "Cancelled", color: "red" },
  ];

  const getUniqueTheaters = () => {
    if (!showsData?.data) return [];
    const theaters = new Set();
    showsData.data.forEach((show) => {
      const theaterName = show.theaterId?.name || "Unknown Theater";
      theaters.add(theaterName);
    });
    return Array.from(theaters);
  };

  const getFilteredShows = () => {
    if (!displayData?.data) return displayData;
    
    let filtered = [...displayData.data];
    
    if (selectedTheater !== "all") {
      filtered = filtered.filter((show) => {
        const theaterName = show.theaterId?.name || "Unknown Theater";
        return theaterName === selectedTheater;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((show) =>
        show.movie?.name?.toLowerCase().includes(term) ||
        show.theaterId?.name?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((show) => show.status === statusFilter);
    }
    
    return { ...displayData, data: filtered };
  };

  const displayData = localShows || showsData;
  const filteredDisplayData = getFilteredShows();
  const groupedShows = groupShowsByTheater(filteredDisplayData);
  const hasShows = filteredDisplayData?.data && filteredDisplayData.data.length > 0;
  const uniqueTheaters = getUniqueTheaters();

  const stats = useMemo(() => ({
    totalShows: filteredDisplayData?.data?.length || 0,
    theaters: uniqueTheaters.length,
    totalBookedSeats: filteredDisplayData?.data?.reduce((sum, show) => {
      const stats = getBookingStats(show);
      return sum + stats.bookedSeats;
    }, 0),
    totalRevenue: filteredDisplayData?.data?.reduce((sum, show) => {
      const stats = getBookingStats(show);
      return sum + (stats.bookedSeats * 200);
    }, 0),
  }), [filteredDisplayData, uniqueTheaters]);

  const hasFilters = searchTerm || selectedTheater !== "all" || statusFilter !== "ALL";
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTheater("all");
    setStatusFilter("ALL");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-indigo-500 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          </div>
          <p className="font-semibold text-sm animate-pulse" style={{ color: "var(--foreground)", opacity: 0.6 }}>Loading shows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
        <div className="rounded-2xl max-w-md w-full text-center p-8 shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "var(--background)" }}>
            <FaFilm className="text-3xl" style={{ color: "var(--foreground)", opacity: 0.2 }} />
          </div>
          <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--foreground)" }}>Failed to Load</h3>
          <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>{error.message}</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <GiTheaterCurtains className="text-white text-xl animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight transition-colors duration-300" style={{ color: "var(--foreground)" }}>
                  Shows Management
                </h1>
                <p className="text-xs font-medium transition-colors duration-300" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Manage movie screenings & seat availability
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  refetch();
                  setLocalShows(null);
                }}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <FaSpinner className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Shows" value={stats.totalShows} icon={SiMyshows} color="blue" />
          <StatsCard label="Theaters" value={stats.theaters} icon={GiTheater} color="purple" />
          <StatsCard label="Seats Booked" value={stats.totalBookedSeats} icon={MdEventSeat} color="green" />
          <StatsCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={FaRupeeSign} color="yellow" />
        </div>

        {/* Search and Filters */}
        <div className="rounded-xl p-5 mb-8 flex flex-wrap gap-3 items-center shadow-lg transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex-1 min-w-[220px] relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--foreground)", opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Search by movie or theater..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="appearance-none rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            <option value="ALL">All Status</option>
            <option value="COMING_SOON">Coming Soon</option>
            <option value="BOOKING_OPEN">Booking Open</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select 
            value={selectedTheater} 
            onChange={e => setSelectedTheater(e.target.value)} 
            className="appearance-none rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            <option value="all">All Theaters</option>
            {uniqueTheaters.map(theater => (
              <option key={theater} value={theater}>{theater}</option>
            ))}
          </select>

          {hasFilters && (
            <button 
              onClick={clearFilters} 
              className="px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-transparent text-red-500 font-bold text-xs flex items-center gap-1.5 hover:bg-red-500/10 transition-all duration-300 hover:scale-105"
            >
              <FaTimes className="text-[10px]" /> Clear
            </button>
          )}

          <div className="ml-auto text-xs font-semibold" style={{ color: "var(--foreground)", opacity: 0.4 }}>
            {filteredDisplayData?.data?.length || 0} show{filteredDisplayData?.data?.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Shows by Theater */}
        {Object.keys(groupedShows).map((theaterId) => {
          const { theaterInfo, shows: theaterShows } = groupedShows[theaterId];

          return (
            <div key={theaterId} className="mb-12">
              <div className="rounded-xl overflow-hidden mb-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="p-5 flex items-center justify-between flex-wrap gap-3 border-b" style={{ borderColor: "var(--card-border)" }}>
                  <div className="flex items-center gap-3">
                    <GiTheater className="text-purple text-2xl" />
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                        {theaterInfo?.name || "Unknown Theater"}
                      </h2>
                      <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                        {theaterInfo?.location || "N/A"}, {theaterInfo?.city || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-purple/20">
                    <span className="text-sm font-semibold text-purple">{theaterShows.length} Shows</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {theaterShows.map((show) => {
                  const stats = getBookingStats(show);
                  const isUpdating = updateStatusMutation.isPending && selectedShow === show._id;

                  return (
                    <div
                      key={show._id}
                      className="rounded-2xl overflow-hidden flex flex-col shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
                    >
                      {show.movie?.poster ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={show.movie.poster}
                            alt={show.movie.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(show.status)}`}>
                              {getStatusDisplayText(show.status || "COMING_SOON")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <MdMovie className="text-white/50 text-5xl" />
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                            {show.movie?.name || "Unknown"}
                          </h3>
                          {show.movie?.rating && (
                            <div className="flex items-center gap-1">
                              <FaStar className="text-yellow-500 text-sm" />
                              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{show.movie.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-purple/20 text-purple">
                            {show.movie?.language || "N/A"}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue/20 text-blue">
                            {show.movie?.genre || "N/A"}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                            {show.movie?.duration || "N/A"} mins
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                            <FaCalendarAlt className="text-blue-500" />
                            <span>{formatDate(show.showDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                            <FaClock className="text-blue-500" />
                            <span>{show.startTime} - {show.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                            <MdScreenShare className="text-blue-500" />
                            <span>Screen {show.screenNumber}</span>
                          </div>
                        </div>

                        <div className="mb-4 p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid var(--card-border)" }}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted">Occupancy</span>
                            <span className="font-semibold text-blue-500">{stats.occupancyRate}%</span>
                          </div>
                          <div className="w-full rounded-full h-2 mb-2 overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.occupancyRate}%` }} />
                          </div>
                          <div className="flex justify-between text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                            <span>🎟️ Booked: {stats.bookedSeats}</span>
                            <span>🪑 Available: {stats.availableSeats}</span>
                            <span>📊 Total: {stats.totalSeats}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          {selectedShow === show._id ? (
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => handleUpdateStatus(show._id, option.value)}
                                  disabled={isUpdating}
                                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50 text-white bg-${option.color}-500 hover:bg-${option.color}-600`}
                                >
                                  {option.label}
                                </button>
                              ))}
                              <button
                                onClick={() => setSelectedShow(null)}
                                className="col-span-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                style={{ background: "rgba(0,0,0,0.05)", color: "var(--foreground)" }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedShow(show._id)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl py-2.5 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                            >
                              <FaEdit className="text-sm" /> Update Status
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!hasShows && (
          <div className="rounded-2xl text-center py-16 px-8 shadow-xl transition-all duration-300" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "var(--background)" }}>
              <SiMyshows className="text-3xl" style={{ color: "var(--foreground)", opacity: 0.2 }} />
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--foreground)" }}>No shows found</h3>
            <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              {hasFilters ? "Try adjusting your filters" : "Create your first show to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheaterShowsManagement;