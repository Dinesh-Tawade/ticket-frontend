"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyBookings, cancelBooking } from "@/app/services/publicCommunication";
import Ticket from "@/app/components/Ticket"; // or TicketSimple

function MyBookings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALL");

  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ["myBookings"],
    queryFn: getMyBookings,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      alert("Booking cancelled successfully!");
      queryClient.invalidateQueries(["myBookings"]);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to cancel booking");
    },
  });

  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const bookings = bookingsData?.data || [];
  
  const filteredBookings = filter === "ALL" 
    ? bookings 
    : bookings.filter(b => b.bookingStatus === filter);

  const getStatusCount = (status) => {
    if (status === "ALL") return bookings.length;
    return bookings.filter(b => b.bookingStatus === status).length;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">Error loading bookings. Please login first.</p>
          <button
            onClick={() => router.push("/public/shows")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Browse Shows
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-red-600">🎬 My Bookings</h1>
              <p className="text-gray-500 text-sm">Your ticket history</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/public/shows")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700"
              >
                ← Browse Shows
              </button>
              <button
                onClick={() => router.push("/")}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div 
            onClick={() => setFilter("ALL")}
            className={`bg-white rounded-lg shadow-md p-4 text-center cursor-pointer hover:shadow-lg transition ${filter === "ALL" ? "ring-2 ring-red-500" : ""}`}
          >
            <p className="text-2xl font-bold text-gray-800">{getStatusCount("ALL")}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div 
            onClick={() => setFilter("CONFIRMED")}
            className={`bg-green-50 rounded-lg shadow-md p-4 text-center cursor-pointer hover:shadow-lg transition ${filter === "CONFIRMED" ? "ring-2 ring-green-500" : ""}`}
          >
            <p className="text-2xl font-bold text-green-600">{getStatusCount("CONFIRMED")}</p>
            <p className="text-sm text-green-600">Confirmed</p>
          </div>
          <div 
            onClick={() => setFilter("PENDING")}
            className={`bg-yellow-50 rounded-lg shadow-md p-4 text-center cursor-pointer hover:shadow-lg transition ${filter === "PENDING" ? "ring-2 ring-yellow-500" : ""}`}
          >
            <p className="text-2xl font-bold text-yellow-600">{getStatusCount("PENDING")}</p>
            <p className="text-sm text-yellow-600">Pending</p>
          </div>
          <div 
            onClick={() => setFilter("CANCELLED")}
            className={`bg-red-50 rounded-lg shadow-md p-4 text-center cursor-pointer hover:shadow-lg transition ${filter === "CANCELLED" ? "ring-2 ring-red-500" : ""}`}
          >
            <p className="text-2xl font-bold text-red-600">{getStatusCount("CANCELLED")}</p>
            <p className="text-sm text-red-600">Cancelled</p>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No {filter !== "ALL" ? filter : ""} Bookings Found</h3>
            <p className="text-gray-600 mb-6">You haven't booked any tickets yet.</p>
            <button
              onClick={() => router.push("/public/shows")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              Book Your First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="relative">
                <Ticket booking={booking} />
                
                {/* Action Buttons */}
                <div className="mt-4 flex gap-3 justify-end">
                  {booking.bookingStatus === "PENDING" && (
                    <>
                      <button
                        onClick={() => router.push(`/public/payment/${booking.bookingId}`)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                      >
                        Complete Payment
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {booking.bookingStatus === "CONFIRMED" && (
                    <button
                      onClick={() => handleCancelBooking(booking.bookingId)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyBookings;