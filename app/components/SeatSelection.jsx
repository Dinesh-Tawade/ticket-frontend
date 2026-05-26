"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getAvailableSeats, createBooking, confirmPayment, getPublicShowById } from "@/app/services/publicCommunication";
import { generateTicketPDF, generateTicketHTML } from "@/app/services/ticketGenerator";
import { loadRazorpay } from "@/app/utils/razorpay";
import { FaStar, FaRegGem, FaCrown, FaSpinner, FaChair } from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";

// Seat type configuration
const SEAT_TYPES = {
  NORMAL: { label: "Standard", color: "#3b82f6", icon: MdEventSeat },
  EXECUTIVE: { label: "Executive", color: "#10b981", icon: FaStar },
  PREMIUM: { label: "Premium", color: "#8b5cf6", icon: FaRegGem },
  VIP: { label: "VIP", color: "#f59e0b", icon: FaCrown }
};

const SeatSelection = ({ showId, showDetails, onBack, onNeedLogin }) => {
  const router = useRouter();
  const [seatCategories, setSeatCategories] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [theaterZones, setTheaterZones] = useState([]);
  const [screenPosition, setScreenPosition] = useState("top");

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    return !!token;
  };

  useEffect(() => {
    fetchSeats();
    fetchTheaterData();
  }, [showId]);

  const fetchTheaterData = async () => {
    try {
      if (showDetails?.theaterId?._id) {
        const { getTheaterByIdAdmin } = await import("@/app/services/adminCommunication");
        const res = await getTheaterByIdAdmin(showDetails.theaterId._id);
        if (res.success && res.data) {
          setTheaterZones(res.data.screens?.find(s => s._id === showDetails.screenId)?.zones || []);
          setScreenPosition(res.data.screenPosition || "top");
        }
      }
    } catch (error) {
      console.error("Error fetching theater data:", error);
    }
  };

  const fetchSeats = async () => {
    try {
      const res = await getAvailableSeats(showId);
      if (res.success && res.data?.seatCategories) {
        setSeatCategories(res.data.seatCategories);
      }
    } catch (error) {
      console.error("Error fetching seats:", error);
      toast.error("Failed to fetch seats. Please try again.");
    }
  };

  const getSeatColor = (category) => {
    const zone = theaterZones.find(z => z.seatType === category);
    if (zone) return zone.color;
    return SEAT_TYPES[category]?.color || "#3b82f6";
  };

  const getSeatIcon = (category) => {
    const Icon = SEAT_TYPES[category]?.icon || MdEventSeat;
    return Icon;
  };

  const handleSeatSelect = (category, rowName, seat) => {
    if (seat.isBooked) {
      toast.error("This seat is already booked!");
      return;
    }
    
    if (!isAuthenticated()) {
      toast.error("Please login to book tickets!");
      if (onNeedLogin) onNeedLogin();
      return;
    }
    
    const seatKey = `${rowName}${seat.seatNumber}`;
    const isSelected = selectedSeats.find(s => `${s.rowName}${s.seatNumber}` === seatKey);
    
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => `${s.rowName}${s.seatNumber}` !== seatKey));
      toast.success(`Seat ${rowName}${seat.seatNumber} deselected`);
    } else {
      if (selectedSeats.length >= 40) {
        toast.error("Maximum 40 seats per booking!");
        return;
      }
      setSelectedSeats([...selectedSeats, {
        rowName,
        seatNumber: seat.seatNumber,
        category,
        price: seat.price
      }]);
      toast.success(`Seat ${rowName}${seat.seatNumber} selected`);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleBooking = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to book tickets!");
      if (onNeedLogin) onNeedLogin();
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    setLoading(true);
    
    try {
      const bookingReqData = {
        showId: showId,
        seats: selectedSeats.map(seat => ({
          rowName: seat.rowName,
          seatNumber: seat.seatNumber
        }))
      };

      const bookingRes = await createBooking(bookingReqData);
      
      if (bookingRes.success) {
        const { bookingId, totalAmount, paymentStatus } = bookingRes.data;
        
        const bookingInfo = {
          bookingId,
          totalAmount,
          paymentStatus,
          seats: selectedSeats,
          movieName: showDetails?.movie?.name || showDetails?.movieName,
          showDate: new Date(showDetails?.showDate).toLocaleDateString(),
          showTime: showDetails?.startTime,
          theaterName: showDetails?.theaterId?.name,
          theaterLocation: showDetails?.theaterId?.location
        };
        
        if (paymentStatus === 'FREE') {
          toast.success("🎉 Booking confirmed for free show!");
          await generateAndShowTicket(bookingInfo);
          setBookingComplete(true);
          setBookingData(bookingInfo);
        } else {
          const paymentSuccess = await processPayment(bookingId, totalAmount, bookingInfo);
          if (paymentSuccess) {
            await generateAndShowTicket(bookingInfo);
            setBookingComplete(true);
            setBookingData(bookingInfo);
          }
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMsg = error.response?.data?.message || "Booking failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (bookingId, amount, bookingInfo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const razorpay = await loadRazorpay();
        
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount * 100,
          currency: "INR",
          name: "Movie Ticket Booking",
          description: `Booking ID: ${bookingId}`,
          image: "/logo.png",
          handler: async (response) => {
            try {
              const confirmRes = await confirmPayment(bookingId);
              if (confirmRes.success) {
                toast.success("🎉 Payment successful! Your tickets are confirmed.");
                resolve(true);
              } else {
                toast.error("Payment confirmed but booking verification failed.");
                reject(false);
              }
            } catch (error) {
              console.error("Payment confirmation error:", error);
              toast.error("Payment successful but confirmation failed.");
              reject(false);
            }
          },
          prefill: {
            name: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).name : "",
            email: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).email : "",
          },
          theme: { color: "#dc2626" },
          modal: { ondismiss: () => reject(false) }
        };
        
        const razorpayInstance = new razorpay(options);
        razorpayInstance.open();
      } catch (error) {
        console.error("Razorpay initialization error:", error);
        toast.error("Payment gateway error. Please try again.");
        reject(false);
      }
    });
  };

  const generateAndShowTicket = async (bookingInfo) => {
    try {
      const qrCodeUrl = await generateQRCodeForTicket(bookingInfo);
      const ticketHtml = generateTicketHTML(bookingInfo, showDetails, qrCodeUrl);
      const ticketWindow = window.open();
      ticketWindow.document.write(ticketHtml);
      ticketWindow.document.close();
      await generateTicketPDF(bookingInfo, showDetails);
    } catch (error) {
      console.error("Ticket generation error:", error);
    }
  };

  const generateQRCodeForTicket = async (bookingInfo) => {
    const QRCode = (await import('qrcode')).default;
    const qrData = JSON.stringify({
      bookingId: bookingInfo.bookingId,
      movieName: bookingInfo.movieName,
      showDate: bookingInfo.showDate,
      showTime: bookingInfo.showTime,
      theaterName: bookingInfo.theaterName,
      seats: bookingInfo.seats.map(s => `${s.rowName}${s.seatNumber}`).join(', ')
    });
    return await QRCode.toDataURL(qrData, { width: 200 });
  };

  const viewMyBookings = () => {
    router.push('/public/my-bookings');
  };

  if (bookingComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your tickets have been generated.</p>
          <p className="text-sm text-gray-500 mb-6">Booking ID: {bookingData?.bookingId}</p>
          <div className="space-y-3">
            <button onClick={viewMyBookings} className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700">
              View My Bookings
            </button>
            <button onClick={onBack} className="w-full border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50">
              Book More Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!seatCategories || seatCategories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Group seats by row from all categories
  const allRows = {};
  seatCategories.forEach(category => {
    const zoneColor = getSeatColor(category.category);
    category.rows?.forEach(row => {
      if (!allRows[row.rowName]) {
        allRows[row.rowName] = [];
      }
      row.seats?.forEach(seat => {
        const isSelected = selectedSeats.find(s => s.rowName === row.rowName && s.seatNumber === seat.seatNumber);
        allRows[row.rowName].push({
          number: seat.seatNumber,
          category: category.category,
          price: category.pricePerSeat,
          isBooked: seat.isBooked,
          isSelected: !!isSelected,
          color: zoneColor,
          Icon: getSeatIcon(category.category)
        });
      });
    });
  });

  // Sort seats in each row
  Object.keys(allRows).forEach(row => {
    allRows[row].sort((a, b) => parseInt(a.number) - parseInt(b.number));
  });

  const sortedRows = Object.keys(allRows).sort();

  // Group zones by position for layout (if theaterZones available)
  const zonesByPosition = {
    top: theaterZones.filter(z => z.position === 'top'),
    left: theaterZones.filter(z => z.position === 'left'),
    center: theaterZones.filter(z => z.position === 'center'),
    right: theaterZones.filter(z => z.position === 'right'),
    bottom: theaterZones.filter(z => z.position === 'bottom'),
  };

  // Render seats for a zone
  const renderZoneSeats = (zoneRows) => {
    return zoneRows.map((rowName) => {
      const seats = allRows[rowName] || [];
      if (seats.length === 0) return null;
      
      return (
        <div key={rowName} className="flex justify-center items-center gap-2 mb-2">
          <div className="w-8 text-right">
            <span className="text-xs font-bold" style={{ color: "var(--foreground)", opacity: 0.5 }}>{rowName}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {seats.map((seat) => {
              const Icon = seat.Icon;
              const isSelected = seat.isSelected;
              const isBooked = seat.isBooked;
              const seatLabel = `${rowName}${seat.number}`;
              
              return (
                <button
                  key={`${rowName}${seat.number}`}
                  onClick={() => handleSeatSelect(seat.category, rowName, { seatNumber: seat.number, isBooked: seat.isBooked, price: seat.price })}
                  disabled={isBooked}
                  className={`
                    relative group w-9 h-9 rounded-lg flex flex-col items-center justify-center transition-all duration-200
                    ${isBooked 
                      ? 'bg-red-500/20 border border-red-500 cursor-not-allowed opacity-60' 
                      : isSelected
                        ? 'bg-green-500 text-white shadow-md scale-105 border-2 border-green-400'
                        : 'hover:scale-105 hover:shadow-md cursor-pointer'
                    }
                  `}
                  style={{
                    backgroundColor: isBooked ? undefined : (isSelected ? undefined : `${seat.color}20`),
                    borderColor: isBooked ? undefined : (isSelected ? undefined : seat.color),
                    color: isSelected ? 'white' : seat.color
                  }}
                  onMouseEnter={() => setHoveredSeat(seatLabel)}
                  onMouseLeave={() => setHoveredSeat(null)}
                >
                  <Icon className="text-xs" />
                  <span className="text-[7px] font-mono font-bold mt-0.5">{seat.number}</span>
                  
                  {hoveredSeat === seatLabel && !isBooked && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 shadow-lg pointer-events-none">
                      {seatLabel} • ₹{seat.price}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    });
  };

  // Get rows for each position
  const getRowsForPosition = (position) => {
    const zoneRows = [];
    const zonesAtPosition = zonesByPosition[position] || [];
    zonesAtPosition.forEach(zone => {
      zone.rows?.forEach(row => {
        if (allRows[row.rowName]) {
          zoneRows.push(row.rowName);
        }
      });
    });
    return [...new Set(zoneRows)].sort();
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Movie Info Header */}
          <div className="rounded-xl p-4 mb-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                  {showDetails?.movie?.name || showDetails?.movieName}
                </h1>
                <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {showDetails?.theaterId?.name} | {new Date(showDetails?.showDate).toLocaleDateString()} | {showDetails?.startTime}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Selected Seats</p>
                <p className="text-2xl font-bold text-yellow-500">{selectedSeats.length}</p>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Total: ₹{calculateTotal()}</p>
              </div>
            </div>
          </div>

          {/* Screen */}
          <div className="text-center mb-6">
            <div className="inline-block px-6 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg">
              🎬 S C R E E N
            </div>
            <p className="text-[9px] text-foreground/40 mt-1">← AUDIENCE VIEW →</p>
          </div>

          {/* 2D Seats Layout with Positions */}
          <div className="rounded-xl overflow-x-auto" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="p-4">
              {/* Top Zones (Balcony) */}
              {zonesByPosition.top.length > 0 && (
                <div className="mb-4">
                  <div className="text-center text-[9px] font-bold text-foreground/50 mb-2">⬆️ BALCONY</div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {zonesByPosition.top.map(zone => {
                      const zoneRows = getRowsForPosition('top');
                      return (
                        <div key={zone.id} className="bg-card rounded-lg p-2" style={{ border: `1px solid ${zone.color}30` }}>
                          <div className="text-center mb-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${zone.color}20`, color: zone.color }}>
                              {zone.name}
                            </span>
                          </div>
                          {renderZoneSeats(zoneRows)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Left + Center + Right */}
              <div className="flex flex-wrap justify-center gap-4">
                {/* Left Zones */}
                {zonesByPosition.left.length > 0 && (
                  <div className="flex-shrink-0">
                    <div className="text-center text-[9px] font-bold text-foreground/50 mb-2">⬅️ LEFT</div>
                    {zonesByPosition.left.map(zone => {
                      const zoneRows = getRowsForPosition('left');
                      return (
                        <div key={zone.id} className="bg-card rounded-lg p-2 mb-2" style={{ border: `1px solid ${zone.color}30` }}>
                          <div className="text-center mb-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${zone.color}20`, color: zone.color }}>
                              {zone.name}
                            </span>
                          </div>
                          {renderZoneSeats(zoneRows)}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Center Zones */}
                {zonesByPosition.center.length > 0 && (
                  <div className="flex-shrink-0">
                    <div className="text-center text-[9px] font-bold text-foreground/50 mb-2">🎯 CENTER</div>
                    {zonesByPosition.center.map(zone => {
                      const zoneRows = getRowsForPosition('center');
                      return (
                        <div key={zone.id} className="bg-card rounded-lg p-2 mb-2 shadow-md" style={{ border: `2px solid ${zone.color}40` }}>
                          <div className="text-center mb-2">
                            <span className="text-[10px] font-bold px-3 py-0.5 rounded-full" style={{ background: `${zone.color}25`, color: zone.color }}>
                              {zone.name}
                            </span>
                          </div>
                          {renderZoneSeats(zoneRows)}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Right Zones */}
                {zonesByPosition.right.length > 0 && (
                  <div className="flex-shrink-0">
                    <div className="text-center text-[9px] font-bold text-foreground/50 mb-2">RIGHT ➡️</div>
                    {zonesByPosition.right.map(zone => {
                      const zoneRows = getRowsForPosition('right');
                      return (
                        <div key={zone.id} className="bg-card rounded-lg p-2 mb-2" style={{ border: `1px solid ${zone.color}30` }}>
                          <div className="text-center mb-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${zone.color}20`, color: zone.color }}>
                              {zone.name}
                            </span>
                          </div>
                          {renderZoneSeats(zoneRows)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Zones */}
              {zonesByPosition.bottom.length > 0 && (
                <div className="mt-4">
                  <div className="text-center text-[9px] font-bold text-foreground/50 mb-2">⬇️ FRONT</div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {zonesByPosition.bottom.map(zone => {
                      const zoneRows = getRowsForPosition('bottom');
                      return (
                        <div key={zone.id} className="bg-card rounded-lg p-2" style={{ border: `1px solid ${zone.color}30` }}>
                          <div className="text-center mb-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${zone.color}20`, color: zone.color }}>
                              {zone.name}
                            </span>
                          </div>
                          {renderZoneSeats(zoneRows)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* If no zones, show simple layout */}
              {theaterZones.length === 0 && (
                <div>
                  {sortedRows.map((rowName) => {
                    const seats = allRows[rowName] || [];
                    if (seats.length === 0) return null;
                    
                    return (
                      <div key={rowName} className="flex justify-center items-center gap-2 mb-2">
                        <div className="w-8 text-right">
                          <span className="text-xs font-bold" style={{ color: "var(--foreground)", opacity: 0.5 }}>{rowName}</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1">
                          {seats.map((seat) => {
                            const Icon = seat.Icon;
                            const isSelected = seat.isSelected;
                            const isBooked = seat.isBooked;
                            const seatLabel = `${rowName}${seat.number}`;
                            
                            return (
                              <button
                                key={`${rowName}${seat.number}`}
                                onClick={() => handleSeatSelect(seat.category, rowName, { seatNumber: seat.number, isBooked: seat.isBooked, price: seat.price })}
                                disabled={isBooked}
                                className={`
                                  relative group w-9 h-9 rounded-lg flex flex-col items-center justify-center transition-all duration-200
                                  ${isBooked 
                                    ? 'bg-red-500/20 border border-red-500 cursor-not-allowed opacity-60' 
                                    : isSelected
                                      ? 'bg-green-500 text-white shadow-md scale-105 border-2 border-green-400'
                                      : 'hover:scale-105 hover:shadow-md cursor-pointer'
                                  }
                                `}
                                style={{
                                  backgroundColor: isBooked ? undefined : (isSelected ? undefined : `${seat.color}20`),
                                  borderColor: isBooked ? undefined : (isSelected ? undefined : seat.color),
                                  color: isSelected ? 'white' : seat.color
                                }}
                                onMouseEnter={() => setHoveredSeat(seatLabel)}
                                onMouseLeave={() => setHoveredSeat(null)}
                              >
                                <Icon className="text-xs" />
                                <span className="text-[7px] font-mono font-bold mt-0.5">{seat.number}</span>
                                
                                {hoveredSeat === seatLabel && !isBooked && (
                                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    {seatLabel} • ₹{seat.price}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 justify-center mt-5">
            {theaterZones.slice(0, 4).map(zone => (
              <div key={zone.id} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: zone.color }} />
                <span className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.7 }}>{zone.name}</span>
                <span className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.5 }}>₹{zone.basePrice * zone.priceMultiplier}</span>
              </div>
            ))}
            {theaterZones.length === 0 && (
              <>
                {Object.entries(SEAT_TYPES).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: `${config.color}40`, border: `1px solid ${config.color}` }} />
                    <config.icon className="text-[10px]" style={{ color: config.color }} />
                    <span className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.7 }}>{config.label}</span>
                  </div>
                ))}
              </>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500 border border-green-400" />
              <span className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.7 }}>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500" />
              <span className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.7 }}>Booked</span>
            </div>
          </div>

          {/* Booking Footer */}
          <div className="fixed bottom-0 left-0 right-0 z-10 border-t shadow-lg" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <FaChair className="text-yellow-500 text-sm" />
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-5 w-px" style={{ background: "var(--card-border)" }} />
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>Total:</span>
                    <span className="text-lg font-bold text-green-500">₹{calculateTotal()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onBack}
                    className="px-4 py-1.5 rounded-lg font-semibold text-sm transition-all border"
                    style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={loading || selectedSeats.length === 0}
                    className="px-6 py-1.5 rounded-lg font-bold text-sm transition-all bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><FaSpinner className="animate-spin inline mr-1 text-xs" /> Processing...</>
                    ) : (
                      `Pay ₹${calculateTotal()}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Padding for fixed footer */}
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;