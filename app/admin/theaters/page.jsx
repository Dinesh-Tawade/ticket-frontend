


"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  getAllTheatersAdmin,
  deleteTheaterAdmin,
  updateTheaterAdmin,
  getTheaterByIdAdmin,
} from "../../services/adminCommunication";
import {
  FaBuilding, FaMapMarkerAlt, FaPhone, FaTicketAlt, FaCouch, FaWifi,
  FaParking, FaCoffee, FaAccessibleIcon, FaEdit, FaTrash, FaPlus,
  FaSearch, FaTimes, FaCheckCircle, FaTimesCircle, FaChevronDown,
  FaSpinner, FaEye, FaChevronLeft, FaChevronRight,
  FaSort, FaSortUp, FaSortDown, FaExpand, FaCompress,
  FaTicketAlt as FaTicket, FaFilm, FaCouch as FaSeat,
} from "react-icons/fa";
import { MdTheaters, MdEventSeat, MdScreenShare } from "react-icons/md";
import { GiTheaterCurtains } from "react-icons/gi";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const AMENITIES = [
  { icon: FaCouch,          name: "Recliner",   key: "hasRecliner",   color: "blue"   },
  { icon: FaWifi,           name: "WiFi",       key: "hasWifi",       color: "indigo" },
  { icon: FaParking,        name: "Parking",    key: "hasParking",    color: "green"  },
  { icon: FaCoffee,         name: "Café",       key: "hasCafe",       color: "orange" },
  { icon: FaAccessibleIcon, name: "Wheelchair", key: "hasWheelchair", color: "purple" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CINEMA-STYLE SEAT BOOKING PREVIEW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a single floor/level of seats exactly like a real booking site.
 * Each zone gets its color from zone.color; booked seats are dimmed,
 * available seats are interactive, selected seats glow.
 */
// const CinemaSeatFloor = ({ levelKey, zones, seats, rows, cols, aisleCols = [], aisleRows = [], selected, onToggle }) => {
//   const [hoveredKey, setHoveredKey] = useState(null);

//   const getRowLabel = (r) => String.fromCharCode(65 + r);
//   const getZone     = (id) => zones.find((z) => z.id === id);

//   return (
//     <div style={{ overflowX: "auto" }}>
//       <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", minWidth: "max-content" }}>

//         {/* Column numbers header */}
//         <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
//           <div style={{ width: 22, flexShrink: 0 }} />
//           {Array.from({ length: cols }, (_, c) => (
//             <span key={c} style={{ display: "contents" }}>
//               {aisleCols.find((a) => a.idx === c - 1) && (
//                 <div style={{ width: 14, flexShrink: 0 }} />
//               )}
//               <div style={{
//                 width: 22, textAlign: "center", fontSize: 9,
//                 color: "#6b7280", fontWeight: 600, flexShrink: 0,
//               }}>
//                 {c + 1}
//               </div>
//             </span>
//           ))}
//         </div>

//         {/* Seat rows */}
//         {Array.from({ length: rows }, (_, r) => {
//           const hasRowAisle = aisleRows.find((a) => a.idx === r - 1);
//           return (
//             <span key={r} style={{ display: "contents" }}>
//               {hasRowAisle && (
//                 <div style={{ height: 12, flexShrink: 0, alignSelf: "stretch" }} />
//               )}
//               <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
//                 {/* Row label */}
//                 <div style={{
//                   width: 22, textAlign: "center", fontSize: 10,
//                   fontWeight: 700, color: "#9ca3af", flexShrink: 0,
//                 }}>
//                   {getRowLabel(r)}
//                 </div>

//                 {Array.from({ length: cols }, (_, c) => {
//                   const k        = `${r}-${c}`;
//                   const fullKey  = `${levelKey}::${k}`;
//                   const sd       = seats[k];
//                   const zone     = sd?.zone ? getZone(sd.zone) : null;
//                   const isAisle  = !sd || sd.aisle;
//                   const isBlocked = sd?.blocked;
//                   const isBooked = sd?.booked || sd?.isBooked === true || sd?.isAvailable === false;
//                   const isSel    = selected.has(fullKey);
//                   const col      = zone ? zone.color : "#4a9edd";
//                   const colAisle = aisleCols.find((a) => a.idx === c - 1);

//                   let seatStyle = {
//                     width: 22, height: 22, flexShrink: 0,
//                     borderRadius: "5px 5px 3px 3px",
//                     cursor: "default",
//                     fontSize: 0,
//                     border: "none",
//                     outline: "none",
//                     transition: "transform .1s",
//                     position: "relative",
//                   };

//                   if (isAisle) {
//                     seatStyle = { ...seatStyle, background: "transparent", visibility: "hidden" };
//                   } else if (isBlocked) {
//                     seatStyle = { ...seatStyle, background: "#1f2028", border: "1.5px solid #2a2a38", opacity: 0.5 };
//                   } else if (isBooked) {
//                     seatStyle = {
//                       ...seatStyle,
//                       background: col + "30",
//                       border: `1.5px solid ${col}45`,
//                       opacity: 0.4,
//                     };
//                   } else if (isSel) {
//                     seatStyle = {
//                       ...seatStyle,
//                       background: col,
//                       border: `2px solid #fff`,
//                       cursor: "pointer",
//                       transform: "scale(1.1)",
//                     };
//                   } else {
//                     seatStyle = {
//                       ...seatStyle,
//                       background: col + "28",
//                       border: `1.5px solid ${col}70`,
//                       cursor: "pointer",
//                     };
//                   }

//                   return (
//                     <span key={c} style={{ display: "contents" }}>
//                       {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
//                       <button
//                         style={seatStyle}
//                         disabled={isAisle || isBlocked || isBooked}
//                         onClick={() => !isAisle && !isBlocked && !isBooked && onToggle(fullKey, zone, r, c, levelKey)}
//                         onMouseEnter={() => !isAisle && !isBlocked && setHoveredKey(fullKey)}
//                         onMouseLeave={() => setHoveredKey(null)}
//                         title={!isAisle && zone ? `${getRowLabel(r)}${c + 1} · ${zone.name} · ₹${Math.round(zone.basePrice * (zone.priceMultiplier || 1))}` : ""}
//                       />
//                     </span>
//                   );
//                 })}
//               </div>
//             </span>
//           );
//         })}
//       </div>
//     </div>
//   );
// };


const CinemaSeatFloor = ({ levelKey, zones, seats, rows, cols, aisleCols = [], aisleRows = [], selected, onToggle }) => {
  const [hoveredKey, setHoveredKey] = useState(null);

  const getRowLabel = (r) => String.fromCharCode(65 + r);
  const getZone     = (id) => zones.find((z) => z.id === id);

  // Build row segments — groups consecutive no-seat zone cells into label blocks
  const buildRowSegments = (r) => {
    const segs = [];
    let c = 0;
    while (c < cols) {
      const k  = `${r}-${c}`;
      const sd = seats[k];
      const zone = sd?.zone ? getZone(sd.zone) : null;
      if (zone?.noSeat) {
        let span = 1;
        while (
          c + span < cols &&
          seats[`${r}-${c + span}`]?.zone === zone.id
        ) span++;
        segs.push({ type: "noSeatBlock", zone, startC: c, colSpan: span });
        c += span;
      } else {
        segs.push({ type: "seat", c });
        c++;
      }
    }
    return segs;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", minWidth: "max-content" }}>

        {/* Column numbers header */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 22, flexShrink: 0 }} />
          {Array.from({ length: cols }, (_, c) => (
            <span key={c} style={{ display: "contents" }}>
              {aisleCols.find((a) => a.idx === c - 1) && (
                <div style={{ width: 14, flexShrink: 0 }} />
              )}
              <div style={{
                width: 22, textAlign: "center", fontSize: 9,
                color: "#6b7280", fontWeight: 600, flexShrink: 0,
              }}>
                {c + 1}
              </div>
            </span>
          ))}
        </div>

        {/* Seat rows */}
        {Array.from({ length: rows }, (_, r) => {
          const hasRowAisle = aisleRows.find((a) => a.idx === r - 1);
          const segs        = buildRowSegments(r);

          return (
            <span key={r} style={{ display: "contents" }}>
              {hasRowAisle && (
                <div style={{ height: 12, flexShrink: 0, alignSelf: "stretch" }} />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>

                {/* Row label */}
                <div style={{
                  width: 22, textAlign: "center", fontSize: 10,
                  fontWeight: 700, color: "#9ca3af", flexShrink: 0,
                }}>
                  {getRowLabel(r)}
                </div>

                {segs.map((seg, si) => {

                  /* ── No-seat label block ── */
                  if (seg.type === "noSeatBlock") {
                    const colAisle = aisleCols.find((a) => a.idx === seg.startC - 1);
                    // Width = sum of seat widths + gaps between them
                    const blockWidth = seg.colSpan * 22 + (seg.colSpan - 1) * 4;
                    return (
                      <span key={si} style={{ display: "contents" }}>
                        {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                        <div style={{
                          width:        blockWidth,
                          height:       22,
                          flexShrink:   0,
                          borderRadius: 5,
                          background:   seg.zone.color + "22",
                          border:       `1.5px solid ${seg.zone.color}`,
                          display:      "flex",
                          alignItems:   "center",
                          justifyContent: "center",
                          overflow:     "hidden",
                        }}>
                          {seg.zone.label && (
                            <span style={{
                              fontSize:     9,
                              fontWeight:   700,
                              color:        seg.zone.color,
                              whiteSpace:   "nowrap",
                              overflow:     "hidden",
                              textOverflow: "ellipsis",
                              padding:      "0 4px",
                            }}>
                              {seg.zone.label}
                            </span>
                          )}
                        </div>
                      </span>
                    );
                  }

                  /* ── Normal seat ── */
                  const c        = seg.c;
                  const k        = `${r}-${c}`;
                  const fullKey  = `${levelKey}::${k}`;
                  const sd       = seats[k];
                  const zone     = sd?.zone ? getZone(sd.zone) : null;
                  const isAisle  = !sd || sd.aisle;
                  const isBlocked = sd?.blocked;
                  const isBooked = sd?.booked || sd?.isBooked === true || sd?.isAvailable === false;
                  const isSel    = selected.has(fullKey);
                  const col      = zone ? zone.color : "#4a9edd";
                  const colAisle = aisleCols.find((a) => a.idx === c - 1);

                  let seatStyle = {
                    width:        22,
                    height:       22,
                    flexShrink:   0,
                    borderRadius: "5px 5px 3px 3px",
                    cursor:       "default",
                    fontSize:     0,
                    border:       "none",
                    outline:      "none",
                    transition:   "transform .1s",
                    position:     "relative",
                  };

                  if (isAisle) {
                    seatStyle = { ...seatStyle, background: "transparent", visibility: "hidden" };
                  } else if (isBlocked) {
                    seatStyle = { ...seatStyle, background: "#1f2028", border: "1.5px solid #2a2a38", opacity: 0.5 };
                  } else if (isBooked) {
                    seatStyle = { ...seatStyle, background: col + "30", border: `1.5px solid ${col}45`, opacity: 0.4 };
                  } else if (isSel) {
                    seatStyle = { ...seatStyle, background: col, border: `2px solid #fff`, cursor: "pointer", transform: "scale(1.1)" };
                  } else {
                    seatStyle = { ...seatStyle, background: col + "28", border: `1.5px solid ${col}70`, cursor: "pointer" };
                  }

                  return (
                    <span key={si} style={{ display: "contents" }}>
                      {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                      <button
                        style={seatStyle}
                        disabled={isAisle || isBlocked || isBooked}
                        onClick={() => !isAisle && !isBlocked && !isBooked && onToggle(fullKey, zone, r, c, levelKey)}
                        onMouseEnter={() => !isAisle && !isBlocked && setHoveredKey(fullKey)}
                        onMouseLeave={() => setHoveredKey(null)}
                        title={!isAisle && zone ? `${getRowLabel(r)}${c + 1} · ${zone.name} · ₹${Math.round(zone.basePrice * (zone.priceMultiplier || 1))}` : ""}
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
  );
};

/**
 * Full cinema booking modal — screen bar, ground + balcony floors,
 * zone legend, seat selection, total price panel.
 */
const CinemaBookingPreview = ({ theater, onClose }) => {
  const [selected, setSelected] = useState(new Set());

  // Flatten all zones from all screens
  // const allZones = useMemo(() => {
  //   if (!theater?.screens) return [];
  //   const seen = new Set();
  //   const result = [];
  //   theater.screens.forEach((screen) => {
  //     (screen.zones || []).forEach((z) => {
  //       if (!seen.has(z.id)) { seen.add(z.id); result.push(z); }
  //     });
  //   });
  //   return result;
  // }, [theater]);

  const allZones = useMemo(() => {
    if (!theater?.screens) return [];
    const seen = new Set();
    const result = [];
    theater.screens.forEach((screen) => {
      (screen.zones || []).forEach((z) => {
        const baseId = z.id?.replace(/_ground$|_balcony$/, "") || z.id;
        if (!seen.has(baseId)) {
          seen.add(baseId);
          result.push({ ...z, id: baseId });
        }
      });
    });
    return result;
  }, [theater]);

  // Build level data from screens

 const buildLevelData = useCallback((levelName) => {
    if (!theater?.screens) return null;
    const screen = theater.screens.find((s) =>
      levelName === "balcony"
        ? s.position === "top" || s.name?.toLowerCase().includes("balcony")
        : s.position !== "top" && !s.name?.toLowerCase().includes("balcony")
    );
    if (!screen || !screen.zones?.length) return null;

    const meta = theater.layoutMeta || {};
    const isBalcony = levelName === "balcony";

    const seats = {};
    (screen.zones || []).forEach((z) => {
      const baseId = z.id?.replace(/_ground$|_balcony$/, "") || z.id;
      (z.rows || []).forEach((row) => {
        (row.seats || []).forEach((seat) => {
          const r = (seat.rowNumber || 1) - 1;
          const c = (seat.columnNumber || 1) - 1;
          seats[`${r}-${c}`] = {
            zone:        baseId,
            isAvailable: seat.isAvailable,
            isBooked:    seat.isBooked,
          };
        });
      });
    });

    const rows = screen.totalRows    || (isBalcony ? meta.balconyRows : meta.groundRows) || 0;
    const cols = screen.totalColumns || (isBalcony ? meta.balconyCols : meta.groundCols) || 0;

    return {
      rows,
      cols,
      seats,
      aisleCols: (isBalcony ? meta.balconyAisleCols : meta.aisleCols)  || [],
      aisleRows:  (isBalcony ? meta.balconyAisleRows : meta.aisleRows)  || [],
    };
  }, [theater]);

  // const buildLevelData = useCallback((levelName) => {
  //   if (!theater?.screens) return null;
  //   const screen = theater.screens.find((s) =>
  //     levelName === "balcony"
  //       ? s.position === "top" || s.name?.toLowerCase().includes("balcony")
  //       : s.position !== "top" && !s.name?.toLowerCase().includes("balcony")
  //   );
  //   if (!screen || !screen.zones?.length) return null;

  //   // Build a flat seat map from all zones' rows
  //   const seats = {};
  //   (screen.zones || []).forEach((zone) => {
  //     (zone.rows || []).forEach((row) => {
  //       (row.seats || []).forEach((seat) => {
  //         const r = (seat.rowNumber || 1) - 1;
  //         const c = (seat.columnNumber || 1) - 1;
  //         seats[`${r}-${c}`] = {
  //           zone:        zone.id,
  //           booked:      !seat.isAvailable || seat.isBooked,
  //           isAvailable: seat.isAvailable,
  //           isBooked:    seat.isBooked,
  //         };
  //       });
  //     });
  //   });

  //   const rows = screen.totalRows    || Math.max(...Object.keys(seats).map((k) => parseInt(k) + 1), 0);
  //   const cols = screen.totalColumns || Math.max(...Object.keys(seats).map((k) => parseInt(k.split("-")[1]) + 1), 0);

  //   const meta = theater.layoutMeta || {};
  //   const isBalcony = levelName === "balcony";
  //   return {
  //     rows,
  //     cols,
  //     seats,
  //     aisleCols: (isBalcony ? meta.balconyAisleCols : meta.aisleCols)  || [],
  //     aisleRows:  (isBalcony ? meta.balconyAisleRows : meta.aisleRows)  || [],
  //   };
  // }, [theater]);

//   const buildLevelData = useCallback((levelName) => {
//   if (!theater?.screens) return null;
//   const screen = theater.screens.find((s) =>
//     levelName === "balcony"
//       ? s.position === "top" || s.name?.toLowerCase().includes("balcony")
//       : s.position !== "top" && !s.name?.toLowerCase().includes("balcony")
//   );
//   if (!screen || !screen.zones?.length) return null;

//   const meta = theater.layoutMeta || {};
//   const isBalcony = levelName === "balcony";

//   const rows = screen.totalRows    || (isBalcony ? meta.balconyRows : meta.groundRows) || 0;
//   const cols = screen.totalColumns || (isBalcony ? meta.balconyCols : meta.groundCols) || 0;

//   const seats = {};

//   (screen.zones || []).forEach((z) => {
//     if (z.noSeat) {
//       // ── No-seat zone: paint every cell in the grid with this zone id
//       // so buildRowSegments can detect and render the label block.
//       // We use ALL rows/cols of the screen since we have no per-row data.
//       for (let r = 0; r < rows; r++) {
//         for (let c = 0; c < cols; c++) {
//           // Only fill cells not already claimed by a real zone
//           const k = `${r}-${c}`;
//           if (!seats[k]) {
//             seats[k] = { zone: z.id, noSeat: true };
//           }
//         }
//       }
//     } else {
//       // ── Normal zone: map from saved seat positions
//       (z.rows || []).forEach((row) => {
//         (row.seats || []).forEach((seat) => {
//           const r = (seat.rowNumber || 1) - 1;
//           const c = (seat.columnNumber || 1) - 1;
//           seats[`${r}-${c}`] = {
//             zone:        z.id,
//             isAvailable: seat.isAvailable,
//             isBooked:    seat.isBooked,
//           };
//         });
//       });
//     }
//   });

//   return {
//     rows,
//     cols,
//     seats,
//     aisleCols: (isBalcony ? meta.balconyAisleCols : meta.aisleCols)  || [],
//     aisleRows:  (isBalcony ? meta.balconyAisleRows : meta.aisleRows)  || [],
//   };
// }, [theater]);

  const groundData  = buildLevelData("ground");
  const balconyData = buildLevelData("balcony");

  const toggleSeat = useCallback((fullKey, zone) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(fullKey) ? next.delete(fullKey) : next.add(fullKey);
      return next;
    });
  }, []);

  // Compute selected seats info
  const selectionInfo = useMemo(() => {
    let total = 0;
    const labels = [];
    selected.forEach((fk) => {
      const [level, k] = fk.split("::");
      const ld = level === "balcony" ? balconyData : groundData;
      if (!ld) return;
      const sd = ld.seats[k];
      const z  = sd?.zone ? allZones.find((z) => z.id === sd.zone) : null;
      const p  = z ? Math.round(z.basePrice * (z.priceMultiplier || 1)) : 150;
      total += p;
      const [r, c] = k.split("-").map(Number);
      labels.push(`${String.fromCharCode(65 + r)}${c + 1}`);
    });
    return { total, labels, count: selected.size };
  }, [selected, groundData, balconyData, allZones]);

  const hasLayout = groundData || balconyData;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.92)", backdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "#0f0f16", borderBottom: "1px solid #1f1f2e",
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "linear-gradient(135deg,#1a1a2e,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GiTheaterCurtains style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{theater?.name}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                {theater?.location}, {theater?.city} &nbsp;·&nbsp;
                {theater?.screens?.length || 0} screen(s) &nbsp;·&nbsp;
                {theater?.totalSeats || 0} seats
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Legend */}
          {[
            { color: "#4a9edd28", border: "#4a9edd70", label: "Available" },
            // { color: "#e2c97e",   border: "#fff",      label: "Selected"  },
            { color: "#1f2028",   border: "#2a2a38",   label: "Taken"     },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9ca3af" }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, border: `1.5px solid ${l.border}` }} />
              {l.label}
            </div>
          ))}
          <button
            onClick={onClose}
            style={{
              marginLeft: 8, width: 34, height: 34, borderRadius: 8,
              background: "#1f1f2e", border: "1px solid #2a2a38",
              color: "#9ca3af", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>
      </div>

      {/* ── Scrollable seat area ── */}
      <div style={{ flex: 1, overflowY: "auto", background: "#0f0f16", padding: "0 24px 20px" }}>

        {/* Screen bar */}
        <div style={{ textAlign: "center", padding: "18px 0 10px" }}>
          <div style={{
            height: 3, maxWidth: 500, margin: "0 auto 6px",
            background: "linear-gradient(90deg,transparent,#e2c97e,transparent)",
            borderRadius: 2,
          }} />
          <div style={{ fontSize: 10, color: "#e2c97e", letterSpacing: "3px", fontWeight: 700 }}>
            SCREEN — ALL EYES THIS WAY
          </div>
        </div>

        {!hasLayout ? (
          <div style={{ textAlign: "center", paddingTop: 80, color: "#6b7280" }}>
            <MdEventSeat style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#4b5563" }}>No seat layout configured</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>This theater has no seat data stored yet.</div>
          </div>
        ) : (
          <>
            {/* Ground floor */}
            {groundData && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: "#6b7280",
                    textTransform: "uppercase", letterSpacing: ".1em",
                    padding: "3px 14px", background: "#1a1a24",
                    borderRadius: 20, border: "1px solid #2a2a38",
                  }}>Ground Floor</span>
                </div>
                <CinemaSeatFloor
                  levelKey="ground"
                  zones={allZones}
                  seats={groundData.seats}
                  rows={groundData.rows}
                  cols={groundData.cols}
                  aisleCols={groundData.aisleCols}
                  aisleRows={groundData.aisleRows}
                  selected={selected}
                  onToggle={toggleSeat}
                />
              </div>
            )}

            {/* Balcony */}
            {balconyData && (
              <>
                <div style={{
                  maxWidth: 500, margin: "0 auto 16px",
                  borderTop: "1px dashed #2a2a38",
                  position: "relative", textAlign: "center",
                }}>
                  <span style={{
                    position: "absolute", top: -10, left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 10, fontWeight: 700, color: "#6b7280",
                    textTransform: "uppercase", letterSpacing: ".1em",
                    padding: "3px 14px", background: "#0f0f16",
                    borderRadius: 20, border: "1px solid #2a2a38",
                  }}>Balcony</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <CinemaSeatFloor
                    levelKey="balcony"
                    zones={allZones}
                    seats={balconyData.seats}
                    rows={balconyData.rows}
                    cols={balconyData.cols}
                    aisleCols={balconyData.aisleCols}
                    aisleRows={balconyData.aisleRows}
                    selected={selected}
                    onToggle={toggleSeat}
                  />
                </div>
              </>
            )}

            {/* Zone color legend */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8,
              justifyContent: "center", marginTop: 24,
            }}>
              {allZones.map((z) => {
                const price = Math.round((z.basePrice || 0) * (z.priceMultiplier || 1));
                return (
                  <div key={z.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: z.color + "18",
                    border: `1px solid ${z.color}44`,
                    color: z.color,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: z.color, display: "inline-block",
                    }} />
                    {z.name}
                    {z.noSeat ? (
                      <>
                        &nbsp;
                        <span style={{ fontSize: 9, fontWeight: 700, background: z.color+"33", padding: "1px 5px", borderRadius: 3 }}>
                          {z.label || "AREA"}
                        </span>
                      </>
                    ) : (
                      <>
                        &nbsp;
                        <strong style={{ color: "#fff" }}>
                          {price === 0 ? "FREE" : `₹${price}`}
                        </strong>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Bottom booking panel ── */}
      <div style={{
        background: "#0f0f16", borderTop: "1px solid #1f1f2e",
        padding: "14px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em" }}>
            Selected Seats
          </div>
          <div style={{ fontSize: 13, color: "#e5e7eb" }}>
            {selectionInfo.count === 0 ? (
              <span style={{ color: "#4b5563" }}>Click seats above to select</span>
            ) : (
              <>
                <span style={{ color: "#e2c97e", fontWeight: 700 }}>
                  {selectionInfo.labels.slice(0, 6).join(", ")}
                  {selectionInfo.labels.length > 6 ? ` +${selectionInfo.labels.length - 6} more` : ""}
                </span>
                &nbsp;·&nbsp;
                <span style={{ color: "#fff", fontWeight: 700 }}>₹{selectionInfo.total.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setSelected(new Set())}
            disabled={selectionInfo.count === 0}
            style={{
              padding: "10px 20px", borderRadius: 8,
              border: "1px solid #2a2a38", background: "#1a1a24",
              color: "#9ca3af", cursor: selectionInfo.count === 0 ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 600,
              opacity: selectionInfo.count === 0 ? 0.5 : 1,
            }}
          >
            Clear
          </button>
          {/* <button
            disabled={selectionInfo.count === 0}
            style={{
              padding: "10px 28px", borderRadius: 8,
              border: "none",
              background: selectionInfo.count === 0 ? "#2a2a38" : "#e2c97e",
              color: selectionInfo.count === 0 ? "#6b7280" : "#0f0f16",
              cursor: selectionInfo.count === 0 ? "not-allowed" : "pointer",
              fontSize: 14, fontWeight: 700, transition: "opacity .15s",
            }}
            onClick={() => {
              if (selectionInfo.count > 0) {
                toast.success(`${selectionInfo.count} seat(s) · ₹${selectionInfo.total} — Proceed to payment`);
              }
            }}
          >
            {selectionInfo.count > 0
              ? `Book ${selectionInfo.count} Seat${selectionInfo.count > 1 ? "s" : ""} · ₹${selectionInfo.total.toLocaleString()}`
              : "Select Seats"}
          </button> */}
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// TABLE HEADER
// ─────────────────────────────────────────────────────────────────────────────

const TableHeader = ({ column, label, sortField, sortOrder, onSort }) => {
  const isActive = sortField === column;
  return (
    <th
      onClick={() => onSort(column)}
      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-all select-none"
      style={{ color: "var(--foreground)", opacity: 0.8 }}
    >
      <div className="flex items-center gap-2">
        {label}
        <span className="inline-flex">
          {isActive
            ? sortOrder === "asc" ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />
            : <FaSort className="opacity-40" />}
        </span>
      </div>
    </th>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmModal = ({ isOpen, onClose, onConfirm, icon, color, title, body, confirmLabel }) => {
  if (!isOpen) return null;
  const colorMap = { red: "#ef4444", green: "#22c55e", yellow: "#eab308" };
  const themeColor = colorMap[color] || colorMap.red;
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${themeColor}20`, border: `1px solid ${themeColor}40`, color: themeColor }}>
          {icon}
        </div>
        <h2 className="text-xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>{title}</h2>
        <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>{body}</p>
        <div className="flex gap-2.5">
          <button onClick={onConfirm} className="flex-1 rounded-xl py-2.5 text-white font-bold text-sm transition-all hover:scale-105"
            style={{ background: themeColor }}>{confirmLabel}</button>
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 font-bold text-sm transition-all"
            style={{ border: "1px solid var(--card-border)", color: "var(--foreground)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function TheatersPage() {
  const router       = useRouter();
  const queryClient  = useQueryClient();

  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter,   setCityFilter]   = useState("ALL");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField,    setSortField]    = useState("name");
  const [sortOrder,    setSortOrder]    = useState("asc");
  const [deletingTheater, setDeletingTheater] = useState(null);
  const [statusTheater,   setStatusTheater]   = useState(null);
  const [statusAction,    setStatusAction]    = useState("");

  // Cinema preview state
  const [previewTheater,     setPreviewTheater]     = useState(null);   // full theater object
  const [previewLoading,     setPreviewLoading]     = useState(false);
  const [showCinemaPreview,  setShowCinemaPreview]  = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["allTheatersAdmin"],
    queryFn:  getAllTheatersAdmin,
  });
  const theaters = data?.data || [];

  const cities = useMemo(
    () => ["ALL", ...new Set(theaters.map((t) => t.city).filter(Boolean))].sort(),
    [theaters]
  );

  const calculateTotalSeats = useCallback((theater) => {
    if (theater.totalSeats) return theater.totalSeats;
    if (theater.screens?.length) {
      return theater.screens.reduce((sum, screen) => {
        if (screen.totalSeatsInScreen) return sum + screen.totalSeatsInScreen;
        if (screen.zones?.length) {
          return sum + screen.zones.reduce((z, zone) => z + (zone.totalSeats || 0), 0);
        }
        return sum;
      }, 0);
    }
    return 0;
  }, []);

  const filteredTheaters = useMemo(() => {
    let result = theaters.filter((t) => {
      const q = searchTerm.toLowerCase();
      return (
        (!q || [t.name, t.location, t.city, t.contactNumber].some((v) => v?.toLowerCase().includes(q))) &&
        (statusFilter === "ALL" || t.status === statusFilter) &&
        (cityFilter === "ALL" || t.city === cityFilter)
      );
    });

    result = [...result].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "totalSeats") { aVal = calculateTotalSeats(a); bVal = calculateTotalSeats(b); }
      if (sortField === "screens")    { aVal = a.screens?.length || 0; bVal = b.screens?.length || 0; }
      if (typeof aVal === "string") return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [theaters, searchTerm, statusFilter, cityFilter, sortField, sortOrder, calculateTotalSeats]);

  const totalItems        = filteredTheaters.length;
  const totalPages        = Math.ceil(totalItems / itemsPerPage);
  const startIndex        = (currentPage - 1) * itemsPerPage;
  const paginatedTheaters = filteredTheaters.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, cityFilter]);

  const stats = useMemo(() => ({
    total:    theaters.length,
    active:   theaters.filter((t) => t.status === "ACTIVE").length,
    inactive: theaters.filter((t) => t.status === "INACTIVE").length,
    screens:  theaters.reduce((s, t) => s + (t.screens?.length || 0), 0),
    cities:   new Set(theaters.map((t) => t.city)).size,
  }), [theaters]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ── Open cinema preview — fetch full theater detail ──
  const openCinemaPreview = useCallback(async (theaterId) => {
    setPreviewLoading(true);
    setShowCinemaPreview(true);
    try {
      const res = await getTheaterByIdAdmin(theaterId);
      setPreviewTheater(res.data);
    } catch (err) {
      toast.error("Failed to load theater details");
      setShowCinemaPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const closeCinemaPreview = useCallback(() => {
    setShowCinemaPreview(false);
    setPreviewTheater(null);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: deleteTheaterAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(["allTheatersAdmin"]);
      toast.success("Theater deleted successfully!");
      setDeletingTheater(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, data }) => updateTheaterAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["allTheatersAdmin"]);
      toast.success(`Theater ${statusAction === "activate" ? "activated" : "deactivated"} successfully!`);
      setStatusTheater(null);
      setStatusAction("");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });

  const hasFilters  = searchTerm || statusFilter !== "ALL" || cityFilter !== "ALL";
  const clearFilters = useCallback(() => { setSearchTerm(""); setStatusFilter("ALL"); setCityFilter("ALL"); }, []);

  // ── Pagination ──
  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = [];
      const max   = 5;
      if (totalPages <= max) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("..."); pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1); pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1); pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("..."); pages.push(totalPages);
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t px-4"
        style={{ borderColor: "var(--card-border)" }}>
        <div className="text-sm text-foreground/50">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} theaters
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
            <FaChevronLeft className="text-xs" />
          </button>
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={idx} className="px-2 text-foreground/40">...</span>
            ) : (
              <button key={idx} onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${currentPage === page ? "bg-blue-500 text-white shadow-lg" : ""}`}
                style={currentPage !== page ? { background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" } : {}}>
                {page}
              </button>
            )
          )}
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
            <FaChevronRight className="text-xs" />
          </button>
        </div>
        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="rounded-lg px-3 py-1.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />

      {/* ── Page header ── */}
      <div className="relative border-b shadow-lg rounded-xl mb-8"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <GiTheaterCurtains className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: "var(--foreground)" }}>Theater Management</h1>
                <p className="text-xs text-foreground/50">Manage and monitor all theaters</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/theaters/add")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
              <FaPlus className="text-xs" /> Add Theater
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { value: stats.total,    label: "Total Theaters", color: "text-blue-500"   },
          { value: stats.active,   label: "Active",         color: "text-green-500"  },
          { value: stats.inactive, label: "Inactive",       color: "text-red-500"    },
          { value: stats.screens,  label: "Total Screens",  color: "text-purple-500" },
          { value: stats.cities,   label: "Cities",         color: "text-yellow-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs opacity-60">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="rounded-xl p-5 mb-6 flex flex-wrap gap-3 items-center"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="flex-1 min-w-[200px] relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40" />
          <input
            type="text"
            placeholder="Search by name, city, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl py-2 px-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-xl py-2 px-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}>
          {cities.map((c) => <option key={c} value={c}>{c === "ALL" ? "All Cities" : c}</option>)}
        </select>
        {hasFilters && (
          <button onClick={clearFilters}
            className="px-3 py-2 rounded-xl text-red-500 text-xs flex items-center gap-1 hover:bg-red-500/10 transition-all">
            <FaTimes className="text-xs" /> Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: "var(--background)" }}>
              <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                <TableHeader column="name"          label="Theater Name" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="location"      label="Location"     sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="city"          label="City"         sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="contactNumber" label="Contact"      sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="screens"       label="Screens"      sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <TableHeader column="totalSeats"    label="Seats"        sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Amenities</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <FaSpinner className="animate-spin text-2xl mx-auto opacity-40" />
                  </td>
                </tr>
              ) : paginatedTheaters.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <div className="text-lg opacity-40">No theaters found</div>
                  </td>
                </tr>
              ) : (
                paginatedTheaters.map((theater) => {
                  const totalSeats    = calculateTotalSeats(theater);
                  const amenitiesCount = AMENITIES.filter((a) => theater[a.key]).length;

                  return (
                    <tr key={theater._id} className="border-b transition-all hover:bg-white/5"
                      style={{ borderColor: "var(--card-border)" }}>

                      <td className="px-4 py-3">
                        <div className="font-semibold">{theater.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm opacity-70">{theater.location || "—"}</td>
                      <td className="px-4 py-3 text-sm opacity-70">{theater.city || "—"}</td>
                      <td className="px-4 py-3 text-sm opacity-70">{theater.contactNumber || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-bold"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                          {theater.screens?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-bold"
                          style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                          {totalSeats}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {amenitiesCount > 0 ? (
                            <>
                              {AMENITIES.filter((a) => theater[a.key]).slice(0, 2).map((a) => (
                                <span key={a.key} className="text-xs px-1.5 py-0.5 rounded"
                                  style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                                  {a.name}
                                </span>
                              ))}
                              {amenitiesCount > 2 && <span className="text-xs opacity-40">+{amenitiesCount - 2}</span>}
                            </>
                          ) : <span className="text-xs opacity-40">None</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${theater.status === "ACTIVE" ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-400"}`}>
                          {theater.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ── Action buttons ── */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">

                          {/* 🎬 Cinema seat preview — the main new button */}
                          <button
                            onClick={() => openCinemaPreview(theater._id)}
                            className="p-1.5 rounded-lg transition-all hover:scale-110 group relative"
                            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}
                            title="Preview Seat Layout"
                          >
                            <MdEventSeat className="text-purple-500 text-sm" />
                            {/* tooltip */}
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Preview Layout
                            </span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => router.push(`/admin/theaters/edit/${theater._id}`)}
                            className="p-1.5 rounded-lg hover:bg-yellow-500/10 transition-all"
                            title="Edit Theater"
                          >
                            <FaEdit className="text-yellow-500 text-sm" />
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            onClick={() => {
                              setStatusTheater(theater);
                              setStatusAction(theater.status === "ACTIVE" ? "deactivate" : "activate");
                            }}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 transition-all"
                            title={theater.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          >
                            {theater.status === "ACTIVE"
                              ? <FaTimesCircle className="text-red-500 text-sm" />
                              : <FaCheckCircle className="text-green-500 text-sm" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingTheater(theater)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                            title="Delete Theater"
                          >
                            <FaTrash className="text-red-500 text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalItems > 0 && <PaginationControls />}
      </div>

      {/* ── Delete confirm ── */}
      <ConfirmModal
        isOpen={!!deletingTheater}
        onClose={() => setDeletingTheater(null)}
        onConfirm={() => deletingTheater && deleteMutation.mutate(deletingTheater._id)}
        icon={<FaTrash className="text-red-500 text-xl" />}
        color="red"
        title="Delete Theater"
        body={<>Delete <strong>{deletingTheater?.name}</strong>? This action cannot be undone.</>}
        confirmLabel="Delete"
      />

      {/* ── Status confirm ── */}
      <ConfirmModal
        isOpen={!!statusTheater}
        onClose={() => { setStatusTheater(null); setStatusAction(""); }}
        onConfirm={() =>
          statusTheater &&
          statusMutation.mutate({ id: statusTheater._id, data: { status: statusAction === "activate" ? "ACTIVE" : "INACTIVE" } })
        }
        icon={statusAction === "activate"
          ? <FaCheckCircle className="text-green-500 text-xl" />
          : <FaTimesCircle className="text-yellow-500 text-xl" />}
        color={statusAction === "activate" ? "green" : "yellow"}
        title={statusAction === "activate" ? "Activate Theater" : "Deactivate Theater"}
        body={<>Are you sure you want to {statusAction} <strong>{statusTheater?.name}</strong>?</>}
        confirmLabel={statusAction === "activate" ? "Activate" : "Deactivate"}
      />

      {/* ── Cinema Booking Preview Modal ── */}
      {showCinemaPreview && (
        previewLoading ? (
          /* Loading overlay */
          <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}>
            <div className="flex flex-col items-center gap-4">
              <FaSpinner className="animate-spin text-4xl text-purple-400" />
              <p className="text-white text-sm font-semibold">Loading seat layout…</p>
            </div>
          </div>
        ) : previewTheater ? (
          <CinemaBookingPreview
            theater={previewTheater}
            onClose={closeCinemaPreview}
          />
        ) : null
      )}
    </div>
  );
}