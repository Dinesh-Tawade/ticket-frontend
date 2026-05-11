"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { toast, Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  getAllTheatersAdmin,
  deleteTheaterAdmin,
  updateTheaterAdmin,
  getAllUsers,
} from "../../services/adminCommunication";
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

import "../../i18n";




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

const SeatLegend = ({ type }) => {
  const cfg = SEAT_TYPES[type];
  const Icon = cfg.icon;
  const colorMap = {
    blue: "#3b82f6",
    green: "#22c55e",
    purple: "#a855f7",
    yellow: "#eab308",
  };
  

  return (
    <div className="group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold transition-transform group-hover:scale-110"
        style={{ background: `${colorMap[cfg.color]}20`, border: `1px solid ${colorMap[cfg.color]}40`, color: colorMap[cfg.color] }}>
        <Icon className="text-xs" />
      </div>
      <div>
        <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{cfg.label}</div>
        <div className="text-[11px]" style={{ color: "var(--foreground)", opacity: 0.6 }}>{cfg.mult} price</div>
      </div>
    </div>
  );
};

const ScreenViewModal = ({ isOpen, onClose, theater, screens, selectedScreenIndex, onScreenChange }) => {
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

  const [isClosing, setIsClosing] = useState(true);
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      const timer = setTimeout(() => setIsClosing(false), 10);
      return () => clearTimeout(timer);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => setShowModal(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };


  if (!showModal || !current) return null;

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}>
      <div className="rounded-2xl w-full max-w-[1200px] max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)", opacity: isClosing ? 0 : 1, transform: isClosing ? "translateY(16px)" : "translateY(0)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
        <div className="sticky top-0 z-10 border-b rounded-t-2xl p-6 backdrop-blur-sm transition-all duration-300"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <div className="w-6 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
              <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>{theater?.name}</h2>
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                <MdLocationOn className="text-sm text-blue-500 animate-pulse" />
                {theater?.location}, {theater?.city}
              </p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg transition-all duration-300 group"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}>
              <FaTimes className="text-sm group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          {screens?.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin">
              {screens.map((sc, idx) => (
                <button key={sc._id} onClick={() => onScreenChange(idx)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105"
                  style={selectedScreenIndex === idx
                    ? { background: "var(--gradient-primary)", color: "white", boxShadow: "0 4px 15px rgba(99,102,241,0.4)" }
                    : { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)", opacity: 0.8 }}>
                  <MdScreenShare className="inline mr-1.5 text-xs" /> {sc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[{ label: "Screen", value: `#${current.screenNumber}`, color: "blue", icon: MdScreenShare },
              { label: "Total Seats", value: total, color: "green", icon: MdEventSeat },
              ...Object.entries(catCounts).map(([cat, n]) => ({ label: SEAT_TYPES[cat]?.label || cat, value: n, color: SEAT_TYPES[cat]?.color || "blue", icon: SEAT_TYPES[cat]?.icon || MdEventSeat })),
            ].map((chip, i) => {
              const Icon = chip.icon;
              const colorMap = { blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", yellow: "#eab308" };
              const chipColor = colorMap[chip.color] || "#3b82f6";
              return (
                <div key={i} className="relative group overflow-hidden px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-in slide-in-from-bottom duration-500"
                  style={{ background: `${chipColor}15`, border: `1px solid ${chipColor}30`, animationDelay: `${i * 100}ms` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Icon className="text-lg mb-1 animate-pulse" style={{ color: chipColor }} />
                  <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: chipColor }}>{chip.label}</div>
                  <div className="text-2xl font-black leading-tight" style={{ color: "var(--foreground)" }}>{chip.value}</div>
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
              <span className="text-[10px] font-extrabold tracking-[6px] uppercase relative inline-block" style={{ color: "var(--foreground)", opacity: 0.4 }}>
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
                    <div className="text-xs font-black transition-colors duration-300 group-hover:text-blue-400" style={{ color: "var(--foreground)", opacity: 0.4 }}>
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
                                  : `bg-${cfg.color}-50 border-2 border-${cfg.color}-200 text-${cfg.color}-600 hover:border-${cfg.color}-400`
                          }`}>
                            <Icon className={`text-xs ${isHov || isSelected ? 'text-white' : ''}`} />
                            <span className="text-[8px] font-bold mt-0.5">{seat.number}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap animate-in zoom-in duration-200"
                              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                              Selected!
                            </div>
                          )}
                          {isHov && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap animate-in fade-in duration-150 z-20"
                              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
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
                <div className="flex items-center gap-4 p-4 rounded-xl animate-in slide-in-from-bottom duration-300 shadow-lg"
                  style={{ background: `linear-gradient(to right, ${cfg.color === 'blue' ? '#3b82f6' : cfg.color === 'green' ? '#22c55e' : cfg.color === 'purple' ? '#a855f7' : cfg.color === 'yellow' ? '#eab308' : '#3b82f6'}15, var(--card))`, border: `2px solid ${cfg.color === 'blue' ? '#3b82f6' : cfg.color === 'green' ? '#22c55e' : cfg.color === 'purple' ? '#a855f7' : cfg.color === 'yellow' ? '#eab308' : '#3b82f6'}30` }}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-xl animate-bounce bg-${cfg.color}-500`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-black" style={{ color: "var(--foreground)" }}>Seat {hovered.row}{hovered.number}</div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--foreground)", opacity: 0.6 }}>{cfg.label} Category · {hovered.multiplier}× price multiplier</div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-black text-lg shadow-lg bg-${cfg.color}-500 text-white`}>
                    {cfg.symbol}
                  </div>
                </div>
              );
            })()}
            {selectedSeat && !hovered && (
              <div className="flex items-center gap-4 p-4 rounded-xl animate-in fade-in duration-300"
                style={{ background: "linear-gradient(to right, rgba(34, 197, 94, 0.15), var(--card))", border: "2px solid rgba(34, 197, 94, 0.4)" }}>
                <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <div>
                  <div className="text-lg font-black" style={{ color: "var(--foreground)" }}>Seat {selectedSeat.row}{selectedSeat.number} Selected!</div>
                  <div className="text-sm mt-0.5" style={{ color: "var(--foreground)", opacity: 0.6 }}>Premium viewing experience</div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-6 mt-2" style={{ borderColor: "var(--card-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-[2px] mb-4 flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.4 }}>
              <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-transparent" />
              SEAT CATEGORIES
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-blue-500" />
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.keys(SEAT_TYPES).map(key => <SeatLegend key={key} type={key} />)}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-5 rounded-b-2xl transition-all duration-300"
          style={{ background: "var(--card)", borderTop: "1px solid var(--card-border)" }}>
          <button onClick={handleClose} className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-lg bg-gradient-danger">
            Close Theater View
          </button>
        </div>
      </div>
    </div>
  );
};

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

const ConfirmModal = ({ isOpen, onClose, onConfirm, icon, color, title, body, confirmLabel }) => {
  const colorMap = {
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308"
  };
  const themeColor = colorMap[color] || colorMap.blue;
  const [isClosing, setIsClosing] = useState(true);
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      const timer = setTimeout(() => setIsClosing(false), 10);
      return () => clearTimeout(timer);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => setShowModal(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => onConfirm(), 200);
  };

  if (!showModal) return null;
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}>
      <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)", opacity: isClosing ? 0 : 1, transform: isClosing ? "translateY(16px)" : "translateY(0)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-bounce"
          style={{ background: `${themeColor}20`, border: `1px solid ${themeColor}40`, color: themeColor }}>
          {icon}
        </div>
        <h2 className="text-xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>{title}</h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.7 }}>{body}</p>
        <div className="flex gap-2.5">
          <button onClick={handleConfirm} className="flex-1 rounded-xl py-2.5 text-white font-bold text-sm transition-all transform hover:scale-105"
            style={{ background: themeColor }}>{confirmLabel}</button>
          <button onClick={handleClose} className="flex-1 rounded-xl py-2.5 font-bold text-sm transition-all bg-transparent"
            style={{ border: "1px solid var(--card-border)", color: "var(--foreground)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const EditTheaterModal = ({ isOpen, onClose, theater, onUpdate }) => {
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

  const [isClosing, setIsClosing] = useState(true);
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      const timer = setTimeout(() => setIsClosing(false), 10);
      return () => clearTimeout(timer);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => setShowModal(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!showModal) return null;

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}>
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)", opacity: isClosing ? 0 : 1, transform: isClosing ? "translateY(16px)" : "translateY(0)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
        <div className="sticky top-0 z-10 border-b p-6 rounded-t-2xl"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FaEdit className="text-white text-sm" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>Edit Theater</h2>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Update theater information</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{ color: "var(--foreground)" }}>
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {BASIC_FIELDS.map((field) => (
              <div key={field.name}>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {!field.required && <span className="text-[9px] ml-1">(Optional)</span>}
                </label>
                <div className="relative">
                  {field.icon && <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }} />}
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    className={`w-full ${field.icon ? 'pl-10' : 'px-4'} py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                    style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>
                {field.name === "contactNumber" && (
                  <p className="text-[10px] mt-1" style={{ color: "var(--foreground)", opacity: 0.4 }}>{formData.contactNumber.length}/10 digits</p>
                )}
                {field.name === "pincode" && (
                  <p className="text-[10px] mt-1" style={{ color: "var(--foreground)", opacity: 0.4 }}>{formData.pincode.length}/6 digits</p>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-3 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Amenities & Facilities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity.key}
                  className="relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300"
                  style={formData[amenity.key]
                    ? { borderColor: "#3b82f6", background: "rgba(59, 130, 246, 0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                    : { borderColor: "var(--card-border)", background: "var(--background)" }}
                >
                  <input
                    type="checkbox"
                    name={amenity.key}
                    checked={formData[amenity.key]}
                    onChange={handleChange}
                    className="absolute opacity-0 pointer-events-none"
                  />
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style={formData[amenity.key]
                      ? { background: "rgba(59, 130, 246, 0.2)", border: "2px solid rgba(59, 130, 246, 0.5)" }
                      : { background: "var(--card)", border: "1px solid var(--card-border)" }}>
                    <amenity.icon className="text-sm" style={{ color: formData[amenity.key] ? "#3b82f6" : "var(--foreground)", opacity: formData[amenity.key] ? 1 : 0.4 }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: formData[amenity.key] ? "#3b82f6" : "var(--foreground)", opacity: formData[amenity.key] ? 1 : 0.8 }}>
                      {amenity.name}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--foreground)", opacity: 0.4 }}>
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

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
              style={{ border: "1px solid var(--card-border)", background: "transparent", color: "var(--foreground)", opacity: 0.8 }}
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

const TheaterCard = ({ theater, onView, onEdit, onDelete, onStatusToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = theater.status === "ACTIVE";
  const totalSeats = useMemo(() => theater.screens?.reduce((t, s) => t + (s.seatRows?.reduce((sum, r) => sum + (r.endSeat - r.startSeat + 1), 0) || 0), 0) || 0, [theater.screens]);

  return (
    <div
      className="group rounded-2xl overflow-hidden flex flex-col shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[100px] overflow-hidden" style={{ background: "var(--card)", borderBottom: "1px solid var(--card-border)" }}>
        <div className={`absolute top-3 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
          style={isActive
            ? { background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)" }
            : { background: "rgba(156, 163, 175, 0.15)", border: "1px solid rgba(156, 163, 175, 0.3)" }}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" : "bg-gray-400"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isActive ? "#22c55e" : "var(--foreground)", opacity: 0.8 }}>{isActive ? "Active" : "Inactive"}</span>
        </div>
        <button
          onClick={() => onStatusToggle(theater, isActive ? "deactivate" : "activate")}
          className={`absolute top-2.5 right-3 rounded-lg p-1.5 transition-all duration-300 transform hover:scale-110 ${
            isHovered ? 'opacity-100' : 'opacity-80'
          }`}
          style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        >
          {isActive ? <FaTimesCircle className="text-sm" style={{ color: "#ef4444" }} /> : <FaCheckCircle className="text-sm" style={{ color: "#22c55e" }} />}
        </button>
        <div className="absolute bottom-3 left-3.5 right-12">
          <h3 className="text-base font-extrabold truncate font-poppins transition-all duration-300" style={{ color: "var(--foreground)" }}>
            {theater.name}
          </h3>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-3.5">
          <MdLocationOn className={`text-sm flex-shrink-0 transition-all duration-300 ${isHovered ? 'animate-pulse' : ''} text-blue-500`} />
          <span className="text-[12.5px] truncate transition-colors duration-300 group-hover:opacity-100" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            {theater.location}, {theater.city}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {[
            { icon: <MdTheaters />, value: theater.screens?.length || 0, label: "Screens", color: "#3b82f6" },
            { icon: <FaTicketAlt />, value: totalSeats, label: "Seats", color: "#22c55e" },
            { icon: <FaPhone />, value: theater.contactNumber?.slice(-4) || "—", label: "Phone", color: "#a855f7" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl py-2 px-1.5 text-center transition-all duration-300"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid var(--card-border)" }}>
              <div className="text-sm mb-0.5 mx-auto flex justify-center transition-all duration-300 group-hover:scale-110" style={{ color: s.color }}>
                {s.icon}
              </div>
              <div className="text-sm font-extrabold leading-tight" style={{ color: "var(--foreground)" }}>{s.value}</div>
              <div className="text-[10px] mt-0.5 font-semibold" style={{ color: "var(--foreground)", opacity: 0.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4 min-h-[26px]">
          {AMENITIES.filter(a => theater[a.key]).map(({ icon: Icon, name, color }) => {
            const colorMap = { blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", indigo: "#6366f1", orange: "#f97316" };
            const c = colorMap[color] || colorMap.blue;
            return (
              <div key={name} className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-300 hover:scale-105"
                style={{ background: `${c}15`, border: `1px solid ${c}30`, color: c }}>
                <Icon className="text-[9px]" /> {name}
              </div>
            );
          })}
          {!AMENITIES.some(a => theater[a.key]) && (
            <span className="text-xs italic" style={{ color: "var(--foreground)", opacity: 0.3 }}>No amenities</span>
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
            className="p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => onDelete(theater)}
            className="p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid var(--card-border)", color: "#ef4444" }}
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TheatersPage() {
    const { t } = useTranslation();

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
    mutationFn: deleteTheaterAdmin, 
    onSuccess: () => { 
      queryClient.invalidateQueries(["allTheatersAdmin"]); 
      toast.success("Theater deleted successfully!"); 
      setDeletingTheater(null); 
    }, 
    onError: err => toast.error(err.response?.data?.message || "Delete failed") 
  });
  
  const statusMutation = useMutation({ 
    mutationFn: ({ id, data }) => updateTheaterAdmin(id, data), 
    onSuccess: () => { 
      queryClient.invalidateQueries(["allTheatersAdmin"]); 
      toast.success(`Theater ${statusAction === "activate" ? "activated" : "deactivated"} successfully!`); 
      setStatusTheater(null); 
      setStatusAction(""); 
    }, 
    onError: err => toast.error(err.response?.data?.message || "Update failed") 
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTheaterAdmin(id, data),
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
    <div className={`min-h-screen transition-colors duration-300 `}>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          className: "!rounded-xl !text-sm !font-semibold !shadow-xl !bg-[var(--card)] !text-[var(--foreground)] !border-[var(--card-border)]",
          duration: 3000,
        }} 
      />
      
      {/* Header */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className=" mx-auto px-8">
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
                  {t("app.Theater Management")}
                </h1>
                <p className="text-xs font-medium transition-colors duration-300" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {t("app.Manage theaters and view seat layouts")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <FaSpinner className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => router.push("/admin/theaters/add")}
                className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border"
                style={{ borderColor: "var(--card-border)" }}
              >
                <FaPlus className="text-[11px]" /> {t("app.Add Theater")}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className=" mx-auto pt-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard label={t("app.Total Theaters")} value={stats.total} icon={FaBuilding} color="blue" />
          <StatsCard label={t("app.Active Theaters")} value={stats.active} icon={FaCheckCircle} color="green" />
          <StatsCard label={t("app.Inactive Theaters")} value={stats.inactive} icon={FaTimesCircle} color="red" />
          <StatsCard label={t("app.Total Screens")} value={stats.screens} icon={MdTheaters} color="purple" />
          <StatsCard label={t("app.Cities")} value={stats.cities} icon={FaMapMarkerAlt} color="yellow" />
        </div>
        
        {/* Filters */}
        <div className="rounded-xl p-5 mb-8 flex flex-wrap gap-3 items-center shadow-lg transition-all duration-300"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex-1 min-w-[220px] relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--foreground)", opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder={t("app.Search theaters, cities, locations…")}
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
            <option value="ALL">{t("app.All Status")}</option>
            <option value="ACTIVE">{t("app.Active")}</option>
            <option value="INACTIVE">{t("app.Inactive")}</option>
          </select>
          
          <select 
            value={cityFilter} 
            onChange={e => setCityFilter(e.target.value)} 
            className="appearance-none rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
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
          
          <div className="ml-auto text-xs font-semibold" style={{ color: "var(--foreground)", opacity: 0.4 }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
        
        {/* Theater Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl text-center py-16 px-8 shadow-xl transition-all duration-300"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--background)" }}>
              <FaBuilding className="text-3xl" style={{ color: "var(--foreground)", opacity: 0.2 }} />
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--foreground)" }}>No theaters found</h3>
            <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
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
      />
      
      <EditTheaterModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingTheater(null); }}
        theater={editingTheater}
        onUpdate={handleUpdateTheater}
      />
      
      <ScreenViewModal 
        isOpen={isLayoutOpen} 
        onClose={() => { setIsLayoutOpen(false); setSelectedTheater(null); setSelectedScreenIdx(0); }} 
        theater={selectedTheater} 
        screens={selectedTheater?.screens || []} 
        selectedScreenIndex={selectedScreenIdx} 
        onScreenChange={setSelectedScreenIdx}
      />
    </div>
  );
}