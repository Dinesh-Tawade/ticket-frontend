"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllShowsAdmin, updateShowStatusAdmin, deleteShowAdmin } from "../../services/adminCommunication";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import { 
  FaCalendar, FaClock, FaTicketAlt, FaFilm, FaStar, FaLanguage, 
  FaChair, FaEdit, FaTrash, FaEye, FaEyeSlash, FaCheckCircle, 
  FaTimesCircle, FaSpinner, FaSearch, FaTimes, FaPlus,
  FaChevronLeft, FaChevronRight, FaCrown, FaRegGem
} from 'react-icons/fa';
import { MdTheaters, MdLocationOn, MdEventSeat, MdScreenShare } from 'react-icons/md';
import { GiFilmProjector } from 'react-icons/gi';

// ==================== SEAT LAYOUT PREVIEW (Same as Create Show Page) ====================
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
          {row.seats && row.seats.slice(0, 15).map((seat, seatIdx) => (
            <div
              key={seat.seatId || seatIdx}
              className="relative group"
              onMouseEnter={() => setHoveredSeat(seat.seatId)}
              onMouseLeave={() => setHoveredSeat(null)}
            >
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm flex items-center justify-center text-[8px] sm:text-[9px] font-mono font-bold transition-all cursor-pointer hover:scale-110"
                style={{ 
                  background: `${zone.color}25`, 
                  color: zone.color, 
                  border: `1px solid ${zone.color}50`,
                }}
              >
                {seat.seatLabel || seat.seatNumber}
              </div>
              {hoveredSeat === seat.seatId && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 shadow-lg">
                  {seat.seatLabel}
                </div>
              )}
            </div>
          ))}
          {row.seatCount > 15 && (
            <div className="w-6 h-6 rounded-sm flex items-center justify-center text-[8px] text-foreground/40 bg-foreground/5">
              +{row.seatCount - 15}
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

// ==================== VIEW SEATS MODAL ====================
const ViewSeatsModal = ({ isOpen, onClose, show, theaterData }) => {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };
  
  if (!isOpen || !show) return null;
  
  // Get screen from theater data to get zones
  const screen = theaterData?.screens?.find(s => s._id === show.screenId);
  const zones = screen?.zones || [];
  const screenPosition = theaterData?.screenPosition || "top";
  
  return (
    <div 
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={handleClose}
    >
      <div 
        className={`rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-5 border-b bg-card" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{show.movie?.name}</h2>
              <p className="text-sm text-foreground/50 mt-1">
                {show.theaterId?.name} • {screen?.name || `Screen ${show.screenNumber}`}
              </p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-foreground/40">
                <span className="flex items-center gap-1">
                  <FaCalendar size={10} /> {new Date(show.showDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock size={10} /> {show.startTime} - {show.endTime}
                </span>
                <span className="flex items-center gap-1">
                  <FaChair size={10} /> {show.availableSeats} seats available
                </span>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="p-2 rounded-lg hover:bg-foreground/10 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* 2D Seat Layout - Same as Create Show Page */}
        <div className="p-5">
          <SeatLayoutPreview zones={zones} screenPosition={screenPosition} />
        </div>
        
        {/* Legend */}
        <div className="border-t p-4 flex flex-wrap gap-4 justify-center" style={{ borderColor: "var(--card-border)" }}>
          {zones.slice(0, 4).map(zone => (
            <div key={zone.id} className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: zone.color }} />
              <span className="text-foreground/70">{zone.name}</span>
              <span className="text-foreground/40">₹{zone.basePrice * zone.priceMultiplier}</span>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t bg-card" style={{ borderColor: "var(--card-border)" }}>
          <button 
            onClick={handleClose} 
            className="w-full py-2.5 rounded-lg bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== STATS CARD ====================
const StatsCard = ({ label, value, icon: Icon, color }) => (
  <div className="rounded-xl p-4 bg-card border transition-all hover:scale-105 hover:shadow-lg" style={{ borderColor: "var(--card-border)" }}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl sm:text-3xl font-black" style={{ color }}>{value}</div>
        <div className="text-xs text-foreground/50 mt-1">{label}</div>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <Icon className="text-lg" style={{ color }} />
      </div>
    </div>
  </div>
);

// ==================== SHOW CARD ====================
const ShowCard = ({ show, onViewSeats, onStatusToggle, onDelete, theaterData }) => {
  const [imageError, setImageError] = useState(false);
  
  const getStatus = (status) => {
    if (status === 'BOOKING_OPEN') return { text: 'Booking Open', color: '#22c55e', icon: FaCheckCircle };
    if (status === 'BOOKING_CLOSED') return { text: 'Booking Closed', color: '#eab308', icon: FaEyeSlash };
    return { text: 'Cancelled', color: '#ef4444', icon: FaTimesCircle };
  };
  
  const statusConfig = getStatus(show.status);
  const StatusIcon = statusConfig.icon;
  
  const getPriceRange = () => {
    const prices = show.seatCategories?.map(c => c.pricePerSeat) || [];
    if (prices.length === 0) return 'N/A';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  };
  
  return (
    <div className="rounded-xl overflow-hidden bg-card border transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ borderColor: "var(--card-border)" }}>
      <div className="flex flex-col md:flex-row">
        {/* Poster Section */}
        <div className="md:w-48 h-56 md:h-auto relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          {show.movie?.poster && !imageError ? (
            <img 
              src={show.movie.poster.startsWith('data:') ? show.movie.poster : `${process.env.NEXT_PUBLIC_API_URL || ''}${show.movie.poster}`}
              alt={show.movie.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FaFilm className="text-5xl text-white/20" />
            </div>
          )}
          {show.movie?.isTrending && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-red-500/90 backdrop-blur-sm">
              <span className="text-[9px] font-bold text-white">🔥 Trending</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <span className="text-[9px] font-bold text-white">⭐ {show.movie?.rating || 'N/A'}</span>
          </div>
        </div>
        
        {/* Details Section */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{show.movie?.name}</h3>
              <div className="flex flex-wrap gap-2 text-xs text-foreground/50 mt-1">
                <span>{show.movie?.genre}</span>
                <span>•</span>
                <span>{show.movie?.duration} min</span>
                <span>•</span>
                <span>{show.movie?.language}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}>
              <StatusIcon size={10} /> {statusConfig.text}
            </div>
          </div>
          
          <p className="text-sm text-foreground/60 mb-3 line-clamp-2">{show.movie?.description || 'No description available'}</p>
          
          {/* Theater Info */}
          <div className="flex flex-wrap gap-4 text-xs mb-3">
            <div className="flex items-center gap-1.5">
              <MdTheaters className="text-red-400" size={14} />
              <span className="text-foreground/70">{show.theaterId?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MdLocationOn className="text-blue-400" size={14} />
              <span className="text-foreground/70">{show.theaterId?.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MdScreenShare className="text-purple-400" size={14} />
              <span className="text-foreground/70">Screen {show.screenNumber}</span>
            </div>
          </div>
          
          {/* Date Time & Availability */}
          <div className="flex flex-wrap gap-4 text-xs mb-3">
            <div className="flex items-center gap-1.5">
              <FaCalendar className="text-blue-400" size={12} />
              <span className="text-foreground/60">{new Date(show.showDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock className="text-green-400" size={12} />
              <span className="text-foreground/60">{show.startTime} - {show.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaChair className="text-green-400" size={12} />
              <span className="text-foreground/60">{show.availableSeats} / {show.totalSeats} seats</span>
            </div>
          </div>
          
          {/* Seat Categories */}
          <div className="flex flex-wrap gap-2 mb-3">
            {show.seatCategories?.map((cat, index) => {
              const colorMap = {
                NORMAL: '#3b82f6',
                EXECUTIVE: '#10b981',
                PREMIUM: '#8b5cf6',
                VIP: '#f59e0b'
              };
              const zoneColor = colorMap[cat.category] || '#3b82f6';
              return (
                <div 
                  key={`${cat.category}_${index}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: `${zoneColor}20`, color: zoneColor, border: `1px solid ${zoneColor}50` }}
                >
                  {cat.category}: ₹{cat.pricePerSeat}
                </div>
              );
            })}
            <div className="text-lg font-bold text-green-500 ml-auto">{getPriceRange()}</div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => onViewSeats(show)} 
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <FaTicketAlt size={12} /> View 2D Seats
            </button>
            <button 
              onClick={() => onStatusToggle(show)} 
              className="p-2 rounded-lg border transition-all hover:scale-105" 
              style={{ borderColor: "var(--card-border)" }}
              title={show.status === 'BOOKING_OPEN' ? 'Close Booking' : 'Open Booking'}
            >
              {show.status === 'BOOKING_OPEN' ? 
                <FaEyeSlash className="text-yellow-500" size={14} /> : 
                <FaEye className="text-green-500" size={14} />
              }
            </button>
            <button 
              onClick={() => onDelete(show)} 
              className="p-2 rounded-lg border transition-all hover:scale-105 hover:bg-red-500/10" 
              style={{ borderColor: "var(--card-border)" }}
              title="Delete Show"
            >
              <FaTrash className="text-red-500" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function ShowsManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedShow, setSelectedShow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theaterDataMap, setTheaterDataMap] = useState({});
  
  const { data, isLoading } = useQuery({
    queryKey: ['allShows'],
    queryFn: getAllShowsAdmin
  });
  
  const shows = data?.data || [];
  
  // Fetch theater data for each show to get zone colors
  useEffect(() => {
    const fetchTheaterData = async () => {
      const { getTheaterByIdAdmin } = await import("../../services/adminCommunication");
      const theaterMap = {};
      for (const show of shows) {
        if (show.theaterId?._id && !theaterMap[show.theaterId._id]) {
          try {
            const res = await getTheaterByIdAdmin(show.theaterId._id);
            theaterMap[show.theaterId._id] = res.data;
          } catch (error) {
            console.error("Failed to fetch theater:", error);
          }
        }
      }
      setTheaterDataMap(theaterMap);
    };
    if (shows.length > 0) fetchTheaterData();
  }, [shows]);
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statusData }) => updateShowStatusAdmin(id, statusData),
    onSuccess: () => { 
      queryClient.invalidateQueries(['allShows']); 
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status')
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteShowAdmin(id),
    onSuccess: () => { 
      queryClient.invalidateQueries(['allShows']); 
      toast.success('Show deleted successfully');
    },
    onError: () => toast.error('Failed to delete show')
  });
  
  const handleDelete = (show) => {
    if (confirm(`Delete "${show.movie?.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(show._id);
    }
  };
  
  const filtered = useMemo(() => {
    return shows.filter(show => {
      const matchSearch = !searchTerm || 
        show.movie?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        show.theaterId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || show.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [shows, searchTerm, statusFilter]);
  
  const stats = {
    total: shows.length,
    open: shows.filter(s => s.status === 'BOOKING_OPEN').length,
    closed: shows.filter(s => s.status === 'BOOKING_CLOSED').length,
    seats: shows.reduce((sum, s) => sum + (s.totalSeats || 0), 0)
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-3" />
          <p className="text-foreground/50">Loading shows...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="rounded-xl p-4 mb-6 bg-card border" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <GiFilmProjector className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Shows Management</h1>
              <p className="text-xs text-foreground/50">Manage all movie screenings</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/admin/shows/create')} 
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
          >
            <FaPlus size={12} /> Add Show
          </button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatsCard label="Total Shows" value={stats.total} icon={FaFilm} color="#8b5cf6" />
        <StatsCard label="Booking Open" value={stats.open} icon={FaCheckCircle} color="#22c55e" />
        <StatsCard label="Booking Closed" value={stats.closed} icon={FaEyeSlash} color="#eab308" />
        <StatsCard label="Total Seats" value={stats.seats} icon={FaChair} color="#3b82f6" />
      </div>
      
      {/* Filters */}
      <div className="rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center bg-card border" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex-1 min-w-[180px] relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search by movie or theater..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-background border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-background border focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
        >
          <option value="ALL">All Status</option>
          <option value="BOOKING_OPEN">Booking Open</option>
          <option value="BOOKING_CLOSED">Booking Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {(searchTerm || statusFilter !== "ALL") && (
          <button 
            onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }} 
            className="px-3 py-2 rounded-lg text-red-500 text-sm hover:bg-red-500/10 transition-all"
          >
            Clear
          </button>
        )}
        <div className="text-xs text-foreground/40 ml-auto">
          {filtered.length} show{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Shows Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
          <FaFilm className="text-5xl mx-auto mb-3 text-foreground/30" />
          <p className="text-foreground/50">No shows found</p>
          {!searchTerm && statusFilter === "ALL" && (
            <button 
              onClick={() => router.push('/admin/shows/create')} 
              className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-bold"
            >
              Create Your First Show
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(show => (
            <ShowCard
              key={show._id}
              show={show}
              theaterData={theaterDataMap[show.theaterId?._id]}
              onViewSeats={(s) => { setSelectedShow(s); setIsModalOpen(true); }}
              onStatusToggle={(s) => {
                const newStatus = s.status === 'BOOKING_OPEN' ? 'BOOKING_CLOSED' : 'BOOKING_OPEN';
                updateStatusMutation.mutate({ id: s._id, statusData: { status: newStatus } });
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      
      {/* View Seats Modal */}
      <ViewSeatsModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedShow(null); }} 
        show={selectedShow}
        theaterData={theaterDataMap[selectedShow?.theaterId?._id]}
      />
    </div>
  );
}