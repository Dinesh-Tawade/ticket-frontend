"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  getAllTheatersAdmin,
  deleteTheaterAdmin,
  updateTheaterAdmin,
  getTheaterByIdAdmin,
} from "../../services/adminCommunication";
import {
  FaBuilding, FaMapMarkerAlt, FaPhone, FaTicketAlt, FaCouch, FaWifi,
  FaParking, FaCoffee, FaAccessibleIcon, FaEdit, FaTrash, FaPlus,
  FaSearch, FaTimes, FaCheckCircle, FaTimesCircle, FaChevronDown,
  FaSpinner, FaEye, FaChevronLeft, FaChevronRight,
  FaSort, FaSortUp, FaSortDown, FaExpand, FaCompress
} from "react-icons/fa";
import { MdTheaters, MdEventSeat, MdScreenShare } from "react-icons/md";
import { GiTheaterCurtains } from "react-icons/gi";

const AMENITIES = [
  { icon: FaCouch, name: "Recliner", key: "hasRecliner", color: "blue" },
  { icon: FaWifi, name: "WiFi", key: "hasWifi", color: "indigo" },
  { icon: FaParking, name: "Parking", key: "hasParking", color: "green" },
  { icon: FaCoffee, name: "Café", key: "hasCafe", color: "orange" },
  { icon: FaAccessibleIcon, name: "Wheelchair", key: "hasWheelchair", color: "purple" },
];

// ==================== SEAT LAYOUT PREVIEW COMPONENT (2D Visual) ====================
const SeatLayoutPreview = ({ zones, screenPosition }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  
  if (!zones || zones.length === 0) {
    return (
      <div className="text-center py-12 text-foreground/40">
        <MdEventSeat className="text-5xl mx-auto mb-3 opacity-30" />
        <p className="text-sm">No zones configured for this screen</p>
      </div>
    );
  }
  
  const renderZoneSeats = (zone) => {
    if (!zone.rows || zone.rows.length === 0) {
      return <div className="text-center text-xs opacity-40 py-4">No seats in this zone</div>;
    }
    
    return zone.rows.map((row, rowIdx) => (
      <div key={row.rowId || rowIdx} className="flex items-center justify-center gap-1 mb-1.5">
        <div className="w-6 text-[10px] font-bold text-foreground/40 text-right">
          {row.rowName}
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {row.seats && row.seats.map((seat, seatIdx) => (
            <div
              key={seat.seatId || seatIdx}
              className="relative group"
              onMouseEnter={() => setHoveredSeat(seat.seatId)}
              onMouseLeave={() => setHoveredSeat(null)}
            >
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-bold transition-all cursor-pointer hover:scale-110 hover:shadow-lg"
                style={{ 
                  background: `${zone.color}20`, 
                  color: zone.color, 
                  border: `1.5px solid ${zone.color}50`,
                  boxShadow: hoveredSeat === seat.seatId ? `0 0 0 2px ${zone.color}` : 'none'
                }}
              >
                {seat.seatLabel || seat.seatNumber}
              </div>
              {hoveredSeat === seat.seatId && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-2 py-0.5 rounded whitespace-nowrap z-10 shadow-lg">
                  {seat.seatLabel} • ₹{zone.basePrice * zone.priceMultiplier}
                </div>
              )}
            </div>
          ))}
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
    <div className="bg-background border-2 rounded-2xl overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
      {screenPosition === "top" && (
        <div className="text-center py-5 bg-gradient-to-b from-red-500/15 to-transparent">
          <div className="inline-block px-8 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg">
            🎬 S C R E E N
          </div>
          <p className="text-[10px] text-foreground/40 mt-2">← AUDIENCE VIEW →</p>
        </div>
      )}
      
      <div className="p-5">
        {zonesByPosition.top.length > 0 && (
          <div className="mb-6">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-foreground/10 text-foreground/60">
                ⬆️ BALCONY / UPPER LEVEL ⬆️
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {zonesByPosition.top.map(zone => (
                <div key={zone.id} className="bg-card rounded-xl p-4 shadow-md" style={{ border: `2px solid ${zone.color}30` }}>
                  <div className="text-center mb-3">
                    <span className="text-sm font-bold px-4 py-1.5 rounded-full" style={{ background: `${zone.color}20`, color: zone.color }}>
                      {zone.name}
                    </span>
                    <div className="text-[10px] text-foreground/40 mt-1">{zone.totalSeats} seats • ₹{zone.basePrice * zone.priceMultiplier}/seat</div>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-6 items-start">
          {zonesByPosition.left.length > 0 && (
            <div className="flex-shrink-0">
              <div className="text-center mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/10">⬅️ LEFT WING</span>
              </div>
              {zonesByPosition.left.map(zone => (
                <div key={zone.id} className="bg-card rounded-xl p-3 mb-3 shadow-md" style={{ border: `1px solid ${zone.color}40` }}>
                  <div className="text-center mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: `${zone.color}20`, color: zone.color }}>
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
              <div className="text-center mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/10">🎯 CENTER STAGE</span>
              </div>
              {zonesByPosition.center.map(zone => (
                <div key={zone.id} className="bg-card rounded-xl p-4 mb-3 shadow-lg" style={{ border: `2px solid ${zone.color}50` }}>
                  <div className="text-center mb-3">
                    <span className="text-sm font-bold px-5 py-1.5 rounded-full" style={{ background: `${zone.color}25`, color: zone.color }}>
                      {zone.name}
                    </span>
                    <div className="text-[10px] text-foreground/40 mt-1.5">{zone.totalSeats} seats • ₹{zone.basePrice * zone.priceMultiplier}/seat</div>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          )}
          
          {zonesByPosition.right.length > 0 && (
            <div className="flex-shrink-0">
              <div className="text-center mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/10">RIGHT WING ➡️</span>
              </div>
              {zonesByPosition.right.map(zone => (
                <div key={zone.id} className="bg-card rounded-xl p-3 mb-3 shadow-md" style={{ border: `1px solid ${zone.color}40` }}>
                  <div className="text-center mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: `${zone.color}20`, color: zone.color }}>
                      {zone.name}
                    </span>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {zonesByPosition.bottom.length > 0 && (
          <div className="mt-6">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-foreground/10 text-foreground/60">
                ⬇️ FRONT ROWS ⬇️
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {zonesByPosition.bottom.map(zone => (
                <div key={zone.id} className="bg-card rounded-xl p-4 shadow-md" style={{ border: `2px solid ${zone.color}30` }}>
                  <div className="text-center mb-3">
                    <span className="text-sm font-bold px-4 py-1.5 rounded-full" style={{ background: `${zone.color}20`, color: zone.color }}>
                      {zone.name}
                    </span>
                    <div className="text-[10px] text-foreground/40 mt-1">{zone.totalSeats} seats • ₹{zone.basePrice * zone.priceMultiplier}/seat</div>
                  </div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {screenPosition === "bottom" && (
        <div className="text-center py-5 bg-gradient-to-t from-red-500/15 to-transparent">
          <div className="inline-block px-8 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg">
            🎬 S C R E E N
          </div>
          <p className="text-[10px] text-foreground/40 mt-2">← AUDIENCE VIEW →</p>
        </div>
      )}
      
      <div className="border-t p-3 flex flex-wrap gap-3 justify-center text-[10px]" style={{ borderColor: "var(--card-border)" }}>
        {zones.map(zone => (
          <div key={zone.id} className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-sm" style={{ background: zone.color }} />
            <span className="text-foreground/70 font-medium">{zone.name}</span>
            <span className="text-foreground/40">₹{zone.basePrice * zone.priceMultiplier}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== THEATER DETAIL MODAL ====================
const TheaterDetailModal = ({ theaterId, onClose }) => {
  const [theater, setTheater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    if (theaterId) {
      loadTheaterDetails();
    }
  }, [theaterId]);
  
  const loadTheaterDetails = async () => {
    setLoading(true);
    try {
      const res = await getTheaterByIdAdmin(theaterId);
      console.log("🎭 Theater Data:", res.data);
      setTheater(res.data);
    } catch (error) {
      console.error("Error loading theater details:", error);
      toast.error("Failed to load theater details");
    } finally {
      setLoading(false);
    }
  };
  
  if (!theaterId) return null;
  
  // Collect all zones from all screens
  const getAllZones = () => {
    if (!theater?.screens) return [];
    const allZones = [];
    theater.screens.forEach(screen => {
      if (screen.zones && screen.zones.length > 0) {
        allZones.push(...screen.zones);
      }
    });
    return allZones;
  };
  
  const allZones = getAllZones();
  const totalZones = allZones.length;
  const totalSeats = allZones.reduce((sum, z) => sum + (z.totalSeats || 0), 0);
  
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="sticky top-0 p-5 border-b flex justify-between items-center z-10" style={{ background: "var(--card)", borderColor: "var(--card-border) " }}>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{theater?.name || "Theater Details"}</h2>
            <p className="text-xs text-foreground/50">{theater?.location}, {theater?.city}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-lg hover:bg-foreground/10 transition-all">
              {isExpanded ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-foreground/10 transition-all">
              <FaTimes size={16} />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin text-2xl mx-auto text-blue-500" />
            <p className="mt-2 text-foreground/50">Loading theater details...</p>
          </div>
        ) : theater ? (
          <div className={`p-6 space-y-6 ${isExpanded ? 'scale-100' : ''}`}>
            {/* Basic Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="text-xs opacity-60">Contact</div>
                <div className="font-semibold">{theater.contactNumber || "N/A"}</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="text-xs opacity-60">Pincode</div>
                <div className="font-semibold">{theater.pincode || "N/A"}</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="text-xs opacity-60">Total Screens</div>
                <div className="font-semibold">{theater.screens?.length || 0}</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="text-xs opacity-60">Total Seats</div>
                <div className="font-semibold">{theater.totalSeats || totalSeats}</div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
              <div className="text-xs opacity-60 mb-2">Amenities</div>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.filter(a => theater[a.key]).map(a => (
                  <span key={a.key} className="px-2 py-1 rounded-full text-xs flex items-center gap-1" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <a.icon className="text-[10px]" /> {a.name}
                  </span>
                ))}
                {!AMENITIES.some(a => theater[a.key]) && <span className="text-xs opacity-40">No amenities</span>}
              </div>
            </div>
            
            {/* 2D Seat Layout - All Zones Together */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <MdScreenShare className="text-purple-500 text-lg" /> 2D Seat Layout
                </h3>
                <div className="text-xs text-foreground/50">
                  {totalZones} zones • {totalSeats} total seats
                </div>
              </div>
              
              {allZones.length > 0 ? (
                <SeatLayoutPreview zones={allZones} screenPosition={theater.screenPosition || "top"} />
              ) : (
                <div className="text-center py-12 text-foreground/40 bg-foreground/5 rounded-xl">
                  <MdEventSeat className="text-5xl mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No zones configured for this theater</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-foreground/50">Theater not found</div>
        )}
      </div>
    </div>
  );
};

// Table Header Component
const TableHeader = ({ column, label, sortField, sortOrder, onSort }) => {
  const isActive = sortField === column;
  
  return (
    <th 
      onClick={() => onSort(column)}
      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-all select-none"
      style={{ color: "var(--foreground)", opacity: 0.8 }}
    >
      <div className="flex items-center gap-2">
        {label}
        <span className="inline-flex">
          {isActive ? (
            sortOrder === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />
          ) : (
            <FaSort className="opacity-40" />
          )}
        </span>
      </div>
    </th>
  );
};

// Confirm Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, icon, color, title, body, confirmLabel }) => {
  if (!isOpen) return null;
  
  const colorMap = { red: "#ef4444", green: "#22c55e", yellow: "#eab308" };
  const themeColor = colorMap[color] || colorMap.red;
  
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${themeColor}20`, border: `1px solid ${themeColor}40`, color: themeColor }}>
          {icon}
        </div>
        <h2 className="text-xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>{title}</h2>
        <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>{body}</p>
        <div className="flex gap-2.5">
          <button onClick={onConfirm} className="flex-1 rounded-xl py-2.5 text-white font-bold text-sm transition-all hover:scale-105" style={{ background: themeColor }}>{confirmLabel}</button>
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 font-bold text-sm transition-all" style={{ border: "1px solid var(--card-border)", color: "var(--foreground)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function TheatersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deletingTheater, setDeletingTheater] = useState(null);
  const [statusTheater, setStatusTheater] = useState(null);
  const [statusAction, setStatusAction] = useState("");
  const [viewingTheaterId, setViewingTheaterId] = useState(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ["allTheatersAdmin"],
    queryFn: getAllTheatersAdmin,
  });
  const theaters = data?.data || [];

  const cities = useMemo(() => ["ALL", ...new Set(theaters.map(t => t.city).filter(Boolean))].sort(), [theaters]);

  const calculateTotalSeats = useCallback((theater) => {
    if (theater.totalSeats) return theater.totalSeats;
    if (theater.screens && theater.screens.length > 0) {
      return theater.screens.reduce((sum, screen) => {
        if (screen.totalSeatsInScreen) return sum + screen.totalSeatsInScreen;
        if (screen.zones && screen.zones.length > 0) {
          return sum + screen.zones.reduce((zSum, zone) => zSum + (zone.totalSeats || 0), 0);
        }
        return sum;
      }, 0);
    }
    return 0;
  }, []);

  const filteredTheaters = useMemo(() => {
    let result = theaters.filter(t => {
      const q = searchTerm.toLowerCase();
      return (!q || [t.name, t.location, t.city, t.contactNumber].some(v => v?.toLowerCase().includes(q))) &&
        (statusFilter === "ALL" || t.status === statusFilter) &&
        (cityFilter === "ALL" || t.city === cityFilter);
    });
    
    result = [...result].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === "totalSeats") {
        aVal = calculateTotalSeats(a);
        bVal = calculateTotalSeats(b);
      }
      
      if (sortField === "screens") {
        aVal = a.screens?.length || 0;
        bVal = b.screens?.length || 0;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
    
    return result;
  }, [theaters, searchTerm, statusFilter, cityFilter, sortField, sortOrder, calculateTotalSeats]);

  const totalItems = filteredTheaters.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTheaters = filteredTheaters.slice(startIndex, startIndex + itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, cityFilter]);

  const stats = useMemo(() => ({
    total: theaters.length,
    active: theaters.filter(t => t.status === "ACTIVE").length,
    inactive: theaters.filter(t => t.status === "INACTIVE").length,
    screens: theaters.reduce((s, t) => s + (t.screens?.length || 0), 0),
    cities: new Set(theaters.map(t => t.city)).size,
  }), [theaters]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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

  const hasFilters = searchTerm || statusFilter !== "ALL" || cityFilter !== "ALL";
  const clearFilters = useCallback(() => { 
    setSearchTerm(""); 
    setStatusFilter("ALL"); 
    setCityFilter("ALL"); 
  }, []);

  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
        <div className="text-sm text-foreground/50">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} theaters
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
          >
            <FaChevronLeft className="text-xs" />
          </button>
          
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={idx} className="px-2 text-foreground/40">...</span>
            ) : (
              <button
                key={idx}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${
                  currentPage === page 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : ''
                }`}
                style={currentPage !== page ? { background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" } : {}}
              >
                {page}
              </button>
            )
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>
        
        <select
          value={itemsPerPage}
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="rounded-lg px-3 py-1.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      <div className="relative border-b shadow-lg rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <GiTheaterCurtains className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: "var(--foreground)" }}>Theater Management</h1>
                <p className="text-xs text-foreground/50">Manage and monitor all theaters</p>
              </div>
            </div>
            
            <button onClick={() => router.push("/admin/theaters/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
              <FaPlus className="text-xs" /> Add Theater
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="text-2xl font-black text-blue-500">{stats.total}</div>
          <div className="text-xs opacity-60">Total Theaters</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="text-2xl font-black text-green-500">{stats.active}</div>
          <div className="text-xs opacity-60">Active</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="text-2xl font-black text-red-500">{stats.inactive}</div>
          <div className="text-xs opacity-60">Inactive</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="text-2xl font-black text-purple-500">{stats.screens}</div>
          <div className="text-xs opacity-60">Total Screens</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="text-2xl font-black text-yellow-500">{stats.cities}</div>
          <div className="text-xs opacity-60">Cities</div>
        </div>
      </div>
      
      <div className="rounded-xl p-5 mb-6 flex flex-wrap gap-3 items-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="flex-1 min-w-[200px] relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40" />
          <input 
            type="text" 
            placeholder="Search by name, city, location..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }} 
          />
        </div>
        
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} 
          className="rounded-xl py-2 px-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} 
          className="rounded-xl py-2 px-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}>
          {cities.map(c => <option key={c} value={c}>{c === "ALL" ? "All Cities" : c}</option>)}
        </select>
        
        {hasFilters && (
          <button onClick={clearFilters} className="px-3 py-2 rounded-xl text-red-500 text-xs flex items-center gap-1 hover:bg-red-500/10 transition-all">
            <FaTimes className="text-xs" /> Clear
          </button>
        )}
      </div>
      
      <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: "var(--background)" }}>
              <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                <TableHeader column="name" label="Theater Name" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="location" label="Location" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="city" label="City" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="contactNumber" label="Contact" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="screens" label="Screens" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="totalSeats" label="Seats" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Amenities</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <FaSpinner className="animate-spin text-2xl mx-auto opacity-40" />
                  </td>
                </tr>
              ) : paginatedTheaters.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <div className="text-lg opacity-40">No theaters found</div>
                  </td>
                </tr>
              ) : (
                paginatedTheaters.map((theater) => {
                  const totalSeats = calculateTotalSeats(theater);
                  const amenitiesCount = AMENITIES.filter(a => theater[a.key]).length;
                  
                  return (
                    <tr key={theater._id} className="border-b transition-all hover:bg-white/5" style={{ borderColor: "var(--card-border)" }}>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{theater.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm opacity-70">{theater.location || "-"}</td>
                      <td className="px-4 py-3 text-sm opacity-70">{theater.city || "-"}</td>
                      <td className="px-4 py-3 text-sm opacity-70">{theater.contactNumber || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                          {theater.screens?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                          {totalSeats}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {amenitiesCount > 0 ? (
                            <>
                              {AMENITIES.filter(a => theater[a.key]).slice(0, 2).map(a => (
                                <span key={a.key} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{a.name}</span>
                              ))}
                              {amenitiesCount > 2 && <span className="text-xs opacity-40">+{amenitiesCount - 2}</span>}
                            </>
                          ) : <span className="text-xs opacity-40">None</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${theater.status === "ACTIVE" ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-400"}`}>
                          {theater.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setViewingTheaterId(theater._id)} 
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-all" 
                            title="View Details & Layout"
                          >
                            <FaEye className="text-blue-500 text-sm" />
                          </button>
                          <button 
                            onClick={() => router.push(`/admin/theaters/edit/${theater._id}`)} 
                            className="p-1.5 rounded-lg hover:bg-yellow-500/10 transition-all" 
                            title="Edit"
                          >
                            <FaEdit className="text-yellow-500 text-sm" />
                          </button>
                          <button 
                            onClick={() => { setStatusTheater(theater); setStatusAction(theater.status === "ACTIVE" ? "deactivate" : "activate"); }} 
                            className="p-1.5 rounded-lg hover:bg-green-500/10 transition-all" 
                            title={theater.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          >
                            {theater.status === "ACTIVE" ? <FaTimesCircle className="text-red-500 text-sm" /> : <FaCheckCircle className="text-green-500 text-sm" />}
                          </button>
                          <button 
                            onClick={() => setDeletingTheater(theater)} 
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all" 
                            title="Delete"
                          >
                            <FaTrash className="text-red-500 text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {totalItems > 0 && <PaginationControls />}
      </div>
      
      <ConfirmModal 
        isOpen={!!deletingTheater} 
        onClose={() => setDeletingTheater(null)} 
        onConfirm={() => deletingTheater && deleteMutation.mutate(deletingTheater._id)} 
        icon={<FaTrash className="text-red-500 text-xl" />} 
        color="red" 
        title="Delete Theater" 
        body={<>Delete <strong>{deletingTheater?.name}</strong>? This action cannot be undone.</>} 
        confirmLabel="Delete" 
      />
      
      <ConfirmModal 
        isOpen={!!statusTheater} 
        onClose={() => { setStatusTheater(null); setStatusAction(""); }} 
        onConfirm={() => statusTheater && statusMutation.mutate({ id: statusTheater._id, data: { status: statusAction === "activate" ? "ACTIVE" : "INACTIVE" } })} 
        icon={statusAction === "activate" ? <FaCheckCircle className="text-green-500 text-xl" /> : <FaTimesCircle className="text-yellow-500 text-xl" />} 
        color={statusAction === "activate" ? "green" : "yellow"} 
        title={statusAction === "activate" ? "Activate Theater" : "Deactivate Theater"} 
        body={<>Are you sure you want to {statusAction} <strong>{statusTheater?.name}</strong>?</>} 
        confirmLabel={statusAction === "activate" ? "Activate" : "Deactivate"} 
      />
      
      <TheaterDetailModal 
        theaterId={viewingTheaterId} 
        onClose={() => setViewingTheaterId(null)} 
      />
    </div>
  );
}