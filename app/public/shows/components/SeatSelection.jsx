"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAvailableSeats, createBooking, confirmPayment } from "@/app/services/publicCommunication";
import { useQuery, useMutation } from "@tanstack/react-query";

function SeatSelection({ showId, showDetails, onBack }) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const { data: seatData, isLoading, error } = useQuery({
    queryKey: ["seats", showId],
    queryFn: () => getAvailableSeats(showId),
    enabled: !!showId,
  });

  const createBookingMutation = useMutation({
    mutationFn: (seats) => createBooking({ showId, seats }),
    onSuccess: (data) => {
      setBookingData(data.data);
      if (data.data.paymentStatus === "FREE") {
        alert("✅ Booking confirmed successfully!");
        router.push("/public/my-bookings");
      } else {
        alert("⏰ Please complete payment within 15 minutes");
      }
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Booking failed. Please try again.");
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (bookingId) => confirmPayment(bookingId),
    onSuccess: () => {
      alert("✅ Payment successful! Booking confirmed.");
      router.push("/public/my-bookings");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Payment failed. Please try again.");
    },
  });

  useEffect(() => {
    if (bookingData?.expiresAt && bookingData.paymentStatus === "PENDING") {
      const interval = setInterval(() => {
        const expiry = new Date(bookingData.expiresAt);
        const now = new Date();
        const diff = expiry - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft("Expired");
          alert("Booking time expired! Please book again.");
          router.push("/public/shows");
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [bookingData, router]);

  const handleSeatSelect = (categoryName, rowName, seatNumber, price) => {
    const seatKey = `${categoryName}-${rowName}-${seatNumber}`;
    
    if (selectedSeats.some(seat => seat.seatKey === seatKey)) {
      setSelectedSeats(selectedSeats.filter(seat => seat.seatKey !== seatKey));
    } else {
      if (selectedSeats.length >= 10) {
        alert("You can select maximum 10 seats per booking");
        return;
      }
      setSelectedSeats([...selectedSeats, {
        seatKey,
        rowName,
        seatNumber,
        category: categoryName,
        price
      }]);
    }
  };

  const handleProceedToBook = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    const seatsToBook = selectedSeats.map(seat => ({
      rowName: seat.rowName,
      seatNumber: seat.seatNumber,
    }));

    createBookingMutation.mutate(seatsToBook);
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading seats. Please try again.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">
          Go Back
        </button>
      </div>
    );
  }

  // Payment Modal for Paid Shows
  if (bookingData && bookingData.paymentStatus === "PENDING") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Time remaining:</p>
              <p className="text-3xl font-bold text-red-600">{timeLeft || "14:59"}</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-semibold">{bookingData.bookingId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-red-600 text-xl">₹{bookingData.totalAmount}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => confirmPaymentMutation.mutate(bookingData.bookingId)}
                disabled={confirmPaymentMutation.isPending}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                {confirmPaymentMutation.isPending ? "Processing..." : "Confirm Payment"}
              </button>
              <button
                onClick={() => router.push("/public/shows")}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const seatMap = seatData?.data?.seatMap;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
          ← Back to Shows
        </button>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-xl font-bold">{showDetails?.movie?.name}</h2>
          <p className="text-gray-600">
            {showDetails?.theaterId?.name} | {new Date(showDetails?.showDate).toLocaleDateString()} | {showDetails?.startTime}
          </p>
          {showDetails?.isPaid ? (
            <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">💰 Paid Show</span>
          ) : (
            <span className="inline-block mt-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">🎉 Free Show</span>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Select Your Seats</h3>
          
          <div className="relative mb-8">
            <div className="h-2 bg-gray-300 rounded-full mx-auto w-3/4"></div>
            <p className="text-center text-gray-500 text-sm mt-2">SCREEN</p>
          </div>

          <div className="space-y-6 mb-8">
            {seatMap && Object.entries(seatMap).map(([categoryName, rows]) => (
              <div key={categoryName} className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3">{categoryName}</h4>
                {Object.entries(rows).map(([rowName, seats]) => (
                  <div key={rowName} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono font-bold text-gray-500 w-8">{rowName}</span>
                      <div className="flex flex-wrap gap-2">
                        {seats.map((seat) => {
                          const isSelected = selectedSeats.some(
                            s => s.rowName === rowName && s.seatNumber === seat.seatNumber
                          );
                          return (
                            <button
                              key={seat.seatNumber}
                              onClick={() => handleSeatSelect(categoryName, rowName, seat.seatNumber, seat.price)}
                              disabled={seat.isBooked}
                              className={`
                                w-10 h-10 rounded-lg text-sm font-semibold transition-all
                                ${seat.isBooked 
                                  ? "bg-gray-300 cursor-not-allowed text-gray-500" 
                                  : isSelected
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                }
                              `}
                            >
                              {seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-blue-100 rounded"></div><span className="text-sm">Available</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-green-600 rounded"></div><span className="text-sm">Selected</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-gray-300 rounded"></div><span className="text-sm">Booked</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sticky bottom-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-gray-600">Selected Seats: <span className="font-semibold">{selectedSeats.length}</span></p>
              <p className="text-gray-600">Total Amount: <span className="font-bold text-red-600 text-xl">₹{totalAmount}</span></p>
            </div>
            <button
              onClick={handleProceedToBook}
              disabled={createBookingMutation.isPending || selectedSeats.length === 0}
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
            >
              {createBookingMutation.isPending ? "Processing..." : "Proceed to Book"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelection;