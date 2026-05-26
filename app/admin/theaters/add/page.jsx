"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from 'react-hot-toast';
import {
  FaPlus, FaTrash, FaBuilding, FaMapMarkerAlt, FaPhone, FaCity, FaFlag,
  FaCouch, FaWifi, FaParking, FaCoffee, FaAccessibleIcon, FaArrowLeft,
  FaCheckCircle, FaUserTie, FaChevronDown, FaEye, FaEdit, FaSave, FaTimes
} from 'react-icons/fa';
import { MdScreenShare, MdTheaters, MdScreenRotation } from 'react-icons/md';
import { createTheater, getAllUsers } from "@/app/services/adminCommunication";

const AMENITIES = [
  { icon: FaCouch, name: "Recliner Seats", key: "hasRecliner", desc: "Premium recliner chairs" },
  { icon: FaWifi, name: "Free WiFi", key: "hasWifi", desc: "High-speed internet" },
  { icon: FaParking, name: "Parking", key: "hasParking", desc: "Covered car parking" },
  { icon: FaCoffee, name: "Food & Café", key: "hasCafe", desc: "In-house café & snacks" },
  { icon: FaAccessibleIcon, name: "Accessibility", key: "hasWheelchair", desc: "Wheelchair friendly" },
];

const SEAT_TYPES = {
  NORMAL: { label: "Standard", color: "#3b82f6", multiplier: 1 },
  EXECUTIVE: { label: "Executive", color: "#10b981", multiplier: 1.5 },
  PREMIUM: { label: "Premium", color: "#8b5cf6", multiplier: 2 },
  VIP: { label: "VIP", color: "#f59e0b", multiplier: 3 },
  COUPLE: { label: "Couple", color: "#ec4899", multiplier: 2.5 },
};

const STEPS = [
  { id: 1, label: "Theater Info", icon: FaBuilding },
  { id: 2, label: "Layout Design", icon: MdScreenShare },
  { id: 3, label: "Review", icon: FaCheckCircle },
];

const POSITIONS = [
  { value: "center", label: "Center Stage", icon: "🎯" },
  { value: "left", label: "Left Wing", icon: "⬅️" },
  { value: "right", label: "Right Wing", icon: "➡️" },
  { value: "top", label: "Balcony", icon: "⬆️" },
  { value: "bottom", label: "Front Row", icon: "⬇️" },
];

// Generate unique ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create a new row with seats
const createRow = (zoneId, rowNumber, rowLetter, seatCount = 10) => {
  const seats = [];
  for (let i = 1; i <= seatCount; i++) {
    seats.push({
      seatId: `${zoneId}_row_${rowNumber}_seat_${i}`,
      seatNumber: `${rowLetter}${i}`,
      seatLabel: `${rowLetter}${i}`,
      rowNumber: rowNumber,
      columnNumber: i,
      rowName: rowLetter,
      isAvailable: true,
      isBooked: false,
    });
  }
  return {
    rowId: `${zoneId}_row_${rowNumber}`,
    rowName: rowLetter,
    rowNumber: rowNumber,
    seatCount: seatCount,
    seats: seats,
  };
};

// Create new zone
const createNewZone = (zoneNumber) => {
  const zoneId = generateId();
  const rows = [];
  const rowLetters = ['A', 'B', 'C', 'D', 'E'];
  
  for (let i = 0; i < 5; i++) {
    rows.push(createRow(zoneId, i + 1, rowLetters[i], 10));
  }
  
  return {
    id: zoneId,
    zoneNumber: zoneNumber,
    name: `Zone ${zoneNumber}`,
    position: "center",
    positionLabel: "Center Stage",
    seatType: "NORMAL",
    color: "#3b82f6",
    icon: "■",
    basePrice: 150,
    priceMultiplier: 1,
    finalPrice: 150,
    rows: rows,
    totalRows: rows.length,
    totalSeats: rows.reduce((sum, row) => sum + row.seatCount, 0),
  };
};

// Row Editor Component
const RowEditor = ({ zoneId, row, rowIndex, onUpdate, onDelete, zoneColor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [seatCount, setSeatCount] = useState(row.seatCount);

  const handleSeatCountChange = () => {
    if (seatCount < 1) return;
    const newSeats = [];
    for (let i = 1; i <= seatCount; i++) {
      newSeats.push({
        seatId: `${zoneId}_row_${row.rowNumber}_seat_${i}`,
        seatNumber: `${row.rowName}${i}`,
        seatLabel: `${row.rowName}${i}`,
        rowNumber: row.rowNumber,
        columnNumber: i,
        rowName: row.rowName,
        isAvailable: true,
        isBooked: false,
      });
    }
    onUpdate(rowIndex, { ...row, seatCount: seatCount, seats: newSeats });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg group hover:bg-background transition-colors">
      <div className="w-8 text-sm font-bold text-foreground/60">{row.rowName}</div>
      
      <div className="flex-1 flex flex-wrap gap-1">
        {row.seats.slice(0, 12).map((seat) => (
          <div
            key={seat.seatId}
            className="relative group/seat"
          >
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-[8px] sm:text-[9px] font-mono font-bold transition-all cursor-pointer hover:scale-110"
              style={{ background: `${zoneColor}20`, color: zoneColor, border: `1px solid ${zoneColor}50` }}
              title={seat.seatLabel}
            >
              {seat.seatLabel}
            </div>
          </div>
        ))}
        {row.seatCount > 12 && (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-[8px] text-foreground/40 bg-foreground/5">
            +{row.seatCount - 12}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded hover:bg-blue-500/10 text-blue-500"
              title="Edit seat count"
            >
              <FaEdit size={10} />
            </button>
            <button
              onClick={() => onDelete(rowIndex)}
              className="p-1.5 rounded hover:bg-red-500/10 text-red-500"
              title="Delete row"
            >
              <FaTrash size={10} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1 bg-background border rounded-lg p-1" style={{ borderColor: "var(--card-border)" }}>
            <input
              type="number"
              value={seatCount}
              onChange={(e) => setSeatCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 px-1 py-1 text-center text-xs bg-background border rounded focus:outline-none focus:border-blue-500"
              style={{ borderColor: "var(--card-border)" }}
              autoFocus
            />
            <button onClick={handleSeatCountChange} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
              <FaSave size={10} />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
              <FaTimes size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Zone Designer Component
const ZoneDesigner = ({ zone, zoneIndex, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [zoneName, setZoneName] = useState(zone.name);

  const addRow = () => {
    const newRowNumber = zone.rows.length + 1;
    const newRowLetter = String.fromCharCode(64 + newRowNumber);
    const newRow = createRow(zone.id, newRowNumber, newRowLetter, 10);
    const newRows = [...zone.rows, newRow];
    onUpdate(zoneIndex, {
      ...zone,
      rows: newRows,
      totalRows: newRows.length,
      totalSeats: newRows.reduce((sum, row) => sum + row.seatCount, 0),
    });
  };

  const updateRow = (rowIndex, updatedRow) => {
    const newRows = [...zone.rows];
    newRows[rowIndex] = updatedRow;
    const newTotalSeats = newRows.reduce((sum, row) => sum + row.seatCount, 0);
    onUpdate(zoneIndex, {
      ...zone,
      rows: newRows,
      totalSeats: newTotalSeats,
    });
  };

  const deleteRow = (rowIndex) => {
    if (zone.rows.length === 1) {
      toast.error("At least one row required per zone!");
      return;
    }
    const newRows = zone.rows.filter((_, i) => i !== rowIndex);
    onUpdate(zoneIndex, {
      ...zone,
      rows: newRows,
      totalRows: newRows.length,
      totalSeats: newRows.reduce((sum, row) => sum + row.seatCount, 0),
    });
  };

  const handleNameSave = () => {
    onUpdate(zoneIndex, { ...zone, name: zoneName });
    setIsEditingName(false);
  };

  const currentPrice = zone.basePrice * zone.priceMultiplier;

  return (
    <div className="border rounded-xl overflow-hidden bg-card" style={{ borderColor: "var(--card-border)" }}>
      {/* Zone Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-foreground/5 transition-colors flex-wrap gap-2"
        style={{ background: `${zone.color}10`, borderBottom: isExpanded ? `1px solid ${zone.color}30` : 'none' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${zone.color}30`, color: zone.color }}>
            {zone.icon}
          </div>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="px-2 py-1 text-sm font-bold bg-background border rounded"
                  style={{ borderColor: "var(--card-border)" }}
                  autoFocus
                />
                <button onClick={handleNameSave} className="p-1 text-green-500"><FaSave size={12} /></button>
                <button onClick={() => { setZoneName(zone.name); setIsEditingName(false); }} className="p-1 text-red-500"><FaTimes size={12} /></button>
              </div>
            ) : (
              <>
                <div className="font-bold text-foreground">{zone.name}</div>
                <button onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }} className="text-foreground/30 hover:text-blue-500">
                  <FaEdit size={10} />
                </button>
              </>
            )}
          </div>
          <div className="text-xs text-foreground/50">
            {zone.totalRows} rows • {zone.totalSeats} seats • ₹{currentPrice}/seat
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={zone.position}
            onChange={(e) => {
              const pos = POSITIONS.find(p => p.value === e.target.value);
              onUpdate(zoneIndex, { ...zone, position: e.target.value, positionLabel: pos?.label });
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-xs px-2 py-1 rounded-lg bg-background border"
            style={{ borderColor: "var(--card-border)" }}
          >
            {POSITIONS.map(pos => (
              <option key={pos.value} value={pos.value}>{pos.icon} {pos.label}</option>
            ))}
          </select>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(zoneIndex); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
          >
            <FaTrash size={12} />
          </button>
          <div className={`w-5 h-5 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <FaChevronDown size={10} />
          </div>
        </div>
      </div>
      
      {/* Zone Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Zone Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Seat Type</label>
              <select
                value={zone.seatType}
                onChange={(e) => {
                  const type = e.target.value;
                  const config = SEAT_TYPES[type];
                  onUpdate(zoneIndex, { ...zone, seatType: type, color: config.color, priceMultiplier: config.multiplier, finalPrice: zone.basePrice * config.multiplier });
                }}
                className="w-full px-2 py-1.5 text-xs bg-background border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              >
                {Object.entries(SEAT_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Base Price (₹)</label>
              <input
                type="number"
                value={zone.basePrice}
                onChange={(e) => onUpdate(zoneIndex, { ...zone, basePrice: parseInt(e.target.value) || 0, finalPrice: (parseInt(e.target.value) || 0) * zone.priceMultiplier })}
                className="w-full px-2 py-1.5 text-xs bg-background border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Final Price</label>
              <div className="w-full px-2 py-1.5 text-xs font-bold rounded-lg" style={{ background: `${zone.color}20`, color: zone.color }}>
                ₹{zone.basePrice * zone.priceMultiplier}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Zone Color</label>
              <input
                type="color"
                value={zone.color}
                onChange={(e) => onUpdate(zoneIndex, { ...zone, color: e.target.value })}
                className="w-full h-8 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          
          {/* Rows Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-foreground/50 uppercase">Rows Configuration</div>
              <button onClick={addRow} className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 flex items-center gap-1">
                <FaPlus size={10} /> Add Row
              </button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {zone.rows.map((row, rowIdx) => (
                <RowEditor
                  key={row.rowId}
                  zoneId={zone.id}
                  row={row}
                  rowIndex={rowIdx}
                  onUpdate={updateRow}
                  onDelete={deleteRow}
                  zoneColor={zone.color}
                />
              ))}
            </div>
          </div>
          
          {/* Summary */}
          <div className="text-center text-[10px] text-foreground/40 pt-2 border-t" style={{ borderColor: "var(--card-border)" }}>
            Total: {zone.totalRows} rows • {zone.totalSeats} seats • ₹{zone.totalSeats * (zone.basePrice * zone.priceMultiplier)} total revenue potential
          </div>
        </div>
      )}
    </div>
  );
};

// Live Seat Preview Component
const LiveSeatPreview = ({ zones, screenPosition }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  
  const renderZoneSeats = (zone) => {
    if (!zone.rows || zone.rows.length === 0) {
      return <div className="text-center text-xs opacity-40 py-2">No seats configured</div>;
    }
    
    return zone.rows.map((row) => (
      <div key={row.rowId} className="flex items-center gap-1 mb-1">
        <div className="w-6 text-[9px] text-foreground/40 font-bold">{row.rowName}</div>
        <div className="flex flex-wrap gap-0.5">
          {row.seats && row.seats.map((seat) => (
            <div
              key={seat.seatId}
              className="relative group"
              onMouseEnter={() => setHoveredSeat(seat.seatId)}
              onMouseLeave={() => setHoveredSeat(null)}
            >
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm flex items-center justify-center text-[7px] sm:text-[8px] font-mono font-bold transition-all cursor-pointer hover:scale-110"
                style={{ background: `${zone.color}25`, color: zone.color, border: `1px solid ${zone.color}50` }}
              >
                {seat.seatLabel}
              </div>
              {hoveredSeat === seat.seatId && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 shadow-lg">
                  ₹{zone.basePrice * zone.priceMultiplier}
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
  
  const hasAnyZones = zones.length > 0;
  
  if (!hasAnyZones) {
    return (
      <div className="bg-card border rounded-2xl p-8 text-center" style={{ borderColor: "var(--card-border)" }}>
        <p className="text-foreground/40">No zones configured. Click "Add Zone" to create seating areas.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-card border rounded-2xl overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
      {screenPosition === "top" && (
        <div className="text-center py-3 bg-gradient-to-b from-red-500/10 to-transparent">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg">
            🎬 SCREEN
          </div>
        </div>
      )}
      
      <div className="p-3">
        {/* Top Zones */}
        {zonesByPosition.top.length > 0 && (
          <div className="mb-4">
            <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">⬆️ BALCONY</div>
            <div className="flex flex-wrap justify-center gap-4">
              {zonesByPosition.top.map(zone => (
                <div key={zone.id} className="bg-background/50 rounded-lg p-2">
                  <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Left + Center + Right */}
        <div className="flex flex-wrap justify-center gap-4">
          {zonesByPosition.left.length > 0 && (
            <div className="flex-shrink-0">
              <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">⬅️ LEFT</div>
              {zonesByPosition.left.map(zone => (
                <div key={zone.id} className="bg-background/50 rounded-lg p-2 mb-2">
                  <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex-shrink-0">
            <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">🎯 CENTER</div>
            {zonesByPosition.center.map(zone => (
              <div key={zone.id} className="bg-background/50 rounded-lg p-2 mb-2">
                <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
                {renderZoneSeats(zone)}
              </div>
            ))}
          </div>
          
          {zonesByPosition.right.length > 0 && (
            <div className="flex-shrink-0">
              <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">RIGHT ➡️</div>
              {zonesByPosition.right.map(zone => (
                <div key={zone.id} className="bg-background/50 rounded-lg p-2 mb-2">
                  <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Bottom Zones */}
        {zonesByPosition.bottom.length > 0 && (
          <div className="mt-4">
            <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">⬇️ FRONT ROWS</div>
            <div className="flex flex-wrap justify-center gap-4">
              {zonesByPosition.bottom.map(zone => (
                <div key={zone.id} className="bg-background/50 rounded-lg p-2">
                  <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
                  {renderZoneSeats(zone)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {screenPosition === "bottom" && (
        <div className="text-center py-3 bg-gradient-to-t from-red-500/10 to-transparent">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg">
            🎬 SCREEN
          </div>
        </div>
      )}
    </div>
  );
};

// Step Indicator
const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-6 overflow-x-auto pb-2">
    {STEPS.map((s, i) => {
      const done = current > s.id;
      const active = current === s.id;
      return (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${done ? 'bg-green-500 border-2 border-green-500 shadow-lg shadow-green-500/30' : active ? 'bg-blue-500 border-2 border-blue-500 shadow-lg shadow-blue-500/30' : 'bg-background border-2'}`}
              style={!(done || active) ? { borderColor: "var(--card-border)" } : {}}>
              {done ? <FaCheckCircle className="text-xs sm:text-base text-white" /> : <s.icon className="text-xs sm:text-base" style={{ color: active ? "white" : "var(--foreground)", opacity: active ? 1 : 0.25 }} />}
            </div>
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--foreground)", opacity: active || done ? 1 : 0.3 }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-8 sm:w-16 mb-4 transition-all duration-500 ${current > s.id ? 'bg-gradient-to-r from-green-500 to-blue-500' : ''}`}
              style={!(current > s.id) ? { background: "var(--card-border)" } : {}} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// Main Component
export default function AddTheaterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [screenPosition, setScreenPosition] = useState("top");
  const [basicInfo, setBasicInfo] = useState({
    ownerId: "", 
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
  
  const [screens, setScreens] = useState([
    {
      screenNumber: 1,
      name: "Main Screen",
      position: "center",
      positionLabel: "Center Stage",
      zones: [createNewZone(1), createNewZone(2)],
      status: "ACTIVE"
    }
  ]);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "THEATER_OWNER"],
    queryFn: () => getAllUsers({ role: "THEATER_OWNER" }),
  });
  const owners = usersData?.data || [];

  // Get all zones from all screens
  const getAllZones = () => {
    return screens.flatMap(screen => screen.zones);
  };

  const addScreen = () => {
    const newScreenNumber = screens.length + 1;
    setScreens([...screens, {
      screenNumber: newScreenNumber,
      name: `Screen ${newScreenNumber}`,
      position: "center",
      positionLabel: "Center Stage",
      zones: [createNewZone(1)],
      status: "ACTIVE"
    }]);
    toast.success(`Screen ${newScreenNumber} added!`);
  };

  const removeScreen = (screenIndex) => {
    if (screens.length === 1) {
      toast.error("At least one screen is required!");
      return;
    }
    setScreens(screens.filter((_, i) => i !== screenIndex));
    toast.success("Screen removed");
  };

  const addZoneToScreen = (screenIndex) => {
    const screen = screens[screenIndex];
    const newZoneNumber = screen.zones.length + 1;
    const newZones = [...screen.zones, createNewZone(newZoneNumber)];
    const updatedScreens = [...screens];
    updatedScreens[screenIndex].zones = newZones;
    setScreens(updatedScreens);
    toast.success(`Zone ${newZoneNumber} added to ${screen.name}!`);
  };

  const updateZoneInScreen = (screenIndex, zoneIndex, updatedZone) => {
    const updatedScreens = [...screens];
    updatedScreens[screenIndex].zones[zoneIndex] = updatedZone;
    setScreens(updatedScreens);
  };

  const deleteZoneFromScreen = (screenIndex, zoneIndex) => {
    const screen = screens[screenIndex];
    if (screen.zones.length === 1) {
      toast.error("At least one zone required per screen!");
      return;
    }
    const updatedScreens = [...screens];
    updatedScreens[screenIndex].zones = screen.zones.filter((_, i) => i !== zoneIndex);
    setScreens(updatedScreens);
    toast.success("Zone removed");
  };

  const updateScreen = (screenIndex, updatedScreen) => {
    const updatedScreens = [...screens];
    updatedScreens[screenIndex] = { ...updatedScreens[screenIndex], ...updatedScreen };
    setScreens(updatedScreens);
  };

  // Handle basic info change
  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "pincode") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 6) {
        setBasicInfo(prev => ({ ...prev, [name]: onlyNums }));
      }
      return;
    }
    
    if (name === "contactNumber") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 10) {
        setBasicInfo(prev => ({ ...prev, [name]: onlyNums }));
      }
      return;
    }
    
    setBasicInfo(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  // Prepare payload for API - Convert to backend expected format
  const preparePayload = () => {
    const allZones = getAllZones();
    const totalSeats = allZones.reduce((sum, zone) => sum + zone.totalSeats, 0);
    const totalZones = allZones.length;
    
    // Convert zones to screens format for backend
    const formattedScreens = screens.map((screen, idx) => ({
      screenNumber: screen.screenNumber,
      name: screen.name,
      position: screen.position,
      positionLabel: screen.positionLabel,
      totalRows: screen.zones.reduce((sum, z) => sum + z.totalRows, 0),
      totalColumns: Math.max(...screen.zones.flatMap(z => z.rows.map(r => r.seatCount)), 0),
      totalZones: screen.zones.length,
      totalSeatsInScreen: screen.zones.reduce((sum, z) => sum + z.totalSeats, 0),
      zones: screen.zones.map(zone => ({
        id: zone.id,
        zoneNumber: zone.zoneNumber,
        name: zone.name,
        position: zone.position,
        positionLabel: zone.positionLabel,
        seatType: zone.seatType,
        color: zone.color,
        icon: zone.icon,
        basePrice: zone.basePrice,
        priceMultiplier: zone.priceMultiplier,
        finalPrice: zone.finalPrice,
        totalRows: zone.totalRows,
        totalSeats: zone.totalSeats,
        rows: zone.rows.map(row => ({
          rowId: row.rowId,
          rowName: row.rowName,
          rowNumber: row.rowNumber,
          seatCount: row.seatCount,
          seats: row.seats.map(seat => ({
            seatId: seat.seatId,
            seatNumber: seat.seatNumber,
            seatLabel: seat.seatLabel,
            rowNumber: seat.rowNumber,
            columnNumber: seat.columnNumber,
            rowName: seat.rowName,
            isAvailable: seat.isAvailable,
            isBooked: seat.isBooked,
          })),
        })),
      })),
      seatRows: [], // Legacy support
      status: screen.status
    }));
    
    const payload = {
      ownerId: basicInfo.ownerId,
      name: basicInfo.name,
      location: basicInfo.location,
      city: basicInfo.city,
      state: basicInfo.state,
      pincode: basicInfo.pincode,
      contactNumber: basicInfo.contactNumber,
      hasRecliner: basicInfo.hasRecliner,
      hasWifi: basicInfo.hasWifi,
      hasParking: basicInfo.hasParking,
      hasCafe: basicInfo.hasCafe,
      hasWheelchair: basicInfo.hasWheelchair,
      screens: formattedScreens,
      totalScreens: screens.length,
      totalZones: totalZones,
      totalSeats: totalSeats,
      screenPosition: screenPosition,
      images: []
    };
    
    return payload;
  };

  const mutation = useMutation({
    mutationFn: createTheater,
    onSuccess: () => {
      toast.success("Theater created successfully! 🎉");
      queryClient.invalidateQueries(["allTheatersAdmin"]);
      setTimeout(() => router.push("/admin/theaters"), 2000);
    },
    onError: (err) => {
      console.error("Create theater error:", err);
      toast.error(err.response?.data?.message || "Failed to create theater");
    },
  });

  const validateStep1 = () => {
    if (!basicInfo.ownerId) { toast.error("Select a theater owner"); return false; }
    if (!basicInfo.name.trim()) { toast.error("Theater name is required"); return false; }
    if (!basicInfo.location.trim()) { toast.error("Location is required"); return false; }
    if (!basicInfo.city.trim()) { toast.error("City is required"); return false; }
    if (!basicInfo.state.trim()) { toast.error("State is required"); return false; }
    if (!basicInfo.contactNumber.trim()) { toast.error("Contact number is required"); return false; }
    if (basicInfo.contactNumber.length !== 10) { toast.error("Contact number must be exactly 10 digits"); return false; }
    if (basicInfo.pincode && basicInfo.pincode.length !== 6) { toast.error("Pincode must be exactly 6 digits"); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!validateStep1()) { setStep(1); return; }
    const payload = preparePayload();
    console.log("📦 Final Payload:", JSON.stringify(payload, null, 2));
    mutation.mutate(payload);
  };

  const BASIC_FIELDS = [
    { name: "name", label: "Theater Name", placeholder: "e.g., PVR Cinemas", icon: FaBuilding, type: "text", required: true },
    { name: "location", label: "Location / Area", placeholder: "e.g., Juhu", icon: FaMapMarkerAlt, type: "text", required: true },
    { name: "city", label: "City", placeholder: "e.g., Mumbai", icon: FaCity, type: "text", required: true },
    { name: "state", label: "State", placeholder: "e.g., Maharashtra", icon: FaFlag, type: "text", required: true },
    { name: "pincode", label: "Pincode", placeholder: "400049", icon: null, type: "text", required: false, maxLength: 6 },
    { name: "contactNumber", label: "Contact Number", placeholder: "9876543210", icon: FaPhone, type: "tel", required: true, maxLength: 10 },
  ];

  const totalSeats = getAllZones().reduce((sum, zone) => sum + zone.totalSeats, 0);
  const totalZones = getAllZones().length;

  // Screen Card Component
  const ScreenCard = ({ screen, screenIndex, onUpdate, onRemove, onAddZone, onUpdateZone, onDeleteZone }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const totalSeatsInScreen = screen.zones.reduce((sum, z) => sum + z.totalSeats, 0);
    
    return (
      <div className="border rounded-xl overflow-hidden bg-card" style={{ borderColor: "var(--card-border)" }}>
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-foreground/5 transition-colors"
          style={{ background: "rgba(59,130,246,0.05)", borderBottom: isExpanded ? "1px solid var(--card-border)" : "none" }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
              <MdScreenShare className="text-purple-500" />
            </div>
            <div>
              <div className="font-bold text-foreground">{screen.name}</div>
              <div className="text-xs text-foreground/50">{screen.zones.length} zones • {totalSeatsInScreen} seats</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onRemove(screenIndex); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500">
              <FaTrash size={12} />
            </button>
            <div className={`w-5 h-5 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <FaChevronDown size={10} />
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Screen Name</label>
                <input
                  type="text"
                  value={screen.name}
                  onChange={(e) => onUpdate(screenIndex, { name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
                  style={{ borderColor: "var(--card-border)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Position</label>
                <select
                  value={screen.position}
                  onChange={(e) => {
                    const pos = POSITIONS.find(p => p.value === e.target.value);
                    onUpdate(screenIndex, { position: e.target.value, positionLabel: pos?.label });
                  }}
                  className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  {POSITIONS.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.icon} {pos.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-foreground/50 uppercase">Zones</div>
                <button onClick={() => onAddZone(screenIndex)} className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 flex items-center gap-1">
                  <FaPlus size={10} /> Add Zone
                </button>
              </div>
              <div className="space-y-3">
                {screen.zones.map((zone, zoneIdx) => (
                  <ZoneDesigner
                    key={zone.id}
                    zone={zone}
                    zoneIndex={zoneIdx}
                    onUpdate={(idx, updated) => onUpdateZone(screenIndex, idx, updated)}
                    onDelete={(idx) => onDeleteZone(screenIndex, idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="border-b sticky top-0 z-20 bg-background/95 backdrop-blur-sm" style={{ borderColor: "var(--card-border)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()} className="p-1.5 sm:p-2 rounded-lg hover:bg-foreground/10">
                <FaArrowLeft size={14} />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                <MdTheaters className="text-white text-base sm:text-xl" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black text-foreground">Add Theater</h1>
                <p className="text-[10px] sm:text-xs text-foreground/40">Step {step} of 3</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-foreground">{totalZones} Zones</div>
              <div className="text-[10px] text-foreground/40">{totalSeats} Seats</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <StepIndicator current={step} />

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-card border rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ borderColor: "var(--card-border)" }}>
            <h2 className="text-lg sm:text-xl font-bold mb-4">Theater Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold mb-2 block">Theater Owner <span className="text-red-500">*</span></label>
                <select 
                  name="ownerId"
                  value={basicInfo.ownerId} 
                  onChange={handleBasicChange}
                  className="w-full px-4 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <option value="">— Select Theater Owner —</option>
                  {isLoadingUsers ? 
                    <option disabled>Loading owners...</option> : 
                    owners.map(o => <option key={o._id} value={o._id}>{o.name} ({o.email})</option>)
                  }
                </select>
              </div>
              
              {BASIC_FIELDS.map(f => (
                <div key={f.name}>
                  <label className="text-sm font-semibold mb-2 block">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    {f.icon && <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm" />}
                    <input 
                      type={f.type}
                      name={f.name}
                      value={basicInfo[f.name]}
                      onChange={handleBasicChange}
                      placeholder={f.placeholder}
                      maxLength={f.maxLength}
                      className={`w-full ${f.icon ? 'pl-10' : 'px-4'} py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      style={{ borderColor: "var(--card-border)" }}
                    />
                  </div>
                  {f.name === "contactNumber" && (
                    <p className="text-[10px] text-foreground/40 mt-1">{basicInfo.contactNumber.length}/10 digits</p>
                  )}
                  {f.name === "pincode" && (
                    <p className="text-[10px] text-foreground/40 mt-1">{basicInfo.pincode.length}/6 digits</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <label className="text-sm font-semibold mb-3 block">Amenities & Facilities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {AMENITIES.map(a => (
                  <label key={a.key} className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all hover:bg-foreground/5" style={{ borderColor: "var(--card-border)" }}>
                    <input 
                      type="checkbox" 
                      name={a.key}
                      checked={basicInfo[a.key]} 
                      onChange={handleBasicChange}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <a.icon className="text-sm text-foreground/60" />
                    <span className="text-sm">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button onClick={() => { if (validateStep1()) setStep(2); }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                Next: Design Layout →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Layout Design */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FaEye className="text-blue-500 text-sm" />
                  <h2 className="font-bold text-sm sm:text-base">Live Preview</h2>
                </div>
                <button onClick={() => setScreenPosition(screenPosition === "top" ? "bottom" : "top")} className="text-xs px-2 py-1 rounded-lg bg-foreground/10 flex items-center gap-1">
                  <MdScreenRotation size={12} /> Screen {screenPosition === "top" ? "Top" : "Bottom"}
                </button>
              </div>
              <LiveSeatPreview zones={getAllZones()} screenPosition={screenPosition} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-sm sm:text-base">Screens & Zones</h2>
                  <p className="text-[10px] text-foreground/40">Each screen can have multiple zones with independent seating</p>
                </div>
                <button onClick={addScreen} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center gap-1">
                  <FaPlus size={10} /> Add Screen
                </button>
              </div>
              
              <div className="space-y-3">
                {screens.map((screen, idx) => (
                  <ScreenCard
                    key={idx}
                    screen={screen}
                    screenIndex={idx}
                    onUpdate={updateScreen}
                    onRemove={removeScreen}
                    onAddZone={addZoneToScreen}
                    onUpdateZone={updateZoneInScreen}
                    onDeleteZone={deleteZoneFromScreen}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-between gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border-2 font-bold text-sm" style={{ borderColor: "var(--card-border)" }}>
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold text-sm">
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-card border rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ borderColor: "var(--card-border)" }}>
            <h2 className="text-lg sm:text-xl font-bold mb-4">Review & Submit</h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-foreground/5 rounded-lg">
                <h3 className="font-bold text-sm mb-2">Theater Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-foreground/50">Name:</span> {basicInfo.name || "-"}</div>
                  <div><span className="text-foreground/50">Location:</span> {basicInfo.location || "-"}</div>
                  <div><span className="text-foreground/50">City:</span> {basicInfo.city || "-"}</div>
                  <div><span className="text-foreground/50">Contact:</span> {basicInfo.contactNumber || "-"}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-sm mb-2">Layout Summary</h3>
                <div className="space-y-2">
                  {screens.map((screen, idx) => (
                    <div key={idx} className="p-2 border rounded-lg" style={{ borderColor: "var(--card-border)" }}>
                      <div className="font-bold text-sm">{screen.name}</div>
                      <div className="text-[10px] text-foreground/50 mb-1">{screen.zones.length} zones</div>
                      {screen.zones.map(zone => (
                        <div key={zone.id} className="flex justify-between items-center text-xs py-0.5">
                          <span>{zone.name} ({zone.positionLabel})</span>
                          <span>{zone.totalSeats} seats • ₹{zone.basePrice * zone.priceMultiplier}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-sm mb-2">Final Preview</h3>
                <LiveSeatPreview zones={getAllZones()} screenPosition={screenPosition} />
              </div>
            </div>
            
            <div className="flex justify-between gap-3 mt-6 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border-2 font-bold text-sm" style={{ borderColor: "var(--card-border)" }}>
                ← Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={mutation.isPending}
                className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold text-sm flex items-center gap-2"
              >
                {mutation.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
                ) : (
                  <><FaCheckCircle size={12} /> Create Theater</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}