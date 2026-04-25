"use client"
import React, { useState } from 'react'
import { getAllShowsAdmin, updateShowStatus, deleteShow } from "@/app/services/adminCommunication";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { 
  FaCalendar, FaClock, FaMapMarkerAlt, FaTicketAlt, FaFilm, 
  FaStar, FaLanguage, FaTags, FaChair, FaInfoCircle, FaEdit, 
  FaTrash, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare } from 'react-icons/md';

function ShowsManagement() {
  const [selectedShow, setSelectedShow] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showToEdit, setShowToEdit] = useState(null);
  const [showToDelete, setShowToDelete] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['allShows'],
    queryFn: getAllShowsAdmin
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statusData }) => updateShowStatus(id, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries(['allShows']);
      toast.success('Show status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const deleteShowMutation = useMutation({
    mutationFn: (id) => deleteShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allShows']);
      toast.success('Show deleted successfully');
      setIsDeleteModalOpen(false);
      setShowToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete show');
    }
  });

  const shows = data?.data || [];

  const handleStatusChange = (showId, currentStatus) => {
    let newStatus;
    switch(currentStatus) {
      case 'BOOKING_OPEN':
        newStatus = 'BOOKING_CLOSED';
        break;
      case 'BOOKING_CLOSED':
        newStatus = 'BOOKING_OPEN';
        break;
      case 'CANCELLED':
        newStatus = 'BOOKING_OPEN';
        break;
      default:
        newStatus = 'BOOKING_OPEN';
    }
    
    updateStatusMutation.mutate({ id: showId, statusData: { status: newStatus } });
  };

  const handleDelete = () => {
    if (showToDelete) {
      deleteShowMutation.mutate(showToDelete);
    }
  };

  const handleEdit = (show) => {
    setShowToEdit(show);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    toast.success('Show updated successfully');
    setIsEditModalOpen(false);
  };

  const handleImageError = (showId) => {
    setImageErrors(prev => ({ ...prev, [showId]: true }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading shows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-red-100 dark:bg-red-900/20 text-red-600 p-6 rounded-lg">
          <p className="font-semibold">Error loading shows</p>
          <p className="text-sm">{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (shows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaFilm className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">No shows available</h3>
          <p className="text-gray-500 mt-2">Create a new show to get started</p>
        </div>
      </div>
    );
  }

  const getPriceRange = (show) => {
    const prices = show.seatCategories?.map(cat => cat.pricePerSeat) || [];
    if (prices.length === 0) return 'N/A';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'BOOKING_OPEN':
        return { color: 'bg-green-500', text: 'Booking Open', icon: FaCheckCircle };
      case 'BOOKING_CLOSED':
        return { color: 'bg-yellow-500', text: 'Booking Closed', icon: FaEyeSlash };
      case 'CANCELLED':
        return { color: 'bg-red-500', text: 'Cancelled', icon: FaTimesCircle };
      default:
        return { color: 'bg-gray-500', text: status, icon: FaInfoCircle };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white sticky top-0 z-10 shadow-lg p-4 md:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Shows Management</h1>
            <p className="text-red-100 text-sm mt-1">Manage your movie screenings</p>
          </div>
          <button 
            onClick={() => window.location.href = '/admin/shows/create'}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            + Create New Show
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Shows</p>
            <p className="text-2xl font-bold text-red-600">{shows.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Movies</p>
            <p className="text-2xl font-bold text-blue-600">{new Set(shows.map(s => s.movie?.name)).size}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Theaters</p>
            <p className="text-2xl font-bold text-green-600">{new Set(shows.map(s => s.theaterId?.name)).size}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Available Seats</p>
            <p className="text-2xl font-bold text-purple-600">
              {shows.reduce((total, show) => total + (show.availableSeats || 0), 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Booked Seats</p>
            <p className="text-2xl font-bold text-orange-600">
              {shows.reduce((total, show) => total + (show.bookedSeatsCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Shows Grid */}
        <div className="space-y-6">
          {shows.map((show) => {
            const StatusIcon = getStatusBadge(show.status).icon;
            const posterUrl = show.movie?.poster?.startsWith('data:') 
              ? show.movie.poster 
              : show.movie?.poster 
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${show.movie.poster}`
                : null;
            
            return (
              <div key={show._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="flex flex-col lg:flex-row">
                  {/* Poster Section */}
                  <div className="lg:w-64 relative bg-gradient-to-br from-purple-600 to-blue-600 min-h-[256px]">
                    {posterUrl && !imageErrors[show._id] ? (
                      <div className="relative w-full h-64 lg:h-full">
                        <img 
                          src={posterUrl}
                          alt={show.movie?.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(show._id)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 lg:h-full">
                        <FaFilm className="text-6xl text-white/50" />
                      </div>
                    )}
                    {show.movie?.isTrending && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
                        🔥 Trending
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-10">
                      {show.movie?.rating} ⭐
                    </div>
                  </div>

                  {/* Movie Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h2 className="text-2xl font-bold">{show.movie?.name || 'Movie Title'}</h2>
                          <div className={`${getStatusBadge(show.status).color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                            <StatusIcon className="text-xs" />
                            {getStatusBadge(show.status).text}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <FaStar className="text-yellow-500" /> {show.movie?.rating || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <FaClock /> {show.movie?.duration || 'N/A'} mins
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <FaLanguage /> {show.movie?.language || 'Unknown'}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            {show.movie?.genre || 'General'}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {show.movie?.description || 'No description available'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {getPriceRange(show)}
                        </div>
                        <p className="text-xs text-gray-500">per ticket</p>
                      </div>
                    </div>

                    {/* Theater Info */}
                    <div className="border-t dark:border-gray-700 pt-4 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                            <MdTheaters className="text-red-500 text-lg" />
                            <span className="font-semibold">{show.theaterId?.name || 'Theater Name'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                            <FaMapMarkerAlt className="text-red-500" />
                            <span>{show.theaterId?.location}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                            <MdScreenShare className="text-blue-500" />
                            <span className="text-sm">Screen {show.screenNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                            <FaChair className="text-green-500" />
                            <span>{show.availableSeats} seats available out of {show.totalSeats}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaCalendar /> {new Date(show.showDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaClock /> {show.startTime} - {show.endTime}
                        </div>
                      </div>

                      {/* Seat Categories Summary */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <FaTags /> Seat Categories:
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {show.seatCategories?.map((category) => (
                            <div key={category.category} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                category.category === 'NORMAL' ? 'bg-green-500' :
                                category.category === 'EXECUTIVE' ? 'bg-blue-500' :
                                category.category === 'PREMIUM' ? 'bg-purple-500' : 'bg-yellow-500'
                              }`} />
                              <span className="text-sm">
                                {category.category}: ₹{category.pricePerSeat} ({category.availableSeats}/{category.totalSeats})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setSelectedShow(show)}
                        className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FaTicketAlt /> View Seats
                      </button>
                      <button 
                        onClick={() => handleEdit(show)}
                        className="flex-1 min-w-[80px] bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button 
                        onClick={() => handleStatusChange(show._id, show.status)}
                        className={`flex-1 min-w-[120px] ${show.status === 'BOOKING_OPEN' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition`}
                      >
                        {show.status === 'BOOKING_OPEN' ? <FaEyeSlash /> : <FaEye />}
                        {show.status === 'BOOKING_OPEN' ? 'Close' : 'Open'} Booking
                      </button>
                      <button 
                        onClick={() => {
                          setShowToDelete(show._id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="flex-1 min-w-[80px] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Seats Modal - Keep existing code */}
      {selectedShow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Seat Map - {selectedShow.movie?.name}</h2>
              <button onClick={() => setSelectedShow(null)} className="p-1 hover:bg-gray-100 rounded text-2xl">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-bold text-lg">{selectedShow.theaterId?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Screen {selectedShow.screenNumber} | {selectedShow.startTime} - {selectedShow.endTime} | {new Date(selectedShow.showDate).toLocaleDateString()}
                </p>
              </div>
              
              {selectedShow.seatCategories?.map((category) => (
                <div key={category.category} className="mb-8">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${
                      category.category === 'NORMAL' ? 'bg-green-500' :
                      category.category === 'EXECUTIVE' ? 'bg-blue-500' :
                      category.category === 'PREMIUM' ? 'bg-purple-500' : 'bg-yellow-500'
                    }`} />
                    {category.category} - ₹{category.pricePerSeat}
                  </h4>
                  <div className="overflow-x-auto">
                    <div className="min-w-max">
                      {category.rows?.map((row) => (
                        <div key={row.rowName} className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold w-8">Row {row.rowName}</span>
                            <div className="flex flex-wrap gap-1">
                              {row.seats?.map((seat) => (
                                <div
                                  key={seat.seatNumber}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${
                                    seat.isBooked 
                                      ? 'bg-red-500 text-white cursor-not-allowed' 
                                      : 'bg-green-500 text-white hover:bg-green-600'
                                  }`}
                                >
                                  {seat.seatNumber}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded"></div>
                    <span className="text-sm">Booked</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                Total Seats: {selectedShow.totalSeats} | Available: {selectedShow.availableSeats} | Booked: {selectedShow.bookedSeatsCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Keep existing code */}
      {isEditModalOpen && showToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Show</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-100 rounded text-2xl">
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Movie Name</label>
                <input
                  type="text"
                  defaultValue={showToEdit.movie?.name}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Show Date</label>
                <input
                  type="date"
                  defaultValue={new Date(showToEdit.showDate).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    defaultValue={showToEdit.startTime}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    defaultValue={showToEdit.endTime}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  defaultValue={showToEdit.status}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="BOOKING_OPEN">Booking Open</option>
                  <option value="BOOKING_CLOSED">Booking Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete Show</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this show? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleteShowMutation.isPending}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteShowMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShowsManagement;