"use client";

import React, { Suspense } from 'react';
import Hero from '@/app/public/hero/Hero';
import Show from '@/app/public/shows/Show';
import Header from './components/public/Header';
import Footer from './components/public/Footer';
import Newsletter from '@/app/public/newsletter/Newsletter';

function Page() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Header />
      <Hero />

      {/* 🔥 IMPORTANT FIX */}
      <Suspense fallback={<div>Loading shows...</div>}>
        <Show />
      </Suspense>

      <Newsletter />
      <Footer />
    </div>
  );
}

export default Page;



// import { useState, useCallback, useEffect, useRef } from "react";

// // ─── Constants ───────────────────────────────────────────────────────────────

// const ZONE_COLORS = [
//   "#c0392b", "#2980b9", "#27ae60", "#8e44ad",
//   "#d4ac0d", "#1abc9c", "#e67e22", "#e91e63",
//   "#00bcd4", "#ff5722",
// ];

// const DEFAULT_ZONES = [
//   { id: "z1", name: "44 ARMD",         color: "#c0392b" },
//   { id: "z2", name: "26 MECH",         color: "#2980b9" },
//   { id: "z3", name: "19 MECH",         color: "#27ae60" },
//   { id: "z4", name: "677(I) & 689(I)", color: "#8e44ad" },
//   { id: "z5", name: "VIP / CAMP",      color: "#d4ac0d" },
// ];

// const TOOLS = [
//   { id: "paint", icon: "🖌️", label: "Paint Zone",  hint: "Click/drag seats to assign selected zone" },
//   { id: "block", icon: "🚫", label: "Block Seat",  hint: "Click to mark seats as unavailable" },
//   { id: "aisle", icon: "↔️", label: "Aisle Gap",   hint: "Click to mark seat as aisle space" },
//   { id: "erase", icon: "🧹", label: "Erase",        hint: "Click to clear seat assignment" },
// ];

// function getRowLabel(index, naming) {
//   if (naming === "alpha") return String.fromCharCode(65 + index);
//   return String(index + 1);
// }

// function seatKey(r, c) { return `${r}-${c}`; }

// // ─── Sub-components ──────────────────────────────────────────────────────────

// function Toast({ message, visible }) {
//   return (
//     <div style={{
//       position: "fixed", bottom: 24, right: 24,
//       background: "#1a1a2e", color: "#fff",
//       padding: "10px 18px", borderRadius: 8,
//       fontSize: 13, fontWeight: 500, zIndex: 9999,
//       opacity: visible ? 1 : 0,
//       transform: visible ? "translateY(0)" : "translateY(8px)",
//       transition: "opacity .3s, transform .3s",
//       pointerEvents: "none",
//     }}>
//       {message}
//     </div>
//   );
// }

// function StatChip({ value, label, color = "#1a1a2e" }) {
//   return (
//     <div style={{
//       flex: 1, background: "#fff", border: "0.5px solid #e5e7eb",
//       borderRadius: 8, padding: "8px 6px", textAlign: "center",
//     }}>
//       <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
//       <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{label}</div>
//     </div>
//   );
// }

// function ZoneItem({ zone, isActive, seatCount, onSelect, onDelete }) {
//   return (
//     <div
//       onClick={onSelect}
//       style={{
//         display: "flex", alignItems: "center", gap: 8,
//         padding: "7px 10px", borderRadius: 7,
//         border: isActive ? `2px solid ${zone.color}` : "0.5px solid #e5e7eb",
//         background: isActive ? `${zone.color}10` : "#fff",
//         cursor: "pointer", transition: "all .15s", marginBottom: 4,
//       }}
//     >
//       <div style={{
//         width: 14, height: 14, borderRadius: 3,
//         background: zone.color, flexShrink: 0,
//         border: "1px solid rgba(0,0,0,0.12)"
//       }} />
//       <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//         {zone.name}
//       </span>
//       <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 4 }}>{seatCount}</span>
//       <button
//         onClick={(e) => { e.stopPropagation(); onDelete(); }}
//         style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9ca3af", padding: "0 2px", lineHeight: 1 }}
//         title="Delete zone"
//       >×</button>
//     </div>
//   );
// }

// function AisleTag({ label, onRemove, color = "#1e40af", bg = "#f0f4ff", border = "#bfdbfe" }) {
//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", gap: 5,
//       padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600,
//       background: bg, color, border: `0.5px solid ${border}`, margin: 2,
//     }}>
//       {label}
//       <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13, lineHeight: 1, padding: "0 1px" }}>×</button>
//     </span>
//   );
// }

// function Seat({ r, c, seatData, zones, onMouseDown, onMouseEnter }) {
//   const zone = seatData?.zone ? zones.find(z => z.id === seatData.zone) : null;
//   let bg = "#e74c3c", border = "#c0392b", opacity = 1, cursor = "pointer";
//   if (seatData?.blocked) { bg = "#d1d5db"; border = "#9ca3af"; opacity = 0.7; }
//   else if (seatData?.aisle) { bg = "transparent"; border = "transparent"; opacity = 0; cursor = "default"; }
//   else if (zone) { bg = zone.color; border = zone.color; }
//   return (
//     <div
//       onMouseDown={() => onMouseDown(r, c)}
//       onMouseEnter={() => onMouseEnter(r, c)}
//       style={{
//         width: 22, height: 22, borderRadius: 5,
//         background: bg, border: `1.5px solid ${border}`,
//         cursor, opacity, flexShrink: 0,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         transition: "transform .1s", userSelect: "none",
//       }}
//       onMouseOver={e => { if (cursor !== "default") e.currentTarget.style.transform = "scale(1.18)"; }}
//       onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; }}
//       title={`${getRowLabel(r, "alpha")}${c + 1}`}
//     />
//   );
// }

// // ─── Main Component ──────────────────────────────────────────────────────────

// export default function TheaterAdminBuilder() {
//   const [theaterName, setTheaterName]   = useState("180 ARMD BDE");
//   const [genMode, setGenMode]           = useState("rowcol"); // "rowcol" | "total"
//   const [rowCount, setRowCount]         = useState(13);
//   const [colCount, setColCount]         = useState(14);
//   const [totalSeats, setTotalSeats]     = useState(182);
//   const [totalCols, setTotalCols]       = useState(14);
//   const [rowNaming, setRowNaming]       = useState("alpha");
//   const [zones, setZones]               = useState(DEFAULT_ZONES);
//   const [seats, setSeats]               = useState({});
//   const [tool, setTool]                 = useState("paint");
//   const [activeZone, setActiveZone]     = useState("z1");
//   const [showVIP, setShowVIP]           = useState(true);
//   const [showProj, setShowProj]         = useState(true);
//   const [aisleCols, setAisleCols]       = useState([]); // 0-based col indices
//   const [aisleRows, setAisleRows]       = useState([]); // 0-based row indices
//   const [newAisleCol, setNewAisleCol]   = useState("");
//   const [newAisleRow, setNewAisleRow]   = useState("");
//   const [generated, setGenerated]       = useState(false);
//   const [toast, setToast]               = useState({ msg: "", visible: false });
//   const [newZoneName, setNewZoneName]   = useState("");
//   const [showAddZone, setShowAddZone]   = useState(false);
//   const [showExport, setShowExport]     = useState(false);
//   const paintingRef = useRef(false);

//   const showToast = useCallback((msg) => {
//     setToast({ msg, visible: true });
//     setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
//   }, []);

//   // ── Generate Grid ──
//   const generateGrid = () => {
//     let rows = rowCount, cols = colCount;
//     if (genMode === "total") {
//       cols = totalCols;
//       rows = Math.ceil(totalSeats / totalCols);
//       setRowCount(rows);
//       setColCount(cols);
//     }
//     setSeats({});
//     setGenerated(true);
//     showToast(`Layout created: ${rows} rows × ${cols} cols`);
//   };

//   // ── Aisle helpers ──
//   const addAisleCol = () => {
//     const val = parseInt(newAisleCol);
//     if (!val || val < 1 || val >= colCount) { showToast("Enter a valid col (1 to cols-1)"); return; }
//     const idx = val - 1;
//     setAisleCols(prev => prev.includes(idx) ? prev : [...prev, idx].sort((a,b)=>a-b));
//     setNewAisleCol("");
//   };

//   const removeAisleCol = (idx) => setAisleCols(prev => prev.filter(c => c !== idx));

//   const addAisleRow = () => {
//     const val = parseInt(newAisleRow);
//     if (!val || val < 1 || val >= rowCount) { showToast("Enter a valid row (1 to rows-1)"); return; }
//     const idx = val - 1;
//     setAisleRows(prev => prev.includes(idx) ? prev : [...prev, idx].sort((a,b)=>a-b));
//     setNewAisleRow("");
//   };

//   const removeAisleRow = (idx) => setAisleRows(prev => prev.filter(r => r !== idx));

//   // ── Apply tool ──
//   const applyTool = useCallback((r, c) => {
//     const k = seatKey(r, c);
//     setSeats(prev => {
//       const next = { ...prev };
//       if (tool === "paint" && activeZone) next[k] = { zone: activeZone };
//       else if (tool === "block") next[k] = { blocked: true };
//       else if (tool === "aisle") next[k] = { aisle: true };
//       else if (tool === "erase") delete next[k];
//       return next;
//     });
//   }, [tool, activeZone]);

//   const handleSeatMouseDown = useCallback((r, c) => { paintingRef.current = true; applyTool(r, c); }, [applyTool]);
//   const handleSeatMouseEnter = useCallback((r, c) => { if (paintingRef.current) applyTool(r, c); }, [applyTool]);

//   useEffect(() => {
//     const stop = () => { paintingRef.current = false; };
//     window.addEventListener("mouseup", stop);
//     return () => window.removeEventListener("mouseup", stop);
//   }, []);

//   // ── Zone CRUD ──
//   const addZone = () => {
//     if (!newZoneName.trim()) return;
//     const id = "z" + Date.now();
//     const color = ZONE_COLORS[zones.length % ZONE_COLORS.length];
//     setZones(prev => [...prev, { id, name: newZoneName.trim(), color }]);
//     setActiveZone(id);
//     setNewZoneName(""); setShowAddZone(false);
//     showToast(`Zone "${newZoneName.trim()}" added`);
//   };

//   const deleteZone = (id) => {
//     if (zones.length <= 1) { showToast("Need at least one zone"); return; }
//     setZones(prev => prev.filter(z => z.id !== id));
//     setSeats(prev => { const next = { ...prev }; Object.keys(next).forEach(k => { if (next[k].zone === id) delete next[k]; }); return next; });
//     if (activeZone === id) setActiveZone(zones.find(z => z.id !== id)?.id);
//     showToast("Zone deleted");
//   };

//   const clearAll = () => { setSeats({}); showToast("All zone assignments cleared"); };

//   // ── Stats ──
//   const total    = generated ? rowCount * colCount : 0;
//   const blocked  = Object.values(seats).filter(s => s.blocked).length;
//   const aisles   = Object.values(seats).filter(s => s.aisle).length;
//   const assigned = Object.values(seats).filter(s => s.zone).length;
//   const available = total - blocked - aisles;

//   // ── Export ──
//   const exportLayout = () => {
//     const layout = {
//       title: theaterName, rows: rowCount, cols: colCount, rowNaming,
//       showVIP, showProj,
//       aisleCols: aisleCols.map(c => c + 1),
//       aisleRows: aisleRows.map(r => r + 1),
//       zones: zones.map(z => ({ ...z, seats: Object.entries(seats).filter(([, v]) => v.zone === z.id).map(([k]) => k) })),
//       blocked: Object.entries(seats).filter(([, v]) => v.blocked).map(([k]) => k),
//       aisleSeats: Object.entries(seats).filter(([, v]) => v.aisle).map(([k]) => k),
//       totalSeats: total, timestamp: new Date().toISOString(),
//     };
//     const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url; a.download = `${theaterName || "theater"}-layout.json`; a.click();
//     setShowExport(false); showToast("Layout exported as JSON");
//   };

//   // ── Styles ──
//   const S = {
//     wrap: { display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f3f4f6", overflow: "hidden" },
//     sidebar: { width: 280, background: "#fff", borderRight: "0.5px solid #e5e7eb", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 },
//     sideHeader: { padding: "14px 16px 12px", background: "#1a1a2e", flexShrink: 0 },
//     sideSection: { padding: "12px 16px", borderBottom: "0.5px solid #f0f0f0" },
//     sectionLabel: { fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 },
//     input: { width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none", boxSizing: "border-box" },
//     inputSm: { width: 60, padding: "5px 8px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none" },
//     label: { fontSize: 12, color: "#374151", flex: 1 },
//     row: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
//     btn: { padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #e5e7eb", background: "#fff", color: "#1a1a2e", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 },
//     btnSm: { padding: "4px 8px", fontSize: 12, borderRadius: 5, border: "0.5px solid #e5e7eb", background: "#fff", cursor: "pointer" },
//     btnPrimary: { padding: "8px 16px", fontSize: 13, borderRadius: 7, border: "none", background: "#1a1a2e", color: "#fff", cursor: "pointer", fontWeight: 600, width: "100%", textAlign: "center" },
//     btnDanger: { padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", cursor: "pointer", fontWeight: 500, width: "100%" },
//     canvas: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
//     topbar: { background: "#1a1a2e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" },
//     gridArea: { flex: 1, overflowY: "auto", overflowX: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 },
//     toolBtn: (active) => ({ padding: "6px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: active ? "2px solid #fff" : "0.5px solid #374151", background: active ? "#fff" : "transparent", color: active ? "#1a1a2e" : "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all .15s", whiteSpace: "nowrap" }),
//     vipBanner: { background: "#fef3c7", border: "1px solid #d97706", borderRadius: 7, padding: "7px 20px", fontSize: 12, fontWeight: 700, color: "#92400e", letterSpacing: ".05em", textAlign: "center", marginBottom: 6, alignSelf: "stretch" },
//     projBanner: { background: "#1a1a2e", borderRadius: 7, padding: "7px 24px", fontSize: 12, color: "#fff", letterSpacing: ".1em", textAlign: "center", marginTop: 12, fontWeight: 600, alignSelf: "stretch" },
//     modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 },
//     modal: { background: "#fff", borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 420, width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
//     genTabWrap: { display: "flex", border: "0.5px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 10 },
//     genTab: (active) => ({ flex: 1, padding: 6, fontSize: 12, fontWeight: 600, textAlign: "center", cursor: "pointer", border: "none", background: active ? "#1a1a2e" : "#f9fafb", color: active ? "#fff" : "#9ca3af", transition: "all .15s" }),
//   };

//   return (
//     <div style={S.wrap}>
//       {/* ── Sidebar ── */}
//       <aside style={S.sidebar}>
//         <div style={S.sideHeader}>
//           <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Admin Panel</div>
//           <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Theater Builder</div>
//         </div>

//         {/* Setup */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Theater Setup</div>
//           <div style={{ marginBottom: 8 }}>
//             <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>Event / Name</div>
//             <input style={S.input} value={theaterName} onChange={e => setTheaterName(e.target.value)} placeholder="Event name" />
//           </div>

//           {/* Gen mode tabs */}
//           <div style={S.genTabWrap}>
//             <button style={S.genTab(genMode === "rowcol")} onClick={() => setGenMode("rowcol")}>Rows × Cols</button>
//             <button style={S.genTab(genMode === "total")} onClick={() => setGenMode("total")}>Total Seats</button>
//           </div>

//           {genMode === "rowcol" ? (
//             <>
//               <div style={S.row}><label style={S.label}>Rows</label><input style={S.inputSm} type="number" min={1} max={30} value={rowCount} onChange={e => setRowCount(+e.target.value)} /></div>
//               <div style={S.row}><label style={S.label}>Cols</label><input style={S.inputSm} type="number" min={1} max={60} value={colCount} onChange={e => setColCount(+e.target.value)} /></div>
//             </>
//           ) : (
//             <>
//               <div style={S.row}><label style={S.label}>Total Seats</label><input style={S.inputSm} type="number" min={1} max={1000} value={totalSeats} onChange={e => setTotalSeats(+e.target.value)} /></div>
//               <div style={S.row}><label style={S.label}>Cols per Row</label><input style={S.inputSm} type="number" min={1} max={60} value={totalCols} onChange={e => setTotalCols(+e.target.value)} /></div>
//               <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6 }}>Rows = ⌈Total ÷ Cols⌉</div>
//             </>
//           )}

//           <div style={{ ...S.row, marginBottom: 8 }}>
//             <label style={S.label}>Row naming</label>
//             <select style={{ padding: "5px 8px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none" }} value={rowNaming} onChange={e => setRowNaming(e.target.value)}>
//               <option value="alpha">A, B, C…</option>
//               <option value="num">1, 2, 3…</option>
//             </select>
//           </div>
//           <button style={S.btnPrimary} onClick={generateGrid}>⚡ Generate Layout</button>
//         </div>

//         {/* Zones */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Zones / Sections</div>
//           {zones.map(z => (
//             <ZoneItem key={z.id} zone={z} isActive={activeZone === z.id}
//               seatCount={Object.values(seats).filter(s => s.zone === z.id).length}
//               onSelect={() => setActiveZone(z.id)} onDelete={() => deleteZone(z.id)} />
//           ))}
//           {showAddZone ? (
//             <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
//               <input style={{ ...S.input, flex: 1 }} placeholder="Zone name" value={newZoneName}
//                 onChange={e => setNewZoneName(e.target.value)}
//                 onKeyDown={e => { if (e.key === "Enter") addZone(); if (e.key === "Escape") setShowAddZone(false); }}
//                 autoFocus />
//               <button style={{ ...S.btn, padding: "5px 10px", background: "#1a1a2e", color: "#fff", border: "none" }} onClick={addZone}>+</button>
//               <button style={{ ...S.btn, padding: "5px 10px" }} onClick={() => setShowAddZone(false)}>×</button>
//             </div>
//           ) : (
//             <button style={{ ...S.btn, marginTop: 8, fontSize: 12 }} onClick={() => setShowAddZone(true)}>+ Add Zone</button>
//           )}
//         </div>

//         {/* Options */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Options</div>
//           <div style={S.row}><label style={S.label}>VIP Sofa Area</label><input type="checkbox" checked={showVIP} onChange={e => setShowVIP(e.target.checked)} /></div>
//           <div style={S.row}><label style={S.label}>Projector Label</label><input type="checkbox" checked={showProj} onChange={e => setShowProj(e.target.checked)} /></div>

//           {/* Column Aisles */}
//           <div style={{ marginBottom: 10 }}>
//             <div style={{ ...S.sectionLabel, marginTop: 8 }}>Aisles — Columns</div>
//             <div style={{ display: "flex", flexWrap: "wrap", minHeight: 10, marginBottom: 6 }}>
//               {aisleCols.map(idx => (
//                 <AisleTag key={idx} label={`After col ${idx + 1}`} onRemove={() => removeAisleCol(idx)} />
//               ))}
//             </div>
//             <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//               <input style={S.inputSm} type="number" min={1} placeholder="col #" value={newAisleCol} onChange={e => setNewAisleCol(e.target.value)} onKeyDown={e => e.key === "Enter" && addAisleCol()} />
//               <button style={S.btnSm} onClick={addAisleCol}>+ Add</button>
//             </div>
//             <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>Gap appears after that column number</div>
//           </div>

//           {/* Row Aisles */}
//           <div>
//             <div style={S.sectionLabel}>Aisles — Rows</div>
//             <div style={{ display: "flex", flexWrap: "wrap", minHeight: 10, marginBottom: 6 }}>
//               {aisleRows.map(idx => (
//                 <AisleTag key={idx} label={`After row ${idx + 1}`} onRemove={() => removeAisleRow(idx)} color="#b91c1c" bg="#fff0f0" border="#fca5a5" />
//               ))}
//             </div>
//             <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//               <input style={S.inputSm} type="number" min={1} placeholder="row #" value={newAisleRow} onChange={e => setNewAisleRow(e.target.value)} onKeyDown={e => e.key === "Enter" && addAisleRow()} />
//               <button style={S.btnSm} onClick={addAisleRow}>+ Add</button>
//             </div>
//             <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>Gap appears after that row number</div>
//           </div>
//         </div>

//         {/* Stats */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Statistics</div>
//           <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
//             <StatChip value={available} label="Available" color="#059669" />
//             <StatChip value={assigned}  label="Assigned"  color="#2980b9" />
//             <StatChip value={blocked}   label="Blocked"   color="#9ca3af" />
//           </div>
//           <StatChip value={total} label="Total Seats" color="#1a1a2e" />
//         </div>

//         {/* Legend */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Legend</div>
//           {zones.map(z => (
//             <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
//               <div style={{ width: 18, height: 14, borderRadius: 3, background: z.color, border: "1px solid rgba(0,0,0,.1)" }} />
//               <span style={{ fontSize: 11, color: "#374151" }}>{z.name}</span>
//               <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: "auto" }}>{Object.values(seats).filter(s => s.zone === z.id).length} seats</span>
//             </div>
//           ))}
//           <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
//             <div style={{ width: 18, height: 14, borderRadius: 3, background: "#d1d5db", border: "1px solid #9ca3af" }} />
//             <span style={{ fontSize: 11, color: "#374151" }}>Blocked</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//             <div style={{ width: 18, height: 14, borderRadius: 3, background: "#e74c3c", border: "1px solid #c0392b" }} />
//             <span style={{ fontSize: 11, color: "#374151" }}>Unassigned</span>
//           </div>
//         </div>

//         {/* Actions */}
//         <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
//           <button style={S.btnDanger} onClick={clearAll}>🗑 Clear All Zones</button>
//           <button style={S.btnPrimary} onClick={() => setShowExport(true)}>⬇ Export Layout JSON</button>
//         </div>
//       </aside>

//       {/* ── Canvas ── */}
//       <div style={S.canvas}>
//         <div style={S.topbar}>
//           <div style={{ flex: 1, minWidth: 80 }}>
//             <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".06em", textTransform: "uppercase" }}>{theaterName || "Theater"}</div>
//             <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 1 }}>Layout Editor</div>
//           </div>
//           {TOOLS.map(t => (
//             <button key={t.id} style={S.toolBtn(tool === t.id)} onClick={() => setTool(t.id)} title={t.hint}>
//               <span>{t.icon}</span><span>{t.label}</span>
//             </button>
//           ))}
//         </div>

//         <div style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb", padding: "6px 20px", fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}>
//           <span style={{ fontWeight: 600, color: "#374151" }}>Tool:</span>
//           {TOOLS.find(t => t.id === tool)?.hint}
//           {tool === "paint" && activeZone && (
//             <span style={{ background: zones.find(z => z.id === activeZone)?.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, marginLeft: 4 }}>
//               {zones.find(z => z.id === activeZone)?.name}
//             </span>
//           )}
//         </div>

//         <div style={S.gridArea}>
//           {!generated ? (
//             <div style={{ textAlign: "center", paddingTop: 80, color: "#9ca3af", width: "100%" }}>
//               <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
//               <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>No layout yet</div>
//               <div style={{ fontSize: 13, marginTop: 6 }}>Configure settings and click "Generate Layout"</div>
//             </div>
//           ) : (
//             <>
//               {showVIP && <div style={S.vipBanner}>★ VIP SOFA SEATING AREA ★</div>}

//               {/* Column headers */}
//               <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
//                 <div style={{ width: 24 }} />
//                 {Array.from({ length: colCount }, (_, c) => (
//                   <span key={c} style={{ display: "contents" }}>
//                     {aisleCols.includes(c - 1) && <div style={{ width: 14, flexShrink: 0 }} />}
//                     <div style={{ width: 22, textAlign: "center", fontSize: 9, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>{c + 1}</div>
//                   </span>
//                 ))}
//               </div>

//               {/* Seat rows */}
//               {Array.from({ length: rowCount }, (_, r) => (
//                 <span key={r} style={{ display: "contents" }}>
//                   {aisleRows.includes(r - 1) && <div style={{ height: 12, alignSelf: "stretch" }} />}
//                   <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
//                     <div style={{ width: 20, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>
//                       {getRowLabel(r, rowNaming)}
//                     </div>
//                     {Array.from({ length: colCount }, (_, c) => (
//                       <span key={c} style={{ display: "contents" }}>
//                         {aisleCols.includes(c - 1) && <div style={{ width: 14, flexShrink: 0 }} />}
//                         <Seat r={r} c={c} seatData={seats[seatKey(r, c)]} zones={zones}
//                           onMouseDown={handleSeatMouseDown} onMouseEnter={handleSeatMouseEnter} />
//                       </span>
//                     ))}
//                   </div>
//                 </span>
//               ))}

//               {showProj && <div style={S.projBanner}>▲ PROJECTOR &nbsp;|&nbsp; TOTAL SEATS: {total}</div>}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Export Modal */}
//       {showExport && (
//         <div style={S.modalOverlay} onClick={() => setShowExport(false)}>
//           <div style={S.modal} onClick={e => e.stopPropagation()}>
//             <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Export Layout</h2>
//             <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Downloads a JSON file with all zones, seat assignments, and configuration.</p>
//             <div style={{ background: "#f3f4f6", borderRadius: 7, padding: 12, fontSize: 12, color: "#374151", marginBottom: 16, fontFamily: "monospace" }}>
//               <div>Title: <b>{theaterName}</b></div>
//               <div>Grid: <b>{rowCount} × {colCount}</b></div>
//               <div>Total seats: <b>{total}</b></div>
//               <div>Zones: <b>{zones.length}</b></div>
//               <div>Assigned: <b>{assigned}</b></div>
//               <div>Blocked: <b>{blocked}</b></div>
//               <div>Col aisles after: <b>{aisleCols.map(c => c + 1).join(", ") || "none"}</b></div>
//               <div>Row aisles after: <b>{aisleRows.map(r => r + 1).join(", ") || "none"}</b></div>
//             </div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button style={{ ...S.btnPrimary, flex: 1 }} onClick={exportLayout}>⬇ Download JSON</button>
//               <button style={{ ...S.btn, flex: 1, justifyContent: "center" }} onClick={() => setShowExport(false)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Toast message={toast.msg} visible={toast.visible} />
//     </div>
//   );
// }










//// V2

// import { useState, useCallback, useEffect, useRef } from "react";

// // ─── Constants ───────────────────────────────────────────────────────────────

// const ZONE_COLORS = [
//   "#c0392b", "#2980b9", "#27ae60", "#8e44ad",
//   "#d4ac0d", "#1abc9c", "#e67e22", "#e91e63",
//   "#00bcd4", "#ff5722",
// ];

// const DEFAULT_ZONES = [
//   { id: "z1", name: "44 ARMD",         color: "#c0392b" },
//   { id: "z2", name: "26 MECH",         color: "#2980b9" },
//   { id: "z3", name: "19 MECH",         color: "#27ae60" },
//   { id: "z4", name: "677(I) & 689(I)", color: "#8e44ad" },
//   { id: "z5", name: "VIP / CAMP",      color: "#d4ac0d" },
// ];

// const TOOLS = [
//   { id: "paint", icon: "🖌️", label: "Paint Zone",  hint: "Click/drag seats to assign selected zone" },
//   { id: "block", icon: "🚫", label: "Block Seat",  hint: "Click to mark seats as unavailable" },
//   { id: "aisle", icon: "↔️", label: "Aisle Gap",   hint: "Click to mark seat as aisle space" },
//   { id: "erase", icon: "🧹", label: "Erase",        hint: "Click to clear seat assignment" },
// ];

// function getRowLabel(index, naming) {
//   if (naming === "alpha") return String.fromCharCode(65 + index);
//   return String(index + 1);
// }

// function seatKey(r, c) { return `${r}-${c}`; }

// // ─── Sub-components ──────────────────────────────────────────────────────────

// function Toast({ message, visible }) {
//   return (
//     <div style={{
//       position: "fixed", bottom: 24, right: 24,
//       background: "#1a1a2e", color: "#fff",
//       padding: "10px 18px", borderRadius: 8,
//       fontSize: 13, fontWeight: 500, zIndex: 9999,
//       opacity: visible ? 1 : 0,
//       transform: visible ? "translateY(0)" : "translateY(8px)",
//       transition: "opacity .3s, transform .3s",
//       pointerEvents: "none",
//     }}>
//       {message}
//     </div>
//   );
// }

// function StatChip({ value, label, color = "#1a1a2e" }) {
//   return (
//     <div style={{ flex: 1, background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
//       <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
//       <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{label}</div>
//     </div>
//   );
// }

// function ZoneItem({ zone, isActive, seatCount, onSelect, onDelete }) {
//   return (
//     <div onClick={onSelect} style={{
//       display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7,
//       border: isActive ? `2px solid ${zone.color}` : "0.5px solid #e5e7eb",
//       background: isActive ? `${zone.color}10` : "#fff",
//       cursor: "pointer", transition: "all .15s", marginBottom: 4,
//     }}>
//       <div style={{ width: 14, height: 14, borderRadius: 3, background: zone.color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.12)" }} />
//       <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{zone.name}</span>
//       <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 4 }}>{seatCount}</span>
//       <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
//         style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9ca3af", padding: "0 2px", lineHeight: 1 }}
//         title="Delete zone">×</button>
//     </div>
//   );
// }

// // AisleTag with remove button
// function AisleTag({ label, onRemove, style = {} }) {
//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", gap: 5,
//       padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600,
//       background: "#f0f4ff", color: "#1e40af", border: "0.5px solid #bfdbfe",
//       margin: 2, ...style,
//     }}>
//       {label}
//       <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13, lineHeight: 1, padding: "0 1px" }}>×</button>
//     </span>
//   );
// }

// function Seat({ r, c, seatData, zones, onMouseDown, onMouseEnter }) {
//   const zone = seatData?.zone ? zones.find(z => z.id === seatData.zone) : null;
//   let bg = "#e74c3c", border = "#c0392b", opacity = 1, cursor = "pointer";
//   if (seatData?.blocked) { bg = "#d1d5db"; border = "#9ca3af"; opacity = 0.7; }
//   else if (seatData?.aisle) { bg = "transparent"; border = "transparent"; opacity = 0; cursor = "default"; }
//   else if (zone) { bg = zone.color; border = zone.color; }
//   return (
//     <div
//       onMouseDown={() => onMouseDown(r, c)}
//       onMouseEnter={() => onMouseEnter(r, c)}
//       style={{ width: 22, height: 22, borderRadius: 5, background: bg, border: `1.5px solid ${border}`, cursor, opacity, flexShrink: 0, transition: "transform .1s", userSelect: "none" }}
//       onMouseOver={e => { if (cursor !== "default") e.currentTarget.style.transform = "scale(1.18)"; }}
//       onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; }}
//       title={`${getRowLabel(r, "alpha")}${c + 1}`}
//     />
//   );
// }

// // ─── Main Component ──────────────────────────────────────────────────────────

// export default function TheaterAdminBuilder() {
//   const [theaterName, setTheaterName] = useState("180 ARMD BDE");
//   const [rowCount, setRowCount]       = useState(13);
//   const [colCount, setColCount]       = useState(14);
//   const [rowNaming, setRowNaming]     = useState("alpha");
//   const [zones, setZones]             = useState(DEFAULT_ZONES);
//   const [seats, setSeats]             = useState({});
//   const [tool, setTool]               = useState("paint");
//   const [activeZone, setActiveZone]   = useState("z1");
//   const [showVIP, setShowVIP]         = useState(true);
//   const [showProj, setShowProj]       = useState(true);

//   // aisleCols / aisleRows: [{ idx: number (0-based), gap: number (px) }]
//   const [aisleCols, setAisleCols]     = useState([]);
//   const [aisleRows, setAisleRows]     = useState([]);
//   const [newAisleCol, setNewAisleCol] = useState("");
//   const [newAisleColGap, setNewAisleColGap] = useState(14);
//   const [newAisleRow, setNewAisleRow] = useState("");
//   const [newAisleRowGap, setNewAisleRowGap] = useState(24);

//   const [generated, setGenerated]     = useState(false);
//   const [toast, setToast]             = useState({ msg: "", visible: false });
//   const [newZoneName, setNewZoneName] = useState("");
//   const [showAddZone, setShowAddZone] = useState(false);
//   const [showExport, setShowExport]   = useState(false);
//   const paintingRef = useRef(false);

//   const showToast = useCallback((msg) => {
//     setToast({ msg, visible: true });
//     setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
//   }, []);

//   const generateGrid = () => {
//     setSeats({});
//     setGenerated(true);
//     showToast(`Layout created: ${rowCount} rows × ${colCount} cols`);
//   };

//   // ── Aisle helpers ──
//   const addAisleCol = () => {
//     const val = parseInt(newAisleCol);
//     if (!val || val < 1 || val >= colCount) { showToast("Enter a valid col (1 to cols-1)"); return; }
//     const idx = val - 1;
//     const gap = newAisleColGap || 14;
//     setAisleCols(prev => [...prev.filter(a => a.idx !== idx), { idx, gap }].sort((a,b) => a.idx - b.idx));
//     setNewAisleCol("");
//   };
//   const removeAisleCol = (idx) => setAisleCols(prev => prev.filter(a => a.idx !== idx));

//   const addAisleRow = () => {
//     const val = parseInt(newAisleRow);
//     if (!val || val < 1 || val >= rowCount) { showToast("Enter a valid row (1 to rows-1)"); return; }
//     const idx = val - 1;
//     const gap = newAisleRowGap || 24;
//     setAisleRows(prev => [...prev.filter(a => a.idx !== idx), { idx, gap }].sort((a,b) => a.idx - b.idx));
//     setNewAisleRow("");
//   };
//   const removeAisleRow = (idx) => setAisleRows(prev => prev.filter(a => a.idx !== idx));

//   // ── Apply tool ──
//   const applyTool = useCallback((r, c) => {
//     const k = seatKey(r, c);
//     setSeats(prev => {
//       const next = { ...prev };
//       if (tool === "paint" && activeZone) next[k] = { zone: activeZone };
//       else if (tool === "block") next[k] = { blocked: true };
//       else if (tool === "aisle") next[k] = { aisle: true };
//       else if (tool === "erase") delete next[k];
//       return next;
//     });
//   }, [tool, activeZone]);

//   const handleSeatMouseDown = useCallback((r, c) => { paintingRef.current = true; applyTool(r, c); }, [applyTool]);
//   const handleSeatMouseEnter = useCallback((r, c) => { if (paintingRef.current) applyTool(r, c); }, [applyTool]);

//   useEffect(() => {
//     const stop = () => { paintingRef.current = false; };
//     window.addEventListener("mouseup", stop);
//     return () => window.removeEventListener("mouseup", stop);
//   }, []);

//   // ── Zone CRUD ──
//   const addZone = () => {
//     if (!newZoneName.trim()) return;
//     const id = "z" + Date.now();
//     const color = ZONE_COLORS[zones.length % ZONE_COLORS.length];
//     setZones(prev => [...prev, { id, name: newZoneName.trim(), color }]);
//     setActiveZone(id); setNewZoneName(""); setShowAddZone(false);
//     showToast(`Zone "${newZoneName.trim()}" added`);
//   };
//   const deleteZone = (id) => {
//     if (zones.length <= 1) { showToast("Need at least one zone"); return; }
//     setZones(prev => prev.filter(z => z.id !== id));
//     setSeats(prev => { const next = { ...prev }; Object.keys(next).forEach(k => { if (next[k].zone === id) delete next[k]; }); return next; });
//     if (activeZone === id) setActiveZone(zones.find(z => z.id !== id)?.id);
//     showToast("Zone deleted");
//   };
//   const clearAll = () => { setSeats({}); showToast("All zone assignments cleared"); };

//   const total    = generated ? rowCount * colCount : 0;
//   const blocked  = Object.values(seats).filter(s => s.blocked).length;
//   const aisles   = Object.values(seats).filter(s => s.aisle).length;
//   const assigned = Object.values(seats).filter(s => s.zone).length;
//   const available = total - blocked - aisles;

//   const exportLayout = () => {
//     const layout = {
//       title: theaterName, rows: rowCount, cols: colCount, rowNaming,
//       showVIP, showProj,
//       aisleCols: aisleCols.map(a => ({ afterCol: a.idx + 1, gapPx: a.gap })),
//       aisleRows: aisleRows.map(a => ({ afterRow: a.idx + 1, gapPx: a.gap })),
//       zones: zones.map(z => ({ ...z, seats: Object.entries(seats).filter(([, v]) => v.zone === z.id).map(([k]) => k) })),
//       blocked: Object.entries(seats).filter(([, v]) => v.blocked).map(([k]) => k),
//       aisleSeats: Object.entries(seats).filter(([, v]) => v.aisle).map(([k]) => k),
//       totalSeats: total, timestamp: new Date().toISOString(),
//     };
//     const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url; a.download = `${theaterName || "theater"}-layout.json`; a.click();
//     setShowExport(false); showToast("Layout exported as JSON");
//   };

//   const S = {
//     wrap: { display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f3f4f6", overflow: "hidden" },
//     sidebar: { width: 280, background: "#fff", borderRight: "0.5px solid #e5e7eb", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 },
//     sideHeader: { padding: "14px 16px 12px", background: "#1a1a2e", flexShrink: 0 },
//     sideSection: { padding: "12px 16px", borderBottom: "0.5px solid #f0f0f0" },
//     sectionLabel: { fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 },
//     input: { width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none", boxSizing: "border-box" },
//     inputSm: { width: 54, padding: "5px 8px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none" },
//     label: { fontSize: 12, color: "#374151", flex: 1 },
//     row: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
//     btn: { padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #e5e7eb", background: "#fff", color: "#1a1a2e", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 },
//     btnSm: { padding: "4px 10px", fontSize: 12, borderRadius: 5, border: "0.5px solid #e5e7eb", background: "#fff", cursor: "pointer", whiteSpace: "nowrap" },
//     btnPrimary: { padding: "8px 16px", fontSize: 13, borderRadius: 7, border: "none", background: "#1a1a2e", color: "#fff", cursor: "pointer", fontWeight: 600, width: "100%", textAlign: "center" },
//     btnDanger: { padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", cursor: "pointer", fontWeight: 500, width: "100%" },
//     canvas: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
//     topbar: { background: "#1a1a2e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" },
//     gridArea: { flex: 1, overflowY: "auto", overflowX: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 },
//     toolBtn: (active) => ({ padding: "6px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: active ? "2px solid #fff" : "0.5px solid #374151", background: active ? "#fff" : "transparent", color: active ? "#1a1a2e" : "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all .15s", whiteSpace: "nowrap" }),
//     vipBanner: { background: "#fef3c7", border: "1px solid #d97706", borderRadius: 7, padding: "7px 20px", fontSize: 12, fontWeight: 700, color: "#92400e", letterSpacing: ".05em", textAlign: "center", marginBottom: 6, alignSelf: "stretch" },
//     projBanner: { background: "#1a1a2e", borderRadius: 7, padding: "7px 24px", fontSize: 12, color: "#fff", letterSpacing: ".1em", textAlign: "center", marginTop: 12, fontWeight: 600, alignSelf: "stretch" },
//     modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 },
//     modal: { background: "#fff", borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 420, width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
//     aisleInputRow: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 4 },
//     aisleLabel: { fontSize: 11, color: "#6b7280" },
//   };

//   return (
//     <div style={S.wrap}>
//       {/* ── Sidebar ── */}
//       <aside style={S.sidebar}>
//         <div style={S.sideHeader}>
//           <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Admin Panel</div>
//           <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Theater Builder</div>
//         </div>

//         {/* Setup */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Theater Setup</div>
//           <div style={{ marginBottom: 8 }}>
//             <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>Event / Name</div>
//             <input style={S.input} value={theaterName} onChange={e => setTheaterName(e.target.value)} placeholder="Event name" />
//           </div>
//           <div style={S.row}><label style={S.label}>Rows</label><input style={S.inputSm} type="number" min={1} max={30} value={rowCount} onChange={e => setRowCount(+e.target.value)} /></div>
//           <div style={S.row}><label style={S.label}>Cols</label><input style={S.inputSm} type="number" min={1} max={60} value={colCount} onChange={e => setColCount(+e.target.value)} /></div>
//           <div style={{ ...S.row, marginBottom: 8 }}>
//             <label style={S.label}>Row naming</label>
//             <select style={{ padding: "5px 8px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none" }} value={rowNaming} onChange={e => setRowNaming(e.target.value)}>
//               <option value="alpha">A, B, C…</option>
//               <option value="num">1, 2, 3…</option>
//             </select>
//           </div>
//           <button style={S.btnPrimary} onClick={generateGrid}>⚡ Generate Layout</button>
//         </div>

//         {/* Zones */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Zones / Sections</div>
//           {zones.map(z => (
//             <ZoneItem key={z.id} zone={z} isActive={activeZone === z.id}
//               seatCount={Object.values(seats).filter(s => s.zone === z.id).length}
//               onSelect={() => setActiveZone(z.id)} onDelete={() => deleteZone(z.id)} />
//           ))}
//           {showAddZone ? (
//             <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
//               <input style={{ ...S.input, flex: 1 }} placeholder="Zone name" value={newZoneName}
//                 onChange={e => setNewZoneName(e.target.value)}
//                 onKeyDown={e => { if (e.key === "Enter") addZone(); if (e.key === "Escape") setShowAddZone(false); }}
//                 autoFocus />
//               <button style={{ ...S.btn, padding: "5px 10px", background: "#1a1a2e", color: "#fff", border: "none" }} onClick={addZone}>+</button>
//               <button style={{ ...S.btn, padding: "5px 10px" }} onClick={() => setShowAddZone(false)}>×</button>
//             </div>
//           ) : (
//             <button style={{ ...S.btn, marginTop: 8, fontSize: 12 }} onClick={() => setShowAddZone(true)}>+ Add Zone</button>
//           )}
//         </div>

//         {/* Options */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Options</div>
//           <div style={S.row}><label style={S.label}>VIP Sofa Area</label><input type="checkbox" checked={showVIP} onChange={e => setShowVIP(e.target.checked)} /></div>
//           <div style={S.row}><label style={S.label}>Projector Label</label><input type="checkbox" checked={showProj} onChange={e => setShowProj(e.target.checked)} /></div>

//           {/* Column Aisles */}
//           <div style={{ marginTop: 8, marginBottom: 10 }}>
//             <div style={S.sectionLabel}>Aisles — Columns</div>
//             <div style={{ display: "flex", flexWrap: "wrap", minHeight: 4, marginBottom: 6 }}>
//               {aisleCols.map(a => (
//                 <AisleTag key={a.idx} label={`Col ${a.idx + 1} · ${a.gap}px`} onRemove={() => removeAisleCol(a.idx)} />
//               ))}
//             </div>
//             <div style={S.aisleInputRow}>
//               <span style={S.aisleLabel}>After col</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={1} placeholder="#" value={newAisleCol} onChange={e => setNewAisleCol(e.target.value)} onKeyDown={e => e.key === "Enter" && addAisleCol()} />
//               <span style={S.aisleLabel}>Gap</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={4} max={80} value={newAisleColGap} onChange={e => setNewAisleColGap(+e.target.value)} />
//               <span style={S.aisleLabel}>px</span>
//               <button style={S.btnSm} onClick={addAisleCol}>+ Add</button>
//             </div>
//           </div>

//           {/* Row Aisles */}
//           <div>
//             <div style={S.sectionLabel}>Aisles — Rows</div>
//             <div style={{ display: "flex", flexWrap: "wrap", minHeight: 4, marginBottom: 6 }}>
//               {aisleRows.map(a => (
//                 <AisleTag key={a.idx} label={`Row ${a.idx + 1} · ${a.gap}px`} onRemove={() => removeAisleRow(a.idx)}
//                   style={{ background: "#fff0f0", color: "#b91c1c", borderColor: "#fca5a5" }} />
//               ))}
//             </div>
//             <div style={S.aisleInputRow}>
//               <span style={S.aisleLabel}>After row</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={1} placeholder="#" value={newAisleRow} onChange={e => setNewAisleRow(e.target.value)} onKeyDown={e => e.key === "Enter" && addAisleRow()} />
//               <span style={S.aisleLabel}>Gap</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={4} max={80} value={newAisleRowGap} onChange={e => setNewAisleRowGap(+e.target.value)} />
//               <span style={S.aisleLabel}>px</span>
//               <button style={S.btnSm} onClick={addAisleRow}>+ Add</button>
//             </div>
//           </div>
//         </div>

//         {/* Stats */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Statistics</div>
//           <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
//             <StatChip value={available} label="Available" color="#059669" />
//             <StatChip value={assigned}  label="Assigned"  color="#2980b9" />
//             <StatChip value={blocked}   label="Blocked"   color="#9ca3af" />
//           </div>
//           <StatChip value={total} label="Total Seats" color="#1a1a2e" />
//         </div>

//         {/* Legend */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Legend</div>
//           {zones.map(z => (
//             <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
//               <div style={{ width: 18, height: 14, borderRadius: 3, background: z.color, border: "1px solid rgba(0,0,0,.1)" }} />
//               <span style={{ fontSize: 11, color: "#374151" }}>{z.name}</span>
//               <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: "auto" }}>{Object.values(seats).filter(s => s.zone === z.id).length} seats</span>
//             </div>
//           ))}
//           <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
//             <div style={{ width: 18, height: 14, borderRadius: 3, background: "#d1d5db", border: "1px solid #9ca3af" }} />
//             <span style={{ fontSize: 11, color: "#374151" }}>Blocked</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//             <div style={{ width: 18, height: 14, borderRadius: 3, background: "#e74c3c", border: "1px solid #c0392b" }} />
//             <span style={{ fontSize: 11, color: "#374151" }}>Unassigned</span>
//           </div>
//         </div>

//         <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
//           <button style={S.btnDanger} onClick={clearAll}>🗑 Clear All Zones</button>
//           <button style={S.btnPrimary} onClick={() => setShowExport(true)}>⬇ Export Layout JSON</button>
//         </div>
//       </aside>

//       {/* ── Canvas ── */}
//       <div style={S.canvas}>
//         <div style={S.topbar}>
//           <div style={{ flex: 1, minWidth: 80 }}>
//             <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".06em", textTransform: "uppercase" }}>{theaterName || "Theater"}</div>
//             <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 1 }}>Layout Editor</div>
//           </div>
//           {TOOLS.map(t => (
//             <button key={t.id} style={S.toolBtn(tool === t.id)} onClick={() => setTool(t.id)} title={t.hint}>
//               <span>{t.icon}</span><span>{t.label}</span>
//             </button>
//           ))}
//         </div>

//         <div style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb", padding: "6px 20px", fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}>
//           <span style={{ fontWeight: 600, color: "#374151" }}>Tool:</span>
//           {TOOLS.find(t => t.id === tool)?.hint}
//           {tool === "paint" && activeZone && (
//             <span style={{ background: zones.find(z => z.id === activeZone)?.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, marginLeft: 4 }}>
//               {zones.find(z => z.id === activeZone)?.name}
//             </span>
//           )}
//         </div>

//         <div style={S.gridArea}>
//           {!generated ? (
//             <div style={{ textAlign: "center", paddingTop: 80, color: "#9ca3af", width: "100%" }}>
//               <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
//               <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>No layout yet</div>
//               <div style={{ fontSize: 13, marginTop: 6 }}>Configure settings and click "Generate Layout"</div>
//             </div>
//           ) : (
//             <>
//               {showVIP && <div style={S.vipBanner}>★ VIP SOFA SEATING AREA ★</div>}

//               {/* Column headers */}
//               <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
//                 <div style={{ width: 24 }} />
//                 {Array.from({ length: colCount }, (_, c) => (
//                   <span key={c} style={{ display: "contents" }}>
//                     {aisleCols.find(a => a.idx === c - 1) && (
//                       <div style={{ width: aisleCols.find(a => a.idx === c - 1).gap, flexShrink: 0 }} />
//                     )}
//                     <div style={{ width: 22, textAlign: "center", fontSize: 9, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>{c + 1}</div>
//                   </span>
//                 ))}
//               </div>

//               {/* Rows */}
//               {Array.from({ length: rowCount }, (_, r) => (
//                 <span key={r} style={{ display: "contents" }}>
//                   {aisleRows.find(a => a.idx === r - 1) && (
//                     <div style={{ height: aisleRows.find(a => a.idx === r - 1).gap, flexShrink: 0, alignSelf: "stretch" }} />
//                   )}
//                   <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
//                     <div style={{ width: 20, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>
//                       {getRowLabel(r, rowNaming)}
//                     </div>
//                     {Array.from({ length: colCount }, (_, c) => (
//                       <span key={c} style={{ display: "contents" }}>
//                         {aisleCols.find(a => a.idx === c - 1) && (
//                           <div style={{ width: aisleCols.find(a => a.idx === c - 1).gap, flexShrink: 0 }} />
//                         )}
//                         <Seat r={r} c={c} seatData={seats[seatKey(r, c)]} zones={zones}
//                           onMouseDown={handleSeatMouseDown} onMouseEnter={handleSeatMouseEnter} />
//                       </span>
//                     ))}
//                   </div>
//                 </span>
//               ))}

//               {showProj && <div style={S.projBanner}>▲ PROJECTOR &nbsp;|&nbsp; TOTAL SEATS: {total}</div>}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Export Modal */}
//       {showExport && (
//         <div style={S.modalOverlay} onClick={() => setShowExport(false)}>
//           <div style={S.modal} onClick={e => e.stopPropagation()}>
//             <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Export Layout</h2>
//             <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Downloads a JSON file with all zones, seat assignments, and configuration.</p>
//             <div style={{ background: "#f3f4f6", borderRadius: 7, padding: 12, fontSize: 12, color: "#374151", marginBottom: 16, fontFamily: "monospace" }}>
//               <div>Title: <b>{theaterName}</b></div>
//               <div>Grid: <b>{rowCount} × {colCount}</b></div>
//               <div>Total seats: <b>{total}</b></div>
//               <div>Zones: <b>{zones.length}</b></div>
//               <div>Col aisles: <b>{aisleCols.map(a => `col ${a.idx+1} (${a.gap}px)`).join(", ") || "none"}</b></div>
//               <div>Row aisles: <b>{aisleRows.map(a => `row ${a.idx+1} (${a.gap}px)`).join(", ") || "none"}</b></div>
//             </div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button style={{ ...S.btnPrimary, flex: 1 }} onClick={exportLayout}>⬇ Download JSON</button>
//               <button style={{ ...S.btn, flex: 1, justifyContent: "center" }} onClick={() => setShowExport(false)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Toast message={toast.msg} visible={toast.visible} />
//     </div>
//   );
// }







/// v3


// import { useState, useCallback, useEffect, useRef } from "react";

// // ─── Constants ───────────────────────────────────────────────────────────────

// const ZONE_COLORS = [
//   "#c0392b", "#2980b9", "#27ae60", "#8e44ad",
//   "#d4ac0d", "#1abc9c", "#e67e22", "#e91e63",
//   "#00bcd4", "#ff5722",
// ];

// const DEFAULT_ZONES = [
//   { id: "z1", name: "44 ARMD",         color: "#c0392b" },
//   { id: "z2", name: "26 MECH",         color: "#2980b9" },
//   { id: "z3", name: "19 MECH",         color: "#27ae60" },
//   { id: "z4", name: "677(I) & 689(I)", color: "#8e44ad" },
//   { id: "z5", name: "VIP / CAMP",      color: "#d4ac0d" },
// ];

// const SPACE_STYLES = [
//   { id: "vip",   label: "VIP / Gold",   bg: "#fef3c7", border: "#d97706", color: "#92400e" },
//   { id: "info",  label: "Info / Blue",  bg: "#dbeafe", border: "#3b82f6", color: "#1e3a8a" },
//   { id: "stage", label: "Stage / Dark", bg: "#1a1a2e", border: "#374151", color: "#ffffff" },
//   { id: "green", label: "Green",        bg: "#d1fae5", border: "#059669", color: "#065f46" },
//   { id: "red",   label: "Red",          bg: "#fee2e2", border: "#ef4444", color: "#7f1d1d" },
//   { id: "custom", label: "Custom",      bg: "#f3f4f6", border: "#9ca3af", color: "#374151" },
// ];

// const TOOLS = [
//   { id: "paint", icon: "🖌️", label: "Paint Zone",  hint: "Click/drag seats to assign selected zone" },
//   { id: "block", icon: "🚫", label: "Block Seat",  hint: "Click to mark seats as unavailable" },
//   { id: "aisle", icon: "↔️", label: "Aisle Gap",   hint: "Click to mark seat as aisle space" },
//   { id: "erase", icon: "🧹", label: "Erase",        hint: "Click to clear seat assignment" },
// ];

// function getRowLabel(index, naming) {
//   if (naming === "alpha") return String.fromCharCode(65 + index);
//   return String(index + 1);
// }

// function seatKey(r, c) { return `${r}-${c}`; }

// // ─── Sub-components ──────────────────────────────────────────────────────────

// function Toast({ message, visible }) {
//   return (
//     <div style={{
//       position: "fixed", bottom: 24, right: 24,
//       background: "#1a1a2e", color: "#fff",
//       padding: "10px 18px", borderRadius: 8,
//       fontSize: 13, fontWeight: 500, zIndex: 9999,
//       opacity: visible ? 1 : 0,
//       transform: visible ? "translateY(0)" : "translateY(8px)",
//       transition: "opacity .3s, transform .3s",
//       pointerEvents: "none",
//     }}>
//       {message}
//     </div>
//   );
// }

// function StatChip({ value, label, color = "#1a1a2e" }) {
//   return (
//     <div style={{ flex: 1, background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
//       <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
//       <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{label}</div>
//     </div>
//   );
// }

// function ZoneItem({ zone, isActive, seatCount, onSelect, onDelete }) {
//   return (
//     <div onClick={onSelect} style={{
//       display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7,
//       border: isActive ? `2px solid ${zone.color}` : "0.5px solid #e5e7eb",
//       background: isActive ? `${zone.color}10` : "#fff",
//       cursor: "pointer", transition: "all .15s", marginBottom: 4,
//     }}>
//       <div style={{ width: 14, height: 14, borderRadius: 3, background: zone.color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.12)" }} />
//       <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{zone.name}</span>
//       <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 4 }}>{seatCount}</span>
//       <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
//         style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9ca3af", padding: "0 2px", lineHeight: 1 }}
//         title="Delete zone">×</button>
//     </div>
//   );
// }

// function AisleTag({ label, onRemove, style = {} }) {
//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", gap: 5,
//       padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600,
//       background: "#f0f4ff", color: "#1e40af", border: "0.5px solid #bfdbfe",
//       margin: 2, ...style,
//     }}>
//       {label}
//       <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13, lineHeight: 1, padding: "0 1px" }}>×</button>
//     </span>
//   );
// }

// function Seat({ r, c, seatData, zones, onMouseDown, onMouseEnter }) {
//   const zone = seatData?.zone ? zones.find(z => z.id === seatData.zone) : null;
//   let bg = "#e74c3c", border = "#c0392b", opacity = 1, cursor = "pointer";
//   if (seatData?.blocked) { bg = "#d1d5db"; border = "#9ca3af"; opacity = 0.7; }
//   else if (seatData?.aisle) { bg = "transparent"; border = "transparent"; opacity = 0; cursor = "default"; }
//   else if (zone) { bg = zone.color; border = zone.color; }
//   return (
//     <div
//       onMouseDown={() => onMouseDown(r, c)}
//       onMouseEnter={() => onMouseEnter(r, c)}
//       style={{ width: 22, height: 22, borderRadius: 5, background: bg, border: `1.5px solid ${border}`, cursor, opacity, flexShrink: 0, transition: "transform .1s", userSelect: "none" }}
//       onMouseOver={e => { if (cursor !== "default") e.currentTarget.style.transform = "scale(1.18)"; }}
//       onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; }}
//       title={`${getRowLabel(r, "alpha")}${c + 1}`}
//     />
//   );
// }

// // ─── Custom Space Components ─────────────────────────────────────────────────

// function SpaceItem({ space, onDelete, onEdit }) {
//   const sty = SPACE_STYLES.find(s => s.id === space.style) || SPACE_STYLES[0];
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, border: "0.5px solid #e5e7eb", background: "#fafafa", marginBottom: 4 }}>
//       <div style={{ width: 12, height: 12, borderRadius: 2, background: sty.bg, border: `1.5px solid ${sty.border}`, flexShrink: 0 }} />
//       <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={space.text}>{space.text}</span>
//       <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0 }}>
//         {space.position === "top" ? "⬆ top" : space.position === "bottom" ? "⬇ btm" : `↕ r${space.afterRow}`}
//       </span>
//       <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6b7280", padding: "0 2px" }} title="Edit">✏️</button>
//       <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9ca3af", padding: "0 2px", lineHeight: 1 }} title="Delete">×</button>
//     </div>
//   );
// }

// function SpaceEditor({ space, rowCount, onSave, onCancel }) {
//   const [text, setText]             = useState(space?.text || "");
//   const [position, setPosition]     = useState(space?.position || "top");
//   const [afterRow, setAfterRow]     = useState(space?.afterRow || 1);
//   const [style, setStyle]           = useState(space?.style || "vip");
//   const [height, setHeight]         = useState(space?.height || 36);
//   const [customBg, setCustomBg]     = useState(space?.customBg || "#f3f4f6");
//   const [customBorder, setCustomBorder] = useState(space?.customBorder || "#9ca3af");
//   const [customColor, setCustomColor]   = useState(space?.customColor || "#374151");

//   const save = () => {
//     if (!text.trim()) return;
//     onSave({ text: text.trim(), position, afterRow: +afterRow, style, height: +height, customBg, customBorder, customColor });
//   };

//   const inp = { width: "100%", padding: "6px 9px", fontSize: 12, border: "0.5px solid #e5e7eb", borderRadius: 6, background: "#fafafa", color: "#1a1a2e", outline: "none", boxSizing: "border-box" };
//   const inpSm = { width: 54, padding: "5px 8px", fontSize: 12, border: "0.5px solid #e5e7eb", borderRadius: 6, background: "#fafafa", color: "#1a1a2e", outline: "none" };
//   const lbl = { fontSize: 11, color: "#6b7280", marginBottom: 3, display: "block" };
//   const row = { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 };

//   return (
//     <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, marginTop: 4 }}>
//       <div style={{ marginBottom: 8 }}>
//         <span style={lbl}>Label text</span>
//         <input style={inp} value={text} onChange={e => setText(e.target.value)}
//           placeholder="e.g. ★ VIP SOFA AREA ★" autoFocus
//           onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }} />
//       </div>
//       <div style={{ marginBottom: 8 }}>
//         <span style={lbl}>Style</span>
//         <select style={{ ...inp }} value={style} onChange={e => setStyle(e.target.value)}>
//           {SPACE_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
//         </select>
//       </div>
//       {style === "custom" && (
//         <div style={{ marginBottom: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
//           <div style={{ flex: 1, minWidth: 70 }}>
//             <span style={lbl}>Background</span>
//             <input type="color" value={customBg} onChange={e => setCustomBg(e.target.value)}
//               style={{ width: "100%", height: 30, borderRadius: 5, border: "0.5px solid #e5e7eb", cursor: "pointer", padding: 2 }} />
//           </div>
//           <div style={{ flex: 1, minWidth: 70 }}>
//             <span style={lbl}>Border</span>
//             <input type="color" value={customBorder} onChange={e => setCustomBorder(e.target.value)}
//               style={{ width: "100%", height: 30, borderRadius: 5, border: "0.5px solid #e5e7eb", cursor: "pointer", padding: 2 }} />
//           </div>
//           <div style={{ flex: 1, minWidth: 70 }}>
//             <span style={lbl}>Text color</span>
//             <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)}
//               style={{ width: "100%", height: 30, borderRadius: 5, border: "0.5px solid #e5e7eb", cursor: "pointer", padding: 2 }} />
//           </div>
//         </div>
//       )}
//       <div style={{ marginBottom: 8 }}>
//         <span style={lbl}>Position</span>
//         <select style={{ ...inp }} value={position} onChange={e => setPosition(e.target.value)}>
//           <option value="top">Top (before all rows)</option>
//           <option value="bottom">Bottom (after all rows)</option>
//           <option value="between">Between rows</option>
//         </select>
//       </div>
//       {position === "between" && (
//         <div style={{ ...row, marginBottom: 8 }}>
//           <span style={{ ...lbl, marginBottom: 0 }}>After row</span>
//           <input style={inpSm} type="number" min={1} max={rowCount - 1} value={afterRow}
//             onChange={e => setAfterRow(e.target.value)} />
//         </div>
//       )}
//       <div style={{ ...row, marginBottom: 10 }}>
//         <span style={{ ...lbl, marginBottom: 0, flex: 1 }}>Height (px)</span>
//         <input style={inpSm} type="number" min={20} max={120} value={height}
//           onChange={e => setHeight(e.target.value)} />
//       </div>
//       <div style={{ display: "flex", gap: 6 }}>
//         <button style={{ flex: 1, padding: "7px", fontSize: 12, borderRadius: 6, border: "none", background: "#1a1a2e", color: "#fff", cursor: "pointer", fontWeight: 600 }} onClick={save}>
//           Save Space
//         </button>
//         <button style={{ flex: 1, padding: "7px", fontSize: 12, borderRadius: 6, border: "0.5px solid #e5e7eb", background: "#fff", color: "#374151", cursor: "pointer" }} onClick={onCancel}>
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ──────────────────────────────────────────────────────────

// export default function TheaterAdminBuilder() {
//   const [theaterName, setTheaterName] = useState("180 ARMD BDE");
//   const [rowCount, setRowCount]       = useState(13);
//   const [colCount, setColCount]       = useState(14);
//   const [rowNaming, setRowNaming]     = useState("alpha");
//   const [zones, setZones]             = useState(DEFAULT_ZONES);
//   const [seats, setSeats]             = useState({});
//   const [tool, setTool]               = useState("paint");
//   const [activeZone, setActiveZone]   = useState("z1");
//   const [showProj, setShowProj]       = useState(true);

//   // Custom spaces (label-only areas with no seats)
//   const [spaces, setSpaces]           = useState([
//     { id: "sp1", text: "★ VIP SOFA SEATING AREA ★", position: "top", afterRow: 0, style: "vip", height: 36, customBg: "#fef3c7", customBorder: "#d97706", customColor: "#92400e" },
//   ]);
//   const [showSpaceEditor, setShowSpaceEditor] = useState(false);
//   const [editingSpace, setEditingSpace]       = useState(null);

//   // aisleCols / aisleRows: [{ idx: number (0-based), gap: number (px) }]
//   const [aisleCols, setAisleCols]     = useState([]);
//   const [aisleRows, setAisleRows]     = useState([]);
//   const [newAisleCol, setNewAisleCol] = useState("");
//   const [newAisleColGap, setNewAisleColGap] = useState(14);
//   const [newAisleRow, setNewAisleRow] = useState("");
//   const [newAisleRowGap, setNewAisleRowGap] = useState(24);

//   const [generated, setGenerated]     = useState(false);
//   const [toast, setToast]             = useState({ msg: "", visible: false });
//   const [newZoneName, setNewZoneName] = useState("");
//   const [showAddZone, setShowAddZone] = useState(false);
//   const [showExport, setShowExport]   = useState(false);
//   const paintingRef = useRef(false);

//   const showToast = useCallback((msg) => {
//     setToast({ msg, visible: true });
//     setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
//   }, []);

//   const generateGrid = () => {
//     setSeats({});
//     setGenerated(true);
//     showToast(`Layout created: ${rowCount} rows × ${colCount} cols`);
//   };

//   // ── Aisle helpers ──
//   const addAisleCol = () => {
//     const val = parseInt(newAisleCol);
//     if (!val || val < 1 || val >= colCount) { showToast("Enter a valid col (1 to cols-1)"); return; }
//     const idx = val - 1;
//     const gap = newAisleColGap || 14;
//     setAisleCols(prev => [...prev.filter(a => a.idx !== idx), { idx, gap }].sort((a, b) => a.idx - b.idx));
//     setNewAisleCol("");
//   };
//   const removeAisleCol = (idx) => setAisleCols(prev => prev.filter(a => a.idx !== idx));

//   const addAisleRow = () => {
//     const val = parseInt(newAisleRow);
//     if (!val || val < 1 || val >= rowCount) { showToast("Enter a valid row (1 to rows-1)"); return; }
//     const idx = val - 1;
//     const gap = newAisleRowGap || 24;
//     setAisleRows(prev => [...prev.filter(a => a.idx !== idx), { idx, gap }].sort((a, b) => a.idx - b.idx));
//     setNewAisleRow("");
//   };
//   const removeAisleRow = (idx) => setAisleRows(prev => prev.filter(a => a.idx !== idx));

//   // ── Apply tool ──
//   const applyTool = useCallback((r, c) => {
//     const k = seatKey(r, c);
//     setSeats(prev => {
//       const next = { ...prev };
//       if (tool === "paint" && activeZone) next[k] = { zone: activeZone };
//       else if (tool === "block") next[k] = { blocked: true };
//       else if (tool === "aisle") next[k] = { aisle: true };
//       else if (tool === "erase") delete next[k];
//       return next;
//     });
//   }, [tool, activeZone]);

//   const handleSeatMouseDown = useCallback((r, c) => { paintingRef.current = true; applyTool(r, c); }, [applyTool]);
//   const handleSeatMouseEnter = useCallback((r, c) => { if (paintingRef.current) applyTool(r, c); }, [applyTool]);

//   useEffect(() => {
//     const stop = () => { paintingRef.current = false; };
//     window.addEventListener("mouseup", stop);
//     return () => window.removeEventListener("mouseup", stop);
//   }, []);

//   // ── Zone CRUD ──
//   const addZone = () => {
//     if (!newZoneName.trim()) return;
//     const id = "z" + Date.now();
//     const color = ZONE_COLORS[zones.length % ZONE_COLORS.length];
//     setZones(prev => [...prev, { id, name: newZoneName.trim(), color }]);
//     setActiveZone(id); setNewZoneName(""); setShowAddZone(false);
//     showToast(`Zone "${newZoneName.trim()}" added`);
//   };
//   const deleteZone = (id) => {
//     if (zones.length <= 1) { showToast("Need at least one zone"); return; }
//     setZones(prev => prev.filter(z => z.id !== id));
//     setSeats(prev => { const next = { ...prev }; Object.keys(next).forEach(k => { if (next[k].zone === id) delete next[k]; }); return next; });
//     if (activeZone === id) setActiveZone(zones.find(z => z.id !== id)?.id);
//     showToast("Zone deleted");
//   };
//   const clearAll = () => { setSeats({}); showToast("All zone assignments cleared"); };

//   // ── Custom Space CRUD ──
//   const saveSpace = (data) => {
//     if (editingSpace) {
//       setSpaces(prev => prev.map(s => s.id === editingSpace.id ? { ...s, ...data } : s));
//       showToast("Space updated");
//     } else {
//       setSpaces(prev => [...prev, { id: "sp" + Date.now(), ...data }]);
//       showToast("Custom space added");
//     }
//     setShowSpaceEditor(false);
//     setEditingSpace(null);
//   };
//   const deleteSpace = (id) => { setSpaces(prev => prev.filter(s => s.id !== id)); showToast("Space removed"); };
//   const editSpace   = (sp)  => { setEditingSpace(sp); setShowSpaceEditor(true); };

//   const getSpaceColors = (sp) => {
//     if (sp.style === "custom") return { bg: sp.customBg, border: sp.customBorder, color: sp.customColor };
//     const s = SPACE_STYLES.find(s => s.id === sp.style) || SPACE_STYLES[0];
//     return { bg: s.bg, border: s.border, color: s.color };
//   };

//   const renderSpaceBanner = (sp) => {
//     const { bg, border, color } = getSpaceColors(sp);
//     return (
//       <div key={sp.id} style={{
//         background: bg, border: `1px solid ${border}`, borderRadius: 7,
//         height: sp.height, display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: 12, fontWeight: 700, color, letterSpacing: ".05em", textAlign: "center",
//         marginBottom: 6, alignSelf: "stretch", flexShrink: 0,
//       }}>
//         {sp.text}
//       </div>
//     );
//   };

//   const topSpaces     = spaces.filter(s => s.position === "top");
//   const bottomSpaces  = spaces.filter(s => s.position === "bottom");
//   const betweenSpaces = spaces.filter(s => s.position === "between");

//   const total    = generated ? rowCount * colCount : 0;
//   const blocked  = Object.values(seats).filter(s => s.blocked).length;
//   const aisles   = Object.values(seats).filter(s => s.aisle).length;
//   const assigned = Object.values(seats).filter(s => s.zone).length;
//   const available = total - blocked - aisles;

//   const exportLayout = () => {
//     const layout = {
//       title: theaterName, rows: rowCount, cols: colCount, rowNaming,
//       showProj,
//       spaces,
//       aisleCols: aisleCols.map(a => ({ afterCol: a.idx + 1, gapPx: a.gap })),
//       aisleRows: aisleRows.map(a => ({ afterRow: a.idx + 1, gapPx: a.gap })),
//       zones: zones.map(z => ({ ...z, seats: Object.entries(seats).filter(([, v]) => v.zone === z.id).map(([k]) => k) })),
//       blocked: Object.entries(seats).filter(([, v]) => v.blocked).map(([k]) => k),
//       aisleSeats: Object.entries(seats).filter(([, v]) => v.aisle).map(([k]) => k),
//       totalSeats: total, timestamp: new Date().toISOString(),
//     };
//     const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url; a.download = `${theaterName || "theater"}-layout.json`; a.click();
//     setShowExport(false); showToast("Layout exported as JSON");
//   };

//   const S = {
//     wrap: { display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f3f4f6", overflow: "hidden" },
//     sidebar: { width: 280, background: "#fff", borderRight: "0.5px solid #e5e7eb", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 },
//     sideHeader: { padding: "14px 16px 12px", background: "#1a1a2e", flexShrink: 0 },
//     sideSection: { padding: "12px 16px", borderBottom: "0.5px solid #f0f0f0" },
//     sectionLabel: { fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 },
//     input: { width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none", boxSizing: "border-box" },
//     inputSm: { width: 54, padding: "5px 8px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none" },
//     label: { fontSize: 12, color: "#374151", flex: 1 },
//     row: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
//     btn: { padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #e5e7eb", background: "#fff", color: "#1a1a2e", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 },
//     btnSm: { padding: "4px 10px", fontSize: 12, borderRadius: 5, border: "0.5px solid #e5e7eb", background: "#fff", cursor: "pointer", whiteSpace: "nowrap" },
//     btnPrimary: { padding: "8px 16px", fontSize: 13, borderRadius: 7, border: "none", background: "#1a1a2e", color: "#fff", cursor: "pointer", fontWeight: 600, width: "100%", textAlign: "center" },
//     btnDanger: { padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", cursor: "pointer", fontWeight: 500, width: "100%" },
//     canvas: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
//     topbar: { background: "#1a1a2e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" },
//     gridArea: { flex: 1, overflowY: "auto", overflowX: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 },
//     projBanner: { background: "#1a1a2e", borderRadius: 7, padding: "7px 24px", fontSize: 12, color: "#fff", letterSpacing: ".1em", textAlign: "center", marginTop: 12, fontWeight: 600, alignSelf: "stretch" },
//     modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 },
//     modal: { background: "#fff", borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 420, width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
//     aisleInputRow: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 4 },
//     aisleLabel: { fontSize: 11, color: "#6b7280" },
//   };

//   return (
//     <div style={S.wrap}>
//       {/* ── Sidebar ── */}
//       <aside style={S.sidebar}>
//         <div style={S.sideHeader}>
//           <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Admin Panel</div>
//           <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Theater Builder</div>
//         </div>

//         {/* Setup */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Theater Setup</div>
//           <div style={{ marginBottom: 8 }}>
//             <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>Event / Name</div>
//             <input style={S.input} value={theaterName} onChange={e => setTheaterName(e.target.value)} placeholder="Event name" />
//           </div>
//           <div style={S.row}><label style={S.label}>Rows</label><input style={S.inputSm} type="number" min={1} max={30} value={rowCount} onChange={e => setRowCount(+e.target.value)} /></div>
//           <div style={S.row}><label style={S.label}>Cols</label><input style={S.inputSm} type="number" min={1} max={60} value={colCount} onChange={e => setColCount(+e.target.value)} /></div>
//           <div style={{ ...S.row, marginBottom: 8 }}>
//             <label style={S.label}>Row naming</label>
//             <select style={{ padding: "5px 8px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none" }} value={rowNaming} onChange={e => setRowNaming(e.target.value)}>
//               <option value="alpha">A, B, C…</option>
//               <option value="num">1, 2, 3…</option>
//             </select>
//           </div>
//           <button style={S.btnPrimary} onClick={generateGrid}>⚡ Generate Layout</button>
//         </div>

//         {/* Custom Spaces */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Custom Spaces</div>
//           <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>Label-only areas with no seats</div>
//           {spaces.map(sp => (
//             <SpaceItem key={sp.id} space={sp} onDelete={() => deleteSpace(sp.id)} onEdit={() => editSpace(sp)} />
//           ))}
//           {showSpaceEditor ? (
//             <SpaceEditor
//               space={editingSpace}
//               rowCount={rowCount}
//               onSave={saveSpace}
//               onCancel={() => { setShowSpaceEditor(false); setEditingSpace(null); }}
//             />
//           ) : (
//             <button style={{ ...S.btn, marginTop: 4, fontSize: 12 }} onClick={() => { setEditingSpace(null); setShowSpaceEditor(true); }}>
//               + Add Custom Space
//             </button>
//           )}
//         </div>

//         {/* Zones */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Zones / Sections</div>
//           {zones.map(z => (
//             <ZoneItem key={z.id} zone={z} isActive={activeZone === z.id}
//               seatCount={Object.values(seats).filter(s => s.zone === z.id).length}
//               onSelect={() => setActiveZone(z.id)} onDelete={() => deleteZone(z.id)} />
//           ))}
//           {showAddZone ? (
//             <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
//               <input style={{ ...S.input, flex: 1 }} placeholder="Zone name" value={newZoneName}
//                 onChange={e => setNewZoneName(e.target.value)}
//                 onKeyDown={e => { if (e.key === "Enter") addZone(); if (e.key === "Escape") setShowAddZone(false); }}
//                 autoFocus />
//               <button style={{ ...S.btn, padding: "5px 10px", background: "#1a1a2e", color: "#fff", border: "none" }} onClick={addZone}>+</button>
//               <button style={{ ...S.btn, padding: "5px 10px" }} onClick={() => setShowAddZone(false)}>×</button>
//             </div>
//           ) : (
//             <button style={{ ...S.btn, marginTop: 8, fontSize: 12 }} onClick={() => setShowAddZone(true)}>+ Add Zone</button>
//           )}
//         </div>

//         {/* Options */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Options</div>
//           <div style={S.row}><label style={S.label}>Projector Label</label><input type="checkbox" checked={showProj} onChange={e => setShowProj(e.target.checked)} /></div>

//           {/* Column Aisles */}
//           <div style={{ marginTop: 8, marginBottom: 10 }}>
//             <div style={S.sectionLabel}>Aisles — Columns</div>
//             <div style={{ display: "flex", flexWrap: "wrap", minHeight: 4, marginBottom: 6 }}>
//               {aisleCols.map(a => (
//                 <AisleTag key={a.idx} label={`Col ${a.idx + 1} · ${a.gap}px`} onRemove={() => removeAisleCol(a.idx)} />
//               ))}
//             </div>
//             <div style={S.aisleInputRow}>
//               <span style={S.aisleLabel}>After col</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={1} placeholder="#" value={newAisleCol} onChange={e => setNewAisleCol(e.target.value)} onKeyDown={e => e.key === "Enter" && addAisleCol()} />
//               <span style={S.aisleLabel}>Gap</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={4} max={80} value={newAisleColGap} onChange={e => setNewAisleColGap(+e.target.value)} />
//               <span style={S.aisleLabel}>px</span>
//               <button style={S.btnSm} onClick={addAisleCol}>+ Add</button>
//             </div>
//           </div>

//           {/* Row Aisles */}
//           <div>
//             <div style={S.sectionLabel}>Aisles — Rows</div>
//             <div style={{ display: "flex", flexWrap: "wrap", minHeight: 4, marginBottom: 6 }}>
//               {aisleRows.map(a => (
//                 <AisleTag key={a.idx} label={`Row ${a.idx + 1} · ${a.gap}px`} onRemove={() => removeAisleRow(a.idx)}
//                   style={{ background: "#fff0f0", color: "#b91c1c", borderColor: "#fca5a5" }} />
//               ))}
//             </div>
//             <div style={S.aisleInputRow}>
//               <span style={S.aisleLabel}>After row</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={1} placeholder="#" value={newAisleRow} onChange={e => setNewAisleRow(e.target.value)} onKeyDown={e => e.key === "Enter" && addAisleRow()} />
//               <span style={S.aisleLabel}>Gap</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={4} max={80} value={newAisleRowGap} onChange={e => setNewAisleRowGap(+e.target.value)} />
//               <span style={S.aisleLabel}>px</span>
//               <button style={S.btnSm} onClick={addAisleRow}>+ Add</button>
//             </div>
//           </div>
//         </div>

//         {/* Stats */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Statistics</div>
//           <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
//             <StatChip value={available} label="Available" color="#059669" />
//             <StatChip value={assigned}  label="Assigned"  color="#2980b9" />
//             <StatChip value={blocked}   label="Blocked"   color="#9ca3af" />
//           </div>
//           <StatChip value={total} label="Total Seats" color="#1a1a2e" />
//         </div>

//         {/* Legend */}
//         <div style={S.sideSection}>
//           <div style={S.sectionLabel}>Legend</div>
//           {zones.map(z => (
//             <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
//               <div style={{ width: 18, height: 14, borderRadius: 3, background: z.color, border: "1px solid rgba(0,0,0,.1)" }} />
//               <span style={{ fontSize: 11, color: "#374151" }}>{z.name}</span>
//               <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: "auto" }}>{Object.values(seats).filter(s => s.zone === z.id).length} seats</span>
//             </div>
//           ))}
//           <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
//             <div style={{ width: 18, height: 14, borderRadius: 3, background: "#d1d5db", border: "1px solid #9ca3af" }} />
//             <span style={{ fontSize: 11, color: "#374151" }}>Blocked</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//             <div style={{ width: 18, height: 14, borderRadius: 3, background: "#e74c3c", border: "1px solid #c0392b" }} />
//             <span style={{ fontSize: 11, color: "#374151" }}>Unassigned</span>
//           </div>
//         </div>

//         <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
//           <button style={S.btnDanger} onClick={clearAll}>🗑 Clear All Zones</button>
//           <button style={S.btnPrimary} onClick={() => setShowExport(true)}>⬇ Export Layout JSON</button>
//         </div>
//       </aside>

//       {/* ── Canvas ── */}
//       <div style={S.canvas}>
//         <div style={S.topbar}>
//           <div style={{ flex: 1, minWidth: 80 }}>
//             <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".06em", textTransform: "uppercase" }}>{theaterName || "Theater"}</div>
//             <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 1 }}>Layout Editor</div>
//           </div>
//           {TOOLS.map(t => (
//             <button key={t.id} style={S.toolBtn(tool === t.id)} onClick={() => setTool(t.id)} title={t.hint}>
//               <span>{t.icon}</span><span>{t.label}</span>
//             </button>
//           ))}
//         </div>

//         <div style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb", padding: "6px 20px", fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}>
//           <span style={{ fontWeight: 600, color: "#374151" }}>Tool:</span>
//           {TOOLS.find(t => t.id === tool)?.hint}
//           {tool === "paint" && activeZone && (
//             <span style={{ background: zones.find(z => z.id === activeZone)?.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, marginLeft: 4 }}>
//               {zones.find(z => z.id === activeZone)?.name}
//             </span>
//           )}
//         </div>

//         <div style={S.gridArea}>
//           {!generated ? (
//             <div style={{ textAlign: "center", paddingTop: 80, color: "#9ca3af", width: "100%" }}>
//               <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
//               <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>No layout yet</div>
//               <div style={{ fontSize: 13, marginTop: 6 }}>Configure settings and click "Generate Layout"</div>
//             </div>
//           ) : (
//             <>
//               {/* Top spaces */}
//               {topSpaces.map(sp => renderSpaceBanner(sp))}

//               {/* Column headers */}
//               <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
//                 <div style={{ width: 24 }} />
//                 {Array.from({ length: colCount }, (_, c) => (
//                   <span key={c} style={{ display: "contents" }}>
//                     {aisleCols.find(a => a.idx === c - 1) && (
//                       <div style={{ width: aisleCols.find(a => a.idx === c - 1).gap, flexShrink: 0 }} />
//                     )}
//                     <div style={{ width: 22, textAlign: "center", fontSize: 9, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>{c + 1}</div>
//                   </span>
//                 ))}
//               </div>

//               {/* Rows */}
//               {Array.from({ length: rowCount }, (_, r) => (
//                 <span key={r} style={{ display: "contents" }}>
//                   {aisleRows.find(a => a.idx === r - 1) && (
//                     <div style={{ height: aisleRows.find(a => a.idx === r - 1).gap, flexShrink: 0, alignSelf: "stretch" }} />
//                   )}
//                   {/* Between spaces: render before row r (afterRow === r means "after row r-1", i.e. before row r) */}
//                   {betweenSpaces.filter(sp => sp.afterRow === r).map(sp => renderSpaceBanner(sp))}
//                   <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
//                     <div style={{ width: 20, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>
//                       {getRowLabel(r, rowNaming)}
//                     </div>
//                     {Array.from({ length: colCount }, (_, c) => (
//                       <span key={c} style={{ display: "contents" }}>
//                         {aisleCols.find(a => a.idx === c - 1) && (
//                           <div style={{ width: aisleCols.find(a => a.idx === c - 1).gap, flexShrink: 0 }} />
//                         )}
//                         <Seat r={r} c={c} seatData={seats[seatKey(r, c)]} zones={zones}
//                           onMouseDown={handleSeatMouseDown} onMouseEnter={handleSeatMouseEnter} />
//                       </span>
//                     ))}
//                   </div>
//                 </span>
//               ))}

//               {/* Bottom spaces */}
//               {bottomSpaces.map(sp => renderSpaceBanner(sp))}

//               {showProj && <div style={S.projBanner}>▲ PROJECTOR &nbsp;|&nbsp; TOTAL SEATS: {total}</div>}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Export Modal */}
//       {showExport && (
//         <div style={S.modalOverlay} onClick={() => setShowExport(false)}>
//           <div style={S.modal} onClick={e => e.stopPropagation()}>
//             <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Export Layout</h2>
//             <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Downloads a JSON file with all zones, seat assignments, custom spaces, and configuration.</p>
//             <div style={{ background: "#f3f4f6", borderRadius: 7, padding: 12, fontSize: 12, color: "#374151", marginBottom: 16, fontFamily: "monospace" }}>
//               <div>Title: <b>{theaterName}</b></div>
//               <div>Grid: <b>{rowCount} × {colCount}</b></div>
//               <div>Total seats: <b>{total}</b></div>
//               <div>Zones: <b>{zones.length}</b></div>
//               <div>Custom spaces: <b>{spaces.length}</b></div>
//               <div>Col aisles: <b>{aisleCols.map(a => `col ${a.idx+1} (${a.gap}px)`).join(", ") || "none"}</b></div>
//               <div>Row aisles: <b>{aisleRows.map(a => `row ${a.idx+1} (${a.gap}px)`).join(", ") || "none"}</b></div>
//             </div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button style={{ ...S.btnPrimary, flex: 1 }} onClick={exportLayout}>⬇ Download JSON</button>
//               <button style={{ ...S.btn, flex: 1, justifyContent: "center" }} onClick={() => setShowExport(false)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Toast message={toast.msg} visible={toast.visible} />
//     </div>
//   );
// }



// v6

// import { useState, useCallback, useEffect, useRef } from "react";

// // ─── Constants ────────────────────────────────────────────────────────────────

// const ZONE_COLORS = [
//   "#c0392b", "#2980b9", "#27ae60", "#8e44ad",
//   "#d4ac0d", "#1abc9c", "#e67e22", "#e91e63",
//   "#00bcd4", "#ff5722",
// ];

// const DEFAULT_ZONES = [
//   { id: "z1", name: "44 ARMD",         color: "#c0392b", noSeat: false, label: "", price: 500 },
//   { id: "z2", name: "26 MECH",         color: "#2980b9", noSeat: false, label: "", price: 400 },
//   { id: "z3", name: "19 MECH",         color: "#27ae60", noSeat: false, label: "", price: 350 },
//   { id: "z4", name: "677(I) & 689(I)", color: "#8e44ad", noSeat: false, label: "", price: 300 },
//   { id: "z5", name: "VIP / CAMP",      color: "#d4ac0d", noSeat: false, label: "", price: 800 },
// ];

// const TOOLS = [
//   { id: "paint", icon: "🖌️", label: "Paint Zone",  hint: "Click/drag seats to assign selected zone" },
//   { id: "block", icon: "🚫", label: "Block Seat",  hint: "Click to mark seats as unavailable" },
//   { id: "aisle", icon: "↔️", label: "Aisle Gap",   hint: "Click to mark seat as aisle space" },
//   { id: "erase", icon: "🧹", label: "Erase",        hint: "Click to clear seat assignment" },
// ];

// const DEVICES = [
//   { id: "desktop", label: "Desktop", icon: "🖥", width: 1280, height: 800 },
//   { id: "tablet",  label: "Tablet",  icon: "📱", width: 768,  height: 1024 },
//   { id: "mobile",  label: "Mobile",  icon: "📲", width: 390,  height: 844  },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function getRowLabel(index, naming) {
//   return naming === "alpha" ? String.fromCharCode(65 + index) : String(index + 1);
// }
// function seatKey(r, c) { return `${r}-${c}`; }

// // ─── Sub-components (Admin) ───────────────────────────────────────────────────

// function Toast({ message, visible }) {
//   return (
//     <div style={{
//       position: "fixed", bottom: 24, right: 24, background: "#1a1a2e", color: "#fff",
//       padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999,
//       opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)",
//       transition: "opacity .3s, transform .3s", pointerEvents: "none",
//     }}>{message}</div>
//   );
// }

// function StatChip({ value, label, color = "#1a1a2e" }) {
//   return (
//     <div style={{ flex: 1, background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
//       <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
//       <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{label}</div>
//     </div>
//   );
// }

// function AisleTag({ label, onRemove, style = {} }) {
//   return (
//     <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "#f0f4ff", color: "#1e40af", border: "0.5px solid #bfdbfe", margin: 2, ...style }}>
//       {label}
//       <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13, lineHeight: 1, padding: "0 1px" }}>×</button>
//     </span>
//   );
// }

// function ZoneItem({ zone, isActive, seatCount, onSelect, onDelete, onToggleNoSeat, onLabelChange, onColorChange, onPriceChange }) {
//   const [editingLabel, setEditingLabel] = useState(false);
//   const [labelVal, setLabelVal] = useState(zone.label || "");
//   const colorInputRef = useRef(null);
//   const commitLabel = () => { onLabelChange(labelVal); setEditingLabel(false); };

//   return (
//     <div style={{ borderRadius: 7, border: isActive ? `2px solid ${zone.color}` : "0.5px solid #e5e7eb", background: isActive ? `${zone.color}10` : "#fff", marginBottom: 4, overflow: "hidden" }}>
//       <div onClick={onSelect} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", cursor: "pointer" }}>
//         <div
//           onClick={e => { e.stopPropagation(); colorInputRef.current?.click(); }}
//           title="Click to change color"
//           style={{ width: 14, height: 14, borderRadius: 3, background: zone.color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.18)", cursor: "pointer", position: "relative" }}
//         >
//           <input ref={colorInputRef} type="color" value={zone.color} onChange={e => onColorChange(e.target.value)} onClick={e => e.stopPropagation()} style={{ opacity: 0, position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer", padding: 0, border: "none" }} />
//         </div>
//         <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{zone.name}</span>
//         {zone.noSeat && <span style={{ fontSize: 9, fontWeight: 700, background: zone.color + "22", color: zone.color, border: `1px solid ${zone.color}55`, borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>NO SEAT</span>}
//         <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 4 }}>{zone.noSeat ? "–" : seatCount}</span>
//         <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9ca3af", padding: "0 2px", lineHeight: 1 }}>×</button>
//       </div>
//       <div style={{ padding: "0 10px 8px", borderTop: "0.5px solid #f0f0f0" }} onClick={e => e.stopPropagation()}>
//         {/* Price */}
//         <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
//           <span style={{ fontSize: 11, color: "#6b7280" }}>Price ₹</span>
//           <input type="number" min={0} value={zone.price ?? ""} onChange={e => onPriceChange(+e.target.value)}
//             placeholder="0"
//             style={{ width: 70, padding: "3px 7px", fontSize: 12, border: "0.5px solid #e5e7eb", borderRadius: 5, outline: "none", background: "#fafafa" }} />
//           <span style={{ fontSize: 10, color: "#9ca3af" }}>per seat</span>
//         </div>
//         <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginTop: 6 }}>
//           <input type="checkbox" checked={!!zone.noSeat} onChange={e => onToggleNoSeat(e.target.checked)} style={{ accentColor: zone.color, width: 13, height: 13 }} />
//           <span style={{ fontSize: 11, color: "#6b7280" }}>No-seat area (label only)</span>
//         </label>
//         {zone.noSeat && (
//           <div style={{ marginTop: 6 }}>
//             {editingLabel ? (
//               <div style={{ display: "flex", gap: 5 }}>
//                 <input autoFocus value={labelVal} onChange={e => setLabelVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") commitLabel(); if (e.key === "Escape") setEditingLabel(false); }} placeholder="e.g. ★ VIP SOFA AREA ★" style={{ flex: 1, fontSize: 11, padding: "4px 7px", border: "0.5px solid #d1d5db", borderRadius: 5, outline: "none", background: "#fafafa" }} />
//                 <button onClick={commitLabel} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 5, border: "none", background: "#1a1a2e", color: "#fff", cursor: "pointer" }}>✓</button>
//               </div>
//             ) : (
//               <div onClick={() => { setLabelVal(zone.label || ""); setEditingLabel(true); }} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 5, cursor: "pointer", border: "0.5px dashed #d1d5db", color: zone.label ? "#374151" : "#9ca3af", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                 <span>{zone.label || "Click to set label text…"}</span>
//                 <span style={{ fontSize: 10, color: "#9ca3af" }}>✏️</span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function NoSeatBlock({ zone, colSpan, colWidth = 22, gap = 2 }) {
//   const width = colSpan * colWidth + (colSpan - 1) * gap;
//   return (
//     <div style={{ width, height: 22, borderRadius: 5, flexShrink: 0, background: zone.color + "22", border: `1.5px solid ${zone.color}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
//       {zone.label && <span style={{ fontSize: 9, fontWeight: 700, color: zone.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 4px" }}>{zone.label}</span>}
//     </div>
//   );
// }

// function AdminSeat({ r, c, seatData, zones, onMouseDown, onMouseEnter }) {
//   const zone = seatData?.zone ? zones.find(z => z.id === seatData.zone) : null;
//   let bg = "#e74c3c", border = "#c0392b", opacity = 1, cursor = "pointer";
//   if (seatData?.blocked) { bg = "#d1d5db"; border = "#9ca3af"; opacity = 0.7; }
//   else if (seatData?.aisle) { bg = "transparent"; border = "transparent"; opacity = 0; cursor = "default"; }
//   else if (zone) { bg = zone.color; border = zone.color; }
//   return (
//     <div onMouseDown={() => onMouseDown(r, c)} onMouseEnter={() => onMouseEnter(r, c)}
//       style={{ width: 22, height: 22, borderRadius: 5, background: bg, border: `1.5px solid ${border}`, cursor, opacity, flexShrink: 0, transition: "transform .1s", userSelect: "none" }}
//       onMouseOver={e => { if (cursor !== "default") e.currentTarget.style.transform = "scale(1.18)"; }}
//       onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; }}
//       title={`${getRowLabel(r, "alpha")}${c + 1}`}
//     />
//   );
// }

// function LevelTab({ active, onClick, children }) {
//   return (
//     <button onClick={onClick} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: active ? "2px solid #fff" : "0.5px solid #374151", background: active ? "#fff" : "transparent", color: active ? "#1a1a2e" : "#9ca3af", transition: "all .15s" }}>
//       {children}
//     </button>
//   );
// }

// // ─── PREVIEW COMPONENTS ───────────────────────────────────────────────────────

// /**
//  * BookingSeat — the interactive seat shown in the preview / user-facing booking UI.
//  * States: aisle (invisible), blocked (grey, not clickable), available (zone color), selected (white ring)
//  */
// function BookingSeat({ r, c, seatData, zones, selected, onToggle, seatSize }) {
//   if (seatData?.aisle) return <div style={{ width: seatSize, height: seatSize, flexShrink: 0 }} />;
//   const zone = seatData?.zone ? zones.find(z => z.id === seatData.zone) : null;
//   const isBlocked = seatData?.blocked;
//   const isSelected = selected;
//   const color = zone?.color ?? "#e74c3c";

//   return (
//     <div
//       onClick={() => !isBlocked && onToggle(r, c, zone)}
//       title={isBlocked ? "Unavailable" : `${getRowLabel(r, "alpha")}${c + 1}${zone ? " · " + zone.name : ""}`}
//       style={{
//         width: seatSize, height: seatSize, borderRadius: Math.max(3, seatSize * 0.22),
//         flexShrink: 0, cursor: isBlocked ? "not-allowed" : "pointer",
//         background: isBlocked ? "#374151" : isSelected ? "#fff" : color,
//         border: isBlocked ? "1.5px solid #4b5563" : isSelected ? `2.5px solid ${color}` : `1.5px solid ${color}`,
//         opacity: isBlocked ? 0.4 : 1,
//         transform: isSelected ? "scale(1.15)" : "scale(1)",
//         transition: "transform .15s, background .15s, border .15s",
//         boxShadow: isSelected ? `0 0 0 2px ${color}55` : "none",
//         position: "relative",
//       }}
//     >
//       {isSelected && (
//         <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
//           <div style={{ width: seatSize * 0.35, height: seatSize * 0.35, borderRadius: "50%", background: color }} />
//         </div>
//       )}
//     </div>
//   );
// }

// /**
//  * PreviewLayout — the full booking UI rendered inside the device frame.
//  * Handles its own selected-seat state, responsive seat sizes, booking summary.
//  */
// function PreviewLayout({ theaterName, eventDetails, levels, currentPreviewLevel, zones, aisleCols, aisleRows, rowNaming, showVIP, showProj, deviceWidth }) {
//   const [selectedSeats, setSelectedSeats] = useState({});
//   const [hoveredZone, setHoveredZone] = useState(null);

//   const isMobile  = deviceWidth <= 430;
//   const isTablet  = deviceWidth <= 800 && deviceWidth > 430;
//   const seatSize  = isMobile ? 18 : isTablet ? 20 : 24;
//   const seatGap   = isMobile ? 2  : 3;

//   const levelData = levels[currentPreviewLevel];
//   const { rows, cols, seats, generated } = levelData;

//   const toggleSeat = useCallback((r, c, zone) => {
//     const k = seatKey(r, c);
//     setSelectedSeats(prev => {
//       const next = { ...prev };
//       if (next[k]) delete next[k];
//       else next[k] = { r, c, zone, label: `${getRowLabel(r, rowNaming)}${c + 1}` };
//       return next;
//     });
//   }, [rowNaming]);

//   const selectedList = Object.values(selectedSeats);
//   const totalPrice = selectedList.reduce((sum, s) => sum + (s.zone?.price ?? 0), 0);

//   const buildPreviewRowSegments = (r) => {
//     const segs = []; let c = 0;
//     while (c < cols) {
//       const sd = seats[seatKey(r, c)];
//       const zone = sd?.zone ? zones.find(z => z.id === sd.zone) : null;
//       if (zone?.noSeat) {
//         let span = 1;
//         while (c + span < cols && seats[seatKey(r, c + span)]?.zone === zone.id) span++;
//         segs.push({ type: "noSeatBlock", zoneId: zone.id, startC: c, colSpan: span }); c += span;
//       } else { segs.push({ type: "seat", c }); c++; }
//     }
//     return segs;
//   };

//   const noSeatBlockWidth = (colSpan) => colSpan * seatSize + (colSpan - 1) * seatGap;

//   // zone legend (only zones that have seats on this level)
//   const usedZoneIds = new Set(Object.values(seats).filter(s => s.zone).map(s => s.zone));
//   const usedZones = zones.filter(z => usedZoneIds.has(z.id) && !z.noSeat);

//   return (
//     <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0f172a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#f1f5f9", overflow: "hidden" }}>

//       {/* Header */}
//       <div style={{ padding: isMobile ? "10px 12px" : "14px 20px", background: "#1e293b", borderBottom: "1px solid #334155", flexShrink: 0 }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <div>
//             <div style={{ fontSize: isMobile ? 13 : 16, fontWeight: 700, color: "#f1f5f9" }}>{theaterName || "Event"}</div>
//             <div style={{ fontSize: isMobile ? 10 : 12, color: "#94a3b8", marginTop: 2 }}>{eventDetails?.date || "Sat, 14 Jun 2025"} · {eventDetails?.time || "19:00"} · {eventDetails?.venue || "Main Hall"}</div>
//           </div>
//           <div style={{ background: "#0f172a", borderRadius: 8, padding: isMobile ? "4px 8px" : "6px 12px", fontSize: isMobile ? 10 : 12, color: "#94a3b8", border: "1px solid #334155" }}>
//             {currentPreviewLevel === "ground" ? "🏛 Ground" : "🏗 Balcony"}
//           </div>
//         </div>
//       </div>

//       <div style={{ flex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", minHeight: 0 }}>

//         {/* Seat map area */}
//         <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "12px 8px" : "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>

//           {!generated ? (
//             <div style={{ textAlign: "center", marginTop: 60, color: "#475569" }}>
//               <div style={{ fontSize: 36, marginBottom: 8 }}>🎭</div>
//               <div style={{ fontSize: 14 }}>No layout generated yet</div>
//             </div>
//           ) : (
//             <>
//               {/* VIP / Balcony label */}
//               {currentPreviewLevel === "ground" && showVIP && (
//                 <div style={{ background: "#fef3c7", border: "1px solid #d97706", borderRadius: 6, padding: "5px 16px", fontSize: isMobile ? 10 : 12, fontWeight: 700, color: "#92400e", letterSpacing: ".04em", marginBottom: 8, alignSelf: "stretch", textAlign: "center" }}>★ VIP SOFA SEATING AREA ★</div>
//               )}
//               {currentPreviewLevel === "balcony" && (
//                 <div style={{ background: "#0c4a6e", border: "1px solid #0284c7", borderRadius: 6, padding: "5px 16px", fontSize: isMobile ? 10 : 12, fontWeight: 700, color: "#bae6fd", letterSpacing: ".04em", marginBottom: 8, alignSelf: "stretch", textAlign: "center" }}>🏗 BALCONY LEVEL</div>
//               )}

//               {/* Col headers */}
//               <div style={{ display: "flex", gap: seatGap, marginBottom: 4, alignSelf: "flex-start" }}>
//                 <div style={{ width: 20 }} />
//                 {Array.from({ length: cols }, (_, c) => {
//                   const ac = aisleCols.find(a => a.idx === c - 1);
//                   return (
//                     <span key={c} style={{ display: "contents" }}>
//                       {ac && <div style={{ width: Math.max(ac.gap * (seatSize / 22), 6), flexShrink: 0 }} />}
//                       <div style={{ width: seatSize, textAlign: "center", fontSize: 8, color: "#475569", flexShrink: 0 }}>{c + 1}</div>
//                     </span>
//                   );
//                 })}
//               </div>

//               {/* Seat rows */}
//               {Array.from({ length: rows }, (_, r) => {
//                 const ar = aisleRows.find(a => a.idx === r - 1);
//                 const segs = buildPreviewRowSegments(r);
//                 return (
//                   <span key={r} style={{ display: "contents" }}>
//                     {ar && <div style={{ height: Math.max(ar.gap * 0.6, 6), flexShrink: 0 }} />}
//                     <div style={{ display: "flex", alignItems: "center", gap: seatGap, marginBottom: seatGap }}>
//                       <div style={{ width: 20, textAlign: "center", fontSize: 9, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>{getRowLabel(r, rowNaming)}</div>
//                       {segs.map((seg, si) => {
//                         if (seg.type === "noSeatBlock") {
//                           const zone = zones.find(z => z.id === seg.zoneId);
//                           const gapBefore = aisleCols.find(a => a.idx === seg.startC - 1);
//                           const w = noSeatBlockWidth(seg.colSpan);
//                           return (
//                             <span key={si} style={{ display: "contents" }}>
//                               {gapBefore && <div style={{ width: Math.max(gapBefore.gap * (seatSize / 22), 6), flexShrink: 0 }} />}
//                               <div style={{ width: w, height: seatSize, borderRadius: 4, background: zone.color + "22", border: `1.5px solid ${zone.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                                 {zone.label && <span style={{ fontSize: 8, fontWeight: 700, color: zone.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 3px" }}>{zone.label}</span>}
//                               </div>
//                             </span>
//                           );
//                         }
//                         const c = seg.c;
//                         const gapBefore = aisleCols.find(a => a.idx === c - 1);
//                         const k = seatKey(r, c);
//                         return (
//                           <span key={si} style={{ display: "contents" }}>
//                             {gapBefore && <div style={{ width: Math.max(gapBefore.gap * (seatSize / 22), 6), flexShrink: 0 }} />}
//                             <BookingSeat r={r} c={c} seatData={seats[k]} zones={zones} selected={!!selectedSeats[k]} onToggle={toggleSeat} seatSize={seatSize} />
//                           </span>
//                         );
//                       })}
//                     </div>
//                   </span>
//                 );
//               })}

//               {/* Screen / Projector */}
//               {currentPreviewLevel === "ground" && showProj && (
//                 <div style={{ marginTop: 16, background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "6px 24px", fontSize: isMobile ? 9 : 11, color: "#64748b", letterSpacing: ".08em", fontWeight: 600, alignSelf: "stretch", textAlign: "center" }}>
//                   ▲ SCREEN / PROJECTOR
//                 </div>
//               )}

//               {/* Zone legend */}
//               {usedZones.length > 0 && (
//                 <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
//                   {usedZones.map(z => (
//                     <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 5, background: "#1e293b", borderRadius: 5, padding: "4px 8px", border: `1px solid ${z.color}33` }}>
//                       <div style={{ width: 10, height: 10, borderRadius: 2, background: z.color }} />
//                       <span style={{ fontSize: 10, color: "#94a3b8" }}>{z.name}</span>
//                       {z.price > 0 && <span style={{ fontSize: 10, color: z.color, fontWeight: 600 }}>₹{z.price}</span>}
//                     </div>
//                   ))}
//                   <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#1e293b", borderRadius: 5, padding: "4px 8px", border: "1px solid #33415533" }}>
//                     <div style={{ width: 10, height: 10, borderRadius: 2, background: "#374151", border: "1px solid #4b5563" }} />
//                     <span style={{ fontSize: 10, color: "#94a3b8" }}>Unavailable</span>
//                   </div>
//                   <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#1e293b", borderRadius: 5, padding: "4px 8px", border: "1px solid #33415533" }}>
//                     <div style={{ width: 10, height: 10, borderRadius: 2, background: "#fff", border: "2px solid #2980b9" }} />
//                     <span style={{ fontSize: 10, color: "#94a3b8" }}>Selected</span>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Booking summary panel */}
//         <div style={{
//           width: isMobile ? "100%" : isTablet ? 180 : 220,
//           maxHeight: isMobile ? 180 : "100%",
//           background: "#1e293b", borderTop: isMobile ? "1px solid #334155" : "none",
//           borderLeft: isMobile ? "none" : "1px solid #334155",
//           display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
//         }}>
//           <div style={{ padding: isMobile ? "8px 12px" : "12px 14px", borderBottom: "1px solid #334155", flexShrink: 0 }}>
//             <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#f1f5f9" }}>Your Seats</div>
//             <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{selectedList.length} selected</div>
//           </div>
//           <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "6px 12px" : "8px 14px" }}>
//             {selectedList.length === 0 ? (
//               <div style={{ fontSize: 11, color: "#475569", textAlign: "center", marginTop: 12 }}>Click a seat to select</div>
//             ) : (
//               selectedList.map(s => (
//                 <div key={seatKey(s.r, s.c)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//                     <div style={{ width: 8, height: 8, borderRadius: 2, background: s.zone?.color ?? "#e74c3c", flexShrink: 0 }} />
//                     <span style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>{s.label}</span>
//                   </div>
//                   <span style={{ fontSize: 10, color: "#94a3b8" }}>₹{s.zone?.price ?? 0}</span>
//                 </div>
//               ))
//             )}
//           </div>
//           <div style={{ padding: isMobile ? "8px 12px" : "12px 14px", borderTop: "1px solid #334155", flexShrink: 0 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
//               <span style={{ fontSize: 11, color: "#94a3b8" }}>Total</span>
//               <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>₹{totalPrice.toLocaleString()}</span>
//             </div>
//             <button
//               onClick={() => selectedList.length > 0 && alert(`Preview only — ${selectedList.length} seat(s) selected:\n${selectedList.map(s => s.label).join(", ")}\nTotal: ₹${totalPrice}`)}
//               style={{
//                 width: "100%", padding: "8px 0", borderRadius: 7, border: "none",
//                 background: selectedList.length > 0 ? "#2563eb" : "#334155",
//                 color: selectedList.length > 0 ? "#fff" : "#64748b",
//                 cursor: selectedList.length > 0 ? "pointer" : "not-allowed",
//                 fontSize: 12, fontWeight: 700, transition: "background .2s",
//               }}
//             >
//               {selectedList.length > 0 ? "Proceed to Book" : "Select Seats"}
//             </button>
//             {selectedList.length > 0 && (
//               <button onClick={() => setSelectedSeats({})} style={{ width: "100%", marginTop: 5, padding: "5px 0", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 11 }}>Clear</button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /**
//  * PreviewModal — wraps PreviewLayout in a device frame with switcher controls.
//  */
// function PreviewModal({ onClose, theaterName, zones, levels, aisleCols, aisleRows, rowNaming, showVIP, showProj }) {
//   const [device, setDevice] = useState("desktop");
//   const [previewLevel, setPreviewLevel] = useState("ground");
//   const deviceCfg = DEVICES.find(d => d.id === device);

//   // Scale the device frame to fit the modal
//   const containerRef = useRef(null);
//   const [scale, setScale] = useState(1);
//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;
//     const resize = () => {
//       const avW = el.clientWidth  - 48;
//       const avH = el.clientHeight - 120;
//       const scaleW = avW / deviceCfg.width;
//       const scaleH = avH / deviceCfg.height;
//       setScale(Math.min(scaleW, scaleH, 1));
//     };
//     resize();
//     const ro = new ResizeObserver(resize);
//     ro.observe(el);
//     return () => ro.disconnect();
//   }, [device, deviceCfg]);

//   return (
//     <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", flexDirection: "column", zIndex: 1000, backdropFilter: "blur(4px)" }}>

//       {/* Modal top bar */}
//       <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "#0f172a", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
//         <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>👁 Preview — User Booking View</div>

//         {/* Device switcher */}
//         <div style={{ display: "flex", gap: 4, marginLeft: 16 }}>
//           {DEVICES.map(d => (
//             <button key={d.id} onClick={() => setDevice(d.id)} style={{
//               padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
//               background: device === d.id ? "#2563eb" : "transparent",
//               color: device === d.id ? "#fff" : "#64748b",
//               border: device === d.id ? "none" : "1px solid #334155",
//               transition: "all .15s",
//             }}>
//               {d.icon} {d.label}
//               <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>{d.width}px</span>
//             </button>
//           ))}
//         </div>

//         {/* Level switcher */}
//         <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
//           {["ground", "balcony"].map(lv => (
//             <button key={lv} onClick={() => setPreviewLevel(lv)} style={{
//               padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
//               background: previewLevel === lv ? "#1e293b" : "transparent",
//               color: previewLevel === lv ? "#f1f5f9" : "#64748b",
//               border: previewLevel === lv ? "1px solid #334155" : "1px solid transparent",
//               transition: "all .15s",
//             }}>
//               {lv === "ground" ? "🏛 Ground" : "🏗 Balcony"}
//             </button>
//           ))}
//         </div>

//         <div style={{ marginLeft: "auto", fontSize: 11, color: "#475569" }}>
//           Scale {Math.round(scale * 100)}% · {deviceCfg.width}×{deviceCfg.height}px
//         </div>
//         <button onClick={onClose} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>✕ Close</button>
//       </div>

//       {/* Device frame area */}
//       <div ref={containerRef} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 24 }}>
//         <div style={{ position: "relative" }}>
//           {/* Device chrome */}
//           <div style={{
//             width: deviceCfg.width * scale,
//             height: deviceCfg.height * scale,
//             borderRadius: device === "mobile" ? 28 * scale : device === "tablet" ? 16 * scale : 8 * scale,
//             border: device === "mobile" ? `${6 * scale}px solid #1e293b` : device === "tablet" ? `${5 * scale}px solid #1e293b` : `${3 * scale}px solid #334155`,
//             boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
//             overflow: "hidden",
//             background: "#0f172a",
//             position: "relative",
//           }}>
//             {/* Mobile notch */}
//             {device === "mobile" && (
//               <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 80 * scale, height: 22 * scale, background: "#1e293b", borderBottomLeftRadius: 12 * scale, borderBottomRightRadius: 12 * scale, zIndex: 10 }} />
//             )}
//             {/* Tablet camera */}
//             {device === "tablet" && (
//               <div style={{ position: "absolute", top: 8 * scale, left: "50%", transform: "translateX(-50%)", width: 8 * scale, height: 8 * scale, borderRadius: "50%", background: "#334155", zIndex: 10 }} />
//             )}
//             {/* Content scaled */}
//             <div style={{ width: deviceCfg.width, height: deviceCfg.height, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
//               <PreviewLayout
//                 theaterName={theaterName}
//                 eventDetails={{ date: "Sat, 14 Jun 2025", time: "19:00", venue: "Main Hall" }}
//                 levels={levels}
//                 currentPreviewLevel={previewLevel}
//                 zones={zones}
//                 aisleCols={aisleCols}
//                 aisleRows={aisleRows}
//                 rowNaming={rowNaming}
//                 showVIP={showVIP}
//                 showProj={showProj}
//                 deviceWidth={deviceCfg.width}
//               />
//             </div>
//           </div>

//           {/* Home indicator for mobile */}
//           {device === "mobile" && (
//             <div style={{ width: 80 * scale, height: 4 * scale, background: "#334155", borderRadius: 2 * scale, margin: `${6 * scale}px auto 0` }} />
//           )}
//         </div>
//       </div>

//       {/* Info bar */}
//       <div style={{ background: "#0f172a", borderTop: "1px solid #1e293b", padding: "8px 20px", fontSize: 11, color: "#475569", display: "flex", gap: 16, flexShrink: 0 }}>
//         <span>ℹ️ This is a live preview of the user-facing booking interface.</span>
//         <span>Seats are interactive — click to select/deselect.</span>
//         <span>Integrate your API to replace the "Proceed to Book" action.</span>
//       </div>
//     </div>
//   );
// }

// // ─── Main Admin Component ─────────────────────────────────────────────────────

// export default function TheaterAdminBuilder() {
//   const [theaterName, setTheaterName] = useState("180 ARMD BDE");
//   const [rowNaming,   setRowNaming]   = useState("alpha");
//   const [zones,       setZones]       = useState(DEFAULT_ZONES);
//   const [tool,        setTool]        = useState("paint");
//   const [activeZone,  setActiveZone]  = useState("z1");
//   const [showVIP,     setShowVIP]     = useState(true);
//   const [showProj,    setShowProj]    = useState(true);
//   const [showPreview, setShowPreview] = useState(false);

//   const [currentLevel, setCurrentLevel] = useState("ground");
//   const [levels, setLevels] = useState({
//     ground:  { rows: 13, cols: 14, generated: false, seats: {} },
//     balcony: { rows: 6,  cols: 14, generated: false, seats: {} },
//   });

//   const [groundRows, setGroundRows]   = useState(13);
//   const [groundCols, setGroundCols]   = useState(14);
//   const [balconyRows, setBalconyRows] = useState(6);
//   const [balconyCols, setBalconyCols] = useState(14);

//   const [aisleCols, setAisleCols]           = useState([]);
//   const [aisleRows, setAisleRows]           = useState([]);
//   const [newAisleCol, setNewAisleCol]       = useState("");
//   const [newAisleColGap, setNewAisleColGap] = useState(14);
//   const [newAisleRow, setNewAisleRow]       = useState("");
//   const [newAisleRowGap, setNewAisleRowGap] = useState(24);

//   const [toast,       setToast]       = useState({ msg: "", visible: false });
//   const [newZoneName, setNewZoneName] = useState("");
//   const [showAddZone, setShowAddZone] = useState(false);
//   const [showExport,  setShowExport]  = useState(false);
//   const paintingRef = useRef(false);

//   const showToast = useCallback((msg) => {
//     setToast({ msg, visible: true });
//     setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
//   }, []);

//   const currentRows     = currentLevel === "ground" ? groundRows : balconyRows;
//   const currentCols     = currentLevel === "ground" ? groundCols : balconyCols;
//   const setCurrentRows  = currentLevel === "ground" ? setGroundRows : setBalconyRows;
//   const setCurrentCols  = currentLevel === "ground" ? setGroundCols : setBalconyCols;

//   const getLevelData  = (lv = currentLevel) => levels[lv];
//   const updateLevel   = (lv, patch) => setLevels(prev => ({ ...prev, [lv]: { ...prev[lv], ...patch } }));
//   const updateSeats   = (lv, fn) => setLevels(prev => ({ ...prev, [lv]: { ...prev[lv], seats: fn(prev[lv].seats) } }));

//   const generateGrid = () => {
//     updateLevel(currentLevel, { rows: currentRows, cols: currentCols, generated: true, seats: {} });
//     showToast(`Layout created: ${currentRows} × ${currentCols} (${currentLevel === "ground" ? "Ground" : "Balcony"})`);
//   };

//   const addAisleCol = () => {
//     const val = parseInt(newAisleCol);
//     if (!val || val < 1 || val >= currentCols) { showToast("Enter a valid col (1 to cols-1)"); return; }
//     setAisleCols(prev => [...prev.filter(a => a.idx !== val - 1), { idx: val - 1, gap: newAisleColGap || 14 }].sort((a, b) => a.idx - b.idx));
//     setNewAisleCol("");
//   };
//   const removeAisleCol = idx => setAisleCols(prev => prev.filter(a => a.idx !== idx));
//   const addAisleRow = () => {
//     const val = parseInt(newAisleRow);
//     if (!val || val < 1 || val >= currentRows) { showToast("Enter a valid row (1 to rows-1)"); return; }
//     setAisleRows(prev => [...prev.filter(a => a.idx !== val - 1), { idx: val - 1, gap: newAisleRowGap || 24 }].sort((a, b) => a.idx - b.idx));
//     setNewAisleRow("");
//   };
//   const removeAisleRow = idx => setAisleRows(prev => prev.filter(a => a.idx !== idx));

//   const applyTool = useCallback((r, c) => {
//     const k = seatKey(r, c);
//     updateSeats(currentLevel, prev => {
//       const next = { ...prev };
//       if (tool === "paint" && activeZone) next[k] = { zone: activeZone };
//       else if (tool === "block") next[k] = { blocked: true };
//       else if (tool === "aisle") next[k] = { aisle: true };
//       else if (tool === "erase") delete next[k];
//       return next;
//     });
//   }, [tool, activeZone, currentLevel]);

//   const handleSeatMouseDown  = useCallback((r, c) => { paintingRef.current = true;  applyTool(r, c); }, [applyTool]);
//   const handleSeatMouseEnter = useCallback((r, c) => { if (paintingRef.current) applyTool(r, c); }, [applyTool]);

//   useEffect(() => {
//     const stop = () => { paintingRef.current = false; };
//     window.addEventListener("mouseup", stop);
//     return () => window.removeEventListener("mouseup", stop);
//   }, []);

//   const addZone = () => {
//     if (!newZoneName.trim()) return;
//     const id = "z" + Date.now();
//     const color = ZONE_COLORS[zones.length % ZONE_COLORS.length];
//     setZones(prev => [...prev, { id, name: newZoneName.trim(), color, noSeat: false, label: "", price: 0 }]);
//     setActiveZone(id); setNewZoneName(""); setShowAddZone(false);
//     showToast(`Zone "${newZoneName.trim()}" added`);
//   };
//   const deleteZone = id => {
//     if (zones.length <= 1) { showToast("Need at least one zone"); return; }
//     setZones(prev => prev.filter(z => z.id !== id));
//     ["ground", "balcony"].forEach(lv =>
//       updateSeats(lv, prev => {
//         const next = { ...prev }; Object.keys(next).forEach(k => { if (next[k].zone === id) delete next[k]; }); return next;
//       })
//     );
//     if (activeZone === id) setActiveZone(zones.find(z => z.id !== id)?.id);
//     showToast("Zone deleted");
//   };
//   const updateZone = (id, patch) => setZones(prev => prev.map(z => z.id === id ? { ...z, ...patch } : z));
//   const clearAll = () => { updateLevel(currentLevel, { ...getLevelData(), seats: {} }); showToast("All zone assignments cleared"); };

//   const buildRowSegments = (r, levelData) => {
//     const { cols, seats } = levelData; const segs = []; let c = 0;
//     while (c < cols) {
//       const sd = seats[seatKey(r, c)];
//       const zone = sd?.zone ? zones.find(z => z.id === sd.zone) : null;
//       if (zone?.noSeat) {
//         let span = 1;
//         while (c + span < cols && seats[seatKey(r, c + span)]?.zone === zone.id) span++;
//         segs.push({ type: "noSeatBlock", zoneId: zone.id, startC: c, colSpan: span }); c += span;
//       } else { segs.push({ type: "seat", c }); c++; }
//     }
//     return segs;
//   };

//   const exportLayout = () => {
//     const layout = {
//       title: theaterName, rowNaming, showVIP, showProj,
//       aisleCols: aisleCols.map(a => ({ afterCol: a.idx + 1, gapPx: a.gap })),
//       aisleRows: aisleRows.map(a => ({ afterRow: a.idx + 1, gapPx: a.gap })),
//       zones: zones.map(z => ({ ...z })),
//       levels: {
//         ground:  { ...getLevelData("ground"),  totalSeats: getLevelData("ground").rows  * getLevelData("ground").cols  },
//         balcony: { ...getLevelData("balcony"), totalSeats: getLevelData("balcony").rows * getLevelData("balcony").cols },
//       },
//       timestamp: new Date().toISOString(),
//     };
//     const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob); const a = document.createElement("a");
//     a.href = url; a.download = `${theaterName || "theater"}-layout.json`; a.click();
//     setShowExport(false); showToast("Layout exported");
//   };

//   const levelData = getLevelData();
//   const { rows: lRows, cols: lCols, seats: lSeats, generated: lGenerated } = levelData;
//   const total    = lGenerated ? lRows * lCols : 0;
//   const blocked  = Object.values(lSeats).filter(s => s.blocked).length;
//   const aislesC  = Object.values(lSeats).filter(s => s.aisle).length;
//   const assigned = Object.values(lSeats).filter(s => s.zone).length;
//   const available = total - blocked - aislesC;

//   const toolBtnStyle = active => ({
//     padding: "6px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600,
//     border: active ? "2px solid #fff" : "0.5px solid #374151",
//     background: active ? "#fff" : "transparent", color: active ? "#1a1a2e" : "#9ca3af",
//     cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all .15s", whiteSpace: "nowrap",
//   });

//   const S = {
//     wrap:        { display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f3f4f6", overflow: "hidden" },
//     sidebar:     { width: 290, background: "#fff", borderRight: "0.5px solid #e5e7eb", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 },
//     sideHeader:  { padding: "14px 16px 12px", background: "#1a1a2e", flexShrink: 0 },
//     sideSection: { padding: "12px 16px", borderBottom: "0.5px solid #f0f0f0" },
//     secLabel:    { fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 },
//     input:       { width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none", boxSizing: "border-box" },
//     inputSm:     { width: 54, padding: "5px 8px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none" },
//     label:       { fontSize: 12, color: "#374151", flex: 1 },
//     row:         { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
//     btn:         { padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #e5e7eb", background: "#fff", color: "#1a1a2e", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 },
//     btnSm:       { padding: "4px 10px", fontSize: 12, borderRadius: 5, border: "0.5px solid #e5e7eb", background: "#fff", cursor: "pointer", whiteSpace: "nowrap" },
//     btnPrimary:  { padding: "8px 16px", fontSize: 13, borderRadius: 7, border: "none", background: "#1a1a2e", color: "#fff", cursor: "pointer", fontWeight: 600, width: "100%", textAlign: "center" },
//     btnDanger:   { padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", cursor: "pointer", fontWeight: 500, width: "100%" },
//     canvas:      { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
//     topbar:      { background: "#1a1a2e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" },
//     gridArea:    { flex: 1, overflowY: "auto", overflowX: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 },
//   };

//   return (
//     <div style={S.wrap}>
//       {/* Sidebar */}
//       <aside style={S.sidebar}>
//         <div style={S.sideHeader}>
//           <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Admin Panel</div>
//           <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Theater Builder</div>
//         </div>

//         {/* Setup */}
//         <div style={S.sideSection}>
//           <div style={S.secLabel}>Theater Setup</div>
//           <div style={{ marginBottom: 8 }}>
//             <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>Event / Name</div>
//             <input style={S.input} value={theaterName} onChange={e => setTheaterName(e.target.value)} placeholder="Event name" />
//           </div>
//           <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
//             <LevelTab active={currentLevel === "ground"}  onClick={() => setCurrentLevel("ground")}>🏛 Ground</LevelTab>
//             <LevelTab active={currentLevel === "balcony"} onClick={() => setCurrentLevel("balcony")}>🏗 Balcony</LevelTab>
//           </div>
//           <div style={S.row}><label style={S.label}>Rows</label><input style={S.inputSm} type="number" min={1} max={30} value={currentRows} onChange={e => setCurrentRows(+e.target.value)} /></div>
//           <div style={S.row}><label style={S.label}>Cols</label><input style={S.inputSm} type="number" min={1} max={60} value={currentCols} onChange={e => setCurrentCols(+e.target.value)} /></div>
//           <div style={{ ...S.row, marginBottom: 8 }}>
//             <label style={S.label}>Row naming</label>
//             <select style={{ padding: "5px 8px", fontSize: 13, border: "0.5px solid #e5e7eb", borderRadius: 7, background: "#fafafa", color: "#1a1a2e", outline: "none" }} value={rowNaming} onChange={e => setRowNaming(e.target.value)}>
//               <option value="alpha">A, B, C…</option>
//               <option value="num">1, 2, 3…</option>
//             </select>
//           </div>
//           <button style={S.btnPrimary} onClick={generateGrid}>⚡ Generate {currentLevel === "ground" ? "Ground" : "Balcony"} Layout</button>
//         </div>

//         {/* Zones */}
//         <div style={S.sideSection}>
//           <div style={S.secLabel}>Zones / Sections</div>
//           <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>Click color swatch to change. Set price per seat for booking preview.</div>
//           {zones.map(z => (
//             <ZoneItem key={z.id} zone={z} isActive={activeZone === z.id}
//               seatCount={Object.values(lSeats).filter(s => s.zone === z.id).length}
//               onSelect={() => { setActiveZone(z.id); setTool("paint"); }}
//               onDelete={() => deleteZone(z.id)}
//               onToggleNoSeat={val => updateZone(z.id, { noSeat: val })}
//               onLabelChange={val => updateZone(z.id, { label: val })}
//               onColorChange={val => updateZone(z.id, { color: val })}
//               onPriceChange={val => updateZone(z.id, { price: val })}
//             />
//           ))}
//           {showAddZone ? (
//             <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
//               <input style={{ ...S.input, flex: 1 }} placeholder="Zone name" value={newZoneName}
//                 onChange={e => setNewZoneName(e.target.value)}
//                 onKeyDown={e => { if (e.key === "Enter") addZone(); if (e.key === "Escape") setShowAddZone(false); }}
//                 autoFocus />
//               <button style={{ ...S.btn, padding: "5px 10px", background: "#1a1a2e", color: "#fff", border: "none" }} onClick={addZone}>+</button>
//               <button style={{ ...S.btn, padding: "5px 10px" }} onClick={() => setShowAddZone(false)}>×</button>
//             </div>
//           ) : (
//             <button style={{ ...S.btn, marginTop: 8, fontSize: 12 }} onClick={() => setShowAddZone(true)}>+ Add Zone</button>
//           )}
//         </div>

//         {/* Options */}
//         <div style={S.sideSection}>
//           <div style={S.secLabel}>Options</div>
//           <div style={S.row}><label style={S.label}>VIP Sofa Banner</label><input type="checkbox" checked={showVIP} onChange={e => setShowVIP(e.target.checked)} /></div>
//           <div style={S.row}><label style={S.label}>Projector Label</label><input type="checkbox" checked={showProj} onChange={e => setShowProj(e.target.checked)} /></div>

//           <div style={{ marginTop: 8, marginBottom: 10 }}>
//             <div style={S.secLabel}>Aisles — Columns</div>
//             <div style={{ display: "flex", flexWrap: "wrap", minHeight: 4, marginBottom: 6 }}>
//               {aisleCols.map(a => <AisleTag key={a.idx} label={`Col ${a.idx + 1} · ${a.gap}px`} onRemove={() => removeAisleCol(a.idx)} />)}
//             </div>
//             <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
//               <span style={{ fontSize: 11, color: "#6b7280" }}>After col</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={1} placeholder="#" value={newAisleCol} onChange={e => setNewAisleCol(e.target.value)} onKeyDown={e => e.key === "Enter" && addAisleCol()} />
//               <span style={{ fontSize: 11, color: "#6b7280" }}>Gap</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={4} max={80} value={newAisleColGap} onChange={e => setNewAisleColGap(+e.target.value)} />
//               <span style={{ fontSize: 11, color: "#6b7280" }}>px</span>
//               <button style={S.btnSm} onClick={addAisleCol}>+ Add</button>
//             </div>
//           </div>

//           <div>
//             <div style={S.secLabel}>Aisles — Rows</div>
//             <div style={{ display: "flex", flexWrap: "wrap", minHeight: 4, marginBottom: 6 }}>
//               {aisleRows.map(a => <AisleTag key={a.idx} label={`Row ${a.idx + 1} · ${a.gap}px`} onRemove={() => removeAisleRow(a.idx)} style={{ background: "#fff0f0", color: "#b91c1c", borderColor: "#fca5a5" }} />)}
//             </div>
//             <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
//               <span style={{ fontSize: 11, color: "#6b7280" }}>After row</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={1} placeholder="#" value={newAisleRow} onChange={e => setNewAisleRow(e.target.value)} onKeyDown={e => e.key === "Enter" && addAisleRow()} />
//               <span style={{ fontSize: 11, color: "#6b7280" }}>Gap</span>
//               <input style={{ ...S.inputSm, width: 48 }} type="number" min={4} max={80} value={newAisleRowGap} onChange={e => setNewAisleRowGap(+e.target.value)} />
//               <span style={{ fontSize: 11, color: "#6b7280" }}>px</span>
//               <button style={S.btnSm} onClick={addAisleRow}>+ Add</button>
//             </div>
//           </div>
//         </div>

//         {/* Stats */}
//         <div style={S.sideSection}>
//           <div style={S.secLabel}>Statistics — {currentLevel === "ground" ? "Ground" : "Balcony"}</div>
//           <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
//             <StatChip value={available} label="Available" color="#059669" />
//             <StatChip value={assigned}  label="Assigned"  color="#2980b9" />
//             <StatChip value={blocked}   label="Blocked"   color="#9ca3af" />
//           </div>
//           <StatChip value={total} label="Total Seats" color="#1a1a2e" />
//         </div>

//         {/* Legend */}
//         <div style={S.sideSection}>
//           <div style={S.secLabel}>Legend</div>
//           {zones.map(z => (
//             <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
//               <div style={{ width: 18, height: 14, borderRadius: 3, background: z.noSeat ? z.color + "33" : z.color, border: `1px solid ${z.color}` }} />
//               <span style={{ fontSize: 11, color: "#374151" }}>{z.name}</span>
//               {z.noSeat && <span style={{ fontSize: 9, color: "#9ca3af", fontStyle: "italic" }}>no seat</span>}
//               {!z.noSeat && z.price > 0 && <span style={{ fontSize: 10, color: z.color, fontWeight: 600, marginLeft: 2 }}>₹{z.price}</span>}
//               <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: "auto" }}>{z.noSeat ? "–" : `${Object.values(lSeats).filter(s => s.zone === z.id).length} seats`}</span>
//             </div>
//           ))}
//           <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
//             <div style={{ width: 18, height: 14, borderRadius: 3, background: "#d1d5db", border: "1px solid #9ca3af" }} />
//             <span style={{ fontSize: 11, color: "#374151" }}>Blocked</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//             <div style={{ width: 18, height: 14, borderRadius: 3, background: "#e74c3c", border: "1px solid #c0392b" }} />
//             <span style={{ fontSize: 11, color: "#374151" }}>Unassigned</span>
//           </div>
//         </div>

//         <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
//           <button
//             style={{ padding: "8px 16px", fontSize: 13, borderRadius: 7, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
//             onClick={() => setShowPreview(true)}
//           >
//             👁 Preview Booking View
//           </button>
//           <button style={S.btnDanger} onClick={clearAll}>🗑 Clear All Zones</button>
//           <button style={S.btnPrimary} onClick={() => setShowExport(true)}>⬇ Export Layout JSON</button>
//         </div>
//       </aside>

//       {/* Canvas */}
//       <div style={S.canvas}>
//         <div style={S.topbar}>
//           <div style={{ flex: 1, minWidth: 80 }}>
//             <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".06em", textTransform: "uppercase" }}>{theaterName || "Theater"}</div>
//             <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 1 }}>Layout Editor</div>
//           </div>
//           <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
//             <LevelTab active={currentLevel === "ground"}  onClick={() => setCurrentLevel("ground")}>🏛 Ground</LevelTab>
//             <LevelTab active={currentLevel === "balcony"} onClick={() => setCurrentLevel("balcony")}>🏗 Balcony</LevelTab>
//           </div>
//           {TOOLS.map(t => (
//             <button key={t.id} style={toolBtnStyle(tool === t.id)} onClick={() => setTool(t.id)} title={t.hint}>
//               <span>{t.icon}</span><span>{t.label}</span>
//             </button>
//           ))}
//           <button
//             onClick={() => setShowPreview(true)}
//             style={{ padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, border: "2px solid #2563eb", background: "#2563eb22", color: "#60a5fa", cursor: "pointer", whiteSpace: "nowrap" }}
//           >
//             👁 Preview
//           </button>
//         </div>

//         <div style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb", padding: "6px 20px", fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}>
//           <span style={{ fontWeight: 600, color: "#374151" }}>Tool:</span>
//           {TOOLS.find(t => t.id === tool)?.hint}
//           {tool === "paint" && activeZone && (
//             <span style={{ background: zones.find(z => z.id === activeZone)?.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, marginLeft: 4 }}>
//               {zones.find(z => z.id === activeZone)?.name}
//               {zones.find(z => z.id === activeZone)?.noSeat && " · no-seat"}
//             </span>
//           )}
//           <span style={{ marginLeft: "auto", fontSize: 11, background: currentLevel === "ground" ? "#e0e7ff" : "#e0f2fe", color: currentLevel === "ground" ? "#3730a3" : "#0c4a6e", padding: "2px 10px", borderRadius: 10, fontWeight: 600 }}>
//             {currentLevel === "ground" ? "GROUND FLOOR" : "BALCONY"}
//           </span>
//         </div>

//         <div style={S.gridArea}>
//           {!lGenerated ? (
//             <div style={{ textAlign: "center", paddingTop: 80, color: "#9ca3af", width: "100%" }}>
//               <div style={{ fontSize: 48, marginBottom: 12 }}>{currentLevel === "balcony" ? "🏗" : "🎭"}</div>
//               <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>No {currentLevel} layout yet</div>
//               <div style={{ fontSize: 13, marginTop: 6 }}>Configure settings and click "Generate {currentLevel === "ground" ? "Ground" : "Balcony"} Layout"</div>
//             </div>
//           ) : (
//             <>
//               {currentLevel === "ground" && showVIP && (
//                 <div style={{ background: "#fef3c7", border: "1px solid #d97706", borderRadius: 7, padding: "7px 20px", fontSize: 12, fontWeight: 700, color: "#92400e", letterSpacing: ".05em", textAlign: "center", marginBottom: 6, alignSelf: "stretch" }}>★ VIP SOFA SEATING AREA ★</div>
//               )}
//               {currentLevel === "balcony" && (
//                 <div style={{ background: "#e0f2fe", border: "1px solid #0284c7", borderRadius: 7, padding: "7px 20px", fontSize: 12, fontWeight: 700, color: "#0c4a6e", letterSpacing: ".05em", textAlign: "center", marginBottom: 6, alignSelf: "stretch" }}>🏗 BALCONY LEVEL</div>
//               )}

//               {/* Column headers */}
//               <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
//                 <div style={{ width: 24 }} />
//                 {Array.from({ length: lCols }, (_, c) => (
//                   <span key={c} style={{ display: "contents" }}>
//                     {aisleCols.find(a => a.idx === c - 1) && <div style={{ width: aisleCols.find(a => a.idx === c - 1).gap, flexShrink: 0 }} />}
//                     <div style={{ width: 22, textAlign: "center", fontSize: 9, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>{c + 1}</div>
//                   </span>
//                 ))}
//               </div>

//               {/* Seat rows */}
//               {Array.from({ length: lRows }, (_, r) => {
//                 const segments = buildRowSegments(r, levelData);
//                 return (
//                   <span key={r} style={{ display: "contents" }}>
//                     {aisleRows.find(a => a.idx === r - 1) && <div style={{ height: aisleRows.find(a => a.idx === r - 1).gap, flexShrink: 0, alignSelf: "stretch" }} />}
//                     <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
//                       <div style={{ width: 20, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>{getRowLabel(r, rowNaming)}</div>
//                       {segments.map((seg, si) => {
//                         if (seg.type === "noSeatBlock") {
//                           const zone = zones.find(z => z.id === seg.zoneId);
//                           const gapBefore = aisleCols.find(a => a.idx === seg.startC - 1);
//                           return (
//                             <span key={si} style={{ display: "contents" }}>
//                               {gapBefore && <div style={{ width: gapBefore.gap, flexShrink: 0 }} />}
//                               <NoSeatBlock zone={zone} colSpan={seg.colSpan} />
//                             </span>
//                           );
//                         }
//                         const c = seg.c;
//                         const gapBefore = aisleCols.find(a => a.idx === c - 1);
//                         return (
//                           <span key={si} style={{ display: "contents" }}>
//                             {gapBefore && <div style={{ width: gapBefore.gap, flexShrink: 0 }} />}
//                             <AdminSeat r={r} c={c} seatData={lSeats[seatKey(r, c)]} zones={zones} onMouseDown={handleSeatMouseDown} onMouseEnter={handleSeatMouseEnter} />
//                           </span>
//                         );
//                       })}
//                     </div>
//                   </span>
//                 );
//               })}

//               {currentLevel === "ground" && showProj && (
//                 <div style={{ background: "#1a1a2e", borderRadius: 7, padding: "7px 24px", fontSize: 12, color: "#fff", letterSpacing: ".1em", textAlign: "center", marginTop: 12, fontWeight: 600, alignSelf: "stretch" }}>▲ PROJECTOR &nbsp;|&nbsp; TOTAL SEATS: {total}</div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Preview Modal */}
//       {showPreview && (
//         <PreviewModal
//           onClose={() => setShowPreview(false)}
//           theaterName={theaterName}
//           zones={zones}
//           levels={levels}
//           aisleCols={aisleCols}
//           aisleRows={aisleRows}
//           rowNaming={rowNaming}
//           showVIP={showVIP}
//           showProj={showProj}
//         />
//       )}

//       {/* Export Modal */}
//       {showExport && (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }} onClick={() => setShowExport(false)}>
//           <div style={{ background: "#fff", borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 420, width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
//             <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Export Layout</h2>
//             <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Downloads a JSON file with all zones, prices, seat assignments, and both floor levels.</p>
//             <div style={{ background: "#f3f4f6", borderRadius: 7, padding: 12, fontSize: 12, color: "#374151", marginBottom: 16, fontFamily: "monospace" }}>
//               <div>Title: <b>{theaterName}</b></div>
//               <div>Ground: <b>{getLevelData("ground").rows} × {getLevelData("ground").cols}</b> {getLevelData("ground").generated ? "✅" : "⬜ not generated"}</div>
//               <div>Balcony: <b>{getLevelData("balcony").rows} × {getLevelData("balcony").cols}</b> {getLevelData("balcony").generated ? "✅" : "⬜ not generated"}</div>
//               <div>Zones: <b>{zones.length}</b> · Prices: <b>{zones.map(z => `₹${z.price ?? 0}`).join(", ")}</b></div>
//             </div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button style={{ padding: "8px 16px", fontSize: 13, borderRadius: 7, border: "none", background: "#1a1a2e", color: "#fff", cursor: "pointer", fontWeight: 600, flex: 1, textAlign: "center" }} onClick={exportLayout}>⬇ Download JSON</button>
//               <button style={{ padding: "7px 14px", fontSize: 13, borderRadius: 7, border: "0.5px solid #e5e7eb", background: "#fff", color: "#1a1a2e", cursor: "pointer", flex: 1, textAlign: "center" }} onClick={() => setShowExport(false)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Toast message={toast.msg} visible={toast.visible} />
//     </div>
//   );
// }


/// V7








