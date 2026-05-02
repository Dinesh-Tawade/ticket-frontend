"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  getAllTheatersAdmin,
  deleteTheater,
  updateTheater,
  getAllUsers,
} from "@/app/services/adminCommunication";
import {
  FaBuilding, FaMapMarkerAlt, FaPhone, FaTicketAlt, FaCouch, FaWifi,
  FaParking, FaCoffee, FaAccessibleIcon, FaEdit, FaTrash, FaPlus,
  FaSearch, FaTimes, FaCheckCircle, FaTimesCircle, FaChevronDown,
  FaStar, FaRegGem, FaCrown, FaSpinner, FaUserTie, FaMoon, FaSun,
  FaSave, FaCity, FaFlag
} from "react-icons/fa";
import { MdTheaters, MdScreenShare, MdLocationOn, MdEventSeat, MdMovie, MdLocalMovies } from "react-icons/md";
import { GiTheaterCurtains } from "react-icons/gi";
import useTheme from "@/app/hooks/useTheme";

const AMENITIES = [
  { icon: FaCouch, name: "Recliner Seats", key: "hasRecliner", desc: "Premium recliner chairs", color: "blue" },
  { icon: FaWifi, name: "Free WiFi", key: "hasWifi", desc: "High-speed internet", color: "indigo" },
  { icon: FaParking, name: "Parking", key: "hasParking", desc: "Covered car parking", color: "green" },
  { icon: FaCoffee, name: "Food & Café", key: "hasCafe", desc: "In-house café & snacks", color: "orange" },
  { icon: FaAccessibleIcon, name: "Accessibility", key: "hasWheelchair", desc: "Wheelchair friendly", color: "purple" },
];

const SEAT_TYPES = {
  NORMAL: { label: "Standard", color: "blue", symbol: "S", mult: "1×", icon: MdEventSeat },
  EXECUTIVE: { label: "Executive", color: "green", symbol: "E", mult: "1.5×", icon: FaStar },
  PREMIUM: { label: "Premium", color: "purple", symbol: "P", mult: "2×", icon: FaRegGem },
  VIP: { label: "VIP", color: "yellow", symbol: "V", mult: "3×", icon: FaCrown },
};

const SeatLegend = ({ type, isDark }) => {
  const cfg = SEAT_TYPES[type];
  const Icon = cfg.icon;
  
  return (
    <div className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer ${isDark ? 'bg-card/50 border border-card-border/30 hover:shadow-lg hover:shadow-blue-500/20' : 'bg-white/50 border border-gray-200 hover:shadow-lg hover:shadow-blue-500/10'}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold transition-transform group-hover:scale-110 ${isDark ? `bg-${cfg.color}-900/30 border border-${cfg.color}-700/30 text-${cfg.color}-400` : `bg-${cfg.color}-50 border border-${cfg.color}-200 text-${cfg.color}-600`}`}>
        <Icon className="text-xs" />
      </div>
      <div>
        <div className={`text-sm font-bold ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{cfg.label}</div>
        <div className={`text-[11px] ${isDark ? 'text-foreground/60' : 'text-gray-400'}`}>{cfg.mult} price</div>
      </div>
    </div>
  );
};

const ScreenViewModal = ({ isOpen, onClose, theater, screens, selectedScreenIndex, onScreenChange, isDark }) => {
  const [hovered, setHovered] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [rippleEffect, setRippleEffect] = useState(null);
  const current = screens?.[selectedScreenIndex];

  const seatsByRow = useMemo(() => {
    if (!current?.seatRows) return {};
    const all = [];
    current.seatRows.forEach(row => {
      for (let i = row.startSeat; i <= row.endSeat; i++)
        all.push({ row: row.rowName, number: i, category: row.category, multiplier: row.priceMultiplier });
    });
    return all.reduce((acc, s) => ((acc[s.row] = acc[s.row] || []).push(s), acc), {});
  }, [current]);

  const total = useMemo(() => Object.values(seatsByRow).reduce((t, r) => t + r.length, 0), [seatsByRow]);
  const catCounts = useMemo(() => {
    const c = {};
    Object.values(seatsByRow).flat().forEach(s => c[s.category] = (c[s.category] || 0) + 1);
    return c;
  }, [seatsByRow]);

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setRippleEffect(seat);
    setTimeout(() => setRippleEffect(null), 500);
  };

  if (!isOpen || !current) return null;

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 ${isDark ? 'bg-black/90' : 'bg-gray-900/60'}`}>
      <div className={`rounded-2xl w-full max-w-[1200px] max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${isDark ? 'bg-card border border-card-border/30' : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200'}`}>
        <div className={`sticky top-0 z-10 border-b rounded-t-2xl p-6 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-card border-card-border/30' : 'bg-gradient-to-r from-white to-gray-50 border-gray-200'}`}>
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <div className="w-6 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
              <h2 className={`text-2xl font-extrabold font-poppins ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{theater?.name}</h2>
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${isDark ? 'text-foreground/60' : 'text-gray-600'}`}>
                <MdLocationOn className={`text-sm text-blue-500 animate-pulse`} />
                {theater?.location}, {theater?.city}
              </p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg transition-all duration-300 group ${isDark ? 'border border-card-border/30 bg-card/50 text-foreground/60 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400' : 'border border-gray-200 bg-white/50 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500'}`}>
              <FaTimes className={`text-sm group-hover:rotate-90 transition-transform duration-300`} />
            </button>
          </div>
          {screens?.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin">
              {screens.map((sc, idx) => (
                <button key={sc._id} onClick={() => onScreenChange(idx)} className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${selectedScreenIndex === idx ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" : isDark ? "bg-card/50 text-foreground/60 border border-card-border/30 hover:bg-card" : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"}`}>
                  <MdScreenShare className="inline mr-1.5 text-xs" /> {sc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Screen", value: `#${current.screenNumber}`, color: "blue", icon: MdScreenShare },
              { label: "Total Seats", value: total, color: "green", icon: MdEventSeat },
              ...Object.entries(catCounts).map(([cat, n]) => ({ label: SEAT_TYPES[cat]?.label || cat, value: n, color: SEAT_TYPES[cat]?.color || "blue", icon: SEAT_TYPES[cat]?.icon || MdEventSeat })),
            ].map((chip, i) => {
              const Icon = chip.icon;
              return (
                <div key={i} className={`relative group overflow-hidden px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-in slide-in-from-bottom duration-500 ${isDark ? `bg-gradient-to-br from-${chip.color}-900/20 to-card border border-${chip.color}-500/20 hover:border-${chip.color}-500/50` : `bg-gradient-to-br from-${chip.color}-50 to-white border border-${chip.color}-200 hover:border-${chip.color}-400`}`} style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`absolute inset-0 bg-gradient-to-r from-${chip.color}-500/0 via-${chip.color}-500/10 to-${chip.color}-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
                  <Icon className={`text-lg mb-1 ${isDark ? `text-${chip.color}-400` : `text-${chip.color}-600`} animate-pulse`} />
                  <div className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? `text-${chip.color}-400` : `text-${chip.color}-600`}`}>{chip.label}</div>
                  <div className={`text-2xl font-black leading-tight ${isDark ? `text-${chip.color}-400` : `text-${chip.color}-700`}`}>{chip.value}</div>
                </div>
              );
            })}
          </div>

          <div className="mb-10 text-center relative">
            <div className="absolute inset-x-0 -top-10 flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-blue-400 animate-ping" style={{ animationDelay: `${i * 0.3}s`, animationDuration: '1.5s' }} />
              ))}
            </div>
            <div className="relative">
              <div className={`h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-80 mb-2 animate-pulse shadow-[0_0_30px_#3b82f6]`} />
              <div className={`h-6 bg-gradient-to-b from-blue-500/30 to-transparent rounded-b-[60%] mb-3`} />
              <MdLocalMovies className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce text-blue-400/50`} />
              <span className={`text-[10px] font-extrabold tracking-[6px] uppercase relative inline-block ${isDark ? 'text-foreground/40' : 'text-gray-400'}`}>
                ◄ SILVER SCREEN ►
                <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-4 relative">
            <div className="min-w-max">
              {Object.entries(seatsByRow).map(([rowName, seats], rowIdx) => (
                <div key={rowName} className="flex items-center gap-3 mb-3 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${rowIdx * 80}ms` }}>
                  <div className="w-8 text-center">
                    <div className={`text-xs font-black transition-colors duration-300 ${isDark ? 'text-foreground/40 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'}`}>
                      {rowName}
                    </div>
                    <div className={`w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent mx-auto mt-1`} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {seats.map((seat, seatIdx) => {
                      const cfg = SEAT_TYPES[seat.category] || SEAT_TYPES.NORMAL;
                      const isHov = hovered === seat;
                      const isSelected = selectedSeat === seat;
                      const isRipple = rippleEffect === seat;
                      const Icon = cfg.icon;
                      
                      return (
                        <div
                          key={`${seat.row}${seat.number}`}
                          onMouseEnter={() => setHovered(seat)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => handleSeatClick(seat)}
                          className={`relative group/seat cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                            isRipple ? 'animate-in zoom-in duration-300' : ''
                          }`}
                        >
                          <div className={`relative w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                            isHov 
                              ? `bg-${cfg.color}-500 text-white shadow-2xl scale-110 ring-2 ring-${cfg.color}-400 ring-offset-2 ring-offset-card`
                              : isSelected
                              ? `bg-${cfg.color}-500 text-white shadow-lg`
                              : isDark
                              ? `bg-${cfg.color}-900/30 border-2 border-${cfg.color}-700/30 text-${cfg.color}-400 hover:border-${cfg.color}-400`
                              : `bg-${cfg.color}-50 border-2 border-${cfg.color}-200 text-${cfg.color}-600 hover:border-${cfg.color}-400`
                          }`}>
                            <Icon className={`text-xs ${isHov || isSelected ? 'text-white' : ''}`} />
                            <span className="text-[8px] font-bold mt-0.5">{seat.number}</span>
                          </div>
                          {isSelected && (
                            <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap animate-in zoom-in duration-200 ${isDark ? 'bg-card border border-card-border/30' : 'bg-gray-800 border border-gray-600'}`}>
                              Selected!
                            </div>
                          )}
                          {isHov && (
                            <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap animate-in fade-in duration-150 z-20 ${isDark ? 'bg-card border border-card-border/30' : 'bg-gray-800 border border-gray-600'}`}>
                              {cfg.label}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[80px] my-5">
            {hovered && (() => {
              const cfg = SEAT_TYPES[hovered.category] || SEAT_TYPES.NORMAL;
              const Icon = cfg.icon;
              return (
                <div className={`flex items-center gap-4 p-4 rounded-xl animate-in slide-in-from-bottom duration-300 shadow-lg ${isDark ? `bg-gradient-to-r from-${cfg.color}-900/30 to-card border-2 border-${cfg.color}-500/30` : `bg-gradient-to-r from-${cfg.color}-50 to-white border-2 border-${cfg.color}-300`}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-xl animate-bounce bg-${cfg.color}-500`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <div className={`text-lg font-black ${isDark ? 'text-foreground' : 'text-gray-900'}`}>Seat {hovered.row}{hovered.number}</div>
                    <div className={`text-sm mt-0.5 ${isDark ? 'text-foreground/60' : 'text-gray-600'}`}>{cfg.label} Category · {hovered.multiplier}× price multiplier</div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-black text-lg shadow-lg bg-${cfg.color}-500 text-white`}>
                    {cfg.symbol}
                  </div>
                </div>
              );
            })()}
            {selectedSeat && !hovered && (
              <div className={`flex items-center gap-4 p-4 rounded-xl animate-in fade-in duration-300 ${isDark ? 'bg-gradient-to-r from-green-900/30 to-card border-2 border-green-500/30' : 'bg-gradient-to-r from-green-50 to-white border-2 border-green-400'}`}>
                <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center shadow-xl">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <div>
                  <div className={`text-lg font-black ${isDark ? 'text-foreground' : 'text-gray-900'}`}>Seat {selectedSeat.row}{selectedSeat.number} Selected!</div>
                  <div className={`text-sm mt-0.5 ${isDark ? 'text-foreground/60' : 'text-gray-600'}`}>Premium viewing experience</div>
                </div>
              </div>
            )}
          </div>

          <div className={`border-t pt-6 mt-2 ${isDark ? 'border-card-border/30' : 'border-gray-200'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-[2px] mb-4 flex items-center gap-2 ${isDark ? 'text-foreground/40' : 'text-gray-400'}`}>
              <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-transparent" />
              SEAT CATEGORIES
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-blue-500" />
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.keys(SEAT_TYPES).map(key => <SeatLegend key={key} type={key} isDark={isDark} />)}
            </div>
          </div>
        </div>

        <div className={`sticky bottom-0 p-5 rounded-b-2xl transition-all duration-300 bg-card border-t ${isDark ? 'border-card-border/30' : 'border-gray-200'}`}>
          <button onClick={onClose} className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700`}>
            Close Theater View
          </button>
        </div>
      </div>
    </div>
  );
};

const AnimatedCounter = ({ value, isDark }) => {
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
    <div className={`text-[34px] font-black tracking-tighter leading-none transition-all duration-300 ${
      isDark ? 'text-foreground' : 'text-gray-900'
    }`}>
      {count}
    </div>
  );
};

const StatsCard = ({ label, value, icon: Icon, color, isDark }) => {
  return (
    <div className={`group rounded-xl p-4 flex items-center justify-between shadow-sm transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105 ${
      isDark ? 'bg-card border border-card-border/30 hover:border-${color}-500/50' : 'bg-white border border-gray-200 hover:border-${color}-500/50'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-r from-${color}-500/0 via-${color}-500/5 to-${color}-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
      <div>
        <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors ${isDark ? 'text-foreground/40 group-hover:text-foreground/60' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</div>
        <AnimatedCounter value={value} isDark={isDark} />
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
        isDark ? `bg-${color}-500/10 border border-${color}-500/20` : `bg-${color}-50 border border-${color}-200`
      }`}>
        <Icon className={`text-xl transition-transform group-hover:scale-110 ${
          isDark ? `text-${color}-400` : `text-${color}-600`
        }`} />
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, icon, color, title, body, confirmLabel, isDark }) => {
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 ${isDark ? 'bg-black/80' : 'bg-gray-900/50'}`}>
      <div className={`rounded-2xl p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in duration-300 ${
        isDark ? 'bg-card border border-card-border/30' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
      }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-bounce ${
          isDark ? `bg-${color}-500/20 border border-${color}-500/30` : `bg-${color}-50 border border-${color}-200`
        }`}>{icon}</div>
        <h2 className={`text-xl font-extrabold font-poppins mb-2 ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{title}</h2>
        <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-foreground/60' : 'text-gray-600'}`}>{body}</p>
        <div className="flex gap-2.5">
          <button onClick={onConfirm} className={`flex-1 rounded-xl py-2.5 text-white font-bold text-sm transition-all transform hover:scale-105 bg-${color}-500 hover:opacity-90`}>{confirmLabel}</button>
          <button onClick={onClose} className={`flex-1 rounded-xl py-2.5 font-bold text-sm transition-all bg-transparent border ${isDark ? 'border-card-border/30' : 'border-gray-200'} ${isDark ? 'text-foreground/60 hover:bg-card/50' : 'text-gray-600 hover:bg-gray-50'}`}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Edit Theater Modal Component
const EditTheaterModal = ({ isOpen, onClose, theater, onUpdate, isDark }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    city: "",
    state: "",
    pincode: "",
    contactNumber: "",
    hasRecliner: false,
    hasWifi: false,
    hasParking: false,
    hasCafe: false,
    hasWheelchair: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (theater) {
      setFormData({
        name: theater.name || "",
        location: theater.location || "",
        city: theater.city || "",
        state: theater.state || "",
        pincode: theater.pincode || "",
        contactNumber: theater.contactNumber || "",
        hasRecliner: theater.hasRecliner || false,
        hasWifi: theater.hasWifi || false,
        hasParking: theater.hasParking || false,
        hasCafe: theater.hasCafe || false,
        hasWheelchair: theater.hasWheelchair || false,
      });
    }
  }, [theater]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validation for pincode - only numbers, max 6 digits
    if (name === "pincode") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 6) {
        setFormData(prev => ({ ...prev, [name]: onlyNums }));
      }
      return;
    }
    
    // Validation for contact number - only numbers, max 10 digits
    if (name === "contactNumber") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: onlyNums }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name.trim()) {
      toast.error("Theater name is required");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!formData.state.trim()) {
      toast.error("State is required");
      return;
    }
    if (!formData.contactNumber.trim()) {
      toast.error("Contact number is required");
      return;
    }
    if (formData.contactNumber.length !== 10) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }
    if (formData.pincode && formData.pincode.length !== 6) {
      toast.error("Pincode must be exactly 6 digits");
      return;
    }

    setIsSubmitting(true);
    await onUpdate(theater._id, formData);
    setIsSubmitting(false);
  };

  const BASIC_FIELDS = [
    { name: "name", label: "Theater Name", placeholder: "e.g., PVR Cinemas", icon: FaBuilding, type: "text", required: true },
    { name: "location", label: "Location / Area", placeholder: "e.g., Juhu", icon: FaMapMarkerAlt, type: "text", required: true },
    { name: "city", label: "City", placeholder: "e.g., Mumbai", icon: FaCity, type: "text", required: true },
    { name: "state", label: "State", placeholder: "e.g., Maharashtra", icon: FaFlag, type: "text", required: true },
    { name: "pincode", label: "Pincode", placeholder: "400049", icon: null, type: "text", required: false, maxLength: 6 },
    { name: "contactNumber", label: "Contact Number", placeholder: "9876543210", icon: FaPhone, type: "tel", required: true, maxLength: 10 },
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 ${isDark ? 'bg-black/80' : 'bg-gray-900/50'}`}>
      <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform animate-in zoom-in duration-300 ${
        isDark ? 'bg-card border border-card-border/30' : 'bg-white border border-gray-200'
      }`}>
        <div className={`sticky top-0 z-10 border-b p-6 rounded-t-2xl ${isDark ? 'bg-card border-card-border/30' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FaEdit className="text-white text-sm" />
              </div>
              <div>
                <h2 className={`text-xl font-extrabold ${isDark ? 'text-foreground' : 'text-gray-900'}`}>Edit Theater</h2>
                <p className={`text-xs ${isDark ? 'text-foreground/60' : 'text-gray-500'}`}>Update theater information</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${isDark ? 'hover:bg-red-500/10 text-foreground/60 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'}`}
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {BASIC_FIELDS.map((field) => (
              <div key={field.name}>
                <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-foreground/60' : 'text-gray-500'}`}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {!field.required && <span className="text-[9px] ml-1">(Optional)</span>}
                </label>
                <div className="relative">
                  {field.icon && <field.icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-foreground/40' : 'text-gray-400'}`} />}
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    className={`w-full ${field.icon ? 'pl-10' : 'px-4'} py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      isDark ? 'bg-background border border-card-border/30 text-foreground placeholder:text-foreground/40' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
                {field.name === "contactNumber" && (
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-foreground/40' : 'text-gray-400'}`}>{formData.contactNumber.length}/10 digits</p>
                )}
                {field.name === "pincode" && (
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-foreground/40' : 'text-gray-400'}`}>{formData.pincode.length}/6 digits</p>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className={`text-[11px] font-bold uppercase tracking-wider mb-3 block ${isDark ? 'text-foreground/60' : 'text-gray-500'}`}>
              Amenities & Facilities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity.key}
                  className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData[amenity.key]
                      ? isDark 
                        ? 'border-blue-500 bg-blue-500/10 shadow-sm'
                        : 'border-blue-500 bg-blue-50'
                      : isDark
                      ? 'border-card-border/30 bg-background hover:border-blue-500/50'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-500/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    name={amenity.key}
                    checked={formData[amenity.key]}
                    onChange={handleChange}
                    className="absolute opacity-0 pointer-events-none"
                  />
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    formData[amenity.key]
                      ? isDark ? 'bg-blue-500/20 border-2 border-blue-500/50' : 'bg-blue-100 border-2 border-blue-300'
                      : isDark ? 'bg-background border border-card-border/30' : 'bg-white border border-gray-200'
                  }`}>
                    <amenity.icon className={`text-sm ${formData[amenity.key] ? 'text-blue-500' : isDark ? 'text-foreground/40' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${formData[amenity.key] ? 'text-blue-500' : isDark ? 'text-foreground/80' : 'text-gray-700'}`}>
                      {amenity.name}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isDark ? 'text-foreground/40' : 'text-gray-400'}`}>
                      {amenity.desc}
                    </div>
                  </div>
                  {formData[amenity.key] && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle className="text-white text-[10px]" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${
                isDark
                  ? 'border border-card-border/30 bg-transparent text-foreground/60 hover:bg-card/50'
                  : 'border border-gray-200 bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30'
              }`}
            >
              {isSubmitting ? (
                <><FaSpinner className="animate-spin text-sm" /> Updating...</>
              ) : (
                <><FaSave className="text-sm" /> Update Theater</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TheaterCard = ({ theater, onView, onEdit, onDelete, onStatusToggle, isDark }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = theater.status === "ACTIVE";
  const totalSeats = useMemo(() => theater.screens?.reduce((t, s) => t + (s.seatRows?.reduce((sum, r) => sum + (r.endSeat - r.startSeat + 1), 0) || 0), 0) || 0, [theater.screens]);

  return (
    <div 
      className={`group rounded-2xl overflow-hidden flex flex-col shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
        isDark ? 'bg-card border border-card-border/30 hover:border-blue-500/50' : 'bg-white border border-gray-200 hover:border-blue-500/50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[120px] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`} />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 280 120" preserveAspectRatio="none">
          <pattern id={`pattern-${theater._id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="15" fill="white" opacity="0.1" />
            <circle cx="0" cy="0" r="10" fill="white" opacity="0.05" />
          </pattern>
          <rect width="280" height="120" fill={`url(#pattern-${theater._id})`} />
        </svg>
        <div className={`absolute top-3 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm transition-all duration-300 ${isHovered ? 'scale-105' : 'scale-100'} ${
          isActive ? "bg-green-500/30 border border-green-400/50" : "bg-gray-500/30 border border-gray-400/50"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" : "bg-gray-400"}`} />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{isActive ? "Active" : "Inactive"}</span>
        </div>
        <button 
          onClick={() => onStatusToggle(theater, isActive ? "deactivate" : "activate")} 
          className={`absolute top-2.5 right-3 bg-white/20 border border-white/30 rounded-lg p-1.5 text-white transition-all duration-300 transform hover:scale-110 hover:bg-white/30 ${
            isHovered ? 'opacity-100' : 'opacity-90'
          }`}
        >
          {isActive ? <FaTimesCircle className="text-sm" /> : <FaCheckCircle className="text-sm" />}
        </button>
        <div className="absolute bottom-3 left-3.5 right-12">
          <h3 className={`text-base font-extrabold text-white truncate drop-shadow-md font-poppins transition-all duration-300 ${isHovered ? 'scale-105 origin-left' : 'scale-100'}`}>
            {theater.name}
          </h3>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-3.5">
          <MdLocationOn className={`text-sm flex-shrink-0 transition-all duration-300 ${isHovered ? 'animate-pulse' : ''} text-blue-500`} />
          <span className={`text-[12.5px] truncate transition-colors duration-300 ${isDark ? 'text-foreground/60 group-hover:text-foreground/80' : 'text-gray-600 group-hover:text-gray-800'}`}>
            {theater.location}, {theater.city}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {[
            { icon: <MdTheaters />, value: theater.screens?.length || 0, label: "Screens", color: "blue" },
            { icon: <FaTicketAlt />, value: totalSeats, label: "Seats", color: "green" },
            { icon: <FaPhone />, value: theater.contactNumber?.slice(-4) || "—", label: "Phone", color: "purple" },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl py-2 px-1.5 text-center transition-all duration-300 ${
              isDark ? 'bg-background/50 border border-card-border/30 group-hover:bg-background/80' : 'bg-gray-50 border border-gray-200 group-hover:bg-gray-100'
            }`}>
              <div className={`text-sm mb-0.5 mx-auto flex justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? `text-${s.color}-400` : `text-${s.color}-600`}`}>
                {s.icon}
              </div>
              <div className={`text-sm font-extrabold leading-tight ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{s.value}</div>
              <div className={`text-[10px] mt-0.5 font-semibold ${isDark ? 'text-foreground/40' : 'text-gray-400'}`}>{s.label}</div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-4 min-h-[26px]">
          {AMENITIES.filter(a => theater[a.key]).map(({ icon: Icon, name, color }) => (
            <div key={name} className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-300 hover:scale-105 ${
              isDark ? `bg-${color}-900/30 border border-${color}-700/30 text-${color}-400 hover:border-${color}-500` : `bg-${color}-50 border border-${color}-200 text-${color}-600 hover:border-${color}-400`
            }`}>
              <Icon className="text-[9px]" /> {name}
            </div>
          ))}
          {!AMENITIES.some(a => theater[a.key]) && (
            <span className={`text-xs italic ${isDark ? 'text-foreground/30' : 'text-gray-400'}`}>No amenities</span>
          )}
        </div>
        
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={() => onView(theater)} 
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl py-2.5 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
          >
            <MdEventSeat className={`text-sm transition-all duration-300 ${isHovered ? 'animate-bounce' : ''}`} /> View Layout
          </button>
          <button 
            onClick={() => onEdit(theater)} 
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 border ${isDark ? 'border-card-border/30' : 'border-gray-200'} ${isDark ? 'bg-background/50 text-foreground/60 hover:bg-blue-500/10 hover:border-blue-500/50' : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:border-blue-500/50'}`}
          >
            <FaEdit className="text-sm" />
          </button>
          <button 
            onClick={() => onDelete(theater)} 
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 border ${isDark ? 'border-card-border/30' : 'border-gray-200'} ${isDark ? 'bg-background/50 text-red-500 hover:bg-red-500/10 hover:border-red-500/50' : 'bg-gray-50 text-red-500 hover:bg-red-50 hover:border-red-500/50'}`}
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TheatersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [deletingTheater, setDeletingTheater] = useState(null);
  const [statusTheater, setStatusTheater] = useState(null);
  const [statusAction, setStatusAction] = useState("");
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [editingTheater, setEditingTheater] = useState(null);
  const [selectedScreenIdx, setSelectedScreenIdx] = useState(0);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["allTheatersAdmin"],
    queryFn: getAllTheatersAdmin,
  });
  const theaters = data?.data || [];

  const cities = useMemo(() => ["ALL", ...new Set(theaters.map(t => t.city).filter(Boolean))].sort(), [theaters]);
  const filtered = useMemo(() => theaters.filter(t => {
    const q = searchTerm.toLowerCase();
    return (!q || [t.name, t.location, t.city].some(v => v?.toLowerCase().includes(q))) &&
      (statusFilter === "ALL" || t.status === statusFilter) &&
      (cityFilter === "ALL" || t.city === cityFilter);
  }), [theaters, searchTerm, statusFilter, cityFilter]);

  const stats = useMemo(() => ({
    total: theaters.length,
    active: theaters.filter(t => t.status === "ACTIVE").length,
    inactive: theaters.filter(t => t.status === "INACTIVE").length,
    screens: theaters.reduce((s, t) => s + (t.screens?.length || 0), 0),
    cities: new Set(theaters.map(t => t.city)).size,
  }), [theaters]);

  const deleteMutation = useMutation({ 
    mutationFn: deleteTheater, 
    onSuccess: () => { 
      queryClient.invalidateQueries(["allTheatersAdmin"]); 
      toast.success("Theater deleted successfully!"); 
      setDeletingTheater(null); 
    }, 
    onError: err => toast.error(err.response?.data?.message || "Delete failed") 
  });
  
  const statusMutation = useMutation({ 
    mutationFn: ({ id, data }) => updateTheater(id, data), 
    onSuccess: () => { 
      queryClient.invalidateQueries(["allTheatersAdmin"]); 
      toast.success(`Theater ${statusAction === "activate" ? "activated" : "deactivated"} successfully!`); 
      setStatusTheater(null); 
      setStatusAction(""); 
    }, 
    onError: err => toast.error(err.response?.data?.message || "Update failed") 
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTheater(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["allTheatersAdmin"]);
      toast.success("Theater updated successfully!");
      setIsEditModalOpen(false);
      setEditingTheater(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update theater");
    }
  });

  const hasFilters = searchTerm || statusFilter !== "ALL" || cityFilter !== "ALL";
  const clearFilters = useCallback(() => { 
    setSearchTerm(""); 
    setStatusFilter("ALL"); 
    setCityFilter("ALL"); 
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleEditClick = (theater) => {
    setEditingTheater(theater);
    setIsEditModalOpen(true);
  };

  const handleUpdateTheater = async (id, data) => {
    await updateMutation.mutateAsync({ id, data });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-background' : 'bg-gradient-to-br from-red-500 to-gray-100'}`}>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          className: `!rounded-xl !text-sm !font-semibold !shadow-xl ${
            isDark ? '!bg-card !text-foreground !border-card-border/30' : '!bg-white !text-gray-900 !border-gray-200'
          }`,
          duration: 3000,
        }} 
      />
      
      {/* Header */}
      <div className={`sticky top-0 z-[100] border-b shadow-lg transition-all duration-300 ${
        isDark ? 'bg-card/90 backdrop-blur-md border-card-border/30' : 'bg-white/90 backdrop-blur-md border-gray-200'
      }`}>
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
                <h1 className={`text-2xl font-black tracking-tight transition-colors duration-300 ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
                  Theater Management
                </h1>
                <p className={`text-xs font-medium transition-colors duration-300 ${isDark ? 'text-foreground/60' : 'text-gray-600'}`}>
                  Manage theaters, screens & seat layouts like a pro
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-card border border-card-border/30 text-foreground/60 hover:text-blue-400' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-blue-600'
                }`}
              >
                <FaSpinner className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => router.push("/admin/theaters/add")}
                className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <FaPlus className="text-xs" />
                <span>Add Theater</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard label="Total Theaters" value={stats.total} icon={FaBuilding} color="blue" isDark={isDark} />
          <StatsCard label="Active" value={stats.active} icon={FaCheckCircle} color="green" isDark={isDark} />
          <StatsCard label="Inactive" value={stats.inactive} icon={FaTimesCircle} color="red" isDark={isDark} />
          <StatsCard label="Total Screens" value={stats.screens} icon={MdTheaters} color="purple" isDark={isDark} />
          <StatsCard label="Cities" value={stats.cities} icon={FaMapMarkerAlt} color="yellow" isDark={isDark} />
        </div>
        
        {/* Filters */}
        <div className={`rounded-xl p-5 mb-8 flex flex-wrap gap-3 items-center shadow-lg transition-all duration-300 ${
          isDark ? 'bg-card border border-card-border/30' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex-1 min-w-[220px] relative">
            <FaSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isDark ? 'text-foreground/40' : 'text-gray-400'}`} />
            <input 
              type="text" 
              placeholder="Search theaters, cities, locations…" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                isDark ? 'bg-background border border-card-border/30 text-foreground placeholder:text-foreground/40' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'
              }`} 
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className={`appearance-none rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              isDark ? 'bg-background border border-card-border/30 text-foreground' : 'bg-white border border-gray-200 text-gray-900'
            }`}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          
          <select 
            value={cityFilter} 
            onChange={e => setCityFilter(e.target.value)} 
            className={`appearance-none rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              isDark ? 'bg-background border border-card-border/30 text-foreground' : 'bg-white border border-gray-200 text-gray-900'
            }`}
          >
            {cities.map(c => <option key={c} value={c}>{c === "ALL" ? "All Cities" : c}</option>)}
          </select>
          
          {hasFilters && (
            <button 
              onClick={clearFilters} 
              className="px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-transparent text-red-500 font-bold text-xs flex items-center gap-1.5 hover:bg-red-500/10 transition-all duration-300 hover:scale-105"
            >
              <FaTimes className="text-[10px]" /> Clear
            </button>
          )}
          
          <div className={`ml-auto text-xs font-semibold ${isDark ? 'text-foreground/40' : 'text-gray-400'}`}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
        
        {/* Theater Grid */}
        {filtered.length === 0 ? (
          <div className={`rounded-2xl text-center py-16 px-8 shadow-xl transition-all duration-300 ${
            isDark ? 'bg-card border border-card-border/30' : 'bg-white border border-gray-200'
          }`}>
            <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-background/50' : 'bg-gray-50'
            }`}>
              <FaBuilding className={`text-3xl ${isDark ? 'text-foreground/20' : 'text-gray-300'}`} />
            </div>
            <h3 className={`text-lg font-extrabold mb-2 ${isDark ? 'text-foreground' : 'text-gray-900'}`}>No theaters found</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-foreground/60' : 'text-gray-600'}`}>
              {hasFilters ? "Try adjusting your filters" : "Add your first theater to get started"}
            </p>
            {!hasFilters && (
              <button 
                onClick={() => router.push("/admin/theaters/add")} 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <FaPlus className="text-[11px]" /> Add Theater
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((theater, idx) => (
              <div 
                key={theater._id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-500" 
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <TheaterCard 
                  theater={theater} 
                  onView={t => { setSelectedTheater(t); setSelectedScreenIdx(0); setIsLayoutOpen(true); }} 
                  onEdit={t => handleEditClick(t)} 
                  onDelete={t => setDeletingTheater(t)} 
                  onStatusToggle={(t, a) => { setStatusTheater(t); setStatusAction(a); }} 
                  isDark={isDark}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ConfirmModal 
        isOpen={!!deletingTheater} 
        onClose={() => setDeletingTheater(null)} 
        onConfirm={() => deletingTheater && deleteMutation.mutate(deletingTheater._id)} 
        icon={<FaTrash className="text-red-500 text-xl" />} 
        color="red" 
        title="Delete Theater" 
        body={<>Delete <strong className="font-bold">{deletingTheater?.name}</strong>? This action cannot be undone.</>} 
        confirmLabel="Delete" 
        isDark={isDark}
      />
      
      <ConfirmModal 
        isOpen={!!statusTheater} 
        onClose={() => { setStatusTheater(null); setStatusAction(""); }} 
        onConfirm={() => statusTheater && statusMutation.mutate({ id: statusTheater._id, data: { status: statusAction === "activate" ? "ACTIVE" : "INACTIVE" } })} 
        icon={statusAction === "activate" ? <FaCheckCircle className="text-green-500 text-xl" /> : <FaTimesCircle className="text-yellow-500 text-xl" />} 
        color={statusAction === "activate" ? "green" : "yellow"} 
        title={statusAction === "activate" ? "Activate Theater" : "Deactivate Theater"} 
        body={<>Are you sure you want to {statusAction} <strong className="font-bold">{statusTheater?.name}</strong>?</>} 
        confirmLabel={statusAction === "activate" ? "Activate" : "Deactivate"} 
        isDark={isDark}
      />
      
      <EditTheaterModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingTheater(null); }}
        theater={editingTheater}
        onUpdate={handleUpdateTheater}
        isDark={isDark}
      />
      
      <ScreenViewModal 
        isOpen={isLayoutOpen} 
        onClose={() => { setIsLayoutOpen(false); setSelectedTheater(null); setSelectedScreenIdx(0); }} 
        theater={selectedTheater} 
        screens={selectedTheater?.screens || []} 
        selectedScreenIndex={selectedScreenIdx} 
        onScreenChange={setSelectedScreenIdx}
        isDark={isDark}
      />
    </div>
  );
}