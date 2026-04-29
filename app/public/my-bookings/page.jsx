"use client";

import React, { useState, useEffect } from "react";
import { getMyBookings, cancelBooking } from "@/app/services/publicCommunication";
import { generateTicketPDF, generateTicketHTML, generateQRCode } from "../../services/ticketGenerator";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (booking) => {
    const bookingInfo = {
      bookingId: booking.bookingId,
      movieName: booking.movieName,
      showDate: new Date(booking.showDate).toLocaleDateString(),
      showTime: booking.showTime,
      theaterName: booking.theaterId?.name || "Theater",
      seats: booking.seats,
      totalAmount: booking.totalAmount
    };
    
    await generateTicketPDF(bookingInfo, { movie: { poster: null, genre: "N/A", language: "N/A" } });
  };

  const handleViewTicket = async (booking) => {
    const bookingInfo = {
      bookingId: booking.bookingId,
      movieName: booking.movieName,
      showDate: new Date(booking.showDate).toLocaleDateString(),
      showTime: booking.showTime,
      theaterName: booking.theaterId?.name || "Theater",
      seats: booking.seats,
      totalAmount: booking.totalAmount
    };
    
    const qrCodeUrl = await generateQRCode(bookingInfo);
    const ticketHtml = generateTicketHTML(bookingInfo, { movie: { poster: null } }, qrCodeUrl);
    
    const ticketWindow = window.open();
    ticketWindow.document.write(ticketHtml);
    ticketWindow.document.close();
  };

  const handleCancelBooking = async (bookingId) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        const res = await cancelBooking(bookingId);
        if (res.success) {
          alert("Booking cancelled successfully");
          fetchBookings(); // Refresh list
        }
      } catch (error) {
        alert("Failed to cancel booking");
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      case 'EXPIRED': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{booking.movieName}</h2>
                      <p className="text-gray-600 text-sm">{booking.theaterId?.name}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-semibold">{new Date(booking.showDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-semibold">{booking.showTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Seats</p>
                      <p className="font-semibold">{booking.seats.map(s => `${s.rowName}${s.seatNumber}`).join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-semibold text-red-600">₹{booking.totalAmount}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleViewTicket(booking)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      View Ticket
                    </button>
                    <button
                      onClick={() => handleDownloadTicket(booking)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                    >
                      Download PDF
                    </button>
                    {(booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'PENDING') && (
                      <button
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;