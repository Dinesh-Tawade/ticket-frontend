"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailableSeats, createBooking, confirmPayment, getTheaterProducts
} from "@/app/services/publicCommunication";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FaArrowLeft, FaCreditCard, FaTicketAlt, FaTimes, FaCheck, FaPlus, FaMinus, FaHamburger, FaSpinner
} from "react-icons/fa";
import AuthModal from "@/app/components/public/AuthModal";

/* ─── Category accent colours ─── */
const CATEGORY_COLORS = ["#d4af37", "#a855f7", "#3b82f6", "#22c55e"];

function SeatSelection({ showId, showDetails, onBack, onNeedLogin, onSeatsSelected }) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Food Modal States
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [cart, setCart] = useState({});

  /* ── Seat data ── */
  const { data: seatData, isLoading, error } = useQuery({
    queryKey: ["seats", showId],
    queryFn: () => getAvailableSeats(showId),
    enabled: !!showId,
  });

  /* ── Food Products from API ── */
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["theater-products", showDetails?.theaterId?._id],
    queryFn: () => getTheaterProducts(showDetails?.theaterId?._id),
    enabled: !!showDetails?.theaterId?._id && showFoodModal,
  });

  /* ── Booking mutation ── */
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

  /* ── Handles Initial Confirm Click ── */
  const handleInitialProceed = () => {
    if (selectedSeats.length === 0) { alert("Please select at least one seat"); return; }

    const token = localStorage.getItem("token");
    if (!token) {
      if (onNeedLogin) onNeedLogin();
      else setShowAuthModal(true);
      return;
    }

    setShowFoodModal(true);
  };

  /* ── Handles Final Booking (With/Without Food) ── */
  const handleFinalBooking = () => {
    const formattedSeats = selectedSeats.map(s => ({ rowName: s.rowName, seatNumber: s.seatNumber }));
    
    // Format cart for API
    const snacksPayload = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, quantity]) => ({ productId: id, quantity }));

    createBookingMutation.mutate({ 
      seats: formattedSeats,
      snacks: snacksPayload
    });
  };

  /* ── Cart Helpers ── */
  const updateCart = (id, delta) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const seatsTotal = useMemo(() => selectedSeats.reduce((sum, s) => sum + s.price, 0), [selectedSeats]);
  const foodTotal = useMemo(() => {
    if (!productsData?.data?.products) return 0;
    const allProducts = Object.values(productsData.data.products).flat();
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = allProducts.find(p => p._id === id);
      return sum + (product ? (product.discountPrice || product.price) * qty : 0);
    }, 0);
  }, [cart, productsData]);
  const grandTotal = seatsTotal + foodTotal;

  /* ── Category colour map ── */
  const seatMap = seatData?.data?.seatMap;
  const categoryKeys = seatMap ? Object.keys(seatMap) : [];
  const categoryColors = Object.fromEntries(
    categoryKeys.map((k, i) => [k, CATEGORY_COLORS[i % CATEGORY_COLORS.length]])
  );

  const isUrgent = timeLeft && parseInt(timeLeft.split(":")[0]) < 5;

  // Get all products as flat array
  const allProducts = useMemo(() => {
    if (!productsData?.data?.products) return [];
    return Object.values(productsData.data.products).flat();
  }, [productsData]);

  /* ────────────────── Payment Modal ────────────────── */
  if (bookingData?.paymentStatus === "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90 p-4 font-sans backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-[#d4af37]/30 bg-[var(--card)] p-8 flex flex-col items-center shadow-[0_32px_64px_rgba(0,0,0,0.6)] animate-[modal-in_0.35s_ease-out_forwards]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8860b] flex items-center justify-center text-black mb-5 shadow-[0_8px_24px_rgba(212,175,55,0.4)]">
            <FaCreditCard size={28} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] mb-2">Complete Payment</h2>
          <p className="text-[13px] text-[var(--foreground)]/50 text-center mb-6">Seats reserved. Complete payment before time runs out.</p>

          <div className={`w-full rounded-2xl p-5 text-center mb-6 transition-colors ${isUrgent ? "bg-red-500/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse" : "bg-[#d4af37]/10 border border-[#d4af37]/25"}`}>
            <p className="text-[11px] uppercase tracking-widest text-[var(--foreground)]/50 mb-1.5">Time Remaining</p>
            <p className={`font-mono text-4xl font-bold leading-none ${isUrgent ? "text-red-500" : "text-[#d4af37]"}`}>{timeLeft || "14:59"}</p>
          </div>

          <div className="w-full mb-6 text-sm text-[var(--foreground)] space-y-4">
            <div className="flex justify-between pb-3 border-b border-[var(--card-border)]">
              <span className="opacity-60">Booking ID</span>
              <span className="font-mono text-xs">{bookingData.bookingId}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-[var(--card-border)]">
              <span className="opacity-60">Seats</span>
              <span className="font-medium">{selectedSeats.length} seat(s)</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="opacity-60 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-[#d4af37]">₹{bookingData.totalAmount}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button className="flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50" onClick={() => confirmPaymentMutation.mutate(bookingData.bookingId)} disabled={confirmPaymentMutation.isPending}>
              <FaCheck /> {confirmPaymentMutation.isPending ? "Processing…" : `Pay ₹${bookingData.totalAmount}`}
            </button>
            <button className="px-5 py-3.5 rounded-xl font-semibold border border-[var(--card-border)] text-[var(--foreground)]/60 hover:text-red-500 hover:border-red-500 transition-colors flex items-center gap-2" onClick={() => router.push("/public/shows")}>
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────── Main Loading / Error ────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 border-[3px] border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-[var(--foreground)]/50 tracking-wider">Loading theater layout…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
        <div className="text-center p-10 rounded-2xl border border-red-500/20 bg-[var(--card)] flex flex-col items-center gap-4">
          <FaTimes className="text-4xl text-red-500" />
          <p className="text-lg text-[var(--foreground)]">Failed to load seating layout</p>
          <button className="px-6 py-2.5 rounded-xl border border-[var(--card-border)] text-[var(--foreground)] hover:text-[#d4af37] hover:border-[#d4af37] transition-colors" onClick={onBack}>Go Back</button>
        </div>
      </div>
    );
  }

  /* ────────────────── Main Seat Map ────────────────── */
  return (
    <div className="min-h-screen bg-[var(--background)] font-sans pb-32 text-[var(--foreground)]">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-[#d4af37]/20">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors" onClick={onBack}>
            <FaArrowLeft size={12} /> Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-lg font-bold text-white truncate">{showDetails?.movie?.name}</h1>
            <p className="text-xs text-white/50 mt-0.5">{showDetails?.theaterId?.name} {showDetails?.startTime && ` • ${showDetails.startTime}`}</p>
          </div>
          {selectedSeats.length > 0 && (
            <div className="px-3.5 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f4d03f] text-xs font-bold whitespace-nowrap animate-[pop_0.3s_ease-out]">
              {selectedSeats.length} Selected
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Screen Graphic */}
        <div className="flex justify-center mb-12 perspective-[600px]">
          <div className="relative w-[min(580px,90%)] h-14">
            <div className="absolute inset-0 rounded-[60%/100%_100%_0_0] bg-[radial-gradient(ellipse_at_50%_100%,rgba(212,175,55,0.22)_0%,transparent_72%)]" />
            <div className="absolute bottom-0 inset-x-0 h-1 rounded-sm bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent shadow-[0_0_24px_rgba(212,175,55,0.4)]" />
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] font-bold text-white/30 uppercase">Screen This Way</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categoryKeys.map(cat => (
            <div key={cat} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-xs">
              <span className="w-2 h-2 rounded-full" style={{ background: categoryColors[cat] }} />
              <span className="font-semibold text-white/90">{cat}</span>
              <span className="text-white/40">₹{Object.values(seatMap[cat])[0]?.[0]?.price || 0}</span>
            </div>
          ))}
        </div>

        {/* Seats Container */}
        <div className="flex flex-col gap-8">
          {seatMap && categoryKeys.map((categoryName) => {
            const rows = seatMap[categoryName];
            const accent = categoryColors[categoryName];
            return (
              <div key={categoryName} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 overflow-hidden">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
                  <h3 className="font-serif text-lg font-bold text-white flex-1">{categoryName}</h3>
                  <span className="text-sm font-semibold" style={{ color: accent }}>₹{Object.values(rows)[0]?.[0]?.price || 0} / seat</span>
                </div>

                <div className="flex flex-col gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.entries(rows).map(([rowName, seats]) => (
                    <div key={rowName} className="flex items-center gap-3 min-w-max">
                      <span className="w-5 text-center text-[11px] font-bold text-white/30 font-mono flex-shrink-0">{rowName}</span>
                      <div className="flex gap-1.5">
                        {seats.map((seat) => {
                          const sel = isSelected(rowName, seat.seatNumber, categoryName);
                          return (
                            <button
                              key={seat.seatNumber}
                              onClick={() => !seat.isBooked && handleSeatSelect(categoryName, rowName, seat.seatNumber, seat.price)}
                              disabled={seat.isBooked}
                              style={sel ? { backgroundColor: accent, color: '#000', boxShadow: `0 4px 15px ${accent}40` } : {}}
                              className={`
                                relative w-9 h-9 flex items-center justify-center rounded-t-lg rounded-b-md text-[10px] font-bold font-mono transition-all flex-shrink-0
                                before:content-[''] before:absolute before:-bottom-[3px] before:inset-x-0.5 before:h-[3px] before:rounded-b-sm
                                ${seat.isBooked 
                                  ? "bg-gray-800 text-gray-600 opacity-50 cursor-not-allowed before:bg-gray-900 line-through" 
                                  : sel 
                                    ? "scale-110 -translate-y-1 before:bg-black/40" 
                                    : "bg-[#2d3748] text-white/70 hover:bg-[#4a5568] hover:text-white hover:-translate-y-1 before:bg-[#1a202c]"
                                }
                              `}
                            >
                              {seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>
                      <span className="w-5 text-center text-[11px] font-bold text-white/10 font-mono flex-shrink-0">{rowName}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* State Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
          <div className="flex items-center gap-2 text-xs text-white/70"><div className="w-6 h-5 rounded-t-md bg-[#2d3748] relative after:absolute after:-bottom-1 after:inset-x-0.5 after:h-1 after:bg-[#1a202c]"></div> Available</div>
          <div className="flex items-center gap-2 text-xs text-white/70"><div className="w-6 h-5 rounded-t-md bg-[#d4af37] relative after:absolute after:-bottom-1 after:inset-x-0.5 after:h-1 after:bg-[#b8860b]"></div> Selected</div>
          <div className="flex items-center gap-2 text-xs text-white/70 opacity-60"><div className="w-6 h-5 rounded-t-md bg-gray-800 relative after:absolute after:-bottom-1 after:inset-x-0.5 after:h-1 after:bg-gray-900"></div> Booked</div>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div className={`fixed bottom-0 inset-x-0 z-40 bg-[var(--card)] border-t border-[#d4af37]/25 backdrop-blur-xl transition-transform duration-300 ${selectedSeats.length > 0 ? "translate-y-0" : "translate-y-full"}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white/60 mb-1">{selectedSeats.length} Seat{selectedSeats.length > 1 && 's'} Selected</p>
            <div className="flex flex-wrap gap-1.5 overflow-hidden h-[24px]">
              {selectedSeats.slice(0, 5).map(s => (
                <span key={s.seatKey} className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-current" style={{ color: categoryColors[s.category], backgroundColor: `${categoryColors[s.category]}15` }}>
                  {s.rowName}{s.seatNumber}
                </span>
              ))}
              {selectedSeats.length > 5 && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/60">+{selectedSeats.length - 5} more</span>}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest text-white/50">Total Price</p>
              <p className="text-xl font-bold text-[#d4af37]">₹{seatsTotal}</p>
            </div>
            <button
              onClick={handleInitialProceed}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8860b] text-black font-bold text-sm shadow-[0_4px_15px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-transform"
            >
              <FaTicketAlt /> Confirm Seats
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────── Food & Snacks Modal (API Data) ────────────────── */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="border border-[#d4af37]/20 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] animate-[slide-up_0.3s_ease-out]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[var(--card-border)] flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-lg"><FaHamburger /></div>
                <div>
                  <h2 className="text-lg font-bold text-white">Grab a Snack?</h2>
                  <p className="text-xs text-white/50">Enhance your movie experience</p>
                </div>
              </div>
              <button onClick={() => setShowFoodModal(false)} className="text-white/40 hover:text-white p-2"><FaTimes size={18} /></button>
            </div>

            {/* Food List - Loading State */}
            {productsLoading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <FaSpinner className="animate-spin text-3xl text-[#d4af37] mb-3" />
                <p className="text-white/50 text-sm">Loading menu...</p>
              </div>
            ) : allProducts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-white/50 text-sm">No food items available for this theater</p>
                <button
                  onClick={handleFinalBooking}
                  className="mt-4 px-6 py-2 rounded-xl bg-[#d4af37] text-black font-semibold"
                >
                  Continue without snacks
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  {allProducts.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-4 rounded-2xl border border-[var(--card-border)] bg-[#323335] hover:border-[#d4af37]/30 transition-colors">
                      <div className="flex gap-4 items-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-white/5" />
                        ) : (
                          <span className="text-3xl bg-white/5 p-2 rounded-xl">🍿</span>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.name}</h4>
                          <p className="text-xs text-white/50 mb-1">{item.description || "Delicious snack"}</p>
                          <p className="font-semibold text-[#d4af37] text-sm">₹{item.discountPrice || item.price}</p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--card-border)] rounded-full p-1">
                        <button onClick={() => updateCart(item._id, -1)} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white"><FaMinus size={10} /></button>
                        <span className="w-4 text-center text-sm font-bold text-white">{cart[item._id] || 0}</span>
                        <button onClick={() => updateCart(item._id, 1)} className="w-7 h-7 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37]/40"><FaPlus size={10} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-[var(--card-border)] bg-black/40">
                  <div className="flex justify-between text-sm mb-3 px-2">
                    <span className="text-white/60">Tickets (x{selectedSeats.length})</span>
                    <span className="font-semibold text-white">₹{seatsTotal}</span>
                  </div>
                  {foodTotal > 0 && (
                    <div className="flex justify-between text-sm mb-3 px-2 text-[#d4af37]">
                      <span>Food & Beverages</span>
                      <span className="font-semibold">+ ₹{foodTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg mb-5 px-2 border-t border-[var(--card-border)] pt-3">
                    <span className="font-bold text-white">Grand Total</span>
                    <span className="font-bold text-[#d4af37]">₹{grandTotal}</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleFinalBooking} disabled={createBookingMutation.isPending} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-black font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                      {createBookingMutation.isPending ? <FaSpinner className="animate-spin mx-auto" /> : `Proceed to Pay ₹${grandTotal}`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      )}
    </div>
  );
}

export default SeatSelection;