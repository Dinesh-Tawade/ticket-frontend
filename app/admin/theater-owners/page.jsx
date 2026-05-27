"use client";
import React, { useState, useEffect } from 'react';
import { createTheaterOwner, getAllTheatersAdmin, getTheaterByIdAdmin } from '../../services/adminCommunication';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';

function Page() {
  const [theaterOwner, setTheaterOwner] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  // Theater Owner Seat Access States
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedZoneName, setSelectedZoneName] = useState("");
  const [zoneOptions, setZoneOptions] = useState([]);
  const [seatsInZone, setSeatsInZone] = useState([]);
  const [selectedSeatKeys, setSelectedSeatKeys] = useState([]);

  // Fetch all theaters for dropdown
  const { data: theatersData } = useQuery({
    queryKey: ["adminTheatersForOwnerAccess"],
    queryFn: () => getAllTheatersAdmin(),
  });

  const theaters = theatersData?.data || [];

  // Fetch selected theater details
  const { data: theaterDetailData } = useQuery({
    queryKey: ["adminTheaterDetailOwner", selectedTheaterId],
    queryFn: () => getTheaterByIdAdmin(selectedTheaterId),
    enabled: !!selectedTheaterId,
  });

  useEffect(() => {
    if (theaterDetailData?.data) {
      setSelectedTheater(theaterDetailData.data);
    }
  }, [theaterDetailData]);

  // Reset selections when theater changes
  useEffect(() => {
    setSelectedScreenId("");
    setSelectedZoneId("");
    setSelectedZoneName("");
    setZoneOptions([]);
    setSeatsInZone([]);
    setSelectedSeatKeys([]);
  }, [selectedTheaterId]);

  // Load zones when screen is selected
  useEffect(() => {
    if (!selectedScreenId || !selectedTheater) {
      setZoneOptions([]);
      setSelectedZoneId("");
      return;
    }

    const screen = selectedTheater.screens?.find(s => s._id === selectedScreenId);
    if (screen?.zones) {
      setZoneOptions(screen.zones);
    }
  }, [selectedScreenId, selectedTheater]);

  // Load seats when zone is selected
  useEffect(() => {
    if (!selectedZoneId || !selectedTheater || !selectedScreenId) {
      setSeatsInZone([]);
      return;
    }

    const screen = selectedTheater.screens?.find(s => s._id === selectedScreenId);
    const zone = screen?.zones?.find(z => z.id === selectedZoneId);

    if (zone?.rows) {
      const allSeats = [];
      zone.rows.forEach((row) => {
        row.seats?.forEach((seat) => {
          if (!seat.isBooked) {
            allSeats.push({
              rowName: row.rowName,
              seatNumber: seat.seatNumber,
              seatKey: `${row.rowName}${seat.seatNumber}`,
              isBooked: seat.isBooked,
            });
          }
        });
      });
      setSeatsInZone(allSeats);
    }
  }, [selectedZoneId, selectedTheater, selectedScreenId]);

  const handleSeatToggle = (seatKey) => {
    setSelectedSeatKeys((prev) =>
      prev.includes(seatKey) ? prev.filter((k) => k !== seatKey) : [...prev, seatKey]
    );
  };

  const handleSelectAllSeats = () => {
    if (selectedSeatKeys.length === seatsInZone.length) {
      setSelectedSeatKeys([]);
    } else {
      setSelectedSeatKeys(seatsInZone.map(seat => seat.seatKey));
    }
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: createTheaterOwner,
    onSuccess: () => {
      toast.success('Theater owner created successfully with seat access!');
      // Reset form
      setTheaterOwner({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
      });
      // Reset seat access states
      setSelectedTheaterId("");
      setSelectedScreenId("");
      setSelectedZoneId("");
      setSelectedZoneName("");
      setZoneOptions([]);
      setSeatsInZone([]);
      setSelectedSeatKeys([]);
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    }
  });

  const handleChange = (e) => {
    setTheaterOwner({
      ...theaterOwner,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare payload with seat access
    const payload = {
      ...theaterOwner,
      accessibleSeats: []
    };

    // Add seat access if selected
    if (selectedTheaterId && selectedZoneId && selectedSeatKeys.length > 0) {
      const seatNumbers = selectedSeatKeys.map(key => {
        const match = key.match(/([A-Z]+)(\d+)/);
        return match ? `${match[1]}${match[2]}` : key;
      });

      payload.accessibleSeats = [{
        theaterId: selectedTheaterId,
        screenId: selectedScreenId,
        zoneId: selectedZoneId,
        zoneName: selectedZoneName,
        seatNumbers: seatNumbers,
        isActive: true
      }];
    }

    mutate(payload);
  };

  return (
    <>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: 'green',
              color: 'white',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'red',
              color: 'white',
            },
          },
        }}
      />
      
      <div className="max-w-6xl mx-auto p-6">
        <h1 className='text-2xl font-bold mb-4'>Add Theater Owner</h1>
        <p className='text-gray-600 mb-6'>Use the form below to add a new theater owner and assign them seat access.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Owner Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={theaterOwner.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={theaterOwner.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={theaterOwner.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={theaterOwner.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={theaterOwner.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Seat Access Assignment Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Assign Seat Access to Theater Owner</h2>
            <p className="text-sm text-gray-500 mb-4">Select theater, screen, zone and assign specific seats to this theater owner.</p>
            
            {/* Theater Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Theater *</label>
              <select
                value={selectedTheaterId}
                onChange={(e) => setSelectedTheaterId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a theater --</option>
                {theaters.map((theater) => (
                  <option key={theater._id} value={theater._id}>
                    {theater.name} - {theater.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Screen Selection */}
            {selectedTheaterId && selectedTheater?.screens?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Screen *</label>
                <select
                  value={selectedScreenId}
                  onChange={(e) => setSelectedScreenId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a screen --</option>
                  {selectedTheater.screens.map((screen) => (
                    <option key={screen._id} value={screen._id}>
                      Screen {screen.screenNumber} - {screen.name || "Unnamed"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Zone Selection */}
            {selectedScreenId && zoneOptions.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Zone *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {zoneOptions.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        setSelectedZoneId(zone.id);
                        setSelectedZoneName(zone.seatType);
                        setSelectedSeatKeys([]);
                      }}
                      className={`p-3 rounded-lg border text-sm font-medium transition ${
                        selectedZoneId === zone.id
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {zone.seatType} - ₹{zone.finalPrice}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seat Selection */}
            {selectedZoneId && seatsInZone.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Select Seats to Assign *</label>
                  <button
                    type="button"
                    onClick={handleSelectAllSeats}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedSeatKeys.length === seatsInZone.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-lg border p-3">
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {seatsInZone.map((seat) => (
                      <label
                        key={seat.seatKey}
                        className={`flex items-center justify-center gap-2 rounded px-2 py-1 cursor-pointer transition ${
                          selectedSeatKeys.includes(seat.seatKey)
                            ? 'bg-blue-100 border-blue-400'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        } border`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSeatKeys.includes(seat.seatKey)}
                          onChange={() => handleSeatToggle(seat.seatKey)}
                          className="h-4 w-4 rounded"
                        />
                        <span className="text-xs font-medium">
                          {seat.rowName}{seat.seatNumber}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <strong>{selectedSeatKeys.length}</strong> seat(s)
                </p>
              </div>
            )}

            {selectedZoneId && seatsInZone.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                No available seats found in this zone. All seats might be booked.
              </div>
            )}

            {selectedTheaterId && !selectedScreenId && selectedTheater?.screens?.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                No screens found in this theater. Please add screens first.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 cursor-pointer"
            >
              {isLoading ? 'Creating...' : 'Create Theater Owner with Seat Access'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Page;