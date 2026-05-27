"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createShowAdmin } from "../../../services/adminCommunication";
import { getAllTheatersAdmin, getTheaterByIdAdmin } from "@/app/services/adminCommunication";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaFilm, FaCalendar, FaClock, FaTicketAlt, 
  FaStar, FaChair, FaSave, FaTimes,
  FaInfoCircle, FaDollarSign,
  FaBuilding, FaCheckCircle, FaSpinner, FaArrowLeft,
  FaArrowRight, FaCrown, FaRegGem, FaEye,
  FaChevronDown, FaChevronUp, FaPlus, FaTrash, FaCopy
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare, MdLocationOn, MdEventSeat } from 'react-icons/md';
import { GiFilmProjector } from 'react-icons/gi';

// Constants
const GENRES = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'ROMANCE', 'THRILLER', 'SCI-FI', 'ANIMATION', 'DOCUMENTARY'];
const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Punjabi'];

const CATEGORY_CONFIG = {
  NORMAL: { color: 'blue', icon: MdEventSeat, desc: 'Standard Seats', mult: '1×' },
  EXECUTIVE: { color: 'green', icon: FaStar, desc: 'Extra Legroom', mult: '1.5×' },
  PREMIUM: { color: 'purple', icon: FaRegGem, desc: 'Premium Comfort', mult: '2×' },
  VIP: { color: 'yellow', icon: FaCrown, desc: 'Luxury Experience', mult: '3×' }
};

const DEFAULT_SEAT_CATEGORIES = [
  { category: 'NORMAL', pricePerSeat: 150 },
  { category: 'EXECUTIVE', pricePerSeat: 220 },
  { category: 'PREMIUM', pricePerSeat: 300 },
  { category: 'VIP', pricePerSeat: 500 }
];

// ==================== SEAT LAYOUT PREVIEW COMPONENT ====================
const SeatLayoutPreview = ({ zones, screenPosition }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  
  if (!zones || zones.length === 0) {
    return (
      <div className="text-center py-8 text-foreground/40">
        <MdEventSeat className="text-4xl mx-auto mb-2 opacity-30" />
        <p className="text-xs">No zones configured for this screen</p>
      </div>
    );
  }
  
  const renderZoneSeats = (zone) => {
    if (!zone.rows || zone.rows.length === 0) {
      return <div className="text-center text-xs opacity-40 py-2">No seats in this zone</div>;
    }
    
    return zone.rows.map((row, rowIdx) => (
      <div key={row.rowId || rowIdx} className="flex items-center justify-center gap-1 mb-1">
        <div className="w-5 text-[8px] font-bold text-foreground/40 text-right">
          {row.rowName}
        </div>
        <div className="flex flex-wrap justify-center gap-0.5">
          {row.seats && row.seats.slice(0, 12).map((seat, seatIdx) => (
            <div
              key={seat.seatId || seatIdx}
              className="relative group"
            >
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm flex items-center justify-center text-[7px] sm:text-[8px] font-mono font-bold transition-all cursor-pointer hover:scale-110"
                style={{ 
                  background: `${zone.color}25`, 
                  color: zone.color, 
                  border: `1px solid ${zone.color}50`,
                }}
              >
                {seat.seatLabel || seat.seatNumber}
              </div>
            </div>
          ))}
          {row.seatCount > 12 && (
            <div className="w-5 h-5 rounded-sm flex items-center justify-center text-[7px] text-foreground/40 bg-foreground/5">
              +{row.seatCount - 12}
            </div>
          )}
        </div>
      </div>
    ));
  };
  
  const zonesByPosition = {
    top: zones.filter(z => z.position === 'top'),
    left: zones.filter(z => z.position === 'left'),
    center: zones.filter(z => z.position === 'center'),
    right: zones.filter(z => z.position === 'right'),
    bottom: zones.filter(z => z.position === 'bottom'),
  };
  
  return (
    <div className="bg-background border rounded-xl overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
      {screenPosition === "top" && (
        <div className="text-center py-2 bg-gradient-to-b from-red-500/10 to-transparent">
          <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold shadow-lg">
            🎬 SCREEN
          </div>
        </div>
      )}
      
      <div className="p-3">
        {/* Top Zones */}
        {zonesByPosition.top.length > 0 && (
          <div className="mb-3">
            <div className="text-center text-[9px] font-bold text-foreground/50 mb-1">⬆️ BALCONY</div>
            <div className="flex flex-wrap justify-center gap-3">
              {zonesByPosition.top.map(zone => (
                <div key={zone.id} className="bg-card rounded-lg p-2" style={{ border: `1px solid ${zone.color}30` }}>
                  <div className="text-center mb-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${zone.color}20`, color: zone.color }}>
                      {zone.name}
                    </span>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Left + Center + Right */}
        <div className="flex flex-wrap justify-center gap-3">
          {zonesByPosition.left.length > 0 && (
            <div className="flex-shrink-0">
              <div className="text-center text-[9px] font-bold text-foreground/50 mb-1">⬅️ LEFT</div>
              {zonesByPosition.left.map(zone => (
                <div key={zone.id} className="bg-card rounded-lg p-2 mb-2" style={{ border: `1px solid ${zone.color}30` }}>
                  <div className="text-center mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${zone.color}20`, color: zone.color }}>
                      {zone.name}
                    </span>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          )}
          
          {zonesByPosition.center.length > 0 && (
            <div className="flex-shrink-0">
              <div className="text-center text-[9px] font-bold text-foreground/50 mb-1">🎯 CENTER</div>
              {zonesByPosition.center.map(zone => (
                <div key={zone.id} className="bg-card rounded-lg p-2 mb-2 shadow-md" style={{ border: `2px solid ${zone.color}40` }}>
                  <div className="text-center mb-1">
                    <span className="text-[10px] font-bold px-3 py-0.5 rounded-full" style={{ background: `${zone.color}25`, color: zone.color }}>
                      {zone.name}
                    </span>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          )}
          
          {zonesByPosition.right.length > 0 && (
            <div className="flex-shrink-0">
              <div className="text-center text-[9px] font-bold text-foreground/50 mb-1">RIGHT ➡️</div>
              {zonesByPosition.right.map(zone => (
                <div key={zone.id} className="bg-card rounded-lg p-2 mb-2" style={{ border: `1px solid ${zone.color}30` }}>
                  <div className="text-center mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${zone.color}20`, color: zone.color }}>
                      {zone.name}
                    </span>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Bottom Zones */}
        {zonesByPosition.bottom.length > 0 && (
          <div className="mt-3">
            <div className="text-center text-[9px] font-bold text-foreground/50 mb-1">⬇️ FRONT</div>
            <div className="flex flex-wrap justify-center gap-3">
              {zonesByPosition.bottom.map(zone => (
                <div key={zone.id} className="bg-card rounded-lg p-2" style={{ border: `1px solid ${zone.color}30` }}>
                  <div className="text-center mb-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${zone.color}20`, color: zone.color }}>
                      {zone.name}
                    </span>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {screenPosition === "bottom" && (
        <div className="text-center py-2 bg-gradient-to-t from-red-500/10 to-transparent">
          <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold shadow-lg">
            🎬 SCREEN
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== SHOW TIMING COMPONENT ====================
const ShowTiming = ({ timing, index, onUpdate, onRemove, canRemove, onCopy }) => {
  return (
    <div className="rounded-xl p-4 transition-all duration-300 bg-background/30 border" style={{ borderColor: "var(--card-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-400">{index + 1}</span>
          </div>
          <span className="text-xs font-semibold text-foreground/60">Show Timing</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCopy(index)}
            className="p-1.5 rounded-lg transition-all hover:bg-blue-500/20"
            title="Copy timing"
          >
            <FaCopy className="text-xs text-blue-400" />
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 rounded-lg transition-all hover:bg-red-500/20"
              title="Remove timing"
            >
              <FaTrash className="text-xs text-red-400" />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-foreground/50">Date</label>
          <input
            type="date"
            value={timing.showDate}
            onChange={(e) => onUpdate(index, 'showDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-card border"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-foreground/50">Start Time</label>
          <input
            type="time"
            value={timing.startTime}
            onChange={(e) => onUpdate(index, 'startTime', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-card border"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-foreground/50">End Time</label>
          <input
            type="time"
            value={timing.endTime}
            onChange={(e) => onUpdate(index, 'endTime', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-card border"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
            required
          />
        </div>
      </div>
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ step, label, icon: Icon, isActive, isCompleted, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 relative group transition-all duration-500 ${isActive ? 'scale-105' : 'hover:scale-102'}`}
  >
    <div className="flex flex-col items-center gap-1">
      <div className={`
        relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
        ${isActive
          ? 'bg-gradient-primary shadow-lg shadow-blue-500/25 scale-110'
          : isCompleted
            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
            : 'bg-card border text-foreground/40'
        }
      `}
        style={!isActive && !isCompleted ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}>
        {isCompleted ? (
          <FaCheckCircle className="text-green-400 text-sm animate-in zoom-in duration-300" />
        ) : (
          <Icon className={`text-base transition-all duration-300 ${isActive ? 'text-white' : ''}`} />
        )}
      </div>
      <div className="text-center hidden sm:block">
        <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isActive ? '#3b82f6' : "var(--foreground)", opacity: isActive ? 1 : 0.4 }}>
          Step {step}
        </div>
        <div className="text-[10px] font-semibold" style={{ color: isActive ? "var(--foreground)" : "var(--foreground)", opacity: isActive ? 1 : 0.4 }}>
          {label}
        </div>
      </div>
    </div>
  </button>
);

// Main Component
export default function CreateShow() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [screenZones, setScreenZones] = useState([]);
  const [screenPosition, setScreenPosition] = useState('top');
  
  // ✅ Multiple Timings State
  const [showTimings, setShowTimings] = useState([
    { showDate: '', startTime: '', endTime: '' }
  ]);
  
  // Form State
  const [formData, setFormData] = useState({
    theaterId: '',
    screenId: '',
    screenNumber: '',
    movie: {
      name: '',
      poster: '',
      genre: 'ACTION',
      duration: '',
      rating: '',
      description: '',
      language: 'Hindi',
      isTrending: false,
      releaseDate: ''
    },
    seatCategories: [...DEFAULT_SEAT_CATEGORIES],
    isPaid: true,
    basePrice: 150
  });

  // Fetch Theaters
  const { data: theatersData, isLoading: isLoadingTheaters } = useQuery({
    queryKey: ['allTheatersAdmin'],
    queryFn: getAllTheatersAdmin,
  });

  const theaters = theatersData?.data || [];

  // Fetch full theater details when a theater is selected
  const { data: theaterDetail, isLoading: isLoadingTheaterDetail } = useQuery({
    queryKey: ['theaterDetail', formData.theaterId],
    queryFn: () => getTheaterByIdAdmin(formData.theaterId),
    enabled: !!formData.theaterId,
  });

  // Update selected theater when details load
  useEffect(() => {
    if (theaterDetail?.data) {
      setSelectedTheater(theaterDetail.data);
      setScreenPosition(theaterDetail.data.screenPosition || 'top');
    }
  }, [theaterDetail]);

  // Update screen zones when screen is selected
  useEffect(() => {
    if (selectedTheater && formData.screenId) {
      const screen = selectedTheater.screens?.find(s => s._id === formData.screenId);
      if (screen) {
        setSelectedScreen(screen);
        setScreenZones(screen.zones || []);
      }
    }
  }, [selectedTheater, formData.screenId]);

  // ✅ Timing Handlers
  const handleAddTiming = useCallback(() => {
    setShowTimings(prev => [...prev, { showDate: '', startTime: '', endTime: '' }]);
  }, []);

  const handleRemoveTiming = useCallback((index) => {
    if (showTimings.length > 1) {
      setShowTimings(prev => prev.filter((_, i) => i !== index));
    } else {
      toast.error('At least one show timing is required');
    }
  }, [showTimings.length]);

  const handleUpdateTiming = useCallback((index, field, value) => {
    setShowTimings(prev => prev.map((timing, i) => 
      i === index ? { ...timing, [field]: value } : timing
    ));
  }, []);

  const handleCopyTiming = useCallback((index) => {
    const timingToCopy = showTimings[index];
    setShowTimings(prev => [...prev, { ...timingToCopy }]);
    toast.success('Timing copied!');
  }, [showTimings]);

  // Create show mutation
  const createMutation = useMutation({
    mutationFn: createShowAdmin,
    onSuccess: () => {
      toast.success(`Show created with ${showTimings.length} timings! 🎬`);
      setTimeout(() => router.push('/admin/shows'), 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create show');
    }
  });

  const handleTheaterChange = useCallback((theater) => {
    setSelectedTheater(null);
    setSelectedScreen(null);
    setScreenZones([]);
    setFormData(prev => ({
      ...prev,
      theaterId: theater._id,
      screenId: '',
      screenNumber: ''
    }));
  }, []);

  const handleScreenChange = useCallback((screen) => {
    setSelectedScreen(screen);
    setScreenZones(screen.zones || []);
    setFormData(prev => ({
      ...prev,
      screenId: screen._id,
      screenNumber: screen.screenNumber
    }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('movie.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        movie: { ...prev.movie, [field]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  }, []);

  const handleCategoryChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const updatedCategories = [...prev.seatCategories];
      updatedCategories[index][field] = value;
      return { ...prev, seatCategories: updatedCategories };
    });
  }, []);

  const handlePosterChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          movie: { ...prev.movie, poster: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const validateForm = useCallback(() => {
    const validations = [
      { condition: !formData.theaterId, message: 'Please select a theater' },
      { condition: !formData.screenId, message: 'Please select a screen' },
      { condition: !formData.movie.name, message: 'Please enter movie name' },
      { condition: !formData.movie.duration, message: 'Please enter movie duration' },
      { condition: !formData.movie.rating, message: 'Please enter movie rating' }
    ];
    
    // ✅ Validate timings
    for (let i = 0; i < showTimings.length; i++) {
      const timing = showTimings[i];
      if (!timing.showDate) {
        validations.push({ condition: true, message: `Timing ${i + 1}: Please select show date` });
        break;
      }
      if (!timing.startTime) {
        validations.push({ condition: true, message: `Timing ${i + 1}: Please select start time` });
        break;
      }
      if (!timing.endTime) {
        validations.push({ condition: true, message: `Timing ${i + 1}: Please select end time` });
        break;
      }
    }
    
    const failed = validations.find(v => v.condition);
    if (failed) {
      toast.error(failed.message);
      return false;
    }
    return true;
  }, [formData, showTimings]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }
    
    // ✅ Build timings array for backend
    const timingsData = showTimings.map(timing => ({
      showDate: timing.showDate,
      startTime: timing.startTime,
      endTime: timing.endTime,
      seatCategories: formData.seatCategories.map(cat => ({
        category: cat.category,
        pricePerSeat: parseInt(cat.pricePerSeat)
      }))
    }));
    
    const submitData = {
      theaterId: formData.theaterId,
      screenId: formData.screenId,
      screenNumber: parseInt(formData.screenNumber),
      movie: {
        name: formData.movie.name,
        poster: formData.movie.poster,
        genre: formData.movie.genre,
        duration: parseInt(formData.movie.duration),
        rating: parseFloat(formData.movie.rating),
        description: formData.movie.description || '',
        language: formData.movie.language,
        isTrending: formData.movie.isTrending,
        releaseDate: formData.movie.releaseDate || new Date().toISOString().split('T')[0]
      },
      timings: timingsData,  // ✅ Send multiple timings
      seatCategories: formData.seatCategories.map(cat => ({
        category: cat.category,
        pricePerSeat: parseInt(cat.pricePerSeat)
      })),
      isPaid: formData.isPaid,
      basePrice: parseInt(formData.basePrice)
    };
    
    console.log("📦 Submitting Show Data with", timingsData.length, "timings:", submitData);
    createMutation.mutate(submitData);
  }, [formData, validateForm, createMutation, showTimings]);

  const steps = useMemo(() => [
    { id: 'basic', label: 'Theater & Timings', icon: MdTheaters },
    { id: 'movie', label: 'Movie Details', icon: FaFilm },
    { id: 'seats', label: 'Seat Pricing', icon: FaChair }
  ], []);

  const currentStepIndex = steps.findIndex(s => s.id === activeTab);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const previewStats = useMemo(() => {
    const prices = formData.seatCategories.map(cat => cat.pricePerSeat);
    return {
      totalCategories: formData.seatCategories.length,
      avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
      highestPrice: Math.max(...prices),
      lowestPrice: Math.min(...prices),
    };
  }, [formData.seatCategories]);

  const handleNext = useCallback(() => {
    if (activeTab === 'basic') {
      if (!formData.theaterId || !formData.screenId) {
        toast.error('Please select theater and screen');
        return;
      }
      // ✅ Check if at least one timing has data
      const hasValidTiming = showTimings.some(t => t.showDate && t.startTime && t.endTime);
      if (!hasValidTiming) {
        toast.error('Please add at least one valid show timing');
        return;
      }
      setActiveTab('movie');
    } else if (activeTab === 'movie') {
      if (!formData.movie.name || !formData.movie.duration || !formData.movie.rating) {
        toast.error('Please fill all required movie fields');
        return;
      }
      setActiveTab('seats');
    }
  }, [activeTab, formData, showTimings]);

  const handleBack = useCallback(() => {
    if (activeTab === 'movie') setActiveTab('basic');
    if (activeTab === 'seats') setActiveTab('movie');
  }, [activeTab]);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-background" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="sticky top-0 z-[100] shadow-lg transition-all duration-300 bg-card/90 backdrop-blur-md border-b"
        style={{ background: "rgba(var(--card), 0.9)", borderColor: "var(--card-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-primary animate-pulse blur-lg opacity-50" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-xl">
                  <GiFilmProjector className="text-white text-base animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  Create New Show
                </h1>
                <p className="text-[10px] sm:text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Add a new movie screening with multiple show timings
                </p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 bg-card border hover:bg-red-500/10"
              style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <FaTimes className="text-xs" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Step Indicators */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, idx) => (
              <StepIndicator
                key={step.id}
                step={idx + 1}
                label={step.label}
                icon={step.icon}
                isActive={activeTab === step.id}
                isCompleted={steps.findIndex(s => s.id === activeTab) > idx}
                onClick={() => steps.findIndex(s => s.id === activeTab) > idx && setActiveTab(step.id)}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rounded-xl shadow-xl transition-all duration-300 overflow-hidden bg-card border"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>

            {/* Basic Info Tab - Theater & Multiple Timings */}
            {activeTab === 'basic' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 rounded-full bg-gradient-primary" />
                  </div>
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>
                    Theater & Show Timings
                  </h2>
                  <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Choose the venue and add multiple show timings for this movie
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Theater Selection */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      <FaBuilding className="text-red-500" /> Select Theater
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {isLoadingTheaters ? (
                        <div className="col-span-3 flex items-center justify-center py-8">
                          <FaSpinner className="animate-spin text-xl text-blue-500" />
                        </div>
                      ) : (
                        theaters.map(theater => (
                          <div
                            key={theater._id}
                            onClick={() => handleTheaterChange(theater)}
                            className={`cursor-pointer rounded-xl p-3 transition-all duration-300 hover:scale-105 ${
                              formData.theaterId === theater._id
                                ? 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent'
                                : 'bg-card border hover:border-blue-500/50'
                            }`}
                            style={formData.theaterId !== theater._id ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                formData.theaterId === theater._id ? 'bg-blue-500' : 'bg-background border'
                              }`}
                                style={formData.theaterId !== theater._id ? { background: "var(--background)", borderColor: "var(--card-border)" } : {}}>
                                <MdTheaters className={`text-base ${formData.theaterId === theater._id ? 'text-white' : 'text-blue-500'}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{theater.name}</h3>
                                <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                                  <MdLocationOn className="text-[8px]" />
                                  {theater.location}, {theater.city}
                                </p>
                                <p className="text-[9px] mt-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                                  📺 {theater.screens?.length || 0} Screens • 💺 {theater.totalSeats || 0} Seats
                                </p>
                              </div>
                              {formData.theaterId === theater._id && (
                                <FaCheckCircle className="text-green-500 text-xs animate-in zoom-in" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Screen Selection */}
                  {selectedTheater && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                        <MdScreenShare className="text-purple-500" /> Select Screen
                      </label>
                      
                      {isLoadingTheaterDetail ? (
                        <div className="flex items-center justify-center py-8">
                          <FaSpinner className="animate-spin text-xl text-purple-500" />
                          <span className="ml-2 text-sm text-foreground/50">Loading screens...</span>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {selectedTheater.screens?.map(screen => (
                              <div
                                key={screen._id}
                                onClick={() => handleScreenChange(screen)}
                                className={`cursor-pointer rounded-xl p-3 text-center transition-all duration-300 hover:scale-105 ${
                                  formData.screenId === screen._id
                                    ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-500/10 to-transparent'
                                    : 'bg-card border hover:border-purple-500/50'
                                }`}
                                style={formData.screenId !== screen._id ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}
                              >
                                <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                                  formData.screenId === screen._id ? 'bg-purple-500' : 'bg-background border'
                                }`}
                                  style={formData.screenId !== screen._id ? { background: "var(--background)", borderColor: "var(--card-border)" } : {}}>
                                  <MdScreenShare className={`text-lg ${formData.screenId === screen._id ? 'text-white' : 'text-purple-500'}`} />
                                </div>
                                <div className="font-extrabold text-base" style={{ color: "var(--foreground)" }}>
                                  {screen.name || `Screen ${screen.screenNumber}`}
                                </div>
                                <div className="text-[9px] mt-0.5" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                                  {screen.zones?.length || 0} zones • {screen.totalSeatsInScreen || 0} seats
                                </div>
                                {formData.screenId === screen._id && (
                                  <FaCheckCircle className="text-green-500 text-xs mx-auto mt-2 animate-in zoom-in" />
                                )}
                              </div>
                            ))}
                          </div>

                          {/* 2D Seat Layout Preview */}
                          {selectedScreen && formData.screenId === selectedScreen._id && screenZones.length > 0 && (
                            <div className="mt-4 rounded-xl overflow-hidden border" style={{ borderColor: "var(--card-border)" }}>
                              <div className="bg-foreground/5 px-4 py-2 border-b" style={{ borderColor: "var(--card-border)" }}>
                                <div className="flex items-center gap-2">
                                  <FaEye className="text-blue-500 text-xs" />
                                  <span className="text-xs font-semibold text-foreground/70">2D Seat Layout Preview</span>
                                </div>
                              </div>
                              <div className="p-3">
                                <SeatLayoutPreview zones={screenZones} screenPosition={screenPosition} />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ✅ MULTIPLE SHOW TIMINGS SECTION */}
                  {selectedScreen && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                          <FaCalendar className="text-green-500" /> Show Timings ({showTimings.length})
                        </label>
                        <button
                          type="button"
                          onClick={handleAddTiming}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 text-xs font-semibold hover:bg-green-500/30 transition-all"
                        >
                          <FaPlus className="text-[10px]" /> Add Timing
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {showTimings.map((timing, index) => (
                          <ShowTiming
                            key={index}
                            timing={timing}
                            index={index}
                            onUpdate={handleUpdateTiming}
                            onRemove={handleRemoveTiming}
                            onCopy={handleCopyTiming}
                            canRemove={showTimings.length > 1}
                          />
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-[10px] text-blue-400 flex items-center gap-1">
                          <FaInfoCircle className="text-[10px]" />
                          You can add multiple show timings for the same movie on different dates or times
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Paid/Free Show Toggle */}
                  <div className="rounded-xl p-4 transition-all duration-300 bg-background/30 border" style={{ borderColor: "var(--card-border)" }}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            name="isPaid"
                            checked={formData.isPaid}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded border-2 focus:ring-green-500 transition-all"
                          />
                          <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                            Paid Show
                          </span>
                        </label>

                        {formData.isPaid && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                              Base Price:
                            </span>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-500 font-bold text-xs">₹</span>
                              <input
                                type="number"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleInputChange}
                                className="w-24 pl-5 pr-2 py-1.5 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-green-500 bg-background border"
                                style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {!formData.isPaid && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-green-500">Free Show</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Movie Details Tab (Same as before) */}
            {activeTab === 'movie' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 rounded-full bg-gradient-primary" />
                  </div>
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>
                    Movie Information
                  </h2>
                  <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Enter all details about the film
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Movie Name
                    </label>
                    <input
                      type="text"
                      name="movie.name"
                      value={formData.movie.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Jawan, Pathaan, Animal"
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Genre
                    </label>
                    <select
                      name="movie.genre"
                      value={formData.movie.genre}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    >
                      {GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Language
                    </label>
                    <select
                      name="movie.language"
                      value={formData.movie.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    >
                      {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="movie.duration"
                      value={formData.movie.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 170"
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Rating (0-10)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      name="movie.rating"
                      value={formData.movie.rating}
                      onChange={handleInputChange}
                      placeholder="e.g., 8.5"
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Release Date
                    </label>
                    <input
                      type="date"
                      name="movie.releaseDate"
                      value={formData.movie.releaseDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Description
                    </label>
                    <textarea
                      name="movie.description"
                      value={formData.movie.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Brief description about the movie..."
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none bg-background border"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Movie Poster
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterChange}
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-2 file:py-1 file:px-3 file:rounded-lg file:text-xs file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 bg-background border"
                          style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="movie.isTrending"
                          checked={formData.movie.isTrending}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-2 focus:ring-red-500 transition-all"
                        />
                        <span className="text-xs font-semibold group-hover:text-red-500 transition-colors" style={{ color: "var(--foreground)" }}>
                          Mark as Trending
                        </span>
                      </label>
                    </div>
                    {posterPreview && (
                      <div className="mt-3 animate-in fade-in zoom-in duration-300">
                        <img src={posterPreview} alt="Preview" className="h-28 w-auto rounded-lg object-cover shadow-lg border-2 border-blue-500/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seat Pricing Tab (Same as before) */}
            {activeTab === 'seats' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 rounded-full bg-gradient-primary" />
                  </div>
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>
                    Seat Categories & Pricing
                  </h2>
                  <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Configure pricing for different seat types
                  </p>
                </div>

                {/* Stats Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-lg p-3 text-center bg-card border" style={{ borderColor: "var(--card-border)" }}>
                    <div className="text-xl font-black text-blue-500">{previewStats.totalCategories}</div>
                    <div className="text-[9px] opacity-60">Categories</div>
                  </div>
                  <div className="rounded-lg p-3 text-center bg-card border" style={{ borderColor: "var(--card-border)" }}>
                    <div className="text-xl font-black text-green-500">₹{previewStats.avgPrice}</div>
                    <div className="text-[9px] opacity-60">Avg Price</div>
                  </div>
                  <div className="rounded-lg p-3 text-center bg-card border" style={{ borderColor: "var(--card-border)" }}>
                    <div className="text-xl font-black text-yellow-500">₹{previewStats.highestPrice}</div>
                    <div className="text-[9px] opacity-60">Highest</div>
                  </div>
                  <div className="rounded-lg p-3 text-center bg-card border" style={{ borderColor: "var(--card-border)" }}>
                    <div className="text-xl font-black text-purple-500">₹{previewStats.lowestPrice}</div>
                    <div className="text-[9px] opacity-60">Lowest</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.seatCategories.map((category, index) => {
                    const config = CATEGORY_CONFIG[category.category] || CATEGORY_CONFIG.NORMAL;
                    const Icon = config.icon;
                    return (
                      <div key={category.category} className="rounded-xl p-4 transition-all duration-300 bg-card border" style={{ borderColor: `var(--${config.color}-500/30)` }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${config.color}-500/20`}>
                              <Icon className={`text-base text-${config.color}-400`} />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-sm" style={{ color: "var(--foreground)" }}>{category.category}</h3>
                              <p className="text-[9px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>{config.desc} • {config.mult}</p>
                            </div>
                          </div>
                          <div className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-background" style={{ background: "var(--background)" }}>
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                            Price per Seat
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-green-500">₹</span>
                            <input
                              type="number"
                              value={category.pricePerSeat}
                              onChange={(e) => handleCategoryChange(index, 'pricePerSeat', parseInt(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 rounded-lg text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-green-500 bg-background border"
                              style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-sm mt-0.5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold mb-0.5 text-blue-400">Seat Layout Information</p>
                      <p className="text-[10px] text-blue-300/70">
                        Seat layout will be automatically generated based on the theater screen configuration.
                        These pricing will apply to ALL show timings you&apos;ve added.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="border-t p-4 flex justify-between" style={{ borderColor: "var(--card-border)" }}>
              {!isFirstStep ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="group flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border hover:bg-card/50"
                  style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="group flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-primary text-white font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  Next
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="group flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Creating {showTimings.length} Timing{showTimings.length > 1 ? 's' : ''}...
                    </>
                  ) : (
                    <>
                      <FaSave className="text-sm group-hover:scale-110 transition-transform" />
                      Create Show {showTimings.length > 1 ? `(${showTimings.length} Timings)` : ''}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}