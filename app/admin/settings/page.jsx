"use client";
import React, { useState, useEffect } from 'react';
import { 
  getAllShowsAdmin, 
  updateShow, 
  setAllShowsPaymentMode,
  getMyTheaters,
  getMyShows
} from '../../services/adminCommunication';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [selectedShow, setSelectedShow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('shows'); // 'shows', 'bulk', 'theaters'

  // Fetch all shows
  const { data: showsData, isLoading: showsLoading } = useQuery({
    queryKey: ['admin-shows'],
    queryFn: getAllShowsAdmin,
  });

  // Update single show mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateShow(id, data),
    onSuccess: () => {
      toast.success('Show updated successfully!');
      queryClient.invalidateQueries(['admin-shows']);
      setIsModalOpen(false);
      setSelectedShow(null);
    },
    onError: (error) => {
      toast.error('Failed to update show: ' + error.message);
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: setAllShowsPaymentMode,
    onSuccess: () => {
      toast.success('All shows updated successfully!');
      queryClient.invalidateQueries(['admin-shows']);
    },
    onError: (error) => {
      toast.error('Failed to update shows: ' + error.message);
    }
  });

  const handleUpdateShow = (show) => {
    setSelectedShow(show);
    setIsModalOpen(true);
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updateData = {
      isPaid: formData.get('isPaid') === 'true',
      basePrice: parseInt(formData.get('basePrice')) || 0,
      status: formData.get('status'),
    };
    updateMutation.mutate({ id: selectedShow._id, data: updateData });
  };

  const handleBulkUpdate = (isPaid) => {
    if (window.confirm(`⚠️ Are you sure you want to set ALL shows to ${isPaid ? 'PAID' : 'FREE'} mode?\n\nThis will affect all existing and future shows.`)) {
      bulkUpdateMutation.mutate({ isPaid });
    }
  };

  const shows = showsData?.data || [];

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">⚙️ Admin Settings</h1>
          <p className="text-gray-600 mt-2">Manage system-wide configurations and show payment modes</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('shows')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎬 Show Payment Settings
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚡ Bulk Actions
            </button>
            <button
              onClick={() => setActiveTab('theaters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'theaters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏢 Theater Settings
            </button>
          </nav>
        </div>

        {/* Tab 1: Show Payment Settings */}
        {activeTab === 'shows' && (
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">How it works</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>• <strong>Paid shows</strong> require users to pay before booking confirmation</p>
                    <p>• <strong>Free shows</strong> get confirmed immediately without payment</p>
                    <p>• Click <strong>Edit</strong> on any show to change its payment mode</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shows Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold">All Shows</h2>
              </div>
              
              {showsLoading ? (
                <div className="p-8 text-center">Loading shows...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Theater</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {shows.map((show) => (
                        <tr key={show._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {show.movie?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {show.theater?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(show.showDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {show.startTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              show.isPaid ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {show.isPaid ? '💰 PAID' : '🎁 FREE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {show.isPaid ? `₹${show.basePrice}` : '₹0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              show.status === 'BOOKING_OPEN' ? 'bg-green-100 text-green-800' :
                              show.status === 'BOOKING_CLOSED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {show.status?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleUpdateShow(show)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Bulk Actions */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">⚡ Bulk Payment Mode Update</h2>
              <p className="text-gray-600 mb-6">
                Update all shows at once. This will override individual show settings.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Set All Paid */}
                <div className="border rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="text-lg font-semibold mb-2">Set All Shows to PAID</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Users will need to pay for all tickets
                  </p>
                  <button
                    onClick={() => handleBulkUpdate(true)}
                    disabled={bulkUpdateMutation.isLoading}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                  >
                    {bulkUpdateMutation.isLoading ? 'Updating...' : 'Make All Shows Paid'}
                  </button>
                </div>

                {/* Set All Free */}
                <div className="border rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">🎁</div>
                  <h3 className="text-lg font-semibold mb-2">Set All Shows to FREE</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    All tickets will be completely free
                  </p>
                  <button
                    onClick={() => handleBulkUpdate(false)}
                    disabled={bulkUpdateMutation.isLoading}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                  >
                    {bulkUpdateMutation.isLoading ? 'Updating...' : 'Make All Shows Free'}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                    <div className="mt-1 text-sm text-yellow-700">
                      This action will affect ALL shows in the system. Existing bookings will not be affected.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Theater Settings */}
        {activeTab === 'theaters' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🏢 General Theater Settings</h2>
            <p className="text-gray-600 mb-6">
              Configure global theater preferences and defaults.
            </p>
            
            <div className="space-y-4">
              {/* Default Payment Mode */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Payment Mode for New Shows
                </label>
                <select className="w-full md:w-64 px-3 py-2 border rounded-md">
                  <option value="paid">Paid (Default)</option>
                  <option value="free">Free</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This setting will apply to all new shows created
                </p>
              </div>

              {/* Default Ticket Price */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Ticket Price (₹)
                </label>
                <input 
                  type="number" 
                  defaultValue="200"
                  className="w-full md:w-64 px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default price for new paid shows
                </p>
              </div>

              {/* Max Seats Per Booking */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Seats Per Booking
                </label>
                <input 
                  type="number" 
                  defaultValue="10"
                  className="w-full md:w-64 px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Limit how many seats a user can book at once
                </p>
              </div>

              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Save Theater Settings
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && selectedShow && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Show Payment Mode</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmitUpdate}>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Movie: <span className="font-medium">{selectedShow.movie?.name}</span></p>
                  <p className="text-sm text-gray-600">Theater: <span className="font-medium">{selectedShow.theater?.name}</span></p>
                  <p className="text-sm text-gray-600">Date: <span className="font-medium">{new Date(selectedShow.showDate).toLocaleDateString()}</span></p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Payment Mode</label>
                  <select
                    name="isPaid"
                    defaultValue={selectedShow.isPaid}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="true">💰 Paid (Users must pay)</option>
                    <option value="false">🎁 Free (No payment required)</option>
                  </select>
                </div>

                <div className="mb-4" id="priceField">
                  <label className="block text-sm font-medium mb-2">Ticket Price (₹)</label>
                  <input
                    type="number"
                    name="basePrice"
                    defaultValue={selectedShow.basePrice}
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only applicable for paid shows</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Booking Status</label>
                  <select
                    name="status"
                    defaultValue={selectedShow.status}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="BOOKING_OPEN">Open for Booking</option>
                    <option value="BOOKING_CLOSED">Closed for Booking</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {updateMutation.isLoading ? 'Updating...' : 'Update Show'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminSettingsPage;