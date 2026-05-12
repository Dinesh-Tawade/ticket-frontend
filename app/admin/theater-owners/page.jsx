"use client";
import React, { useState } from 'react';
import { createTheaterOwner } from '../../services/adminCommunication';
import { useMutation } from '@tanstack/react-query';

function Page() {
  const [theaterOwner, setTheaterOwner] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    theaters: [
      {
        theaterName: '',
        theaterLocation: '',
        city: '',
        state: '',
        pincode: '',
        totalScreens: '',
        contactNumber: ''
      }
    ]
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: createTheaterOwner,
    onSuccess: () => {
      alert('Theater owner created successfully!');
      // Reset form
      setTheaterOwner({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        theaters: [{
          theaterName: '',
          theaterLocation: '',
          city: '',
          state: '',
          pincode: '',
          totalScreens: '',
          contactNumber: ''
        }]
      });
    },
    onError: (error) => {
      alert('Error: ' + error.message);
    }
  });

  const handleChange = (e) => {
    setTheaterOwner({
      ...theaterOwner,
      [e.target.name]: e.target.value
    });
  };

  const handleTheaterChange = (index, e) => {
    const updatedTheaters = [...theaterOwner.theaters];
    updatedTheaters[index] = {
      ...updatedTheaters[index],
      [e.target.name]: e.target.value
    };
    setTheaterOwner({
      ...theaterOwner,
      theaters: updatedTheaters
    });
  };

  const addTheater = () => {
    setTheaterOwner({
      ...theaterOwner,
      theaters: [
        ...theaterOwner.theaters,
        {
          theaterName: '',
          theaterLocation: '',
          city: '',
          state: '',
          pincode: '',
          totalScreens: '',
          contactNumber: ''
        }
      ]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(theaterOwner);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className='text-2xl font-bold mb-4'>Add Theater Owner</h1>
      <p className='text-gray-600 mb-6'>Use the form below to add a new theater owner to the system.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owner Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Owner Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={theaterOwner.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Theaters Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Theaters</h2>
            <button
              type="button"
              onClick={addTheater}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              + Add Theater
            </button>
          </div>

          {theaterOwner.theaters.map((theater, index) => (
            <div key={index} className="border-t pt-4 mt-4 first:border-t-0 first:pt-0">
              <h3 className="font-semibold mb-3">Theater {index + 1}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Theater Name *</label>
                  <input
                    type="text"
                    name="theaterName"
                    value={theater.theaterName}
                    onChange={(e) => handleTheaterChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <input
                    type="text"
                    name="theaterLocation"
                    value={theater.theaterLocation}
                    onChange={(e) => handleTheaterChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={theater.city}
                    onChange={(e) => handleTheaterChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={theater.state}
                    onChange={(e) => handleTheaterChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={theater.pincode}
                    onChange={(e) => handleTheaterChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Total Screens *</label>
                  <input
                    type="number"
                    name="totalScreens"
                    value={theater.totalScreens}
                    onChange={(e) => handleTheaterChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Theater Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={theater.contactNumber}
                    onChange={(e) => handleTheaterChange(index, e)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Creating...' : 'Create Theater Owner'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Page;