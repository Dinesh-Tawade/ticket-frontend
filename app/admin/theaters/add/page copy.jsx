// // "use client";

// // import React, { useState, useCallback, useEffect } from 'react';
// // import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
// // import { useRouter } from "next/navigation";
// // import { toast, Toaster } from 'react-hot-toast';
// // import {
// //   FaPlus, FaTrash, FaBuilding, FaMapMarkerAlt, FaPhone, FaCity, FaFlag,
// //   FaCouch, FaWifi, FaParking, FaCoffee, FaAccessibleIcon, FaArrowLeft,
// //   FaCheckCircle, FaUserTie, FaChevronDown, FaEye, FaEdit, FaSave, FaTimes
// // } from 'react-icons/fa';
// // import { MdScreenShare, MdTheaters, MdScreenRotation } from 'react-icons/md';
// // import { createTheater, getAllUsers } from "@/app/services/adminCommunication";

// // const AMENITIES = [
// //   { icon: FaCouch, name: "Recliner Seats", key: "hasRecliner", desc: "Premium recliner chairs" },
// //   { icon: FaWifi, name: "Free WiFi", key: "hasWifi", desc: "High-speed internet" },
// //   { icon: FaParking, name: "Parking", key: "hasParking", desc: "Covered car parking" },
// //   { icon: FaCoffee, name: "Food & Café", key: "hasCafe", desc: "In-house café & snacks" },
// //   { icon: FaAccessibleIcon, name: "Accessibility", key: "hasWheelchair", desc: "Wheelchair friendly" },
// // ];

// // const SEAT_TYPES = {
// //   NORMAL: { label: "Standard", color: "#3b82f6", multiplier: 1 },
// //   EXECUTIVE: { label: "Executive", color: "#10b981", multiplier: 1.5 },
// //   PREMIUM: { label: "Premium", color: "#8b5cf6", multiplier: 2 },
// //   VIP: { label: "VIP", color: "#f59e0b", multiplier: 3 },
// //   COUPLE: { label: "Couple", color: "#ec4899", multiplier: 2.5 },
// // };

// // const STEPS = [
// //   { id: 1, label: "Theater Info", icon: FaBuilding },
// //   { id: 2, label: "Layout Design", icon: MdScreenShare },
// //   { id: 3, label: "Review", icon: FaCheckCircle },
// // ];

// // const POSITIONS = [
// //   { value: "center", label: "Center Stage", icon: "🎯" },
// //   { value: "left", label: "Left Wing", icon: "⬅️" },
// //   { value: "right", label: "Right Wing", icon: "➡️" },
// //   { value: "top", label: "Balcony", icon: "⬆️" },
// //   { value: "bottom", label: "Front Row", icon: "⬇️" },
// // ];

// // // Generate unique ID
// // const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// // // Create a new row with seats
// // const createRow = (zoneId, rowNumber, rowLetter, seatCount = 10) => {
// //   const seats = [];
// //   for (let i = 1; i <= seatCount; i++) {
// //     seats.push({
// //       seatId: `${zoneId}_row_${rowNumber}_seat_${i}`,
// //       seatNumber: `${rowLetter}${i}`,
// //       seatLabel: `${rowLetter}${i}`,
// //       rowNumber: rowNumber,
// //       columnNumber: i,
// //       rowName: rowLetter,
// //       isAvailable: true,
// //       isBooked: false,
// //     });
// //   }
// //   return {
// //     rowId: `${zoneId}_row_${rowNumber}`,
// //     rowName: rowLetter,
// //     rowNumber: rowNumber,
// //     seatCount: seatCount,
// //     seats: seats,
// //   };
// // };

// // // Create new zone
// // const createNewZone = (zoneNumber) => {
// //   const zoneId = generateId();
// //   const rows = [];
// //   const rowLetters = ['A', 'B', 'C', 'D', 'E'];
  
// //   for (let i = 0; i < 5; i++) {
// //     rows.push(createRow(zoneId, i + 1, rowLetters[i], 10));
// //   }
  
// //   return {
// //     id: zoneId,
// //     zoneNumber: zoneNumber,
// //     name: `Zone ${zoneNumber}`,
// //     position: "center",
// //     positionLabel: "Center Stage",
// //     seatType: "NORMAL",
// //     color: "#3b82f6",
// //     icon: "■",
// //     basePrice: 150,
// //     priceMultiplier: 1,
// //     finalPrice: 150,
// //     rows: rows,
// //     totalRows: rows.length,
// //     totalSeats: rows.reduce((sum, row) => sum + row.seatCount, 0),
// //   };
// // };

// // // Row Editor Component
// // const RowEditor = ({ zoneId, row, rowIndex, onUpdate, onDelete, zoneColor }) => {
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [seatCount, setSeatCount] = useState(row.seatCount);

// //   const handleSeatCountChange = () => {
// //     if (seatCount < 1) return;
// //     const newSeats = [];
// //     for (let i = 1; i <= seatCount; i++) {
// //       newSeats.push({
// //         seatId: `${zoneId}_row_${row.rowNumber}_seat_${i}`,
// //         seatNumber: `${row.rowName}${i}`,
// //         seatLabel: `${row.rowName}${i}`,
// //         rowNumber: row.rowNumber,
// //         columnNumber: i,
// //         rowName: row.rowName,
// //         isAvailable: true,
// //         isBooked: false,
// //       });
// //     }
// //     onUpdate(rowIndex, { ...row, seatCount: seatCount, seats: newSeats });
// //     setIsEditing(false);
// //   };

// //   return (
// //     <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg group hover:bg-background transition-colors">
// //       <div className="w-8 text-sm font-bold text-foreground/60">{row.rowName}</div>
      
// //       <div className="flex-1 flex flex-wrap gap-1">
// //         {row.seats.slice(0, 12).map((seat) => (
// //           <div
// //             key={seat.seatId}
// //             className="relative group/seat"
// //           >
// //             <div
// //               className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-[8px] sm:text-[9px] font-mono font-bold transition-all cursor-pointer hover:scale-110"
// //               style={{ background: `${zoneColor}20`, color: zoneColor, border: `1px solid ${zoneColor}50` }}
// //               title={seat.seatLabel}
// //             >
// //               {seat.seatLabel}
// //             </div>
// //           </div>
// //         ))}
// //         {row.seatCount > 12 && (
// //           <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-[8px] text-foreground/40 bg-foreground/5">
// //             +{row.seatCount - 12}
// //           </div>
// //         )}
// //       </div>
      
// //       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
// //         {!isEditing ? (
// //           <>
// //             <button
// //               onClick={() => setIsEditing(true)}
// //               className="p-1.5 rounded hover:bg-blue-500/10 text-blue-500"
// //               title="Edit seat count"
// //             >
// //               <FaEdit size={10} />
// //             </button>
// //             <button
// //               onClick={() => onDelete(rowIndex)}
// //               className="p-1.5 rounded hover:bg-red-500/10 text-red-500"
// //               title="Delete row"
// //             >
// //               <FaTrash size={10} />
// //             </button>
// //           </>
// //         ) : (
// //           <div className="flex items-center gap-1 bg-background border rounded-lg p-1" style={{ borderColor: "var(--card-border)" }}>
// //             <input
// //               type="number"
// //               value={seatCount}
// //               onChange={(e) => setSeatCount(Math.max(1, parseInt(e.target.value) || 1))}
// //               className="w-12 px-1 py-1 text-center text-xs bg-background border rounded focus:outline-none focus:border-blue-500"
// //               style={{ borderColor: "var(--card-border)" }}
// //               autoFocus
// //             />
// //             <button onClick={handleSeatCountChange} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
// //               <FaSave size={10} />
// //             </button>
// //             <button onClick={() => setIsEditing(false)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
// //               <FaTimes size={10} />
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // // Zone Designer Component
// // const ZoneDesigner = ({ zone, zoneIndex, onUpdate, onDelete }) => {
// //   const [isExpanded, setIsExpanded] = useState(true);
// //   const [isEditingName, setIsEditingName] = useState(false);
// //   const [zoneName, setZoneName] = useState(zone.name);

// //   const addRow = () => {
// //     const newRowNumber = zone.rows.length + 1;
// //     const newRowLetter = String.fromCharCode(64 + newRowNumber);
// //     const newRow = createRow(zone.id, newRowNumber, newRowLetter, 10);
// //     const newRows = [...zone.rows, newRow];
// //     onUpdate(zoneIndex, {
// //       ...zone,
// //       rows: newRows,
// //       totalRows: newRows.length,
// //       totalSeats: newRows.reduce((sum, row) => sum + row.seatCount, 0),
// //     });
// //   };

// //   const updateRow = (rowIndex, updatedRow) => {
// //     const newRows = [...zone.rows];
// //     newRows[rowIndex] = updatedRow;
// //     const newTotalSeats = newRows.reduce((sum, row) => sum + row.seatCount, 0);
// //     onUpdate(zoneIndex, {
// //       ...zone,
// //       rows: newRows,
// //       totalSeats: newTotalSeats,
// //     });
// //   };

// //   const deleteRow = (rowIndex) => {
// //     if (zone.rows.length === 1) {
// //       toast.error("At least one row required per zone!");
// //       return;
// //     }
// //     const newRows = zone.rows.filter((_, i) => i !== rowIndex);
// //     onUpdate(zoneIndex, {
// //       ...zone,
// //       rows: newRows,
// //       totalRows: newRows.length,
// //       totalSeats: newRows.reduce((sum, row) => sum + row.seatCount, 0),
// //     });
// //   };

// //   const handleNameSave = () => {
// //     onUpdate(zoneIndex, { ...zone, name: zoneName });
// //     setIsEditingName(false);
// //   };

// //   const currentPrice = zone.basePrice * zone.priceMultiplier;

// //   return (
// //     <div className="border rounded-xl overflow-hidden bg-card" style={{ borderColor: "var(--card-border)" }}>
// //       {/* Zone Header */}
// //       <div 
// //         className="flex items-center justify-between p-3 cursor-pointer hover:bg-foreground/5 transition-colors flex-wrap gap-2"
// //         style={{ background: `${zone.color}10`, borderBottom: isExpanded ? `1px solid ${zone.color}30` : 'none' }}
// //         onClick={() => setIsExpanded(!isExpanded)}
// //       >
// //         <div className="flex items-center gap-2 flex-wrap">
// //           <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${zone.color}30`, color: zone.color }}>
// //             {zone.icon}
// //           </div>
// //           <div className="flex items-center gap-2">
// //             {isEditingName ? (
// //               <div className="flex items-center gap-1">
// //                 <input
// //                   type="text"
// //                   value={zoneName}
// //                   onChange={(e) => setZoneName(e.target.value)}
// //                   className="px-2 py-1 text-sm font-bold bg-background border rounded"
// //                   style={{ borderColor: "var(--card-border)" }}
// //                   autoFocus
// //                 />
// //                 <button onClick={handleNameSave} className="p-1 text-green-500"><FaSave size={12} /></button>
// //                 <button onClick={() => { setZoneName(zone.name); setIsEditingName(false); }} className="p-1 text-red-500"><FaTimes size={12} /></button>
// //               </div>
// //             ) : (
// //               <>
// //                 <div className="font-bold text-foreground">{zone.name}</div>
// //                 <button onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }} className="text-foreground/30 hover:text-blue-500">
// //                   <FaEdit size={10} />
// //                 </button>
// //               </>
// //             )}
// //           </div>
// //           <div className="text-xs text-foreground/50">
// //             {zone.totalRows} rows • {zone.totalSeats} seats • ₹{currentPrice}/seat
// //           </div>
// //         </div>
// //         <div className="flex items-center gap-2">
// //           <select
// //             value={zone.position}
// //             onChange={(e) => {
// //               const pos = POSITIONS.find(p => p.value === e.target.value);
// //               onUpdate(zoneIndex, { ...zone, position: e.target.value, positionLabel: pos?.label });
// //             }}
// //             onClick={(e) => e.stopPropagation()}
// //             className="text-xs px-2 py-1 rounded-lg bg-background border"
// //             style={{ borderColor: "var(--card-border)" }}
// //           >
// //             {POSITIONS.map(pos => (
// //               <option key={pos.value} value={pos.value}>{pos.icon} {pos.label}</option>
// //             ))}
// //           </select>
// //           <button 
// //             onClick={(e) => { e.stopPropagation(); onDelete(zoneIndex); }}
// //             className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
// //           >
// //             <FaTrash size={12} />
// //           </button>
// //           <div className={`w-5 h-5 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
// //             <FaChevronDown size={10} />
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Zone Content */}
// //       {isExpanded && (
// //         <div className="p-4 space-y-4">
// //           {/* Zone Settings */}
// //           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
// //             <div>
// //               <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Seat Type</label>
// //               <select
// //                 value={zone.seatType}
// //                 onChange={(e) => {
// //                   const type = e.target.value;
// //                   const config = SEAT_TYPES[type];
// //                   onUpdate(zoneIndex, { ...zone, seatType: type, color: config.color, priceMultiplier: config.multiplier, finalPrice: zone.basePrice * config.multiplier });
// //                 }}
// //                 className="w-full px-2 py-1.5 text-xs bg-background border rounded-lg"
// //                 style={{ borderColor: "var(--card-border)" }}
// //               >
// //                 {Object.entries(SEAT_TYPES).map(([key, config]) => (
// //                   <option key={key} value={key}>{config.label}</option>
// //                 ))}
// //               </select>
// //             </div>
// //             <div>
// //               <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Base Price (₹)</label>
// //               <input
// //                 type="number"
// //                 value={zone.basePrice}
// //                 onChange={(e) => onUpdate(zoneIndex, { ...zone, basePrice: parseInt(e.target.value) || 0, finalPrice: (parseInt(e.target.value) || 0) * zone.priceMultiplier })}
// //                 className="w-full px-2 py-1.5 text-xs bg-background border rounded-lg"
// //                 style={{ borderColor: "var(--card-border)" }}
// //               />
// //             </div>
// //             <div>
// //               <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Final Price</label>
// //               <div className="w-full px-2 py-1.5 text-xs font-bold rounded-lg" style={{ background: `${zone.color}20`, color: zone.color }}>
// //                 ₹{zone.basePrice * zone.priceMultiplier}
// //               </div>
// //             </div>
// //             <div>
// //               <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Zone Color</label>
// //               <input
// //                 type="color"
// //                 value={zone.color}
// //                 onChange={(e) => onUpdate(zoneIndex, { ...zone, color: e.target.value })}
// //                 className="w-full h-8 rounded-lg cursor-pointer"
// //               />
// //             </div>
// //           </div>
          
// //           {/* Rows Configuration */}
// //           <div>
// //             <div className="flex items-center justify-between mb-3">
// //               <div className="text-xs font-bold text-foreground/50 uppercase">Rows Configuration</div>
// //               <button onClick={addRow} className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 flex items-center gap-1">
// //                 <FaPlus size={10} /> Add Row
// //               </button>
// //             </div>
// //             <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
// //               {zone.rows.map((row, rowIdx) => (
// //                 <RowEditor
// //                   key={row.rowId}
// //                   zoneId={zone.id}
// //                   row={row}
// //                   rowIndex={rowIdx}
// //                   onUpdate={updateRow}
// //                   onDelete={deleteRow}
// //                   zoneColor={zone.color}
// //                 />
// //               ))}
// //             </div>
// //           </div>
          
// //           {/* Summary */}
// //           <div className="text-center text-[10px] text-foreground/40 pt-2 border-t" style={{ borderColor: "var(--card-border)" }}>
// //             Total: {zone.totalRows} rows • {zone.totalSeats} seats • ₹{zone.totalSeats * (zone.basePrice * zone.priceMultiplier)} total revenue potential
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // // Live Seat Preview Component
// // const LiveSeatPreview = ({ zones, screenPosition }) => {
// //   const [hoveredSeat, setHoveredSeat] = useState(null);
  
// //   const renderZoneSeats = (zone) => {
// //     if (!zone.rows || zone.rows.length === 0) {
// //       return <div className="text-center text-xs opacity-40 py-2">No seats configured</div>;
// //     }
    
// //     return zone.rows.map((row) => (
// //       <div key={row.rowId} className="flex items-center gap-1 mb-1">
// //         <div className="w-6 text-[9px] text-foreground/40 font-bold">{row.rowName}</div>
// //         <div className="flex flex-wrap gap-0.5">
// //           {row.seats && row.seats.map((seat) => (
// //             <div
// //               key={seat.seatId}
// //               className="relative group"
// //               onMouseEnter={() => setHoveredSeat(seat.seatId)}
// //               onMouseLeave={() => setHoveredSeat(null)}
// //             >
// //               <div
// //                 className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm flex items-center justify-center text-[7px] sm:text-[8px] font-mono font-bold transition-all cursor-pointer hover:scale-110"
// //                 style={{ background: `${zone.color}25`, color: zone.color, border: `1px solid ${zone.color}50` }}
// //               >
// //                 {seat.seatLabel}
// //               </div>
// //               {hoveredSeat === seat.seatId && (
// //                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 shadow-lg">
// //                   ₹{zone.basePrice * zone.priceMultiplier}
// //                 </div>
// //               )}
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     ));
// //   };
  
// //   const zonesByPosition = {
// //     top: zones.filter(z => z.position === 'top'),
// //     left: zones.filter(z => z.position === 'left'),
// //     center: zones.filter(z => z.position === 'center'),
// //     right: zones.filter(z => z.position === 'right'),
// //     bottom: zones.filter(z => z.position === 'bottom'),
// //   };
  
// //   const hasAnyZones = zones.length > 0;
  
// //   if (!hasAnyZones) {
// //     return (
// //       <div className="bg-card border rounded-2xl p-8 text-center" style={{ borderColor: "var(--card-border)" }}>
// //         <p className="text-foreground/40">No zones configured. Click "Add Zone" to create seating areas.</p>
// //       </div>
// //     );
// //   }
  
// //   return (
// //     <div className="bg-card border rounded-2xl overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
// //       {screenPosition === "top" && (
// //         <div className="text-center py-3 bg-gradient-to-b from-red-500/10 to-transparent">
// //           <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg">
// //             🎬 SCREEN
// //           </div>
// //         </div>
// //       )}
      
// //       <div className="p-3">
// //         {/* Top Zones */}
// //         {zonesByPosition.top.length > 0 && (
// //           <div className="mb-4">
// //             <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">⬆️ BALCONY</div>
// //             <div className="flex flex-wrap justify-center gap-4">
// //               {zonesByPosition.top.map(zone => (
// //                 <div key={zone.id} className="bg-background/50 rounded-lg p-2">
// //                   <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
// //                   {renderZoneSeats(zone)}
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         )}
        
// //         {/* Left + Center + Right */}
// //         <div className="flex flex-wrap justify-center gap-4">
// //           {zonesByPosition.left.length > 0 && (
// //             <div className="flex-shrink-0">
// //               <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">⬅️ LEFT</div>
// //               {zonesByPosition.left.map(zone => (
// //                 <div key={zone.id} className="bg-background/50 rounded-lg p-2 mb-2">
// //                   <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
// //                   {renderZoneSeats(zone)}
// //                 </div>
// //               ))}
// //             </div>
// //           )}
          
// //           <div className="flex-shrink-0">
// //             <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">🎯 CENTER</div>
// //             {zonesByPosition.center.map(zone => (
// //               <div key={zone.id} className="bg-background/50 rounded-lg p-2 mb-2">
// //                 <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
// //                 {renderZoneSeats(zone)}
// //               </div>
// //             ))}
// //           </div>
          
// //           {zonesByPosition.right.length > 0 && (
// //             <div className="flex-shrink-0">
// //               <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">RIGHT ➡️</div>
// //               {zonesByPosition.right.map(zone => (
// //                 <div key={zone.id} className="bg-background/50 rounded-lg p-2 mb-2">
// //                   <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
// //                   {renderZoneSeats(zone)}
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
        
// //         {/* Bottom Zones */}
// //         {zonesByPosition.bottom.length > 0 && (
// //           <div className="mt-4">
// //             <div className="text-center text-[10px] font-bold text-foreground/50 mb-2">⬇️ FRONT ROWS</div>
// //             <div className="flex flex-wrap justify-center gap-4">
// //               {zonesByPosition.bottom.map(zone => (
// //                 <div key={zone.id} className="bg-background/50 rounded-lg p-2">
// //                   <div className="text-center text-[9px] font-bold mb-1" style={{ color: zone.color }}>{zone.name}</div>
// //                   {renderZoneSeats(zone)}
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         )}
// //       </div>
      
// //       {screenPosition === "bottom" && (
// //         <div className="text-center py-3 bg-gradient-to-t from-red-500/10 to-transparent">
// //           <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg">
// //             🎬 SCREEN
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // // Step Indicator
// // const StepIndicator = ({ current }) => (
// //   <div className="flex items-center justify-center gap-0 mb-6 overflow-x-auto pb-2">
// //     {STEPS.map((s, i) => {
// //       const done = current > s.id;
// //       const active = current === s.id;
// //       return (
// //         <React.Fragment key={s.id}>
// //           <div className="flex flex-col items-center gap-1 flex-shrink-0">
// //             <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${done ? 'bg-green-500 border-2 border-green-500 shadow-lg shadow-green-500/30' : active ? 'bg-blue-500 border-2 border-blue-500 shadow-lg shadow-blue-500/30' : 'bg-background border-2'}`}
// //               style={!(done || active) ? { borderColor: "var(--card-border)" } : {}}>
// //               {done ? <FaCheckCircle className="text-xs sm:text-base text-white" /> : <s.icon className="text-xs sm:text-base" style={{ color: active ? "white" : "var(--foreground)", opacity: active ? 1 : 0.25 }} />}
// //             </div>
// //             <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--foreground)", opacity: active || done ? 1 : 0.3 }}>{s.label}</span>
// //           </div>
// //           {i < STEPS.length - 1 && (
// //             <div className={`h-0.5 w-8 sm:w-16 mb-4 transition-all duration-500 ${current > s.id ? 'bg-gradient-to-r from-green-500 to-blue-500' : ''}`}
// //               style={!(current > s.id) ? { background: "var(--card-border)" } : {}} />
// //           )}
// //         </React.Fragment>
// //       );
// //     })}
// //   </div>
// // );

// // // Main Component
// // export default function AddTheaterPage() {
// //   const router = useRouter();
// //   const queryClient = useQueryClient();
// //   const [step, setStep] = useState(1);
// //   const [screenPosition, setScreenPosition] = useState("top");
// //   const [basicInfo, setBasicInfo] = useState({
// //     ownerId: "", 
// //     name: "", 
// //     location: "", 
// //     city: "", 
// //     state: "", 
// //     pincode: "", 
// //     contactNumber: "",
// //     hasRecliner: false, 
// //     hasWifi: false, 
// //     hasParking: false, 
// //     hasCafe: false, 
// //     hasWheelchair: false,
// //   });
  
// //   const [screens, setScreens] = useState([
// //     {
// //       screenNumber: 1,
// //       name: "Main Screen",
// //       position: "center",
// //       positionLabel: "Center Stage",
// //       zones: [createNewZone(1), createNewZone(2)],
// //       status: "ACTIVE"
// //     }
// //   ]);

// //   const { data: usersData, isLoading: isLoadingUsers } = useQuery({
// //     queryKey: ["users", "THEATER_OWNER"],
// //     queryFn: () => getAllUsers({ role: "THEATER_OWNER" }),
// //   });
// //   const owners = usersData?.data || [];

// //   // Get all zones from all screens
// //   const getAllZones = () => {
// //     return screens.flatMap(screen => screen.zones);
// //   };

// //   const addScreen = () => {
// //     const newScreenNumber = screens.length + 1;
// //     setScreens([...screens, {
// //       screenNumber: newScreenNumber,
// //       name: `Screen ${newScreenNumber}`,
// //       position: "center",
// //       positionLabel: "Center Stage",
// //       zones: [createNewZone(1)],
// //       status: "ACTIVE"
// //     }]);
// //     toast.success(`Screen ${newScreenNumber} added!`);
// //   };

// //   const removeScreen = (screenIndex) => {
// //     if (screens.length === 1) {
// //       toast.error("At least one screen is required!");
// //       return;
// //     }
// //     setScreens(screens.filter((_, i) => i !== screenIndex));
// //     toast.success("Screen removed");
// //   };

// //   const addZoneToScreen = (screenIndex) => {
// //     const screen = screens[screenIndex];
// //     const newZoneNumber = screen.zones.length + 1;
// //     const newZones = [...screen.zones, createNewZone(newZoneNumber)];
// //     const updatedScreens = [...screens];
// //     updatedScreens[screenIndex].zones = newZones;
// //     setScreens(updatedScreens);
// //     toast.success(`Zone ${newZoneNumber} added to ${screen.name}!`);
// //   };

// //   const updateZoneInScreen = (screenIndex, zoneIndex, updatedZone) => {
// //     const updatedScreens = [...screens];
// //     updatedScreens[screenIndex].zones[zoneIndex] = updatedZone;
// //     setScreens(updatedScreens);
// //   };

// //   const deleteZoneFromScreen = (screenIndex, zoneIndex) => {
// //     const screen = screens[screenIndex];
// //     if (screen.zones.length === 1) {
// //       toast.error("At least one zone required per screen!");
// //       return;
// //     }
// //     const updatedScreens = [...screens];
// //     updatedScreens[screenIndex].zones = screen.zones.filter((_, i) => i !== zoneIndex);
// //     setScreens(updatedScreens);
// //     toast.success("Zone removed");
// //   };

// //   const updateScreen = (screenIndex, updatedScreen) => {
// //     const updatedScreens = [...screens];
// //     updatedScreens[screenIndex] = { ...updatedScreens[screenIndex], ...updatedScreen };
// //     setScreens(updatedScreens);
// //   };

// //   // Handle basic info change
// //   const handleBasicChange = (e) => {
// //     const { name, value, type, checked } = e.target;
    
// //     if (name === "pincode") {
// //       const onlyNums = value.replace(/[^0-9]/g, '');
// //       if (onlyNums.length <= 6) {
// //         setBasicInfo(prev => ({ ...prev, [name]: onlyNums }));
// //       }
// //       return;
// //     }
    
// //     if (name === "contactNumber") {
// //       const onlyNums = value.replace(/[^0-9]/g, '');
// //       if (onlyNums.length <= 10) {
// //         setBasicInfo(prev => ({ ...prev, [name]: onlyNums }));
// //       }
// //       return;
// //     }
    
// //     setBasicInfo(prev => ({ 
// //       ...prev, 
// //       [name]: type === "checkbox" ? checked : value 
// //     }));
// //   };

// //   // Prepare payload for API - Convert to backend expected format
// //   const preparePayload = () => {
// //     const allZones = getAllZones();
// //     const totalSeats = allZones.reduce((sum, zone) => sum + zone.totalSeats, 0);
// //     const totalZones = allZones.length;
    
// //     // Convert zones to screens format for backend
// //     const formattedScreens = screens.map((screen, idx) => ({
// //       screenNumber: screen.screenNumber,
// //       name: screen.name,
// //       position: screen.position,
// //       positionLabel: screen.positionLabel,
// //       totalRows: screen.zones.reduce((sum, z) => sum + z.totalRows, 0),
// //       totalColumns: Math.max(...screen.zones.flatMap(z => z.rows.map(r => r.seatCount)), 0),
// //       totalZones: screen.zones.length,
// //       totalSeatsInScreen: screen.zones.reduce((sum, z) => sum + z.totalSeats, 0),
// //       zones: screen.zones.map(zone => ({
// //         id: zone.id,
// //         zoneNumber: zone.zoneNumber,
// //         name: zone.name,
// //         position: zone.position,
// //         positionLabel: zone.positionLabel,
// //         seatType: zone.seatType,
// //         color: zone.color,
// //         icon: zone.icon,
// //         basePrice: zone.basePrice,
// //         priceMultiplier: zone.priceMultiplier,
// //         finalPrice: zone.finalPrice,
// //         totalRows: zone.totalRows,
// //         totalSeats: zone.totalSeats,
// //         rows: zone.rows.map(row => ({
// //           rowId: row.rowId,
// //           rowName: row.rowName,
// //           rowNumber: row.rowNumber,
// //           seatCount: row.seatCount,
// //           seats: row.seats.map(seat => ({
// //             seatId: seat.seatId,
// //             seatNumber: seat.seatNumber,
// //             seatLabel: seat.seatLabel,
// //             rowNumber: seat.rowNumber,
// //             columnNumber: seat.columnNumber,
// //             rowName: seat.rowName,
// //             isAvailable: seat.isAvailable,
// //             isBooked: seat.isBooked,
// //           })),
// //         })),
// //       })),
// //       seatRows: [], // Legacy support
// //       status: screen.status
// //     }));
    
// //     const payload = {
// //       ownerId: basicInfo.ownerId,
// //       name: basicInfo.name,
// //       location: basicInfo.location,
// //       city: basicInfo.city,
// //       state: basicInfo.state,
// //       pincode: basicInfo.pincode,
// //       contactNumber: basicInfo.contactNumber,
// //       hasRecliner: basicInfo.hasRecliner,
// //       hasWifi: basicInfo.hasWifi,
// //       hasParking: basicInfo.hasParking,
// //       hasCafe: basicInfo.hasCafe,
// //       hasWheelchair: basicInfo.hasWheelchair,
// //       screens: formattedScreens,
// //       totalScreens: screens.length,
// //       totalZones: totalZones,
// //       totalSeats: totalSeats,
// //       screenPosition: screenPosition,
// //       images: []
// //     };
    
// //     return payload;
// //   };

// //   const mutation = useMutation({
// //     mutationFn: createTheater,
// //     onSuccess: () => {
// //       toast.success("Theater created successfully! 🎉");
// //       queryClient.invalidateQueries(["allTheatersAdmin"]);
// //       setTimeout(() => router.push("/admin/theaters"), 2000);
// //     },
// //     onError: (err) => {
// //       console.error("Create theater error:", err);
// //       toast.error(err.response?.data?.message || "Failed to create theater");
// //     },
// //   });

// //   const validateStep1 = () => {
// //     if (!basicInfo.ownerId) { toast.error("Select a theater owner"); return false; }
// //     if (!basicInfo.name.trim()) { toast.error("Theater name is required"); return false; }
// //     if (!basicInfo.location.trim()) { toast.error("Location is required"); return false; }
// //     if (!basicInfo.city.trim()) { toast.error("City is required"); return false; }
// //     if (!basicInfo.state.trim()) { toast.error("State is required"); return false; }
// //     if (!basicInfo.contactNumber.trim()) { toast.error("Contact number is required"); return false; }
// //     if (basicInfo.contactNumber.length !== 10) { toast.error("Contact number must be exactly 10 digits"); return false; }
// //     if (basicInfo.pincode && basicInfo.pincode.length !== 6) { toast.error("Pincode must be exactly 6 digits"); return false; }
// //     return true;
// //   };

// //   const handleSubmit = () => {
// //     if (!validateStep1()) { setStep(1); return; }
// //     const payload = preparePayload();
// //     console.log("📦 Final Payload:", JSON.stringify(payload, null, 2));
// //     mutation.mutate(payload);
// //   };

// //   const BASIC_FIELDS = [
// //     { name: "name", label: "Theater Name", placeholder: "e.g., PVR Cinemas", icon: FaBuilding, type: "text", required: true },
// //     { name: "location", label: "Location / Area", placeholder: "e.g., Juhu", icon: FaMapMarkerAlt, type: "text", required: true },
// //     { name: "city", label: "City", placeholder: "e.g., Mumbai", icon: FaCity, type: "text", required: true },
// //     { name: "state", label: "State", placeholder: "e.g., Maharashtra", icon: FaFlag, type: "text", required: true },
// //     { name: "pincode", label: "Pincode", placeholder: "400049", icon: null, type: "text", required: false, maxLength: 6 },
// //     { name: "contactNumber", label: "Contact Number", placeholder: "9876543210", icon: FaPhone, type: "tel", required: true, maxLength: 10 },
// //   ];

// //   const totalSeats = getAllZones().reduce((sum, zone) => sum + zone.totalSeats, 0);
// //   const totalZones = getAllZones().length;

// //   // Screen Card Component
// //   const ScreenCard = ({ screen, screenIndex, onUpdate, onRemove, onAddZone, onUpdateZone, onDeleteZone }) => {
// //     const [isExpanded, setIsExpanded] = useState(true);
// //     const totalSeatsInScreen = screen.zones.reduce((sum, z) => sum + z.totalSeats, 0);
    
// //     return (
// //       <div className="border rounded-xl overflow-hidden bg-card" style={{ borderColor: "var(--card-border)" }}>
// //         <div 
// //           className="flex items-center justify-between p-3 cursor-pointer hover:bg-foreground/5 transition-colors"
// //           style={{ background: "rgba(59,130,246,0.05)", borderBottom: isExpanded ? "1px solid var(--card-border)" : "none" }}
// //           onClick={() => setIsExpanded(!isExpanded)}
// //         >
// //           <div className="flex items-center gap-3">
// //             <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
// //               <MdScreenShare className="text-purple-500" />
// //             </div>
// //             <div>
// //               <div className="font-bold text-foreground">{screen.name}</div>
// //               <div className="text-xs text-foreground/50">{screen.zones.length} zones • {totalSeatsInScreen} seats</div>
// //             </div>
// //           </div>
// //           <div className="flex items-center gap-2">
// //             <button onClick={(e) => { e.stopPropagation(); onRemove(screenIndex); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500">
// //               <FaTrash size={12} />
// //             </button>
// //             <div className={`w-5 h-5 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
// //               <FaChevronDown size={10} />
// //             </div>
// //           </div>
// //         </div>
        
// //         {isExpanded && (
// //           <div className="p-4 space-y-4">
// //             <div className="grid grid-cols-2 gap-3">
// //               <div>
// //                 <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Screen Name</label>
// //                 <input
// //                   type="text"
// //                   value={screen.name}
// //                   onChange={(e) => onUpdate(screenIndex, { name: e.target.value })}
// //                   className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
// //                   style={{ borderColor: "var(--card-border)" }}
// //                 />
// //               </div>
// //               <div>
// //                 <label className="text-[10px] font-bold text-foreground/50 uppercase block mb-1">Position</label>
// //                 <select
// //                   value={screen.position}
// //                   onChange={(e) => {
// //                     const pos = POSITIONS.find(p => p.value === e.target.value);
// //                     onUpdate(screenIndex, { position: e.target.value, positionLabel: pos?.label });
// //                   }}
// //                   className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
// //                   style={{ borderColor: "var(--card-border)" }}
// //                 >
// //                   {POSITIONS.map(pos => (
// //                     <option key={pos.value} value={pos.value}>{pos.icon} {pos.label}</option>
// //                   ))}
// //                 </select>
// //               </div>
// //             </div>
            
// //             <div>
// //               <div className="flex items-center justify-between mb-3">
// //                 <div className="text-xs font-bold text-foreground/50 uppercase">Zones</div>
// //                 <button onClick={() => onAddZone(screenIndex)} className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 flex items-center gap-1">
// //                   <FaPlus size={10} /> Add Zone
// //                 </button>
// //               </div>
// //               <div className="space-y-3">
// //                 {screen.zones.map((zone, zoneIdx) => (
// //                   <ZoneDesigner
// //                     key={zone.id}
// //                     zone={zone}
// //                     zoneIndex={zoneIdx}
// //                     onUpdate={(idx, updated) => onUpdateZone(screenIndex, idx, updated)}
// //                     onDelete={(idx) => onDeleteZone(screenIndex, idx)}
// //                   />
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="min-h-screen bg-background font-sans">
// //       <Toaster position="top-right" />
      
// //       {/* Header */}
// //       <div className="border-b sticky top-0 z-20 bg-background/95 backdrop-blur-sm" style={{ borderColor: "var(--card-border)" }}>
// //         <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
// //           <div className="flex items-center justify-between flex-wrap gap-2">
// //             <div className="flex items-center gap-2">
// //               <button onClick={() => router.back()} className="p-1.5 sm:p-2 rounded-lg hover:bg-foreground/10">
// //                 <FaArrowLeft size={14} />
// //               </button>
// //               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
// //                 <MdTheaters className="text-white text-base sm:text-xl" />
// //               </div>
// //               <div>
// //                 <h1 className="text-base sm:text-xl font-black text-foreground">Add Theater</h1>
// //                 <p className="text-[10px] sm:text-xs text-foreground/40">Step {step} of 3</p>
// //               </div>
// //             </div>
// //             <div className="text-right">
// //               <div className="text-sm font-bold text-foreground">{totalZones} Zones</div>
// //               <div className="text-[10px] text-foreground/40">{totalSeats} Seats</div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
// //         <StepIndicator current={step} />

// //         {/* Step 1: Basic Info */}
// //         {step === 1 && (
// //           <div className="bg-card border rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ borderColor: "var(--card-border)" }}>
// //             <h2 className="text-lg sm:text-xl font-bold mb-4">Theater Information</h2>
            
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
// //               <div className="md:col-span-2">
// //                 <label className="text-sm font-semibold mb-2 block">Theater Owner <span className="text-red-500">*</span></label>
// //                 <select 
// //                   name="ownerId"
// //                   value={basicInfo.ownerId} 
// //                   onChange={handleBasicChange}
// //                   className="w-full px-4 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                   style={{ borderColor: "var(--card-border)" }}
// //                 >
// //                   <option value="">— Select Theater Owner —</option>
// //                   {isLoadingUsers ? 
// //                     <option disabled>Loading owners...</option> : 
// //                     owners.map(o => <option key={o._id} value={o._id}>{o.name} ({o.email})</option>)
// //                   }
// //                 </select>
// //               </div>
              
// //               {BASIC_FIELDS.map(f => (
// //                 <div key={f.name}>
// //                   <label className="text-sm font-semibold mb-2 block">
// //                     {f.label} {f.required && <span className="text-red-500">*</span>}
// //                   </label>
// //                   <div className="relative">
// //                     {f.icon && <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm" />}
// //                     <input 
// //                       type={f.type}
// //                       name={f.name}
// //                       value={basicInfo[f.name]}
// //                       onChange={handleBasicChange}
// //                       placeholder={f.placeholder}
// //                       maxLength={f.maxLength}
// //                       className={`w-full ${f.icon ? 'pl-10' : 'px-4'} py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
// //                       style={{ borderColor: "var(--card-border)" }}
// //                     />
// //                   </div>
// //                   {f.name === "contactNumber" && (
// //                     <p className="text-[10px] text-foreground/40 mt-1">{basicInfo.contactNumber.length}/10 digits</p>
// //                   )}
// //                   {f.name === "pincode" && (
// //                     <p className="text-[10px] text-foreground/40 mt-1">{basicInfo.pincode.length}/6 digits</p>
// //                   )}
// //                 </div>
// //               ))}
// //             </div>
            
// //             <div className="mb-6">
// //               <label className="text-sm font-semibold mb-3 block">Amenities & Facilities</label>
// //               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
// //                 {AMENITIES.map(a => (
// //                   <label key={a.key} className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all hover:bg-foreground/5" style={{ borderColor: "var(--card-border)" }}>
// //                     <input 
// //                       type="checkbox" 
// //                       name={a.key}
// //                       checked={basicInfo[a.key]} 
// //                       onChange={handleBasicChange}
// //                       className="w-4 h-4 accent-blue-500"
// //                     />
// //                     <a.icon className="text-sm text-foreground/60" />
// //                     <span className="text-sm">{a.name}</span>
// //                   </label>
// //                 ))}
// //               </div>
// //             </div>
            
// //             <div className="flex justify-end">
// //               <button onClick={() => { if (validateStep1()) setStep(2); }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
// //                 Next: Design Layout →
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {/* Step 2: Layout Design */}
// //         {step === 2 && (
// //           <div className="space-y-4">
// //             <div>
// //               <div className="flex items-center justify-between mb-2">
// //                 <div className="flex items-center gap-2">
// //                   <FaEye className="text-blue-500 text-sm" />
// //                   <h2 className="font-bold text-sm sm:text-base">Live Preview</h2>
// //                 </div>
// //                 <button onClick={() => setScreenPosition(screenPosition === "top" ? "bottom" : "top")} className="text-xs px-2 py-1 rounded-lg bg-foreground/10 flex items-center gap-1">
// //                   <MdScreenRotation size={12} /> Screen {screenPosition === "top" ? "Top" : "Bottom"}
// //                 </button>
// //               </div>
// //               <LiveSeatPreview zones={getAllZones()} screenPosition={screenPosition} />
// //             </div>
            
// //             <div>
// //               <div className="flex items-center justify-between mb-3">
// //                 <div>
// //                   <h2 className="font-bold text-sm sm:text-base">Screens & Zones</h2>
// //                   <p className="text-[10px] text-foreground/40">Each screen can have multiple zones with independent seating</p>
// //                 </div>
// //                 <button onClick={addScreen} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center gap-1">
// //                   <FaPlus size={10} /> Add Screen
// //                 </button>
// //               </div>
              
// //               <div className="space-y-3">
// //                 {screens.map((screen, idx) => (
// //                   <ScreenCard
// //                     key={idx}
// //                     screen={screen}
// //                     screenIndex={idx}
// //                     onUpdate={updateScreen}
// //                     onRemove={removeScreen}
// //                     onAddZone={addZoneToScreen}
// //                     onUpdateZone={updateZoneInScreen}
// //                     onDeleteZone={deleteZoneFromScreen}
// //                   />
// //                 ))}
// //               </div>
// //             </div>
            
// //             <div className="flex justify-between gap-3">
// //               <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border-2 font-bold text-sm" style={{ borderColor: "var(--card-border)" }}>
// //                 ← Back
// //               </button>
// //               <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold text-sm">
// //                 Review →
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {/* Step 3: Review */}
// //         {step === 3 && (
// //           <div className="bg-card border rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ borderColor: "var(--card-border)" }}>
// //             <h2 className="text-lg sm:text-xl font-bold mb-4">Review & Submit</h2>
            
// //             <div className="space-y-4">
// //               <div className="p-3 bg-foreground/5 rounded-lg">
// //                 <h3 className="font-bold text-sm mb-2">Theater Details</h3>
// //                 <div className="grid grid-cols-2 gap-2 text-sm">
// //                   <div><span className="text-foreground/50">Name:</span> {basicInfo.name || "-"}</div>
// //                   <div><span className="text-foreground/50">Location:</span> {basicInfo.location || "-"}</div>
// //                   <div><span className="text-foreground/50">City:</span> {basicInfo.city || "-"}</div>
// //                   <div><span className="text-foreground/50">Contact:</span> {basicInfo.contactNumber || "-"}</div>
// //                 </div>
// //               </div>
              
// //               <div>
// //                 <h3 className="font-bold text-sm mb-2">Layout Summary</h3>
// //                 <div className="space-y-2">
// //                   {screens.map((screen, idx) => (
// //                     <div key={idx} className="p-2 border rounded-lg" style={{ borderColor: "var(--card-border)" }}>
// //                       <div className="font-bold text-sm">{screen.name}</div>
// //                       <div className="text-[10px] text-foreground/50 mb-1">{screen.zones.length} zones</div>
// //                       {screen.zones.map(zone => (
// //                         <div key={zone.id} className="flex justify-between items-center text-xs py-0.5">
// //                           <span>{zone.name} ({zone.positionLabel})</span>
// //                           <span>{zone.totalSeats} seats • ₹{zone.basePrice * zone.priceMultiplier}</span>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
              
// //               <div>
// //                 <h3 className="font-bold text-sm mb-2">Final Preview</h3>
// //                 <LiveSeatPreview zones={getAllZones()} screenPosition={screenPosition} />
// //               </div>
// //             </div>
            
// //             <div className="flex justify-between gap-3 mt-6 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
// //               <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border-2 font-bold text-sm" style={{ borderColor: "var(--card-border)" }}>
// //                 ← Back
// //               </button>
// //               <button 
// //                 onClick={handleSubmit} 
// //                 disabled={mutation.isPending}
// //                 className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold text-sm flex items-center gap-2"
// //               >
// //                 {mutation.isPending ? (
// //                   <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
// //                 ) : (
// //                   <><FaCheckCircle size={12} /> Create Theater</>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }













"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  FaPlus, FaTrash, FaBuilding, FaMapMarkerAlt, FaPhone, FaCity, FaFlag,
  FaCouch, FaWifi, FaParking, FaCoffee, FaAccessibleIcon, FaArrowLeft,
  FaCheckCircle, FaUserTie, FaChevronDown, FaEye, FaEdit, FaSave, FaTimes
} from "react-icons/fa";
import { MdScreenShare, MdTheaters, MdScreenRotation } from "react-icons/md";
import { createTheater, getAllUsers } from "@/app/services/adminCommunication";

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT BUILDER CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const ZONE_PALETTE = [
  "#c0392b","#2980b9","#27ae60","#8e44ad",
  "#d4ac0d","#1abc9c","#e67e22","#e91e63",
  "#00bcd4","#ff5722",
];

const DEFAULT_ZONES = [
  { id: "z1", name: "44 ARMD",         color: "#c0392b", noSeat: false, label: "" },
  { id: "z2", name: "26 MECH",         color: "#2980b9", noSeat: false, label: "" },
  { id: "z3", name: "19 MECH",         color: "#27ae60", noSeat: false, label: "" },
  { id: "z4", name: "677(I) & 689(I)", color: "#8e44ad", noSeat: false, label: "" },
  { id: "z5", name: "VIP / CAMP",      color: "#d4ac0d", noSeat: false, label: "" },
];

const BUILDER_TOOLS = [
  { id: "paint", icon: "🖌️", label: "Paint",  hint: "Click/drag seats to assign zone" },
  { id: "block", icon: "🚫", label: "Block",  hint: "Mark seats as unavailable" },
  { id: "aisle", icon: "↔️", label: "Aisle",  hint: "Mark seat as aisle gap" },
  { id: "erase", icon: "🧹", label: "Erase",  hint: "Clear seat assignment" },
];

function getRowLabel(index, naming) {
  return naming === "alpha" ? String.fromCharCode(65 + index) : String(index + 1);
}
function seatKey(r, c) { return `${r}-${c}`; }

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT BUILDER SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function BuilderToast({ message, visible }) {
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, background:"#1a1a2e", color:"#fff",
      padding:"10px 18px", borderRadius:8, fontSize:13, fontWeight:500, zIndex:9999,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)",
      transition:"opacity .3s,transform .3s", pointerEvents:"none",
    }}>{message}</div>
  );
}

function ZoneColorItem({ zone, isActive, seatCount, onSelect, onDelete, onToggleNoSeat, onLabelChange, onColorChange }) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelVal, setLabelVal]         = useState(zone.label || "");
  const colorRef                        = useRef(null);
  const commitLabel = () => { onLabelChange(labelVal); setEditingLabel(false); };

  return (
    <div style={{
      borderRadius:7, border: isActive ? `2px solid ${zone.color}` : "1px solid #e5e7eb",
      background: isActive ? `${zone.color}12` : "#fff", marginBottom:4, overflow:"hidden",
    }}>
      <div onClick={onSelect} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", cursor:"pointer" }}>
        <div onClick={e=>{e.stopPropagation();colorRef.current?.click();}}
          style={{ width:14, height:14, borderRadius:3, background:zone.color, flexShrink:0, border:"1px solid rgba(0,0,0,.2)", cursor:"pointer", position:"relative" }}>
          <input ref={colorRef} type="color" value={zone.color} onChange={e=>onColorChange(e.target.value)}
            onClick={e=>e.stopPropagation()}
            style={{ opacity:0, position:"absolute", inset:0, width:"100%", height:"100%", cursor:"pointer", padding:0, border:"none" }} />
        </div>
        <span style={{ flex:1, fontSize:12, fontWeight:600, color:"#1a1a2e", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{zone.name}</span>
        {zone.noSeat && <span style={{ fontSize:9, fontWeight:700, background:zone.color+"22", color:zone.color, border:`1px solid ${zone.color}55`, borderRadius:4, padding:"1px 5px", flexShrink:0 }}>NO SEAT</span>}
        <span style={{ fontSize:11, color:"#9ca3af", marginRight:4 }}>{zone.noSeat ? "–" : seatCount}</span>
        <button onClick={e=>{e.stopPropagation();onDelete();}} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:"#9ca3af", padding:"0 2px" }}>×</button>
      </div>

      <div style={{ padding:"0 10px 8px", borderTop:"1px solid #f0f0f0" }} onClick={e=>e.stopPropagation()}>
        <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", marginTop:6 }}>
          <input type="checkbox" checked={!!zone.noSeat} onChange={e=>onToggleNoSeat(e.target.checked)}
            style={{ accentColor:zone.color, width:13, height:13 }} />
          <span style={{ fontSize:11, color:"#6b7280" }}>No-seat area (label only)</span>
        </label>
        {zone.noSeat && (
          <div style={{ marginTop:6 }}>
            {editingLabel ? (
              <div style={{ display:"flex", gap:5 }}>
                <input autoFocus value={labelVal} onChange={e=>setLabelVal(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")commitLabel();if(e.key==="Escape")setEditingLabel(false);}}
                  placeholder="e.g. ★ VIP SOFA AREA ★"
                  style={{ flex:1, fontSize:11, padding:"4px 7px", border:"1px solid #d1d5db", borderRadius:5, outline:"none" }} />
                <button onClick={commitLabel} style={{ fontSize:11, padding:"4px 8px", borderRadius:5, border:"none", background:"#1a1a2e", color:"#fff", cursor:"pointer" }}>✓</button>
              </div>
            ) : (
              <div onClick={()=>{setLabelVal(zone.label||"");setEditingLabel(true);}}
                style={{ fontSize:11, padding:"4px 8px", borderRadius:5, cursor:"pointer", border:"1px dashed #d1d5db", color:zone.label?"#374151":"#9ca3af", background:"#f9fafb", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>{zone.label||"Click to set label text…"}</span>
                <span style={{ fontSize:10, color:"#9ca3af" }}>✏️</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NoSeatBlock({ zone, colSpan, colWidth=22, gap=2 }) {
  const width = colSpan*colWidth + (colSpan-1)*gap;
  return (
    <div style={{ width, height:22, borderRadius:5, flexShrink:0, background:zone.color+"22", border:`1.5px solid ${zone.color}`,
      display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      {zone.label && <span style={{ fontSize:9, fontWeight:700, color:zone.color, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", padding:"0 4px" }}>{zone.label}</span>}
    </div>
  );
}

function SeatDot({ r, c, seatData, zones, onMouseDown, onMouseEnter }) {
  const zone = seatData?.zone ? zones.find(z=>z.id===seatData.zone) : null;
  let bg="#e74c3c", border="#c0392b", opacity=1, cursor="pointer";
  if (seatData?.blocked) { bg="#d1d5db"; border="#9ca3af"; opacity=0.7; }
  else if (seatData?.aisle) { bg="transparent"; border="transparent"; opacity=0; cursor="default"; }
  else if (zone) { bg=zone.color; border=zone.color; }
  return (
    <div onMouseDown={()=>onMouseDown(r,c)} onMouseEnter={()=>onMouseEnter(r,c)}
      style={{ width:22, height:22, borderRadius:5, background:bg, border:`1.5px solid ${border}`, cursor, opacity, flexShrink:0, transition:"transform .1s", userSelect:"none" }}
      onMouseOver={e=>{if(cursor!=="default")e.currentTarget.style.transform="scale(1.18)";}}
      onMouseOut={e=>{e.currentTarget.style.transform="scale(1)";}}
      title={`${getRowLabel(r,"alpha")}${c+1}`} />
  );
}

function AisleTag({ label, onRemove, style={} }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:5, fontSize:11, fontWeight:600,
      background:"#f0f4ff", color:"#1e40af", border:"1px solid #bfdbfe", margin:2, ...style }}>
      {label}
      <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", fontSize:13, lineHeight:1, padding:"0 1px" }}>×</button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT BUILDER (embedded)
// ─────────────────────────────────────────────────────────────────────────────

function TheaterLayoutBuilder({ onLayoutChange }) {
  const [rowNaming,   setRowNaming]   = useState("alpha");
  const [zones,       setZones]       = useState(DEFAULT_ZONES);
  const [tool,        setTool]        = useState("paint");
  const [activeZone,  setActiveZone]  = useState("z1");
  const [currentLevel, setCurrentLevel] = useState("ground");

  const [levels, setLevels] = useState({
    ground:  { rows:13, cols:14, generated:false, seats:{} },
    balcony: { rows:6,  cols:14, generated:false, seats:{} },
  });

  const [groundRows, setGroundRows] = useState(13);
  const [groundCols, setGroundCols] = useState(14);
  const [balconyRows, setBalconyRows] = useState(6);
  const [balconyCols, setBalconyCols] = useState(14);

  const [aisleCols, setAisleCols]         = useState([]);
  const [aisleRows, setAisleRows]         = useState([]);
  const [newAisleCol, setNewAisleCol]     = useState("");
  const [newAisleColGap, setNewAisleColGap] = useState(14);
  const [newAisleRow, setNewAisleRow]     = useState("");
  const [newAisleRowGap, setNewAisleRowGap] = useState(24);

  const [bToast,      setBToast]      = useState({ msg:"", visible:false });
  const [newZoneName, setNewZoneName] = useState("");
  const [showAddZone, setShowAddZone] = useState(false);
  const paintingRef = useRef(false);

  const showBToast = useCallback(msg => {
    setBToast({ msg, visible:true });
    setTimeout(() => setBToast(t=>({...t,visible:false})), 2200);
  }, []);

  const currentRows = currentLevel==="ground" ? groundRows : balconyRows;
  const currentCols = currentLevel==="ground" ? groundCols : balconyCols;
  const setCurrentRows = currentLevel==="ground" ? setGroundRows : setBalconyRows;
  const setCurrentCols = currentLevel==="ground" ? setGroundCols : setBalconyCols;

  const getLevelData = (lv=currentLevel) => levels[lv];
  const updateLevel  = (lv, patch) => setLevels(prev=>({...prev,[lv]:{...prev[lv],...patch}}));
  const updateSeats  = (lv, fn)    => setLevels(prev=>({...prev,[lv]:{...prev[lv],seats:fn(prev[lv].seats)}}));

  // Bubble layout changes up to parent
  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange({ zones, levels, aisleCols, aisleRows, rowNaming });
    }
  }, [zones, levels, aisleCols, aisleRows, rowNaming]);

  const generateGrid = () => {
    updateLevel(currentLevel, { rows:currentRows, cols:currentCols, generated:true, seats:{} });
    showBToast(`Layout: ${currentRows}×${currentCols} (${currentLevel})`);
  };

  const addAisleCol = () => {
    const val = parseInt(newAisleCol);
    if (!val || val<1 || val>=currentCols) { showBToast("Enter valid col"); return; }
    setAisleCols(prev=>[...prev.filter(a=>a.idx!==val-1),{idx:val-1,gap:newAisleColGap||14}].sort((a,b)=>a.idx-b.idx));
    setNewAisleCol("");
  };
  const addAisleRow = () => {
    const val = parseInt(newAisleRow);
    if (!val || val<1 || val>=currentRows) { showBToast("Enter valid row"); return; }
    setAisleRows(prev=>[...prev.filter(a=>a.idx!==val-1),{idx:val-1,gap:newAisleRowGap||24}].sort((a,b)=>a.idx-b.idx));
    setNewAisleRow("");
  };

  const applyTool = useCallback((r, c) => {
    const k = seatKey(r, c);
    updateSeats(currentLevel, prev=>{
      const next = {...prev};
      if (tool==="paint" && activeZone) next[k] = { zone:activeZone };
      else if (tool==="block") next[k] = { blocked:true };
      else if (tool==="aisle") next[k] = { aisle:true };
      else if (tool==="erase") delete next[k];
      return next;
    });
  }, [tool, activeZone, currentLevel]);

  const handleMouseDown  = useCallback((r,c)=>{paintingRef.current=true; applyTool(r,c);},[applyTool]);
  const handleMouseEnter = useCallback((r,c)=>{if(paintingRef.current)applyTool(r,c);},[applyTool]);

  useEffect(()=>{
    const stop=()=>{paintingRef.current=false;};
    window.addEventListener("mouseup",stop);
    return ()=>window.removeEventListener("mouseup",stop);
  },[]);

  const addZone = () => {
    if (!newZoneName.trim()) return;
    const id = "z"+Date.now();
    const color = ZONE_PALETTE[zones.length % ZONE_PALETTE.length];
    setZones(prev=>[...prev,{id,name:newZoneName.trim(),color,noSeat:false,label:""}]);
    setActiveZone(id); setNewZoneName(""); setShowAddZone(false);
    showBToast(`Zone "${newZoneName.trim()}" added`);
  };
  const deleteZone = id => {
    if (zones.length<=1) { showBToast("Need at least one zone"); return; }
    setZones(prev=>prev.filter(z=>z.id!==id));
    ["ground","balcony"].forEach(lv=>updateSeats(lv,prev=>{
      const next={...prev};
      Object.keys(next).forEach(k=>{if(next[k].zone===id)delete next[k];});
      return next;
    }));
    if (activeZone===id) setActiveZone(zones.find(z=>z.id!==id)?.id);
    showBToast("Zone deleted");
  };
  const updateZone = (id, patch) => setZones(prev=>prev.map(z=>z.id===id?{...z,...patch}:z));
  const clearAll   = () => { updateLevel(currentLevel,{...getLevelData(),seats:{}}); showBToast("Cleared"); };

  const buildRowSegments = (r, levelData) => {
    const { cols, seats } = levelData;
    const segs=[]; let c=0;
    while(c<cols){
      const sd=seats[seatKey(r,c)];
      const zone=sd?.zone?zones.find(z=>z.id===sd.zone):null;
      if(zone?.noSeat){
        let span=1;
        while(c+span<cols&&seats[seatKey(r,c+span)]?.zone===zone.id)span++;
        segs.push({type:"noSeatBlock",zoneId:zone.id,startC:c,colSpan:span}); c+=span;
      } else { segs.push({type:"seat",c}); c++; }
    }
    return segs;
  };

  const levelData = getLevelData();
  const { rows:lRows, cols:lCols, seats:lSeats, generated:lGenerated } = levelData;
  const total    = lGenerated ? lRows*lCols : 0;
  const blocked  = Object.values(lSeats).filter(s=>s.blocked).length;
  const aislesC  = Object.values(lSeats).filter(s=>s.aisle).length;
  const assigned = Object.values(lSeats).filter(s=>s.zone).length;
  const available= total - blocked - aislesC;

  const tabStyle = active => ({
    padding:"5px 14px", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer",
    border: active?"2px solid #1a1a2e":"1px solid #e5e7eb",
    background: active?"#1a1a2e":"#fff", color: active?"#fff":"#6b7280", transition:"all .15s",
  });

  const toolBtnStyle = active => ({
    padding:"5px 10px", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer",
    border: active?"2px solid #1a1a2e":"1px solid #e5e7eb",
    background: active?"#1a1a2e":"#fff", color: active?"#fff":"#6b7280",
    display:"flex", alignItems:"center", gap:4, transition:"all .15s",
  });

  const inp = { padding:"6px 10px", fontSize:12, border:"1px solid #e5e7eb", borderRadius:6, background:"#fafafa", color:"#1a1a2e", outline:"none", boxSizing:"border-box" };
  const inpSm = { ...inp, width:50, padding:"5px 7px" };

  return (
    <div style={{ display:"flex", height:620, fontFamily:"'Segoe UI',system-ui,sans-serif", border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", background:"#f9fafb" }}>
      
      {/* ── Builder Sidebar ── */}
      <aside style={{ width:260, background:"#fff", borderRight:"1px solid #f0f0f0", display:"flex", flexDirection:"column", overflowY:"auto", flexShrink:0 }}>
        
        {/* Level switcher */}
        <div style={{ padding:"12px 14px", borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Floor Level</div>
          <div style={{ display:"flex", gap:6 }}>
            <button style={tabStyle(currentLevel==="ground")}  onClick={()=>setCurrentLevel("ground")}>🏛 Ground</button>
            <button style={tabStyle(currentLevel==="balcony")} onClick={()=>setCurrentLevel("balcony")}>🏗 Balcony</button>
          </div>
        </div>

        {/* Grid setup */}
        <div style={{ padding:"12px 14px", borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Grid Setup</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:12, color:"#374151", flex:1 }}>Rows</span>
            <input style={inpSm} type="number" min={1} max={30} value={currentRows} onChange={e=>setCurrentRows(+e.target.value)} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:12, color:"#374151", flex:1 }}>Cols</span>
            <input style={inpSm} type="number" min={1} max={60} value={currentCols} onChange={e=>setCurrentCols(+e.target.value)} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:12, color:"#374151", flex:1 }}>Row labels</span>
            <select style={{ ...inp, padding:"5px 7px", fontSize:12 }} value={rowNaming} onChange={e=>setRowNaming(e.target.value)}>
              <option value="alpha">A, B, C…</option>
              <option value="num">1, 2, 3…</option>
            </select>
          </div>
          <button onClick={generateGrid} style={{ width:"100%", padding:"8px", fontSize:12, borderRadius:7, border:"none", background:"#1a1a2e", color:"#fff", cursor:"pointer", fontWeight:600 }}>
            ⚡ Generate {currentLevel==="ground"?"Ground":"Balcony"} Layout
          </button>
        </div>

        {/* Zones */}
        <div style={{ padding:"12px 14px", borderBottom:"1px solid #f0f0f0", flex:1 }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>Zones</div>
          {zones.map(z=>(
            <ZoneColorItem key={z.id} zone={z} isActive={activeZone===z.id}
              seatCount={Object.values(lSeats).filter(s=>s.zone===z.id).length}
              onSelect={()=>{setActiveZone(z.id);setTool("paint");}}
              onDelete={()=>deleteZone(z.id)}
              onToggleNoSeat={val=>updateZone(z.id,{noSeat:val})}
              onLabelChange={val=>updateZone(z.id,{label:val})}
              onColorChange={val=>updateZone(z.id,{color:val})} />
          ))}
          {showAddZone ? (
            <div style={{ display:"flex", gap:5, marginTop:6 }}>
              <input style={{ ...inp, flex:1 }} placeholder="Zone name" value={newZoneName}
                onChange={e=>setNewZoneName(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addZone();if(e.key==="Escape")setShowAddZone(false);}}
                autoFocus />
              <button onClick={addZone} style={{ padding:"5px 10px", fontSize:12, borderRadius:6, border:"none", background:"#1a1a2e", color:"#fff", cursor:"pointer" }}>+</button>
              <button onClick={()=>setShowAddZone(false)} style={{ padding:"5px 10px", fontSize:12, borderRadius:6, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" }}>×</button>
            </div>
          ) : (
            <button onClick={()=>setShowAddZone(true)} style={{ padding:"5px 10px", fontSize:11, borderRadius:6, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", marginTop:6, display:"flex", alignItems:"center", gap:4 }}>
              + Add Zone
            </button>
          )}
        </div>

        {/* Aisles */}
        <div style={{ padding:"12px 14px", borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>Column Aisles</div>
          <div style={{ display:"flex", flexWrap:"wrap" }}>
            {aisleCols.map(a=><AisleTag key={a.idx} label={`C${a.idx+1}·${a.gap}px`} onRemove={()=>setAisleCols(p=>p.filter(x=>x.idx!==a.idx))} />)}
          </div>
          <div style={{ display:"flex", gap:5, alignItems:"center", marginTop:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, color:"#9ca3af" }}>After col</span>
            <input style={inpSm} type="number" placeholder="#" value={newAisleCol} onChange={e=>setNewAisleCol(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAisleCol()} />
            <span style={{ fontSize:10, color:"#9ca3af" }}>gap</span>
            <input style={inpSm} type="number" value={newAisleColGap} onChange={e=>setNewAisleColGap(+e.target.value)} />
            <button onClick={addAisleCol} style={{ padding:"4px 8px", fontSize:11, borderRadius:5, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" }}>+ Add</button>
          </div>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:6, marginTop:10 }}>Row Aisles</div>
          <div style={{ display:"flex", flexWrap:"wrap" }}>
            {aisleRows.map(a=><AisleTag key={a.idx} label={`R${a.idx+1}·${a.gap}px`} onRemove={()=>setAisleRows(p=>p.filter(x=>x.idx!==a.idx))} style={{ background:"#fff0f0", color:"#b91c1c", borderColor:"#fca5a5" }} />)}
          </div>
          <div style={{ display:"flex", gap:5, alignItems:"center", marginTop:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, color:"#9ca3af" }}>After row</span>
            <input style={inpSm} type="number" placeholder="#" value={newAisleRow} onChange={e=>setNewAisleRow(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAisleRow()} />
            <span style={{ fontSize:10, color:"#9ca3af" }}>gap</span>
            <input style={inpSm} type="number" value={newAisleRowGap} onChange={e=>setNewAisleRowGap(+e.target.value)} />
            <button onClick={addAisleRow} style={{ padding:"4px 8px", fontSize:11, borderRadius:5, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" }}>+ Add</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding:"12px 14px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>
            Stats — {currentLevel==="ground"?"Ground":"Balcony"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5, marginBottom:5 }}>
            {[{v:available,l:"Available",c:"#059669"},{v:assigned,l:"Assigned",c:"#2980b9"},{v:blocked,l:"Blocked",c:"#9ca3af"}].map(s=>(
              <div key={s.l} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:7, padding:"6px 4px", textAlign:"center" }}>
                <div style={{ fontSize:17, fontWeight:700, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:9, color:"#9ca3af" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:7, padding:"6px 8px", textAlign:"center" }}>
            <div style={{ fontSize:17, fontWeight:700, color:"#1a1a2e" }}>{total}</div>
            <div style={{ fontSize:9, color:"#9ca3af" }}>Total Seats</div>
          </div>
          <button onClick={clearAll} style={{ width:"100%", marginTop:8, padding:"7px", fontSize:12, borderRadius:7, border:"1px solid #fca5a5", background:"#fef2f2", color:"#b91c1c", cursor:"pointer", fontWeight:500 }}>
            🗑 Clear All
          </button>
        </div>
      </aside>

      {/* ── Builder Canvas ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Canvas Topbar */}
        <div style={{ background:"#1a1a2e", padding:"8px 16px", display:"flex", alignItems:"center", gap:8, flexShrink:0, flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:4, marginRight:6 }}>
            <button onClick={()=>setCurrentLevel("ground")}  style={tabStyle(currentLevel==="ground")}>🏛 Ground</button>
            <button onClick={()=>setCurrentLevel("balcony")} style={tabStyle(currentLevel==="balcony")}>🏗 Balcony</button>
          </div>
          {BUILDER_TOOLS.map(t=>(
            <button key={t.id} onClick={()=>setTool(t.id)} title={t.hint} style={toolBtnStyle(tool===t.id)}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
          {tool==="paint" && activeZone && (
            <span style={{ background:zones.find(z=>z.id===activeZone)?.color, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:12, marginLeft:4 }}>
              {zones.find(z=>z.id===activeZone)?.name}
            </span>
          )}
          <span style={{ marginLeft:"auto", fontSize:10, background: currentLevel==="ground"?"#e0e7ff":"#e0f2fe", color: currentLevel==="ground"?"#3730a3":"#0c4a6e", padding:"2px 10px", borderRadius:10, fontWeight:700 }}>
            {currentLevel==="ground"?"GROUND":"BALCONY"}
          </span>
        </div>

        {/* Grid */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"auto", padding:20, display:"flex", flexDirection:"column", alignItems:"flex-start", gap:2 }}>
          {!lGenerated ? (
            <div style={{ width:"100%", textAlign:"center", paddingTop:80, color:"#9ca3af" }}>
              <div style={{ fontSize:44, marginBottom:12 }}>{currentLevel==="balcony"?"🏗":"🎭"}</div>
              <div style={{ fontSize:15, fontWeight:600, color:"#374151" }}>No {currentLevel} layout yet</div>
              <div style={{ fontSize:13, marginTop:6 }}>Configure rows/cols above and click Generate</div>
            </div>
          ) : (
            <>
              {currentLevel==="ground" && (
                <div style={{ background:"#fef3c7", border:"1px solid #d97706", borderRadius:7, padding:"6px 20px", fontSize:11, fontWeight:700, color:"#92400e", textAlign:"center", marginBottom:6, alignSelf:"stretch" }}>
                  ★ VIP SOFA SEATING AREA ★
                </div>
              )}
              {currentLevel==="balcony" && (
                <div style={{ background:"#e0f2fe", border:"1px solid #0284c7", borderRadius:7, padding:"6px 20px", fontSize:11, fontWeight:700, color:"#0c4a6e", textAlign:"center", marginBottom:6, alignSelf:"stretch" }}>
                  🏗 BALCONY LEVEL
                </div>
              )}

              {/* Column headers */}
              <div style={{ display:"flex", alignItems:"center", gap:2, marginBottom:2 }}>
                <div style={{ width:24 }} />
                {Array.from({length:lCols},(_,c)=>(
                  <span key={c} style={{ display:"contents" }}>
                    {aisleCols.find(a=>a.idx===c-1) && <div style={{ width:aisleCols.find(a=>a.idx===c-1).gap, flexShrink:0 }} />}
                    <div style={{ width:22, textAlign:"center", fontSize:9, color:"#9ca3af", fontWeight:600, flexShrink:0 }}>{c+1}</div>
                  </span>
                ))}
              </div>

              {/* Rows */}
              {Array.from({length:lRows},(_,r)=>{
                const segs = buildRowSegments(r, levelData);
                return (
                  <span key={r} style={{ display:"contents" }}>
                    {aisleRows.find(a=>a.idx===r-1) && <div style={{ height:aisleRows.find(a=>a.idx===r-1).gap, flexShrink:0, alignSelf:"stretch" }} />}
                    <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                      <div style={{ width:20, textAlign:"center", fontSize:11, fontWeight:700, color:"#6b7280", flexShrink:0 }}>
                        {getRowLabel(r, rowNaming)}
                      </div>
                      {segs.map((seg,si)=>{
                        if(seg.type==="noSeatBlock"){
                          const zone=zones.find(z=>z.id===seg.zoneId);
                          const gapB=aisleCols.find(a=>a.idx===seg.startC-1);
                          return (
                            <span key={si} style={{ display:"contents" }}>
                              {gapB && <div style={{ width:gapB.gap, flexShrink:0 }} />}
                              <NoSeatBlock zone={zone} colSpan={seg.colSpan} />
                            </span>
                          );
                        }
                        const c=seg.c;
                        const gapB=aisleCols.find(a=>a.idx===c-1);
                        return (
                          <span key={si} style={{ display:"contents" }}>
                            {gapB && <div style={{ width:gapB.gap, flexShrink:0 }} />}
                            <SeatDot r={r} c={c} seatData={lSeats[seatKey(r,c)]} zones={zones}
                              onMouseDown={handleMouseDown} onMouseEnter={handleMouseEnter} />
                          </span>
                        );
                      })}
                    </div>
                  </span>
                );
              })}

              {currentLevel==="ground" && (
                <div style={{ background:"#1a1a2e", borderRadius:7, padding:"6px 24px", fontSize:11, color:"#fff", letterSpacing:".1em", textAlign:"center", marginTop:12, fontWeight:600, alignSelf:"stretch" }}>
                  ▲ PROJECTOR | TOTAL SEATS: {total}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BuilderToast message={bToast.msg} visible={bToast.visible} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD THEATER WIZARD CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const AMENITIES = [
  { icon: FaCouch,          name: "Recliner Seats", key: "hasRecliner", desc: "Premium recliner chairs" },
  { icon: FaWifi,           name: "Free WiFi",      key: "hasWifi",     desc: "High-speed internet" },
  { icon: FaParking,        name: "Parking",        key: "hasParking",  desc: "Covered car parking" },
  { icon: FaCoffee,         name: "Food & Café",    key: "hasCafe",     desc: "In-house café & snacks" },
  { icon: FaAccessibleIcon, name: "Accessibility",  key: "hasWheelchair", desc: "Wheelchair friendly" },
];

const STEPS = [
  { id:1, label:"Theater Info",    icon: FaBuilding },
  { id:2, label:"Seat Layout",     icon: MdScreenShare },
  { id:3, label:"Review & Submit", icon: FaCheckCircle },
];

const BASIC_FIELDS = [
  { name:"name",          label:"Theater Name",  placeholder:"e.g., PVR Cinemas",  icon:FaBuilding,     type:"text", required:true  },
  { name:"location",      label:"Location / Area",placeholder:"e.g., Juhu",        icon:FaMapMarkerAlt, type:"text", required:true  },
  { name:"city",          label:"City",          placeholder:"e.g., Mumbai",        icon:FaCity,         type:"text", required:true  },
  { name:"state",         label:"State",         placeholder:"e.g., Maharashtra",   icon:FaFlag,         type:"text", required:true  },
  { name:"pincode",       label:"Pincode",       placeholder:"400049",              icon:null,           type:"text", required:false },
  { name:"contactNumber", label:"Contact Number",placeholder:"9876543210",          icon:FaPhone,        type:"tel",  required:true  },
];

// Step indicator
function StepIndicator({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:24, overflowX:"auto", paddingBottom:8 }}>
      {STEPS.map((s,i) => {
        const done   = current > s.id;
        const active = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
              <div style={{
                width:40, height:40, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
                background: done?"#22c55e":active?"#3b82f6":"#fff",
                border: done?"2px solid #22c55e":active?"2px solid #3b82f6":"2px solid #e5e7eb",
                boxShadow: done||active ? "0 4px 12px rgba(0,0,0,.12)" : "none",
                transition:"all .3s",
              }}>
                {done ? <FaCheckCircle style={{ color:"#fff", fontSize:14 }} /> :
                  <s.icon style={{ color: active?"#fff":"#9ca3af", fontSize:14 }} />}
              </div>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", whiteSpace:"nowrap",
                color: active||done?"#1a1a2e":"#9ca3af" }}>{s.label}</span>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ height:2, width:48, marginBottom:20, transition:"all .5s",
                background: current>s.id ? "linear-gradient(90deg,#22c55e,#3b82f6)" : "#e5e7eb",
                backgroundImage: current>s.id ? "linear-gradient(90deg,#22c55e,#3b82f6)" : "none",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADD THEATER PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AddTheaterPage() {
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const [step, setStep] = useState(1);

  const [basicInfo, setBasicInfo] = useState({
    ownerId:"", name:"", location:"", city:"", state:"", pincode:"", contactNumber:"",
    hasRecliner:false, hasWifi:false, hasParking:false, hasCafe:false, hasWheelchair:false,
  });

  // Layout data from the builder
  const [layoutData, setLayoutData] = useState(null);

  const { data:usersData, isLoading:isLoadingUsers } = useQuery({
    queryKey:["users","THEATER_OWNER"],
    queryFn: ()=>getAllUsers({ role:"THEATER_OWNER" }),
  });
  const owners = usersData?.data || [];

  const mutation = useMutation({
    mutationFn: createTheater,
    onSuccess: () => {
      toast.success("Theater created successfully! 🎉");
      queryClient.invalidateQueries(["allTheatersAdmin"]);
      setTimeout(()=>router.push("/admin/theaters"), 2000);
    },
    onError: err => {
      toast.error(err.response?.data?.message || "Failed to create theater");
    },
  });

  const handleBasicChange = e => {
    const { name, value, type, checked } = e.target;
    if (name==="pincode") {
      const v=value.replace(/[^0-9]/g,"");
      if (v.length<=6) setBasicInfo(p=>({...p,[name]:v})); return;
    }
    if (name==="contactNumber") {
      const v=value.replace(/[^0-9]/g,"");
      if (v.length<=10) setBasicInfo(p=>({...p,[name]:v})); return;
    }
    setBasicInfo(p=>({...p,[name]:type==="checkbox"?checked:value}));
  };

  const validateStep1 = () => {
    if (!basicInfo.ownerId)                        { toast.error("Select a theater owner"); return false; }
    if (!basicInfo.name.trim())                    { toast.error("Theater name is required"); return false; }
    if (!basicInfo.location.trim())                { toast.error("Location is required"); return false; }
    if (!basicInfo.city.trim())                    { toast.error("City is required"); return false; }
    if (!basicInfo.state.trim())                   { toast.error("State is required"); return false; }
    if (!basicInfo.contactNumber.trim())           { toast.error("Contact number is required"); return false; }
    if (basicInfo.contactNumber.length!==10)       { toast.error("Contact number must be 10 digits"); return false; }
    if (basicInfo.pincode && basicInfo.pincode.length!==6) { toast.error("Pincode must be 6 digits"); return false; }
    return true;
  };

  const preparePayload = () => {
    const ld = layoutData;
    const groundSeats = ld?.levels?.ground?.seats || {};
    const balconySeats= ld?.levels?.balcony?.seats || {};
    const zones       = ld?.zones || [];

    // Build a simple screen structure from the builder output
    const buildZonesFromLevel = (levelKey, levelData) => {
      if (!levelData?.generated) return [];
      const { rows, cols, seats } = levelData;
      return zones.filter(z=>!z.noSeat).map((z,idx)=>{
        const zoneSeats = Object.entries(seats).filter(([,v])=>v.zone===z.id);
        const rowsData  = Array.from({length:rows},(_,r)=>{
          const rowSeats = Array.from({length:cols},(_,c)=>{
            const k=seatKey(r,c);
            if(seats[k]?.zone!==z.id) return null;
            return {
              seatId:`${z.id}_${levelKey}_r${r}c${c}`,
              seatNumber:`${getRowLabel(r,ld.rowNaming||"alpha")}${c+1}`,
              seatLabel:`${getRowLabel(r,ld.rowNaming||"alpha")}${c+1}`,
              rowNumber:r+1, columnNumber:c+1,
              rowName:getRowLabel(r,ld.rowNaming||"alpha"),
              isAvailable:true, isBooked:false,
            };
          }).filter(Boolean);
          return rowSeats.length ? { rowId:`${z.id}_${levelKey}_row${r}`, rowName:getRowLabel(r,ld.rowNaming||"alpha"), rowNumber:r+1, seatCount:rowSeats.length, seats:rowSeats } : null;
        }).filter(Boolean);
        return {
          id:`${z.id}_${levelKey}`, zoneNumber:idx+1, name:z.name,
          position:levelKey==="balcony"?"top":"center", positionLabel:levelKey==="balcony"?"Balcony":"Center",
          seatType:"NORMAL", color:z.color, icon:"■",
          basePrice:150, priceMultiplier:1, finalPrice:150,
          totalRows:rowsData.length, totalSeats:zoneSeats.length,
          rows:rowsData,
        };
      });
    };

    const groundZones  = buildZonesFromLevel("ground", ld?.levels?.ground);
    const balconyZones = buildZonesFromLevel("balcony", ld?.levels?.balcony);
    const allZones     = [...groundZones,...balconyZones];
    const totalSeats   = allZones.reduce((s,z)=>s+z.totalSeats,0);

    return {
      ...basicInfo,
      screens:[
        { screenNumber:1, name:"Ground Floor", position:"center", positionLabel:"Main Floor",
          totalRows:ld?.levels?.ground?.rows||0, totalColumns:ld?.levels?.ground?.cols||0,
          totalZones:groundZones.length, totalSeatsInScreen:groundZones.reduce((s,z)=>s+z.totalSeats,0),
          zones:groundZones, seatRows:[], status:"ACTIVE" },
        ...(ld?.levels?.balcony?.generated ? [{
          screenNumber:2, name:"Balcony", position:"top", positionLabel:"Balcony",
          totalRows:ld?.levels?.balcony?.rows||0, totalColumns:ld?.levels?.balcony?.cols||0,
          totalZones:balconyZones.length, totalSeatsInScreen:balconyZones.reduce((s,z)=>s+z.totalSeats,0),
          zones:balconyZones, seatRows:[], status:"ACTIVE",
        }] : []),
      ],
      totalScreens: ld?.levels?.balcony?.generated ? 2 : 1,
      totalZones: allZones.length,
      totalSeats,
      screenPosition:"top",
      images:[],
      layoutMeta: ld ? {
        aisleCols: ld.aisleCols, aisleRows: ld.aisleRows, rowNaming: ld.rowNaming,
        groundGenerated:  ld.levels?.ground?.generated,
        balconyGenerated: ld.levels?.balcony?.generated,
      } : null,
    };
  };

  const handleSubmit = () => {
    if (!validateStep1()) { setStep(1); return; }
    mutation.mutate(preparePayload());
  };

  // Summary stats for review step
  const reviewStats = () => {
    if (!layoutData) return { groundSeats:0, balconySeats:0, zones:0 };
    const ld = layoutData;
    const gSeats = Object.values(ld.levels?.ground?.seats||{}).filter(s=>s.zone).length;
    const bSeats = Object.values(ld.levels?.balcony?.seats||{}).filter(s=>s.zone).length;
    return { groundSeats:gSeats, balconySeats:bSeats, zones: (ld.zones||[]).length };
  };

  const rs = reviewStats();

  // Shared card style
  const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:"24px" };
  const fieldLabel = { fontSize:13, fontWeight:600, display:"block", marginBottom:6, color:"#374151" };
  const fieldInput = { width:"100%", padding:"10px 14px", fontSize:13, border:"1px solid #e5e7eb", borderRadius:10, background:"#fafafa", color:"#1a1a2e", outline:"none", boxSizing:"border-box", transition:"border .15s" };
  const btnPrimary = { padding:"10px 24px", fontSize:14, borderRadius:10, border:"none", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", cursor:"pointer", fontWeight:700, boxShadow:"0 4px 12px rgba(59,130,246,.3)", transition:"all .15s" };
  const btnSecondary = { padding:"10px 20px", fontSize:13, borderRadius:10, border:"2px solid #e5e7eb", background:"#fff", color:"#374151", cursor:"pointer", fontWeight:600 };

  return (
    <div style={{ minHeight:"100vh", background:"#f3f4f6", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", position:"sticky", top:0, zIndex:20, backdropFilter:"blur(8px)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={()=>router.back()} style={{ width:34, height:34, borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FaArrowLeft style={{ color:"#6b7280", fontSize:13 }} />
            </button>
            <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#1a1a2e,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <MdTheaters style={{ color:"#fff", fontSize:20 }} />
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:800, color:"#1a1a2e" }}>Add Theater</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>Step {step} of 3</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#1a1a2e" }}>{rs.groundSeats + rs.balconySeats} seats mapped</div>
            <div style={{ fontSize:11, color:"#9ca3af" }}>{rs.zones} zones configured</div>
          </div>
        </div>
      </div>

      <div style={{ margin:"0 auto", padding:"28px 20px" }}>
        <StepIndicator current={step} />

        {/* ── STEP 1: Theater Info ── */}
        {step===1 && (
          <div style={card}>
            <h2 style={{ fontSize:20, fontWeight:800, color:"#1a1a2e", marginBottom:20 }}>Theater Information</h2>

            <div style={{ marginBottom:20 }}>
              <label style={fieldLabel}>Theater Owner <span style={{ color:"#ef4444" }}>*</span></label>
              <div style={{ position:"relative" }}>
                <FaUserTie style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:13 }} />
                <select name="ownerId" value={basicInfo.ownerId} onChange={handleBasicChange}
                  style={{ ...fieldInput, paddingLeft:36 }}>
                  <option value="">— Select Theater Owner —</option>
                  {isLoadingUsers ? <option disabled>Loading…</option> :
                    owners.map(o=><option key={o._id} value={o._id}>{o.name} ({o.email})</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              {BASIC_FIELDS.map(f=>(
                <div key={f.name} style={ f.name==="name"||f.name==="location"?{gridColumn:"1/-1"}:{} }>
                  <label style={fieldLabel}>{f.label} {f.required&&<span style={{ color:"#ef4444" }}>*</span>}</label>
                  <div style={{ position:"relative" }}>
                    {f.icon && <f.icon style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:13 }} />}
                    <input type={f.type} name={f.name} value={basicInfo[f.name]} onChange={handleBasicChange}
                      placeholder={f.placeholder} maxLength={f.maxLength}
                      style={{ ...fieldInput, paddingLeft: f.icon?36:14 }} />
                  </div>
                  {(f.name==="contactNumber"||f.name==="pincode") && (
                    <div style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>
                      {basicInfo[f.name].length}/{f.name==="contactNumber"?10:6} digits
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={fieldLabel}>Amenities & Facilities</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
                {AMENITIES.map(a=>(
                  <label key={a.key} style={{
                    display:"flex", alignItems:"center", gap:8, padding:"10px 12px", border:"1px solid #e5e7eb",
                    borderRadius:10, cursor:"pointer", background: basicInfo[a.key]?"#eff6ff":"#fff",
                    borderColor: basicInfo[a.key]?"#3b82f6":"#e5e7eb", transition:"all .15s",
                  }}>
                    <input type="checkbox" name={a.key} checked={basicInfo[a.key]} onChange={handleBasicChange}
                      style={{ accentColor:"#3b82f6", width:15, height:15 }} />
                    <a.icon style={{ color: basicInfo[a.key]?"#3b82f6":"#9ca3af", fontSize:13 }} />
                    <span style={{ fontSize:12, fontWeight:500, color: basicInfo[a.key]?"#1e40af":"#374151" }}>{a.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={()=>{if(validateStep1())setStep(2);}} style={btnPrimary}>
                Next: Design Seat Layout →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Layout Builder ── */}
        {step===2 && (
          <div>
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#1a1a2e", marginBottom:4 }}>Seat Layout Designer</h2>
              <p style={{ fontSize:13, color:"#6b7280" }}>
                Paint zones onto the grid by clicking or dragging. Use the sidebar to configure rows, columns, and zone colors.
                Both ground floor and balcony levels are supported.
              </p>
            </div>

            {/* Legend hint bar */}
            <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap", marginBottom:14, padding:"10px 16px", background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", fontSize:12, color:"#6b7280" }}>
              <span style={{ fontWeight:600, color:"#374151" }}>Quick guide:</span>
              <span>1️⃣ Set rows & cols</span>
              <span>→</span>
              <span>2️⃣ Click Generate</span>
              <span>→</span>
              <span>3️⃣ Select a zone</span>
              <span>→</span>
              <span>4️⃣ Paint seats by clicking/dragging</span>
              <span>→</span>
              <span>5️⃣ Repeat for Balcony if needed</span>
            </div>

            <TheaterLayoutBuilder onLayoutChange={setLayoutData} />

            <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginTop:16 }}>
              <button onClick={()=>setStep(1)} style={btnSecondary}>← Back</button>
              <button onClick={()=>setStep(3)} style={btnPrimary}>Review & Submit →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step===3 && (
          <div style={card}>
            <h2 style={{ fontSize:20, fontWeight:800, color:"#1a1a2e", marginBottom:20 }}>Review & Submit</h2>

            {/* Theater details */}
            <div style={{ background:"#f9fafb", borderRadius:10, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>Theater Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  ["Name", basicInfo.name||"—"],
                  ["Location", basicInfo.location||"—"],
                  ["City", basicInfo.city||"—"],
                  ["State", basicInfo.state||"—"],
                  ["Pincode", basicInfo.pincode||"—"],
                  ["Contact", basicInfo.contactNumber||"—"],
                ].map(([l,v])=>(
                  <div key={l} style={{ fontSize:13 }}>
                    <span style={{ color:"#9ca3af" }}>{l}: </span>
                    <span style={{ fontWeight:600, color:"#1a1a2e" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:6 }}>
                {AMENITIES.filter(a=>basicInfo[a.key]).map(a=>(
                  <span key={a.key} style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe" }}>
                    {a.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Layout summary */}
            <div style={{ background:"#f9fafb", borderRadius:10, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>Layout Summary</div>
              {layoutData ? (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  {[
                    { label:"Ground Seats", value:rs.groundSeats, color:"#2563eb" },
                    { label:"Balcony Seats", value:rs.balconySeats, color:"#7c3aed" },
                    { label:"Total Zones", value:rs.zones, color:"#059669" },
                  ].map(s=>(
                    <div key={s.label} style={{ textAlign:"center", padding:"12px 8px", background:"#fff", borderRadius:8, border:"1px solid #e5e7eb" }}>
                      <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:20, color:"#9ca3af", fontSize:13 }}>
                  ⚠️ No layout configured. Go back to Step 2 to design your seat layout.
                </div>
              )}
              {layoutData?.zones?.length>0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:11, color:"#9ca3af", marginBottom:6 }}>Zone breakdown:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {layoutData.zones.map(z=>(
                      <span key={z.id} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:z.color+"18", color:z.color, border:`1px solid ${z.color}44` }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:z.color, display:"inline-block" }} />
                        {z.name}
                        {z.noSeat && " (no seat)"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", gap:12, paddingTop:16, borderTop:"1px solid #e5e7eb" }}>
              <button onClick={()=>setStep(2)} style={btnSecondary}>← Back to Layout</button>
              <button onClick={handleSubmit} disabled={mutation.isPending}
                style={{ ...btnPrimary, display:"flex", alignItems:"center", gap:8, opacity:mutation.isPending?.8:1 }}>
                {mutation.isPending ? (
                  <><div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }} /> Creating…</>
                ) : (
                  <><FaCheckCircle /> Create Theater</>
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
