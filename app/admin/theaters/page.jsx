"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from 'react-hot-toast';
import { 
  getAllTheatersAdmin, 
  deleteTheater,
  updateTheater
} from "@/app/services/adminCommunication";
import { 
  FaBuilding, FaMapMarkerAlt, FaPhone, FaTicketAlt,
  FaCouch, FaWifi, FaParking, FaCoffee, FaAccessibleIcon,
  FaEdit, FaTrash, FaPlus, FaSearch, FaEye,
  FaCheckCircle, FaTimesCircle, FaTimes
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare, MdLocationOn } from 'react-icons/md';

const AMENITIES = [
  { icon: FaCouch, name: "Recliner", key: "hasRecliner" },
  { icon: FaWifi, name: "WiFi", key: "hasWifi" },
  { icon: FaParking, name: "Parking", key: "hasParking" },
  { icon: FaCoffee, name: "Café", key: "hasCafe" },
  { icon: FaAccessibleIcon, name: "Wheelchair", key: "hasWheelchair" }
];

const SEAT_COLORS = {
  NORMAL: 'bg-green-500 hover:bg-green-600',
  EXECUTIVE: 'bg-blue-500 hover:bg-blue-600',
  PREMIUM: 'bg-purple-500 hover:bg-purple-600',
  VIP: 'bg-gradient-to-r from-yellow-400 to-yellow-600'
};

// ==================== SCREEN VIEW MODAL ====================
const ScreenViewModal = ({ isOpen, onClose, theater, screens, selectedScreenIndex, onScreenChange }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const currentScreen = screens?.[selectedScreenIndex];

  const generateSeats = (seatRows) => {
    const seats = [];
    seatRows?.forEach(row => {
      for (let i = row.startSeat; i <= row.endSeat; i++) {
        seats.push({
          row: row.rowName,
          number: i,
          category: row.category,
          multiplier: row.priceMultiplier
        });
      }
    });
    return seats;
  };

  const seatsByRow = useMemo(() => {
    if (!currentScreen?.seatRows) return {};
    const seats = generateSeats(currentScreen.seatRows);
    return seats.reduce((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});
  }, [currentScreen]);

  const totalSeats = useMemo(() => {
    return Object.values(seatsByRow).reduce((sum, row) => sum + row.length, 0);
  }, [seatsByRow]);

  if (!isOpen || !currentScreen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-5 border-b dark:border-gray-700 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{theater?.name}</h2>
              <p className="text-gray-500 text-sm">{theater?.location}, {theater?.city}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Screen Tabs */}
          {screens?.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {screens.map((screen, idx) => (
                <button
                  key={screen._id}
                  onClick={() => onScreenChange(idx)}
                  className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
                    selectedScreenIndex === idx
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <MdScreenShare className="inline mr-2" /> {screen.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Screen Content */}
        <div className="p-6">
          {/* Screen Info */}
          <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
            <div>
              <p className="text-sm text-gray-500">Screen {currentScreen.screenNumber}</p>
              <p className="text-lg font-bold">{currentScreen.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Seats</p>
              <p className="text-2xl font-bold text-red-600">{totalSeats}</p>
            </div>
          </div>

          {/* Screen Display */}
          <div className="relative mb-10">
            <div className="w-full h-3 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full" />
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-4 py-1 rounded-full">
              SCREEN
            </div>
          </div>

          {/* Seats Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {Object.entries(seatsByRow).map(([rowName, seats]) => (
                <div key={rowName} className="flex items-center gap-3 mb-2">
                  <div className="w-10 text-center font-bold text-lg">{rowName}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {seats.map(seat => (
                      <div
                        key={`${seat.row}${seat.number}`}
                        onMouseEnter={() => setHoveredSeat(seat)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className={`
                          w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs font-bold transition-all 
                          ${SEAT_COLORS[seat.category] || SEAT_COLORS.NORMAL} 
                          text-white flex items-center justify-center shadow-md
                          hover:scale-110 cursor-pointer
                        `}
                      >
                        {seat.number}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t dark:border-gray-700">
            <p className="text-sm font-semibold mb-3">Seat Categories</p>
            <div className="flex flex-wrap gap-4">
              {[
                { cat: 'NORMAL', color: 'bg-green-500', price: 'Base Price' },
                { cat: 'EXECUTIVE', color: 'bg-blue-500', price: '1.5x Base' },
                { cat: 'PREMIUM', color: 'bg-purple-500', price: '2x Base' },
                { cat: 'VIP', color: 'bg-yellow-500', price: '3x Base' }
              ].map(cat => (
                <div key={cat.cat} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded ${cat.color}`} />
                  <span className="text-sm">{cat.cat}</span>
                  <span className="text-xs text-gray-500">({cat.price})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hover Info */}
          {hoveredSeat && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <p className="text-sm font-medium">
                Seat {hoveredSeat.row}{hoveredSeat.number} - {hoveredSeat.category}
              </p>
              <p className="text-xs text-gray-500">
                Price Multiplier: {hoveredSeat.multiplier}x
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== THEATER CARD ====================
const TheaterCard = ({ theater, onView, onEdit, onDelete, onStatusToggle }) => {
  const totalScreens = theater.screens?.length || 0;
  const totalSeats = useMemo(() => 
    theater.screens?.reduce((total, screen) => 
      total + (screen.seatRows?.reduce((sum, row) => 
        sum + (row.endSeat - row.startSeat + 1), 0) || 0), 0
    ) || 0, [theater.screens]
  );

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Card Header with Gradient */}
      <div className="relative h-44 bg-gradient-to-r from-red-600 to-red-800">
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FaBuilding className="text-5xl text-white/80" />
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
            theater.status === 'ACTIVE' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            {theater.status === 'ACTIVE' ? '● Active' : '● Inactive'}
          </span>
        </div>
        <button
          onClick={() => onStatusToggle(theater)}
          className="absolute bottom-3 right-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full p-2 transition"
          title={theater.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        >
          {theater.status === 'ACTIVE' ? (
            <FaTimesCircle className="text-yellow-500" />
          ) : (
            <FaCheckCircle className="text-green-500" />
          )}
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">
            {theater.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
            <MdLocationOn className="text-red-500" />
            <span>{theater.location}, {theater.city}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="text-center">
            <MdTheaters className="text-xl mx-auto text-blue-500" />
            <p className="text-lg font-bold">{totalScreens}</p>
            <p className="text-xs text-gray-500">Screens</p>
          </div>
          <div className="text-center">
            <FaTicketAlt className="text-xl mx-auto text-green-500" />
            <p className="text-lg font-bold">{totalSeats}</p>
            <p className="text-xs text-gray-500">Seats</p>
          </div>
          <div className="text-center">
            <FaPhone className="text-xl mx-auto text-purple-500" />
            <p className="text-lg font-bold text-sm">{theater.contactNumber}</p>
            <p className="text-xs text-gray-500">Contact</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {AMENITIES.filter(a => theater[a.key]).map(({ icon: Icon, name }) => (
            <div key={name} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
              <Icon className="text-gray-600 dark:text-gray-300 text-xs" />
              <span>{name}</span>
            </div>
          ))}
          {!AMENITIES.some(a => theater[a.key]) && (
            <span className="text-xs text-gray-400">No amenities</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(theater)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <FaEye /> View Layout
          </button>
          <button
            onClick={() => onEdit(theater)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(theater)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== DELETE MODAL ====================
const DeleteModal = ({ isOpen, onClose, onConfirm, theaterName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrash className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-xl font-bold mb-2">Delete Theater</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete <strong className="text-red-600">{theaterName}</strong>?<br />
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition"
            >
              Yes, Delete
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STATUS MODAL ====================
const StatusModal = ({ isOpen, onClose, onConfirm, theater, action }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            action === 'activate' 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-yellow-100 dark:bg-yellow-900/30'
          }`}>
            {action === 'activate' ? (
              <FaCheckCircle className="text-green-600 text-2xl" />
            ) : (
              <FaTimesCircle className="text-yellow-600 text-2xl" />
            )}
          </div>
          <h2 className="text-xl font-bold mb-2">
            {action === 'activate' ? 'Activate Theater' : 'Deactivate Theater'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to {action} <strong className="text-red-600">{theater?.name}</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className={`flex-1 py-2 rounded-xl font-semibold transition ${
                action === 'activate'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              Yes, {action === 'activate' ? 'Activate' : 'Deactivate'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function TheatersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [deletingTheater, setDeletingTheater] = useState(null);
  const [statusTheater, setStatusTheater] = useState(null);
  const [statusAction, setStatusAction] = useState('');
  
  // Layout Modal States
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  // Fetch Theaters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['allTheatersAdmin'],
    queryFn: getAllTheatersAdmin,
  });

  const theaters = data?.data || [];

  // Get unique cities for filter
  const cities = useMemo(() => {
    const citySet = new Set();
    theaters.forEach(t => {
      if (t.city) citySet.add(t.city);
    });
    return ['ALL', ...Array.from(citySet).sort()];
  }, [theaters]);

  // Filter theaters
  const filteredTheaters = useMemo(() => {
    return theaters.filter(theater => {
      const matchesSearch = theater.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           theater.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           theater.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || theater.status === statusFilter;
      const matchesCity = cityFilter === 'ALL' || theater.city === cityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [theaters, searchTerm, statusFilter, cityFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: theaters.length,
    active: theaters.filter(t => t.status === 'ACTIVE').length,
    inactive: theaters.filter(t => t.status === 'INACTIVE').length,
    screens: theaters.reduce((sum, t) => sum + (t.screens?.length || 0), 0),
    cities: new Set(theaters.map(t => t.city)).size
  }), [theaters]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteTheater,
    onSuccess: () => {
      queryClient.invalidateQueries(['allTheatersAdmin']);
      toast.success('Theater deleted successfully!');
      setDeletingTheater(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete theater');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, data }) => updateTheater(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allTheatersAdmin']);
      toast.success(`Theater ${statusAction === 'activate' ? 'activated' : 'deactivated'} successfully!`);
      setStatusTheater(null);
      setStatusAction('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update theater status');
    }
  });

  const handleDelete = (theater) => {
    setDeletingTheater(theater);
  };

  const confirmDelete = () => {
    if (deletingTheater) {
      deleteMutation.mutate(deletingTheater._id);
    }
  };

  const handleStatusToggle = (theater, action) => {
    setStatusTheater(theater);
    setStatusAction(action);
  };

  const confirmStatusChange = () => {
    if (statusTheater) {
      const newStatus = statusAction === 'activate' ? 'ACTIVE' : 'INACTIVE';
      statusMutation.mutate({ id: statusTheater._id, data: { status: newStatus } });
    }
  };

  const handleViewLayout = (theater) => {
    setSelectedTheater(theater);
    setSelectedScreenIndex(0);
    setIsLayoutModalOpen(true);
  };

  const handleEditTheater = (theater) => {
    router.push(`/admin/theaters/edit/${theater._id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading theaters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-red-600 text-3xl" />
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to load theaters</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white sticky top-0 z-20 shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <FaBuilding className="text-yellow-400" />
                Theater Management
              </h1>
              <p className="text-red-100 mt-1">Manage all theaters, screens, and seat layouts</p>
            </div>
            <button
              onClick={() => router.push('/admin/theaters/add')}
              className="bg-white text-red-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105"
            >
              <FaPlus /> Add New Theater
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Theaters', value: stats.total, icon: FaBuilding, color: 'from-blue-500 to-blue-600' },
            { label: 'Active', value: stats.active, icon: FaCheckCircle, color: 'from-green-500 to-green-600' },
            { label: 'Inactive', value: stats.inactive, icon: FaTimesCircle, color: 'from-gray-500 to-gray-600' },
            { label: 'Total Screens', value: stats.screens, icon: MdTheaters, color: 'from-purple-500 to-purple-600' },
            { label: 'Cities', value: stats.cities, icon: FaMapMarkerAlt, color: 'from-orange-500 to-orange-600' }
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-r ${stat.color} rounded-2xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="text-3xl opacity-80" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, location, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city === 'ALL' ? 'All Cities' : city}</option>
              ))}
            </select>
            {(searchTerm || statusFilter !== 'ALL' || cityFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setCityFilter('ALL');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Theaters Grid */}
        {filteredTheaters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBuilding className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No theaters found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'ALL' || cityFilter !== 'ALL'
                ? "Try adjusting your filters"
                : "Get started by adding your first theater"}
            </p>
            {!searchTerm && statusFilter === 'ALL' && cityFilter === 'ALL' && (
              <button
                onClick={() => router.push('/admin/theaters/add')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
              >
                <FaPlus /> Add Your First Theater
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTheaters.map(theater => (
              <TheaterCard
                key={theater._id}
                theater={theater}
                onView={handleViewLayout}
                onEdit={handleEditTheater}
                onDelete={handleDelete}
                onStatusToggle={(t) => handleStatusToggle(t, t.status === 'ACTIVE' ? 'deactivate' : 'activate')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deletingTheater}
        onClose={() => setDeletingTheater(null)}
        onConfirm={confirmDelete}
        theaterName={deletingTheater?.name}
      />

      {/* Status Modal */}
      <StatusModal
        isOpen={!!statusTheater}
        onClose={() => {
          setStatusTheater(null);
          setStatusAction('');
        }}
        onConfirm={confirmStatusChange}
        theater={statusTheater}
        action={statusAction}
      />

      {/* Screen Layout Modal */}
      <ScreenViewModal
        isOpen={isLayoutModalOpen}
        onClose={() => {
          setIsLayoutModalOpen(false);
          setSelectedTheater(null);
          setSelectedScreenIndex(0);
        }}
        theater={selectedTheater}
        screens={selectedTheater?.screens || []}
        selectedScreenIndex={selectedScreenIndex}
        onScreenChange={setSelectedScreenIndex}
      />
    </div>
  );
}