"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { createTheater } from "@/app/services/adminCommunication";
import { toast, Toaster } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave, FaTimes, FaBuilding, FaMapMarkerAlt, FaPhone, FaCity, FaFlag } from 'react-icons/fa';
import { MdScreenShare } from 'react-icons/md';

const BE_URL = process.env.NEXT_PUBLIC_BE_URL;


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
  
  // Generate 15 default rows (A to O)
  for (let i = 0; i < 15; i++) {
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

// Dynamic Screen Generator
const createNewScreen = (screenNumber, totalColumns = 20) => ({
  screenNumber,
  name: `Screen ${screenNumber}`,
  totalRows: 15,
  totalColumns,
  seatRows: generateDefaultSeatRows(totalColumns)
});

// Seat Row Component
const SeatRowConfig = ({ row, index, onUpdate, onDelete, t }) => {
  const categories = [
    { value: "NORMAL", label: t('app.normal') },
    { value: "EXECUTIVE", label: t('app.executive') },
    { value: "PREMIUM", label: t('app.premium') },
    { value: "VIP", label: t('app.vip') }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-2">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <input type="text" value={row.rowName} onChange={(e) => onUpdate(index, { ...row, rowName: e.target.value.toUpperCase() })}
          className="px-2 py-1 border rounded dark:bg-gray-700 text-center" maxLength={2} placeholder={t('app.row')} />
        
        <select value={row.category} onChange={(e) => onUpdate(index, { ...row, category: e.target.value })}
          className="px-2 py-1 border rounded dark:bg-gray-700">
          {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
        </select>
        
        <input type="number" value={row.startSeat} onChange={(e) => onUpdate(index, { ...row, startSeat: parseInt(e.target.value) })}
          className="px-2 py-1 border rounded dark:bg-gray-700" min="1" placeholder={t('app.start')} />
        
        <input type="number" value={row.endSeat} onChange={(e) => onUpdate(index, { ...row, endSeat: parseInt(e.target.value) })}
          className="px-2 py-1 border rounded dark:bg-gray-700" min="1" placeholder={t('app.end')} />
        
        <input type="number" step="0.5" value={row.priceMultiplier} onChange={(e) => onUpdate(index, { ...row, priceMultiplier: parseFloat(e.target.value) })}
          className="px-2 py-1 border rounded dark:bg-gray-700" placeholder={t('app.multiplier')} />
        
        <button onClick={() => onDelete(index)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
          <FaTrash size={12} />
        </button>
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
    name: "", location: "", city: "", state: "", pincode: "", contactNumber: "",
  });

  const [screens, setScreens] = useState([createNewScreen(1)]);

  const mutation = useMutation({
    mutationFn: createTheater,
    onSuccess: () => {
      toast.success(t('app.theaterCreated'));
      queryClient.invalidateQueries(['allTheatersAdmin']);
      setTimeout(() => router.push("/admin/theaters"), 2000);
    },
    onError: (error) => toast.error(error.response?.data?.message || t('app.createFailed')),
  });

  const handleBasicChange = (e) => setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });

  const updateScreen = useCallback((index, updates) => {
    setScreens(prev => prev.map((screen, i) => i === index ? { ...screen, ...updates } : screen));
  }, []);

  const updateSeatRow = useCallback((screenIndex, rowIndex, updatedRow) => {
    setScreens(prev => prev.map((screen, si) => 
      si === screenIndex ? { ...screen, seatRows: screen.seatRows.map((row, ri) => ri === rowIndex ? updatedRow : row) } : screen
    ));
  }, []);

  const addSeatRow = useCallback((screenIndex) => {
    setScreens(prev => prev.map((screen, si) => {
      if (si !== screenIndex) return screen;
      const lastRow = screen.seatRows[screen.seatRows.length - 1];
      const nextLetter = String.fromCharCode(lastRow.rowName.charCodeAt(0) + 1);
      return {
        ...screen,
        totalRows: screen.totalRows + 1,
        seatRows: [...screen.seatRows, {
          rowName: nextLetter, category: "NORMAL", startSeat: 1, endSeat: screen.totalColumns, priceMultiplier: 1.0
        }]
      };
    }));
  }, []);

  const removeSeatRow = useCallback((screenIndex, rowIndex) => {
    setScreens(prev => prev.map((screen, si) => 
      si === screenIndex ? { ...screen, seatRows: screen.seatRows.filter((_, ri) => ri !== rowIndex) } : screen
    ));
  }, []);

  const addScreen = () => setScreens(prev => [...prev, createNewScreen(prev.length + 1, prev[0]?.totalColumns || 20)]);
  
  const removeScreen = useCallback((index) => {
    if (screens.length > 1) {
      setScreens(prev => prev.filter((_, i) => i !== index).map((screen, idx) => ({ ...screen, screenNumber: idx + 1, name: `Screen ${idx + 1}` })));
    } else {
      toast.error(t('app.minOneScreen'));
    }
  }, [screens.length, t]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...basicInfo, screens: screens.map(({ screenNumber, name, totalRows, totalColumns, seatRows }) => ({ screenNumber, name, totalRows, totalColumns, seatRows })) });
  };

  const basicFields = [
    { name: "name", label: t('app.theaterName'), placeholder: "e.g., PVR Cinemas", icon: FaBuilding },
    { name: "location", label: t('app.location'), placeholder: "e.g., Juhu, Mumbai", icon: FaMapMarkerAlt },
    { name: "city", label: t('app.city'), placeholder: "e.g., Mumbai", icon: FaCity },
    { name: "state", label: t('app.state'), placeholder: "e.g., Maharashtra", icon: FaFlag },
    { name: "pincode", label: t('app.pincode'), placeholder: "400049", icon: null },
    { name: "contactNumber", label: t('app.contact'), placeholder: "9876543210", icon: FaPhone }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white sticky top-0 z-10 shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('app.addNewTheater')}</h1>
            <p className="text-blue-100 text-sm">{t('app.createTheaterDesc')}</p>
          </div>
          <button onClick={() => router.back()} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2">
            <FaTimes /> {t('app.cancel')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
          {[
            { id: "basic", label: t('app.basicInfo'), icon: FaBuilding },
            { id: "screens", label: t('app.screensAndSeats'), icon: MdScreenShare, count: screens.length }
          ].map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 font-semibold transition flex items-center gap-2 ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400"}`}>
              <tab.icon /> {tab.label} {tab.count && `(${tab.count})`}
            </button>
          ))}
        </div>

        {activeTab === "basic" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {basicFields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">{field.label} *</label>
                  <div className="relative">
                    {field.icon && <field.icon className="absolute left-3 top-3 text-gray-400" />}
                    <input type={field.name === "contactNumber" ? "tel" : "text"} name={field.name} value={basicInfo[field.name]} onChange={handleBasicChange} required
                      className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 ${field.icon ? 'pl-10' : ''}`} placeholder={field.placeholder} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setActiveTab("screens")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                {t('app.next')} →
              </button>
            </div>
          </div>
        )}

        {activeTab === "screens" && (
          <div className="space-y-6">
            {screens.map((screen, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <h3 className="text-lg font-bold">{t('app.screen')} {screen.screenNumber}</h3>
                  <button type="button" onClick={() => removeScreen(idx)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                    <FaTrash size={12} /> {t('app.remove')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <input type="text" value={screen.name} onChange={(e) => updateScreen(idx, { name: e.target.value })}
                    className="px-3 py-2 border rounded dark:bg-gray-700" placeholder={t('app.screenName')} />
                  <input type="number" value={screen.totalColumns} onChange={(e) => {
                    const newCols = parseInt(e.target.value);
                    updateScreen(idx, { 
                      totalColumns: newCols,
                      seatRows: screen.seatRows.map(row => ({ ...row, endSeat: row.category === "VIP" ? Math.min(10, newCols) : newCols }))
                    });
                  }} className="px-3 py-2 border rounded dark:bg-gray-700" min="1" max="30" placeholder={t('app.seatsPerRow')} />
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {screen.seatRows.map((row, ri) => (
                    <SeatRowConfig key={ri} row={row} index={ri} onUpdate={(i, r) => updateSeatRow(idx, i, r)} onDelete={(i) => removeSeatRow(idx, i)} t={t} />
                  ))}
                </div>

                <button type="button" onClick={() => addSeatRow(idx)} className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <FaPlus /> {t('app.addRow')}
                </button>
              </div>
            ))}

            <div className="flex flex-col md:flex-row justify-between gap-4">
              <button type="button" onClick={addScreen} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                <FaPlus /> {t('app.addScreen')}
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setActiveTab("basic")} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                  ← {t('app.back')}
                </button>
                <button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50">
                  {mutation.isPending ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div> {t('app.creating')}</> : <><FaSave /> {t('app.createTheater')}</>}
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