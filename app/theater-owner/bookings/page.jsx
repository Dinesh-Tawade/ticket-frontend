"use client";

import React from "react";
import { FaTicketAlt, FaCheckCircle, FaClock } from "react-icons/fa";

const BookingsPage = () => {
  const bookings = [
    { id: "BK001", movie: "Inception", customer: "John Doe", seats: "A1, A2", amount: 600, status: "confirmed", date: "2024-01-15" },
    { id: "BK002", movie: "The Dark Knight", customer: "Jane Smith", seats: "B5", amount: 300, status: "confirmed", date: "2024-01-15" },
    { id: "BK003", movie: "Interstellar", customer: "Mike Johnson", seats: "C3, C4, C5", amount: 900, status: "pending", date: "2024-01-16" },
    { id: "BK004", movie: "Avatar", customer: "Sarah Williams", seats: "D1, D2", amount: 700, status: "confirmed", date: "2024-01-17" },
  ];

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          Bookings
        </h1>
        <p style={{ color: "var(--foreground)", opacity: 0.6 }}>
          View and manage all customer bookings
        </p>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--card)",
          borderColor: "var(--card-border)",
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Booking ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Movie</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Seats</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="px-6 py-4 text-sm font-medium" style={{ color: "var(--purple)" }}>{booking.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FaTicketAlt style={{ color: "var(--blue)" }} />
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>{booking.movie}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{booking.customer}</td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{booking.seats}</td>
                <td className="px-6 py-4 text-sm font-medium" style={{ color: "var(--green)" }}>₹{booking.amount}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {booking.status === "confirmed" ? (
                      <>
                        <FaCheckCircle style={{ color: "var(--green)" }} />
                        <span style={{ color: "var(--green)" }}>Confirmed</span>
                      </>
                    ) : (
                      <>
                        <FaClock style={{ color: "var(--yellow)" }} />
                        <span style={{ color: "var(--yellow)" }}>Pending</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{booking.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;
