'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import {
  getMyShowsOwner,
  getTheaterShows,
  getMyTheaters,
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
  FaArrowLeft,
  FaWallet,
  FaChair,
  FaInfoCircle,
  FaShieldAlt,
} from 'react-icons/fa';
import { MdLocalMovies } from 'react-icons/md';
import { GiTheater } from 'react-icons/gi';

// ==================== SEAT BOOKING MODAL ====================
const SeatBookingModal = ({ isOpen, onClose, show, timing, accessibleSeats, onBookingSuccess }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState('seats');
  const [isBooking, setIsBooking] = useState(false);

  if (!isOpen || !show) return null;

  // Get seat categories from timing or show
  const seatCategories = timing?.seatCategories || show?.seatCategories || [];
  
  // Get accessible seat numbers set for quick lookup
  const accessibleSeatNumbers = new Set(accessibleSeats || []);
  
  // Filter only accessible seats from all seats
  const getAccessibleSeats = () => {
    const seats = [];
    seatCategories.forEach(category => {
      category.rows?.forEach(row => {
        row.seats?.forEach(seat => {
          // Only include seats that are in accessibleSeats list
          if (accessibleSeatNumbers.has(seat.seatNumber)) {
            seats.push({
              ...seat,
              categoryName: category.category,
              price: seat.price || category.pricePerSeat,
              rowName: row.rowName
            });
          }
        });
      });
    });
    return seats;
  };

  const allSeats = getAccessibleSeats();
  
  // Group accessible seats by category
  const seatsByCategory = allSeats.reduce((acc, seat) => {
    if (!acc[seat.categoryName]) {
      acc[seat.categoryName] = {
        category: seat.categoryName,
        pricePerSeat: seat.price,
        rows: {}
      };
    }
    if (!acc[seat.categoryName].rows[seat.rowName]) {
      acc[seat.categoryName].rows[seat.rowName] = [];
    }
    acc[seat.categoryName].rows[seat.rowName].push(seat);
    return acc;
  }, {});

  const handleSeatClick = (seat) => {
    if (seat.isBooked) {
      toast.error('This seat is already booked!');
      return;
    }
    
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.seatNumber === seat.seatNumber);
      if (isSelected) {
        return prev.filter(s => s.seatNumber !== seat.seatNumber);
      } else {
        return [...prev, seat];
      }
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    setStep('payment');
  };

  const handleBooking = async () => {
    setIsBooking(true);
    
    const bookingData = {
      showId: show._id,
      timingId: timing?._id || show.timings?.[0]?._id,
      seats: selectedSeats.map(seat => ({
        seatNumber: seat.seatNumber,
        rowName: seat.rowName,
        category: seat.categoryName,
        price: seat.price
      })),
      totalAmount: calculateTotal(),
      bookingDate: new Date().toISOString()
    };
    
    // Simulate API call - replace with actual API
    setTimeout(() => {
      console.log('Booking Data:', bookingData);
      toast.success(`Successfully booked ${selectedSeats.length} seats!`, {
        icon: '🎉',
        duration: 4000
      });
      
      setIsBooking(false);
      onBookingSuccess?.();
      onClose();
      setSelectedSeats([]);
      setStep('seats');
    }, 1500);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'NORMAL': return 'border-green-500';
      case 'EXECUTIVE': return 'border-blue-500';
      case 'PREMIUM': return 'border-purple-500';
      default: return 'border-yellow-500';
    }
  };

  const getCategoryBgColor = (category) => {
    switch(category) {
      case 'NORMAL': return 'bg-green-500';
      case 'EXECUTIVE': return 'bg-blue-500';
      case 'PREMIUM': return 'bg-purple-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" 
           style={{ background: "var(--card)" }} 
           onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 border-b" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step === 'payment' && (
                <button 
                  onClick={() => setStep('seats')}
                  className="p-2 rounded-lg hover:opacity-70 transition-all"
                  style={{ color: "var(--foreground)" }}
                >
                  <FaArrowLeft />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                  {step === 'seats' ? 'Select Your Accessible Seats' : 'Confirm Booking'}
                </h2>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
                  {show.movie?.name} • Screen {show.screenNumber}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/10 transition-all">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'seats' ? (
            <>
              {/* Access Info Banner */}
              <div className="flex items-center gap-3 p-4 rounded-xl mb-6 bg-purple-500/10 border border-purple-500/20">
                <FaShieldAlt className="text-purple-400 text-xl" />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Your Accessible Seats
                  </p>
                  <p className="text-xs opacity-60">
                    You have access to {allSeats.length} seats in this show
                  </p>
                </div>
              </div>

              {/* Movie Info Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl mb-6" style={{ background: "var(--background)" }}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-400" />
                    <span className="text-sm">{formatDate(timing?.showDate || show.showDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-purple-400" />
                    <span className="text-sm">{timing?.startTime || show.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GiTheater className="text-purple-400" />
                    <span className="text-sm">Screen {show.screenNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="text-sm font-medium">{show.movie?.rating}</span>
                </div>
              </div>

              {/* Screen Indicator */}
              <div className="text-center mb-8">
                <div className="w-3/4 mx-auto h-1 rounded-full bg-gray-600" />
                <p className="text-xs mt-2 opacity-60" style={{ color: "var(--foreground)" }}>S C R E E N</p>
              </div>

              {/* Accessible Seat Map - Only showing accessible seats */}
              {Object.entries(seatsByCategory).map(([categoryName, categoryData]) => (
                <div key={categoryName} className="mb-8">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getCategoryBgColor(categoryName)}`} />
                    {categoryName} - ₹{categoryData.pricePerSeat}
                  </h3>
                  
                  {Object.entries(categoryData.rows).map(([rowName, seats]) => (
                    <div key={rowName} className="mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-mono w-6 pt-2" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                          {rowName}
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {seats.map((seat) => {
                            const isSelected = selectedSeats.find(s => s.seatNumber === seat.seatNumber);
                            const isBooked = seat.isBooked;
                            
                            return (
                              <button
                                key={seat.seatNumber}
                                onClick={() => handleSeatClick(seat)}
                                disabled={isBooked}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                                  ${isBooked ? 'cursor-not-allowed opacity-30' : 'hover:scale-105 hover:shadow-lg'}
                                  ${isSelected ? 'bg-green-500 text-white shadow-lg scale-105' : ''}
                                `}
                                style={{
                                  background: isBooked ? 'var(--background)' : 
                                            isSelected ? '#22c55e' : 'var(--background)',
                                  border: `2px solid ${isBooked ? 'var(--card-border)' : 
                                          isSelected ? '#22c55e' : getCategoryColor(categoryName).split('-')[1]}`
                                }}
                              >
                                {seat.seatNumber.replace(rowName, '')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-6 p-4 rounded-xl mt-6" style={{ background: "var(--background)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border-2 border-green-500" />
                  <span className="text-xs">Available (Accessible)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-green-500" />
                  <span className="text-xs">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gray-500 opacity-30" />
                  <span className="text-xs">Booked</span>
                </div>
              </div>

              {/* No Accessible Seats Message */}
              {allSeats.length === 0 && (
                <div className="text-center py-12">
                  <FaChair className="text-6xl mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium" style={{ color: "var(--foreground)" }}>No Accessible Seats</p>
                  <p className="text-sm opacity-60 mt-2">
                    You don't have access to any seats in this show
                  </p>
                </div>
              )}
            </>
          ) : (
            // Payment Summary
            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaChair className="text-purple-400" />
                  Selected Seats ({selectedSeats.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedSeats.map((seat, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg" style={{ background: "var(--card)" }}>
                      <div>
                        <span className="font-medium">{seat.seatNumber}</span>
                        <span className="text-xs ml-2 opacity-60">({seat.categoryName})</span>
                      </div>
                      <span className="font-medium">₹{seat.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaWallet className="text-purple-400" />
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="opacity-60">Ticket Price</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-60">GST (18%)</span>
                    <span>₹{(calculateTotal() * 0.18).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t font-bold" style={{ borderColor: "var(--card-border)" }}>
                    <span>Total Amount</span>
                    <span className="text-xl text-green-500">₹{(calculateTotal() * 1.18).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="rounded-xl p-4 text-center" style={{ background: "var(--background)" }}>
                <p className="text-xs opacity-60">
                  By confirming your booking, you agree to our terms and conditions
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-60" style={{ color: "var(--foreground)" }}>
                {step === 'seats' ? 'Selected Seats' : 'Total Payable'}
              </p>
              <p className="text-2xl font-bold text-green-500">
                ₹{step === 'seats' ? calculateTotal() : (calculateTotal() * 1.18).toFixed(0)}
              </p>
            </div>
            
            {step === 'seats' ? (
              <button
                onClick={handleProceedToPayment}
                disabled={selectedSeats.length === 0 || allSeats.length === 0}
                className="px-8 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-purple-500 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center gap-2"
              >
                <FaTicketAlt /> Book Now ({selectedSeats.length})
              </button>
            ) : (
              <button
                onClick={handleBooking}
                disabled={isBooking}
                className="px-8 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Confirm & Pay
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SIMPLIFIED SHOW CARD ====================
const ShowCard = ({ show, onBookTicket }) => {
  const formatDate = (date) => {
    if (!date) return 'Date TBD';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const currentTiming = show.timings?.[0] || show;
  const availableSeats = currentTiming.availableSeats || show.availableSeats || 0;
  const totalSeats = currentTiming.totalSeats || show.totalSeats || 0;

  return (
    <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      
      {/* Movie Banner */}
      <div className="relative h-48 bg-gradient-to-r from-purple-600 to-indigo-600">
        {show.movie?.poster ? (
          <img src={show.movie.poster} alt={show.movie.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdLocalMovies className="text-6xl text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Rating Badge */}
        {show.movie?.rating > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-white text-xs font-medium">{show.movie.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
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
            <span className="text-sm">{formatDate(currentTiming.showDate || show.showDate)}</span>
            <FaClock className="text-purple-400 ml-2" />
            <span className="text-sm">{currentTiming.startTime || show.startTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              <GiTheater className="text-purple-400" />
              <span className="text-sm">Screen {show.screenNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              <FaTicketAlt className="text-purple-400" />
              <span className="text-sm font-medium">{availableSeats}/{totalSeats} seats</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--background)" }}>
            <span className="text-sm opacity-60">Starting from</span>
            <span className="text-xl font-bold text-green-500">₹{show.basePrice || 150}</span>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={() => onBookTicket(show)}
          disabled={availableSeats === 0}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaTicketAlt /> Book Tickets
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================
const ShowsPage = () => {
  const queryClient = useQueryClient();
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedTiming, setSelectedTiming] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Get user data from localStorage or context
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage (adjust based on your auth implementation)
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
    }
  }, []);

  // Extract accessible seats from user data
  const getAccessibleSeatsForTheater = (theaterId) => {
    if (!userData?.accessibleSeats) return [];
    
    const accessibleZone = userData.accessibleSeats.find(
      seat => seat.theaterId?.$oid === theaterId || seat.theaterId === theaterId
    );
    
    return accessibleZone?.seatNumbers || [];
  };

  // Fetch all shows
  const { data: showsData, isLoading, refetch } = useQuery({
    queryKey: ['my-shows'],
    queryFn: getMyShowsOwner,
  });

  let shows = showsData?.data || [];

  const handleBookTicket = (show) => {
    // Check if user has accessible seats for this theater
    const accessibleSeats = getAccessibleSeatsForTheater(show.theaterId?._id || show.theaterId);
    
    if (accessibleSeats.length === 0) {
      toast.error('You don\'t have access to any seats in this theater', {
        icon: '🔒',
        duration: 4000
      });
      return;
    }
    
    // If show has multiple timings, take the first timing
    if (show.timings && show.timings.length > 1) {
      setSelectedTiming(show.timings[0]);
    } else {
      setSelectedTiming(show.timings?.[0] || show);
    }
    setSelectedShow(show);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    refetch();
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: "var(--background)" }}>
      
      {/* Toast Container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          Book Your Tickets
        </h1>
        <p className="text-sm mt-2 opacity-60" style={{ color: "var(--foreground)" }}>
          Select a movie and choose from your accessible seats
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Loading shows...</p>
        </div>
      ) : shows.length === 0 ? (
        // Empty State
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--card)" }}>
            <MdLocalMovies className="text-5xl text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>No Shows Available</h3>
          <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
            No movies are currently showing
          </p>
        </div>
      ) : (
        // Shows Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shows.map((show) => (
            <ShowCard
              key={show._id}
              show={show}
              onBookTicket={handleBookTicket}
            />
          ))}
        </div>
      )}

      {/* Seat Booking Modal - Only shows accessible seats */}
      <SeatBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedShow(null);
          setSelectedTiming(null);
        }}
        show={selectedShow}
        timing={selectedTiming}
        accessibleSeats={getAccessibleSeatsForTheater(selectedShow?.theaterId?._id || selectedShow?.theaterId)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default ShowsPage;