// components/TheaterBookingsManagement.jsx
'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyBookings } from '../../services/adminCommunication';

const TheaterBookingsManagement = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    data: bookingsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: getMyBookings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status) => {
    const colorMap = {
      'CONFIRMED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadgeColor = (status) => {
    const colorMap = {
      'PAID': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getFilteredBookings = () => {
    if (!bookingsData?.data) return [];
    
    let filtered = [...bookingsData.data];
    
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(booking => booking.bookingStatus === filterStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.movieName?.toLowerCase().includes(term) ||
        booking.bookingId?.toLowerCase().includes(term) ||
        booking.userId?.name?.toLowerCase().includes(term) ||
        booking.userId?.email?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const filteredBookings = getFilteredBookings();
  const summary = bookingsData?.summary;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="mt-4 text-lg text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error! </strong>
          <span>{error.response?.data?.message || error.message || 'Failed to load bookings'}</span>
          <button onClick={() => refetch()} className="mt-3 bg-red-600 text-white px-4 py-2 rounded">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Theater Bookings</h1>
        <button onClick={() => refetch()} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-500">Total Bookings</div>
            <div className="text-2xl font-bold">{summary.totalBookings}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">₹{summary.totalRevenue?.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-500">Confirmed</div>
            <div className="text-2xl font-bold text-green-600">{summary.confirmedBookings}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="text-sm text-gray-500">Cancelled</div>
            <div className="text-2xl font-bold text-red-600">{summary.cancelledBookings}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="text-sm text-gray-500">Total Seats</div>
            <div className="text-2xl font-bold text-purple-600">{summary.totalSeatsBooked}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by movie, booking ID, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg ${
                  filterStatus === status ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 text-gray-600">Showing {filteredBookings.length} of {bookingsData?.count || 0} bookings</div>

      {/* Bookings Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seats</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <React.Fragment key={booking._id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedBooking(selectedBooking === booking._id ? null : booking._id)}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{booking.bookingId}</div>
                      <div className="text-xs text-gray-500">{formatDateTime(booking.bookedAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{booking.movieName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{booking.userId?.name}</div>
                      <div className="text-xs text-gray-500">{booking.userId?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{formatDate(booking.showDate)}</div>
                      <div className="text-xs text-gray-500">{booking.showTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{booking.totalSeats} seats</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">₹{booking.totalAmount}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                  </tr>
                  {selectedBooking === booking._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="8" className="px-4 py-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Booking Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="text-gray-500">Booked At:</span> <span className="ml-2">{formatDateTime(booking.bookedAt)}</span></div>
                            <div><span className="text-gray-500">Expires At:</span> <span className="ml-2">{formatDateTime(booking.expiresAt)}</span></div>
                            {booking.cancelledAt && <div><span className="text-gray-500">Cancelled At:</span> <span className="ml-2">{formatDateTime(booking.cancelledAt)}</span></div>}
                            {booking.cancelledBy && <div><span className="text-gray-500">Cancelled By:</span> <span className="ml-2">{booking.cancelledBy}</span></div>}
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Seat Details:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {booking.seats?.map((seat, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border">
                                  <div className="text-sm font-medium">Row {seat.rowName}, Seat {seat.seatNumber}</div>
                                  <div className="text-xs text-gray-500">{seat.category} - ₹{seat.price}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No bookings found</p>
        </div>
      )}
    </div>
  );
};

export default TheaterBookingsManagement;