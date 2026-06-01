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
  FaChevronDown, FaChevronUp, FaPlus, FaTrash, FaCopy,
  FaExclamationTriangle, FaCalculator, FaMagic
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare, MdLocationOn, MdEventSeat } from 'react-icons/md';
import { GiFilmProjector, GiTheaterCurtains } from 'react-icons/gi';

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

// Helper functions
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const calculateEndTime = (startTime, durationMinutes) => {
  if (!startTime || !durationMinutes) return '';
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(endMinutes);
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  if (endMinutes <= startMinutes) return null;
  return endMinutes - startMinutes;
};

const doTimesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// ==================== SEAT LAYOUT PREVIEW COMPONENT ====================
const SeatLayoutPreview = ({ zones, screenPosition }) => {
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
            <div key={seat.seatId || seatIdx} className="relative group">
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

// ==================== CINEMA SEAT FLOOR ====================
const CinemaSeatFloor = ({ levelKey, zones, seats, rows, cols, aisleCols = [], aisleRows = [], selected, onToggle }) => {
  const getRowLabel = (r) => String.fromCharCode(65 + r);
  const getZone = (id) => zones.find((z) => z.id === id);

  const buildRowSegments = (r) => {
    const segs = [];
    let c = 0;
    while (c < cols) {
      const k = `${r}-${c}`;
      const sd = seats[k];
      const zone = sd?.zone ? getZone(sd.zone) : null;
      if (zone?.noSeat) {
        let span = 1;
        while (c + span < cols && seats[`${r}-${c + span}`]?.zone === zone.id) span++;
        segs.push({ type: 'noSeatBlock', zone, startC: c, colSpan: span });
        c += span;
      } else {
        segs.push({ type: 'seat', c });
        c++;
      }
    }
    return segs;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', minWidth: 'max-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 22, flexShrink: 0 }} />
          {Array.from({ length: cols }, (_, c) => (
            <span key={c} style={{ display: 'contents' }}>
              {aisleCols.find((a) => a.idx === c - 1) && <div style={{ width: 14, flexShrink: 0 }} />}
              <div style={{ width: 22, textAlign: 'center', fontSize: 9, color: '#6b7280', fontWeight: 600, flexShrink: 0 }}>{c + 1}</div>
            </span>
          ))}
        </div>
        {Array.from({ length: rows }, (_, r) => {
          const hasRowAisle = aisleRows.find((a) => a.idx === r - 1);
          const segs = buildRowSegments(r);
          return (
            <span key={r} style={{ display: 'contents' }}>
              {hasRowAisle && <div style={{ height: 12, flexShrink: 0, alignSelf: 'stretch' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 22, textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af', flexShrink: 0 }}>{getRowLabel(r)}</div>
                {segs.map((seg, si) => {
                  if (seg.type === 'noSeatBlock') {
                    const colAisle = aisleCols.find((a) => a.idx === seg.startC - 1);
                    const blockWidth = seg.colSpan * 22 + (seg.colSpan - 1) * 4;
                    return (
                      <span key={si} style={{ display: 'contents' }}>
                        {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                        <div style={{ width: blockWidth, height: 22, flexShrink: 0, borderRadius: 5, background: seg.zone.color + '22', border: `1.5px solid ${seg.zone.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {seg.zone.label && <span style={{ fontSize: 9, fontWeight: 700, color: seg.zone.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 4px' }}>{seg.zone.label}</span>}
                        </div>
                      </span>
                    );
                  }
                  const c = seg.c;
                  const k = `${r}-${c}`;
                  const fullKey = `${levelKey}::${k}`;
                  const sd = seats[k];
                  const zone = sd?.zone ? getZone(sd.zone) : null;
                  const isAisle = !sd || sd.aisle;
                  const isBlocked = sd?.blocked;
                  const isBooked = sd?.booked || sd?.isBooked === true || sd?.isAvailable === false;
                  const isSel = selected.has(fullKey);
                  const col = zone ? zone.color : '#4a9edd';
                  const colAisle = aisleCols.find((a) => a.idx === c - 1);
                  let seatStyle = { width: 22, height: 22, flexShrink: 0, borderRadius: '5px 5px 3px 3px', cursor: 'default', fontSize: 0, border: 'none', outline: 'none', transition: 'transform .1s', position: 'relative' };
                  if (isAisle) seatStyle = { ...seatStyle, background: 'transparent', visibility: 'hidden' };
                  else if (isBlocked) seatStyle = { ...seatStyle, background: '#1f2028', border: '1.5px solid #2a2a38', opacity: 0.5 };
                  else if (isBooked) seatStyle = { ...seatStyle, background: col + '30', border: `1.5px solid ${col}45`, opacity: 0.4 };
                  else if (isSel) seatStyle = { ...seatStyle, background: col, border: '2px solid #fff', cursor: 'pointer', transform: 'scale(1.1)' };
                  else seatStyle = { ...seatStyle, background: col + '28', border: `1.5px solid ${col}70`, cursor: 'pointer' };
                  return (
                    <span key={si} style={{ display: 'contents' }}>
                      {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                      <button
                        style={seatStyle}
                        disabled={isAisle || isBlocked || isBooked}
                        onClick={() => !isAisle && !isBlocked && !isBooked && onToggle(fullKey, zone, r, c, levelKey)}
                        title={!isAisle && zone ? `${getRowLabel(r)}${c + 1} · ${zone.name} · ₹${Math.round((zone.basePrice || 0) * (zone.priceMultiplier || 1))}` : ''}
                      />
                    </span>
                  );
                })}
              </div>
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ==================== CINEMA BOOKING PREVIEW ====================
const CinemaBookingPreview = ({ theater, onClose }) => {
  const [selected, setSelected] = useState(new Set());

  const allZones = useMemo(() => {
    if (!theater?.screens) return [];
    const seen = new Set();
    const result = [];
    theater.screens.forEach((screen) => {
      (screen.zones || []).forEach((z) => {
        const baseId = z.id?.replace(/_ground$|_balcony$/, '') || z.id;
        if (!seen.has(baseId)) { seen.add(baseId); result.push({ ...z, id: baseId }); }
      });
    });
    return result;
  }, [theater]);

  const buildLevelData = useCallback((levelName) => {
    if (!theater?.screens) return null;
    const screen = theater.screens.find((s) =>
      levelName === 'balcony'
        ? s.position === 'top' || s.name?.toLowerCase().includes('balcony')
        : s.position !== 'top' && !s.name?.toLowerCase().includes('balcony')
    );
    if (!screen || !screen.zones?.length) return null;
    const meta = theater.layoutMeta || {};
    const isBalcony = levelName === 'balcony';
    const seats = {};
    (screen.zones || []).forEach((z) => {
      const baseId = z.id?.replace(/_ground$|_balcony$/, '') || z.id;
      (z.rows || []).forEach((row) => {
        (row.seats || []).forEach((seat) => {
          const r = (seat.rowNumber || 1) - 1;
          const c = (seat.columnNumber || 1) - 1;
          seats[`${r}-${c}`] = { zone: baseId, isAvailable: seat.isAvailable, isBooked: seat.isBooked };
        });
      });
    });
    const rows = screen.totalRows || (isBalcony ? meta.balconyRows : meta.groundRows) || 0;
    const cols = screen.totalColumns || (isBalcony ? meta.balconyCols : meta.groundCols) || 0;
    return {
      rows, cols, seats,
      aisleCols: (isBalcony ? meta.balconyAisleCols : meta.aisleCols) || [],
      aisleRows: (isBalcony ? meta.balconyAisleRows : meta.aisleRows) || [],
    };
  }, [theater]);

  const groundData = buildLevelData('ground');
  const balconyData = buildLevelData('balcony');

  const toggleSeat = useCallback((fullKey) => {
    setSelected((prev) => { const next = new Set(prev); next.has(fullKey) ? next.delete(fullKey) : next.add(fullKey); return next; });
  }, []);

  const selectionInfo = useMemo(() => {
    let total = 0;
    const labels = [];
    selected.forEach((fk) => {
      const [level, k] = fk.split('::');
      const ld = level === 'balcony' ? balconyData : groundData;
      if (!ld) return;
      const sd = ld.seats[k];
      const z = sd?.zone ? allZones.find((z) => z.id === sd.zone) : null;
      total += z ? Math.round(z.basePrice * (z.priceMultiplier || 1)) : 150;
      const [r, c] = k.split('-').map(Number);
      labels.push(`${String.fromCharCode(65 + r)}${c + 1}`);
    });
    return { total, labels, count: selected.size };
  }, [selected, groundData, balconyData, allZones]);

  const hasLayout = groundData || balconyData;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: '#0f0f16', borderBottom: '1px solid #1f1f2e', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#1a1a2e,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GiTheaterCurtains style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{theater?.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              {theater?.location}, {theater?.city}&nbsp;·&nbsp;
              {theater?.screens?.length || 0} screen(s)&nbsp;·&nbsp;
              {theater?.totalSeats || 0} seats
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[{ color: '#4a9edd28', border: '#4a9edd70', label: 'Available' }, { color: '#1f2028', border: '#2a2a38', label: 'Taken' }].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9ca3af' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, border: `1.5px solid ${l.border}` }} />
              {l.label}
            </div>
          ))}
          <button onClick={onClose} style={{ marginLeft: 8, width: 34, height: 34, borderRadius: 8, background: '#1f1f2e', border: '1px solid #2a2a38', color: '#9ca3af', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: '#0f0f16', padding: '0 24px 20px' }}>
        <div style={{ textAlign: 'center', padding: '18px 0 10px' }}>
          <div style={{ height: 3, maxWidth: 500, margin: '0 auto 6px', background: 'linear-gradient(90deg,transparent,#e2c97e,transparent)', borderRadius: 2 }} />
          <div style={{ fontSize: 10, color: '#e2c97e', letterSpacing: '3px', fontWeight: 700 }}>SCREEN — ALL EYES THIS WAY</div>
        </div>
        {!hasLayout ? (
          <div style={{ textAlign: 'center', paddingTop: 80, color: '#6b7280' }}>
            <MdEventSeat style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No seat layout configured</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>This theater has no seat data stored yet.</div>
          </div>
        ) : (
          <>
            {groundData && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.1em', padding: '3px 14px', background: '#1a1a24', borderRadius: 20, border: '1px solid #2a2a38' }}>Ground Floor</span>
                </div>
                <CinemaSeatFloor levelKey="ground" zones={allZones} seats={groundData.seats} rows={groundData.rows} cols={groundData.cols} aisleCols={groundData.aisleCols} aisleRows={groundData.aisleRows} selected={selected} onToggle={toggleSeat} />
              </div>
            )}
            {balconyData && (
              <>
                <div style={{ maxWidth: 500, margin: '0 auto 16px', borderTop: '1px dashed #2a2a38', position: 'relative', textAlign: 'center' }}>
                  <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.1em', padding: '3px 14px', background: '#0f0f16', borderRadius: 20, border: '1px solid #2a2a38' }}>Balcony</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <CinemaSeatFloor levelKey="balcony" zones={allZones} seats={balconyData.seats} rows={balconyData.rows} cols={balconyData.cols} aisleCols={balconyData.aisleCols} aisleRows={balconyData.aisleRows} selected={selected} onToggle={toggleSeat} />
                </div>
              </>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {allZones.map((z) => (
                <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: z.color + '18', border: `1px solid ${z.color}44`, color: z.color }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: z.color, display: 'inline-block' }} />
                  {z.name}&nbsp;<strong style={{ color: '#fff' }}>₹{Math.round((z.basePrice || 0) * (z.priceMultiplier || 1))}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{ background: '#0f0f16', borderTop: '1px solid #1f1f2e', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em' }}>Selected Seats</div>
          <div style={{ fontSize: 13, color: '#e5e7eb' }}>
            {selectionInfo.count === 0 ? (
              <span style={{ color: '#4b5563' }}>Click seats above to select</span>
            ) : (
              <><span style={{ color: '#e2c97e', fontWeight: 700 }}>{selectionInfo.labels.slice(0, 6).join(', ')}{selectionInfo.labels.length > 6 ? ` +${selectionInfo.labels.length - 6} more` : ''}</span>&nbsp;·&nbsp;<span style={{ color: '#fff', fontWeight: 700 }}>₹{selectionInfo.total.toLocaleString()}</span></>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setSelected(new Set())} disabled={selectionInfo.count === 0} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #2a2a38', background: '#1a1a24', color: '#9ca3af', cursor: selectionInfo.count === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: selectionInfo.count === 0 ? 0.5 : 1 }}>Clear</button>
          <button onClick={onClose} style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Close Preview</button>
        </div>
      </div>
    </div>
  );
};

// ==================== SHOW TIMING COMPONENT ====================
const ShowTiming = ({ timing, index, onUpdate, onRemove, canRemove, onCopy, hasConflict, conflictMessage, movieDuration, onAutoFill }) => {
  const handleStartTimeChange = (value) => {
    onUpdate(index, 'startTime', value);
    if (movieDuration && value) {
      const calculatedEndTime = calculateEndTime(value, parseInt(movieDuration));
      onUpdate(index, 'endTime', calculatedEndTime);
    } else if (timing.endTime && value) {
      const calculatedDuration = calculateDuration(value, timing.endTime);
      if (calculatedDuration && calculatedDuration > 0) {
        onUpdate(index, 'movieDuration', calculatedDuration);
        if (index === 0 && onAutoFill) {
          onAutoFill(calculatedDuration);
        }
      }
    }
  };
  
  const handleEndTimeChange = (value) => {
    onUpdate(index, 'endTime', value);
    if (timing.startTime && value) {
      const calculatedDuration = calculateDuration(timing.startTime, value);
      if (calculatedDuration && calculatedDuration > 0) {
        onUpdate(index, 'movieDuration', calculatedDuration);
        if (index === 0 && onAutoFill) {
          onAutoFill(calculatedDuration);
        }
      }
    }
  };
  
  const currentDuration = timing.movieDuration || (timing.startTime && timing.endTime ? calculateDuration(timing.startTime, timing.endTime) : null);
  
  return (
    <div className={`rounded-xl p-4 transition-all duration-300 ${hasConflict ? 'bg-red-500/10 border-red-500/50' : 'bg-background/30 border'}`} style={{ borderColor: hasConflict ? "#ef4444" : "var(--card-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${hasConflict ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
            <span className={`text-xs font-bold ${hasConflict ? 'text-red-400' : 'text-blue-400'}`}>{index + 1}</span>
          </div>
          <span className="text-xs font-semibold text-foreground/60">Show Timing</span>
          {hasConflict && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20">
              <FaExclamationTriangle className="text-[8px] text-red-400" />
              <span className="text-[8px] font-bold text-red-400">Conflict</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onCopy(index)} className="p-1.5 rounded-lg transition-all hover:bg-blue-500/20" title="Copy timing">
            <FaCopy className="text-xs text-blue-400" />
          </button>
          {canRemove && (
            <button type="button" onClick={() => onRemove(index)} className="p-1.5 rounded-lg transition-all hover:bg-red-500/20" title="Remove timing">
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
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all bg-card border ${hasConflict ? 'focus:ring-red-500 border-red-500/50' : 'focus:ring-blue-500'}`}
            style={{ borderColor: hasConflict ? "#ef4444" : "var(--card-border)", color: "var(--foreground)" }}
            required
          />
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-foreground/50">Start Time</label>
          <input
            type="time"
            value={timing.startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all bg-card border ${hasConflict ? 'focus:ring-red-500 border-red-500/50' : 'focus:ring-blue-500'}`}
            style={{ borderColor: hasConflict ? "#ef4444" : "var(--card-border)", color: "var(--foreground)" }}
            required
          />
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-foreground/50">End Time</label>
          <input
            type="time"
            value={timing.endTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all bg-card border ${hasConflict ? 'focus:ring-red-500 border-red-500/50' : 'focus:ring-blue-500'}`}
            style={{ borderColor: hasConflict ? "#ef4444" : "var(--card-border)", color: "var(--foreground)" }}
            required
          />
        </div>
      </div>
      
      {currentDuration && currentDuration > 0 && (
        <div className="mt-2 text-[9px] text-green-400/70 flex items-center gap-1">
          <FaInfoCircle className="text-[8px]" />
          🎬 Movie Duration: <strong>{currentDuration} minutes</strong>
          {index === 0 && !movieDuration && (
            <span className="text-blue-400 ml-1">(Will auto-fill movie duration)</span>
          )}
          {index === 0 && movieDuration && movieDuration != currentDuration && (
            <span className="text-yellow-400 ml-1">(Different from movie duration)</span>
          )}
        </div>
      )}
      
      {hasConflict && conflictMessage && (
        <div className="mt-2 text-[10px] text-red-400 flex items-center gap-1">
          <FaExclamationTriangle className="text-[8px]" />
          {conflictMessage}
        </div>
      )}
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ step, label, icon: Icon, isActive, isCompleted, onClick }) => (
  <button type="button" onClick={onClick} className={`flex-1 relative group transition-all duration-500 ${isActive ? 'scale-105' : 'hover:scale-102'}`}>
    <div className="flex flex-col items-center gap-1">
      <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-gradient-primary shadow-lg shadow-blue-500/25 scale-110' : isCompleted ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-card border text-foreground/40'}`}
        style={!isActive && !isCompleted ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}>
        {isCompleted ? <FaCheckCircle className="text-green-400 text-sm animate-in zoom-in duration-300" /> : <Icon className={`text-base transition-all duration-300 ${isActive ? 'text-white' : ''}`} />}
      </div>
      <div className="text-center hidden sm:block">
        <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isActive ? '#3b82f6' : "var(--foreground)", opacity: isActive ? 1 : 0.4 }}>Step {step}</div>
        <div className="text-[10px] font-semibold" style={{ color: isActive ? "var(--foreground)" : "var(--foreground)", opacity: isActive ? 1 : 0.4 }}>{label}</div>
      </div>
    </div>
  </button>
);

// Main Component
export default function CreateShow() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [screenZones, setScreenZones] = useState([]);
  const [screenPosition, setScreenPosition] = useState('top');
  const [conflicts, setConflicts] = useState({});
  const [showTimings, setShowTimings] = useState([
    { showDate: '', startTime: '', endTime: '', movieDuration: '' }
  ]);
  
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

  const { data: theatersData, isLoading: isLoadingTheaters } = useQuery({
    queryKey: ['allTheatersAdmin'],
    queryFn: getAllTheatersAdmin,
  });

  const theaters = theatersData?.data || [];

  const { data: theaterDetail, isLoading: isLoadingTheaterDetail } = useQuery({
    queryKey: ['theaterDetail', formData.theaterId],
    queryFn: () => getTheaterByIdAdmin(formData.theaterId),
    enabled: !!formData.theaterId,
  });

  useEffect(() => {
    if (theaterDetail?.data) {
      setSelectedTheater(theaterDetail.data);
      setScreenPosition(theaterDetail.data.screenPosition || 'top');
    }
  }, [theaterDetail]);

  useEffect(() => {
    if (selectedTheater && formData.screenId) {
      const screen = selectedTheater.screens?.find(s => s._id === formData.screenId);
      if (screen) {
        setSelectedScreen(screen);
        setScreenZones(screen.zones || []);
      }
    }
  }, [selectedTheater, formData.screenId]);

  const validateTimingConflicts = useCallback((timings) => {
    const newConflicts = {};
    const timingsByDate = {};
    timings.forEach((timing, index) => {
      if (timing.showDate && timing.startTime && timing.endTime) {
        if (!timingsByDate[timing.showDate]) timingsByDate[timing.showDate] = [];
        timingsByDate[timing.showDate].push({ index, timing });
      }
    });
    
    Object.keys(timingsByDate).forEach(date => {
      const dateTimings = timingsByDate[date];
      for (let i = 0; i < dateTimings.length; i++) {
        const timing1 = dateTimings[i];
        const start1 = timeToMinutes(timing1.timing.startTime);
        const end1 = timeToMinutes(timing1.timing.endTime);
        for (let j = i + 1; j < dateTimings.length; j++) {
          const timing2 = dateTimings[j];
          const start2 = timeToMinutes(timing2.timing.startTime);
          const end2 = timeToMinutes(timing2.timing.endTime);
          if (doTimesOverlap(start1, end1, start2, end2)) {
            newConflicts[timing1.index] = `Conflicts with Timing ${timing2.index + 1} (${timing2.timing.startTime} - ${timing2.timing.endTime})`;
            newConflicts[timing2.index] = `Conflicts with Timing ${timing1.index + 1} (${timing1.timing.startTime} - ${timing1.timing.endTime})`;
          }
        }
      }
    });
    setConflicts(newConflicts);
    return Object.keys(newConflicts).length === 0;
  }, []);

  useEffect(() => {
    validateTimingConflicts(showTimings);
  }, [showTimings, validateTimingConflicts]);

  const autoFillMovieDuration = useCallback((duration) => {
    if (duration && duration > 0 && !formData.movie.duration) {
      setFormData(prev => ({
        ...prev,
        movie: { ...prev.movie, duration: duration.toString() }
      }));
      toast.success(`🎬 Movie duration auto-set to ${duration} minutes based on show timing!`);
    }
  }, [formData.movie.duration]);

  const handleUpdateTiming = useCallback((index, field, value) => {
    setShowTimings(prev => prev.map((timing, i) => {
      if (i === index) {
        const updated = { ...timing, [field]: value };
        if ((field === 'startTime' || field === 'endTime') && updated.startTime && updated.endTime) {
          const calculatedDuration = calculateDuration(updated.startTime, updated.endTime);
          if (calculatedDuration && calculatedDuration > 0) {
            updated.movieDuration = calculatedDuration;
            if (index === 0 && !formData.movie.duration) {
              autoFillMovieDuration(calculatedDuration);
            }
          }
        }
        return updated;
      }
      return timing;
    }));
  }, [autoFillMovieDuration, formData.movie.duration]);

  const handleAddTiming = useCallback(() => {
    setShowTimings(prev => [...prev, { showDate: '', startTime: '', endTime: '', movieDuration: '' }]);
  }, []);

  const handleRemoveTiming = useCallback((index) => {
    if (showTimings.length > 1) {
      setShowTimings(prev => prev.filter((_, i) => i !== index));
    } else {
      toast.error('At least one show timing is required');
    }
  }, [showTimings.length]);

  const handleCopyTiming = useCallback((index) => {
    const timingToCopy = showTimings[index];
    setShowTimings(prev => [...prev, { ...timingToCopy }]);
    toast.success('Timing copied!');
  }, [showTimings]);

  useEffect(() => {
    if (formData.movie.duration && parseInt(formData.movie.duration) > 0) {
      setShowTimings(prev => prev.map(timing => {
        if (timing.startTime) {
          const calculatedEndTime = calculateEndTime(timing.startTime, parseInt(formData.movie.duration));
          return { ...timing, endTime: calculatedEndTime, movieDuration: parseInt(formData.movie.duration) };
        }
        return timing;
      }));
    }
  }, [formData.movie.duration]);

  const createMutation = useMutation({
    mutationFn: createShowAdmin,
    onSuccess: () => {
      toast.success(`✨ Show created with ${showTimings.length} timing${showTimings.length > 1 ? 's' : ''}! 🎬`);
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
    setFormData(prev => ({ ...prev, theaterId: theater._id, screenId: '', screenNumber: '' }));
  }, []);

  const handleScreenChange = useCallback((screen) => {
    setSelectedScreen(screen);
    setScreenZones(screen.zones || []);
    setFormData(prev => ({ ...prev, screenId: screen._id, screenNumber: screen.screenNumber }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('movie.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, movie: { ...prev.movie, [field]: type === 'checkbox' ? checked : value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        setFormData(prev => ({ ...prev, movie: { ...prev.movie, poster: reader.result } }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const validateForm = useCallback(() => {
    const validations = [
      { condition: !formData.theaterId, message: 'Please select a theater' },
      { condition: !formData.screenId, message: 'Please select a screen' },
      { condition: !formData.movie.name, message: 'Please enter movie name' },
      { condition: !formData.movie.duration, message: 'Please enter movie duration or set it from show timings' },
      { condition: !formData.movie.rating, message: 'Please enter movie rating' }
    ];
    
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
      if (timing.startTime && timing.endTime) {
        const start = timeToMinutes(timing.startTime);
        const end = timeToMinutes(timing.endTime);
        if (end <= start) {
          validations.push({ condition: true, message: `Timing ${i + 1}: End time must be after start time` });
          break;
        }
      }
    }
    
    if (Object.keys(conflicts).length > 0) {
      validations.push({ condition: true, message: 'Please resolve timing conflicts before submitting' });
    }
    
    const failed = validations.find(v => v.condition);
    if (failed) {
      toast.error(failed.message);
      return false;
    }
    return true;
  }, [formData, showTimings, conflicts]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }
    
    let finalDuration = formData.movie.duration;
    if (!finalDuration && showTimings[0]?.startTime && showTimings[0]?.endTime) {
      finalDuration = calculateDuration(showTimings[0].startTime, showTimings[0].endTime)?.toString() || '';
    }
    
    const timingsData = showTimings.map(timing => ({
      showDate: timing.showDate,
      startTime: timing.startTime,
      endTime: timing.endTime,
      duration: timing.movieDuration || calculateDuration(timing.startTime, timing.endTime),
      seatCategories: formData.seatCategories.map(cat => ({ category: cat.category, pricePerSeat: parseInt(cat.pricePerSeat) }))
    }));
    
    const submitData = {
      theaterId: formData.theaterId,
      screenId: formData.screenId,
      screenNumber: parseInt(formData.screenNumber) || 1,
      movie: {
        name: formData.movie.name,
        poster: formData.movie.poster,
        genre: formData.movie.genre,
        duration: parseInt(finalDuration || formData.movie.duration),
        rating: parseFloat(formData.movie.rating),
        description: formData.movie.description || '',
        language: formData.movie.language,
        isTrending: formData.movie.isTrending,
        releaseDate: formData.movie.releaseDate || new Date().toISOString().split('T')[0]
      },
      timings: timingsData,
      seatCategories: formData.seatCategories.map(cat => ({ category: cat.category, pricePerSeat: parseInt(cat.pricePerSeat) })),
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

  useEffect(() => {
    if (selectedTheater?.screens?.length > 0 && !formData.screenId) {
      handleScreenChange(selectedTheater.screens[0]);
    }
  }, [selectedTheater]);

  const handleNext = useCallback(() => {
    if (activeTab === 'basic') {
      if (!formData.theaterId) { toast.error('Please select a theater'); return; }
      if (!formData.screenId) { toast.error('Please select a screen'); return; }
      
      let hasValidTiming = false;
      let hasDuration = false;
      
      for (const timing of showTimings) {
        if (timing.showDate && timing.startTime && timing.endTime) {
          hasValidTiming = true;
          const duration = calculateDuration(timing.startTime, timing.endTime);
          if (duration && duration > 0) {
            hasDuration = true;
            if (!formData.movie.duration && timing === showTimings[0]) {
              autoFillMovieDuration(duration);
            }
          }
        }
      }
      
      if (!hasValidTiming) { toast.error('Please add at least one valid show timing'); return; }
      if (!formData.movie.duration && !hasDuration) { toast.error('Please set movie duration either manually or by entering start and end times'); return; }
      if (Object.keys(conflicts).length > 0) { toast.error('Please resolve timing conflicts before proceeding'); return; }
      
      setActiveTab('movie');
    } else if (activeTab === 'movie') {
      if (!formData.movie.name || !formData.movie.duration || !formData.movie.rating) {
        toast.error('Please fill all required movie fields');
        return;
      }
      setActiveTab('seats');
    }
  }, [activeTab, formData, showTimings, conflicts, autoFillMovieDuration]);

  const handleBack = useCallback(() => {
    if (activeTab === 'movie') setActiveTab('basic');
    if (activeTab === 'seats') setActiveTab('movie');
  }, [activeTab]);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-background" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      <div className="sticky top-0 z-[100] shadow-lg transition-all duration-300 bg-card/90 backdrop-blur-md border-b" style={{ background: "rgba(var(--card), 0.9)", borderColor: "var(--card-border)" }}>
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
                <h1 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>Create New Show</h1>
                <p className="text-[10px] sm:text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Add a new movie screening with multiple show timings</p>
              </div>
            </div>
            <button onClick={() => router.back()} className="group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 bg-card border hover:bg-red-500/10" style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
              <FaTimes className="text-xs" /> Cancel
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, idx) => (
              <StepIndicator key={step.id} step={idx + 1} label={step.label} icon={step.icon} isActive={activeTab === step.id} isCompleted={steps.findIndex(s => s.id === activeTab) > idx} onClick={() => steps.findIndex(s => s.id === activeTab) > idx && setActiveTab(step.id)} />
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="rounded-xl shadow-xl transition-all duration-300 overflow-hidden bg-card border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            
            {activeTab === 'basic' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-1 rounded-full bg-gradient-primary" /></div>
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>Theater & Show Timings</h2>
                  <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>Choose the venue and add multiple show timings for this movie</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}><FaBuilding className="text-red-500" /> Select Theater</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {isLoadingTheaters ? (
                        <div className="col-span-3 flex items-center justify-center py-8"><FaSpinner className="animate-spin text-xl text-blue-500" /></div>
                      ) : (
                        theaters.map(theater => (
                          <div key={theater._id} onClick={() => handleTheaterChange(theater)} className={`cursor-pointer rounded-xl p-3 transition-all duration-300 hover:scale-105 ${formData.theaterId === theater._id ? 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent' : 'bg-card border hover:border-blue-500/50'}`} style={formData.theaterId !== theater._id ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}>
                            <div className="flex items-start gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.theaterId === theater._id ? 'bg-blue-500' : 'bg-background border'}`} style={formData.theaterId !== theater._id ? { background: "var(--background)", borderColor: "var(--card-border)" } : {}}>
                                <MdTheaters className={`text-base ${formData.theaterId === theater._id ? 'text-white' : 'text-blue-500'}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{theater.name}</h3>
                                <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "var(--foreground)", opacity: 0.4 }}><MdLocationOn className="text-[8px]" />{theater.location}, {theater.city}</p>
                                <p className="text-[9px] mt-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>📺 {theater.screens?.length || 0} Screens • 💺 {theater.totalSeats || 0} Seats</p>
                              </div>
                              {formData.theaterId === theater._id && <FaCheckCircle className="text-green-500 text-xs animate-in zoom-in" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {selectedTheater && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}><MdScreenShare className="text-purple-500" /> Select Screen</label>
                      {isLoadingTheaterDetail ? (
                        <div className="flex items-center justify-center py-8"><FaSpinner className="animate-spin text-xl text-purple-500" /><span className="ml-2 text-sm text-foreground/50">Loading screens...</span></div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {selectedTheater.screens?.map(screen => (
                              <div key={screen._id} onClick={() => handleScreenChange(screen)} className={`cursor-pointer rounded-xl p-3 text-center transition-all duration-300 hover:scale-105 ${formData.screenId === screen._id ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-500/10 to-transparent' : 'bg-card border hover:border-purple-500/50'}`} style={formData.screenId !== screen._id ? { background: "var(--card)", borderColor: "var(--card-border)" } : {}}>
                                <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${formData.screenId === screen._id ? 'bg-purple-500' : 'bg-background border'}`} style={formData.screenId !== screen._id ? { background: "var(--background)", borderColor: "var(--card-border)" } : {}}>
                                  <MdScreenShare className={`text-lg ${formData.screenId === screen._id ? 'text-white' : 'text-purple-500'}`} />
                                </div>
                                <div className="font-extrabold text-base" style={{ color: "var(--foreground)" }}>{screen.name || `Screen ${screen.screenNumber}`}</div>
                                <div className="text-[9px] mt-0.5" style={{ color: "var(--foreground)", opacity: 0.4 }}>{screen.zones?.length || 0} zones • {screen.totalSeatsInScreen || 0} seats</div>
                                {formData.screenId === screen._id && <FaCheckCircle className="text-green-500 text-xs mx-auto mt-2 animate-in zoom-in" />}
                              </div>
                            ))}
                          </div>
                          {selectedScreen && formData.screenId === selectedScreen._id && selectedTheater && (
                            <div className="mt-4">
                              <button type="button" onClick={() => setShowPreview(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" style={{ background: 'linear-gradient(135deg,#1a1a2e,#1e3a5f)', border: '1.5px solid #3b82f6', color: '#93c5fd', boxShadow: '0 4px 20px rgba(59,130,246,.2)' }}>
                                <FaEye style={{ fontSize: 14 }} /> Preview Seat Layout (Cinema View)
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: 'rgba(59,130,246,.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,.3)' }}>{selectedTheater.totalSeats || 0} seats</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {selectedScreen && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}><FaCalendar className="text-green-500" /> Show Timings ({showTimings.length})</label>
                        <button type="button" onClick={handleAddTiming} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 text-xs font-semibold hover:bg-green-500/30 transition-all"><FaPlus className="text-[10px]" /> Add Timing</button>
                      </div>
                      
                      <div className="mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2"><FaMagic className="text-blue-400 text-xs" /><p className="text-[10px] text-blue-400"><strong>Smart Duration Calculator:</strong> Enter start & end time → duration auto-calculates and fills movie duration automatically!</p></div>
                      </div>
                      
                      {Object.keys(conflicts).length > 0 && (
                        <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                          <div className="flex items-center gap-2"><FaExclamationTriangle className="text-red-400 text-sm" /><div className="flex-1"><p className="text-xs font-semibold text-red-400">Timing Conflicts Detected</p><p className="text-[10px] text-red-300/70">{Object.keys(conflicts).length} timing{Object.keys(conflicts).length > 1 ? 's have' : ' has'} overlapping schedules. Please adjust the timings.</p></div></div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {showTimings.map((timing, index) => (
                          <ShowTiming key={index} timing={timing} index={index} onUpdate={handleUpdateTiming} onRemove={handleRemoveTiming} onCopy={handleCopyTiming} canRemove={showTimings.length > 1} hasConflict={!!conflicts[index]} conflictMessage={conflicts[index]} movieDuration={formData.movie.duration} onAutoFill={autoFillMovieDuration} />
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-[10px] text-blue-400 flex items-center gap-1"><FaInfoCircle className="text-[10px]" />💡 <strong>Pro Tip:</strong> Just enter start time and end time - the duration will be calculated automatically and applied to the movie! You can also add multiple shows on different dates.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'movie' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-1 rounded-full bg-gradient-primary" /></div><h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>Movie Information</h2><p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>Enter all details about the film</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Movie Name</label><input type="text" name="movie.name" value={formData.movie.name} onChange={handleInputChange} placeholder="e.g., Jawan, Pathaan, Animal" className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }} required /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Genre</label><select name="movie.genre" value={formData.movie.genre} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>{GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}</select></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Language</label><select name="movie.language" value={formData.movie.language} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>{LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}</select></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Duration (minutes) <span className="text-green-400 text-[8px]">(Auto-filled from timing)</span></label><input type="number" name="movie.duration" value={formData.movie.duration} onChange={handleInputChange} placeholder="e.g., 170" className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }} required /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Rating (0-10)</label><input type="number" step="0.1" min="0" max="10" name="movie.rating" value={formData.movie.rating} onChange={handleInputChange} placeholder="e.g., 8.5" className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }} required /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Release Date</label><input type="date" name="movie.releaseDate" value={formData.movie.releaseDate} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }} /></div>
                  <div className="sm:col-span-2"><label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Description</label><textarea name="movie.description" value={formData.movie.description} onChange={handleInputChange} rows="3" placeholder="Brief description about the movie..." className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }} /></div>
                  <div className="sm:col-span-2"><label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--foreground)", opacity: 0.6 }}>Movie Poster</label><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1"><input type="file" accept="image/*" onChange={handlePosterChange} className="w-full px-3 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-2 file:py-1 file:px-3 file:rounded-lg file:text-xs file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }} /></div><label className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" name="movie.isTrending" checked={formData.movie.isTrending} onChange={handleInputChange} className="w-4 h-4 rounded border-2 focus:ring-red-500 transition-all" /><span className="text-xs font-semibold group-hover:text-red-500 transition-colors" style={{ color: "var(--foreground)" }}>Mark as Trending</span></label></div>{posterPreview && (<div className="mt-3 animate-in fade-in zoom-in duration-300"><img src={posterPreview} alt="Preview" className="h-28 w-auto rounded-lg object-cover shadow-lg border-2 border-blue-500/30" /></div>)}</div>
                </div>
              </div>
            )}
            
            {activeTab === 'seats' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-1 rounded-full bg-gradient-primary" /></div><h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>Seat Categories & Pricing</h2><p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>Configure pricing for different seat types</p></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-lg p-3 text-center bg-card border" style={{ borderColor: "var(--card-border)" }}><div className="text-xl font-black text-blue-500">{previewStats.totalCategories}</div><div className="text-[9px] opacity-60">Categories</div></div>
                  <div className="rounded-lg p-3 text-center bg-card border" style={{ borderColor: "var(--card-border)" }}><div className="text-xl font-black text-green-500">₹{previewStats.avgPrice}</div><div className="text-[9px] opacity-60">Avg Price</div></div>
                  <div className="rounded-lg p-3 text-center bg-card border" style={{ borderColor: "var(--card-border)" }}><div className="text-xl font-black text-yellow-500">₹{previewStats.highestPrice}</div><div className="text-[9px] opacity-60">Highest</div></div>
                  <div className="rounded-lg p-3 text-center bg-card border" style={{ borderColor: "var(--card-border)" }}><div className="text-xl font-black text-purple-500">₹{previewStats.lowestPrice}</div><div className="text-[9px] opacity-60">Lowest</div></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.seatCategories.map((category, index) => {
                    const config = CATEGORY_CONFIG[category.category] || CATEGORY_CONFIG.NORMAL;
                    const Icon = config.icon;
                    return (
                      <div key={category.category} className="rounded-xl p-4 transition-all duration-300 bg-card border" style={{ borderColor: `var(--${config.color}-500/30)` }}>
                        <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${config.color}-500/20`}><Icon className={`text-base text-${config.color}-400`} /></div><div><h3 className="font-extrabold text-sm" style={{ color: "var(--foreground)" }}>{category.category}</h3><p className="text-[9px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>{config.desc} • {config.mult}</p></div></div><div className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-background" style={{ background: "var(--background)" }}>#{index + 1}</div></div>
                        <div><label className="text-[9px] font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--foreground)", opacity: 0.4 }}>Price per Seat</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-green-500">₹</span><input type="number" value={category.pricePerSeat} onChange={(e) => handleCategoryChange(index, 'pricePerSeat', parseInt(e.target.value) || 0)} className="w-full pl-7 pr-3 py-2 rounded-lg text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-green-500 bg-background border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }} /></div></div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"><div className="flex items-start gap-2"><FaInfoCircle className="text-sm mt-0.5 text-blue-400" /><div className="flex-1"><p className="text-xs font-semibold mb-0.5 text-blue-400">Seat Layout Information</p><p className="text-[10px] text-blue-300/70">Seat layout will be automatically generated based on the theater screen configuration. These pricing will apply to ALL show timings you&apos;ve added.</p></div></div></div>
              </div>
            )}
            
            <div className="border-t p-4 flex justify-between" style={{ borderColor: "var(--card-border)" }}>
              {!isFirstStep ? <button type="button" onClick={handleBack} className="group flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border hover:bg-card/50" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}><FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back</button> : <div />}
              {!isLastStep ? <button type="button" onClick={handleNext} className="group flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-primary text-white font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">Next <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" /></button> : <button type="submit" disabled={createMutation.isPending} className="group flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">{createMutation.isPending ? (<><FaSpinner className="animate-spin text-sm" /> Creating {showTimings.length} Timing{showTimings.length > 1 ? 's' : ''}...</>) : (<><FaSave className="text-sm group-hover:scale-110 transition-transform" /> Create Show {showTimings.length > 1 ? `(${showTimings.length} Timings)` : ''}</>)}</button>}
            </div>
          </div>
        </form>
        
        {showPreview && selectedTheater && <CinemaBookingPreview theater={selectedTheater} onClose={() => setShowPreview(false)} />}
      </div>
    </div>
  );
}