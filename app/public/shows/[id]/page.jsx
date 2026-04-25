"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMyBookings, cancelBooking } from "@/app/services/booking";

function MyBookings() {
  const router = useRouter();
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ["myBookings"],
    queryFn: getMyBookings,
  });

  const handleCancelBooking = async (bookingId) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        await cancelBooking(bookingId);
        alert("Booking cancelled successfully!");
        refetch();
      } catch (error) {
        console.error("Cancel error:", error);
        alert("Failed to cancel booking");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-600 cursor-pointer" onClick={() => router.push('/')}>
              🎬 MovieShows
            </h1>
            <button 
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Book Tickets
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
        
        <div className="space-y-4">
          {bookings?.data?.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{booking.showId?.movie?.name}</h3>
                  <p className="text-gray-600">{booking.showId?.theaterId?.name}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(booking.showId?.showDate).toLocaleDateString()} | {booking.showId?.startTime}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  booking.paymentStatus === "PAID" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {booking.paymentStatus === "PAID" ? "Confirmed" : "Pending"}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="font-semibold mb-2">Seats:</p>
                <div className="flex flex-wrap gap-2">
                  {booking.seats?.map((seat, idx) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {seat.rowName}{seat.seatNumber} ({seat.category})
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <p className="font-bold text-lg">Total: ₹{booking.totalAmount}</p>
                  <p className="text-sm text-gray-500">Booking ID: {booking.bookingId}</p>
                </div>
              </div>

              {booking.paymentStatus !== "PAID" && (
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => router.push(`/payment/${booking.bookingId}`)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Complete Payment
                  </button>
                  <button 
                    onClick={() => handleCancelBooking(booking.bookingId)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {bookings?.data?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-gray-500 text-lg">No bookings found</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Book Now
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyBookings;