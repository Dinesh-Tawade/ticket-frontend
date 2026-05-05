'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getMyTheaters,
  updateTheaterOwner,
  deleteTheaterOwner,
  getTheaterScreens,
  addScreenToTheaterOwner,
  updateScreenOwner,
  deleteScreenOwner,
} from "../../services/adminCommunication";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaSave,
  FaSpinner,
  FaMapMarkerAlt,
  FaPhone,
  FaCity,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaFilm,
  FaTicketAlt,
  FaRupeeSign,
} from 'react-icons/fa';
import { MdScreenShare, MdEventSeat } from 'react-icons/md';
import { GiTheater } from 'react-icons/gi';
import { SiMyshows } from 'react-icons/si';

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    purple: "from-purple-500 to-indigo-600",
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-red-600",
    pink: "from-pink-500 to-rose-600",
  };
  
  return (
    <div className="rounded-xl p-4 transition-all duration-300 hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.5 }}>
            {label}
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
            {value}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="text-white text-lg" />
        </div>
      </div>
    </div>
  );
};

// ==================== THEATER CARD COMPONENT ====================
const TheaterCard = ({ theater, onView, onEdit, onDelete }) => {
  const screenCount = theater.screens?.length || 0;
  const totalSeats = theater.screens?.reduce((sum, screen) => sum + (screen.totalRows * screen.totalColumns), 0) || 0;
  
  return (
    <div className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
      
      {/* Header Banner */}
      <div className="h-28 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs text-white flex items-center gap-1">
            <MdScreenShare size={12} /> {screenCount} Screens
          </span>
          <span className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs text-white flex items-center gap-1">
            <MdEventSeat size={12} /> {totalSeats} Seats
          </span>
        </div>
        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium ${
          theater.status === 'ACTIVE' ? 'bg-green-500' : theater.status === 'INACTIVE' ? 'bg-red-500' : 'bg-yellow-500'
        } text-white`}>
          {theater.status || 'ACTIVE'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-1" style={{ color: "var(--foreground)" }}>
          {theater.name}
        </h3>
        
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            <FaMapMarkerAlt className="text-purple-400 text-xs flex-shrink-0" />
            <span className="truncate text-xs">{theater.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            <FaCity className="text-purple-400 text-xs flex-shrink-0" />
            <span className="text-xs">{theater.city}, {theater.state}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            <FaPhone className="text-purple-400 text-xs flex-shrink-0" />
            <span className="text-xs">{theater.contactNumber}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(theater)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 hover:gap-2"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            <FaEye size={12} /> View
          </button>
          <button
            onClick={() => onEdit(theater)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 hover:gap-2"
            style={{ background: "#3b82f615", border: "1px solid #3b82f630", color: "#3b82f6" }}
          >
            <FaEdit size={12} /> Edit
          </button>
          <button
            onClick={() => onDelete(theater)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 hover:gap-2"
            style={{ background: "#ef444415", border: "1px solid #ef444430", color: "#ef4444" }}
          >
            <FaTrash size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== SCREEN CARD COMPONENT ====================
const ScreenCard = ({ screen, theaterId, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: screen.name || '',
    screenNumber: screen.screenNumber,
    totalRows: screen.totalRows,
    totalColumns: screen.totalColumns,
    status: screen.status || 'ACTIVE',
  });

  const totalSeats = formData.totalRows * formData.totalColumns;

  const handleSave = async () => {
    await onUpdate(theaterId, screen._id, formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
        <div className="space-y-3">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Screen Name"
            className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={formData.screenNumber}
              onChange={(e) => setFormData({ ...formData, screenNumber: parseInt(e.target.value) })}
              placeholder="Screen Number"
              className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={formData.totalRows}
              onChange={(e) => setFormData({ ...formData, totalRows: parseInt(e.target.value) })}
              placeholder="Total Rows"
              className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            />
            <input
              type="number"
              value={formData.totalColumns}
              onChange={(e) => setFormData({ ...formData, totalColumns: parseInt(e.target.value) })}
              placeholder="Columns per Row"
              className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: "#22c55e", color: "white" }}
            >
              <FaSave size={12} /> Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: "#ef4444", color: "white" }}
            >
              <FaTimes size={12} /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 transition-all hover:scale-[1.02] cursor-pointer"
      style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MdScreenShare className="text-purple-500 text-lg" />
          <h4 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
            {screen.name || `Screen ${screen.screenNumber}`}
          </h4>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors" style={{ color: "#3b82f6" }}>
            <FaEdit size={11} />
          </button>
          <button onClick={() => onDelete(theaterId, screen._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "#ef4444" }}>
            <FaTrash size={11} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
        <div>📊 Rows: {screen.totalRows}</div>
        <div>📐 Cols: {screen.totalColumns}</div>
        <div>💺 Seats: {screen.totalRows * screen.totalColumns}</div>
        <div className="capitalize">📌 Status: {screen.status}</div>
      </div>
    </div>
  );
};

// ==================== ADD SCREEN MODAL ====================
const AddScreenModal = ({ isOpen, onClose, theaterId, onAdd }) => {
  const [formData, setFormData] = useState({
    screenNumber: 1,
    name: '',
    totalRows: 10,
    totalColumns: 20,
    seatRows: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(theaterId, formData);
    onClose();
    setFormData({ screenNumber: 1, name: '', totalRows: 10, totalColumns: 20, seatRows: [] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)" }}>
        <div className="sticky top-0 p-4 border-b flex justify-between items-center" style={{ borderColor: "var(--card-border)" }}>
          <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Add New Screen</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <input
            type="number"
            value={formData.screenNumber}
            onChange={(e) => setFormData({ ...formData, screenNumber: parseInt(e.target.value) })}
            placeholder="Screen Number"
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            required
          />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Screen Name (Optional)"
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={formData.totalRows}
              onChange={(e) => setFormData({ ...formData, totalRows: parseInt(e.target.value) })}
              placeholder="Total Rows"
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              required
            />
            <input
              type="number"
              value={formData.totalColumns}
              onChange={(e) => setFormData({ ...formData, totalColumns: parseInt(e.target.value) })}
              placeholder="Columns per Row"
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Create Screen
          </button>
        </form>
      </div>
    </div>
  );
};

// ==================== EDIT THEATER MODAL ====================
const EditTheaterModal = ({ isOpen, onClose, theater, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    status: 'ACTIVE',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (theater) {
      setFormData({
        name: theater.name || '',
        contactNumber: theater.contactNumber || '',
        status: theater.status || 'ACTIVE',
      });
    }
  }, [theater]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(theater._id, formData);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl w-full max-w-md" style={{ background: "var(--card)" }}>
        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: "var(--card-border)" }}>
          <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Edit Theater</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--foreground)" }}>Theater Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--foreground)" }}>Contact Number</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--foreground)" }}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Update Theater
          </button>
        </form>
      </div>
    </div>
  );
};

// ==================== THEATER DETAILS MODAL ====================
const TheaterDetailsModal = ({ isOpen, onClose, theater, screens, loading, onUpdateScreen, onDeleteScreen, onAddScreen }) => {
  const [showAddScreen, setShowAddScreen] = useState(false);

  if (!isOpen) return null;

  const totalScreens = screens?.length || 0;
  const totalSeats = screens?.reduce((sum, s) => sum + (s.totalRows * s.totalColumns), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)" }}>
        {/* Header */}
        <div className="sticky top-0 p-4 border-b flex justify-between items-center" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{theater?.name}</h2>
            <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>{theater?.location}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FaTimes />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total Screens" value={totalScreens} icon={MdScreenShare} color="purple" />
            <StatCard label="Total Seats" value={totalSeats} icon={MdEventSeat} color="blue" />
            <StatCard label="Status" value={theater?.status || 'ACTIVE'} icon={FaBuilding} color="green" />
          </div>

          {/* Screens Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Screens</h3>
              <button
                onClick={() => setShowAddScreen(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:gap-3"
                style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)", color: "white" }}
              >
                <FaPlus size={12} /> Add Screen
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-purple-500" />
              </div>
            ) : screens?.length === 0 ? (
              <div className="text-center py-8 rounded-lg" style={{ background: "var(--background)" }}>
                <MdScreenShare className="text-4xl mx-auto mb-2" style={{ color: "var(--foreground)", opacity: 0.3 }} />
                <p style={{ color: "var(--foreground)", opacity: 0.6 }}>No screens added yet</p>
                <button
                  onClick={() => setShowAddScreen(true)}
                  className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-purple-500 hover:bg-purple-500/10 transition-colors"
                >
                  + Add your first screen
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {screens.map((screen) => (
                  <ScreenCard
                    key={screen._id}
                    screen={screen}
                    theaterId={theater?._id}
                    onUpdate={onUpdateScreen}
                    onDelete={onDeleteScreen}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Screen Modal */}
        <AddScreenModal
          isOpen={showAddScreen}
          onClose={() => setShowAddScreen(false)}
          theaterId={theater?._id}
          onAdd={onAddScreen}
        />
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================
const TheatersPage = () => {
  const queryClient = useQueryClient();
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [theaterScreens, setTheaterScreens] = useState([]);
  const [screensLoading, setScreensLoading] = useState(false);

  // Fetch all theaters
  const { data: theatersData, isLoading, refetch } = useQuery({
    queryKey: ['my-theaters'],
    queryFn: getMyTheaters,
  });

  const theaters = theatersData?.data || [];

  // Update theater mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTheaterOwner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-theaters']);
      toast.success('Theater updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update theater');
    },
  });

  // Delete theater mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTheaterOwner(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-theaters']);
      toast.success('Theater deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete theater');
    },
  });

  // Add screen mutation
  const addScreenMutation = useMutation({
    mutationFn: ({ theaterId, data }) => addScreenToTheaterOwner(theaterId, data),
    onSuccess: () => {
      if (selectedTheater) {
        fetchScreens(selectedTheater._id);
      }
      toast.success('Screen added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add screen');
    },
  });

  // Update screen mutation
  const updateScreenMutation = useMutation({
    mutationFn: ({ theaterId, screenId, data }) => updateScreenOwner(theaterId, screenId, data),
    onSuccess: () => {
      if (selectedTheater) {
        fetchScreens(selectedTheater._id);
      }
      toast.success('Screen updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update screen');
    },
  });

  // Delete screen mutation
  const deleteScreenMutation = useMutation({
    mutationFn: ({ theaterId, screenId }) => deleteScreenOwner(theaterId, screenId),
    onSuccess: () => {
      if (selectedTheater) {
        fetchScreens(selectedTheater._id);
      }
      toast.success('Screen deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete screen');
    },
  });

  // Fetch screens for a theater
  const fetchScreens = async (theaterId) => {
    setScreensLoading(true);
    try {
      const res = await getTheaterScreens(theaterId);
      setTheaterScreens(res?.data || []);
    } catch (error) {
      console.error('Failed to fetch screens:', error);
    } finally {
      setScreensLoading(false);
    }
  };

  // Handlers
  const handleView = (theater) => {
    setSelectedTheater(theater);
    fetchScreens(theater._id);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (theater) => {
    setSelectedTheater(theater);
    setIsEditModalOpen(true);
  };

  const handleDelete = (theater) => {
    if (confirm(`Are you sure you want to delete "${theater.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(theater._id);
    }
  };

  const handleUpdate = (id, data) => {
    updateMutation.mutate({ id, data });
  };

  const handleAddScreen = (theaterId, data) => {
    addScreenMutation.mutate({ theaterId, data });
  };

  const handleUpdateScreen = (theaterId, screenId, data) => {
    updateScreenMutation.mutate({ theaterId, screenId, data });
  };

  const handleDeleteScreen = (theaterId, screenId) => {
    if (confirm('Are you sure you want to delete this screen?')) {
      deleteScreenMutation.mutate({ theaterId, screenId });
    }
  };

  // Calculate stats for header
  const totalTheaters = theaters.length;
  const totalScreens = theaters.reduce((sum, t) => sum + (t.screens?.length || 0), 0);
  const totalSeats = theaters.reduce((sum, t) => sum + (t.screens?.reduce((s, scr) => s + (scr.totalRows * scr.totalColumns), 0) || 0), 0);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-300" style={{ background: "var(--background)" }}>

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Theaters" value={totalTheaters} icon={GiTheater} color="purple" />
        <StatCard label="Total Screens" value={totalScreens} icon={MdScreenShare} color="blue" />
        <StatCard label="Total Seats" value={totalSeats} icon={MdEventSeat} color="green" />
      </div>

      {/* Header Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            My Theaters
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Manage all your theaters, screens and seat layouts
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 hover:gap-3"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        >
          <FaSpinner className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-purple-500 mb-4" />
          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Loading your theaters...</p>
        </div>
      ) : theaters.length === 0 ? (
        // Empty State
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--card)" }}>
            <GiTheater className="text-4xl text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>No Theaters Yet</h3>
          <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            You haven't been assigned any theaters yet. Contact the super admin to get started.
          </p>
        </div>
      ) : (
        // Theater Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {theaters.map((theater) => (
            <TheaterCard
              key={theater._id}
              theater={theater}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <EditTheaterModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        theater={selectedTheater}
        onUpdate={handleUpdate}
      />

      <TheaterDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        theater={selectedTheater}
        screens={theaterScreens}
        loading={screensLoading}
        onUpdateScreen={handleUpdateScreen}
        onDeleteScreen={handleDeleteScreen}
        onAddScreen={handleAddScreen}
      />
    </div>
  );
};

export default TheatersPage;