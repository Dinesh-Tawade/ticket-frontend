"use client";

import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { createTheater } from "@/app/services/adminCommunication";
import { toast, Toaster } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave, FaTimes, FaBuilding, FaMapMarkerAlt, FaPhone, FaCity, FaFlag } from 'react-icons/fa';
import { MdScreenShare } from 'react-icons/md';

// Generate default seat rows for a screen
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
  
  // Generate 10 default rows (A to J)
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
const SeatRowConfig = ({ row, index, onUpdate, onDelete, t, totalColumns }) => {
  const categories = [
    { value: "NORMAL", label: t('app.normal') || "Normal" },
    { value: "EXECUTIVE", label: t('app.executive') || "Executive" },
    { value: "PREMIUM", label: t('app.premium') || "Premium" },
    { value: "VIP", label: t('app.vip') || "VIP" }
  ];

  // Calculate max seats based on category
  const getMaxSeats = () => {
    if (row.category === "VIP") return Math.min(10, totalColumns);
    return totalColumns;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-2">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <input 
          type="text" 
          value={row.rowName} 
          onChange={(e) => onUpdate(index, { ...row, rowName: e.target.value.toUpperCase() })}
          className="px-2 py-1 border rounded dark:bg-gray-700 text-center" 
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
          className="px-2 py-1 border rounded dark:bg-gray-700"
        >
          {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
        </select>
        
        <input 
          type="number" 
          value={row.startSeat} 
          onChange={(e) => onUpdate(index, { ...row, startSeat: parseInt(e.target.value) })}
          className="px-2 py-1 border rounded dark:bg-gray-700" 
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
          className="px-2 py-1 border rounded dark:bg-gray-700" 
          min="1" 
          max={getMaxSeats()}
          placeholder="End" 
        />
        
        <input 
          type="number" 
          step="0.5" 
          value={row.priceMultiplier} 
          onChange={(e) => onUpdate(index, { ...row, priceMultiplier: parseFloat(e.target.value) })}
          className="px-2 py-1 border rounded dark:bg-gray-700" 
          placeholder="Price x" 
        />
        
        <button 
          type="button"
          onClick={() => onDelete(index)} 
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
        >
          <FaTrash size={12} />
        </button>
      </div>
    </div>
  );
};

// Screen Component
const ScreenConfig = ({ screen, index, onUpdate, onRemove, onAddRow, onRemoveRow, t }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MdScreenShare className="text-blue-500" />
          {t('app.screen') || "Screen"} {screen.screenNumber}
        </h3>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => onRemove(index)} 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
          >
            <FaTrash size={12} /> {t('app.remove') || "Remove"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">{t('app.screenName') || "Screen Name"}</label>
          <input 
            type="text" 
            value={screen.name} 
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700" 
            placeholder="Screen Name" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('app.seatsPerRow') || "Seats Per Row"}</label>
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
            className="w-full px-3 py-2 border rounded dark:bg-gray-700" 
            min="1" 
            max="30" 
          />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">{t('app.seatRows') || "Seat Rows"} ({screen.seatRows.length})</label>
          <button 
            type="button" 
            onClick={() => onAddRow(index)} 
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1"
          >
            <FaPlus size={10} /> {t('app.addRow') || "Add Row"}
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {screen.seatRows.map((row, rowIndex) => (
            <SeatRowConfig 
              key={rowIndex} 
              row={row} 
              index={rowIndex} 
              onUpdate={(i, r) => onRemoveRow ? onUpdate(index, {
                seatRows: screen.seatRows.map((rr, ri) => ri === i ? r : rr)
              }) : null}
              onDelete={(i) => onRemoveRow(index, i)}
              t={t}
              totalColumns={screen.totalColumns}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Component
function AddTheater() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");

  const [basicInfo, setBasicInfo] = useState({
    ownerId: "69e9c32ed6d20d1b792b023e",
    name: "", 
    location: "", 
    city: "", 
    state: "", 
    pincode: "", 
    contactNumber: "",
  });

  const [screens, setScreens] = useState([createNewScreen(1)]);

  const mutation = useMutation({
    mutationFn: createTheater,
    onSuccess: () => {
      toast.success(t('app.theaterCreated') || "Theater created successfully!");
      queryClient.invalidateQueries(['allTheatersAdmin']);
      setTimeout(() => router.push("/admin/theaters"), 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('app.createFailed') || "Failed to create theater");
    },
  });

  const handleBasicChange = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  // Update entire screen
  const updateScreen = (screenIndex, updates) => {
    setScreens(prev => prev.map((screen, i) => 
      i === screenIndex ? { ...screen, ...updates } : screen
    ));
  };

  // Add new screen
  const addScreen = () => {
    const newScreenNumber = screens.length + 1;
    setScreens(prev => [...prev, createNewScreen(newScreenNumber, prev[0]?.totalColumns || 20)]);
    toast.success(`Screen ${newScreenNumber} added`);
  };

  // Remove screen
  const removeScreen = (screenIndex) => {
    if (screens.length <= 1) {
      toast.error("At least one screen is required!");
      return;
    }
    setScreens(prev => prev.filter((_, i) => i !== screenIndex));
    // Renumber remaining screens
    setScreens(prev => prev.map((screen, idx) => ({
      ...screen,
      screenNumber: idx + 1,
      name: `Screen ${idx + 1}`
    })));
    toast.success("Screen removed");
  };

  // Add row to a screen
  const addRowToScreen = (screenIndex) => {
    setScreens(prev => prev.map((screen, si) => {
      if (si !== screenIndex) return screen;
      
      const lastRow = screen.seatRows[screen.seatRows.length - 1];
      const lastCharCode = lastRow.rowName.charCodeAt(0);
      const nextLetter = String.fromCharCode(lastCharCode + 1);
      
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

  // Remove row from a screen
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

  // Update a specific row in a screen
  const updateSeatRow = (screenIndex, rowIndex, updatedRow) => {
    setScreens(prev => prev.map((screen, si) => 
      si === screenIndex ? {
        ...screen,
        seatRows: screen.seatRows.map((row, ri) => ri === rowIndex ? updatedRow : row)
      } : screen
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate data before submit
    if (!basicInfo.name || !basicInfo.location || !basicInfo.city || !basicInfo.state) {
      toast.error("Please fill all basic information fields");
      setActiveTab("basic");
      return;
    }
    
    if (screens.length === 0) {
      toast.error("At least one screen is required");
      return;
    }
    
    // Prepare data for API
    const theaterData = {
      ...basicInfo,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white sticky top-0 z-10 shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Add New Theater</h1>
            <p className="text-blue-100 text-sm">Create theater with multiple screens and seat layouts</p>
          </div>
          <button 
            type="button"
            onClick={() => router.back()} 
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
          <button 
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`pb-3 px-4 font-semibold transition flex items-center gap-2 ${
              activeTab === "basic" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            <FaBuilding /> Basic Info
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("screens")}
            className={`pb-3 px-4 font-semibold transition flex items-center gap-2 ${
              activeTab === "screens" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            <MdScreenShare /> Screens & Seats ({screens.length})
          </button>
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {basicFields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    {field.icon && <field.icon className="absolute left-3 top-3 text-gray-400" />}
                    <input 
                      type={field.name === "contactNumber" ? "tel" : "text"} 
                      name={field.name} 
                      value={basicInfo[field.name]} 
                      onChange={handleBasicChange} 
                      required={field.required}
                      className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        field.icon ? 'pl-10' : ''
                      }`} 
                      placeholder={field.placeholder} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                type="button" 
                onClick={() => setActiveTab("screens")} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Screens Tab */}
        {activeTab === "screens" && (
          <div className="space-y-6">
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
                t={t}
              />
            ))}
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <button 
                type="button" 
                onClick={addScreen} 
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaPlus /> Add Screen
              </button>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveTab("basic")} 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  disabled={mutation.isPending} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaSave /> Create Theater
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AddTheater;