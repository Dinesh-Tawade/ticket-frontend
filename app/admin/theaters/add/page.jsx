"use client";

import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaPlus, FaTrash, FaSave, FaTimes, FaBuilding, FaMapMarkerAlt, 
  FaPhone, FaCity, FaFlag, FaCouch, FaWifi, FaParking, FaCoffee, 
  FaAccessibleIcon, FaArrowLeft, FaCheckCircle, FaUserTie
} from 'react-icons/fa';
import { MdScreenShare, MdChair } from 'react-icons/md';
import { createTheater } from "@/app/services/adminCommunication";
import { getAllUsers } from "@/app/services/adminCommunication";

const AMENITIES = [
  { icon: FaCouch, name: "Recliner Seats", key: "hasRecliner" },
  { icon: FaWifi, name: "Free WiFi", key: "hasWifi" },
  { icon: FaParking, name: "Parking", key: "hasParking" },
  { icon: FaCoffee, name: "Food & Café", key: "hasCafe" },
  { icon: FaAccessibleIcon, name: "Wheelchair Access", key: "hasWheelchair" }
];

// Generate default seat rows
const generateDefaultSeatRows = (totalColumns = 20) => {
  const rows = [];
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  const getCategory = (index) => {
    if (index < 5) return "NORMAL";
    if (index < 10) return "EXECUTIVE";
    if (index < 13) return "PREMIUM";
    return "VIP";
  };
  
  const getMultiplier = (category) => {
    switch(category) {
      case "NORMAL": return 1.0;
      case "EXECUTIVE": return 1.5;
      case "PREMIUM": return 2.0;
      case "VIP": return 3.0;
      default: return 1.0;
    }
  };
  
  for (let i = 0; i < 10; i++) {
    const category = getCategory(i);
    const isVIP = category === "VIP";
    rows.push({
      rowName: rowLetters[i],
      category: category,
      startSeat: 1,
      endSeat: isVIP ? Math.min(10, totalColumns) : totalColumns,
      priceMultiplier: getMultiplier(category)
    });
  }
  
  return rows;
};

// Create new screen
const createNewScreen = (screenNumber, totalColumns = 20) => ({
  screenNumber: screenNumber,
  name: `Screen ${screenNumber}`,
  totalRows: 10,
  totalColumns: totalColumns,
  seatRows: generateDefaultSeatRows(totalColumns)
});

// Seat Row Component
const SeatRowConfig = ({ row, index, onUpdate, onDelete, totalColumns }) => {
  const categories = [
    { value: "NORMAL", label: "Normal", color: "green" },
    { value: "EXECUTIVE", label: "Executive", color: "blue" },
    { value: "PREMIUM", label: "Premium", color: "purple" },
    { value: "VIP", label: "VIP", color: "yellow" }
  ];

  const getMaxSeats = () => {
    if (row.category === "VIP") return Math.min(10, totalColumns);
    return totalColumns;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-2 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <input 
          type="text" 
          value={row.rowName} 
          onChange={(e) => onUpdate(index, { ...row, rowName: e.target.value.toUpperCase() })}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 text-center font-mono font-bold" 
          maxLength={2} 
          placeholder="Row" 
        />
        
        <select 
          value={row.category} 
          onChange={(e) => {
            const newCategory = e.target.value;
            const newEndSeat = newCategory === "VIP" ? Math.min(10, totalColumns) : totalColumns;
            onUpdate(index, { ...row, category: newCategory, endSeat: newEndSeat });
          }}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        
        <input 
          type="number" 
          value={row.startSeat} 
          onChange={(e) => onUpdate(index, { ...row, startSeat: parseInt(e.target.value) })}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700" 
          min="1" 
          placeholder="Start" 
        />
        
        <input 
          type="number" 
          value={row.endSeat} 
          onChange={(e) => {
            let newEnd = parseInt(e.target.value);
            const maxSeats = getMaxSeats();
            if (newEnd > maxSeats) newEnd = maxSeats;
            if (newEnd < row.startSeat) newEnd = row.startSeat;
            onUpdate(index, { ...row, endSeat: newEnd });
          }}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700" 
          min="1" 
          max={getMaxSeats()}
          placeholder="End" 
        />
        
        <input 
          type="number" 
          step="0.5" 
          value={row.priceMultiplier} 
          onChange={(e) => onUpdate(index, { ...row, priceMultiplier: parseFloat(e.target.value) })}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700" 
          placeholder="Price x" 
        />
        
        <button 
          type="button"
          onClick={() => onDelete(index)} 
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// Screen Component
const ScreenConfig = ({ screen, index, onUpdate, onRemove, onAddRow, onRemoveRow, onUpdateRow }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div 
        className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <MdScreenShare className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{screen.name}</h3>
            <p className="text-sm text-gray-500">Screen {screen.screenNumber} | {screen.seatRows.length} rows</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onRemove(index); }} 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition"
          >
            <FaTrash size={12} /> Remove
          </button>
          <button className="text-gray-400">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
            <div>
              <label className="block text-sm font-medium mb-1">Screen Name</label>
              <input 
                type="text" 
                value={screen.name} 
                onChange={(e) => onUpdate(index, { name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" 
                placeholder="Screen Name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seats Per Row</label>
              <input 
                type="number" 
                value={screen.totalColumns} 
                onChange={(e) => {
                  const newCols = parseInt(e.target.value);
                  onUpdate(index, { 
                    totalColumns: newCols,
                    seatRows: screen.seatRows.map(row => ({ 
                      ...row, 
                      endSeat: row.category === "VIP" ? Math.min(10, newCols) : newCols 
                    }))
                  });
                }} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" 
                min="1" 
                max="30" 
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <MdChair /> Seat Rows ({screen.seatRows.length})
              </label>
              <button 
                type="button" 
                onClick={() => onAddRow(index)} 
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition"
              >
                <FaPlus size={12} /> Add Row
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {screen.seatRows.map((row, rowIndex) => (
                <SeatRowConfig 
                  key={rowIndex} 
                  row={row} 
                  index={rowIndex} 
                  onUpdate={(i, r) => onUpdateRow(index, rowIndex, r)}
                  onDelete={(i) => onRemoveRow(index, rowIndex)}
                  totalColumns={screen.totalColumns}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function AddTheaterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState({
    ownerId: "", 
    name: "", 
    location: "", 
    city: "", 
    state: "", 
    pincode: "", 
    contactNumber: "",
    hasRecliner: false,
    hasWifi: false,
    hasParking: false,
    hasCafe: false,
    hasWheelchair: false
  });

  const [screens, setScreens] = useState([createNewScreen(1)]);

  // Fetch Theater Owners (role: THEATER_OWNER)
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', 'THEATER_OWNER'],
    queryFn: () => getAllUsers({ role: 'THEATER_OWNER' }),
  });

  const theaterOwners = usersData?.data || [];

  // Create theater mutation using adminCommunication
  const mutation = useMutation({
    mutationFn: createTheater,
    onSuccess: () => {
      toast.success('Theater created successfully! 🎉');
      queryClient.invalidateQueries(['allTheatersAdmin']);
      setTimeout(() => router.push('/admin/theaters'), 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create theater');
    }
  });

  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasicInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Screen management
  const addScreen = () => {
    const newScreenNumber = screens.length + 1;
    setScreens(prev => [...prev, createNewScreen(newScreenNumber, prev[0]?.totalColumns || 20)]);
    toast.success(`Screen ${newScreenNumber} added`);
  };

  const removeScreen = (screenIndex) => {
    if (screens.length <= 1) {
      toast.error("At least one screen is required!");
      return;
    }
    setScreens(prev => prev.filter((_, i) => i !== screenIndex));
    setTimeout(() => {
      setScreens(prev => prev.map((screen, idx) => ({
        ...screen,
        screenNumber: idx + 1,
        name: `Screen ${idx + 1}`
      })));
    }, 0);
    toast.success("Screen removed");
  };

  const updateScreen = (screenIndex, updates) => {
    setScreens(prev => prev.map((screen, i) => 
      i === screenIndex ? { ...screen, ...updates } : screen
    ));
  };

  const addRowToScreen = (screenIndex) => {
    setScreens(prev => prev.map((screen, si) => {
      if (si !== screenIndex) return screen;
      
      const lastRow = screen.seatRows[screen.seatRows.length - 1];
      const lastCharCode = lastRow.rowName.charCodeAt(0);
      const nextLetter = String.fromCharCode(lastCharCode + 1);
      
      if (nextLetter > 'Z') {
        toast.error("Maximum 26 rows reached (A-Z)!");
        return screen;
      }
      
      return {
        ...screen,
        totalRows: screen.totalRows + 1,
        seatRows: [...screen.seatRows, {
          rowName: nextLetter,
          category: "NORMAL",
          startSeat: 1,
          endSeat: screen.totalColumns,
          priceMultiplier: 1.0
        }]
      };
    }));
  };

  const removeRowFromScreen = (screenIndex, rowIndex) => {
    setScreens(prev => prev.map((screen, si) => {
      if (si !== screenIndex) return screen;
      if (screen.seatRows.length <= 1) {
        toast.error("At least one row is required per screen!");
        return screen;
      }
      return {
        ...screen,
        totalRows: screen.totalRows - 1,
        seatRows: screen.seatRows.filter((_, ri) => ri !== rowIndex)
      };
    }));
  };

  const updateSeatRow = (screenIndex, rowIndex, updatedRow) => {
    setScreens(prev => prev.map((screen, si) => 
      si === screenIndex ? {
        ...screen,
        seatRows: screen.seatRows.map((row, ri) => ri === rowIndex ? updatedRow : row)
      } : screen
    ));
  };

  const validateBasicInfo = () => {
    if (!basicInfo.ownerId) {
      toast.error("Please select a theater owner");
      return false;
    }
    if (!basicInfo.name.trim()) {
      toast.error("Theater name is required");
      return false;
    }
    if (!basicInfo.location.trim()) {
      toast.error("Location is required");
      return false;
    }
    if (!basicInfo.city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!basicInfo.state.trim()) {
      toast.error("State is required");
      return false;
    }
    if (!basicInfo.contactNumber.trim()) {
      toast.error("Contact number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateBasicInfo()) {
      setStep(1);
      return;
    }
    
    if (screens.length === 0) {
      toast.error("At least one screen is required");
      setStep(2);
      return;
    }
    
    // Prepare data for API
    const theaterData = {
      ownerId: basicInfo.ownerId,
      name: basicInfo.name,
      location: basicInfo.location,
      city: basicInfo.city,
      state: basicInfo.state,
      pincode: basicInfo.pincode,
      contactNumber: basicInfo.contactNumber,
      hasRecliner: basicInfo.hasRecliner,
      hasWifi: basicInfo.hasWifi,
      hasParking: basicInfo.hasParking,
      hasCafe: basicInfo.hasCafe,
      hasWheelchair: basicInfo.hasWheelchair,
      screens: screens.map(({ screenNumber, name, totalRows, totalColumns, seatRows }) => ({
        screenNumber,
        name,
        totalRows,
        totalColumns,
        seatRows: seatRows.map(row => ({
          rowName: row.rowName,
          category: row.category,
          startSeat: row.startSeat,
          endSeat: row.endSeat,
          priceMultiplier: row.priceMultiplier
        }))
      }))
    };
    
    console.log("Submitting theater data:", JSON.stringify(theaterData, null, 2));
    mutation.mutate(theaterData);
  };

  const basicFields = [
    { name: "name", label: "Theater Name", placeholder: "e.g., PVR Cinemas", icon: FaBuilding, required: true },
    { name: "location", label: "Location", placeholder: "e.g., Juhu, Mumbai", icon: FaMapMarkerAlt, required: true },
    { name: "city", label: "City", placeholder: "e.g., Mumbai", icon: FaCity, required: true },
    { name: "state", label: "State", placeholder: "e.g., Maharashtra", icon: FaFlag, required: true },
    { name: "pincode", label: "Pincode", placeholder: "400049", icon: null, required: false },
    { name: "contactNumber", label: "Contact Number", placeholder: "9876543210", icon: FaPhone, required: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white sticky top-0 z-20 shadow-xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Add New Theater</h1>
                <p className="text-red-100 text-sm">Create a new theater with screens and seat layouts</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="bg-green-500 hover:bg-green-600 px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Create Theater
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between mb-8">
            {[
              { step: 1, label: "Basic Info", icon: FaBuilding },
              { step: 2, label: "Screens & Seats", icon: MdScreenShare },
              { step: 3, label: "Review", icon: FaCheckCircle }
            ].map((s) => (
              <div key={s.step} className="flex-1 text-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition ${
                    step >= s.step 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  <s.icon className="text-xl" />
                </div>
                <p className={`text-sm ${step >= s.step ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaBuilding className="text-red-600" />
                Theater Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theater Owner Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Theater Owner <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUserTie className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="ownerId"
                      value={basicInfo.ownerId}
                      onChange={handleBasicChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select Theater Owner</option>
                      {isLoadingUsers ? (
                        <option disabled>Loading owners...</option>
                      ) : (
                        theaterOwners.map(owner => (
                          <option key={owner._id} value={owner._id}>
                            {owner.name} ({owner.email})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {theaterOwners.length === 0 && !isLoadingUsers && (
                    <p className="text-sm text-red-500 mt-1">
                      No theater owners found. Please create a theater owner first.
                    </p>
                  )}
                </div>

                {basicFields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      {field.icon && <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
                      <input 
                        type={field.name === "contactNumber" ? "tel" : "text"} 
                        name={field.name} 
                        value={basicInfo[field.name]} 
                        onChange={handleBasicChange} 
                        required={field.required}
                        className={`w-full px-4 py-3 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          field.icon ? 'pl-10' : ''
                        }`} 
                        placeholder={field.placeholder} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div className="mt-8">
                <label className="block text-sm font-medium mb-3">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES.map(amenity => (
                    <label key={amenity.key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      <input
                        type="checkbox"
                        name={amenity.key}
                        checked={basicInfo[amenity.key]}
                        onChange={handleBasicChange}
                        className="w-5 h-5 rounded"
                      />
                      <amenity.icon className="text-gray-600 dark:text-gray-400" />
                      <span className="text-sm">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!basicInfo.ownerId}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Configure Screens →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Screens & Seats */}
        {step === 2 && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MdScreenShare className="text-red-600" />
                  Screens Configuration
                </h2>
                <button
                  type="button"
                  onClick={addScreen}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
                >
                  <FaPlus /> Add Screen
                </button>
              </div>

              <div className="space-y-4">
                {screens.map((screen, idx) => (
                  <ScreenConfig 
                    key={idx}
                    screen={screen}
                    index={idx}
                    onUpdate={updateScreen}
                    onRemove={removeScreen}
                    onAddRow={addRowToScreen}
                    onRemoveRow={removeRowFromScreen}
                    onUpdateRow={updateSeatRow}
                  />
                ))}
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 rounded-xl font-semibold transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
                >
                  Review & Submit →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Review & Submit
              </h2>

              {/* Basic Info Review */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h3 className="font-semibold text-lg mb-3">Theater Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Owner:</span> {
                    theaterOwners.find(o => o._id === basicInfo.ownerId)?.name || 'Selected'
                  }</p>
                  <p><span className="text-gray-500">Name:</span> {basicInfo.name}</p>
                  <p><span className="text-gray-500">Location:</span> {basicInfo.location}</p>
                  <p><span className="text-gray-500">City:</span> {basicInfo.city}</p>
                  <p><span className="text-gray-500">State:</span> {basicInfo.state}</p>
                  <p><span className="text-gray-500">Contact:</span> {basicInfo.contactNumber}</p>
                  <p><span className="text-gray-500">Pincode:</span> {basicInfo.pincode || 'N/A'}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AMENITIES.filter(a => basicInfo[a.key]).map(a => (
                    <span key={a.key} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <a.icon size={12} /> {a.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screens Review */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Screens ({screens.length})</h3>
                {screens.map((screen, idx) => (
                  <div key={idx} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="font-bold">{screen.name}</p>
                    <p className="text-sm text-gray-500">Rows: {screen.seatRows.length}</p>
                    <p className="text-sm text-gray-500">Seats per row: {screen.totalColumns}</p>
                    <p className="text-sm">Total seats: {screen.seatRows.reduce((sum, row) => sum + (row.endSeat - row.startSeat + 1), 0)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 rounded-xl font-semibold transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={mutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle /> Create Theater
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}