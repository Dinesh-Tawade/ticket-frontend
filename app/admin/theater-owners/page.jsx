// "use client";
// import React, { useState, useEffect } from 'react';
// import { createTheaterOwner, getAllTheatersAdmin, getTheaterByIdAdmin } from '../../services/adminCommunication';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import toast, { Toaster } from 'react-hot-toast';

// function Page() {
//   const [theaterOwner, setTheaterOwner] = useState({
//     name: '',
//     email: '',
//     password: '',
//     phone: '',
//     address: '',
//   });

//   // Theater Owner Seat Access States
//   const [selectedTheaterId, setSelectedTheaterId] = useState("");
//   const [selectedTheater, setSelectedTheater] = useState(null);
//   const [selectedScreenId, setSelectedScreenId] = useState("");
//   const [selectedZoneId, setSelectedZoneId] = useState("");
//   const [selectedZoneName, setSelectedZoneName] = useState("");
//   const [zoneOptions, setZoneOptions] = useState([]);
//   const [seatsInZone, setSeatsInZone] = useState([]);
//   const [selectedSeatKeys, setSelectedSeatKeys] = useState([]);

//   // Fetch all theaters for dropdown
//   const { data: theatersData } = useQuery({
//     queryKey: ["adminTheatersForOwnerAccess"],
//     queryFn: () => getAllTheatersAdmin(),
//   });

//   const theaters = theatersData?.data || [];

//   // Fetch selected theater details
//   const { data: theaterDetailData } = useQuery({
//     queryKey: ["adminTheaterDetailOwner", selectedTheaterId],
//     queryFn: () => getTheaterByIdAdmin(selectedTheaterId),
//     enabled: !!selectedTheaterId,
//   });

//   useEffect(() => {
//     if (theaterDetailData?.data) {
//       setSelectedTheater(theaterDetailData.data);
//     }
//   }, [theaterDetailData]);

//   // Reset selections when theater changes
//   useEffect(() => {
//     setSelectedScreenId("");
//     setSelectedZoneId("");
//     setSelectedZoneName("");
//     setZoneOptions([]);
//     setSeatsInZone([]);
//     setSelectedSeatKeys([]);
//   }, [selectedTheaterId]);

//   // Load zones when screen is selected
//   useEffect(() => {
//     if (!selectedScreenId || !selectedTheater) {
//       setZoneOptions([]);
//       setSelectedZoneId("");
//       return;
//     }

//     const screen = selectedTheater.screens?.find(s => s._id === selectedScreenId);
//     if (screen?.zones) {
//       setZoneOptions(screen.zones);
//     }
//   }, [selectedScreenId, selectedTheater]);

//   // Load seats when zone is selected
//   useEffect(() => {
//     if (!selectedZoneId || !selectedTheater || !selectedScreenId) {
//       setSeatsInZone([]);
//       return;
//     }

//     const screen = selectedTheater.screens?.find(s => s._id === selectedScreenId);
//     const zone = screen?.zones?.find(z => z.id === selectedZoneId);

//     if (zone?.rows) {
//       const allSeats = [];
//       zone.rows.forEach((row) => {
//         row.seats?.forEach((seat) => {
//           if (!seat.isBooked) {
//             allSeats.push({
//               rowName: row.rowName,
//               seatNumber: seat.seatNumber,
//               seatKey: `${row.rowName}${seat.seatNumber}`,
//               isBooked: seat.isBooked,
//             });
//           }
//         });
//       });
//       setSeatsInZone(allSeats);
//     }
//   }, [selectedZoneId, selectedTheater, selectedScreenId]);

//   const handleSeatToggle = (seatKey) => {
//     setSelectedSeatKeys((prev) =>
//       prev.includes(seatKey) ? prev.filter((k) => k !== seatKey) : [...prev, seatKey]
//     );
//   };

//   const handleSelectAllSeats = () => {
//     if (selectedSeatKeys.length === seatsInZone.length) {
//       setSelectedSeatKeys([]);
//     } else {
//       setSelectedSeatKeys(seatsInZone.map(seat => seat.seatKey));
//     }
//   };

//   const { mutate, isLoading } = useMutation({
//     mutationFn: createTheaterOwner,
//     onSuccess: () => {
//       toast.success('Theater owner created successfully with seat access!');
//       // Reset form
//       setTheaterOwner({
//         name: '',
//         email: '',
//         password: '',
//         phone: '',
//         address: '',
//       });
//       // Reset seat access states
//       setSelectedTheaterId("");
//       setSelectedScreenId("");
//       setSelectedZoneId("");
//       setSelectedZoneName("");
//       setZoneOptions([]);
//       setSeatsInZone([]);
//       setSelectedSeatKeys([]);
//     },
//     onError: (error) => {
//       toast.error('Error: ' + error.message);
//     }
//   });

//   const handleChange = (e) => {
//     setTheaterOwner({
//       ...theaterOwner,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Prepare payload with seat access
//     const payload = {
//       ...theaterOwner,
//       accessibleSeats: []
//     };

//     // Add seat access if selected
//     if (selectedTheaterId && selectedZoneId && selectedSeatKeys.length > 0) {
//       const seatNumbers = selectedSeatKeys.map(key => {
//         const match = key.match(/([A-Z]+)(\d+)/);
//         return match ? `${match[1]}${match[2]}` : key;
//       });

//       payload.accessibleSeats = [{
//         theaterId: selectedTheaterId,
//         screenId: selectedScreenId,
//         zoneId: selectedZoneId,
//         zoneName: selectedZoneName,
//         seatNumbers: seatNumbers,
//         isActive: true
//       }];
//     }

//     mutate(payload);
//   };

//   return (
//     <>
//       <Toaster 
//         position="top-right"
//         reverseOrder={false}
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//           },
//           success: {
//             duration: 3000,
//             style: {
//               background: 'green',
//               color: 'white',
//             },
//           },
//           error: {
//             duration: 4000,
//             style: {
//               background: 'red',
//               color: 'white',
//             },
//           },
//         }}
//       />
      
//       <div className="max-w-6xl mx-auto p-6">
//         <h1 className='text-2xl font-bold mb-4'>Admin</h1>
//         <p className='text-gray-600 mb-6'>Use the form below to add a new theater owner and assign them seat access.</p>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Owner Details */}
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h2 className="text-xl font-semibold mb-4">Owner Details</h2>
            
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Full Name *</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={theaterOwner.name}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Email *</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={theaterOwner.email}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Password *</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={theaterOwner.password}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Phone *</label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={theaterOwner.phone}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="col-span-2">
//                 <label className="block text-sm font-medium mb-1">Address *</label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={theaterOwner.address}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Seat Access Assignment Section */}
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h2 className="text-xl font-semibold mb-4">Assign Seat Access to Theater Owner</h2>
//             <p className="text-sm text-gray-500 mb-4">Select theater, screen, zone and assign specific seats to this theater owner.</p>
            
//             {/* Theater Selection */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Select Theater *</label>
//               <select
//                 value={selectedTheaterId}
//                 onChange={(e) => setSelectedTheaterId(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">-- Select a theater --</option>
//                 {theaters.map((theater) => (
//                   <option key={theater._id} value={theater._id}>
//                     {theater.name} - {theater.city}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Screen Selection */}
//             {selectedTheaterId && selectedTheater?.screens?.length > 0 && (
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Select Screen *</label>
//                 <select
//                   value={selectedScreenId}
//                   onChange={(e) => setSelectedScreenId(e.target.value)}
//                   className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">-- Select a screen --</option>
//                   {selectedTheater.screens.map((screen) => (
//                     <option key={screen._id} value={screen._id}>
//                       Screen {screen.screenNumber} - {screen.name || "Unnamed"}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* Zone Selection */}
//             {selectedScreenId && zoneOptions.length > 0 && (
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Select Zone *</label>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                   {zoneOptions.map((zone) => (
//                     <button
//                       key={zone.id}
//                       type="button"
//                       onClick={() => {
//                         setSelectedZoneId(zone.id);
//                         setSelectedZoneName(zone.seatType);
//                         setSelectedSeatKeys([]);
//                       }}
//                       className={`p-3 rounded-lg border text-sm font-medium transition ${
//                         selectedZoneId === zone.id
//                           ? 'bg-blue-500 text-white border-blue-500'
//                           : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
//                       }`}
//                     >
//                       {zone.seatType} - ₹{zone.finalPrice}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Seat Selection */}
//             {selectedZoneId && seatsInZone.length > 0 && (
//               <div className="mb-4">
//                 <div className="flex justify-between items-center mb-2">
//                   <label className="block text-sm font-medium">Select Seats to Assign *</label>
//                   <button
//                     type="button"
//                     onClick={handleSelectAllSeats}
//                     className="text-sm text-blue-600 hover:text-blue-700"
//                   >
//                     {selectedSeatKeys.length === seatsInZone.length ? 'Deselect All' : 'Select All'}
//                   </button>
//                 </div>
//                 <div className="max-h-64 overflow-y-auto rounded-lg border p-3">
//                   <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
//                     {seatsInZone.map((seat) => (
//                       <label
//                         key={seat.seatKey}
//                         className={`flex items-center justify-center gap-2 rounded px-2 py-1 cursor-pointer transition ${
//                           selectedSeatKeys.includes(seat.seatKey)
//                             ? 'bg-blue-100 border-blue-400'
//                             : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
//                         } border`}
//                       >
//                         <input
//                           type="checkbox"
//                           checked={selectedSeatKeys.includes(seat.seatKey)}
//                           onChange={() => handleSeatToggle(seat.seatKey)}
//                           className="h-4 w-4 rounded"
//                         />
//                         <span className="text-xs font-medium">
//                           {seat.rowName}{seat.seatNumber}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//                 <p className="mt-2 text-sm text-gray-600">
//                   Selected: <strong>{selectedSeatKeys.length}</strong> seat(s)
//                 </p>
//               </div>
//             )}

//             {selectedZoneId && seatsInZone.length === 0 && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
//                 No available seats found in this zone. All seats might be booked.
//               </div>
//             )}

//             {selectedTheaterId && !selectedScreenId && selectedTheater?.screens?.length === 0 && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
//                 No screens found in this theater. Please add screens first.
//               </div>
//             )}
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => window.history.back()}
//               className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 cursor-pointer"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 cursor-pointer"
//             >
//               {isLoading ? 'Creating...' : 'Create Theater Owner with Seat Access'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// }

// export default Page;




"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createTheaterOwner, getAllTheatersAdmin, getTheaterByIdAdmin } from "../../services/adminCommunication";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import {
  FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt,
  FaCheckCircle, FaArrowLeft, FaArrowRight, FaThLarge,
  FaTimes, FaLayerGroup, FaChair,
} from "react-icons/fa";
import { MdEventSeat, MdTheaters } from "react-icons/md";
import { GiTheaterCurtains } from "react-icons/gi";

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Owner Details",   icon: FaUser },
  { id: 2, label: "Assign Seats",    icon: MdEventSeat },
  { id: 3, label: "Review & Create", icon: FaCheckCircle },
];

function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 28 }}>
      {STEPS.map((s, i) => {
        const done   = current > s.id;
        const active = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "#22c55e" : active ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "var(--background)",
                border: done ? "2px solid #22c55e" : active ? "2px solid #3b82f6" : "2px solid var(--card-border)",
                boxShadow: active ? "0 4px 16px rgba(59,130,246,.35)" : "none",
                transition: "all .3s",
              }}>
                {done
                  ? <FaCheckCircle style={{ color: "#fff", fontSize: 15 }} />
                  : <s.icon style={{ color: active ? "#fff" : "var(--foreground)", fontSize: 15, opacity: active ? 1 : 0.4 }} />}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em",
                color: active || done ? "var(--foreground)" : "var(--foreground)", opacity: active || done ? 1 : 0.4,
                whiteSpace: "nowrap",
              }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                height: 2, width: 56, marginBottom: 22, flexShrink: 0,
                background: current > s.id ? "#22c55e" : "var(--card-border)",
                transition: "background .4s",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CINEMA SEAT PICKER  (the main new component)
// ─────────────────────────────────────────────────────────────────────────────

function CinemaSeatPicker({ theater, selectedSeats, onSeatsChange }) {
  const [activeScreen, setActiveScreen] = useState(null);

  // Identify ground / balcony screens
  const groundScreen  = theater?.screens?.find(s => s.position !== "top" && !s.name?.toLowerCase().includes("balcony"));
  const balconyScreen = theater?.screens?.find(s => s.position === "top"  ||  s.name?.toLowerCase().includes("balcony"));

  useEffect(() => {
    if (groundScreen && !activeScreen) setActiveScreen(groundScreen._id || groundScreen.screenNumber);
  }, [groundScreen]);

  const currentScreen = theater?.screens?.find(
    s => (s._id || s.screenNumber) === activeScreen
  );

  const meta     = theater?.layoutMeta || {};
  const isBalcony = currentScreen?.position === "top" || currentScreen?.name?.toLowerCase().includes("balcony");
  const aisleCols = (isBalcony ? meta.balconyAisleCols : meta.aisleCols)  || [];
  const aisleRows = (isBalcony ? meta.balconyAisleRows : meta.aisleRows)  || [];

  // Build flat seat map from current screen
  const seatMap = useMemo(() => {
    if (!currentScreen) return {};
    const map = {};
    (currentScreen.zones || []).forEach(zone => {
      (zone.rows || []).forEach(row => {
        (row.seats || []).forEach(seat => {
          const r = (seat.rowNumber || 1) - 1;
          const c = (seat.columnNumber || 1) - 1;
          map[`${r}-${c}`] = {
            zoneId:     zone.id,
            zoneName:   zone.name,
            zoneColor:  zone.color || "#3b82f6",
            seatId:     seat.seatId,
            seatNumber: seat.seatNumber,
            rowNumber:  r,
            colNumber:  c,
            isBooked:   seat.isBooked || !seat.isAvailable,
            screenId:   currentScreen._id,
          };
        });
      });
    });
    return map;
  }, [currentScreen]);

  const rows = currentScreen?.totalRows    || 0;
  const cols = currentScreen?.totalColumns || 0;
  const getRowLabel = r => String.fromCharCode(65 + r);

  // Key format: "screenId::r-c"
  const makeKey = (r, c) => `${currentScreen?._id || currentScreen?.screenNumber}::${r}-${c}`;

  const isSelected = (r, c) => selectedSeats.has(makeKey(r, c));

  const toggleSeat = useCallback((r, c) => {
    const sd = seatMap[`${r}-${c}`];
    if (!sd || sd.isBooked) return;
    const key = makeKey(r, c);
    onSeatsChange(prev => {
      const next = new Map(prev);
      next.has(key) ? next.delete(key) : next.set(key, { ...sd, r, c, screenId: currentScreen._id });
      return next;
    });
  }, [seatMap, currentScreen, onSeatsChange]);

  // Zone-level select/deselect
  const toggleZone = useCallback((zoneId) => {
    const zoneSeats = Object.entries(seatMap).filter(([, v]) => v.zoneId === zoneId && !v.isBooked);
    const allSelected = zoneSeats.every(([k]) => selectedSeats.has(makeKey(...k.split("-").map(Number))));
    onSeatsChange(prev => {
      const next = new Map(prev);
      zoneSeats.forEach(([k, v]) => {
        const [r, c] = k.split("-").map(Number);
        const key = makeKey(r, c);
        allSelected ? next.delete(key) : next.set(key, { ...v, r, c, screenId: currentScreen._id });
      });
      return next;
    });
  }, [seatMap, selectedSeats, currentScreen, onSeatsChange]);

  const zonesInScreen = useMemo(() => {
    const seen = new Map();
    Object.values(seatMap).forEach(s => {
      if (!seen.has(s.zoneId)) seen.set(s.zoneId, { id: s.zoneId, name: s.zoneName, color: s.zoneColor });
    });
    return Array.from(seen.values());
  }, [seatMap]);

  const zoneSelectedCount = (zoneId) => {
    return Array.from(selectedSeats.keys()).filter(k => {
      const [screenPart, rc] = k.split("::");
      if (screenPart !== String(currentScreen?._id || currentScreen?.screenNumber)) return false;
      const sd = seatMap[rc];
      return sd?.zoneId === zoneId;
    }).length;
  };

  const zoneTotalCount = (zoneId) =>
    Object.values(seatMap).filter(s => s.zoneId === zoneId && !s.isBooked).length;

  if (!theater?.screens?.length) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--foreground)", opacity: 0.4 }}>
        <MdEventSeat style={{ fontSize: 48, marginBottom: 12 }} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>No seat layout found for this theater</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Screen switcher */}
      {groundScreen && balconyScreen && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[groundScreen, balconyScreen].map(sc => {
            const id  = sc._id || sc.screenNumber;
            const act = activeScreen === id;
            return (
              <button key={id} onClick={() => setActiveScreen(id)} style={{
                padding: "6px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: act ? "2px solid #3b82f6" : "1px solid var(--card-border)",
                background: act ? "rgba(59,130,246,.12)" : "var(--background)",
                color: act ? "#3b82f6" : "var(--foreground)", cursor: "pointer",
                opacity: act ? 1 : 0.6, transition: "all .15s",
              }}>
                {sc.position === "top" || sc.name?.toLowerCase().includes("balcony") ? "🏗 Balcony" : "🏛 Ground"}
              </button>
            );
          })}
        </div>
      )}

      {/* Zone quick-select pills */}
      {zonesInScreen.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "var(--foreground)", opacity: 0.5, alignSelf: "center", marginRight: 4 }}>
            Quick select:
          </span>
          {zonesInScreen.map(z => {
            const sel   = zoneSelectedCount(z.id);
            const total = zoneTotalCount(z.id);
            const allSel = sel === total && total > 0;
            return (
              <button key={z.id} onClick={() => toggleZone(z.id)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: allSel ? z.color + "30" : z.color + "14",
                border: `1.5px solid ${allSel ? z.color : z.color + "55"}`,
                color: z.color, cursor: "pointer", transition: "all .15s",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: z.color, display: "inline-block" }} />
                {z.name}
                <span style={{
                  background: allSel ? z.color : z.color + "33",
                  color: allSel ? "#fff" : z.color,
                  borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 800,
                }}>
                  {sel}/{total}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Screen bar */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{
          height: 3, maxWidth: 480, margin: "0 auto 5px",
          background: "linear-gradient(90deg,transparent,#e2c97e,transparent)",
          borderRadius: 2,
        }} />
        <div style={{ fontSize: 9, color: "#e2c97e", letterSpacing: "3px", fontWeight: 700 }}>
          SCREEN — ALL EYES THIS WAY
        </div>
      </div>

      {/* Seat grid */}
      {rows === 0 ? (
        <div style={{ textAlign: "center", padding: 32, opacity: 0.4, fontSize: 13 }}>No seat data for this screen</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center", minWidth: "max-content" }}>

            {/* Column headers */}
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 22, flexShrink: 0 }} />
              {Array.from({ length: cols }, (_, c) => (
                <span key={c} style={{ display: "contents" }}>
                  {aisleCols.find(a => a.idx === c - 1) && <div style={{ width: 14, flexShrink: 0 }} />}
                  <div style={{ width: 22, textAlign: "center", fontSize: 8, color: "var(--foreground)", opacity: 0.35, fontWeight: 600, flexShrink: 0 }}>
                    {c + 1}
                  </div>
                </span>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }, (_, r) => {
              const hasRowAisle = aisleRows.find(a => a.idx === r - 1);
              return (
                <span key={r} style={{ display: "contents" }}>
                  {hasRowAisle && <div style={{ height: 10, flexShrink: 0 }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    {/* Row label */}
                    <div style={{ width: 22, textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--foreground)", opacity: 0.4, flexShrink: 0 }}>
                      {getRowLabel(r)}
                    </div>
                    {Array.from({ length: cols }, (_, c) => {
                      const sd       = seatMap[`${r}-${c}`];
                      const colAisle = aisleCols.find(a => a.idx === c - 1);
                      const isEmpty  = !sd;
                      const isBooked = sd?.isBooked;
                      const isSel    = isSelected(r, c);
                      const color    = sd?.zoneColor || "#4a9edd";

                      let bg, border, cursor, transform;
                      if (isEmpty) { bg = "transparent"; border = "transparent"; cursor = "default"; transform = "none"; }
                      else if (isBooked) { bg = "#1f2028"; border = "#2a2a38"; cursor = "not-allowed"; transform = "none"; }
                      else if (isSel) { bg = color; border = "#fff"; cursor = "pointer"; transform = "scale(1.12)"; }
                      else { bg = color + "28"; border = color + "70"; cursor = "pointer"; transform = "none"; }

                      return (
                        <span key={c} style={{ display: "contents" }}>
                          {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                          <button
                            onClick={() => toggleSeat(r, c)}
                            disabled={isEmpty || isBooked}
                            title={sd ? `${getRowLabel(r)}${c + 1} · ${sd.zoneName}` : ""}
                            style={{
                              width: 20, height: 20, flexShrink: 0,
                              borderRadius: "4px 4px 3px 3px",
                              background: bg, border: `1.5px solid ${border}`,
                              cursor, transform, transition: "transform .1s",
                              outline: "none", padding: 0,
                              opacity: isEmpty ? 0 : isBooked ? 0.35 : 1,
                            }}
                          />
                        </span>
                      );
                    })}
                  </div>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16, justifyContent: "center" }}>
        {[
          { bg: "#4a9edd28", border: "#4a9edd70", label: "Available" },
          { bg: "#4a9edd",   border: "#fff",       label: "Selected"  },
          { bg: "#1f2028",   border: "#2a2a38",    label: "Booked"    },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--foreground)", opacity: 0.6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1.5px solid ${l.border}` }} />
            {l.label}
          </div>
        ))}
        {zonesInScreen.map(z => (
          <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: z.color }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: z.color + "60", border: `1.5px solid ${z.color}` }} />
            {z.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const OWNER_FIELDS = [
  { name: "name",     label: "Full Name",  placeholder: "e.g., Ramesh Sharma",     icon: FaUser,        type: "text",     required: true  },
  { name: "email",    label: "Email",      placeholder: "ramesh@example.com",       icon: FaEnvelope,    type: "email",    required: true  },
  { name: "password", label: "Password",   placeholder: "Min. 8 characters",        icon: FaLock,        type: "password", required: true  },
  { name: "phone",    label: "Phone",      placeholder: "10-digit mobile number",   icon: FaPhone,       type: "tel",      required: true  },
  { name: "address",  label: "Address",    placeholder: "Full address",             icon: FaMapMarkerAlt,type: "text",     required: true, full: true },
];

export default function CreateTheaterOwnerPage() {
  const [step, setStep] = useState(1);

  const [ownerInfo, setOwnerInfo] = useState({
    name: "", email: "", password: "", phone: "", address: "",
  });

  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [selectedTheater,   setSelectedTheater]   = useState(null);

  // Map<"screenId::r-c", seatData>
  const [selectedSeats, setSelectedSeats] = useState(new Map());

  // ── Fetch all theaters ──
  const { data: theatersData } = useQuery({
    queryKey: ["adminTheatersForOwnerAccess"],
    queryFn:  getAllTheatersAdmin,
  });
  const theaters = theatersData?.data || [];

  // ── Fetch selected theater detail ──
  const { data: theaterDetailData, isLoading: loadingTheater } = useQuery({
    queryKey: ["adminTheaterDetailOwner", selectedTheaterId],
    queryFn:  () => getTheaterByIdAdmin(selectedTheaterId),
    enabled:  !!selectedTheaterId,
  });

  useEffect(() => {
    if (theaterDetailData?.data) setSelectedTheater(theaterDetailData.data);
  }, [theaterDetailData]);

  // Reset seats when theater changes
  useEffect(() => {
    setSelectedSeats(new Map());
    setSelectedTheater(null);
  }, [selectedTheaterId]);

  // ── Mutation ──
  const { mutate, isPending } = useMutation({
    mutationFn: createTheaterOwner,
    onSuccess: () => {
      toast.success("Theater owner created successfully!");
      setOwnerInfo({ name: "", email: "", password: "", phone: "", address: "" });
      setSelectedTheaterId("");
      setSelectedSeats(new Map());
      setStep(1);
    },
    onError: err => toast.error(err?.response?.data?.message || err.message || "Failed to create owner"),
  });

  // ── Derived seat summary ──
  const seatSummary = useMemo(() => {
    const byZone = new Map();
    selectedSeats.forEach((sd) => {
      const existing = byZone.get(sd.zoneId) || { zoneName: sd.zoneName, zoneColor: sd.zoneColor, seats: [] };
      existing.seats.push(sd.seatNumber || `${String.fromCharCode(65 + sd.r)}${sd.c + 1}`);
      byZone.set(sd.zoneId, existing);
    });
    return byZone;
  }, [selectedSeats]);

  // ── Validation ──
  const validateStep1 = () => {
    if (!ownerInfo.name.trim())                         { toast.error("Full name is required");             return false; }
    if (!ownerInfo.email.trim())                        { toast.error("Email is required");                 return false; }
    if (!ownerInfo.password || ownerInfo.password.length < 8) { toast.error("Password must be 8+ characters");   return false; }
    if (!ownerInfo.phone.trim() || ownerInfo.phone.replace(/\D/g,"").length !== 10) { toast.error("Valid 10-digit phone required"); return false; }
    if (!ownerInfo.address.trim())                      { toast.error("Address is required");               return false; }
    return true;
  };

  // ── Submit ──
  const handleSubmit = () => {
    if (!validateStep1()) { setStep(1); return; }

    // Build accessibleSeats grouped by screen + zone
    const grouped = new Map();
    selectedSeats.forEach((sd) => {
      const key = `${sd.screenId}::${sd.zoneId}`;
      if (!grouped.has(key)) grouped.set(key, { screenId: sd.screenId, zoneId: sd.zoneId, zoneName: sd.zoneName, seatNumbers: [] });
      grouped.get(key).seatNumbers.push(sd.seatNumber || `${String.fromCharCode(65 + sd.r)}${sd.c + 1}`);
    });

    const accessibleSeats = Array.from(grouped.values()).map(g => ({
      theaterId:   selectedTheaterId,
      screenId:    g.screenId,
      zoneId:      g.zoneId,
      zoneName:    g.zoneName,
      seatNumbers: g.seatNumbers,
      isActive:    true,
    }));

    mutate({ ...ownerInfo, accessibleSeats });
  };

  // ── Shared styles ──
  const card = {
    background: "var(--card)", border: "1px solid var(--card-border)",
    borderRadius: 16, padding: "28px",
  };
  const fieldLabel = { fontSize: 12, fontWeight: 700, color: "var(--foreground)", opacity: 0.7, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" };
  const fieldInput = {
    width: "100%", padding: "10px 14px 10px 38px", fontSize: 13,
    border: "1px solid var(--card-border)", borderRadius: 10,
    background: "var(--background)", color: "var(--foreground)",
    outline: "none", boxSizing: "border-box", transition: "border .15s",
  };
  const btnPrimary = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "11px 26px", fontSize: 14, borderRadius: 10, border: "none",
    background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff",
    cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 14px rgba(59,130,246,.3)",
    transition: "all .15s",
  };
  const btnSecondary = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "11px 22px", fontSize: 13, borderRadius: 10,
    border: "2px solid var(--card-border)", background: "var(--background)",
    color: "var(--foreground)", cursor: "pointer", fontWeight: 600,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", transition: "colors .3s", padding: "24px" }}>
      <Toaster position="top-right" />

      {/* ── Page header ── */}
      <div style={{
        ...card, marginBottom: 24, padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: "linear-gradient(135deg,#1a1a2e,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GiTheaterCurtains style={{ color: "#fff", fontSize: 22 }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)", margin: 0 }}>Create Theater Owner</h1>
            <p style={{ fontSize: 11, color: "var(--foreground)", opacity: 0.5, margin: 0 }}>
              Add a new admin and assign their seat access
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
            {selectedSeats.size} seat{selectedSeats.size !== 1 ? "s" : ""} assigned
          </div>
          <div style={{ fontSize: 11, color: "var(--foreground)", opacity: 0.5 }}>
            {seatSummary.size} zone{seatSummary.size !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: step === 2 ? 960 : 680, margin: "0 auto" }}>
        <StepIndicator current={step} />

        {/* ═══════════════════════════════════════════════════
            STEP 1 — OWNER DETAILS
        ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div style={card}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 22, marginTop: 0 }}>
              Owner Information
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {OWNER_FIELDS.map(f => (
                <div key={f.name} style={f.full ? { gridColumn: "1 / -1" } : {}}>
                  <label style={fieldLabel}>{f.label} {f.required && <span style={{ color: "#ef4444" }}>*</span>}</label>
                  <div style={{ position: "relative" }}>
                    <f.icon style={{
                      position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                      color: "var(--foreground)", opacity: 0.35, fontSize: 13, pointerEvents: "none",
                    }} />
                    <input
                      type={f.type}
                      name={f.name}
                      value={ownerInfo[f.name]}
                      placeholder={f.placeholder}
                      onChange={e => {
                        let val = e.target.value;
                        if (f.name === "phone") val = val.replace(/\D/g, "").slice(0, 10);
                        setOwnerInfo(p => ({ ...p, [f.name]: val }));
                      }}
                      style={fieldInput}
                      onFocus={e => e.target.style.borderColor = "#3b82f6"}
                      onBlur={e  => e.target.style.borderColor = "var(--card-border)"}
                    />
                  </div>
                  {f.name === "phone" && (
                    <div style={{ fontSize: 10, color: "var(--foreground)", opacity: 0.4, marginTop: 3 }}>
                      {ownerInfo.phone.length}/10 digits
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => { if (validateStep1()) setStep(2); }} style={btnPrimary}>
                Next: Assign Seats <FaArrowRight style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 2 — SEAT ASSIGNMENT
        ═══════════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>

              {/* Left — seat picker */}
              <div style={{ ...card, padding: "24px" }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", margin: "0 0 4px" }}>
                    Seat Assignment
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--foreground)", opacity: 0.5, margin: 0 }}>
                    Select a theater, then click seats or use zone pills to assign access.
                  </p>
                </div>

                {/* Theater selector */}
                <div style={{ marginBottom: 16 }}>
                  <label style={fieldLabel}>Theater <span style={{ color: "#ef4444" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <MdTheaters style={{
                      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                      color: "var(--foreground)", opacity: 0.35, fontSize: 15, pointerEvents: "none",
                    }} />
                    <select
                      value={selectedTheaterId}
                      onChange={e => setSelectedTheaterId(e.target.value)}
                      style={{ ...fieldInput, paddingLeft: 36, cursor: "pointer" }}
                    >
                      <option value="">— Select a theater —</option>
                      {theaters.map(t => (
                        <option key={t._id} value={t._id}>{t.name} · {t.city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Loading state */}
                {loadingTheater && selectedTheaterId && (
                  <div style={{ textAlign: "center", padding: 40, opacity: 0.4 }}>
                    <div style={{
                      width: 28, height: 28, border: "3px solid var(--card-border)",
                      borderTopColor: "#3b82f6", borderRadius: "50%",
                      animation: "spin 1s linear infinite", margin: "0 auto 10px",
                    }} />
                    <div style={{ fontSize: 12 }}>Loading seat layout…</div>
                  </div>
                )}

                {/* Seat picker */}
                {selectedTheater && !loadingTheater && (
                  <div style={{
                    background: "#0f0f16", borderRadius: 12, padding: "20px 16px",
                    border: "1px solid #1f1f2e",
                  }}>
                    <CinemaSeatPicker
                      theater={selectedTheater}
                      selectedSeats={selectedSeats}
                      onSeatsChange={setSelectedSeats}
                    />
                  </div>
                )}

                {!selectedTheaterId && (
                  <div style={{
                    textAlign: "center", padding: "48px 24px",
                    border: "1.5px dashed var(--card-border)", borderRadius: 12,
                    opacity: 0.4,
                  }}>
                    <MdEventSeat style={{ fontSize: 40, color: "var(--foreground)", marginBottom: 10 }} />
                    <div style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 600 }}>
                      Select a theater to view its seat layout
                    </div>
                  </div>
                )}
              </div>

              {/* Right — selected seats panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Owner summary card */}
                <div style={{ ...card, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--foreground)", opacity: 0.5, marginBottom: 10 }}>
                    Creating owner
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <FaUser style={{ color: "#fff", fontSize: 14 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                        {ownerInfo.name || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--foreground)", opacity: 0.5 }}>
                        {ownerInfo.email || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned seats card */}
                <div style={{ ...card, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--foreground)", opacity: 0.5 }}>
                      Assigned seats
                    </div>
                    {selectedSeats.size > 0 && (
                      <button onClick={() => setSelectedSeats(new Map())} style={{
                        fontSize: 10, color: "#ef4444", background: "none", border: "none",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <FaTimes style={{ fontSize: 9 }} /> Clear all
                      </button>
                    )}
                  </div>

                  {selectedSeats.size === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0", opacity: 0.3 }}>
                      <FaChair style={{ fontSize: 28, color: "var(--foreground)", marginBottom: 8 }} />
                      <div style={{ fontSize: 11, color: "var(--foreground)" }}>No seats selected yet</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {Array.from(seatSummary.entries()).map(([zoneId, { zoneName, zoneColor, seats }]) => (
                        <div key={zoneId}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: zoneColor, display: "inline-block", flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground)" }}>{zoneName}</span>
                            <span style={{
                              marginLeft: "auto", fontSize: 10, fontWeight: 800,
                              background: zoneColor + "22", color: zoneColor,
                              border: `1px solid ${zoneColor}44`,
                              borderRadius: 10, padding: "1px 7px",
                            }}>
                              {seats.length}
                            </span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {seats.slice(0, 18).map(sn => (
                              <span key={sn} style={{
                                fontSize: 10, fontWeight: 700,
                                padding: "2px 6px", borderRadius: 4,
                                background: zoneColor + "18",
                                color: zoneColor,
                                border: `1px solid ${zoneColor}33`,
                              }}>{sn}</span>
                            ))}
                            {seats.length > 18 && (
                              <span style={{ fontSize: 10, color: "var(--foreground)", opacity: 0.4, alignSelf: "center" }}>
                                +{seats.length - 18} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div style={{
                        marginTop: 4, paddingTop: 10, borderTop: "1px solid var(--card-border)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <span style={{ fontSize: 11, color: "var(--foreground)", opacity: 0.5 }}>Total assigned</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>{selectedSeats.size}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Theater info */}
                {selectedTheater && (
                  <div style={{ ...card, padding: "14px 18px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--foreground)", opacity: 0.5, marginBottom: 8 }}>
                      Theater
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{selectedTheater.name}</div>
                    <div style={{ fontSize: 11, color: "var(--foreground)", opacity: 0.5, marginTop: 2 }}>
                      {selectedTheater.location}, {selectedTheater.city}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {[
                        { v: selectedTheater.screens?.length || 0, l: "Screens" },
                        { v: selectedTheater.totalSeats || 0,       l: "Seats"   },
                      ].map(s => (
                        <div key={s.l} style={{
                          flex: 1, textAlign: "center", padding: "6px 4px",
                          background: "var(--background)", borderRadius: 8, border: "1px solid var(--card-border)",
                        }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#3b82f6" }}>{s.v}</div>
                          <div style={{ fontSize: 9, color: "var(--foreground)", opacity: 0.5 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>
                <FaArrowLeft style={{ fontSize: 11 }} /> Back
              </button>
              <button onClick={() => setStep(3)} style={btnPrimary}>
                Review & Create <FaArrowRight style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 3 — REVIEW & SUBMIT
        ═══════════════════════════════════════════════════ */}
        {step === 3 && (
          <div style={card}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginTop: 0, marginBottom: 22 }}>
              Review & Confirm
            </h2>

            {/* Owner details */}
            <div style={{ background: "var(--background)", borderRadius: 10, padding: 16, marginBottom: 14, border: "1px solid var(--card-border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--foreground)", opacity: 0.5, marginBottom: 12 }}>
                Owner details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["Full Name", ownerInfo.name],
                  ["Email",    ownerInfo.email],
                  ["Phone",    ownerInfo.phone],
                  ["Address",  ownerInfo.address],
                ].map(([l, v]) => (
                  <div key={l} style={{ fontSize: 13 }}>
                    <span style={{ color: "var(--foreground)", opacity: 0.5 }}>{l}: </span>
                    <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{v || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat access summary */}
            <div style={{ background: "var(--background)", borderRadius: 10, padding: 16, marginBottom: 14, border: "1px solid var(--card-border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--foreground)", opacity: 0.5, marginBottom: 12 }}>
                Seat access
              </div>

              {selectedSeats.size === 0 ? (
                <div style={{ fontSize: 13, color: "var(--foreground)", opacity: 0.4 }}>
                  ⚠️ No seats assigned — this owner will have no booking access.
                </div>
              ) : (
                <>
                  {selectedTheater && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 10 }}>
                      <MdTheaters style={{ marginRight: 5, verticalAlign: "middle" }} />
                      {selectedTheater.name} · {selectedTheater.city}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Array.from(seatSummary.entries()).map(([zoneId, { zoneName, zoneColor, seats }]) => (
                      <div key={zoneId} style={{
                        padding: "10px 14px", borderRadius: 8,
                        background: zoneColor + "10", border: `1px solid ${zoneColor}30`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: zoneColor, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: zoneColor }}>{zoneName}</span>
                          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 800, color: "var(--foreground)" }}>
                            {seats.length} seat{seats.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {seats.map(sn => (
                            <span key={sn} style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                              background: zoneColor + "20", color: zoneColor,
                              border: `1px solid ${zoneColor}40`,
                            }}>{sn}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--card-border)",
                    fontSize: 13, fontWeight: 700, color: "var(--foreground)",
                    display: "flex", justifyContent: "space-between",
                  }}>
                    <span>Total seats assigned</span>
                    <span style={{ color: "#3b82f6", fontSize: 16 }}>{selectedSeats.size}</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--card-border)" }}>
              <button onClick={() => setStep(2)} style={btnSecondary}>
                <FaArrowLeft style={{ fontSize: 11 }} /> Back
              </button>
              <button onClick={handleSubmit} disabled={isPending} style={{ ...btnPrimary, opacity: isPending ? 0.75 : 1 }}>
                {isPending ? (
                  <>
                    <div style={{
                      width: 15, height: 15, border: "2px solid rgba(255,255,255,.4)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }} />
                    Creating…
                  </>
                ) : (
                  <><FaCheckCircle style={{ fontSize: 13 }} /> Create Owner</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}