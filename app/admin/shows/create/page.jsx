"use client"
import React, { useState } from 'react'
import { createShow } from "@/app/services/adminCommunication";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  FaFilm, FaCalendar, FaClock, FaMapMarkerAlt, FaTicketAlt, 
  FaStar, FaLanguage, FaTags, FaChair, FaSave, FaTimes,
  FaPlus, FaTrash, FaTheaterMasks, FaInfoCircle, FaDollarSign
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare } from 'react-icons/md';

function CreateShow() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  
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
      { category: 'NORMAL', pricePerSeat: 150, rows: 5, seatsPerRow: 20 },
      { category: 'EXECUTIVE', pricePerSeat: 220, rows: 5, seatsPerRow: 20 },
      { category: 'PREMIUM', pricePerSeat: 300, rows: 3, seatsPerRow: 20 },
      { category: 'VIP', pricePerSeat: 500, rows: 2, seatsPerRow: 10 }
    ],
    isPaid: true,
    basePrice: 150
  });

  const [posterPreview, setPosterPreview] = useState('');
  const [posterFile, setPosterFile] = useState(null);

  // Create show mutation
  const createMutation = useMutation({
    mutationFn: createShow,
    onSuccess: (data) => {
      toast.success('Show created successfully!');
      router.push('/admin/shows');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create show');
    }
  });

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
        // For base64 image (temporary)
        setFormData(prev => ({
          ...prev,
          movie: { ...prev.movie, poster: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.theaterId || !formData.screenId || !formData.screenNumber) {
      toast.error('Please fill theater and screen details');
      return;
    }
    
    if (!formData.movie.name || !formData.movie.duration || !formData.movie.rating) {
      toast.error('Please fill all movie details');
      return;
    }
    
    if (!formData.showDate || !formData.startTime || !formData.endTime) {
      toast.error('Please fill show date and time');
      return;
    }
    
    // Prepare data for API
    const submitData = {
      theaterId: formData.theaterId,
      screenId: formData.screenId,
      screenNumber: parseInt(formData.screenNumber),
      movie: {
        name: formData.movie.name,
        poster: posterPreview || formData.movie.poster || '',
        genre: formData.movie.genre,
        duration: parseInt(formData.movie.duration),
        rating: parseFloat(formData.movie.rating),
        description: formData.movie.description,
        language: formData.movie.language,
        isTrending: formData.movie.isTrending,
        releaseDate: formData.movie.releaseDate
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

  const genres = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'ROMANCE', 'THRILLER', 'SCI-FI', 'ANIMATION'];
  const languages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white sticky top-0 z-10 shadow-lg p-4 md:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Create New Show</h1>
          <p className="text-red-100 text-sm mt-1">Add a new movie screening to the system</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'basic' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaFilm className="inline mr-2" /> Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('movie')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'movie' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaStar className="inline mr-2" /> Movie Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seats')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'seats' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaChair className="inline mr-2" /> Seat Categories
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MdTheaters className="text-red-600" /> Theater & Timing
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MdTheaters className="inline mr-1" /> Theater ID *
                    </label>
                    <input
                      type="text"
                      name="theaterId"
                      value={formData.theaterId}
                      onChange={handleInputChange}
                      placeholder="e.g., 69e9ecdcd1e8f499177852f8"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the theater ID from database</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MdScreenShare className="inline mr-1" /> Screen ID *
                    </label>
                    <input
                      type="text"
                      name="screenId"
                      value={formData.screenId}
                      onChange={handleInputChange}
                      placeholder="e.g., 69e9ecdcd1e8f499177852f9"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MdScreenShare className="inline mr-1" /> Screen Number *
                    </label>
                    <input
                      type="number"
                      name="screenNumber"
                      value={formData.screenNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 1"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaCalendar className="inline mr-1" /> Show Date *
                    </label>
                    <input
                      type="date"
                      name="showDate"
                      value={formData.showDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaClock className="inline mr-1" /> Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FaClock className="inline mr-1" /> End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPaid"
                      checked={formData.isPaid}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-medium">Paid Show</span>
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
                        className="w-32 px-3 py-1 border rounded-lg dark:bg-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Movie Details Tab */}
            {activeTab === 'movie' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaFilm className="text-red-600" /> Movie Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Movie Name *</label>
                    <input
                      type="text"
                      name="movie.name"
                      value={formData.movie.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Jawan, Pathaan, etc."
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Genre *</label>
                    <select
                      name="movie.genre"
                      value={formData.movie.genre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
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
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="movie.rating"
                      value={formData.movie.rating}
                      onChange={handleInputChange}
                      placeholder="e.g., 8.5"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Language *</label>
                    <select
                      name="movie.language"
                      value={formData.movie.language}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Release Date</label>
                    <input
                      type="date"
                      name="movie.releaseDate"
                      value={formData.movie.releaseDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="movie.description"
                      value={formData.movie.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Movie description..."
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Movie Poster</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="movie.isTrending"
                          checked={formData.movie.isTrending}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm font-medium">🔥 Mark as Trending</span>
                      </label>
                    </div>
                    {posterPreview && (
                      <div className="mt-4">
                        <img src={posterPreview} alt="Preview" className="h-32 w-auto rounded-lg object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seat Categories Tab */}
            {activeTab === 'seats' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaChair className="text-red-600" /> Seat Categories & Pricing
                </h2>
                
                <div className="space-y-4">
                  {formData.seatCategories.map((category, index) => (
                    <div key={category.category} className="border dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">{category.category}</h3>
                        <div className={`w-3 h-3 rounded-full ${
                          category.category === 'NORMAL' ? 'bg-green-500' :
                          category.category === 'EXECUTIVE' ? 'bg-blue-500' :
                          category.category === 'PREMIUM' ? 'bg-purple-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Price per Seat (₹)</label>
                          <input
                            type="number"
                            value={category.pricePerSeat}
                            onChange={(e) => handleCategoryChange(index, 'pricePerSeat', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Number of Rows</label>
                          <input
                            type="number"
                            value={category.rows}
                            onChange={(e) => handleCategoryChange(index, 'rows', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">Fixed layout</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Seats per Row</label>
                          <input
                            type="number"
                            value={category.seatsPerRow}
                            onChange={(e) => handleCategoryChange(index, 'seatsPerRow', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        Total seats: {category.rows * category.seatsPerRow}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FaInfoCircle className="inline mr-2 text-blue-600" />
                  <span className="text-sm">
                    Seat layout is automatically generated based on rows and seats per row configuration.
                    Each category will have rows from next available letter.
                  </span>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t dark:border-gray-700">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave /> Create Show
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateShow;