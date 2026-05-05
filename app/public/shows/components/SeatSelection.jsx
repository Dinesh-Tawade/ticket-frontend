


"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailableSeats, createBooking, confirmPayment,
} from "@/app/services/publicCommunication";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FaArrowLeft, FaCreditCard, FaTicketAlt, FaTimes, FaCheck,
} from "react-icons/fa";
import AuthModal from "@/app/components/public/AuthModal";

/* ─── Category accent colours (cycles if more than 4) ─── */
const CATEGORY_COLORS = ["#d4af37", "#a855f7", "#3b82f6", "#22c55e"];

function SeatSelection({ showId, showDetails, onBack }) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ── Seat data ── */
  const { data: seatData, isLoading, error } = useQuery({
    queryKey: ["seats", showId],
    queryFn: () => getAvailableSeats(showId),
    enabled: !!showId,
  });

  /* ── Booking mutation ── */
  const createBookingMutation = useMutation({
    mutationFn: (seats) => createBooking({ showId, seats }),
    onSuccess: (data) => {
      setBookingData(data.data);
      if (data.data.paymentStatus === "FREE") router.push("/public/my-bookings");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Booking failed. Please try again.");
    },
  });

  /* ── Payment mutation ── */
  const confirmPaymentMutation = useMutation({
    mutationFn: (bookingId) => confirmPayment(bookingId),
    onSuccess: () => router.push("/public/my-bookings"),
    onError: (err) => {
      alert(err.response?.data?.message || "Payment failed. Please try again.");
    },
  });

  /* ── Countdown timer ── */
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

  /* ── Seat helpers ── */
  const handleSeatSelect = (categoryName, rowName, seatNumber, price) => {
    const key = `${categoryName}-${rowName}-${seatNumber}`;
    if (selectedSeats.some(s => s.seatKey === key)) {
      setSelectedSeats(prev => prev.filter(s => s.seatKey !== key));
    } else {
      if (selectedSeats.length >= 10) { alert("Maximum 10 seats per booking"); return; }
      setSelectedSeats(prev => [...prev, { seatKey: key, rowName, seatNumber, category: categoryName, price }]);
    }
  };

  const isSelected = (rowName, seatNumber, categoryName) =>
    selectedSeats.some(s => s.rowName === rowName && s.seatNumber === seatNumber && s.category === categoryName);

  const handleProceed = () => {
    if (selectedSeats.length === 0) { alert("Please select at least one seat"); return; }

    const token = localStorage.getItem("token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    createBookingMutation.mutate(selectedSeats.map(s => ({ rowName: s.rowName, seatNumber: s.seatNumber })));
  };

  const totalAmount = useMemo(() => selectedSeats.reduce((sum, s) => sum + s.price, 0), [selectedSeats]);

  /* ── Category colour map ── */
  const seatMap = seatData?.data?.seatMap;
  const categoryKeys = seatMap ? Object.keys(seatMap) : [];
  const categoryColors = Object.fromEntries(
    categoryKeys.map((k, i) => [k, CATEGORY_COLORS[i % CATEGORY_COLORS.length]])
  );

  /* ── Urgency indicator for time remaining ── */
  const isUrgent = timeLeft && parseInt(timeLeft.split(":")[0]) < 5;

  /* ────────────────── payment modal ────────────────── */
  if (bookingData?.paymentStatus === "PENDING") {
    return (
      <>
        <style>{STYLES}</style>
        <div className="ss-page ss-payment-bg">
          <div className="ss-modal">
            {/* Icon */}
            <div className="ss-modal__icon">
              <FaCreditCard size={24} />
            </div>

            <h2 className="ss-modal__title">Complete Payment</h2>
            <p className="ss-modal__subtitle">Seats are reserved. Complete payment before time runs out.</p>

            {/* Timer */}
            <div className={`ss-timer ${isUrgent ? "ss-timer--urgent" : ""}`}>
              <p className="ss-timer__label">Time Remaining</p>
              <p className="ss-timer__value">{timeLeft || "14:59"}</p>
              <div className="ss-timer__bar-track">
                <div className="ss-timer__bar-fill" />
              </div>
            </div>

            {/* Summary */}
            <div className="ss-modal__rows">
              <div className="ss-modal__row">
                <span>Booking ID</span>
                <span className="ss-mono">{bookingData.bookingId}</span>
              </div>
              <div className="ss-modal__row">
                <span>Seats</span>
                <span>{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}</span>
              </div>
              <div className="ss-modal__row ss-modal__row--total">
                <span>Total Amount</span>
                <span className="ss-modal__total">₹{bookingData.totalAmount}</span>
              </div>
            </div>

            <div className="ss-modal__actions">
              <button
                className="ss-btn-pay"
                onClick={() => confirmPaymentMutation.mutate(bookingData.bookingId)}
                disabled={confirmPaymentMutation.isPending}
              >
                <FaCheck size={13} />
                {confirmPaymentMutation.isPending ? "Processing…" : "Pay ₹" + bookingData.totalAmount}
              </button>
              <button className="ss-btn-cancel" onClick={() => router.push("/public/shows")}>
                <FaTimes size={13} /> Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ────────────────── loading / error ────────────────── */
  if (isLoading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="ss-page ss-center">
          <div className="ss-spinner" />
          <p className="ss-muted">Loading theater layout…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="ss-page ss-center">
          <div className="ss-error-card">
            <FaTimes className="ss-error-icon" />
            <p>Failed to load seats</p>
            <button className="ss-btn-ghost" onClick={onBack}>Go Back</button>
          </div>
        </div>
      </>
    );
  }

  /* ────────────────── main seat map ────────────────── */
  return (
    <>
      <style>{STYLES}</style>

      <div className="ss-page">

        {/* ── Sticky header ── */}
        <header className="ss-header">
          <div className="ss-header__inner">
            <button className="ss-back-btn" onClick={onBack}>
              <FaArrowLeft size={13} /> Back
            </button>
            <div className="ss-header__info">
              <h1 className="ss-header__title">{showDetails?.movie?.name}</h1>
              <p className="ss-header__subtitle">
                {showDetails?.theaterId?.name}
                {showDetails?.startTime && ` · ${showDetails.startTime}`}
              </p>
            </div>
            {/* Seat count pill */}
            {selectedSeats.length > 0 && (
              <div className="ss-header__count">
                {selectedSeats.length} selected
              </div>
            )}
          </div>
        </header>

        <div className="ss-content">

          {/* ── Screen ── */}
          <div className="ss-screen-wrap">
            <div className="ss-screen">
              <div className="ss-screen__glow" />
              <div className="ss-screen__surface" />
              <p className="ss-screen__label">SCREEN</p>
            </div>
          </div>

          {/* ── Category legend ── */}
          <div className="ss-legend-row">
            {categoryKeys.map(cat => (
              <div key={cat} className="ss-cat-legend">
                <span className="ss-cat-legend__dot" style={{ background: categoryColors[cat] }} />
                <span className="ss-cat-legend__name">{cat}</span>
                <span className="ss-cat-legend__price">
                  ₹{Object.values(seatMap[cat])[0]?.[0]?.price || 0}
                </span>
              </div>
            ))}
          </div>

          {/* ── Seat map ── */}
          <div className="ss-seatmap">
            {seatMap && categoryKeys.map((categoryName) => {
              const rows = seatMap[categoryName];
              const accent = categoryColors[categoryName];
              return (
                <div key={categoryName} className="ss-category">
                  {/* Category header */}
                  <div className="ss-category__header">
                    <div className="ss-category__line" style={{ background: accent }} />
                    <h3 className="ss-category__name">{categoryName}</h3>
                    <span className="ss-category__price" style={{ color: accent }}>
                      ₹{Object.values(rows)[0]?.[0]?.price || 0} / seat
                    </span>
                  </div>

                  {/* Rows */}
                  <div className="ss-rows">
                    {Object.entries(rows).map(([rowName, seats]) => (
                      <div key={rowName} className="ss-row">
                        <span className="ss-row__label">{rowName}</span>
                        <div className="ss-row__seats">
                          {seats.map((seat) => {
                            const sel = isSelected(rowName, seat.seatNumber, categoryName);
                            const state = seat.isBooked ? "booked" : sel ? "selected" : "free";
                            return (
                              <button
                                key={seat.seatNumber}
                                className={`ss-seat ss-seat--${state}`}
                                style={sel ? { "--accent": accent } : {}}
                                onClick={() =>
                                  !seat.isBooked && handleSeatSelect(categoryName, rowName, seat.seatNumber, seat.price)
                                }
                                disabled={seat.isBooked}
                                aria-label={`${rowName}${seat.seatNumber} – ${state}`}
                                aria-pressed={sel}
                              >
                                <span className="ss-seat__num">{seat.seatNumber}</span>
                              </button>
                            );
                          })}
                        </div>
                        <span className="ss-row__label ss-row__label--right">{rowName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── State legend ── */}
          <div className="ss-state-legend">
            {[
              { state: "free", label: "Available" },
              { state: "selected", label: "Your Selection" },
              { state: "booked", label: "Taken" },
            ].map(({ state, label }) => (
              <div key={state} className="ss-state-item">
                <div className={`ss-state-swatch ss-state-swatch--${state}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Spacer for floating bar */}
          <div style={{ height: "100px" }} />
        </div>

        {/* ── Floating summary bar ── */}
        <div className={`ss-bar ${selectedSeats.length > 0 ? "ss-bar--visible" : ""}`}>
          <div className="ss-bar__inner">
            {/* Selected seat chips */}
            <div className="ss-bar__seats">
              {selectedSeats.length === 0 ? (
                <p className="ss-bar__hint">Select seats above</p>
              ) : (
                <>
                  <p className="ss-bar__count">{selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""}</p>
                  <div className="ss-bar__chips">
                    {selectedSeats.slice(0, 7).map(s => (
                      <span key={s.seatKey} className="ss-chip"
                        style={{ "--accent": categoryColors[s.category] }}
                      >
                        {s.rowName}{s.seatNumber}
                      </span>
                    ))}
                    {selectedSeats.length > 7 && (
                      <span className="ss-chip ss-chip--more">+{selectedSeats.length - 7}</span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Total + proceed */}
            <div className="ss-bar__right">
              {selectedSeats.length > 0 && (
                <div className="ss-bar__total">
                  <span className="ss-bar__total-label">Total</span>
                  <span className="ss-bar__total-value">₹{totalAmount}</span>
                </div>
              )}
              <button
                className="ss-bar__btn"
                onClick={handleProceed}
                disabled={selectedSeats.length === 0 || createBookingMutation.isPending}
              >
                <FaTicketAlt size={13} />
                {createBookingMutation.isPending ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      )}
    </>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

  .ss-page { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: var(--background); position: relative; }
  .ss-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
  .ss-payment-bg { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: rgba(0,0,0,0.85); }

  /* Spinner */
  .ss-spinner {
    width: 44px; height: 44px;
    border: 3px solid rgba(212,175,55,0.2);
    border-top-color: #d4af37;
    border-radius: 50%;
    animation: ss-spin 0.75s linear infinite;
  }
  @keyframes ss-spin { to { transform: rotate(360deg); } }
  .ss-muted { font-size: 14px; color: var(--foreground); opacity: 0.45; }

  /* Error */
  .ss-error-card {
    text-align: center; padding: 40px;
    border-radius: 20px; border: 1px solid rgba(239,68,68,0.2);
    background: var(--card); display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .ss-error-icon { font-size: 36px; color: #ef4444; }
  .ss-btn-ghost {
    padding: 10px 22px; border-radius: 12px; font-size: 14px; font-weight: 600;
    border: 1px solid var(--card-border); background: transparent;
    color: var(--foreground); cursor: pointer; transition: all 0.2s ease;
  }
  .ss-btn-ghost:hover { border-color: #d4af37; color: #d4af37; }

  /* ── Header ── */
  .ss-header {
    position: sticky; top: 0; z-index: 40;
    background: rgba(0,0,0,0.88);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(212,175,55,0.18);
  }
  .ss-header__inner {
    max-width: 900px; margin: 0 auto;
    padding: 14px 16px;
    display: flex; align-items: center; gap: 14px;
  }
  .ss-back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 10px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;
  }
  .ss-back-btn:hover { background: rgba(255,255,255,0.14); color: white; transform: translateX(-2px); }

  .ss-header__info { flex: 1; min-width: 0; }
  .ss-header__title {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 700; color: white;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;
  }
  .ss-header__subtitle { font-size: 12px; color: rgba(255,255,255,0.5); margin: 2px 0 0; }

  .ss-header__count {
    padding: 5px 12px; border-radius: 20px;
    background: rgba(212,175,55,0.2);
    border: 1px solid rgba(212,175,55,0.35);
    color: #f4d03f; font-size: 12px; font-weight: 600;
    flex-shrink: 0;
    animation: ss-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes ss-pop { from { transform: scale(0.75); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  /* ── Content ── */
  .ss-content { max-width: 900px; margin: 0 auto; padding: 32px 16px; }

  /* ── Screen ── */
  .ss-screen-wrap { display: flex; justify-content: center; margin-bottom: 32px; perspective: 600px; }
  .ss-screen {
    position: relative; width: min(580px, 90%);
    height: 56px;
  }
  .ss-screen__glow {
    position: absolute; inset: 0;
    border-radius: 60% 60% 0 0 / 100% 100% 0 0;
    background: radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.22) 0%, transparent 72%);
  }
  .ss-screen__surface {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 4px; border-radius: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 30%, rgba(244,208,63,0.9) 50%, rgba(212,175,55,0.6) 70%, transparent 100%);
    box-shadow: 0 0 24px rgba(212,175,55,0.4);
  }
  .ss-screen__label {
    position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
    font-size: 10px; letter-spacing: 0.4em; font-weight: 600;
    color: rgba(255,255,255,0.35); text-transform: uppercase;
  }

  /* Category legend */
  .ss-legend-row {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
    margin-bottom: 32px;
  }
  .ss-cat-legend {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px;
    background: var(--card); border: 1px solid var(--card-border);
    font-size: 12px;
  }
  .ss-cat-legend__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ss-cat-legend__name { font-weight: 600; color: var(--foreground); }
  .ss-cat-legend__price { color: var(--foreground); opacity: 0.5; font-size: 11px; }

  /* ── Seat map ── */
  .ss-seatmap { display: flex; flex-direction: column; gap: 28px; }

  .ss-category {
    border-radius: 18px;
    border: 1px solid var(--card-border);
    background: var(--card);
    padding: 20px;
    overflow: hidden;
  }
  .ss-category__header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px;
  }
  .ss-category__line { width: 4px; height: 18px; border-radius: 4px; flex-shrink: 0; }
  .ss-category__name {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 700; color: var(--foreground); flex: 1;
  }
  .ss-category__price { font-size: 13px; font-weight: 600; }

  /* Rows */
  .ss-rows { display: flex; flex-direction: column; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
  .ss-row { display: flex; align-items: center; gap: 12px; min-width: max-content; }
  .ss-row__label {
    width: 20px; text-align: center;
    font-size: 11px; font-weight: 700; color: var(--foreground); opacity: 0.35;
    font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
  }
  .ss-row__label--right { opacity: 0.2; }
  .ss-row__seats { display: flex; gap: 5px; }

  /* ── Seats ── */
  .ss-seat {
    width: 36px; height: 36px;
    border-radius: 8px 8px 4px 4px;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative; flex-shrink: 0;
  }
  .ss-seat__num {
    font-size: 10px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
    line-height: 1; pointer-events: none;
  }

  /* Bottom "armrest" shape */
  .ss-seat::before {
    content: '';
    position: absolute; bottom: -3px; left: 2px; right: 2px; height: 3px;
    border-radius: 0 0 4px 4px;
  }

  .ss-seat--free {
    background: #2d3748;
    color: rgba(255,255,255,0.7);
  }
  .ss-seat--free::before { background: #1a202c; }
  .ss-seat--free:hover {
    transform: translateY(-4px) scale(1.08);
    background: #4a5568;
    color: white;
    box-shadow: 0 6px 16px rgba(0,0,0,0.35);
  }

  .ss-seat--selected {
    background: var(--accent, #d4af37);
    color: #000;
    transform: translateY(-4px) scale(1.08);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--accent, #d4af37) 45%, transparent);
  }
  .ss-seat--selected::before { background: color-mix(in srgb, var(--accent, #d4af37) 60%, black); }
  .ss-seat--selected:hover { transform: translateY(-5px) scale(1.1); }

  .ss-seat--booked {
    background: #1a202c;
    color: #374151;
    cursor: not-allowed;
    opacity: 0.4;
  }
  .ss-seat--booked::before { background: #111827; }
  .ss-seat--booked .ss-seat__num { text-decoration: line-through; }

  /* ── State legend ── */
  .ss-state-legend {
    display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;
    margin-top: 32px; padding: 16px;
    border-radius: 14px;
    background: var(--card); border: 1px solid var(--card-border);
  }
  .ss-state-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--foreground); opacity: 0.7; }
  .ss-state-swatch {
    width: 28px; height: 24px; border-radius: 6px 6px 3px 3px;
    position: relative;
  }
  .ss-state-swatch::after {
    content: ''; position: absolute; bottom: -3px; left: 2px; right: 2px; height: 3px;
    border-radius: 0 0 3px 3px;
  }
  .ss-state-swatch--free { background: #2d3748; }
  .ss-state-swatch--free::after { background: #1a202c; }
  .ss-state-swatch--selected { background: #d4af37; }
  .ss-state-swatch--selected::after { background: #b8860b; }
  .ss-state-swatch--booked { background: #1a202c; opacity: 0.4; }
  .ss-state-swatch--booked::after { background: #0f172a; }

  /* ── Floating bar ── */
  .ss-bar {
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 50;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: var(--card, white);
    border-top: 1px solid rgba(212,175,55,0.25);
    box-shadow: 0 -8px 32px rgba(0,0,0,0.2);
    backdrop-filter: blur(16px);
    padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
  }
  .ss-bar--visible { transform: translateY(0); }
  .ss-bar__inner {
    max-width: 900px; margin: 0 auto;
    display: flex; align-items: center; gap: 16px;
  }
  .ss-bar__seats { flex: 1; min-width: 0; }
  .ss-bar__hint { font-size: 13px; color: var(--foreground); opacity: 0.4; }
  .ss-bar__count { font-size: 12px; font-weight: 600; color: var(--foreground); opacity: 0.6; margin-bottom: 4px; }
  .ss-bar__chips { display: flex; flex-wrap: wrap; gap: 4px; }

  .ss-chip {
    display: inline-flex; align-items: center;
    padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;
    background: color-mix(in srgb, var(--accent, #d4af37) 15%, transparent);
    color: var(--accent, #d4af37);
    border: 1px solid color-mix(in srgb, var(--accent, #d4af37) 30%, transparent);
    font-family: 'JetBrains Mono', monospace;
  }
  .ss-chip--more {
    background: var(--card-border, rgba(0,0,0,0.06));
    color: var(--foreground); border-color: transparent; opacity: 0.6;
  }

  .ss-bar__right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .ss-bar__total { text-align: right; }
  .ss-bar__total-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--foreground); opacity: 0.45; display: block; }
  .ss-bar__total-value { font-size: 22px; font-weight: 700; color: #d4af37; line-height: 1.1; }

  .ss-bar__btn {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 12px;
    font-size: 14px; font-weight: 700;
    background: linear-gradient(135deg, #d4af37, #b8860b);
    color: #000; border: none; cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 18px rgba(212,175,55,0.4);
    white-space: nowrap;
  }
  .ss-bar__btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(212,175,55,0.55);
  }
  .ss-bar__btn:disabled {
    background: var(--card-border); color: var(--foreground); opacity: 0.4;
    cursor: not-allowed; box-shadow: none;
  }

  /* ── Payment modal ── */
  .ss-modal {
    width: min(460px, 92vw);
    border-radius: 24px;
    border: 1px solid rgba(212,175,55,0.35);
    background: var(--card, #111);
    padding: 32px;
    display: flex; flex-direction: column; align-items: center;
    box-shadow: 0 32px 64px rgba(0,0,0,0.6);
    animation: ss-modal-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  @keyframes ss-modal-in {
    from { opacity: 0; transform: scale(0.9) translateY(16px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .ss-modal__icon {
    width: 60px; height: 60px; border-radius: 18px;
    background: linear-gradient(135deg, #d4af37, #b8860b);
    display: flex; align-items: center; justify-content: center;
    color: #000; margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(212,175,55,0.4);
  }
  .ss-modal__title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700; color: var(--foreground);
    margin: 0 0 8px; text-align: center;
  }
  .ss-modal__subtitle { font-size: 13px; color: var(--foreground); opacity: 0.5; text-align: center; margin: 0 0 24px; }

  /* Timer */
  .ss-timer {
    width: 100%; border-radius: 16px; padding: 18px;
    background: rgba(212,175,55,0.08);
    border: 1px solid rgba(212,175,55,0.25);
    text-align: center; margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  .ss-timer--urgent {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.3);
    animation: ss-urgent-pulse 1s ease infinite;
  }
  @keyframes ss-urgent-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.2); }
    50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
  }
  .ss-timer__label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--foreground); opacity: 0.45; margin-bottom: 6px; }
  .ss-timer__value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 44px; font-weight: 700;
    color: #d4af37; line-height: 1;
    transition: color 0.3s ease;
  }
  .ss-timer--urgent .ss-timer__value { color: #ef4444; }
  .ss-timer__bar-track {
    height: 3px; border-radius: 3px;
    background: rgba(255,255,255,0.1);
    margin-top: 12px; overflow: hidden;
  }
  .ss-timer__bar-fill {
    height: 100%; border-radius: 3px;
    background: linear-gradient(90deg, #22c55e, #d4af37, #ef4444);
    animation: ss-timer-drain 900s linear forwards;
    transform-origin: left;
  }
  @keyframes ss-timer-drain { from { width: 100%; } to { width: 0%; } }

  /* Modal rows */
  .ss-modal__rows { width: 100%; margin-bottom: 24px; }
  .ss-modal__row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.07));
    font-size: 14px;
    color: var(--foreground);
  }
  .ss-modal__row span:first-child { opacity: 0.55; }
  .ss-modal__row--total {
    border-bottom: none; padding-top: 16px; margin-top: 4px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.07));
  }
  .ss-modal__total { font-size: 24px; font-weight: 700; color: #d4af37; }
  .ss-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

  .ss-modal__actions { display: flex; gap: 10px; width: 100%; }
  .ss-btn-pay {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px; border-radius: 14px;
    font-size: 15px; font-weight: 700;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white; border: none; cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 18px rgba(34,197,94,0.35);
  }
  .ss-btn-pay:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(34,197,94,0.5); }
  .ss-btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }
  .ss-btn-cancel {
    display: flex; align-items: center; gap: 7px;
    padding: 14px 20px; border-radius: 14px;
    font-size: 14px; font-weight: 600;
    background: transparent;
    border: 1px solid var(--card-border, rgba(0,0,0,0.1));
    color: var(--foreground); opacity: 0.6;
    cursor: pointer; transition: all 0.2s ease;
  }
  .ss-btn-cancel:hover { opacity: 1; border-color: #ef4444; color: #ef4444; }
`;

export default SeatSelection;