"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { confirmPayment, getMyBookings } from "@/app/services/publicCommunication";
import { useQuery, useMutation } from "@tanstack/react-query";

function PaymentPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(null);

  const { data: bookingsData } = useQuery({
    queryKey: ["myBookings"],
    queryFn: getMyBookings,
  });

  const booking = bookingsData?.data?.find(b => b.bookingId === bookingId);

  const confirmPaymentMutation = useMutation({
    mutationFn: () => confirmPayment(bookingId),
    onSuccess: () => {
      alert("Payment successful! Booking confirmed.");
      router.push("/public/my-bookings");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Payment failed");
    },
  });

  useEffect(() => {
    if (booking?.expiresAt) {
      const interval = setInterval(() => {
        const expiry = new Date(booking.expiresAt);
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
  }, [booking, router]);

  if (!booking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Time remaining:</p>
            <p className="text-3xl font-bold text-red-600">{timeLeft || "14:59"}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Movie:</span>
              <span className="font-semibold">{booking.movieName}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Seats:</span>
              <span className="font-semibold">
                {booking.seats?.map(s => `${s.rowName}${s.seatNumber}`).join(", ")}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-red-600 text-xl">₹{booking.totalAmount}</span>
            </div>
          </div>

          <button
            onClick={() => confirmPaymentMutation.mutate()}
            disabled={confirmPaymentMutation.isPending}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
          >
            {confirmPaymentMutation.isPending ? "Processing..." : "Pay Now"}
          </button>

          <button
            onClick={() => router.push("/public/my-bookings")}
            className="w-full mt-3 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;