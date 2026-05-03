"use client";

import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { MdEventSeat, MdMovie, MdScreenShare, MdLocationOn } from "react-icons/md";
import { GiTheater } from "react-icons/gi";
import { SiMyshows } from "react-icons/si";
import { HiOutlineTrendingUp, HiOutlineTrendingDown } from "react-icons/hi";

const TheaterShowsManagement = () => {
  const queryClient = useQueryClient();
  const [selectedShow, setSelectedShow] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [localShows, setLocalShows] = useState(null);
  const [selectedTheater, setSelectedTheater] = useState("all");

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

        setLocalShows({
          ...localShows,
          data: updatedShows,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["my-shows"] });

      const statusText = getStatusDisplayText(variables.data.status);
      showToast(`✨ Show status updated to ${statusText}`, "success");
      setSelectedShow(null);
    },
    onError: (error) => {
      showToast(error.response?.data?.message || "Failed to update status", "error");
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

  const getStatusBadgeColor = (status) => {
    const colorMap = {
      COMING_SOON: "bg-amber-100 text-amber-800 border-amber-200",
      BOOKING_OPEN: "bg-emerald-100 text-emerald-800 border-emerald-200",
      CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const showToast = (message, type = "info") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
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
      month: "long",
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
    { value: "COMING_SOON", label: "Coming Soon", color: "bg-amber-500 hover:bg-amber-600", icon: <FaHourglassHalf />, gradient: "from-amber-400 to-orange-500" },
    { value: "BOOKING_OPEN", label: "Booking Open", color: "bg-emerald-500 hover:bg-emerald-600", icon: <FaCheckCircle />, gradient: "from-emerald-400 to-teal-500" },
    { value: "CANCELLED", label: "Cancelled", color: "bg-rose-500 hover:bg-rose-600", icon: <FaTimesCircle />, gradient: "from-rose-400 to-red-500" },
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
    if (selectedTheater === "all") return displayData;
    const filteredData = {
      ...displayData,
      data: displayData.data.filter((show) => {
        const theaterName = show.theaterId?.name || "Unknown Theater";
        return theaterName === selectedTheater;
      }),
    };
    return filteredData;
  };

  const displayData = localShows || showsData;
  const filteredDisplayData = getFilteredShows();
  const groupedShows = groupShowsByTheater(filteredDisplayData);
  const hasShows = filteredDisplayData?.data && filteredDisplayData.data.length > 0;
  const uniqueTheaters = getUniqueTheaters();

  const totalShows = filteredDisplayData?.data?.length || 0;
  const totalBookedSeats = filteredDisplayData?.data?.reduce((sum, show) => {
    const stats = getBookingStats(show);
    return sum + stats.bookedSeats;
  }, 0);
  const totalRevenue = filteredDisplayData?.data?.reduce((sum, show) => {
    const stats = getBookingStats(show);
    return sum + (stats.bookedSeats * 200);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaTheaterMasks className="text-purple-500 text-2xl animate-pulse" />
          </div>
        </div>
        <div className="mt-6 text-lg font-medium text-gray-600">Loading shows...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl shadow-sm">
          <strong className="font-bold">⚠️ Error! </strong>
          <span>{error.response?.data?.message || error.message || "Failed to load shows"}</span>
          <button
            onClick={() => refetch()}
            className="mt-3 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg transform transition-all duration-300 animate-in slide-in-from-right ${
          toastMessage.type === "success" 
            ? "bg-gradient-to-r from-emerald-500 to-green-600" 
            : "bg-gradient-to-r from-rose-500 to-red-600"
        } text-white`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            {toastMessage.message}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <SiMyshows className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Shows Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage all your theater shows, track bookings, and update show statuses
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Shows"
            value={totalShows}
            icon={SiMyshows}
            gradient="from-violet-500 to-purple-600"
            iconBg="from-violet-100 to-purple-100"
            iconColor="text-violet-600"
            subtitle="Active Shows"
          />
          <StatCard
            title="Theaters"
            value={uniqueTheaters.length}
            icon={GiTheater}
            gradient="from-blue-500 to-cyan-600"
            iconBg="from-blue-100 to-cyan-100"
            iconColor="text-blue-600"
            subtitle="Total Venues"
          />
          <StatCard
            title="Seats Booked"
            value={totalBookedSeats}
            icon={MdEventSeat}
            gradient="from-emerald-500 to-teal-600"
            iconBg="from-emerald-100 to-teal-100"
            iconColor="text-emerald-600"
            subtitle="Occupied Seats"
          />
          <StatCard
            title="Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={FaRupeeSign}
            gradient="from-amber-500 to-orange-600"
            iconBg="from-amber-100 to-orange-100"
            iconColor="text-amber-600"
            subtitle="Total Collection"
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTheater("all")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedTheater === "all"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🎭 All Theaters
              </button>
              {uniqueTheaters.map((theater) => (
                <button
                  key={theater}
                  onClick={() => setSelectedTheater(theater)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedTheater === theater
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {theater}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                refetch();
                setLocalShows(null);
              }}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-5 py-2.5 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center gap-2 shadow-sm"
            >
              <FaRefresh className="animate-spin-slow" />
              Refresh
            </button>
          </div>
        </div>

        {/* Shows by Theater */}
        {Object.keys(groupedShows).map((theaterId) => {
          const { theaterInfo, shows: theaterShows } = groupedShows[theaterId];

          return (
            <div key={theaterId} className="mb-12">
              {/* Theater Header */}
              <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 shadow-xl">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative p-6 flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
                    <GiTheater className="text-white text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {theaterInfo?.name || "Unknown Theater"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <MdLocationOn className="text-white/80 text-sm" />
                      <p className="text-white/90">
                        {theaterInfo?.location || "N/A"}, {theaterInfo?.city || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                      <div className="text-2xl font-bold text-white">{theaterShows.length}</div>
                      <div className="text-xs text-white/80">Active Shows</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shows Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {theaterShows.map((show) => {
                  const stats = getBookingStats(show);
                  const isUpdating = updateStatusMutation.isPending && selectedShow === show._id;

                  return (
                    <div
                      key={show._id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Movie Poster Section */}
                      {show.movie?.poster ? (
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={show.movie.poster}
                            alt={show.movie.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(
                                show.status
                              )} shadow-sm`}
                            >
                              {getStatusDisplayText(show.status || "COMING_SOON")}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-1 rounded-lg">
                              <FaStar className="text-yellow-400 text-xs" />
                              <span className="text-white text-sm font-medium">{show.movie?.rating || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-56 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <MdMovie className="text-gray-600 text-6xl" />
                        </div>
                      )}

                      <div className="p-5">
                        {/* Movie Info */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                            {show.movie?.name || "Unknown"}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                              {show.movie?.language || "N/A"}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {show.movie?.genre || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Show Details */}
                        <div className="space-y-2.5 mb-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCalendarAlt className="text-purple-500 text-sm" />
                            <span>{formatDate(show.showDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaClock className="text-purple-500 text-sm" />
                            <span>{show.startTime} - {show.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MdScreenShare className="text-purple-500 text-sm" />
                            <span>Screen {show.screenNumber}</span>
                          </div>
                        </div>

                        {/* Booking Stats with Progress Bar */}
                        <div className="mb-5 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Occupancy Rate</span>
                            <span className="text-sm font-bold text-purple-600">
                              {stats.occupancyRate}%
                            </span>
                          </div>
                          <div className="relative w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-700"
                              style={{ width: `${stats.occupancyRate}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>🎟️ Booked: {stats.bookedSeats}</span>
                            <span>🪑 Available: {stats.availableSeats}</span>
                            <span>📊 Total: {stats.totalSeats}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {selectedShow === show._id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => handleUpdateStatus(show._id, option.value)}
                                  disabled={isUpdating}
                                  className={`bg-gradient-to-r ${option.gradient} text-white px-3 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 disabled:opacity-50`}
                                >
                                  {option.icon}
                                  <span className="text-xs">{option.label}</span>
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => setSelectedShow(null)}
                              className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-300 transition-all duration-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedShow(show._id)}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                          >
                            <FaEdit />
                            Update Status
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!hasShows && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="inline-block p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4">
              <SiMyshows className="text-5xl text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No shows found</p>
            <p className="text-gray-400 text-sm mt-2">Create a new show to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon: Icon, gradient, iconBg, iconColor, subtitle }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
              {value}
            </p>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${iconBg}`}>
            <Icon className={`text-2xl ${iconColor}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterShowsManagement;