"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllShowsAdmin, updateShowStatusAdmin, deleteShowAdmin } from "../../services/adminCommunication";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import { 
  FaCalendar, FaClock, FaMapMarkerAlt, FaTicketAlt, FaFilm, 
  FaStar, FaLanguage, FaTags, FaChair, FaInfoCircle, FaEdit, 
  FaTrash, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaSearch, FaTimes, FaPlus, FaCrown, FaRegGem
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare, MdLocationOn, MdEventSeat, MdLocalMovies } from 'react-icons/md';
import { GiFilmProjector } from 'react-icons/gi';
import useTheme from "@/app/hooks/useTheme";
import "../../i18n";
import { useTranslation } from "react-i18next";


const SEAT_TYPES = {
  NORMAL: { label: "Standard", color: "blue", symbol: "S", mult: "1×", icon: MdEventSeat },
  EXECUTIVE: { label: "Executive", color: "green", symbol: "E", mult: "1.5×", icon: FaStar },
  PREMIUM: { label: "Premium", color: "purple", symbol: "P", mult: "2×", icon: FaRegGem },
  VIP: { label: "VIP", color: "yellow", symbol: "V", mult: "3×", icon: FaCrown },
};

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

// Stats Card Component with Animated Counter
const StatsCard = ({ label, value, icon: Icon, color }) => (
  <div className={`group rounded-xl p-4 flex items-center justify-between shadow-sm transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105 bg-card border`}
    style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
    <div className={`absolute inset-0 bg-gradient-to-r from-${color}-500/0 via-${color}-500/5 to-${color}-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors" style={{ color: "var(--foreground)", opacity: 0.4 }}>{label}</div>
      <AnimatedCounter value={value} />
    </div>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 bg-${color}-500/10 border`}
      style={{ borderColor: "var(--card-border)" }}>
      <Icon className={`text-xl transition-transform group-hover:scale-110 text-${color}-400`} />
    </div>
  </div>
);

const SeatLegend = ({ type }) => {
  const cfg = SEAT_TYPES[type];
  const Icon = cfg.icon;

  return (
    <div className="group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer border hover:shadow-lg hover:shadow-blue-500/20"
      style={{ background: "rgba(var(--card), 0.5)", borderColor: "var(--card-border)" }}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold transition-transform group-hover:scale-110 bg-${cfg.color}-900/30 border`}
        style={{ borderColor: "var(--card-border)" }}>
        <Icon className={`text-xs text-${cfg.color}-400`} />
      </div>
      <div>
        <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{cfg.label}</div>
        <div className="text-[11px]" style={{ color: "var(--foreground)", opacity: 0.6 }}>{cfg.mult} price</div>
      </div>
    </div>
  );
};

const ViewSeatsModal = ({ isOpen, onClose, show }) => {
  const [hovered, setHovered] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [rippleEffect, setRippleEffect] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
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

  const getSeatsByRow = useMemo(() => {
    if (!show?.seatCategories) return {};
    
    const all = [];
    show.seatCategories.forEach(category => {
      category.rows?.forEach(row => {
        row.seats?.forEach(seat => {
          all.push({
            row: row.rowName,
            number: seat.seatNumber,
            category: category.category,
            isBooked: seat.isBooked
          });
        });
      });
    });
    
    return all.reduce((acc, s) => {
      if (!acc[s.row]) acc[s.row] = [];
      acc[s.row].push(s);
      return acc;
    }, {});
  }, [show]);

  const total = useMemo(() => Object.values(getSeatsByRow).reduce((t, r) => t + r.length, 0), [getSeatsByRow]);
  
  const catCounts = useMemo(() => {
    const c = {};
    Object.values(getSeatsByRow).flat().forEach(s => c[s.category] = (c[s.category] || 0) + 1);
    return c;
  }, [getSeatsByRow]);

  const handleSeatClick = (seat) => {
    if (!seat.isBooked) {
      setSelectedSeat(seat);
      setRippleEffect(seat);
      setTimeout(() => setRippleEffect(null), 500);
    }
  };

  if (!showModal || !show) return null;

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}>
      <div className="rounded-2xl w-full max-w-[1200px] max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)", opacity: isClosing ? 0 : 1, transform: isClosing ? "translateY(16px)" : "translateY(0)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
        <div className="sticky top-0 z-10 border-b rounded-t-2xl p-6 backdrop-blur-sm transition-all duration-300"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-1 rounded-full bg-gradient-primary" />
                <div className="w-6 h-1 rounded-full bg-gradient-primary" />
              </div>
              <h2 className="text-2xl font-extrabold font-poppins" style={{ color: "var(--foreground)" }}>{show.movie?.name}</h2>
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                <MdLocationOn className="text-blue-500 text-sm animate-pulse" />
                {show.theaterId?.name}, {show.theaterId?.location}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg transition-all duration-300 group border bg-card/50"
              style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}>
              <FaTimes className="text-sm group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Screen", value: `#${show.screenNumber}`, color: "blue", icon: MdScreenShare },
              { label: "Total Seats", value: total, color: "green", icon: MdEventSeat },
              ...Object.entries(catCounts).map(([cat, n]) => ({ 
                label: SEAT_TYPES[cat]?.label || cat, 
                value: n, 
                color: SEAT_TYPES[cat]?.color || "blue", 
                icon: SEAT_TYPES[cat]?.icon || MdEventSeat 
              })),
            ].map((chip, i) => {
              const Icon = chip.icon;
              return (
                <div key={i} className={`relative group overflow-hidden px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-in slide-in-from-bottom duration-500 bg-gradient-to-br border`}
                  style={{ background: `linear-gradient(to bottom right, rgba(var(--${chip.color}-500), 0.1), var(--card))`, borderColor: "var(--card-border)", animationDelay: `${i * 100}ms` }}>
                  <div className={`absolute inset-0 bg-gradient-to-r from-${chip.color}-500/0 via-${chip.color}-500/10 to-${chip.color}-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
                  <Icon className={`text-lg mb-1 text-${chip.color}-400 animate-pulse`} />
                  <div className={`text-[9px] font-bold uppercase tracking-wider text-${chip.color}-400`}>{chip.label}</div>
                  <div className={`text-2xl font-black leading-tight text-${chip.color}-400`}>{chip.value}</div>
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
              <div className="h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-80 mb-2 animate-pulse shadow-[0_0_30px_#3b82f6]" />
              <div className="h-6 bg-gradient-to-b from-blue-500/30 to-transparent rounded-b-[60%] mb-3" />
              <MdLocalMovies className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce text-blue-400/50" />
              <span className="text-[10px] font-extrabold tracking-[6px] uppercase relative inline-block" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                ◄ SILVER SCREEN ►
                <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-4 relative">
            <div className="min-w-max">
              {Object.entries(getSeatsByRow).sort().map(([rowName, seats], rowIdx) => (
                <div key={rowName} className="flex items-center gap-3 mb-3 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${rowIdx * 80}ms` }}>
                  <div className="w-8 text-center">
                    <div className="text-xs font-black transition-colors duration-300" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                      {rowName}
                    </div>
                    <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent mx-auto mt-1" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {seats.sort((a, b) => a.number - b.number).map((seat, seatIdx) => {
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
                            seat.isBooked 
                              ? 'bg-red-500/20 border border-red-500/50 text-red-400 cursor-not-allowed'
                              : isHov 
                                ? `bg-${cfg.color}-500 text-white shadow-2xl scale-110 ring-2 ring-${cfg.color}-400 ring-offset-2 ring-offset-card`
                                : isSelected
                                ? `bg-${cfg.color}-500 text-white shadow-lg`
                                : `bg-${cfg.color}-900/30 border text-${cfg.color}-400 hover:bg-${cfg.color}-500 hover:text-white hover:border-${cfg.color}-500`
                          }`}
                            style={!seat.isBooked && !isHov && !isSelected ? { borderColor: "var(--card-border)" } : {}}>
                            <Icon className={`text-xs ${isHov || isSelected ? 'text-white' : ''}`} />
                            <span className="text-[8px] font-bold mt-0.5">{seat.number}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap animate-in zoom-in duration-200 bg-gray-900 border"
                              style={{ borderColor: "var(--card-border)" }}>
                              Selected!
                            </div>
                          )}
                          {isHov && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap animate-in fade-in duration-150 z-20 bg-gray-900 border"
                              style={{ borderColor: "var(--card-border)" }}>
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
            {hovered && !hovered.isBooked && (() => {
              const cfg = SEAT_TYPES[hovered.category] || SEAT_TYPES.NORMAL;
              const Icon = cfg.icon;
              return (
                <div className={`flex items-center gap-4 p-4 rounded-xl animate-in slide-in-from-bottom duration-300 shadow-lg bg-gradient-to-r border`}
                  style={{ background: `linear-gradient(to right, rgba(var(--${cfg.color}-500), 0.1), var(--card))`, borderColor: `rgba(var(--${cfg.color}-500), 0.3)` }}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-xl animate-bounce bg-${cfg.color}-500`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-black" style={{ color: "var(--foreground)" }}>Seat {hovered.row}{hovered.number}</div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--foreground)", opacity: 0.6 }}>{cfg.label} Category</div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-black text-lg shadow-lg bg-${cfg.color}-500 text-white`}>
                    {cfg.symbol}
                  </div>
                </div>
              );
            })()}
            {selectedSeat && !hovered && (
              <div className="flex items-center gap-4 p-4 rounded-xl animate-in fade-in duration-300 bg-gradient-to-r border"
                style={{ background: "linear-gradient(to right, rgba(34,197,94,0.1), var(--card))", borderColor: "rgba(34,197,94,0.3)" }}>
                <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center shadow-xl">
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
              <div className="w-8 h-px bg-gradient-primary" />
              SEAT CATEGORIES
              <div className="w-8 h-px bg-gradient-primary" />
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.keys(SEAT_TYPES).map(key => <SeatLegend key={key} type={key} />)}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-5 rounded-b-2xl transition-all duration-300 bg-card border-t"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <button onClick={onClose} className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 border"
            style={{ borderColor: "var(--card-border)" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Show Modal
const EditShowModal = ({ isOpen, onClose, show, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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

  useEffect(() => {
    if (show) {
      setFormData({
        showDate: new Date(show.showDate).toISOString().split('T')[0],
        startTime: show.startTime,
        endTime: show.endTime,
        status: show.status,
      });
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onUpdate(show._id, formData);
    setIsSubmitting(false);
  };

  if (!showModal) return null;

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}>
      <div className="rounded-2xl w-full max-w-md shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)", opacity: isClosing ? 0 : 1, transform: isClosing ? "translateY(16px)" : "translateY(0)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
        <div className="sticky top-0 z-10 border-b rounded-t-2xl p-6"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <FaEdit className="text-white text-sm" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>Edit Show</h2>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>{show?.movie?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg transition-all hover:scale-105 hover:bg-red-500/10"
              style={{ color: "var(--foreground)", opacity: 0.6 }}>
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Show Date</label>
            <input
              type="date"
              name="showDate"
              value={formData.showDate || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Status</label>
            <select
              name="status"
              value={formData.status || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer bg-background border"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <option value="BOOKING_OPEN">Booking Open</option>
              <option value="BOOKING_CLOSED">Booking Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={isSubmitting} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
            }`}
              style={{ borderColor: isSubmitting ? undefined : "var(--card-border)" }}>
              {isSubmitting ? <><FaSpinner className="animate-spin text-sm" /> Updating...</> : <>Save Changes</>}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border"
              style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Confirm Modal
const ConfirmModal = ({ isOpen, onClose, onConfirm, icon, color, title, body, confirmLabel, isLoading }) => {
  const [isClosing, setIsClosing] = useState(false);
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
    onConfirm();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}>
      <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)", opacity: isClosing ? 0 : 1, transform: isClosing ? "scale(0.95)" : "scale(1)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-bounce bg-${color}-500/20 border`}
          style={{ borderColor: "var(--card-border)" }}>{icon}</div>
        <h2 className="text-xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>{title}</h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.6 }}>{body}</p>
        <div className="flex gap-2.5">
          <button onClick={handleConfirm} disabled={isLoading} className={`flex-1 rounded-xl py-2.5 text-white font-bold text-sm transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-${color}-500 hover:opacity-90`}>{isLoading ? 'Deleting...' : confirmLabel}</button>
          <button onClick={handleClose} className="flex-1 rounded-xl py-2.5 font-bold text-sm transition-all border"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Show Card Component
const ShowCard = ({ show, onViewSeats, onEdit, onDelete, onStatusToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'BOOKING_OPEN':
        return { color: 'green', text: 'Booking Open', icon: FaCheckCircle, bgClass: 'bg-green-500/20 border border-green-500/50 text-green-400' };
      case 'BOOKING_CLOSED':
        return { color: 'yellow', text: 'Booking Closed', icon: FaEyeSlash, bgClass: 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' };
      case 'CANCELLED':
        return { color: 'red', text: 'Cancelled', icon: FaTimesCircle, bgClass: 'bg-red-500/20 border border-red-500/50 text-red-400' };
      default:
        return { color: 'gray', text: status, icon: FaInfoCircle, bgClass: 'bg-gray-500/20 border border-gray-500/50 text-gray-400' };
    }
  };
  
  const statusConfig = getStatusBadge(show.status);
  const StatusIcon = statusConfig.icon;
  
  const posterUrl = show.movie?.poster?.startsWith('data:') 
    ? show.movie.poster 
    : show.movie?.poster 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${show.movie.poster}`
      : null;

  const getPriceRange = () => {
    const prices = show.seatCategories?.map(cat => cat.pricePerSeat) || [];
    if (prices.length === 0) return 'N/A';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'NORMAL': return 'blue';
      case 'EXECUTIVE': return 'green';
      case 'PREMIUM': return 'purple';
      case 'VIP': return 'yellow';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'NORMAL': return MdEventSeat;
      case 'EXECUTIVE': return FaStar;
      case 'PREMIUM': return FaRegGem;
      case 'VIP': return FaCrown;
      default: return FaChair;
    }
  };

  return (
    <div 
      className="group rounded-2xl overflow-hidden flex flex-col shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl bg-card border hover:border-blue-500/50"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left Side - Poster */}
        <div className="lg:w-72 relative overflow-hidden bg-gradient-primary min-h-[320px]">
          <div className={`absolute inset-0 bg-gradient-primary transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`} />
          {posterUrl && !imageError ? (
            <img 
              src={posterUrl}
              alt={show.movie?.name}
              className="w-full h-full object-cover relative z-10"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full relative z-10">
              <FaFilm className="text-6xl text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />
          {show.movie?.isTrending && (
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/80 backdrop-blur-sm border border-red-400/50">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">🔥 Trending</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <FaStar className="text-yellow-400 text-[10px]" />
            <span className="text-[10px] font-bold text-white">{show.movie?.rating || 'N/A'}</span>
          </div>
        </div>

        {/* Right Side - All Details */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>
                  {show.movie?.name || 'Movie Title'}
                </h2>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConfig.bgClass}`}>
                  <StatusIcon className="text-[8px]" />
                  {statusConfig.text}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1 text-foreground/60">
                  <FaStar className="text-yellow-500 text-[11px]" /> {show.movie?.rating || 'N/A'}
                </span>
                <span className="flex items-center gap-1 text-foreground/60">
                  <FaClock className="text-blue-400 text-[11px]" /> {show.movie?.duration || 'N/A'} mins
                </span>
                <span className="flex items-center gap-1 text-foreground/60">
                  <FaLanguage className="text-green-400 text-[11px]" /> {show.movie?.language || 'Unknown'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 border"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}>
                  {show.movie?.genre || 'General'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-green-500">{getPriceRange()}</div>
              <div className="text-[10px] text-foreground/40">per ticket</div>
            </div>
          </div>

          <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            {show.movie?.description || 'No description available'}
          </p>

          <div className="py-3 mb-3 border-t border-b" style={{ borderColor: "var(--card-border)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MdTheaters className="text-red-500 text-sm" />
                  <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    {show.theaterId?.name || 'Theater Name'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <MdLocationOn className="text-blue-500 text-[11px]" />
                  <span>{show.theaterId?.location}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MdScreenShare className="text-purple-500 text-sm" />
                  <span className="text-sm text-foreground/80">Screen {show.screenNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <FaChair className="text-green-500 text-[11px]" />
                  <span>{show.availableSeats} seats available out of {show.totalSeats}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-3 text-xs text-foreground/60">
            <div className="flex items-center gap-1.5">
              <FaCalendar className="text-blue-400 text-[11px]" />
              <span>{new Date(show.showDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock className="text-green-400 text-[11px]" />
              <span>{show.startTime} - {show.endTime}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-foreground/40 flex items-center gap-2">
              <FaTags className="text-xs" /> Seat Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {show.seatCategories?.slice(0, 4).map((category) => {
                const catColor = getCategoryColor(category.category);
                const CategoryIcon = getCategoryIcon(category.category);
                return (
                  <div key={category.category} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-${catColor}-900/30 border text-${catColor}-400`}
                    style={{ borderColor: "var(--card-border)" }}>
                    <CategoryIcon className="text-[8px]" />
                    {category.category}: ₹{category.pricePerSeat}
                  </div>
                );
              })}
              {show.seatCategories?.length > 4 && (
                <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 border"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}>
                  +{show.seatCategories.length - 4}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <button onClick={() => onViewSeats(show)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl py-2 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border"
              style={{ borderColor: "var(--card-border)" }}>
              <FaTicketAlt className="text-[10px]" /> View Seats
            </button>
            <button onClick={() => onEdit(show)} className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border bg-card/50 hover:bg-yellow-500/10 hover:border-yellow-500/50"
              style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}>
              <FaEdit className="text-xs" />
            </button>
            <button onClick={() => onStatusToggle(show)} className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border bg-card/50 hover:bg-green-500/10 hover:border-green-500/50"
              style={{ borderColor: "var(--card-border)" }}>
              {show.status === 'BOOKING_OPEN' ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
            </button>
            <button onClick={() => onDelete(show)} className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border bg-card/50 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
              style={{ borderColor: "var(--card-border)" }}>
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ShowsManagement() {
  const {t} = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedShow, setSelectedShow] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [deletingShow, setDeletingShow] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, error, refetch } = useQuery({
    queryKey: ['allShows'],
    queryFn: getAllShowsAdmin
  });

  const shows = data?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statusData }) => updateShowStatusAdmin(id, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries(['allShows']);
      toast.success('Show status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const updateShowMutation = useMutation({
    mutationFn: ({ id, data }) => updateShowAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allShows']);
      toast.success('Show updated successfully');
      setIsEditModalOpen(false);
      setEditingShow(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update show');
    }
  });

  const deleteShowMutation = useMutation({
    mutationFn: (id) => deleteShowAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allShows']);
      toast.success('Show deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingShow(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete show');
    }
  });

  const handleStatusToggle = (show) => {
    let newStatus;
    switch(show.status) {
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
    updateStatusMutation.mutate({ id: show._id, statusData: { status: newStatus } });
  };

  const handleEdit = (show) => {
    setEditingShow(show);
    setIsEditModalOpen(true);
  };

  const handleUpdateShow = async (id, data) => {
    await updateShowMutation.mutateAsync({ id, data });
  };

  const handleDeleteClick = (show) => {
    setDeletingShow(show);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingShow) {
      deleteShowMutation.mutate(deletingShow._id);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const filtered = useMemo(() => shows.filter(show => {
    const q = searchTerm.toLowerCase();
    return (!q || show.movie?.name?.toLowerCase().includes(q) || show.theaterId?.name?.toLowerCase().includes(q)) &&
      (statusFilter === "ALL" || show.status === statusFilter);
  }), [shows, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: shows.length,
    bookingOpen: shows.filter(s => s.status === 'BOOKING_OPEN').length,
    bookingClosed: shows.filter(s => s.status === 'BOOKING_CLOSED').length,
    cancelled: shows.filter(s => s.status === 'CANCELLED').length,
    totalSeats: shows.reduce((total, show) => total + (show.totalSeats || 0), 0),
  }), [shows]);

  const hasFilters = searchTerm || statusFilter !== "ALL";
  const clearFilters = useCallback(() => { 
    setSearchTerm(""); 
    setStatusFilter("ALL"); 
  }, []);



  return (
    <div className="min-h-screen transition-colors duration-300 bg-background" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" toastOptions={{
        className: "!rounded-xl !text-sm !font-semibold !shadow-xl !bg-card !text-foreground !border",
        style: { borderColor: "var(--card-border)" },
        duration: 3000
      }} />
      
      {/* Header */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="mx-auto px-8">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-primary animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-xl">
                  <GiFilmProjector className="text-white text-xl animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight transition-colors duration-300" style={{ color: "var(--foreground)" }}>
                  {t("app.Shows Management")}
                </h1>
                <p className="text-xs font-medium transition-colors duration-300" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {t("app.Manage movie screenings & seat availability")}
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
                onClick={() => router.push('/admin/shows/create')}
                className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border"
                style={{ borderColor: "var(--card-border)" }}
              >
                <FaPlus className="text-[11px]" /> {t("app.create new show")}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className=" mx-auto pt-8">
        {/* Stats Cards with Animated Counter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatsCard label={t("app.Total Shows")} value={stats.total} icon={FaFilm} color="purple" />
          <StatsCard label={t("app.Booking Open")} value={stats.bookingOpen} icon={FaCheckCircle} color="green" />
          <StatsCard label={t("app.Booking Closed")} value={stats.bookingClosed} icon={FaEyeSlash} color="yellow" />
          <StatsCard label={t("app.Cancelled")} value={stats.cancelled} icon={FaTimesCircle} color="red" />
          <StatsCard label={t("app.Total Seats")} value={stats.totalSeats} icon={FaChair} color="blue" />
        </div>
        
        {/* Search and Filter */}
        <div className="rounded-xl p-5 mb-8 flex flex-wrap gap-3 items-center shadow-lg transition-all duration-300 bg-card border"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex-1 min-w-[220px] relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--foreground)", opacity: 0.4 }} />
            <input type="text" placeholder={t("app.Search by movie or theater...")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background border"
            style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
            <option value="ALL">{t("app.All Status")}</option>
            <option value="BOOKING_OPEN">{t("app.Booking Open")}</option>
            <option value="BOOKING_CLOSED">{t("app.Booking Closed")}</option>
            <option value="CANCELLED">{t("app.Cancelled")}</option>
          </select>
          {hasFilters && <button onClick={clearFilters} className="px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-transparent text-red-500 font-bold text-xs flex items-center gap-1.5 hover:bg-red-500/10 transition-all hover:scale-105"><FaTimes className="text-[10px]" /> Clear</button>}
          <div className="ml-auto text-xs font-semibold" style={{ color: "var(--foreground)", opacity: 0.4 }}>{filtered.length} show{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        
        {/* Shows Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl text-center py-16 px-8 shadow-xl transition-all duration-300 bg-card border"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-background/50"
              style={{ background: "rgba(var(--background), 0.5)" }}>
              <FaFilm className="text-3xl" style={{ color: "var(--foreground)", opacity: 0.2 }} />
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--foreground)" }}>No shows found</h3>
            <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>{hasFilters ? "Try adjusting your filters" : "Create your first show to get started"}</p>
            {!hasFilters && <button onClick={() => router.push('/admin/shows/create')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all hover:-translate-y-0.5 border"
              style={{ borderColor: "var(--card-border)" }}><FaPlus className="text-[11px]" /> Create Show</button>}
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((show, idx) => (
              <div key={show._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                <ShowCard
                  show={show}
                  onViewSeats={(s) => { setSelectedShow(s); setIsViewModalOpen(true); }}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onStatusToggle={handleStatusToggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ViewSeatsModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedShow(null); }} show={selectedShow} />
      <EditShowModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingShow(null); }} show={editingShow} onUpdate={handleUpdateShow} />
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeletingShow(null); }} onConfirm={handleDeleteConfirm} icon={<FaTrash className="text-red-500 text-xl" />} color="red" title="Delete Show" body={<>Delete <strong>{deletingShow?.movie?.name}</strong>? This action cannot be undone.</>} confirmLabel="Delete" isLoading={deleteShowMutation.isPending} />
    </div>
  );
}