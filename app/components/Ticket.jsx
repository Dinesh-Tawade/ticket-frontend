"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const Ticket = ({ booking, onDownload }) => {
  const ticketRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Ticket_${booking.bookingId}_${booking.movieName}`,
    onAfterPrint: () => {
      if (onDownload) onDownload(booking.bookingId);
      alert("✅ Ticket saved as PDF successfully!");
    },
    onPrintError: (error) => {
      console.error("Print error:", error);
      alert("Error generating ticket. Please try again.");
    },
  });

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    return time;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      case "EXPIRED":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "✅ CONFIRMED";
      case "PENDING":
        return "⏳ PENDING PAYMENT";
      case "CANCELLED":
        return "❌ CANCELLED";
      case "EXPIRED":
        return "⌛ EXPIRED";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Status Bar */}
      <div className={`${getStatusColor(booking.bookingStatus)} h-2`}></div>

      {/* Download Button */}
      {booking.bookingStatus === "CONFIRMED" && (
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Ticket (PDF)
          </button>
        </div>
      )}

      {/* Ticket Content */}
      <div ref={ticketRef} className="p-6">
        {/* Movie Theater Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-t-xl p-4 -mt-6 -mx-6 px-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🎬 MovieShows</h2>
              <p className="text-sm opacity-90">Your Entertainment Partner</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">Booking ID</p>
              <p className="font-mono font-bold">{booking.bookingId}</p>
            </div>
          </div>
        </div>

        {/* Movie Info Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Poster */}
          <div className="md:w-32 flex-shrink-0">
            <img
              src={booking.showId?.movie?.poster || "https://via.placeholder.com/120x180?text=No+Poster"}
              alt={booking.movieName}
              className="w-full h-48 md:h-40 object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/120x180?text=No+Poster";
              }}
            />
          </div>

          {/* Movie Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{booking.movieName}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {booking.showId?.movie?.genre && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-semibold">
                      {booking.showId.movie.genre}
                    </span>
                  )}
                  {booking.showId?.movie?.language && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-semibold">
                      {booking.showId.movie.language}
                    </span>
                  )}
                  {booking.showId?.movie?.duration && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-semibold">
                      🕐 {booking.showId.movie.duration} mins
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.bookingStatus)} text-white`}>
                  {getStatusText(booking.bookingStatus)}
                </div>
              </div>
            </div>

            {/* Theater Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">🏢</span>
                <div>
                  <p className="text-xs text-gray-500">Theater</p>
                  <p className="font-semibold text-gray-800">{booking.theaterId?.name || "Theater Name"}</p>
                  <p className="text-sm text-gray-600">{booking.theaterId?.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="font-semibold text-gray-800">{formatDate(booking.showDate)}</p>
                  <p className="text-sm text-gray-600">at {formatTime(booking.showTime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seats Info Section */}
        <div className="border-t border-b border-gray-200 py-4 my-4">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Seats</p>
              <div className="flex flex-wrap gap-2">
                {booking.seats?.map((seat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    🪑 {seat.rowName}{seat.seatNumber}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total Seats</p>
              <p className="text-2xl font-bold text-gray-800">{booking.totalSeats}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-red-600">₹{booking.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Barcode/QR Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-2xl mb-1">🎫</div>
                <div className="text-[8px] text-gray-400">SCAN ME</div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Scan at Theater Entrance</p>
              <p className="text-sm font-semibold text-gray-700">Show this ticket at the counter</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Booked on</p>
            <p className="text-sm font-semibold text-gray-700">
              {new Date(booking.bookedAt).toLocaleString()}
            </p>
            {booking.paymentStatus === "PAID" && (
              <p className="text-xs text-green-600 mt-1">✓ Payment Completed</p>
            )}
            {booking.paymentStatus === "FREE" && (
              <p className="text-xs text-blue-600 mt-1">✓ Free Booking</p>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            * Please arrive 15 minutes before show time. This ticket is non-transferable.
            Food and drinks from outside are not allowed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
