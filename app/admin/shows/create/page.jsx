"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createShow } from "@/app/services/adminCommunication";
import { getAllTheatersAdmin } from "@/app/services/adminCommunication";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaFilm, FaCalendar, FaClock, FaTicketAlt, 
  FaStar, FaChair, FaSave, FaTimes,
  FaInfoCircle, FaDollarSign,
  FaBuilding, FaCheckCircle, FaSpinner, FaArrowLeft,
  FaArrowRight, FaCrown, FaRegGem
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

// Step Indicator Component
const StepIndicator = ({ step, label, icon: Icon, isActive, isCompleted, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 relative group transition-all duration-500 ${isActive ? 'scale-105' : 'hover:scale-102'}`}
  >
    <div className="flex flex-col items-center gap-2">
      <div className={`
        relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
        ${isActive
          ? 'bg-gradient-primary shadow-lg shadow-blue-500/25 scale-110'
          : isCompleted
            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
            : 'bg-card border text-foreground/40'
        }
      `}
        style={!isActive && !isCompleted ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}>
        {isCompleted ? (
          <FaCheckCircle className="text-green-400 text-xl animate-in zoom-in duration-300" />
        ) : (
          <Icon className={`text-xl transition-all duration-300 ${isActive ? 'text-white' : ''}`} />
        )}
        {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-primary animate-pulse opacity-50 -z-10" />}
      </div>
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-300"
          style={{ color: isActive ? '#3b82f6' : "var(--foreground)", opacity: isActive ? 1 : 0.4 }}>
          Step {step}
        </div>
        <div className="text-xs font-semibold transition-colors duration-300"
          style={{ color: isActive ? "var(--foreground)" : "var(--foreground)", opacity: isActive ? 1 : 0.4 }}>
          {label}
        </div>
      </div>
    </div>
    {step < 3 && (
      <div className="absolute right-0 top-5 w-full h-px transition-all duration-300"
        style={{ right: '-50%', width: '100%', background: isCompleted ? 'var(--gradient-primary)' : "var(--card-border)" }} />
    )}
  </button>
);

// Stats Preview Card
const StatsPreviewCard = ({ label, value, icon: Icon, color }) => (
  <div className="group rounded-xl p-4 flex items-center justify-between shadow-sm transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105 bg-card border hover:border-blue-500/50"
    style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
    <div className={`absolute inset-0 bg-gradient-to-r from-${color}-500/0 via-${color}-500/5 to-${color}-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--foreground)", opacity: 0.4 }}>{label}</div>
      <div className="text-[28px] font-black tracking-tighter leading-none" style={{ color: "var(--foreground)" }}>{value}</div>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 bg-${color}-500/10 border`}
      style={{ borderColor: "var(--card-border)" }}>
      <Icon className={`text-lg transition-transform group-hover:scale-110 text-${color}-400`} />
    </div>
  </div>
);

// Category Card Component
const CategoryCard = ({ category, index, onUpdate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = CATEGORY_CONFIG[category.category] || CATEGORY_CONFIG.NORMAL;
  const Icon = config.icon;

  return (
    <div
      className={`group relative rounded-2xl p-5 transition-all duration-500 cursor-pointer overflow-hidden ${
        isHovered ? 'scale-105 shadow-2xl' : 'shadow-md'
      } bg-card border`}
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-${config.color}-500/0 via-${config.color}-500/5 to-${config.color}-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 bg-${config.color}-900/30 border`}
            style={{ borderColor: "var(--card-border)" }}>
            <Icon className={`text-xl transition-all text-${config.color}-400`} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>{category.category}</h3>
            <p className="text-[11px] font-medium" style={{ color: "var(--foreground)", opacity: 0.4 }}>
              {config.desc} • {config.mult} price
            </p>
          </div>
        </div>
        <div className="px-2 py-1 rounded-lg text-[10px] font-black bg-background text-foreground/60"
          style={{ background: "var(--background)", color: "var(--foreground)", opacity: 0.6 }}>
          #{index + 1}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.4 }}>
            <FaDollarSign className="inline mr-1 text-green-500" /> Price per Seat
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: "var(--foreground)", opacity: 0.4 }}>₹</span>
            <input
              type="number"
              value={category.pricePerSeat}
              onChange={(e) => onUpdate(index, 'pricePerSeat', parseInt(e.target.value) || 0)}
              className={`w-full pl-7 pr-4 py-3 rounded-xl text-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-${config.color}-500 bg-background border`}
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            />
          </div>
        </div>

        <div className={`h-1 rounded-full overflow-hidden bg-gradient-to-r from-${config.color}-500/20 to-${config.color}-500/80 transition-all duration-300`}>
          <div className={`h-full bg-gradient-to-r from-${config.color}-500 to-${config.color}-400 transition-all duration-500`}
               style={{ width: `${Math.min((category.pricePerSeat / 1000) * 100, 100)}%` }} />
        </div>
      </div>

      {isHovered && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-primary animate-pulse" />}
    </div>
  );
};

// Main Component
export default function CreateShow() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  
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
    showDate: '',
    startTime: '',
    endTime: '',
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

  // Create show mutation
  const createMutation = useMutation({
    mutationFn: createShow,
    onSuccess: () => {
      toast.success('Show created successfully! 🎬');
      setTimeout(() => router.push('/admin/shows'), 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create show');
    }
  });

  // Handlers with useCallback
  const handleTheaterChange = useCallback((theaterId) => {
    const theater = theaters.find(t => t._id === theaterId);
    setSelectedTheater(theater);
    setFormData(prev => ({
      ...prev,
      theaterId: theaterId,
      screenId: '',
      screenNumber: ''
    }));
  }, [theaters]);

  const handleScreenChange = useCallback((screenId) => {
    const screen = selectedTheater?.screens?.find(s => s._id === screenId);
    if (screen) {
      setFormData(prev => ({
        ...prev,
        screenId: screenId,
        screenNumber: screen.screenNumber
      }));
    }
  }, [selectedTheater]);

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
      { condition: !formData.movie.rating, message: 'Please enter movie rating' },
      { condition: !formData.showDate, message: 'Please select show date' },
      { condition: !formData.startTime, message: 'Please select start time' },
      { condition: !formData.endTime, message: 'Please select end time' }
    ];
    
    const failed = validations.find(v => v.condition);
    if (failed) {
      toast.error(failed.message);
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }
    
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
      showDate: formData.showDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      seatCategories: formData.seatCategories.map(cat => ({
        category: cat.category,
        pricePerSeat: parseInt(cat.pricePerSeat)
      })),
      isPaid: formData.isPaid,
      basePrice: parseInt(formData.basePrice)
    };
    
    createMutation.mutate(submitData);
  }, [formData, validateForm, createMutation]);

  const steps = useMemo(() => [
    { id: 'basic', label: 'Theater & Timing', icon: MdTheaters },
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
      if (!formData.theaterId || !formData.screenId || !formData.showDate || !formData.startTime || !formData.endTime) {
        toast.error('Please fill all required fields');
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
  }, [activeTab, formData]);

  const handleBack = useCallback(() => {
    if (activeTab === 'movie') setActiveTab('basic');
    if (activeTab === 'seats') setActiveTab('movie');
  }, [activeTab]);

  // Render Functions
  const renderTheaterSelection = () => (
    <div className="lg:col-span-2 rounded-xl p-6 transition-all duration-300 bg-background/50 border"
      style={{ background: "rgba(var(--background), 0.5)", borderColor: "var(--card-border)" }}>
      <label className="text-[11px] font-bold uppercase tracking-wider mb-3 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
        <FaBuilding className="text-red-500" /> Select Theater
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoadingTheaters ? (
          <div className="col-span-2 flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-2xl text-blue-500" />
          </div>
        ) : (
          theaters.map(theater => (
            <div
              key={theater._id}
              onClick={() => handleTheaterChange(theater._id)}
              className={`cursor-pointer rounded-xl p-4 transition-all duration-300 hover:scale-105 ${
                formData.theaterId === theater._id
                  ? 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent'
                  : 'bg-card border hover:border-blue-500/50'
              }`}
              style={formData.theaterId !== theater._id ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  formData.theaterId === theater._id ? 'bg-blue-500' : 'bg-background border'
                }`}
                  style={formData.theaterId !== theater._id ? { background: "var(--background)", borderColor: "var(--card-border)" } : {}}>
                  <MdTheaters className={`text-lg ${formData.theaterId === theater._id ? 'text-white' : 'text-blue-500'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold" style={{ color: "var(--foreground)" }}>{theater.name}</h3>
                  <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                    <MdLocationOn className="text-[10px]" />
                    {theater.location}, {theater.city}
                  </p>
                  <p className="text-[10px] mt-2 font-semibold" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    📺 {theater.screens?.length || 0} Screens
                  </p>
                </div>
                {formData.theaterId === theater._id && (
                  <FaCheckCircle className="text-green-500 text-sm animate-in zoom-in" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderScreenSelection = () => selectedTheater && (
    <div className="lg:col-span-2">
      <label className="text-[11px] font-bold uppercase tracking-wider mb-3 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
        <MdScreenShare className="text-purple-500" /> Select Screen
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedTheater.screens?.map(screen => (
          <div
            key={screen._id}
            onClick={() => handleScreenChange(screen._id)}
            className={`cursor-pointer rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 ${
              formData.screenId === screen._id
                ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-500/10 to-transparent'
                : 'bg-card border hover:border-purple-500/50'
            }`}
            style={formData.screenId !== screen._id ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}
          >
            <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
              formData.screenId === screen._id ? 'bg-purple-500' : 'bg-background border'
            }`}
              style={formData.screenId !== screen._id ? { background: "var(--background)", borderColor: "var(--card-border)" } : {}}>
              <MdScreenShare className={`text-xl ${formData.screenId === screen._id ? 'text-white' : 'text-purple-500'}`} />
            </div>
            <div className="font-extrabold text-lg" style={{ color: "var(--foreground)" }}>
              Screen {screen.screenNumber}
            </div>
            <div className="text-[10px] mt-1" style={{ color: "var(--foreground)", opacity: 0.4 }}>
              {screen.name || 'Standard Screen'}
            </div>
            {formData.screenId === screen._id && (
              <FaCheckCircle className="text-green-500 text-xs mx-auto mt-2 animate-in zoom-in" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-300 bg-background" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" toastOptions={{
        className: "!rounded-xl !text-sm !font-semibold !shadow-xl !bg-card !text-foreground !border",
        style: { borderColor: "var(--card-border)" },
        duration: 3000
      }} />

      {/* Header */}
      <div className="sticky top-0 z-[100] shadow-lg transition-all duration-300 bg-card/90 backdrop-blur-md border-b"
        style={{ background: "rgba(var(--card), 0.9)", borderColor: "var(--card-border)" }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-primary animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-xl">
                  <GiFilmProjector className="text-white text-xl animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  Create New Show
                </h1>
                <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Add a new movie screening to the system
                </p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 bg-card border hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
              style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}
            >
              <FaTimes className="text-sm group-hover:rotate-90 transition-transform duration-300" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Step Indicators */}
        <div className="max-w-3xl mx-auto mb-12">
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
          <div className="rounded-2xl shadow-xl transition-all duration-300 overflow-hidden bg-card border"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-1 rounded-full bg-gradient-primary" />
                    <div className="w-6 h-1 rounded-full bg-gradient-primary" />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>
                    Theater & Screen Selection
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Choose the venue and schedule for your show
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderTheaterSelection()}
                  {renderScreenSelection()}

                  {/* Show Date */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      <FaCalendar className="text-blue-500" /> Show Date
                    </label>
                    <input
                      type="date"
                      name="showDate"
                      value={formData.showDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border border-gray-800 text-foreground"
                      required
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      <FaClock className="text-green-500" /> Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border border-gray-800 text-foreground"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      <FaClock className="text-red-500" /> End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border border-gray-800 text-foreground"
                      required
                    />
                  </div>

                  {/* Paid/Free Show Toggle */}
                  <div className="lg:col-span-2">
                    <div className="rounded-xl p-5 transition-all duration-300 bg-background/30 border border-gray-800">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              name="isPaid"
                              checked={formData.isPaid}
                              onChange={handleInputChange}
                              className="w-5 h-5 rounded-lg border-2 border-gray-300 checked:bg-green-500 checked:border-green-500 focus:ring-green-500 transition-all"
                            />
                            <span className="font-bold" style={{ color: "var(--foreground)" }}>
                              Paid Show
                            </span>
                          </label>

                          {formData.isPaid && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                                Base Price:
                              </span>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">₹</span>
                                <input
                                  type="number"
                                  name="basePrice"
                                  value={formData.basePrice}
                                  onChange={handleInputChange}
                                  className="w-32 pl-7 pr-3 py-2 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-green-500 bg-background border border-gray-800 text-foreground"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {!formData.isPaid && (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-green-500">Free Show - No payment required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Movie Details Tab */}
            {activeTab === 'movie' && (
              <div className="p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-1 rounded-full bg-gradient-primary" />
                    <div className="w-6 h-1 rounded-full bg-gradient-primary" />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>
                    Movie Information
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Enter all details about the film
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Movie Name
                    </label>
                    <input
                      type="text"
                      name="movie.name"
                      value={formData.movie.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Jawan, Pathaan, Animal"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border border-gray-800 text-foreground placeholder:text-foreground/30"
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
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer bg-background border border-gray-800 text-foreground"
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
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer bg-background border border-gray-800 text-foreground"
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
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border border-gray-800 text-foreground placeholder:text-foreground/30"
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
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border border-gray-800 text-foreground placeholder:text-foreground/30"
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
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border border-gray-800 text-foreground"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Description
                    </label>
                    <textarea
                      name="movie.description"
                      value={formData.movie.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Brief description about the movie..."
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none bg-background border border-gray-800 text-foreground placeholder:text-foreground/30"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Movie Poster
                    </label>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterChange}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 bg-background border border-gray-800 text-foreground"
                        />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="movie.isTrending"
                          checked={formData.movie.isTrending}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded-lg border-2 border-gray-300 checked:bg-red-500 checked:border-red-500 focus:ring-red-500 transition-all"
                        />
                        <span className="text-sm font-semibold group-hover:text-red-500 transition-colors" style={{ color: "var(--foreground)" }}>
                          Mark as Trending
                        </span>
                      </label>
                    </div>
                    {posterPreview && (
                      <div className="mt-4 animate-in fade-in zoom-in duration-300">
                        <div className="relative inline-block">
                          <img src={posterPreview} alt="Preview" className="h-40 w-auto rounded-xl object-cover shadow-lg border-2 border-blue-500/30" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                            <FaCheckCircle className="text-white text-xs" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seat Pricing Tab */}
            {activeTab === 'seats' && (
              <div className="p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-1 rounded-full bg-gradient-primary" />
                    <div className="w-6 h-1 rounded-full bg-gradient-primary" />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>
                    Seat Categories & Pricing
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Configure pricing for different seat types
                  </p>
                </div>

                {/* Stats Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <StatsPreviewCard label="Categories" value={previewStats.totalCategories} icon={FaChair} color="blue" />
                  <StatsPreviewCard label="Avg Price" value={`₹${previewStats.avgPrice}`} icon={FaDollarSign} color="green" />
                  <StatsPreviewCard label="Highest" value={`₹${previewStats.highestPrice}`} icon={FaCrown} color="yellow" />
                  <StatsPreviewCard label="Lowest" value={`₹${previewStats.lowestPrice}`} icon={FaTicketAlt} color="purple" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.seatCategories.map((category, index) => (
                    <CategoryCard
                      key={category.category}
                      category={category}
                      index={index}
                      onUpdate={handleCategoryChange}
                    />
                  ))}
                </div>

                <div className="mt-8 p-5 rounded-xl transition-all duration-300 bg-blue-500/10 border"
                  style={{ background: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-lg mt-0.5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1 text-blue-400">
                        Seat Layout Information
                      </p>
                      <p className="text-xs text-blue-300/70">
                        Seat layout will be automatically generated based on the theater screen configuration.
                        Each category's row allocation is pre-defined from the screen setup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="border-t p-6 flex justify-between transition-all duration-300" style={{ borderColor: "var(--card-border)" }}>
              {!isFirstStep ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="group flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 border hover:bg-card/50"
                  style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}
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
                  className="group flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  Next
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="group flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Creating Show...
                    </>
                  ) : (
                    <>
                      <FaSave className="text-sm group-hover:scale-110 transition-transform" />
                      Create Show
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