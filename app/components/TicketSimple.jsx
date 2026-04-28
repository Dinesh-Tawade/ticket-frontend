"use client";

import React, { useRef } from "react";

const TicketSimple = ({ booking, onDownload }) => {
  const ticketRef = useRef(null);

  const handlePrint = () => {
    const printContent = ticketRef.current;
    const originalContent = document.body.innerHTML;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket_${booking.bookingId}_${booking.movieName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .ticket-container {
              max-width: 800px;
              margin: 0 auto;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <div class="ticket-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    if (onDownload) onDownload(booking.bookingId);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
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
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className={`${getStatusColor(booking.bookingStatus)} h-2`}></div>

      {booking.bookingStatus === "CONFIRMED" && (
        <div className="flex justify-end p-4 pb-0 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download / Print Ticket
          </button>
        </div>
      )}

      {/* Ticket Content */}
      <div ref={ticketRef} className="p-6">
        {/* Header */}
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

        {/* Movie Info */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
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

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{booking.movieName}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-semibold">
                    {booking.showId?.movie?.genre || "N/A"}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-semibold">
                    {booking.showId?.movie?.language || "N/A"}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-semibold">
                    🕐 {booking.showId?.movie?.duration || "N/A"} mins
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.bookingStatus)} text-white`}>
                  {getStatusText(booking.bookingStatus)}
                </div>
              </div>
            </div>

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
                  <p className="text-sm text-gray-600">at {booking.showTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seats */}
        <div className="border-t border-b border-gray-200 py-4 my-4">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Seats</p>
              <div className="flex flex-wrap gap-2">
                {booking.seats?.map((seat, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
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

        {/* Footer */}
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
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            * Please arrive 15 minutes before show time. This ticket is non-transferable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketSimple;