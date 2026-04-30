"use client";

import React, { useState, useEffect } from 'react';
import { createShow } from "@/app/services/adminCommunication";
import { getAllTheatersAdmin } from "@/app/services/adminCommunication";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  FaFilm, FaCalendar, FaClock, FaMapMarkerAlt, FaTicketAlt, 
  FaStar, FaLanguage, FaTags, FaChair, FaSave, FaTimes,
  FaPlus, FaTrash, FaTheaterMasks, FaInfoCircle, FaDollarSign,
  FaBuilding, FaScreen, FaCheckCircle
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare } from 'react-icons/md';

function CreateShow() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTheater, setSelectedTheater] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    theaterId: '',
    screenId: '',
    screenNumber: '',
    movie: {
      name: '',
      poster: '',
      genre: 'ACTION',
      duration: '',
      rating: '',
      description: '',
      language: 'Hindi',
      isTrending: false,
      releaseDate: ''
    },
    showDate: '',
    startTime: '',
    endTime: '',
    seatCategories: [
      { category: 'NORMAL', pricePerSeat: 150 },
      { category: 'EXECUTIVE', pricePerSeat: 220 },
      { category: 'PREMIUM', pricePerSeat: 300 },
      { category: 'VIP', pricePerSeat: 500 }
    ],
    isPaid: false,  // Default free show
    basePrice: 150
  });

  const [posterPreview, setPosterPreview] = useState('');
  const [posterFile, setPosterFile] = useState(null);

  // Fetch Theaters
  const { data: theatersData, isLoading: isLoadingTheaters } = useQuery({
    queryKey: ['allTheatersAdmin'],
    queryFn: getAllTheatersAdmin,
  });

  const theaters = theatersData?.data || [];

  // Update screen options when theater changes
  const handleTheaterChange = (e) => {
    const theaterId = e.target.value;
    const theater = theaters.find(t => t._id === theaterId);
    setSelectedTheater(theater);
    setFormData(prev => ({
      ...prev,
      theaterId: theaterId,
      screenId: '',  // Reset screen selection
      screenNumber: ''
    }));
  };

  // Handle screen selection
  const handleScreenChange = (e) => {
    const screenId = e.target.value;
    const screen = selectedTheater?.screens?.find(s => s._id === screenId);
    if (screen) {
      setFormData(prev => ({
        ...prev,
        screenId: screenId,
        screenNumber: screen.screenNumber
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('movie.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        movie: { ...prev.movie, [field]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.seatCategories];
    updatedCategories[index][field] = value;
    setFormData(prev => ({ ...prev, seatCategories: updatedCategories }));
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          movie: { ...prev.movie, poster: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Create show mutation
  const createMutation = useMutation({
    mutationFn: createShow,
    onSuccess: (data) => {
      toast.success('Show created successfully! 🎬');
      setTimeout(() => router.push('/admin/shows'), 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create show');
    }
  });

  const validateForm = () => {
    if (!formData.theaterId) {
      toast.error('Please select a theater');
      return false;
    }
    if (!formData.screenId) {
      toast.error('Please select a screen');
      return false;
    }
    if (!formData.movie.name) {
      toast.error('Please enter movie name');
      return false;
    }
    if (!formData.movie.duration) {
      toast.error('Please enter movie duration');
      return false;
    }
    if (!formData.movie.rating) {
      toast.error('Please enter movie rating');
      return false;
    }
    if (!formData.showDate) {
      toast.error('Please select show date');
      return false;
    }
    if (!formData.startTime) {
      toast.error('Please select start time');
      return false;
    }
    if (!formData.endTime) {
      toast.error('Please select end time');
      return false;
    }
    return true;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    setActiveTab('basic');
    return;
  }
  
  const submitData = {
    theaterId: formData.theaterId,
    screenId: formData.screenId,
    screenNumber: parseInt(formData.screenNumber),
    movie: {
      name: formData.movie.name,
      poster: '',
      genre: formData.movie.genre,
      duration: parseInt(formData.movie.duration),
      rating: parseFloat(formData.movie.rating),
      description: formData.movie.description || '',
      language: formData.movie.language,
      isTrending: formData.movie.isTrending,
      releaseDate: formData.movie.releaseDate || new Date().toISOString().split('T')[0]
    },
    showDate: formData.showDate,
    startTime: formData.startTime,
    endTime: formData.endTime,
    seatCategories: formData.seatCategories.map(cat => ({
      category: cat.category,
      pricePerSeat: parseInt(cat.pricePerSeat)
    })),
    isPaid: formData.isPaid,
    basePrice: parseInt(formData.basePrice)
  };
  
  createMutation.mutate(submitData);
};

  const genres = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'ROMANCE', 'THRILLER', 'SCI-FI', 'ANIMATION', 'DOCUMENTARY'];
  const languages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Punjabi'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white sticky top-0 z-20 shadow-xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <FaFilm className="text-yellow-400" />
                Create New Show
              </h1>
              <p className="text-red-100 text-sm mt-1">Add a new movie screening to the system</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition"
            >
              <FaTimes className="inline mr-1" /> Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8 max-w-3xl mx-auto">
            {[
              { step: 'basic', label: 'Theater & Timing', icon: FaBuilding },
              { step: 'movie', label: 'Movie Details', icon: FaFilm },
              { step: 'seats', label: 'Seat Pricing', icon: FaChair }
            ].map((tab) => (
              <button
                key={tab.step}
                type="button"
                onClick={() => setActiveTab(tab.step)}
                className={`flex-1 text-center pb-3 transition ${
                  activeTab === tab.step 
                    ? 'border-b-2 border-red-500 text-red-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className={`text-xl mx-auto mb-1 ${
                  activeTab === tab.step ? 'text-red-500' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
            
            {/* Basic Info Tab - Theater & Timing */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MdTheaters className="text-red-600" /> Select Theater & Screen
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theater Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaBuilding className="inline mr-2 text-red-500" />
                      Select Theater *
                    </label>
                    <select
                      value={formData.theaterId}
                      onChange={handleTheaterChange}
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">-- Select Theater --</option>
                      {isLoadingTheaters ? (
                        <option disabled>Loading theaters...</option>
                      ) : (
                        theaters.map(theater => (
                          <option key={theater._id} value={theater._id}>
                            {theater.name} - {theater.city} ({theater.screens?.length || 0} screens)
                          </option>
                        ))
                      )}
                    </select>
                    {formData.theaterId && selectedTheater && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <FaCheckCircle /> {selectedTheater.location}, {selectedTheater.city}
                      </p>
                    )}
                  </div>

                  {/* Screen Selection - Only show if theater selected */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MdScreenShare className="inline mr-2 text-red-500" />
                      Select Screen *
                    </label>
                    <select
                      value={formData.screenId}
                      onChange={handleScreenChange}
                      disabled={!formData.theaterId}
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">-- Select Screen --</option>
                      {selectedTheater?.screens?.map(screen => (
                        <option key={screen._id} value={screen._id}>
                          {screen.name} - Screen {screen.screenNumber}
                        </option>
                      ))}
                    </select>
                    {formData.screenId && formData.screenNumber && (
                      <p className="text-xs text-green-600 mt-1">
                        Screen Number: {formData.screenNumber}
                      </p>
                    )}
                  </div>

                  {/* Show Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaCalendar className="inline mr-2 text-red-500" />
                      Show Date *
                    </label>
                    <input
                      type="date"
                      name="showDate"
                      value={formData.showDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaClock className="inline mr-2 text-red-500" />
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaClock className="inline mr-2 text-red-500" />
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  {/* Paid/Free Show Toggle */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPaid"
                        checked={formData.isPaid}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-red-600 rounded"
                      />
                      <span className="text-sm font-medium">💰 Paid Show</span>
                    </label>
                    
                    {formData.isPaid && (
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-green-600" />
                        <input
                          type="number"
                          name="basePrice"
                          value={formData.basePrice}
                          onChange={handleInputChange}
                          placeholder="Base Price"
                          className="w-32 px-3 py-2 border rounded-lg dark:bg-gray-600"
                        />
                      </div>
                    )}
                    
                    {!formData.isPaid && (
                      <span className="text-sm text-green-600">🎉 Free Show - No payment required</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('movie')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
                  >
                    Next: Movie Details →
                  </button>
                </div>
              </div>
            )}

            {/* Movie Details Tab */}
            {activeTab === 'movie' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FaStar className="text-yellow-500" /> Movie Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Movie Name *</label>
                    <input
                      type="text"
                      name="movie.name"
                      value={formData.movie.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Jawan, Pathaan, Animal"
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Genre *</label>
                    <select
                      name="movie.genre"
                      value={formData.movie.genre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Language *</label>
                    <select
                      name="movie.language"
                      value={formData.movie.language}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                    <input
                      type="number"
                      name="movie.duration"
                      value={formData.movie.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 170"
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating (0-10) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      name="movie.rating"
                      value={formData.movie.rating}
                      onChange={handleInputChange}
                      placeholder="e.g., 8.5"
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Release Date</label>
                    <input
                      type="date"
                      name="movie.releaseDate"
                      value={formData.movie.releaseDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="movie.description"
                      value={formData.movie.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Brief description about the movie..."
                      className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Movie Poster</label>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterChange}
                          className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="movie.isTrending"
                          checked={formData.movie.isTrending}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-red-600 rounded"
                        />
                        <span className="text-sm font-medium">🔥 Mark as Trending</span>
                      </label>
                    </div>
                    {posterPreview && (
                      <div className="mt-4">
                        <img src={posterPreview} alt="Preview" className="h-40 w-auto rounded-xl object-cover shadow-md" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-2 rounded-xl font-semibold transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seats')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
                  >
                    Next: Seat Pricing →
                  </button>
                </div>
              </div>
            )}

            {/* Seat Categories Tab */}
            {activeTab === 'seats' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FaChair className="text-green-500" /> Seat Categories & Pricing
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.seatCategories.map((category, index) => (
                    <div key={category.category} className="border-2 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            category.category === 'NORMAL' ? 'bg-green-500' :
                            category.category === 'EXECUTIVE' ? 'bg-blue-500' :
                            category.category === 'PREMIUM' ? 'bg-purple-500' : 'bg-yellow-500'
                          }`} />
                          {category.category}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {category.category === 'NORMAL' ? 'Standard Seats' :
                           category.category === 'EXECUTIVE' ? 'Extra Legroom' :
                           category.category === 'PREMIUM' ? 'Premium Comfort' : 'Luxury Seats'}
                        </span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Price per Seat (₹)</label>
                        <input
                          type="number"
                          value={category.pricePerSeat}
                          onChange={(e) => handleCategoryChange(index, 'pricePerSeat', e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mt-4">
                  <FaInfoCircle className="inline mr-2 text-blue-600" />
                  <span className="text-sm">
                    Seat layout will be automatically generated based on theater screen configuration.
                    Each category  row allocation is pre-defined from the screen setup.
                  </span>
                </div>

                <div className="flex justify-between mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('movie')}
                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-2 rounded-xl font-semibold transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                        Creating Show...
                      </>
                    ) : (
                      <>
                        <FaSave /> Create Show
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateShow;