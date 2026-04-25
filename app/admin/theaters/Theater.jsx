"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  getAllTheatersAdmin, 
  getTheaterByIdAdmin, 
  updateTheater, 
  addScreenToTheater, 
  deleteTheater 
} from "@/app/services/adminCommunication";
import { 
  FaBuilding, FaMapMarkerAlt, FaPhone, FaTicketAlt,
  FaCouch, FaWifi, FaParking, FaCoffee, FaAccessibleIcon, FaArrowLeft,
  FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaCheck
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare } from 'react-icons/md';

const SEAT_COLORS = {
  NORMAL: 'bg-green-500 hover:bg-green-600',
  EXECUTIVE: 'bg-blue-500 hover:bg-blue-600',
  PREMIUM: 'bg-purple-500 hover:bg-purple-600',
  VIP: 'bg-yellow-500 hover:bg-yellow-600'
};

const AMENITIES = [
  { icon: FaCouch, name: "Recliner", key: "hasRecliner" },
  { icon: FaWifi, name: "WiFi", key: "hasWifi" },
  { icon: FaParking, name: "Parking", key: "hasParking" },
  { icon: FaCoffee, name: "Café", key: "hasCafe" },
  { icon: FaAccessibleIcon, name: "Wheelchair", key: "hasWheelchair" }
];

// Helper Functions
const getSeatColor = (category) => SEAT_COLORS[category] || SEAT_COLORS.NORMAL;

const generateSeats = (seatRows) => {
  const seats = [];
  seatRows?.forEach(row => {
    for (let i = row.startSeat; i <= row.endSeat; i++) {
      seats.push({ row: row.rowName, number: i, category: row.category, multiplier: row.priceMultiplier });
    }
  });
  return seats;
};

// Components
const ScreenView = ({ screen, t, onEditScreen, onDeleteScreen }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const seats = useMemo(() => generateSeats(screen.seatRows), [screen.seatRows]);
  
  const seatsByRow = useMemo(() => {
    return seats.reduce((acc, seat) => {
      (acc[seat.row] = acc[seat.row] || []).push(seat);
      return acc;
    }, {});
  }, [seats]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 md:p-6 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => onEditScreen(screen)} 
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          title={t('app.editScreen')}
        >
          <FaEdit />
        </button>
        <button 
          onClick={() => onDeleteScreen(screen._id)} 
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          title={t('app.deleteScreen')}
        >
          <FaTrash />
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <MdScreenShare className="text-red-500" /> {screen.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('app.screen')} {screen.screenNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{t('app.totalSeats')}</p>
          <p className="text-2xl font-bold">{seats.length}</p>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="w-full h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-4 py-1 rounded-full">
          {t('app.screen').toUpperCase()}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div key={row} className="flex items-center gap-2 mb-2">
              <div className="w-8 text-center font-bold">{row}</div>
              <div className="flex gap-1.5">
                {rowSeats.map(seat => (
                  <button
                    key={`${seat.row}${seat.number}`}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-md text-xs font-bold transition-all ${getSeatColor(seat.category)} text-white hover:scale-110 flex items-center justify-center`}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.keys(SEAT_COLORS).map(cat => (
            <div key={cat} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded ${SEAT_COLORS[cat].split(' ')[0]}`} />
              <span className="text-sm">{t(`app.${cat.toLowerCase()}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {hoveredSeat && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{t('app.seat')} {hoveredSeat.row}{hoveredSeat.number} - {t(`app.${hoveredSeat.category.toLowerCase()}`)}</p>
          <p className="text-xs">{t('app.priceMultiplier')}: {hoveredSeat.multiplier}x</p>
        </div>
      )}
    </div>
  );
};

const TheaterCard = ({ theater, onView, onEdit, onDelete, t }) => {
  const totalScreens = theater.screens?.length || 0;
  const totalSeats = useMemo(() => theater.screens?.reduce((total, screen) => 
    total + (screen.seatRows?.reduce((sum, row) => sum + (row.endSeat - row.startSeat + 1), 0) || 0), 0
  ), [theater.screens]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="relative h-40 md:h-48 bg-gradient-to-r from-red-600 to-red-800">
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center">
          <div>
            <FaBuilding className="text-4xl md:text-5xl mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold">{theater.name}</h3>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${theater.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {theater.status}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FaMapMarkerAlt className="text-red-500" /> <span>{theater.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FaPhone className="text-green-500" /> <span>{theater.contactNumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          {[
            { icon: MdTheaters, value: totalScreens, label: t('app.screens') },
            { icon: FaTicketAlt, value: totalSeats, label: t('app.seats') },
            { icon: FaBuilding, value: theater.city, label: t('app.city') }
          ].map((item, i) => (
            <div key={i}>
              <item.icon className="text-xl mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {AMENITIES.filter(amenity => theater[amenity.key]).map(({ icon: Icon, name }) => (
            <div key={name} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
              <Icon /> <span>{name}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={() => onView(theater)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
            <FaTicketAlt /> {t('app.viewSeatLayout')}
          </button>
          <button onClick={() => onEdit(theater)} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg">
            <FaEdit />
          </button>
          <button onClick={() => onDelete(theater._id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add/Edit Theater Modal
const TheaterModal = ({ isOpen, onClose, onSubmit, theater, t }) => {
  const [formData, setFormData] = useState({
    name: theater?.name || '',
    location: theater?.location || '',
    city: theater?.city || '',
    contactNumber: theater?.contactNumber || '',
    status: theater?.status || 'ACTIVE',
    hasRecliner: theater?.hasRecliner || false,
    hasWifi: theater?.hasWifi || false,
    hasParking: theater?.hasParking || false,
    hasCafe: theater?.hasCafe || false,
    hasWheelchair: theater?.hasWheelchair || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{theater ? t('app.editTheater') : t('app.addTheater')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('app.theaterName')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('app.location')}</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('app.city')}</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('app.contactNumber')}</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('app.status')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="ACTIVE">{t('app.active')}</option>
              <option value="INACTIVE">{t('app.inactive')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('app.amenities')}</label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map(amenity => (
                <label key={amenity.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={amenity.key}
                    checked={formData[amenity.key]}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <amenity.icon /> {amenity.name}
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <FaSave /> {t('app.save')}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 py-2 rounded-lg">
              {t('app.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Screen Modal
const AddScreenModal = ({ isOpen, onClose, onSubmit, theaterId, t }) => {
  const [formData, setFormData] = useState({
    screenNumber: '',
    name: '',
    seatRows: [{ rowName: 'A', startSeat: 1, endSeat: 10, category: 'NORMAL', priceMultiplier: 1 }]
  });

  const addRow = () => {
    const nextRow = String.fromCharCode(65 + formData.seatRows.length);
    setFormData(prev => ({
      ...prev,
      seatRows: [...prev.seatRows, { rowName: nextRow, startSeat: 1, endSeat: 10, category: 'NORMAL', priceMultiplier: 1 }]
    }));
  };

  const updateRow = (index, field, value) => {
    const updatedRows = [...formData.seatRows];
    updatedRows[index][field] = value;
    setFormData(prev => ({ ...prev, seatRows: updatedRows }));
  };

  const removeRow = (index) => {
    setFormData(prev => ({
      ...prev,
      seatRows: prev.seatRows.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, theaterId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('app.addScreen')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('app.screenNumber')}</label>
              <input
                type="number"
                value={formData.screenNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, screenNumber: parseInt(e.target.value) }))}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('app.screenName')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium">{t('app.seatRows')}</label>
              <button type="button" onClick={addRow} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                <FaPlus /> {t('app.addRow')}
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.seatRows.map((row, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    placeholder={t('app.rowName')}
                    value={row.rowName}
                    onChange={(e) => updateRow(index, 'rowName', e.target.value.toUpperCase())}
                    required
                    className="px-2 py-1 border rounded dark:bg-gray-600"
                  />
                  <input
                    type="number"
                    placeholder={t('app.startSeat')}
                    value={row.startSeat}
                    onChange={(e) => updateRow(index, 'startSeat', parseInt(e.target.value))}
                    required
                    className="px-2 py-1 border rounded dark:bg-gray-600"
                  />
                  <input
                    type="number"
                    placeholder={t('app.endSeat')}
                    value={row.endSeat}
                    onChange={(e) => updateRow(index, 'endSeat', parseInt(e.target.value))}
                    required
                    className="px-2 py-1 border rounded dark:bg-gray-600"
                  />
                  <select
                    value={row.category}
                    onChange={(e) => updateRow(index, 'category', e.target.value)}
                    className="px-2 py-1 border rounded dark:bg-gray-600"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="EXECUTIVE">Executive</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t('app.priceMultiplier')}
                    value={row.priceMultiplier}
                    onChange={(e) => updateRow(index, 'priceMultiplier', parseFloat(e.target.value))}
                    required
                    className="px-2 py-1 border rounded dark:bg-gray-600"
                  />
                  {formData.seatRows.length > 1 && (
                    <button type="button" onClick={() => removeRow(index)} className="text-red-500 hover:text-red-700">
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <FaPlus /> {t('app.addScreen')}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 py-2 rounded-lg">
              {t('app.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Confirmation Modal
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <FaCheck /> {t('app.confirm')}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 py-2 rounded-lg">
            {t('app.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
function Theater() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [isTheaterModalOpen, setIsTheaterModalOpen] = useState(false);
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);
  const [deletingTheaterId, setDeletingTheaterId] = useState(null);
  const [deletingScreenId, setDeletingScreenId] = useState(null);
  
  const { data, isLoading, refetch } = useQuery({ 
    queryKey: ['allTheatersAdmin'], 
    queryFn: getAllTheatersAdmin 
  });
  const theaters = data?.data || [];

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTheater(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allTheatersAdmin']);
      setIsTheaterModalOpen(false);
      setEditingTheater(null);
    },
  });

  const addScreenMutation = useMutation({
    mutationFn: ({ id, data }) => addScreenToTheater(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allTheatersAdmin']);
      setIsScreenModalOpen(false);
    },
  });

  const deleteTheaterMutation = useMutation({
    mutationFn: (id) => deleteTheater(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allTheatersAdmin']);
      setDeletingTheaterId(null);
    },
  });

  const stats = useMemo(() => ({
    total: theaters.length,
    screens: theaters.reduce((sum, t) => sum + (t.screens?.length || 0), 0),
    active: theaters.filter(t => t.status === 'ACTIVE').length,
    cities: new Set(theaters.map(t => t.city)).size
  }), [theaters]);

  const handleEditTheater = (theater) => {
    setEditingTheater(theater);
    setIsTheaterModalOpen(true);
  };

  const handleUpdateTheater = (formData) => {
    updateMutation.mutate({ id: editingTheater._id, data: formData });
  };

  const handleDeleteTheater = (id) => {
    setDeletingTheaterId(id);
  };

  const confirmDeleteTheater = () => {
    if (deletingTheaterId) {
      deleteTheaterMutation.mutate(deletingTheaterId);
    }
  };

  const handleDeleteScreen = (screenId) => {
    setDeletingScreenId(screenId);
  };

  const confirmDeleteScreen = async () => {
    if (deletingScreenId && selectedTheater) {
      const updatedScreens = selectedTheater.screens.filter(s => s._id !== deletingScreenId);
      const updatedTheater = { ...selectedTheater, screens: updatedScreens };
      await updateMutation.mutateAsync({ id: selectedTheater._id, data: updatedTheater });
      setDeletingScreenId(null);
      if (selectedScreen?._id === deletingScreenId) {
        setSelectedScreen(updatedScreens[0] || null);
      }
    }
  };

  const handleAddScreen = (screenData) => {
    addScreenMutation.mutate({ id: screenData.theaterId, data: screenData });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (selectedTheater) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-600 text-white sticky top-0 z-10 shadow-lg p-4 md:p-6">
          <div className="container mx-auto flex justify-between items-center">
            <button onClick={() => { setSelectedTheater(null); setSelectedScreen(null); }} className="flex items-center gap-2 hover:text-red-200">
              <FaArrowLeft /> {t('common.back')}
            </button>
            <button onClick={() => setIsScreenModalOpen(true)} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <FaPlus /> {t('app.addScreen')}
            </button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedTheater.name}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-gray-600 dark:text-gray-400 text-sm">
                  <span className="flex items-center gap-1"><FaMapMarkerAlt /> {selectedTheater.location}</span>
                  <span className="flex items-center gap-1"><FaPhone /> {selectedTheater.contactNumber}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTheater.screens?.map(screen => (
                  <button key={screen._id} onClick={() => setSelectedScreen(screen)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${selectedScreen?._id === screen._id ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'}`}>
                    {t('app.screen')} {screen.screenNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {selectedScreen && (
            <ScreenView 
              screen={selectedScreen} 
              t={t} 
              onEditScreen={(screen) => {
                // Implement edit screen functionality
                console.log('Edit screen:', screen);
              }}
              onDeleteScreen={handleDeleteScreen}
            />
          )}
        </div>
        
        <AddScreenModal
          isOpen={isScreenModalOpen}
          onClose={() => setIsScreenModalOpen(false)}
          onSubmit={handleAddScreen}
          theaterId={selectedTheater._id}
          t={t}
        />
        
        <ConfirmModal
          isOpen={!!deletingScreenId}
          onClose={() => setDeletingScreenId(null)}
          onConfirm={confirmDeleteScreen}
          title={t('app.deleteScreen')}
          message={t('app.confirmDeleteScreen')}
          t={t}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-red-600 text-white sticky top-0 z-10 shadow-lg p-4 md:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">{t('app.theaterManagement')}</h1>
          <p className="text-red-100 text-sm mt-1">{t('app.manageTheaters')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('app.totalTheaters'), value: stats.total },
            { label: t('app.totalScreens'), value: stats.screens },
            { label: t('app.activeTheaters'), value: stats.active, color: 'text-green-600' },
            { label: t('app.totalCities'), value: stats.cities }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold">{t('app.allTheaters')}</h2>
          <button onClick={() => setIsTheaterModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
            <FaPlus /> {t('app.addTheater')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {theaters.map(theater => (
            <TheaterCard 
              key={theater._id} 
              theater={theater} 
              onView={(t) => { setSelectedTheater(t); setSelectedScreen(t.screens?.[0]); }} 
              onEdit={handleEditTheater}
              onDelete={handleDeleteTheater}
              t={t} 
            />
          ))}
        </div>

        {theaters.length === 0 && (
          <div className="text-center py-20">
            <FaBuilding className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold">{t('app.noTheaters')}</h3>
            <p className="text-gray-500 mt-2">{t('app.addFirstTheater')}</p>
          </div>
        )}
      </div>

      <TheaterModal
        isOpen={isTheaterModalOpen}
        onClose={() => { setIsTheaterModalOpen(false); setEditingTheater(null); }}
        onSubmit={editingTheater ? handleUpdateTheater : (data) => {
          // Implement add theater functionality
          console.log('Add theater:', data);
          setIsTheaterModalOpen(false);
        }}
        theater={editingTheater}
        t={t}
      />

      <ConfirmModal
        isOpen={!!deletingTheaterId}
        onClose={() => setDeletingTheaterId(null)}
        onConfirm={confirmDeleteTheater}
        title={t('app.deleteTheater')}
        message={t('app.confirmDeleteTheater')}
        t={t}
      />
    </div>
  );
}

export default Theater;