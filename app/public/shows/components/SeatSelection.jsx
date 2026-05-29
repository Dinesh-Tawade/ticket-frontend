"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailableSeats, createBooking, confirmPayment, getTheaterProducts
} from "@/app/services/publicCommunication";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FaArrowLeft, FaCreditCard, FaTicketAlt, FaTimes, FaCheck,
  FaPlus, FaMinus, FaHamburger, FaSpinner,
} from "react-icons/fa";
import AuthModal from "@/app/components/public/AuthModal";

// ─── helpers ──────────────────────────────────────────────────────────────────
const seatKey = (r, c) => `${r}-${c}`;

/**
 * Builds a flat { "r-c": { zone, booked, isAvailable } } seat map
 * from a single screen object (theater.screens[i]).
 */
function buildSeatMap(screen, bookedSet) {
  const map = {};
  (screen?.zones || []).forEach((zone) => {
    if (zone.noSeat) return;
    (zone.rows || []).forEach((row) => {
      (row.seats || []).forEach((seat) => {
        const r = (seat.rowNumber || 1) - 1;
        const c = (seat.columnNumber || 1) - 1;
        const k = seatKey(r, c);
        const isBooked = bookedSet.has(seat.seatId) || !seat.isAvailable || seat.isBooked;
        map[k] = {
          zone:        zone.id,
          seatId:      seat.seatId,
          seatNumber:  seat.seatNumber,
          seatLabel:   seat.seatLabel,
          rowNumber:   seat.rowNumber,
          colNumber:   seat.columnNumber,
          booked:      isBooked,
          isAvailable: !isBooked,
        };
      });
    });
  });
  return map;
}

// ─── CinemaSeatFloor ─────────────────────────────────────────────────────────
/**
 * Identical visual to the admin CinemaSeatFloor, but interactive for booking.
 */
const CinemaSeatFloor = ({
  levelKey, zones, seats, rows, cols,
  aisleCols = [], aisleRows = [],
  selected, onToggle,
}) => {
  const [hovered, setHovered] = useState(null);
  const getRowLabel = (r) => String.fromCharCode(65 + r);
  const getZone     = (id) => zones.find((z) => z.id === id);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{
        display: "flex", flexDirection: "column", gap: 4,
        alignItems: "center", minWidth: "max-content", padding: "0 8px 8px",
      }}>
        {/* Column number header */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 22, flexShrink: 0 }} />
          {Array.from({ length: cols }, (_, c) => (
            <span key={c} style={{ display: "contents" }}>
              {aisleCols.find((a) => a.idx === c - 1) && (
                <div style={{ width: 14, flexShrink: 0 }} />
              )}
              <div style={{
                width: 22, textAlign: "center", fontSize: 9,
                color: "#6b7280", fontWeight: 600, flexShrink: 0,
              }}>
                {c + 1}
              </div>
            </span>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }, (_, r) => {
          const hasRowAisle = aisleRows.find((a) => a.idx === r - 1);
          return (
            <span key={r} style={{ display: "contents" }}>
              {hasRowAisle && (
                <div style={{ height: 14, flexShrink: 0, alignSelf: "stretch" }} />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {/* Row label */}
                <div style={{
                  width: 22, textAlign: "center", fontSize: 10,
                  fontWeight: 700, color: "#9ca3af", flexShrink: 0,
                }}>
                  {getRowLabel(r)}
                </div>

                {Array.from({ length: cols }, (_, c) => {
                  const k        = seatKey(r, c);
                  const fullKey  = `${levelKey}::${k}`;
                  const sd       = seats[k];
                  const zone     = sd?.zone ? getZone(sd.zone) : null;
                  const isEmpty  = !sd;
                  const isBooked = sd?.booked;
                  const isSel    = selected.has(fullKey);
                  const col      = zone?.color ?? "#4a9edd";
                  const colAisle = aisleCols.find((a) => a.idx === c - 1);

                  let style = {
                    width: 22, height: 22, flexShrink: 0,
                    borderRadius: "5px 5px 3px 3px",
                    cursor: "default",
                    fontSize: 0,
                    border: "none",
                    outline: "none",
                    transition: "transform .12s, box-shadow .12s",
                    position: "relative",
                  };

                  if (isEmpty) {
                    style = { ...style, background: "transparent", visibility: "hidden" };
                  } else if (isBooked) {
                    style = {
                      ...style,
                      background: col + "28",
                      border: `1.5px solid ${col}40`,
                      opacity: 0.35,
                    };
                  } else if (isSel) {
                    style = {
                      ...style,
                      background: col,
                      border: "2px solid #fff",
                      cursor: "pointer",
                      transform: "scale(1.18) translateY(-2px)",
                      boxShadow: `0 4px 14px ${col}60`,
                    };
                  } else {
                    style = {
                      ...style,
                      background: hovered === fullKey ? col + "55" : col + "22",
                      border: `1.5px solid ${col}${hovered === fullKey ? "aa" : "60"}`,
                      cursor: "pointer",
                      transform: hovered === fullKey ? "translateY(-1px)" : "none",
                    };
                  }

                  return (
                    <span key={c} style={{ display: "contents" }}>
                      {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                      <button
                        style={style}
                        disabled={isEmpty || isBooked}
                        onClick={() => !isEmpty && !isBooked && onToggle(fullKey, zone, sd, r, c)}
                        onMouseEnter={() => !isEmpty && !isBooked && setHovered(fullKey)}
                        onMouseLeave={() => setHovered(null)}
                        title={
                          !isEmpty && zone
                            ? `${getRowLabel(r)}${c + 1} · ${zone.name}${zone.basePrice > 0 ? ` · ₹${zone.basePrice}` : " · FREE"}`
                            : ""
                        }
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

// ─── Main SeatSelection Component ────────────────────────────────────────────
function SeatSelection({ showId, showDetails, onBack, onNeedLogin, onSeatsSelected }) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState([]); // [{ fullKey, zone, sd, levelKey, r, c }]
  const [bookingData, setBookingData]     = useState(null);
  const [timeLeft, setTimeLeft]           = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [cart, setCart]                   = useState({});
  const selected = useMemo(() => new Set(selectedSeats.map((s) => s.fullKey)), [selectedSeats]);

  // ── API: seat availability ──
  const { data: seatData, isLoading, error } = useQuery({
    queryKey: ["seats", showId],
    queryFn:  () => getAvailableSeats(showId),
    enabled:  !!showId,
  });

  // ── API: food products ──
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["theater-products", showDetails?.theaterId?._id],
    queryFn:  () => getTheaterProducts(showDetails?.theaterId?._id),
    enabled:  !!showDetails?.theaterId?._id && showFoodModal,
  });

  // ── Mutations ──
  const createBookingMutation = useMutation({
    mutationFn: (payload) => createBooking({ showId, ...payload }),
    onSuccess: (data) => {
      setBookingData(data.data);
      setShowFoodModal(false);
      if (data.data.paymentStatus === "FREE") router.push("/public/my-bookings");
      if (onSeatsSelected) onSeatsSelected(selectedSeats, data.data);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Booking failed. Please try again.");
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (bookingId) => confirmPayment(bookingId),
    onSuccess: () => router.push("/public/my-bookings"),
    onError: (err) => {
      alert(err.response?.data?.message || "Payment failed. Please try again.");
    },
  });

  // ── Countdown timer ──
  useEffect(() => {
    if (!bookingData?.expiresAt || bookingData.paymentStatus !== "PENDING") return;
    const interval = setInterval(() => {
      const diff = new Date(bookingData.expiresAt) - new Date();
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        alert("Booking time expired! Please book again.");
        router.push("/public/shows");
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [bookingData, router]);

  // ── Build level data ──────────────────────────────────────────────────────
  /**
   * The API seatData.data.seatMap is the OLD format. We'll use
   * showDetails.theaterId (the full theater object) for structure,
   * and merge seatData to mark which seats are booked.
   *
   * If seatData has a flat `bookedSeatIds` array, we use that.
   * Otherwise we derive it from the old seatMap format.
   */
  const theater = showDetails?.theaterId;

  const bookedSeatIds = useMemo(() => {
    const set = new Set();
    const raw = seatData?.data;
    if (!raw) return set;
    // New format: raw.bookedSeatIds = ["seatId1", ...]
    if (Array.isArray(raw.bookedSeatIds)) {
      raw.bookedSeatIds.forEach((id) => set.add(id));
    }
    // Old seatMap format: traverse and mark booked
    if (raw.seatMap) {
      Object.values(raw.seatMap).forEach((rowMap) => {
        if (typeof rowMap === "object") {
          Object.values(rowMap).forEach((seats) => {
            if (Array.isArray(seats)) {
              seats.forEach((s) => { if (s.isBooked) set.add(s.seatId || `${s.rowName}-${s.seatNumber}`); });
            }
          });
        }
      });
    }
    return set;
  }, [seatData]);

  const buildLevel = useCallback((levelName) => {
    if (!theater?.screens) return null;
    const screen = theater.screens.find((s) =>
      levelName === "balcony"
        ? s.position === "top" || s.name?.toLowerCase().includes("balcony")
        : s.position !== "top" && !s.name?.toLowerCase().includes("balcony")
    );
    if (!screen || !screen.zones?.length) return null;

    const seats = buildSeatMap(screen, bookedSeatIds);
    const meta  = theater.layoutMeta || {};
    const isBalcony = levelName === "balcony";

    return {
      rows:      screen.totalRows    || 13,
      cols:      screen.totalColumns || 14,
      seats,
      aisleCols: (isBalcony ? meta.balconyAisleCols : meta.aisleCols) || [],
      aisleRows:  (isBalcony ? meta.balconyAisleRows : meta.aisleRows)  || [],
    };
  }, [theater, bookedSeatIds]);

  const groundData  = useMemo(() => buildLevel("ground"),  [buildLevel]);
  const balconyData = useMemo(() => buildLevel("balcony"), [buildLevel]);
  const hasLayout   = groundData || balconyData;

  // ── Zones (deduped from all screens) ──
  const allZones = useMemo(() => {
    if (!theater?.screens) return [];
    const seen = new Set();
    const result = [];
    theater.screens.forEach((screen) => {
      (screen.zones || []).forEach((z) => {
        if (!seen.has(z.id)) { seen.add(z.id); result.push(z); }
      });
    });
    return result;
  }, [theater]);

  // ── Seat toggle ──
  const toggleSeat = useCallback((fullKey, zone, sd, r, c) => {
    const levelKey = fullKey.split("::")[0];
    setSelectedSeats((prev) => {
      if (prev.some((s) => s.fullKey === fullKey)) {
        return prev.filter((s) => s.fullKey !== fullKey);
      }
      if (prev.length >= 10) { alert("Maximum 10 seats per booking"); return prev; }
      return [...prev, { fullKey, zone, sd, levelKey, r, c }];
    });
  }, []);

  // ── Booking ──
  const handleInitialProceed = () => {
    if (selectedSeats.length === 0) { alert("Please select at least one seat"); return; }
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      if (onNeedLogin) onNeedLogin();
      else setShowAuthModal(true);
      return;
    }
    setShowFoodModal(true);
  };

  const handleFinalBooking = () => {
    const formattedSeats = selectedSeats.map((s) => ({
      rowName:    s.sd?.seatLabel?.replace(/\d+$/, "") || String.fromCharCode(65 + s.r),
      seatNumber: s.sd?.seatNumber || `${String.fromCharCode(65 + s.r)}${s.c + 1}`,
    }));
    const snacksPayload = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({ productId: id, quantity }));
    createBookingMutation.mutate({ seats: formattedSeats, snacks: snacksPayload });
  };

  // ── Cart ──
  const updateCart = (id, delta) => {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  const seatsTotal = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + (s.zone?.basePrice || 0), 0),
    [selectedSeats]
  );
  const allProducts = useMemo(() => {
    if (!productsData?.data?.products) return [];
    return Object.values(productsData.data.products).flat();
  }, [productsData]);
  const foodTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = allProducts.find((x) => x._id === id);
      return sum + (p ? (p.discountPrice || p.price) * qty : 0);
    }, 0);
  }, [cart, allProducts]);
  const grandTotal = seatsTotal + foodTotal;
  const isUrgent = timeLeft && parseInt(timeLeft.split(":")[0]) < 5;

  // ── Payment pending screen ──────────────────────────────────────────────
  if (bookingData?.paymentStatus === "PENDING") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(6px)", padding: 16,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}>
        <div style={{
          width: "100%", maxWidth: 420, borderRadius: 28,
          border: "1px solid rgba(212,175,55,0.3)",
          background: "var(--card,#1a1a2e)",
          padding: 36, display: "flex", flexDirection: "column", alignItems: "center",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg,#d4af37,#b8860b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", marginBottom: 20, boxShadow: "0 8px 24px rgba(212,175,55,0.4)",
          }}>
            <FaCreditCard size={26} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 6 }}>Complete Payment</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 24 }}>
            Seats reserved. Complete payment before time runs out.
          </p>

          {/* Timer */}
          <div style={{
            width: "100%", borderRadius: 18, padding: "18px 0", textAlign: "center", marginBottom: 24,
            background: isUrgent ? "rgba(239,68,68,0.1)" : "rgba(212,175,55,0.1)",
            border: `1px solid ${isUrgent ? "rgba(239,68,68,0.3)" : "rgba(212,175,55,0.25)"}`,
          }}>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase" }}>
              Time Remaining
            </p>
            <p style={{ fontFamily: "monospace", fontSize: 44, fontWeight: 800, color: isUrgent ? "#ef4444" : "#d4af37", lineHeight: 1 }}>
              {timeLeft || "14:59"}
            </p>
          </div>

          <div style={{ width: "100%", fontSize: 14, color: "#fff", marginBottom: 24 }}>
            {[
              { label: "Booking ID", value: <span style={{ fontFamily: "monospace", fontSize: 12 }}>{bookingData.bookingId}</span> },
              { label: "Seats",      value: `${selectedSeats.length} seat(s)` },
              { label: "Total",      value: <span style={{ fontSize: 22, fontWeight: 800, color: "#d4af37" }}>₹{bookingData.totalAmount}</span> },
            ].map(({ label, value }, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}>
                <span style={{ opacity: 0.5 }}>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button
              style={{
                flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
                padding: "14px 0", borderRadius: 14, fontWeight: 800, fontSize: 15,
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "#fff", border: "none", cursor: confirmPaymentMutation.isPending ? "not-allowed" : "pointer",
                opacity: confirmPaymentMutation.isPending ? 0.5 : 1,
                boxShadow: "0 4px 16px rgba(34,197,94,0.35)",
              }}
              onClick={() => confirmPaymentMutation.mutate(bookingData.bookingId)}
              disabled={confirmPaymentMutation.isPending}
            >
              <FaCheck /> {confirmPaymentMutation.isPending ? "Processing…" : `Pay ₹${bookingData.totalAmount}`}
            </button>
            <button
              style={{
                padding: "14px 18px", borderRadius: 14, fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}
              onClick={() => router.push("/public/shows")}
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid rgba(212,175,55,0.2)", borderTopColor: "#d4af37",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
          Loading theater layout…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ textAlign: "center", padding: 40, borderRadius: 20, border: "1px solid rgba(239,68,68,0.2)", background: "var(--card,#1a1a2e)" }}>
          <FaTimes style={{ fontSize: 40, color: "#ef4444", marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: "#fff", marginBottom: 20 }}>Failed to load seating layout</p>
          <button
            style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "none", color: "#d4af37", cursor: "pointer", fontWeight: 600 }}
            onClick={onBack}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Main booking UI ────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a12",
      fontFamily: "'Segoe UI',system-ui,sans-serif",
      color: "#fff", paddingBottom: 120,
    }}>
      <style>{`
        @keyframes pop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes slide-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(10,10,18,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={onBack}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <FaArrowLeft size={11} /> Back
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontWeight: 800, fontSize: 17, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {showDetails?.movie?.name}
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, marginTop: 2 }}>
              {showDetails?.theaterId?.name}
              {showDetails?.startTime && ` · ${showDetails.startTime}`}
            </p>
          </div>
          {selectedSeats.length > 0 && (
            <div style={{
              padding: "6px 14px", borderRadius: 20,
              background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)",
              color: "#f4d03f", fontSize: 12, fontWeight: 800,
              animation: "pop .3s ease-out",
            }}>
              {selectedSeats.length} Selected
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Screen bar ── */}
        <div style={{ textAlign: "center", padding: "28px 0 16px" }}>
          <div style={{ position: "relative", maxWidth: 560, margin: "0 auto 8px", height: 52 }}>
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: "60% / 100% 100% 0 0",
              background: "radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.18) 0%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.85),transparent)",
              borderRadius: 2,
              boxShadow: "0 0 22px rgba(212,175,55,0.35)",
            }} />
            <p style={{
              position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
              fontSize: 10, letterSpacing: "0.45em", fontWeight: 700,
              color: "rgba(255,255,255,0.25)", textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              SCREEN · ALL EYES THIS WAY
            </p>
          </div>
        </div>

        {!hasLayout ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>No seat layout configured</div>
            <div style={{ fontSize: 12, marginTop: 6, color: "rgba(255,255,255,0.25)" }}>This theater has no seat data stored yet.</div>
          </div>
        ) : (
          <>
            {/* Ground floor */}
            {groundData && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)",
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    padding: "4px 16px", background: "rgba(255,255,255,0.05)",
                    borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
                  }}>
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
                />
              </div>
            )}

            {/* Balcony */}
            {balconyData && (
              <>
                <div style={{
                  maxWidth: 500, margin: "0 auto 20px",
                  borderTop: "1px dashed rgba(255,255,255,0.08)",
                  position: "relative", textAlign: "center",
                }}>
                  <span style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)",
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    padding: "3px 16px", background: "#0a0a12",
                    borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    Balcony
                  </span>
                </div>
                <div style={{ marginTop: 14, marginBottom: 32 }}>
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
                  />
                </div>
              </>
            )}

            {/* ── Zone Legend ── */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8,
              justifyContent: "center", marginTop: 20,
            }}>
              {allZones.filter((z) => !z.noSeat).map((z) => (
                <div key={z.id} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: z.color + "18", border: `1px solid ${z.color}44`,
                  color: z.color,
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: z.color, display: "inline-block" }} />
                  {z.name}
                  &nbsp;
                  <strong style={{ color: "#fff" }}>
                    {(z.basePrice ?? 0) === 0 ? "FREE" : `₹${z.basePrice}`}
                  </strong>
                </div>
              ))}
              {/* No-seat label zones */}
              {allZones.filter((z) => z.noSeat).map((z) => (
                <div key={z.id} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: z.color + "18", border: `1px solid ${z.color}44`,
                  color: z.color,
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: z.color, display: "inline-block" }} />
                  {z.name}
                  &nbsp;
                  <span style={{ fontSize: 9, fontWeight: 700, background: z.color + "33", padding: "1px 5px", borderRadius: 3 }}>
                    {z.label || "AREA"}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Seat state legend ── */}
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20,
              marginTop: 20, padding: "14px 20px", borderRadius: 14,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {[
                { color: "rgba(74,158,221,0.22)", border: "rgba(74,158,221,0.6)", label: "Available" },
                { color: "#d4af37",               border: "#fff",                 label: "Selected"  },
                { color: "rgba(74,158,221,0.1)",  border: "rgba(74,158,221,0.2)", label: "Booked",   opacity: 0.35 },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  <div style={{
                    width: 20, height: 20,
                    borderRadius: "5px 5px 3px 3px",
                    background: l.color,
                    border: `1.5px solid ${l.border}`,
                    opacity: l.opacity || 1,
                  }} />
                  {l.label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Floating bottom bar ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
        background: "rgba(10,10,18,0.97)", borderTop: "1px solid rgba(212,175,55,0.2)",
        backdropFilter: "blur(20px)",
        transform: selectedSeats.length > 0 ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>
              {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""} Selected
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 26, overflow: "hidden" }}>
              {selectedSeats.slice(0, 6).map((s) => (
                <span key={s.fullKey} style={{
                  padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                  fontFamily: "monospace",
                  color: s.zone?.color || "#d4af37",
                  background: (s.zone?.color || "#d4af37") + "18",
                  border: `1px solid ${(s.zone?.color || "#d4af37")}40`,
                }}>
                  {s.sd?.seatLabel || `${String.fromCharCode(65 + s.r)}${s.c + 1}`}
                </span>
              ))}
              {selectedSeats.length > 6 && (
                <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  +{selectedSeats.length - 6}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase" }}>Total</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#d4af37", margin: 0 }}>
              {seatsTotal === 0 ? "FREE" : `₹${seatsTotal}`}
            </p>
          </div>
          <button
            onClick={handleInitialProceed}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "14px 24px", borderRadius: 14,
              background: "linear-gradient(135deg,#d4af37,#b8860b)",
              color: "#000", fontWeight: 800, fontSize: 14, border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(212,175,55,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            <FaTicketAlt /> Confirm Seats
          </button>
        </div>
      </div>

      {/* ── Food & Snacks Modal ── */}
      {showFoodModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "flex-end",
          animation: "fade-in .2s ease-out",
        }}>
          <div style={{
            width: "100%", maxWidth: 520, borderRadius: "24px 24px 0 0",
            border: "1px solid rgba(212,175,55,0.2)", borderBottom: "none",
            background: "#111118", display: "flex", flexDirection: "column",
            maxHeight: "88vh", overflow: "hidden",
            animation: "slide-up .3s ease-out",
            boxShadow: "0 -16px 60px rgba(0,0,0,0.5)",
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,255,255,0.03)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(212,175,55,0.15)", color: "#d4af37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  <FaHamburger />
                </div>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: 17, color: "#fff", margin: 0 }}>Grab a Snack?</h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, marginTop: 2 }}>Enhance your movie experience</p>
                </div>
              </div>
              <button onClick={() => setShowFoodModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 8 }}>
                <FaTimes size={18} />
              </button>
            </div>

            {/* Content */}
            {productsLoading ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48 }}>
                <FaSpinner style={{ fontSize: 32, color: "#d4af37", marginBottom: 12, animation: "spin .8s linear infinite" }} />
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading menu...</p>
              </div>
            ) : allProducts.length === 0 ? (
              <div style={{ flex: 1, padding: 48, textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 20 }}>No food items available for this theater</p>
                <button onClick={handleFinalBooking} style={{
                  padding: "12px 28px", borderRadius: 14, fontWeight: 700,
                  background: "linear-gradient(135deg,#d4af37,#b8860b)", color: "#000", border: "none", cursor: "pointer",
                }}>
                  Continue without snacks
                </button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {allProducts.map((item) => (
                    <div key={item._id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "14px 16px", borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.03)",
                      transition: "border-color .15s",
                    }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 32, padding: 6, background: "rgba(255,255,255,0.05)", borderRadius: 12 }}>🍿</span>
                        )}
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: 14, color: "#fff", margin: "0 0 3px" }}>{item.name}</h4>
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 4px" }}>{item.description || "Delicious snack"}</p>
                          <p style={{ fontWeight: 700, color: "#d4af37", fontSize: 14, margin: 0 }}>₹{item.discountPrice || item.price}</p>
                        </div>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 30, padding: "4px 6px",
                      }}>
                        <button onClick={() => updateCart(item._id, -1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaMinus size={10} /></button>
                        <span style={{ width: 18, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{cart[item._id] || 0}</span>
                        <button onClick={() => updateCart(item._id, 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(212,175,55,0.2)", border: "none", color: "#d4af37", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaPlus size={10} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: "16px 20px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 6, padding: "0 4px" }}>
                    <span>Tickets (×{selectedSeats.length})</span>
                    <span style={{ fontWeight: 600, color: "#fff" }}>₹{seatsTotal}</span>
                  </div>
                  {foodTotal > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#d4af37", marginBottom: 6, padding: "0 4px" }}>
                      <span>Food & Beverages</span>
                      <span style={{ fontWeight: 600 }}>+₹{foodTotal}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, padding: "12px 4px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 4 }}>
                    <span style={{ color: "#fff" }}>Grand Total</span>
                    <span style={{ color: "#d4af37" }}>₹{grandTotal}</span>
                  </div>
                  <button
                    onClick={handleFinalBooking}
                    disabled={createBookingMutation.isPending}
                    style={{
                      width: "100%", padding: "16px 0", borderRadius: 16, fontWeight: 800, fontSize: 16,
                      background: "linear-gradient(135deg,#d4af37,#b8860b)", color: "#000", border: "none",
                      cursor: createBookingMutation.isPending ? "not-allowed" : "pointer",
                      opacity: createBookingMutation.isPending ? 0.7 : 1,
                      boxShadow: "0 4px 20px rgba(212,175,55,0.4)",
                    }}
                  >
                    {createBookingMutation.isPending
                      ? <FaSpinner style={{ animation: "spin .8s linear infinite", margin: "0 auto" }} />
                      : `Proceed to Pay ₹${grandTotal}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="login" />
      )}
    </div>
  );
}

export default SeatSelection;