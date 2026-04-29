"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAvailableSeats, createBooking, confirmPayment, getMyBookings } from "@/app/services/publicCommunication";
import { generateTicketPDF, generateTicketHTML } from "@/app/services/ticketGenerator";
import { loadRazorpay } from "@/app/utils/razorpay";

const SeatSelection = ({ showId, showDetails, onBack }) => {
  const router = useRouter();
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailsData, setShowDetailsData] = useState(showDetails);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    fetchSeats();
  }, [showId]);

  const fetchSeats = async () => {
    try {
      const res = await getAvailableSeats(showId);
      if (res.success) {
        setSeatMap(res.data.seatMap);
        setShowDetailsData(prev => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error("Error fetching seats:", error);
      alert("Failed to fetch seats");
    }
  };

  const handleSeatSelect = (category, rowName, seat) => {
    if (seat.isBooked) {
      alert("This seat is already booked!");
      return;
    }

    const seatKey = `${rowName}${seat.seatNumber}`;
    const isSelected = selectedSeats.find(s => `${s.rowName}${s.seatNumber}` === seatKey);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => `${s.rowName}${s.seatNumber}` !== seatKey));
    } else {
      if (selectedSeats.length >= 40) {
        alert("Maximum 40 seats per booking!");
        return;
      }
      setSelectedSeats([...selectedSeats, {
        rowName,
        seatNumber: seat.seatNumber,
        category,
        price: seat.price
      }]);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Create booking
      const bookingReqData = {
        showId: showId,
        seats: selectedSeats.map(seat => ({
          rowName: seat.rowName,
          seatNumber: seat.seatNumber
        }))
      };

      const bookingRes = await createBooking(bookingReqData);
      
      if (bookingRes.success) {
        const { bookingId, totalAmount, paymentStatus, expiresAt } = bookingRes.data;
        
        const bookingInfo = {
          bookingId,
          totalAmount,
          paymentStatus,
          expiresAt,
          seats: selectedSeats,
          movieName: showDetailsData.movieName || showDetailsData.movie?.name,
          showDate: new Date(showDetailsData.showDate).toLocaleDateString(),
          showTime: showDetailsData.startTime,
          theaterName: showDetailsData.theaterId?.name || showDetails.theaterId?.name,
          theaterLocation: showDetailsData.theaterId?.location
        };
        
        if (paymentStatus === 'FREE') {
          // Free show - directly confirmed
          alert("Booking confirmed for free show! 🎉");
          await generateAndShowTicket(bookingInfo);
          setBookingComplete(true);
          setBookingData(bookingInfo);
        } else {
          // Paid show - proceed to payment
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
      alert(error.response?.data?.message || "Booking failed. Please try again.");
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
              // Confirm payment on backend
              const confirmRes = await confirmPayment(bookingId);
              if (confirmRes.success) {
                alert("Payment successful! 🎉 Your tickets are confirmed.");
                resolve(true);
              } else {
                alert("Payment confirmed but booking verification failed. Please contact support.");
                reject(false);
              }
            } catch (error) {
              console.error("Payment confirmation error:", error);
              alert("Payment successful but confirmation failed. Please check My Bookings.");
              reject(false);
            }
          },
          prefill: {
            name: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).name : "",
            email: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).email : "",
          },
          theme: {
            color: "#dc2626"
          },
          modal: {
            ondismiss: () => {
              reject(false);
            }
          }
        };
        
        const razorpayInstance = new razorpay(options);
        razorpayInstance.open();
      } catch (error) {
        console.error("Razorpay initialization error:", error);
        alert("Payment gateway error. Please try again.");
        reject(false);
      }
    });
  };

  const generateAndShowTicket = async (bookingInfo) => {
    try {
      // Open ticket in new window
      const qrCodeUrl = await generateQRCodeForTicket(bookingInfo);
      const ticketHtml = generateTicketHTML(bookingInfo, showDetailsData, qrCodeUrl);
      
      const ticketWindow = window.open();
      ticketWindow.document.write(ticketHtml);
      ticketWindow.document.close();
      
      // Also download PDF
      const pdf = await generateTicketPDF(bookingInfo, showDetailsData);
      
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
            <button
              onClick={viewMyBookings}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              View My Bookings
            </button>
            <button
              onClick={onBack}
              className="w-full border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50"
            >
              Book More Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!seatMap) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                ← Back to Shows
              </button>
              <h1 className="text-xl font-bold mt-2">{showDetailsData.movieName || showDetailsData.movie?.name}</h1>
              <p className="text-sm text-gray-600">
                {showDetailsData.theaterId?.name} | {new Date(showDetailsData.showDate).toLocaleDateString()} | {showDetailsData.startTime}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Selected Seats</p>
              <p className="text-2xl font-bold text-red-600">{selectedSeats.length}</p>
              <p className="text-sm text-gray-600">Total: ₹{calculateTotal()}</p>
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Select Seats (Max 40)</h2>
          
          {/* Screen */}
          <div className="mb-8">
            <div className="w-full h-2 bg-gray-300 rounded"></div>
            <p className="text-center text-sm text-gray-500 mt-2">SCREEN</p>
          </div>

          {/* Seats Grid */}
          {Object.entries(seatMap).map(([category, rows]) => (
            <div key={category} className="mb-6">
              <h3 className="font-semibold text-md mb-3 text-gray-700">{category}</h3>
              {Object.entries(rows).map(([rowName, seats]) => (
                <div key={rowName} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-sm bg-gray-200 px-2 py-1 rounded">Row {rowName}</span>
                  </div>
                  <div className="grid grid-cols-10 gap-2">
                    {seats.map((seat) => {
                      const isSelected = selectedSeats.find(s => s.rowName === rowName && s.seatNumber === seat.seatNumber);
                      return (
                        <button
                          key={seat.seatNumber}
                          onClick={() => handleSeatSelect(category, rowName, seat)}
                          disabled={seat.isBooked}
                          className={`
                            w-10 h-10 rounded-lg text-sm font-semibold transition-all
                            ${seat.isBooked ? 'bg-gray-300 cursor-not-allowed' : 
                              isSelected ? 'bg-green-500 text-white hover:bg-green-600' : 
                              'bg-gray-100 hover:bg-red-100 border-2 border-gray-200'}
                          `}
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Legend */}
          <div className="flex gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 border-2 border-gray-200 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <span className="text-sm">Booked</span>
            </div>
          </div>
        </div>

        {/* Booking Button */}
        <div className="bg-white rounded-lg shadow-md p-4 sticky bottom-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Seats</p>
              <p className="text-2xl font-bold">{selectedSeats.length} / 40</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-red-600">₹{calculateTotal()}</p>
            </div>
            <button
              onClick={handleBooking}
              disabled={loading || selectedSeats.length === 0}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-red-700 transition"
            >
              {loading ? "Processing..." : `Pay ₹${calculateTotal()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;