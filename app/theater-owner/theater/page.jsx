// TheaterManagementPage.jsx
'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  theaterDetails,
  theaterUpdate,
  theaterAllScreens,
  newScreens,
  screenUpdate,
  deleteTheaters
} from '../../services/adminCommunication';

const TheaterManagementPage = () => {
  const queryClient = useQueryClient();
  const theaterId = "69e9c32ed6d20d1b792b023e"; // Your theater ID
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingScreen, setIsAddingScreen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [theaterForm, setTheaterForm] = useState({
    name: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    contactNumber: ''
  });
  
  const [screenForm, setScreenForm] = useState({
    screenNumber: '',
    name: '',
    totalRows: '',
    totalColumns: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Query: Get Theater Details
  const { 
    data: theaterData, 
    isLoading: theaterLoading, 
    error: theaterError,
    refetch: refetchTheater
  } = useQuery({
    queryKey: ['theater', theaterId],
    queryFn: () => theaterDetails(theaterId),
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to load theater', 'error');
    }
  });

  // Query: Get All Screens
  const { 
    data: screensData, 
    isLoading: screensLoading, 
    error: screensError,
    refetch: refetchScreens
  } = useQuery({
    queryKey: ['screens', theaterId],
    queryFn: () => theaterAllScreens(theaterId),
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to load screens', 'error');
    }
  });

  // Mutation: Update Theater
  const updateTheaterMutation = useMutation({
    mutationFn: theaterUpdate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['theater', theaterId] });
      showToast(data.message || 'Theater updated successfully');
      setIsEditing(false);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to update theater', 'error');
    }
  });

  // Mutation: Add Screen
  const addScreenMutation = useMutation({
    mutationFn: newScreens,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens', theaterId] });
      showToast('Screen added successfully');
      setIsAddingScreen(false);
      setScreenForm({ screenNumber: '', name: '', totalRows: '', totalColumns: '' });
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to add screen', 'error');
    }
  });

  // Mutation: Update Screen
  const updateScreenMutation = useMutation({
    mutationFn: screenUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens', theaterId] });
      showToast('Screen updated successfully');
      setEditingScreen(null);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to update screen', 'error');
    }
  });

  // Mutation: Delete Theater
  const deleteTheaterMutation = useMutation({
    mutationFn: deleteTheaters,
    onSuccess: () => {
      showToast('Theater deleted successfully');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to delete theater', 'error');
    }
  });

  const handleEditTheater = () => {
    const theater = theaterData?.data;
    if (theater) {
      setTheaterForm({
        name: theater.name || '',
        location: theater.location || '',
        city: theater.city || '',
        state: theater.state || '',
        pincode: theater.pincode || '',
        contactNumber: theater.contactNumber || ''
      });
      setIsEditing(true);
    }
  };

  const handleUpdateTheater = (e) => {
    e.preventDefault();
    updateTheaterMutation.mutate({ id: theaterId, data: theaterForm });
  };

  const handleAddScreen = (e) => {
    e.preventDefault();
    addScreenMutation.mutate({ 
      id: theaterId, 
      data: {
        screenNumber: parseInt(screenForm.screenNumber),
        name: screenForm.name,
        totalRows: parseInt(screenForm.totalRows),
        totalColumns: parseInt(screenForm.totalColumns),
        seatRows: []
      }
    });
  };

  const handleUpdateScreen = (screenId, status) => {
    updateScreenMutation.mutate({ 
      theaterId, 
      screenId, 
      data: { status } 
    });
  };

  const handleDeleteTheater = () => {
    if (window.confirm('Are you sure you want to delete this theater? This action cannot be undone.')) {
      deleteTheaterMutation.mutate(theaterId);
    }
  };

  if (theaterLoading || screensLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading theater details...</p>
        </div>
      </div>
    );
  }

  if (theaterError || screensError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading data. Please try again.</p>
          <button 
            onClick={() => {
              refetchTheater();
              refetchScreens();
            }}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const theater = theaterData?.data;
  const screens = screensData?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-in slide-in-from-right`}>
          {toast.message}
        </div>
      )}

      {/* Theater Details Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Theater Management</h1>
            <p className="text-gray-500 mt-1">Manage your theater details and screens</p>
          </div>
          <div className="space-x-3">
            <button
              onClick={handleEditTheater}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              ✏️ Edit Theater
            </button>
            <button
              onClick={handleDeleteTheater}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              🗑️ Delete Theater
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateTheater} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theater Name *</label>
                <input
                  type="text"
                  value={theaterForm.name}
                  onChange={(e) => setTheaterForm({ ...theaterForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={theaterForm.location}
                  onChange={(e) => setTheaterForm({ ...theaterForm, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={theaterForm.city}
                  onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={theaterForm.state}
                  onChange={(e) => setTheaterForm({ ...theaterForm, state: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={theaterForm.pincode}
                  onChange={(e) => setTheaterForm({ ...theaterForm, pincode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  value={theaterForm.contactNumber}
                  onChange={(e) => setTheaterForm({ ...theaterForm, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={updateTheaterMutation.isPending}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {updateTheaterMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-semibold">🏢 Name:</span> {theater?.name}</p>
              <p className="text-gray-700"><span className="font-semibold">📍 Location:</span> {theater?.location}</p>
              <p className="text-gray-700"><span className="font-semibold">🏙️ City:</span> {theater?.city}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-semibold">🗺️ State:</span> {theater?.state}</p>
              <p className="text-gray-700"><span className="font-semibold">📮 Pincode:</span> {theater?.pincode}</p>
              <p className="text-gray-700"><span className="font-semibold">📞 Contact:</span> {theater?.contactNumber}</p>
            </div>
          </div>
        )}
      </div>

      {/* Screens Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Screens</h2>
            <p className="text-gray-500 mt-1">Manage screens and their configurations</p>
          </div>
          <button
            onClick={() => setIsAddingScreen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            + Add New Screen
          </button>
        </div>

        {/* Add Screen Form */}
        {isAddingScreen && (
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">Add New Screen</h3>
            <form onSubmit={handleAddScreen} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screen Number *</label>
                  <input
                    type="number"
                    value={screenForm.screenNumber}
                    onChange={(e) => setScreenForm({ ...screenForm, screenNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screen Name *</label>
                  <input
                    type="text"
                    value={screenForm.name}
                    onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Rows *</label>
                  <input
                    type="number"
                    value={screenForm.totalRows}
                    onChange={(e) => setScreenForm({ ...screenForm, totalRows: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Columns *</label>
                  <input
                    type="number"
                    value={screenForm.totalColumns}
                    onChange={(e) => setScreenForm({ ...screenForm, totalColumns: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={addScreenMutation.isPending}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {addScreenMutation.isPending ? 'Adding...' : 'Add Screen'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingScreen(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Screens Grid */}
        {screens.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No screens found</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add New Screen" to create one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screens.map((screen) => (
              <div key={screen._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Screen {screen.screenNumber}
                    </h3>
                    <p className="text-gray-600 text-sm">{screen.name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    screen.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {screen.status}
                  </span>
                </div>

                <div className="mb-3 space-y-1">
                  <p className="text-sm text-gray-600">
                    📐 Layout: {screen.totalRows} rows × {screen.totalColumns} columns
                  </p>
                  <p className="text-sm text-gray-600">
                    💺 Total Seats: {screen.totalRows * screen.totalColumns}
                  </p>
                  {screen.seatRows && (
                    <p className="text-sm text-gray-600">
                      🏷️ Categories: {screen.seatRows.length} types
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  {editingScreen === screen._id ? (
                    <>
                      <button
                        onClick={() => handleUpdateScreen(screen._id, 'ACTIVE')}
                        disabled={updateScreenMutation.isPending}
                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors text-sm"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleUpdateScreen(screen._id, 'INACTIVE')}
                        disabled={updateScreenMutation.isPending}
                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        Deactivate
                      </button>
                      <button
                        onClick={() => setEditingScreen(null)}
                        className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingScreen(screen._id)}
                      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TheaterManagementPage;