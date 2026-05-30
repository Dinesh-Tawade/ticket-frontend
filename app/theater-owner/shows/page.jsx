'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  getPublicShows,
  createBooking,
  getTheaterByIdAdmin,
  getMe,
} from "../../services/adminCommunication";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaStar,
  FaLanguage,
  FaTicketAlt,
  FaRupeeSign,
  FaCheckCircle,
  FaWallet,
  FaChair,
  FaSpinner,
  FaDownload,
  FaShare,
  FaPrint,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { MdLocalMovies, MdEventSeat } from 'react-icons/md';
import { GiTheater, GiTheaterCurtains } from 'react-icons/gi';

// ==================== SINGLE TICKET STUB (UPDATED WITH PROPER QR FORMAT) ====================
const SingleTicket = React.forwardRef(({ booking, seat, showDate, theater, show }, ref) => {
  const category = seat?.category || booking?.seats?.[0]?.category || "NORMAL";
  const seatLabel = `${seat?.rowName || "—"}${seat?.seatNumber || "—"}`;
  
  // Get show time from the show object or booking
  const showTime = show?.startTime || booking?.showTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const movieName = show?.movie?.name || booking?.movieName || "Movie";
  const theaterName = theater?.name || booking?.theaterId?.name || "PVR Cinemas";
  const theaterAddress = theater?.address || booking?.theaterId?.address || "Premium Cinema Hall";
  const screenName = show?.screenNumber ? `Screen ${show.screenNumber}` : (booking?.screen || "Screen 1");
  
  // Format date properly
  const formattedDate = new Date(showDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Generate proper QR code data in format: BKG{bookingId}|{rowName}|{seatNumber}|{seatLabel}
  const bookingId = booking?.bookingId || "BKG" + Date.now();
  const rowName = seat?.rowName || "—";
  const seatNumber = seat?.seatNumber || "—";
  const qrData = `${bookingId}|${rowName}|${seatNumber}|${seatLabel}`;

  return (
    <div className="st-ticket" ref={ref}>
      {/* LEFT */}
      <div className="st-left">
        <div className="st-movie">{movieName}</div>
        <span className="st-cat">{category}</span>
        <div className="st-sep" />
        <div className="st-row">
          <span className="st-ico">📅</span>
          <div>
            <div className="st-lbl">DATE</div>
            <div className="st-val">{formattedDate}</div>
          </div>
        </div>
        <div className="st-row">
          <span className="st-ico">🕐</span>
          <div>
            <div className="st-lbl">TIME</div>
            <div className="st-val">{showTime}</div>
          </div>
        </div>
        <div className="st-row">
          <span className="st-ico">🏛️</span>
          <div>
            <div className="st-lbl">THEATER</div>
            <div className="st-val">{theaterName}</div>
            {theaterAddress && <div className="st-sub">{theaterAddress}</div>}
          </div>
        </div>
        <div className="st-row">
          <span className="st-ico">🎬</span>
          <div>
            <div className="st-lbl">SCREEN</div>
            <div className="st-val">{screenName}</div>
          </div>
        </div>
        <div className="st-sep" />
        <div className="st-footer">
          <div className="st-box-wrap">
            <div className="st-box-lbl">ROW</div>
            <div className="st-box">{seat?.rowName || "—"}</div>
          </div>
          <div className="st-box-wrap">
            <div className="st-box-lbl">SEAT</div>
            <div className="st-box">{seat?.seatNumber || "—"}</div>
          </div>
          <div className="st-box-wrap">
            <div className="st-box-lbl">PRICE</div>
            <div className="st-price">₹{seat?.price ?? booking?.totalAmount ?? 150}</div>
          </div>
        </div>
      </div>

      {/* PERF */}
      <div className="st-perf">
        <div className="st-perf-dot st-perf-dot--t" />
        <div className="st-perf-line" />
        <div className="st-perf-dot st-perf-dot--b" />
      </div>

      {/* RIGHT */}
      <div className="st-right">
        <div className="st-bkid">{bookingId}</div>
        <div className="st-qr-wrap">
          <div className="st-qr">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&bgcolor=ffffff&color=000000&ecc=H`}
              alt="QR Code"
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="st-scan">SCAN TO VERIFY</div>
        </div>
        <div className="st-circle">{seatLabel}</div>
      </div>
    </div>
  );
});
SingleTicket.displayName = "SingleTicket";

// ==================== TICKET MODAL (UPDATED) ====================
const TicketModal = ({ booking, show, theater, onClose, onRedirect }) => {
  const router = useRouter();
  const seats = booking?.seats?.length ? booking.seats : [{}];
  const [idx, setIdx] = useState(0);
  const ticketRef = useRef(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const showDate = new Date(show?.showDate || booking?.showDate || new Date()).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  const capture = async () => {
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(ticketRef.current, {
      scale: 3, backgroundColor: "#ffffff", useCORS: true, logging: false,
    });
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await capture();
      const link = document.createElement("a");
      link.download = `ticket-${booking?.bookingId || 'booking'}-seat${idx + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch { window.print(); }
  };
  

  const handleDownloadAll = async () => {
    try {
      for (let i = 0; i < seats.length; i++) {
        setIdx(i);
        await new Promise(r => setTimeout(r, 350));
        if (!ticketRef.current) continue;
        const canvas = await capture();
        const link = document.createElement("a");
        link.download = `ticket-${booking?.bookingId || 'booking'}-seat${i + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        await new Promise(r => setTimeout(r, 200));
      }
    } catch { window.print(); }
  };

  const handleRedirect = () => {
    setIsRedirecting(true);
    onRedirect?.();
    router.push('/theater-owner/bookings');
  };

  return (
    <div className="tm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tm-wrap">
        {/* Header */}
        <div className="tm-header">
          <div className="tm-header-l">
            <h2 className="tm-title">Your Ticket</h2>
            {seats.length > 1 && (
              <span className="tm-counter">{idx + 1} / {seats.length} seats</span>
            )}
          </div>
          <button className="tm-x" onClick={onClose}><FaTimes size={15} /></button>
        </div>

        {/* Carousel */}
        <div className="tm-carousel">
          {seats.length > 1 && (
            <button className="tm-nav" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>
              <FaChevronLeft size={13} />
            </button>
          )}
          <SingleTicket 
            ref={ticketRef} 
            booking={booking} 
            seat={seats[idx]} 
            showDate={showDate}
            theater={theater}
            show={show}
          />
          {seats.length > 1 && (
            <button className="tm-nav" onClick={() => setIdx(i => Math.min(seats.length - 1, i + 1))} disabled={idx === seats.length - 1}>
              <FaChevronRight size={13} />
            </button>
          )}
        </div>

        {/* Seat dots */}
        {seats.length > 1 && (
          <div className="tm-dots">
            {seats.map((_, i) => (
              <button key={i} className={`tm-dot ${i === idx ? "tm-dot--on" : ""}`} onClick={() => setIdx(i)} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="tm-actions">
          <button className="tm-btn-primary" onClick={handleDownload}>
            <FaDownload size={13} /> Download This Ticket
          </button>
          {seats.length > 1 && (
            <button className="tm-btn-secondary" onClick={handleDownloadAll}>
              <FaDownload size={13} /> All {seats.length} Tickets
            </button>
          )}
          <button className="tm-btn-ghost" onClick={handleRedirect} disabled={isRedirecting}>
            {isRedirecting ? <FaSpinner className="animate-spin" size={13} /> : <FaTicketAlt size={13} />}
            {isRedirecting ? "Redirecting..." : "View My Bookings"}
          </button>
        </div>
      </div>
      <style>{MODAL_STYLES}</style>
    </div>
  );
};

// ==================== CINEMA SEAT FLOOR COMPONENT (UPDATED WITH CLEAR BOOKED SEAT VISIBILITY) ====================
const CinemaSeatFloor = ({ levelKey, zones, seats, rows, cols, aisleCols = [], aisleRows = [], selected, onToggle, accessibleSeatSet }) => {
  const getRowLabel = (r) => String.fromCharCode(65 + r);
  const getZone = (id) => zones.find((z) => z.id === id);
  const [hoveredSeat, setHoveredSeat] = useState(null);

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
        segs.push({ type: "noSeatBlock", zone, startC: c, colSpan: span });
        c += span;
      } else {
        segs.push({ type: "seat", c });
        c++;
      }
    }
    return segs;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", minWidth: "max-content" }}>
        {/* Column numbers header */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 22, flexShrink: 0 }} />
          {Array.from({ length: cols }, (_, c) => (
            <span key={c} style={{ display: "contents" }}>
              {aisleCols.find((a) => a.idx === c - 1) && <div style={{ width: 14, flexShrink: 0 }} />}
              <div style={{ width: 22, textAlign: "center", fontSize: 9, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>
                {c + 1}
              </div>
            </span>
          ))}
        </div>

        {/* Seat rows */}
        {Array.from({ length: rows }, (_, r) => {
          const hasRowAisle = aisleRows.find((a) => a.idx === r - 1);
          const segs = buildRowSegments(r);
          const rowLabel = getRowLabel(r);

          return (
            <span key={r} style={{ display: "contents" }}>
              {hasRowAisle && <div style={{ height: 12, flexShrink: 0, alignSelf: "stretch" }} />}

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 22, textAlign: "center", fontSize: 10, fontWeight: 700, color: "#9ca3af", flexShrink: 0 }}>
                  {rowLabel}
                </div>

                {segs.map((seg, si) => {
                  if (seg.type === "noSeatBlock") {
                    const colAisle = aisleCols.find((a) => a.idx === seg.startC - 1);
                    const blockWidth = seg.colSpan * 22 + (seg.colSpan - 1) * 4;
                    return (
                      <span key={si} style={{ display: "contents" }}>
                        {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                        <div
                          style={{
                            width: blockWidth,
                            height: 22,
                            flexShrink: 0,
                            borderRadius: 5,
                            background: seg.zone.color + "22",
                            border: `1.5px solid ${seg.zone.color}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {seg.zone.label && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: seg.zone.color,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                padding: "0 4px",
                              }}
                            >
                              {seg.zone.label}
                            </span>
                          )}
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
                  const col = zone ? zone.color : "#4a9edd";
                  const colAisle = aisleCols.find((a) => a.idx === c - 1);
                  const seatNumber = `${rowLabel}${c + 1}`;
                  const isAccessible = accessibleSeatSet?.has(seatNumber) || false;

                  let seatStyle = {
                    width: 26,
                    height: 26,
                    flexShrink: 0,
                    borderRadius: "6px 6px 4px 4px",
                    cursor: "default",
                    fontSize: 0,
                    border: "none",
                    outline: "none",
                    transition: "transform .1s",
                    position: "relative",
                  };

                  if (isAisle) {
                    seatStyle = { ...seatStyle, background: "transparent", visibility: "hidden" };
                  } else if (isBlocked) {
                    seatStyle = { ...seatStyle, background: "#1f2028", border: "1.5px solid #2a2a38", opacity: 0.5 };
                  } else if (isBooked) {
                    seatStyle = { 
                      ...seatStyle, 
                      background: "#dc2626", 
                      border: "2px solid #b91c1c", 
                      opacity: 0.85,
                      cursor: "not-allowed"
                    };
                  } else if (!isAccessible) {
                    seatStyle = { ...seatStyle, background: "#2a2a38", border: "1.5px solid #3a3a48", opacity: 0.35 };
                  } else if (isSel) {
                    seatStyle = { ...seatStyle, background: col, border: `2px solid #fff`, cursor: "pointer", transform: "scale(1.05)" };
                  } else {
                    seatStyle = { ...seatStyle, background: col + "28", border: `1.5px solid ${col}70`, cursor: "pointer" };
                  }

                  const seatTooltip = !isAisle && zone ? `${rowLabel}${c + 1} · ${zone.name} · ₹${Math.round(zone.basePrice * (zone.priceMultiplier || 1))}` : "";
                  const isSeatBooked = isBooked && !isAisle && !isBlocked;

                  return (
                    <span key={si} style={{ display: "contents" }}>
                      {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                      <button
                        style={seatStyle}
                        disabled={isAisle || isBlocked || isBooked || !isAccessible}
                        onClick={() => !isAisle && !isBlocked && !isBooked && isAccessible && onToggle(fullKey, zone)}
                        onMouseEnter={() => setHoveredSeat(seatNumber)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        title={seatTooltip}
                        className="relative group"
                      >
                        {isSeatBooked && (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            {hoveredSeat === seatNumber && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-700 text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg pointer-events-none">
                                BOOKED
                              </div>
                            )}
                          </>
                        )}
                      </button>
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
const CinemaBookingPreview = ({ theater, show, timing, accessibleSeats = [], onClose, onBookingSuccess }) => {
  const [selected, setSelected] = useState(new Set());
  const [bookingResponse, setBookingResponse] = useState(null);
  const [showTicket, setShowTicket] = useState(false);

  const accessibleSeatSet = useMemo(() => new Set(accessibleSeats || []), [accessibleSeats]);

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (response) => {
      toast.success(response.message || "Booking created successfully!");
      setBookingResponse(response.data);
      setShowTicket(true);
      onBookingSuccess?.(response.data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Booking failed");
    },
  });

  const allZones = useMemo(() => {
    if (!theater?.screens) return [];
    const seen = new Set();
    const result = [];
    theater.screens.forEach((screen) => {
      (screen.zones || []).forEach((z) => {
        const baseId = z.id?.replace(/_ground$|_balcony$/, "") || z.id;
        if (!seen.has(baseId)) {
          seen.add(baseId);
          result.push({ ...z, id: baseId });
        }
      });
    });
    return result;
  }, [theater]);

  const buildLevelData = useCallback(
    (levelName) => {
      if (!theater?.screens) return null;
      const screen = theater.screens.find((s) =>
        levelName === "balcony" 
          ? s.position === "top" || s.name?.toLowerCase().includes("balcony") 
          : s.position !== "top" && !s.name?.toLowerCase().includes("balcony")
      );
      if (!screen || !screen.zones?.length) return null;

      const meta = theater.layoutMeta || {};
      const isBalcony = levelName === "balcony";

      const seats = {};
      (screen.zones || []).forEach((z) => {
        const baseId = z.id?.replace(/_ground$|_balcony$/, "") || z.id;
        (z.rows || []).forEach((row) => {
          (row.seats || []).forEach((seat) => {
            const r = (seat.rowNumber || 1) - 1;
            const c = (seat.columnNumber || 1) - 1;
            seats[`${r}-${c}`] = {
              zone: baseId,
              isAvailable: seat.isAvailable,
              isBooked: seat.isBooked,
            };
          });
        });
      });

      const rows = screen.totalRows || (isBalcony ? meta.balconyRows : meta.groundRows) || 0;
      const cols = screen.totalColumns || (isBalcony ? meta.balconyCols : meta.groundCols) || 0;

      return {
        rows,
        cols,
        seats,
        aisleCols: (isBalcony ? meta.balconyAisleCols : meta.aisleCols) || [],
        aisleRows: (isBalcony ? meta.balconyAisleRows : meta.aisleRows) || [],
      };
    },
    [theater]
  );

  const groundData = buildLevelData("ground");
  const balconyData = buildLevelData("balcony");

  const toggleSeat = useCallback((fullKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(fullKey) ? next.delete(fullKey) : next.add(fullKey);
      return next;
    });
  }, []);

  const selectionInfo = useMemo(() => {
    let total = 0;
    const labels = [];
    const seatsPayload = [];
    selected.forEach((fk) => {
      const [level, k] = fk.split("::");
      const ld = level === "balcony" ? balconyData : groundData;
      if (!ld) return;
      const sd = ld.seats[k];
      const z = sd?.zone ? allZones.find((z) => z.id === sd.zone) : null;
      const p = z ? Math.round(z.basePrice * (z.priceMultiplier || 1)) : 150;
      total += p;
      const [r, c] = k.split("-").map(Number);
      const seatNumber = `${String.fromCharCode(65 + r)}${c + 1}`;
      labels.push(seatNumber);
      seatsPayload.push({
        seatNumber,
        rowName: String.fromCharCode(65 + r),
        category: z?.name || sd?.zone || "NORMAL",
        price: p,
      });
    });
    return { total, labels, count: selected.size, seatsPayload };
  }, [selected, groundData, balconyData, allZones]);

  const hasLayout = groundData || balconyData;

  const handleBooking = useCallback(() => {
    if (!show?._id) {
      toast.error("Show not found for booking");
      return;
    }
    if (!timing?._id && !show?.timings?.[0]?._id) {
      toast.error("Show timing not found");
      return;
    }
    if (selectionInfo.count === 0) {
      toast.error("Please select at least one accessible seat");
      return;
    }

    // Verify all selected seats are accessible
    const invalid = selectionInfo.labels.find((s) => !accessibleSeatSet.has(s));
    if (invalid) {
      toast.error(`You don't have access to seat ${invalid}`);
      return;
    }

    createBookingMutation.mutate({
      showId: show._id,
      timingId: timing?._id || show.timings?.[0]?._id,
      seats: selectionInfo.seatsPayload,
    });
  }, [accessibleSeatSet, createBookingMutation, selectionInfo, show, timing]);

  const handleCloseTicket = () => {
    setShowTicket(false);
    onClose();
  };

  const handleRedirect = () => {
    setShowTicket(false);
    onClose();
  };

  if (showTicket && bookingResponse) {
    return (
      <TicketModal
        booking={bookingResponse}
        show={show}
        theater={theater}
        onClose={handleCloseTicket}
        onRedirect={handleRedirect}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#0f0f16",
          borderBottom: "1px solid #1f1f2e",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg,#1a1a2e,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GiTheaterCurtains style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{show?.movie?.name || theater?.name}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                {show?.movie?.name ? `${theater?.name} · ` : ""}
                {show?.showDate ? new Date(show.showDate).toLocaleDateString() : ""} {show?.startTime || ""}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[
            { color: "#22c55e28", border: "#22c55e", label: "Your Seats" },
            { color: "#4a9edd28", border: "#4a9edd70", label: "Available" },
            { color: "#dc2626", border: "#b91c1c", label: "Booked" },
            { color: "#2a2a38", border: "#3a3a48", label: "No Access" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9ca3af" }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: l.color, border: `1.5px solid ${l.border}` }} />
              {l.label}
            </div>
          ))}
          <button
            onClick={onClose}
            style={{
              marginLeft: 8,
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#1f1f2e",
              border: "1px solid #2a2a38",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Scrollable seat area */}
      <div style={{ flex: 1, overflowY: "auto", background: "#0f0f16", padding: "0 24px 20px" }}>
        {/* Screen bar */}
        <div style={{ textAlign: "center", padding: "18px 0 10px" }}>
          <div
            style={{
              height: 3,
              maxWidth: 500,
              margin: "0 auto 6px",
              background: "linear-gradient(90deg,transparent,#e2c97e,transparent)",
              borderRadius: 2,
            }}
          />
          <div style={{ fontSize: 10, color: "#e2c97e", letterSpacing: "3px", fontWeight: 700 }}>
            SCREEN — ALL EYES THIS WAY
          </div>
        </div>

        {/* Access Info Banner */}
        <div style={{
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 12,
          padding: "12px 20px",
          marginBottom: 24,
          textAlign: "center"
        }}>
          <span style={{ color: "#22c55e", fontWeight: 600, fontSize: 14 }}>
            🎟️ You have access to {accessibleSeats?.length || 0} seats in this show
          </span>
        </div>

        {!hasLayout ? (
          <div style={{ textAlign: "center", paddingTop: 80, color: "#6b7280" }}>
            <MdEventSeat style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#4b5563" }}>No seat layout configured</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>This theater has no seat data stored yet.</div>
          </div>
        ) : (
          <>
            {groundData && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      padding: "3px 14px",
                      background: "#1a1a24",
                      borderRadius: 20,
                      border: "1px solid #2a2a38",
                    }}
                  >
                    Ground Floor
                  </span>
                </div>
                <CinemaSeatFloor
                  levelKey="ground"
                  zones={allZones}
                  seats={groundData.seats}
                  rows={groundData.rows}
                  cols={groundData.cols}
                  aisleCols={groundData.aisleCols}
                  aisleRows={groundData.aisleRows}
                  selected={selected}
                  onToggle={toggleSeat}
                  accessibleSeatSet={accessibleSeatSet}
                />
              </div>
            )}

            {balconyData && (
              <>
                <div
                  style={{
                    maxWidth: 500,
                    margin: "0 auto 16px",
                    borderTop: "1px dashed #2a2a38",
                    position: "relative",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      padding: "3px 14px",
                      background: "#0f0f16",
                      borderRadius: 20,
                      border: "1px solid #2a2a38",
                    }}
                  >
                    Balcony
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <CinemaSeatFloor
                    levelKey="balcony"
                    zones={allZones}
                    seats={balconyData.seats}
                    rows={balconyData.rows}
                    cols={balconyData.cols}
                    aisleCols={balconyData.aisleCols}
                    aisleRows={balconyData.aisleRows}
                    selected={selected}
                    onToggle={toggleSeat}
                    accessibleSeatSet={accessibleSeatSet}
                  />
                </div>
              </>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24 }}>
              {allZones.map((z) => {
                const price = Math.round((z.basePrice || 0) * (z.priceMultiplier || 1));
                return (
                  <div
                    key={z.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: z.color + "18",
                      border: `1px solid ${z.color}44`,
                      color: z.color,
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: z.color, display: "inline-block" }} />
                    {z.name}
                    &nbsp;
                    <strong style={{ color: "#fff" }}>{price === 0 ? "FREE" : `₹${price}`}</strong>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom panel with booking button */}
      <div
        style={{
          background: "#0f0f16",
          borderTop: "1px solid #1f1f2e",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em" }}>Selected Seats</div>
          <div style={{ fontSize: 13, color: "#e5e7eb" }}>
            {selectionInfo.count === 0 ? (
              <span style={{ color: "#4b5563" }}>Click on green/blue seats above to select</span>
            ) : (
              <>
                <span style={{ color: "#e2c97e", fontWeight: 700 }}>
                  {selectionInfo.labels.slice(0, 6).join(", ")}
                  {selectionInfo.labels.length > 6 ? ` +${selectionInfo.labels.length - 6} more` : ""}
                </span>
                &nbsp;·&nbsp;
                <span style={{ color: "#fff", fontWeight: 700 }}>₹{selectionInfo.total.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setSelected(new Set())}
            disabled={selectionInfo.count === 0}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #2a2a38",
              background: "#1a1a24",
              color: "#9ca3af",
              cursor: selectionInfo.count === 0 ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 600,
              opacity: selectionInfo.count === 0 ? 0.5 : 1,
            }}
          >
            Clear
          </button>
          <button
            onClick={handleBooking}
            disabled={selectionInfo.count === 0 || createBookingMutation.isPending}
            style={{
              padding: "10px 28px",
              borderRadius: 8,
              border: "none",
              background: selectionInfo.count === 0 ? "#2a2a38" : "#e2c97e",
              color: selectionInfo.count === 0 ? "#6b7280" : "#0f0f16",
              cursor: selectionInfo.count === 0 ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 700,
              transition: "opacity .15s",
            }}
          >
            {createBookingMutation.isPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              `Book ${selectionInfo.count} Seat${selectionInfo.count !== 1 ? "s" : ""} · ₹${selectionInfo.total.toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== SHOW CARD ====================
const ShowCard = ({ show, onBookTicket, accessibleCount = 0 }) => {
  const formatDate = (date) => {
    if (!date) return 'Date TBD';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const firstTiming = show.timings?.[0] || show;
  const showDate = firstTiming.showDate || show.showDate;
  const startTime = firstTiming.startTime || show.startTime;

  return (
    <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      
      <div className="relative h-48 bg-gradient-to-r from-purple-600 to-indigo-600">
        {show.movie?.poster ? (
          <img src={show.movie.poster} alt={show.movie.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdLocalMovies className="text-6xl text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {show.movie?.rating > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-white text-xs font-medium">{show.movie.rating}</span>
          </div>
        )}
        
        {accessibleCount > 0 && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-green-500/80 backdrop-blur-sm">
            <span className="text-white text-xs font-semibold">🎟️ {accessibleCount} seats accessible</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-1" style={{ color: "var(--foreground)" }}>
          {show.movie?.name}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--background)", color: "var(--foreground)", opacity: 0.7 }}>
            {show.movie?.genre}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaLanguage size={10} /> {show.movie?.language}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaClock size={10} /> {show.movie?.duration}m
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            <FaCalendarAlt className="text-purple-400" />
            <span className="text-sm">{formatDate(showDate)}</span>
            <FaClock className="text-purple-400 ml-2" />
            <span className="text-sm">{startTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              <GiTheater className="text-purple-400" />
              <span className="text-sm">Screen {show.screenNumber}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--background)" }}>
            <span className="text-sm opacity-60">Starting from</span>
            <span className="text-xl font-bold text-green-500">₹{show.basePrice || 150}</span>
          </div>
        </div>

        <button
          onClick={() => onBookTicket(show)}
          disabled={accessibleCount === 0}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaTicketAlt />
          {accessibleCount > 0 ? `Book Tickets (${accessibleCount})` : 'No seats assigned'}
        </button>
      </div>
    </div>
  );
};

// ==================== STYLES ====================
const MODAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  .tm-overlay{
    position:fixed;inset:0;z-index:1000;
    background:rgba(0,0,0,.78);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;padding:16px;
    animation:tm-in .2s ease;
  }
  @keyframes tm-in{from{opacity:0}to{opacity:1}}
  .tm-wrap{display:flex;flex-direction:column;gap:14px;max-width:580px;width:100%;animation:tm-up .28s cubic-bezier(.22,1,.36,1);}
  @keyframes tm-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

  /* Header */
  .tm-header{display:flex;align-items:center;justify-content:space-between;}
  .tm-header-l{display:flex;align-items:center;gap:10px;}
  .tm-title{font-family:'Poppins',sans-serif;font-size:17px;font-weight:700;color:#fff;margin:0;}
  .tm-counter{font-size:11px;font-weight:600;color:rgba(255,255,255,.4);background:rgba(255,255,255,.08);padding:3px 9px;border-radius:12px;}
  .tm-x{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.09);border:none;color:rgba(255,255,255,.6);cursor:pointer;transition:background .16s;}
  .tm-x:hover{background:rgba(255,255,255,.18);color:#fff;}

  /* Carousel */
  .tm-carousel{display:flex;align-items:center;gap:8px;}
  .tm-nav{
    flex-shrink:0;width:34px;height:34px;border-radius:50%;
    background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);
    color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all .16s;
  }
  .tm-nav:hover:not(:disabled){background:rgba(255,255,255,.2);}
  .tm-nav:disabled{opacity:.25;cursor:not-allowed;}

  /* Dots */
  .tm-dots{display:flex;justify-content:center;gap:5px;}
  .tm-dot{width:7px;height:7px;border-radius:50%;border:none;background:rgba(255,255,255,.22);cursor:pointer;padding:0;transition:all .16s;}
  .tm-dot--on{background:#fff;width:18px;border-radius:4px;}

  /* Actions */
  .tm-actions{display:flex;gap:8px;flex-wrap:wrap;}
  .tm-btn-primary{
    flex:1;min-width:130px;display:inline-flex;align-items:center;justify-content:center;gap:7px;
    padding:11px 14px;border-radius:10px;font-size:13px;font-weight:700;
    color:#000;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;cursor:pointer;
    transition:all .2s;font-family:'Poppins',sans-serif;
    box-shadow:0 3px 14px rgba(212,175,55,.3);
  }
  .tm-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(212,175,55,.45);}
  .tm-btn-secondary{
    flex:1;min-width:130px;display:inline-flex;align-items:center;justify-content:center;gap:7px;
    padding:11px 14px;border-radius:10px;font-size:13px;font-weight:700;
    color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);
    cursor:pointer;transition:all .2s;font-family:'Poppins',sans-serif;
  }
  .tm-btn-secondary:hover{background:rgba(255,255,255,.2);transform:translateY(-1px);}
  .tm-btn-ghost{
    display:inline-flex;align-items:center;justify-content:center;gap:7px;
    padding:11px 14px;border-radius:10px;font-size:12px;font-weight:600;
    color:rgba(255,255,255,.45);background:transparent;border:1px solid rgba(255,255,255,.1);
    cursor:pointer;transition:all .2s;font-family:'Poppins',sans-serif;
  }
  .tm-btn-ghost:hover{color:rgba(255,255,255,.7);}

  /* ── Single Ticket Styles inside Modal ── */
  .st-ticket{
    display:flex;background:#fff;border-radius:16px;
    overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.55);
    width:100%;font-family:'Poppins',sans-serif;flex:1;
  }

  .st-left{flex:1.5;padding:22px 18px;display:flex;flex-direction:column;}
  .st-movie{font-size:19px;font-weight:800;color:#111;letter-spacing:-.02em;text-transform:uppercase;line-height:1.1;margin-bottom:8px;}
  .st-cat{
    display:inline-flex;align-items:center;padding:3px 11px;border-radius:20px;
    background:rgba(220,38,38,.1);color:#dc2626;
    font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    width:fit-content;margin-bottom:10px;
  }
  .st-sep{width:100%;height:1px;background:rgba(0,0,0,.07);margin:8px 0;}
  .st-row{display:flex;align-items:flex-start;gap:9px;padding:4px 0;}
  .st-ico{font-size:12px;width:16px;flex-shrink:0;margin-top:1px;}
  .st-lbl{font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#bbb;margin-bottom:2px;}
  .st-val{font-size:12px;font-weight:700;color:#111;line-height:1.3;}
  .st-sub{font-size:10px;color:#999;margin-top:1px;}
  .st-footer{display:flex;gap:10px;margin-top:4px;align-items:flex-end;}
  .st-box-wrap{display:flex;flex-direction:column;gap:4px;}
  .st-box-lbl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#bbb;}
  .st-box{
    width:44px;height:44px;border-radius:8px;
    background:#f3f3f3;display:flex;align-items:center;justify-content:center;
    font-size:18px;font-weight:800;color:#111;
    font-family:'JetBrains Mono',monospace;
  }
  .st-price{font-size:17px;font-weight:800;color:#dc2626;padding-bottom:3px;}

  /* Perforation */
  .st-perf{display:flex;flex-direction:column;align-items:center;position:relative;width:14px;flex-shrink:0;}
  .st-perf-dot{width:17px;height:17px;border-radius:50%;background:rgba(0,0,0,.07);position:absolute;left:50%;transform:translateX(-50%);z-index:2;}
  .st-perf-dot--t{top:-8px;}
  .st-perf-dot--b{bottom:-8px;}
  .st-perf-line{
    position:absolute;top:0;bottom:0;left:50%;transform:translateX(-50%);width:1px;
    background:repeating-linear-gradient(to bottom,rgba(0,0,0,.12) 0,rgba(0,0,0,.12) 5px,transparent 5px,transparent 10px);
  }

  /* Right stub */
  .st-right{
    width:136px;flex-shrink:0;
    background:#fafafa;border-left:1px dashed rgba(0,0,0,.1);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:12px;padding:18px 10px;position:relative;
  }
  .st-bkid{
    writing-mode:vertical-rl;transform:rotate(180deg);
    font-size:7px;font-weight:600;letter-spacing:.1em;
    color:#ccc;text-transform:uppercase;
    font-family:'JetBrains Mono',monospace;
    position:absolute;right:7px;top:50%;
    transform:rotate(180deg) translateY(50%);
  }
  .st-qr-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;}
  .st-qr{width:88px;height:88px;background:#fff;border-radius:8px;border:1px solid rgba(0,0,0,.07);display:flex;align-items:center;justify-content:center;padding:7px;}
  .st-qr img{width:100%;height:100%;object-fit:contain;}
  .st-scan{font-size:7px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#bbb;}
  .st-circle{
    width:46px;height:46px;border-radius:50%;
    background:#dc2626;color:#fff;
    font-size:13px;font-weight:800;
    display:flex;align-items:center;justify-content:center;
    font-family:'JetBrains Mono',monospace;
    box-shadow:0 4px 12px rgba(220,38,38,.3);
    letter-spacing:-.02em;
  }

  @media(max-width:500px){
    .st-ticket{flex-direction:column;}
    .st-right{width:100%;flex-direction:row;justify-content:space-around;border-left:none;border-top:1px dashed rgba(0,0,0,.1);padding:14px;}
    .st-bkid{writing-mode:horizontal-tb;transform:none;position:static;}
    .st-qr{width:70px;height:70px;}
  }
`;

// ==================== MAIN PAGE ====================
const ShowsPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedTiming, setSelectedTiming] = useState(null);
  const [selectedAccessibleSeats, setSelectedAccessibleSeats] = useState([]);
  const [showCinemaPreview, setShowCinemaPreview] = useState(false);
  const [userAccessibleSeats, setUserAccessibleSeats] = useState([]);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load user profile and accessible seats
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMe();
        const seats = res.data?.accessibleSeats || [];
        setUserAccessibleSeats(seats);
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setProfileLoaded(true);
      }
    };
    loadProfile();
  }, []);

  // Get accessible seats for a theater
  const getAccessibleSeatsForTheater = (theaterId) => {
    if (!theaterId || !userAccessibleSeats.length) return [];
    const theaterIdStr = theaterId?._id || theaterId;
    
    for (const access of userAccessibleSeats) {
      const accessTheaterId = access.theaterId?.$oid || access.theaterId;
      if (accessTheaterId === theaterIdStr || accessTheaterId?.toString() === theaterIdStr?.toString()) {
        if (access.isActive !== false && access.seatNumbers?.length) {
          return access.seatNumbers;
        }
      }
    }
    return [];
  };

  // Fetch shows
  const { data: showsData, isLoading, refetch } = useQuery({
    queryKey: ['public-shows'],
    queryFn: getPublicShows,
    enabled: profileLoaded,
  });

  const allShows = showsData?.data || [];
  
  const shows = useMemo(() => {
    return allShows.filter(show => {
      const theaterId = show.theaterId?._id || show.theaterId;
      return getAccessibleSeatsForTheater(theaterId).length > 0;
    });
  }, [allShows, userAccessibleSeats]);

  const handleBookTicket = async (show) => {
    const theaterId = show.theaterId?._id || show.theaterId;
    const accessible = getAccessibleSeatsForTheater(theaterId);
    
    if (accessible.length === 0) {
      toast.error('No seats assigned for this theater. Contact admin.');
      return;
    }

    const firstTiming = show.timings?.[0] || show;
    setSelectedTiming(firstTiming);
    setSelectedAccessibleSeats(accessible);
    setSelectedShow(show);
    
    // Fetch theater details and open preview
    try {
      const res = await getTheaterByIdAdmin(theaterId);
      setPreviewTheater(res.data);
      setShowCinemaPreview(true);
    } catch (err) {
      toast.error("Failed to load theater layout");
    }
  };

  const [previewTheater, setPreviewTheater] = useState(null);

  const handleBookingSuccess = (bookingData) => {
    // Invalidate queries to refresh data
    refetch();
    queryClient.invalidateQueries(['my-bookings']);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: "var(--background)" }}>
      
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          Book Your Tickets
        </h1>
        <p className="text-sm mt-2 opacity-60" style={{ color: "var(--foreground)" }}>
          Select a movie and choose from your accessible seats
        </p>
      </div>

      {!profileLoaded || isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-purple-500 mb-4" />
          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Loading shows...</p>
        </div>
      ) : shows.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--card)" }}>
            <MdLocalMovies className="text-5xl text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>No Shows Available</h3>
          <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
            {userAccessibleSeats.length === 0
              ? 'No seats assigned to your account yet. Ask admin to assign seats.'
              : 'No shows found for theaters where you have assigned seats.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shows.map((show) => {
            const theaterId = show.theaterId?._id || show.theaterId;
            const accessible = getAccessibleSeatsForTheater(theaterId);
            return (
              <ShowCard
                key={show._id}
                show={show}
                onBookTicket={handleBookTicket}
                accessibleCount={accessible.length}
              />
            );
          })}
        </div>
      )}

      {/* Cinema Booking Preview Modal */}
      {showCinemaPreview && previewTheater && (
        <CinemaBookingPreview
          theater={previewTheater}
          show={selectedShow}
          timing={selectedTiming}
          accessibleSeats={selectedAccessibleSeats}
          onClose={() => {
            setShowCinemaPreview(false);
            setPreviewTheater(null);
            setSelectedShow(null);
            setSelectedTiming(null);
            setSelectedAccessibleSeats([]);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ShowsPage;