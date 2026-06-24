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
//               {isLoading ? 'Creating...' : 'Create  Admin with Seat Access'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// }

// export default Page;




"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  createTheaterOwner,
  getAllUsers,
  getAllTheatersAdmin,
  getTheaterByIdAdmin,
  getUserById,
  updateUserStatus,
  updateUser,
} from "../../services/adminCommunication";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaChair,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaChair as FaSeat,
  FaClipboardList,
  FaTheaterMasks,
  FaPhoneAlt,
} from "react-icons/fa";
import { MdEventSeat, MdTheaters } from "react-icons/md";
import { GiTheaterCurtains } from "react-icons/gi";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(d))
    : "—";

function Avatar({ name, size = 40 }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const colors = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#3b82f6,#2563eb)",
    "linear-gradient(135deg,#0ea5e9,#0284c7)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
  ];
  const color = colors[(name || "").length % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: size * 0.35,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR  (for create wizard)
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Owner Details", icon: FaUser },
  { id: 2, label: "Assign Seats", icon: MdEventSeat },
  { id: 3, label: "Review & Create", icon: FaCheckCircle },
];

function StepIndicator({ current }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 28,
      }}
    >
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done
                    ? "#22c55e"
                    : active
                    ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                    : "var(--background)",
                  border: done
                    ? "2px solid #22c55e"
                    : active
                    ? "2px solid #3b82f6"
                    : "2px solid var(--card-border)",
                  boxShadow: active
                    ? "0 4px 16px rgba(59,130,246,.35)"
                    : "none",
                  transition: "all .3s",
                }}
              >
                {done ? (
                  <FaCheckCircle style={{ color: "#fff", fontSize: 15 }} />
                ) : (
                  <s.icon
                    style={{
                      color: active ? "#fff" : "var(--foreground)",
                      fontSize: 15,
                      opacity: active ? 1 : 0.4,
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  color: "var(--foreground)",
                  opacity: active || done ? 1 : 0.4,
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  height: 2,
                  width: 56,
                  marginBottom: 22,
                  flexShrink: 0,
                  background:
                    current > s.id ? "#22c55e" : "var(--card-border)",
                  transition: "background .4s",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CINEMA SEAT PICKER
// ─────────────────────────────────────────────────────────────────────────────
function CinemaSeatPicker({ theater, selectedSeats, onSeatsChange, takenSeatNumbers = new Set() }) {
  const [activeScreen, setActiveScreen] = useState(null);

  const groundScreen = theater?.screens?.find(
    (s) =>
      s.position !== "top" && !s.name?.toLowerCase().includes("balcony")
  );
  const balconyScreen = theater?.screens?.find(
    (s) =>
      s.position === "top" || s.name?.toLowerCase().includes("balcony")
  );

  useEffect(() => {
    if (groundScreen && !activeScreen)
      setActiveScreen(groundScreen._id || groundScreen.screenNumber);
  }, [groundScreen]);

  const currentScreen = theater?.screens?.find(
    (s) => (s._id || s.screenNumber) === activeScreen
  );

  const meta = theater?.layoutMeta || {};
  const isBalcony =
    currentScreen?.position === "top" ||
    currentScreen?.name?.toLowerCase().includes("balcony");
  const aisleCols =
    (isBalcony ? meta.balconyAisleCols : meta.aisleCols) || [];
  const aisleRows =
    (isBalcony ? meta.balconyAisleRows : meta.aisleRows) || [];

  const seatMap = useMemo(() => {
    if (!currentScreen) return {};
    const map = {};
    (currentScreen.zones || []).forEach((zone) => {
      (zone.rows || []).forEach((row) => {
        (row.seats || []).forEach((seat) => {
          const r = (seat.rowNumber || 1) - 1;
          const c = (seat.columnNumber || 1) - 1;
          map[`${r}-${c}`] = {
            zoneId: zone.id,
            zoneName: zone.name,
            zoneColor: zone.color || "#3b82f6",
            seatId: seat.seatId,
            seatNumber: seat.seatNumber,
            rowNumber: r,
            colNumber: c,
            isBooked: seat.isBooked || !seat.isAvailable,
            screenId: currentScreen._id,
          };
        });
      });
    });
    return map;
  }, [currentScreen]);

  const rows = currentScreen?.totalRows || 0;
  const cols = currentScreen?.totalColumns || 0;
  const getRowLabel = (r) => String.fromCharCode(65 + r);
  const makeKey = (r, c) =>
    `${currentScreen?._id || currentScreen?.screenNumber}::${r}-${c}`;
  const isSelected = (r, c) => selectedSeats.has(makeKey(r, c));

  const toggleSeat = useCallback(
    (r, c) => {
      const sd = seatMap[`${r}-${c}`];
      if (!sd || sd.isBooked) return;
      const key = makeKey(r, c);
      onSeatsChange((prev) => {
        const next = new Map(prev);
        next.has(key)
          ? next.delete(key)
          : next.set(key, {
              ...sd,
              r,
              c,
              screenId: currentScreen._id,
            });
        return next;
      });
    },
    [seatMap, currentScreen, onSeatsChange]
  );

  const toggleZone = useCallback(
    (zoneId) => {
      const zoneSeats = Object.entries(seatMap).filter(
        ([, v]) => v.zoneId === zoneId && !v.isBooked
      );
      const allSelected = zoneSeats.every(([k]) =>
        selectedSeats.has(makeKey(...k.split("-").map(Number)))
      );
      onSeatsChange((prev) => {
        const next = new Map(prev);
        zoneSeats.forEach(([k, v]) => {
          const [r, c] = k.split("-").map(Number);
          const key = makeKey(r, c);
          allSelected
            ? next.delete(key)
            : next.set(key, {
                ...v,
                r,
                c,
                screenId: currentScreen._id,
              });
        });
        return next;
      });
    },
    [seatMap, selectedSeats, currentScreen, onSeatsChange]
  );

  const zonesInScreen = useMemo(() => {
    const seen = new Map();
    Object.values(seatMap).forEach((s) => {
      if (!seen.has(s.zoneId))
        seen.set(s.zoneId, {
          id: s.zoneId,
          name: s.zoneName,
          color: s.zoneColor,
        });
    });
    return Array.from(seen.values());
  }, [seatMap]);

  const zoneSelectedCount = (zoneId) =>
    Array.from(selectedSeats.keys()).filter((k) => {
      const [screenPart, rc] = k.split("::");
      if (
        screenPart !==
        String(currentScreen?._id || currentScreen?.screenNumber)
      )
        return false;
      const sd = seatMap[rc];
      return sd?.zoneId === zoneId;
    }).length;

  const zoneTotalCount = (zoneId) =>
    Object.values(seatMap).filter(
      (s) => s.zoneId === zoneId && !s.isBooked
    ).length;

  if (!theater?.screens?.length) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "var(--foreground)",
          opacity: 0.4,
        }}
      >
        <MdEventSeat style={{ fontSize: 48, marginBottom: 12 }} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          No seat layout found for this theater
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {groundScreen && balconyScreen && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[groundScreen, balconyScreen].map((sc) => {
            const id = sc._id || sc.screenNumber;
            const act = activeScreen === id;
            return (
              <button
                key={id}
                onClick={() => setActiveScreen(id)}
                style={{
                  padding: "6px 18px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: act
                    ? "2px solid #3b82f6"
                    : "1px solid var(--card-border)",
                  background: act
                    ? "rgba(59,130,246,.12)"
                    : "var(--background)",
                  color: act ? "#3b82f6" : "var(--foreground)",
                  cursor: "pointer",
                  opacity: act ? 1 : 0.6,
                  transition: "all .15s",
                }}
              >
                {sc.position === "top" ||
                sc.name?.toLowerCase().includes("balcony")
                  ? "🏗 Balcony"
                  : "🏛 Ground"}
              </button>
            );
          })}
        </div>
      )}

      {zonesInScreen.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--foreground)",
              opacity: 0.5,
              alignSelf: "center",
              marginRight: 4,
            }}
          >
            Quick select:
          </span>
          {zonesInScreen.map((z) => {
            const sel = zoneSelectedCount(z.id);
            const total = zoneTotalCount(z.id);
            const allSel = sel === total && total > 0;
            return (
              <button
                key={z.id}
                onClick={() => toggleZone(z.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: allSel ? z.color + "30" : z.color + "14",
                  border: `1.5px solid ${allSel ? z.color : z.color + "55"}`,
                  color: z.color,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    background: z.color,
                    display: "inline-block",
                  }}
                />
                {z.name}
                <span
                  style={{
                    background: allSel ? z.color : z.color + "33",
                    color: allSel ? "#fff" : z.color,
                    borderRadius: 10,
                    padding: "0 6px",
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {sel}/{total}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div
          style={{
            height: 3,
            maxWidth: 480,
            margin: "0 auto 5px",
            background:
              "linear-gradient(90deg,transparent,#e2c97e,transparent)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 9,
            color: "#e2c97e",
            letterSpacing: "3px",
            fontWeight: 700,
          }}
        >
          SCREEN — ALL EYES THIS WAY
        </div>
      </div>

      {rows === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 32,
            opacity: 0.4,
            fontSize: 13,
          }}
        >
          No seat data for this screen
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              alignItems: "center",
              minWidth: "max-content",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 22, flexShrink: 0 }} />
              {Array.from({ length: cols }, (_, c) => (
                <span key={c} style={{ display: "contents" }}>
                  {aisleCols.find((a) => a.idx === c - 1) && (
                    <div style={{ width: 14, flexShrink: 0 }} />
                  )}
                  <div
                    style={{
                      width: 22,
                      textAlign: "center",
                      fontSize: 8,
                      color: "var(--foreground)",
                      opacity: 0.35,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {c + 1}
                  </div>
                </span>
              ))}
            </div>

            {Array.from({ length: rows }, (_, r) => {
              const hasRowAisle = aisleRows.find((a) => a.idx === r - 1);
              return (
                <span key={r} style={{ display: "contents" }}>
                  {hasRowAisle && (
                    <div style={{ height: 10, flexShrink: 0 }} />
                  )}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 3 }}
                  >
                    <div
                      style={{
                        width: 22,
                        textAlign: "center",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "var(--foreground)",
                        opacity: 0.4,
                        flexShrink: 0,
                      }}
                    >
                      {getRowLabel(r)}
                    </div>
                    {Array.from({ length: cols }, (_, c) => {
                      const sd = seatMap[`${r}-${c}`];
                      const colAisle = aisleCols.find((a) => a.idx === c - 1);
                      const isEmpty = !sd;
                      const isBooked = sd?.isBooked;
                      const isSel = isSelected(r, c);
                      const color = sd?.zoneColor || "#4a9edd";
                      const isTaken = !isEmpty && !isBooked && takenSeatNumbers.has(sd?.seatNumber || `${String.fromCharCode(65 + r)}${c + 1}`);

                      let bg, border, cursor, transform;
                      if (isEmpty) {
                        bg = "transparent";
                        border = "transparent";
                        cursor = "default";
                        transform = "none";
                      } else if (isBooked) {
                        bg = "#1f2028";
                        border = "#2a2a38";
                        cursor = "not-allowed";
                        transform = "none";
                      } else if (isTaken) {
                        bg = "#f59e0b40";
                        border = "#f59e0b";
                        cursor = "not-allowed";
                        transform = "none";
                      } else if (isSel) {
                        bg = color;
                        border = "#fff";
                        cursor = "pointer";
                        transform = "scale(1.12)";
                      } else {
                        bg = color + "28";
                        border = color + "70";
                        cursor = "pointer";
                        transform = "none";
                      }

                      return (
                        <span key={c} style={{ display: "contents" }}>
                          {colAisle && (
                            <div style={{ width: 14, flexShrink: 0 }} />
                          )}
                          <button
                            onClick={() => toggleSeat(r, c)}
                            disabled={isEmpty || isBooked || isTaken}
                            title={
                              sd
                                ? isTaken ? `${getRowLabel(r)}${c + 1} · Assigned to another owner` : `${getRowLabel(r)}${c + 1} · ${sd.zoneName}`
                                : ""
                            }
                            style={{
                              width: 20,
                              height: 20,
                              flexShrink: 0,
                              borderRadius: "4px 4px 3px 3px",
                              background: bg,
                              border: `1.5px solid ${border}`,
                              cursor,
                              transform,
                              transition: "transform .1s",
                              outline: "none",
                              padding: 0,
                              opacity: isEmpty
                                ? 0
                                : isBooked
                                ? 0.35
                                : isTaken
                                ? 0.9
                                : 1,
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

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 16,
          justifyContent: "center",
        }}
      >
        {[
          { bg: "#4a9edd28", border: "#4a9edd70", label: "Available" },
          { bg: "#4a9edd", border: "#fff", label: "Selected" },
          { bg: "#1f2028", border: "#2a2a38", label: "Booked" },
        ].map((l) => (
          <div
            key={l.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 10,
              color: "var(--foreground)",
              opacity: 0.6,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: l.bg,
                border: `1.5px solid ${l.border}`,
              }}
            />
            {l.label}
          </div>
        ))}
        {zonesInScreen.map((z) => (
          <div
            key={z.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 10,
              color: z.color,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: z.color + "60",
                border: `1.5px solid ${z.color}`,
              }}
            />
            {z.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create  Admin WIZARD (modal)
// ─────────────────────────────────────────────────────────────────────────────
const OWNER_FIELDS = [
  {
    name: "name",
    label: "Full Name",
    placeholder: "e.g., Ramesh Sharma",
    icon: FaUser,
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    placeholder: "ramesh@example.com",
    icon: FaEnvelope,
    type: "email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Min. 8 characters",
    icon: FaLock,
    type: "password",
    required: true,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    placeholder: "Re-enter password",
    icon: FaLock,
    type: "password",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "10-digit mobile number",
    icon: FaPhone,
    type: "tel",
    required: true,
  },
  {
    name: "address",
    label: "Address",
    placeholder: "Full address",
    icon: FaMapMarkerAlt,
    type: "text",
    required: true,
    full: true,
  },
];

function CreateOwnerModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [ownerInfo, setOwnerInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(new Map());

  const { data: theatersData } = useQuery({
    queryKey: ["adminTheatersForOwnerAccess"],
    queryFn: getAllTheatersAdmin,
  });
  const theaters = theatersData?.data || [];

  const { data: theaterDetailData, isLoading: loadingTheater } = useQuery({
    queryKey: ["adminTheaterDetailOwner", selectedTheaterId],
    queryFn: () => getTheaterByIdAdmin(selectedTheaterId),
    enabled: !!selectedTheaterId,
  });

  useEffect(() => {
    if (theaterDetailData?.data) setSelectedTheater(theaterDetailData.data);
  }, [theaterDetailData]);

  useEffect(() => {
    setSelectedSeats(new Map());
    setSelectedTheater(null);
  }, [selectedTheaterId]);

  const { mutate, isPending } = useMutation({
    mutationFn: createTheaterOwner,
    onSuccess: () => {
      toast.success("Theater owner created successfully!");
      onCreated?.();
      onClose();
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || err.message || "Failed to create owner"
      ),
  });

  const seatSummary = useMemo(() => {
    const byZone = new Map();
    selectedSeats.forEach((sd) => {
      const existing = byZone.get(sd.zoneId) || {
        zoneName: sd.zoneName,
        zoneColor: sd.zoneColor,
        seats: [],
      };
      existing.seats.push(
        sd.seatNumber || `${String.fromCharCode(65 + sd.r)}${sd.c + 1}`
      );
      byZone.set(sd.zoneId, existing);
    });
    return byZone;
  }, [selectedSeats]);

  const validateStep1 = () => {
    if (!ownerInfo.name.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!ownerInfo.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!ownerInfo.password || ownerInfo.password.length < 8) {
      toast.error("Password must be 8+ characters");
      return false;
    }
    if (ownerInfo.password !== ownerInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (
      !ownerInfo.phone.trim() ||
      ownerInfo.phone.replace(/\D/g, "").length !== 10
    ) {
      toast.error("Valid 10-digit phone required");
      return false;
    }
    if (!ownerInfo.address.trim()) {
      toast.error("Address is required");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    const grouped = new Map();
    selectedSeats.forEach((sd) => {
      const key = `${sd.screenId}::${sd.zoneId}`;
      if (!grouped.has(key))
        grouped.set(key, {
          screenId: sd.screenId,
          zoneId: sd.zoneId,
          zoneName: sd.zoneName,
          seatNumbers: [],
        });
      grouped
        .get(key)
        .seatNumbers.push(
          sd.seatNumber || `${String.fromCharCode(65 + sd.r)}${sd.c + 1}`
        );
    });
    const accessibleSeats = Array.from(grouped.values()).map((g) => ({
      theaterId: selectedTheaterId,
      screenId: g.screenId,
      zoneId: g.zoneId,
      zoneName: g.zoneName,
      seatNumbers: g.seatNumbers,
      isActive: true,
    }));
    mutate({ ...ownerInfo, accessibleSeats });
  };

  const card = {
    background: "var(--card)",
    border: "1px solid var(--card-border)",
    borderRadius: 16,
    padding: "24px",
  };
  const fieldLabel = {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--foreground)",
    opacity: 0.7,
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: ".05em",
  };
  const fieldInput = {
    width: "100%",
    padding: "10px 14px 10px 38px",
    fontSize: 13,
    border: "1px solid var(--card-border)",
    borderRadius: 10,
    background: "var(--background)",
    color: "var(--foreground)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border .15s",
  };
  const btnPrimary = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 26px",
    fontSize: 14,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(59,130,246,.3)",
    transition: "all .15s",
  };
  const btnSecondary = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 22px",
    fontSize: 13,
    borderRadius: 10,
    border: "2px solid var(--card-border)",
    background: "var(--background)",
    color: "var(--foreground)",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: step === 2 ? 980 : 680,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--background)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "modalIn .25s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg,#1a1a2e,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GiTheaterCurtains style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--foreground)",
                }}
              >
                Create  Admin
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--foreground)",
                  opacity: 0.5,
                }}
              >
                Add a new owner and assign seat access
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: 18,
              padding: 6,
            }}
          >
            <FaTimes />
          </button>
        </div>

        <StepIndicator current={step} />

        {/* STEP 1 */}
        {step === 1 && (
          <div style={card}>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "var(--foreground)",
                marginBottom: 22,
                marginTop: 0,
              }}
            >
              Owner Information
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {OWNER_FIELDS.map((f) => (
                <div
                  key={f.name}
                  style={f.full ? { gridColumn: "1 / -1" } : {}}
                >
                  <label style={fieldLabel}>
                    {f.label}{" "}
                    {f.required && (
                      <span style={{ color: "#ef4444" }}>*</span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <f.icon
                      style={{
                        position: "absolute",
                        left: 13,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--foreground)",
                        opacity: 0.35,
                        fontSize: 13,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type={f.type}
                      name={f.name}
                      value={ownerInfo[f.name]}
                      placeholder={f.placeholder}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (f.name === "phone")
                          val = val.replace(/\D/g, "").slice(0, 10);
                        setOwnerInfo((p) => ({ ...p, [f.name]: val }));
                      }}
                      style={fieldInput}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "#3b82f6")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--card-border)")
                      }
                    />
                  </div>
                  {f.name === "phone" && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--foreground)",
                        opacity: 0.4,
                        marginTop: 3,
                      }}
                    >
                      {ownerInfo.phone.length}/10 digits
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                style={btnPrimary}
              >
                Next: Assign Seats{" "}
                <FaArrowRight style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 300px",
                gap: 16,
                alignItems: "start",
              }}
            >
              <div style={{ ...card, padding: "24px" }}>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "var(--foreground)",
                    margin: "0 0 4px",
                  }}
                >
                  Seat Assignment
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--foreground)",
                    opacity: 0.5,
                    margin: "0 0 16px",
                  }}
                >
                  Select a theater then click seats to assign access.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={fieldLabel}>
                    Theater <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <MdTheaters
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--foreground)",
                        opacity: 0.35,
                        fontSize: 15,
                        pointerEvents: "none",
                      }}
                    />
                    <select
                      value={selectedTheaterId}
                      onChange={(e) => setSelectedTheaterId(e.target.value)}
                      style={{
                        ...fieldInput,
                        paddingLeft: 36,
                        cursor: "pointer",
                      }}
                    >
                      <option value="">— Select a theater —</option>
                      {theaters.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} · {t.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {loadingTheater && selectedTheaterId && (
                  <div
                    style={{ textAlign: "center", padding: 40, opacity: 0.4 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        border: "3px solid var(--card-border)",
                        borderTopColor: "#3b82f6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 10px",
                      }}
                    />
                    <div style={{ fontSize: 12 }}>Loading seat layout…</div>
                  </div>
                )}

                {selectedTheater && !loadingTheater && (
                  <div
                    style={{
                      background: "#0f0f16",
                      borderRadius: 12,
                      padding: "20px 16px",
                      border: "1px solid #1f1f2e",
                    }}
                  >
                    <CinemaSeatPicker
                      theater={selectedTheater}
                      selectedSeats={selectedSeats}
                      onSeatsChange={setSelectedSeats}
                    />
                  </div>
                )}

                {!selectedTheaterId && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 24px",
                      border: "1.5px dashed var(--card-border)",
                      borderRadius: 12,
                      opacity: 0.4,
                    }}
                  >
                    <MdEventSeat
                      style={{
                        fontSize: 40,
                        color: "var(--foreground)",
                        marginBottom: 10,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--foreground)",
                        fontWeight: 600,
                      }}
                    >
                      Select a theater to view seat layout
                    </div>
                  </div>
                )}
              </div>

              {/* Right panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...card, padding: "16px 18px" }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      color: "var(--foreground)",
                      opacity: 0.5,
                      marginBottom: 10,
                    }}
                  >
                    Creating owner
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Avatar name={ownerInfo.name} size={36} />
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--foreground)",
                        }}
                      >
                        {ownerInfo.name || "—"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--foreground)",
                          opacity: 0.5,
                        }}
                      >
                        {ownerInfo.email || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ ...card, padding: "16px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                        color: "var(--foreground)",
                        opacity: 0.5,
                      }}
                    >
                      Assigned seats
                    </div>
                    {selectedSeats.size > 0 && (
                      <button
                        onClick={() => setSelectedSeats(new Map())}
                        style={{
                          fontSize: 10,
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <FaTimes style={{ fontSize: 9 }} /> Clear all
                      </button>
                    )}
                  </div>

                  {selectedSeats.size === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px 0",
                        opacity: 0.3,
                      }}
                    >
                      <FaChair
                        style={{
                          fontSize: 28,
                          color: "var(--foreground)",
                          marginBottom: 8,
                        }}
                      />
                      <div
                        style={{ fontSize: 11, color: "var(--foreground)" }}
                      >
                        No seats selected yet
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ display: "flex", flexDirection: "column", gap: 10 }}
                    >
                      {Array.from(
                        seatSummary.entries()
                      ).map(([zoneId, { zoneName, zoneColor, seats }]) => (
                        <div key={zoneId}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: zoneColor,
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "var(--foreground)",
                              }}
                            >
                              {zoneName}
                            </span>
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 10,
                                fontWeight: 800,
                                background: zoneColor + "22",
                                color: zoneColor,
                                border: `1px solid ${zoneColor}44`,
                                borderRadius: 10,
                                padding: "1px 7px",
                              }}
                            >
                              {seats.length}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {seats.slice(0, 18).map((sn) => (
                              <span
                                key={sn}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: zoneColor + "18",
                                  color: zoneColor,
                                  border: `1px solid ${zoneColor}33`,
                                }}
                              >
                                {sn}
                              </span>
                            ))}
                            {seats.length > 18 && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "var(--foreground)",
                                  opacity: 0.4,
                                  alignSelf: "center",
                                }}
                              >
                                +{seats.length - 18} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div
                        style={{
                          marginTop: 4,
                          paddingTop: 10,
                          borderTop: "1px solid var(--card-border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--foreground)",
                            opacity: 0.5,
                          }}
                        >
                          Total
                        </span>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#3b82f6",
                          }}
                        >
                          {selectedSeats.size}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <button onClick={() => setStep(1)} style={btnSecondary}>
                <FaArrowLeft style={{ fontSize: 11 }} /> Back
              </button>
              <button onClick={() => setStep(3)} style={btnPrimary}>
                Review & Create{" "}
                <FaArrowRight style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={card}>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "var(--foreground)",
                marginTop: 0,
                marginBottom: 22,
              }}
            >
              Review & Confirm
            </h2>

            <div
              style={{
                background: "var(--background)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 14,
                border: "1px solid var(--card-border)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  color: "var(--foreground)",
                  opacity: 0.5,
                  marginBottom: 12,
                }}
              >
                Owner details
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {[
                  ["Full Name", ownerInfo.name],
                  ["Email", ownerInfo.email],
                  ["Phone", ownerInfo.phone],
                  ["Address", ownerInfo.address],
                ].map(([l, v]) => (
                  <div key={l} style={{ fontSize: 13 }}>
                    <span
                      style={{ color: "var(--foreground)", opacity: 0.5 }}
                    >
                      {l}:{" "}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--foreground)",
                      }}
                    >
                      {v || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "var(--background)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 14,
                border: "1px solid var(--card-border)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  color: "var(--foreground)",
                  opacity: 0.5,
                  marginBottom: 12,
                }}
              >
                Seat access
              </div>
              {selectedSeats.size === 0 ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--foreground)",
                    opacity: 0.4,
                  }}
                >
                  ⚠️ No seats assigned — owner will have no booking access.
                </div>
              ) : (
                <>
                  {selectedTheater && (
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--foreground)",
                        marginBottom: 10,
                      }}
                    >
                      <MdTheaters
                        style={{ marginRight: 5, verticalAlign: "middle" }}
                      />
                      {selectedTheater.name} · {selectedTheater.city}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {Array.from(seatSummary.entries()).map(
                      ([zoneId, { zoneName, zoneColor, seats }]) => (
                        <div
                          key={zoneId}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: zoneColor + "10",
                            border: `1px solid ${zoneColor}30`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: zoneColor,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: zoneColor,
                              }}
                            >
                              {zoneName}
                            </span>
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 12,
                                fontWeight: 800,
                                color: "var(--foreground)",
                              }}
                            >
                              {seats.length} seat{seats.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div
                            style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                          >
                            {seats.map((sn) => (
                              <span
                                key={sn}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 7px",
                                  borderRadius: 4,
                                  background: zoneColor + "20",
                                  color: zoneColor,
                                  border: `1px solid ${zoneColor}40`,
                                }}
                              >
                                {sn}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: "1px solid var(--card-border)",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--foreground)",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Total seats assigned</span>
                    <span style={{ color: "#3b82f6", fontSize: 16 }}>
                      {selectedSeats.size}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid var(--card-border)",
              }}
            >
              <button onClick={() => setStep(2)} style={btnSecondary}>
                <FaArrowLeft style={{ fontSize: 11 }} /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                style={{ ...btnPrimary, opacity: isPending ? 0.75 : 1 }}
              >
                {isPending ? (
                  <>
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        border: "2px solid rgba(255,255,255,.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Creating…
                  </>
                ) : (
                  <>
                    <FaCheckCircle style={{ fontSize: 13 }} /> Create Owner
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGN SEATS MODAL  (for existing owner)
// ─────────────────────────────────────────────────────────────────────────────
function AssignSeatsModal({ owner, owners = [], onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(new Map());

  const { data: theatersData } = useQuery({
    queryKey: ["adminTheatersForOwnerAccess"],
    queryFn: getAllTheatersAdmin,
  });
  const theaters = theatersData?.data || [];

  const { data: theaterDetailData, isLoading: loadingTheater } = useQuery({
    queryKey: ["adminTheaterDetailOwner", selectedTheaterId],
    queryFn: () => getTheaterByIdAdmin(selectedTheaterId),
    enabled: !!selectedTheaterId,
  });

  // When theater detail loads, pre-populate with owner's existing seats for this theater
  useEffect(() => {
    if (!theaterDetailData?.data) return;
    const theater = theaterDetailData.data;
    setSelectedTheater(theater);

    // Build seatNumber → {r, c, screenId, zoneId, zoneName, zoneColor, seatNumber} map
    const seatNumberMap = {};
    (theater.screens || []).forEach((screen) => {
      (screen.zones || []).forEach((zone) => {
        (zone.rows || []).forEach((row) => {
          (row.seats || []).forEach((seat) => {
            const r = (seat.rowNumber || 1) - 1;
            const c = (seat.columnNumber || 1) - 1;
            const sn = seat.seatNumber || `${String.fromCharCode(65 + r)}${c + 1}`;
            seatNumberMap[sn] = {
              r, c,
              screenId: screen._id,
              zoneId: zone.id,
              zoneName: zone.name,
              zoneColor: zone.color || "#3b82f6",
              seatId: seat.seatId,
              seatNumber: sn,
              isBooked: seat.isBooked || !seat.isAvailable,
            };
          });
        });
      });
    });

    // Pre-populate selectedSeats from owner's existing accessibleSeats for this theater
    const ownerSeats = (owner.accessibleSeats || []).filter(
      (a) => a.theaterId === selectedTheaterId
    );
    const preSelected = new Map();
    ownerSeats.forEach((access) => {
      (access.seatNumbers || []).forEach((sn) => {
        const sd = seatNumberMap[sn];
        if (sd && !sd.isBooked) {
          const key = `${sd.screenId}::${sd.r}-${sd.c}`;
          preSelected.set(key, sd);
        }
      });
    });
    setSelectedSeats(preSelected);
  }, [theaterDetailData]);

  useEffect(() => {
    setSelectedSeats(new Map());
    setSelectedTheater(null);
  }, [selectedTheaterId]);

  // Compute seatNumbers taken by OTHER owners for the selected theater
  const takenSeatNumbers = useMemo(() => {
    const taken = new Set();
    owners.forEach((o) => {
      if (o._id === owner._id) return; // skip self
      (o.accessibleSeats || []).forEach((a) => {
        if (a.theaterId === selectedTheaterId) {
          (a.seatNumbers || []).forEach((sn) => taken.add(sn));
        }
      });
    });
    return taken;
  }, [owners, owner._id, selectedTheaterId]);

  // Save mutation
  const { mutate: saveSeats, isPending: isSaving } = useMutation({
    mutationFn: () => {
      // Build grouped accessibleSeats from selectedSeats
      const grouped = new Map();
      selectedSeats.forEach((sd) => {
        const key = `${sd.screenId}::${sd.zoneId}`;
        if (!grouped.has(key))
          grouped.set(key, {
            screenId: sd.screenId,
            zoneId: sd.zoneId,
            zoneName: sd.zoneName,
            seatNumbers: [],
          });
        grouped.get(key).seatNumbers.push(
          sd.seatNumber || `${String.fromCharCode(65 + sd.r)}${sd.c + 1}`
        );
      });

      // Keep existing accessibleSeats for other theaters, replace for selected theater
      const otherTheaterSeats = (owner.accessibleSeats || []).filter(
        (a) => a.theaterId !== selectedTheaterId
      );
      const newAccessibleSeats = [
        ...otherTheaterSeats,
        ...Array.from(grouped.values()).map((g) => ({
          theaterId: selectedTheaterId,
          screenId: g.screenId,
          zoneId: g.zoneId,
          zoneName: g.zoneName,
          seatNumbers: g.seatNumbers,
          isActive: true,
        })),
      ];

      return updateUser(owner._id, { accessibleSeats: newAccessibleSeats });
    },
    onSuccess: () => {
      toast.success(`Seat access updated for ${owner.name}!`);
      queryClient.invalidateQueries({ queryKey: ["adminTheaterOwners"] });
      onSaved?.();
      onClose();
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || err.message || "Failed to save seat assignment"
      ),
  });

  const seatSummary = useMemo(() => {
    const byZone = new Map();
    selectedSeats.forEach((sd) => {
      const existing = byZone.get(sd.zoneId) || {
        zoneName: sd.zoneName,
        zoneColor: sd.zoneColor,
        seats: [],
      };
      existing.seats.push(
        sd.seatNumber || `${String.fromCharCode(65 + sd.r)}${sd.c + 1}`
      );
      byZone.set(sd.zoneId, existing);
    });
    return byZone;
  }, [selectedSeats]);

  const fieldLabel = {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--foreground)",
    opacity: 0.7,
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: ".05em",
  };
  const fieldInput = {
    width: "100%",
    padding: "10px 14px 10px 38px",
    fontSize: 13,
    border: "1px solid var(--card-border)",
    borderRadius: 10,
    background: "var(--background)",
    color: "var(--foreground)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--background)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "modalIn .25s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MdEventSeat style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--foreground)",
                }}
              >
                Assign Seats
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--foreground)",
                  opacity: 0.5,
                }}
              >
                {owner?.name} · {owner?.email}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: 18,
              padding: 6,
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Left */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>
                Theater <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <MdTheaters
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--foreground)",
                    opacity: 0.35,
                    fontSize: 15,
                    pointerEvents: "none",
                  }}
                />
                <select
                  value={selectedTheaterId}
                  onChange={(e) => setSelectedTheaterId(e.target.value)}
                  style={{ ...fieldInput, paddingLeft: 36, cursor: "pointer" }}
                >
                  <option value="">— Select a theater —</option>
                  {theaters.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} · {t.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingTheater && selectedTheaterId && (
              <div
                style={{ textAlign: "center", padding: 40, opacity: 0.4 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: "3px solid var(--card-border)",
                    borderTopColor: "#3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 10px",
                  }}
                />
                <div style={{ fontSize: 12 }}>Loading seat layout…</div>
              </div>
            )}

            {selectedTheater && !loadingTheater && (
              <div
                style={{
                  background: "#0f0f16",
                  borderRadius: 12,
                  padding: "20px 16px",
                  border: "1px solid #1f1f2e",
                }}
              >
                <CinemaSeatPicker
                  theater={selectedTheater}
                  selectedSeats={selectedSeats}
                  onSeatsChange={setSelectedSeats}
                  takenSeatNumbers={takenSeatNumbers}
                />
              </div>
            )}

            {!selectedTheaterId && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  border: "1.5px dashed var(--card-border)",
                  borderRadius: 12,
                  opacity: 0.4,
                }}
              >
                <MdEventSeat
                  style={{
                    fontSize: 40,
                    color: "var(--foreground)",
                    marginBottom: 10,
                  }}
                />
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--foreground)",
                    fontWeight: 600,
                  }}
                >
                  Select a theater to view seat layout
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 16,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  color: "var(--foreground)",
                  opacity: 0.5,
                }}
              >
                Selected seats ({selectedSeats.size})
              </div>
              {selectedSeats.size > 0 && (
                <button
                  onClick={() => setSelectedSeats(new Map())}
                  style={{
                    fontSize: 10,
                    color: "#ef4444",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <FaTimes style={{ fontSize: 9 }} /> Clear
                </button>
              )}
            </div>

            {selectedSeats.size === 0 ? (
              <div
                style={{ textAlign: "center", padding: "20px 0", opacity: 0.3 }}
              >
                <FaChair
                  style={{
                    fontSize: 28,
                    color: "var(--foreground)",
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 11, color: "var(--foreground)" }}>
                  No seats selected yet
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from(seatSummary.entries()).map(
                  ([zoneId, { zoneName, zoneColor, seats }]) => (
                    <div key={zoneId}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: zoneColor,
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--foreground)",
                          }}
                        >
                          {zoneName}
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 10,
                            fontWeight: 800,
                            background: zoneColor + "22",
                            color: zoneColor,
                            borderRadius: 10,
                            padding: "1px 7px",
                          }}
                        >
                          {seats.length}
                        </span>
                      </div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                      >
                        {seats.slice(0, 16).map((sn) => (
                          <span
                            key={sn}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: zoneColor + "18",
                              color: zoneColor,
                              border: `1px solid ${zoneColor}33`,
                            }}
                          >
                            {sn}
                          </span>
                        ))}
                        {seats.length > 16 && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--foreground)",
                              opacity: 0.4,
                              alignSelf: "center",
                            }}
                          >
                            +{seats.length - 16} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
                <div
                  style={{
                    marginTop: 4,
                    paddingTop: 10,
                    borderTop: "1px solid var(--card-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--foreground)",
                      opacity: 0.5,
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#7c3aed",
                    }}
                  >
                    {selectedSeats.size}
                  </span>
                </div>
              </div>
            )}

            {/* Taken by others info */}
            {takenSeatNumbers.size > 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(245,158,11,.08)",
                  border: "1px solid rgba(245,158,11,.25)",
                  fontSize: 11,
                  color: "#d97706",
                  fontWeight: 600,
                }}
              >
                🟡 {takenSeatNumbers.size} seat{takenSeatNumbers.size !== 1 ? "s" : ""} already assigned to other owners
              </div>
            )}

            <button
              onClick={() => saveSeats()}
              disabled={isSaving}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "11px",
                borderRadius: 10,
                border: "none",
                background: isSaving
                  ? "#6d28d9"
                  : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: isSaving ? 0.8 : 1,
                transition: "all .15s",
              }}
            >
              {isSaving ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(255,255,255,.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Saving…
                </>
              ) : (
                <><MdEventSeat /> Save Seat Assignment ({selectedSeats.size} seats)</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW DRAWER  (owner details)
// ─────────────────────────────────────────────────────────────────────────────
function PreviewDrawer({ owner, onClose, onAssignSeats }) {
  if (!owner) return null;

  const accessibleSeats = owner.accessibleSeats || [];

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 55,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 56,
          width: 420,
          background: "var(--card)",
          borderLeft: "1px solid var(--card-border)",
          boxShadow: "-16px 0 60px rgba(0,0,0,0.25)",
          overflowY: "auto",
          animation: "drawerIn .25s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--card-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "var(--card)",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)" }}>
            Owner Details
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: 16,
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
              padding: 16,
              background: "var(--background)",
              borderRadius: 14,
              border: "1px solid var(--card-border)",
            }}
          >
            <Avatar name={owner.name} size={56} />
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "var(--foreground)",
                  marginBottom: 2,
                }}
              >
                {owner.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--foreground)",
                  opacity: 0.55,
                  marginBottom: 6,
                }}
              >
                {owner.email}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background:
                    owner.status === "ACTIVE"
                      ? "rgba(34,197,94,.15)"
                      : "rgba(239,68,68,.12)",
                  color:
                    owner.status === "ACTIVE" ? "#16a34a" : "#ef4444",
                  border: `1px solid ${
                    owner.status === "ACTIVE"
                      ? "rgba(34,197,94,.3)"
                      : "rgba(239,68,68,.3)"
                  }`,
                }}
              >
                {owner.status || "ACTIVE"}
              </span>
            </div>
          </div>

          {/* Info rows */}
          {[
            { icon: FaPhoneAlt, label: "Phone", value: owner.phone || "—" },
            {
              icon: FaMapMarkerAlt,
              label: "Address",
              value: owner.address || "—",
            },
            {
              icon: FaTheaterMasks,
              label: "Role",
              value: "Theater Owner",
            },
            {
              icon: FaClipboardList,
              label: "Joined",
              value: formatDate(owner.createdAt),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 14,
                padding: "12px 16px",
                background: "var(--background)",
                borderRadius: 10,
                border: "1px solid var(--card-border)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(59,130,246,.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ fontSize: 13, color: "#3b82f6" }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--foreground)",
                    opacity: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    marginBottom: 2,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  {value}
                </div>
              </div>
            </div>
          ))}

          {/* Accessible Seats */}
          <div
            style={{
              marginTop: 8,
              padding: 16,
              background: "var(--background)",
              borderRadius: 12,
              border: "1px solid var(--card-border)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                color: "var(--foreground)",
                opacity: 0.5,
                marginBottom: 12,
              }}
            >
              Seat Access ({accessibleSeats.length} zone
              {accessibleSeats.length !== 1 ? "s" : ""})
            </div>

            {accessibleSeats.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "16px 0", opacity: 0.3 }}
              >
                <MdEventSeat
                  style={{
                    fontSize: 28,
                    color: "var(--foreground)",
                    marginBottom: 6,
                  }}
                />
                <div style={{ fontSize: 11, color: "var(--foreground)" }}>
                  No seats assigned yet
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {accessibleSeats.map((sa, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "rgba(59,130,246,.06)",
                      border: "1px solid rgba(59,130,246,.15)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#3b82f6",
                        marginBottom: 4,
                      }}
                    >
                      {sa.zoneName || "Zone"}
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                    >
                      {(sa.seatNumbers || []).slice(0, 12).map((sn) => (
                        <span
                          key={sn}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: "rgba(59,130,246,.12)",
                            color: "#3b82f6",
                          }}
                        >
                          {sn}
                        </span>
                      ))}
                      {sa.seatNumbers?.length > 12 && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--foreground)",
                            opacity: 0.4,
                          }}
                        >
                          +{sa.seatNumbers.length - 12} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <button
              onClick={() => {
                onClose();
                onAssignSeats(owner);
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <MdEventSeat /> Assign Seats
            </button>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "1.5px solid var(--card-border)",
                background: "var(--background)",
                color: "var(--foreground)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW MODAL  (seat access summary for owner)
// ─────────────────────────────────────────────────────────────────────────────
function ReviewModal({ owner, onClose }) {
  if (!owner) return null;
  const accessibleSeats = owner.accessibleSeats || [];
  const totalSeats = accessibleSeats.reduce(
    (s, a) => s + (a.seatNumbers?.length || 0),
    0
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "88vh",
          overflowY: "auto",
          background: "var(--card)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "modalIn .25s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaClipboardList style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--foreground)",
                }}
              >
                Seat Access Review
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--foreground)",
                  opacity: 0.5,
                }}
              >
                {owner.name} · {owner.email}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: 18,
              padding: 6,
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Summary row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Total Zones", value: accessibleSeats.length, color: "#3b82f6" },
            { label: "Total Seats", value: totalSeats, color: "#7c3aed" },
            {
              label: "Active Access",
              value: accessibleSeats.filter((a) => a.isActive !== false).length,
              color: "#22c55e",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                padding: "14px",
                background: "var(--background)",
                borderRadius: 12,
                border: "1px solid var(--card-border)",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4 }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--foreground)",
                  opacity: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Zone list */}
        {accessibleSeats.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 24px",
              border: "1.5px dashed var(--card-border)",
              borderRadius: 12,
              opacity: 0.4,
            }}
          >
            <MdEventSeat
              style={{
                fontSize: 40,
                color: "var(--foreground)",
                marginBottom: 10,
              }}
            />
            <div
              style={{
                fontSize: 13,
                color: "var(--foreground)",
                fontWeight: 600,
              }}
            >
              No seat access assigned to this owner
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {accessibleSeats.map((sa, i) => {
              const colors = [
                "#3b82f6",
                "#7c3aed",
                "#10b981",
                "#f59e0b",
                "#ef4444",
              ];
              const col = colors[i % colors.length];
              return (
                <div
                  key={i}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: col + "0A",
                    border: `1px solid ${col}25`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: col,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{ fontSize: 13, fontWeight: 700, color: col }}
                    >
                      {sa.zoneName || `Zone ${i + 1}`}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        fontWeight: 700,
                        background: col + "18",
                        color: col,
                        borderRadius: 10,
                        padding: "2px 10px",
                        border: `1px solid ${col}30`,
                      }}
                    >
                      {sa.seatNumbers?.length || 0} seats
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background:
                          sa.isActive !== false
                            ? "rgba(34,197,94,.12)"
                            : "rgba(239,68,68,.1)",
                        color:
                          sa.isActive !== false ? "#16a34a" : "#ef4444",
                      }}
                    >
                      {sa.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                  >
                    {(sa.seatNumbers || []).map((sn) => (
                      <span
                        key={sn}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: col + "15",
                          color: col,
                          border: `1px solid ${col}30`,
                        }}
                      >
                        {sn}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            border: "1.5px solid var(--card-border)",
            background: "var(--background)",
            color: "var(--foreground)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function TheaterOwnersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [previewOwner, setPreviewOwner] = useState(null);
  const [reviewOwner, setReviewOwner] = useState(null);
  const [assignOwner, setAssignOwner] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch all users filtered to THEATER_OWNER
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminTheaterOwners"],
    queryFn: () => getAllUsers({ role: "THEATER_OWNER" }),
  });

  const owners = useMemo(() => {
    const all = data?.data || [];
    return all.filter((u) => u.role === "THEATER_OWNER");
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return owners;
    return owners.filter((o) =>
      [o.name, o.email, o.phone, o.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [owners, search]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        padding: isMobile ? "12px" : "24px",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <Toaster position="top-right" />

      {/* ── Page Header ── */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 16,
          padding: isMobile ? "12px 16px" : "18px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 13,
              background: "linear-gradient(135deg,#1a1a2e,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(59,130,246,.3)",
            }}
          >
            <GiTheaterCurtains style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              Admin
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "var(--foreground)",
                opacity: 0.5,
                margin: 0,
              }}
            >
              Manage owners, assign seat access and review permissions
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 4px 18px rgba(59,130,246,.35)",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <FaPlus style={{ fontSize: 12 }} /> Create Admin
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Total Owners",
            value: owners.length,
            color: "#3b82f6",
            bg: "rgba(59,130,246,.08)",
          },
          {
            label: "Active",
            value: owners.filter((o) => o.status === "ACTIVE").length,
            color: "#22c55e",
            bg: "rgba(34,197,94,.08)",
          },
          {
            label: "With Seat Access",
            value: owners.filter(
              (o) => (o.accessibleSeats?.length || 0) > 0
            ).length,
            color: "#7c3aed",
            bg: "rgba(124,58,237,.08)",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 14,
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaTheaterMasks style={{ fontSize: 18, color }} />
            </div>
            <div>
              <div
                style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--foreground)",
                  opacity: 0.55,
                  marginTop: 2,
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search Bar ── */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <FaSearch
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--foreground)",
              opacity: 0.35,
              fontSize: 13,
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              fontSize: 13,
              border: "1px solid var(--card-border)",
              borderRadius: 10,
              background: "var(--background)",
              color: "var(--foreground)",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--card-border)")
            }
          />
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground)",
            opacity: 0.45,
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} owner{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              opacity: 0.5,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid var(--card-border)",
                borderTopColor: "#3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span
              style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 600 }}
            >
              Loading Admin…
            </span>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "#ef4444",
            }}
          >
            Failed to load owners. Please refresh.
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              opacity: 0.4,
            }}
          >
            <GiTheaterCurtains
              style={{
                fontSize: 48,
                color: "var(--foreground)",
                marginBottom: 14,
              }}
            />
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--foreground)",
                marginBottom: 6,
              }}
            >
              {search ? "No owners match your search" : "No Admin yet"}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--foreground)", opacity: 0.6 }}
            >
              {!search && 'Click \u201cCreate  Admin\u201d to add your first one.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--background)",
                    borderBottom: "1px solid var(--card-border)",
                  }}
                >
                  {[
                    "Owner",
                    "Contact",
                    "Status",
                    "Seat Access",
                    "Joined",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 18px",
                        textAlign: h === "Actions" ? "right" : "left",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        color: "var(--foreground)",
                        opacity: 0.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((owner, idx) => {
                  const accessCount = owner.accessibleSeats?.reduce(
                    (s, a) => s + (a.seatNumbers?.length || 0),
                    0
                  ) || 0;
                  const zoneCount = owner.accessibleSeats?.length || 0;

                  return (
                    <tr
                      key={owner._id}
                      style={{
                        borderBottom: "1px solid var(--card-border)",
                        transition: "background .15s",
                        animationDelay: `${idx * 30}ms`,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(59,130,246,.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Owner */}
                      <td style={{ padding: "16px 18px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <Avatar name={owner.name} size={40} />
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "var(--foreground)",
                                marginBottom: 2,
                              }}
                            >
                              {owner.name || "—"}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--foreground)",
                                opacity: 0.5,
                              }}
                            >
                              {owner.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: "16px 18px" }}>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--foreground)",
                            opacity: 0.7,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 3,
                            }}
                          >
                            <FaPhoneAlt
                              style={{ fontSize: 10, opacity: 0.5 }}
                            />
                            {owner.phone || "—"}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 11,
                              opacity: 0.6,
                            }}
                          >
                            <FaMapMarkerAlt
                              style={{ fontSize: 10, opacity: 0.5 }}
                            />
                            {owner.address
                              ? owner.address.slice(0, 28) +
                                (owner.address.length > 28 ? "…" : "")
                              : "—"}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 18px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: 20,
                            background:
                              owner.status === "ACTIVE"
                                ? "rgba(34,197,94,.12)"
                                : owner.status === "BLOCKED"
                                ? "rgba(239,68,68,.1)"
                                : "rgba(100,116,139,.1)",
                            color:
                              owner.status === "ACTIVE"
                                ? "#16a34a"
                                : owner.status === "BLOCKED"
                                ? "#ef4444"
                                : "#64748b",
                            border: `1px solid ${
                              owner.status === "ACTIVE"
                                ? "rgba(34,197,94,.25)"
                                : owner.status === "BLOCKED"
                                ? "rgba(239,68,68,.2)"
                                : "rgba(100,116,139,.2)"
                            }`,
                          }}
                        >
                          {owner.status || "ACTIVE"}
                        </span>
                      </td>

                      {/* Seat Access */}
                      <td style={{ padding: "16px 18px" }}>
                        {zoneCount === 0 ? (
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--foreground)",
                              opacity: 0.35,
                              fontStyle: "italic",
                            }}
                          >
                            No access assigned
                          </span>
                        ) : (
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "#7c3aed",
                              }}
                            >
                              {accessCount} seats
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--foreground)",
                                opacity: 0.5,
                              }}
                            >
                              across {zoneCount} zone
                              {zoneCount !== 1 ? "s" : ""}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Joined */}
                      <td
                        style={{
                          padding: "16px 18px",
                          fontSize: 12,
                          color: "var(--foreground)",
                          opacity: 0.55,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(owner.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 18px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 8,
                          }}
                        >
                          {/* Assign Seats */}
                          <button
                            onClick={() => setAssignOwner(owner)}
                            title="Assign Seats"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 13px",
                              borderRadius: 8,
                              border: "1.5px solid rgba(124,58,237,.3)",
                              background: "rgba(124,58,237,.07)",
                              color: "#7c3aed",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              transition: "all .15s",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(124,58,237,.15)";
                              e.currentTarget.style.transform =
                                "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(124,58,237,.07)";
                              e.currentTarget.style.transform =
                                "translateY(0)";
                            }}
                          >
                            <MdEventSeat style={{ fontSize: 13 }} />
                            Assign Seats
                          </button>

                          {/* Preview */}
                          <button
                            onClick={() => setPreviewOwner(owner)}
                            title="Preview Owner"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 13px",
                              borderRadius: 8,
                              border: "1.5px solid rgba(59,130,246,.3)",
                              background: "rgba(59,130,246,.07)",
                              color: "#3b82f6",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              transition: "all .15s",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(59,130,246,.15)";
                              e.currentTarget.style.transform =
                                "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(59,130,246,.07)";
                              e.currentTarget.style.transform =
                                "translateY(0)";
                            }}
                          >
                            <FaEye style={{ fontSize: 12 }} />
                            Preview
                          </button>

                          {/* Review */}
                          <button
                            onClick={() => setReviewOwner(owner)}
                            title="Review Seat Access"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 13px",
                              borderRadius: 8,
                              border: "1.5px solid rgba(245,158,11,.3)",
                              background: "rgba(245,158,11,.07)",
                              color: "#d97706",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              transition: "all .15s",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(245,158,11,.15)";
                              e.currentTarget.style.transform =
                                "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(245,158,11,.07)";
                              e.currentTarget.style.transform =
                                "translateY(0)";
                            }}
                          >
                            <FaClipboardList style={{ fontSize: 12 }} />
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals & Drawers ── */}
      {showCreate && (
        <CreateOwnerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["adminTheaterOwners"] });
          }}
        />
      )}

      {assignOwner && (
        <AssignSeatsModal
          owner={assignOwner}
          owners={owners}
          onClose={() => setAssignOwner(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["adminTheaterOwners"] });
          }}
        />
      )}

      {previewOwner && (
        <PreviewDrawer
          owner={previewOwner}
          onClose={() => setPreviewOwner(null)}
          onAssignSeats={(o) => setAssignOwner(o)}
        />
      )}

      {reviewOwner && (
        <ReviewModal
          owner={reviewOwner}
          onClose={() => setReviewOwner(null)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes drawerIn {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}