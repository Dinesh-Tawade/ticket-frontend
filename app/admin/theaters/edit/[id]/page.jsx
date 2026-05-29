

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  FaPlus, FaTrash, FaBuilding, FaMapMarkerAlt, FaPhone, FaCity, FaFlag,
  FaCouch, FaWifi, FaParking, FaCoffee, FaAccessibleIcon, FaArrowLeft,
  FaCheckCircle, FaUserTie, FaChevronDown, FaEye, FaEdit, FaSave, FaTimes
} from "react-icons/fa";
import { MdScreenShare, MdTheaters, MdScreenRotation } from "react-icons/md";
import { updateTheaterAdmin, getAllUsers, getTheaterByIdAdmin } from "@/app/services/adminCommunication";

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT BUILDER CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const ZONE_PALETTE = [
  "#c0392b","#2980b9","#27ae60","#8e44ad",
  "#d4ac0d","#1abc9c","#e67e22","#e91e63",
  "#00bcd4","#ff5722",
];

const DEFAULT_ZONES = [
  { id: "z1", name: "44 ARMD",         color: "#c0392b", noSeat: false, label: "", basePrice: 150 },
  { id: "z2", name: "26 MECH",         color: "#2980b9", noSeat: false, label: "", basePrice: 150 },
  { id: "z3", name: "19 MECH",         color: "#27ae60", noSeat: false, label: "", basePrice: 150 },
  { id: "z4", name: "677(I) & 689(I)", color: "#8e44ad", noSeat: false, label: "", basePrice: 150 },
  { id: "z5", name: "VIP / CAMP",      color: "#d4ac0d", noSeat: false, label: "", basePrice: 150 },
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
// RECONSTRUCT LAYOUT DATA FROM SAVED THEATER SCREENS
// This is the key function that rebuilds the builder state from the DB response.
// ─────────────────────────────────────────────────────────────────────────────

function reconstructLayoutFromTheater(theater) {
  if (!theater?.screens?.length) return null;

  const meta = theater.layoutMeta || {};

  // Rebuild zones from all screen zones, deduplicating by zone id prefix (e.g. "z1_ground" → "z1")
  const zonesMap = new Map();
  theater.screens.forEach((screen) => {
    (screen.zones || []).forEach((z) => {
      // Zone ids were stored as "z1_ground" or "z1_balcony" — strip the suffix
      const baseId = z.id?.replace(/_ground$|_balcony$/, "") || z.id;
      if (!zonesMap.has(baseId)) {
        zonesMap.set(baseId, {
          id:        baseId,
          name:      z.name,
          color:     z.color     || "#c0392b",
          basePrice: z.basePrice ?? 0,
          noSeat:    z.noSeat    || false,
          label:     z.label     || "",
        });
      }
    });
  });
  const zones = zonesMap.size > 0 ? Array.from(zonesMap.values()) : DEFAULT_ZONES;

  // Helper: rebuild a flat seat map for one screen
  const buildSeatMap = (screen) => {
    const seats = {};
    (screen.zones || []).forEach((z) => {
      const baseId = z.id?.replace(/_ground$|_balcony$/, "") || z.id;
      (z.rows || []).forEach((row) => {
        (row.seats || []).forEach((seat) => {
          const r = (seat.rowNumber || 1) - 1;
          const c = (seat.columnNumber || 1) - 1;
          seats[seatKey(r, c)] = { zone: baseId };
        });
      });
    });
    return seats;
  };

  // Ground screen = position !== "top" and name doesn't include "balcony"
  const groundScreen  = theater.screens.find(
    (s) => s.position !== "top" && !s.name?.toLowerCase().includes("balcony")
  );
  const balconyScreen = theater.screens.find(
    (s) => s.position === "top" || s.name?.toLowerCase().includes("balcony")
  );

  const groundSeats  = groundScreen  ? buildSeatMap(groundScreen)  : {};
  const balconySeats = balconyScreen ? buildSeatMap(balconyScreen) : {};

  const groundRows  = groundScreen?.totalRows    || meta.groundRows    || 13;
  const groundCols  = groundScreen?.totalColumns || meta.groundCols    || 14;
  const balconyRows = balconyScreen?.totalRows    || meta.balconyRows   || 6;
  const balconyCols = balconyScreen?.totalColumns || meta.balconyCols   || 14;

  return {
    zones,
    rowNaming: meta.rowNaming || "alpha",
    levels: {
      ground: {
        rows:      groundRows,
        cols:      groundCols,
        generated: !!groundScreen || !!meta.groundGenerated,
        seats:     groundSeats,
        aisleCols: meta.aisleCols        || [],
        aisleRows:  meta.aisleRows         || [],
      },
      balcony: {
        rows:      balconyRows,
        cols:      balconyCols,
        generated: !!balconyScreen || !!meta.balconyGenerated,
        seats:     balconySeats,
        aisleCols: meta.balconyAisleCols || [],
        aisleRows:  meta.balconyAisleRows  || [],
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT BUILDER SUB-COMPONENTS (unchanged from original)
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

function ZoneColorItem({ zone, isActive, seatCount, onSelect, onDelete, onToggleNoSeat, onLabelChange, onColorChange, onPriceChange }) {
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
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
          <span style={{ fontSize:11, color:"#6b7280", flex:1 }}>Price (₹)</span>
          <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:"#9ca3af", cursor:"pointer" }}
            onClick={e=>e.stopPropagation()}>
            <input
              type="checkbox"
              checked={(zone.basePrice ?? 150) === 0}
              onChange={e => onPriceChange(e.target.checked ? 0 : 150)}
              onClick={e => e.stopPropagation()}
              style={{ accentColor:"#3b82f6", width:11, height:11 }}
            />
            Free
          </label>
          <input
            type="number" min={0}
            value={zone.basePrice ?? 150}
            disabled={(zone.basePrice ?? 150) === 0}
            onChange={e => onPriceChange(+e.target.value)}
            onClick={e => e.stopPropagation()}
            style={{
              width:64, fontSize:11, padding:"3px 6px",
              border:"1px solid #e5e7eb", borderRadius:5,
              background: (zone.basePrice ?? 150) === 0 ? "#f3f4f6" : "#fafafa",
              color: (zone.basePrice ?? 150) === 0 ? "#9ca3af" : "#1a1a2e",
              outline:"none",
              opacity: (zone.basePrice ?? 150) === 0 ? 0.5 : 1,
            }}
          />
        </div>
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
  else if (seatData?.aisle) { bg="transparent"; border="transparent"; opacity:0; cursor="default"; }
  else if (zone) { bg=zone.color; border=zone.color; }
  else { bg="#e5e7eb"; border="#d1d5db"; }
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
// THEATER LAYOUT BUILDER
// Key change: accepts `initialData` and bootstraps all state from it on mount.
// ─────────────────────────────────────────────────────────────────────────────

function TheaterLayoutBuilder({ onLayoutChange, initialData }) {
  // ── Initialise from prop, but only once (ref guards re-hydration) ──
  const hydrated = useRef(false);

  const [rowNaming,    setRowNaming]    = useState("alpha");
  const [zones,        setZones]        = useState(DEFAULT_ZONES);
  const [tool,         setTool]         = useState("paint");
  const [activeZone,   setActiveZone]   = useState("z1");
  const [currentLevel, setCurrentLevel] = useState("ground");

  const [levels, setLevels] = useState({
    ground:  { rows:13, cols:14, generated:false, seats:{}, aisleCols:[], aisleRows:[] },
    balcony: { rows:6,  cols:14, generated:false, seats:{}, aisleCols:[], aisleRows:[] },
  });

  const [groundRows,  setGroundRows]  = useState(13);
  const [groundCols,  setGroundCols]  = useState(14);
  const [balconyRows, setBalconyRows] = useState(6);
  const [balconyCols, setBalconyCols] = useState(14);

  const [newAisleCol,     setNewAisleCol]      = useState("");
  const [newAisleColGap,  setNewAisleColGap]   = useState(14);
  const [newAisleRow,     setNewAisleRow]      = useState("");
  const [newAisleRowGap,  setNewAisleRowGap]   = useState(24);

  const [bToast,      setBToast]      = useState({ msg:"", visible:false });
  const [newZoneName, setNewZoneName] = useState("");
  const [showAddZone, setShowAddZone] = useState(false);
  const paintingRef = useRef(false);

  // ── Hydrate builder state when initialData arrives ──
  useEffect(() => {
    if (!initialData || hydrated.current) return;
    hydrated.current = true;

    if (initialData.zones?.length)     setZones(initialData.zones);
    if (initialData.rowNaming)         setRowNaming(initialData.rowNaming);
    if (initialData.levels) {
      const g = initialData.levels.ground;
      const b = initialData.levels.balcony;
      if (g) { setGroundRows(g.rows || 13); setGroundCols(g.cols || 14); }
      if (b) { setBalconyRows(b.rows || 6);  setBalconyCols(b.cols || 14); }
      setLevels(initialData.levels);
    }

    setActiveZone(initialData.zones?.[0]?.id || "z1");
  }, [initialData]);

  const showBToast = useCallback(msg => {
    setBToast({ msg, visible:true });
    setTimeout(() => setBToast(t=>({...t,visible:false})), 2200);
  }, []);

  const currentRows    = currentLevel==="ground" ? groundRows  : balconyRows;
  const currentCols    = currentLevel==="ground" ? groundCols  : balconyCols;
  const setCurrentRows = currentLevel==="ground" ? setGroundRows  : setBalconyRows;
  const setCurrentCols = currentLevel==="ground" ? setGroundCols  : setBalconyCols;

  const getLevelData = (lv=currentLevel) => levels[lv];
  const updateLevel  = (lv, patch) => setLevels(prev=>({...prev,[lv]:{...prev[lv],...patch}}));
  const updateSeats  = (lv, fn)    => setLevels(prev=>({...prev,[lv]:{...prev[lv],seats:fn(prev[lv].seats)}}));

  // Bubble changes to parent
  useEffect(() => {
    onLayoutChange?.({ zones, levels, rowNaming });
  }, [zones, levels, rowNaming]);

  const generateGrid = () => {
    updateLevel(currentLevel, { rows:currentRows, cols:currentCols, generated:true, seats:{} });
    showBToast(`Layout: ${currentRows}×${currentCols} (${currentLevel})`);
  };

  const addAisleCol = () => {
    const val = parseInt(newAisleCol);
    if (!val || val<1 || val>=currentCols) { showBToast("Enter valid col"); return; }
    updateLevel(currentLevel, {
      aisleCols: [...(levels[currentLevel].aisleCols||[]).filter(a=>a.idx!==val-1), {idx:val-1,gap:newAisleColGap||14}].sort((a,b)=>a.idx-b.idx)
    });
    setNewAisleCol("");
  };
  const addAisleRow = () => {
    const val = parseInt(newAisleRow);
    if (!val || val<1 || val>=currentRows) { showBToast("Enter valid row"); return; }
    updateLevel(currentLevel, {
      aisleRows: [...(levels[currentLevel].aisleRows||[]).filter(a=>a.idx!==val-1), {idx:val-1,gap:newAisleRowGap||24}].sort((a,b)=>a.idx-b.idx)
    });
    setNewAisleRow("");
  };

  const applyTool = useCallback((r, c) => {
    const k = seatKey(r, c);
    updateSeats(currentLevel, prev=>{
      const next = {...prev};
      if (tool==="paint" && activeZone) next[k] = { zone:activeZone };
      else if (tool==="block")          next[k] = { blocked:true };
      else if (tool==="aisle")          next[k] = { aisle:true };
      else if (tool==="erase")          delete next[k];
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
    const id    = "z"+Date.now();
    const color = ZONE_PALETTE[zones.length % ZONE_PALETTE.length];
    setZones(prev=>[...prev,{id,name:newZoneName.trim(),color,noSeat:false,label:"",basePrice:150}]);
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
  const aisleCols = levelData.aisleCols || [];
  const aisleRows = levelData.aisleRows  || [];
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

  const inp   = { padding:"6px 10px", fontSize:12, border:"1px solid #e5e7eb", borderRadius:6, background:"#fafafa", color:"#1a1a2e", outline:"none", boxSizing:"border-box" };
  const inpSm = { ...inp, width:50, padding:"5px 7px" };

  return (
    <div style={{ display:"flex", height:620, fontFamily:"'Segoe UI',system-ui,sans-serif", border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", background:"#f9fafb" }}>

      {/* ── Sidebar ── */}
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
              onColorChange={val=>updateZone(z.id,{color:val})}
              onPriceChange={val=>updateZone(z.id,{basePrice:val})} />
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
            {aisleCols.map(a=><AisleTag key={a.idx} label={`C${a.idx+1}·${a.gap}px`} onRemove={()=>updateLevel(currentLevel,{aisleCols:aisleCols.filter(x=>x.idx!==a.idx)})} />)}
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
            {aisleRows.map(a=><AisleTag key={a.idx} label={`R${a.idx+1}·${a.gap}px`} onRemove={()=>updateLevel(currentLevel,{aisleRows:aisleRows.filter(x=>x.idx!==a.idx)})} style={{ background:"#fff0f0", color:"#b91c1c", borderColor:"#fca5a5" }} />)}
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

      {/* ── Canvas ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
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
// WIZARD CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const AMENITIES = [
  { icon: FaCouch,          name: "Recliner Seats", key: "hasRecliner",   desc: "Premium recliner chairs" },
  { icon: FaWifi,           name: "Free WiFi",      key: "hasWifi",       desc: "High-speed internet" },
  { icon: FaParking,        name: "Parking",        key: "hasParking",    desc: "Covered car parking" },
  { icon: FaCoffee,         name: "Food & Café",    key: "hasCafe",       desc: "In-house café & snacks" },
  { icon: FaAccessibleIcon, name: "Accessibility",  key: "hasWheelchair", desc: "Wheelchair friendly" },
];

const STEPS = [
  { id:1, label:"Theater Info",    icon: FaBuilding   },
  { id:2, label:"Seat Layout",     icon: MdScreenShare },
  { id:3, label:"Review & Submit", icon: FaCheckCircle },
];

const BASIC_FIELDS = [
  { name:"name",          label:"Theater Name",   placeholder:"e.g., PVR Cinemas", icon:FaBuilding,     type:"text", required:true  },
  { name:"location",      label:"Location / Area",placeholder:"e.g., Juhu",        icon:FaMapMarkerAlt, type:"text", required:true  },
  { name:"city",          label:"City",           placeholder:"e.g., Mumbai",       icon:FaCity,         type:"text", required:true  },
  { name:"state",         label:"State",          placeholder:"e.g., Maharashtra",  icon:FaFlag,         type:"text", required:true  },
  { name:"pincode",       label:"Pincode",        placeholder:"400049",             icon:null,           type:"text", required:false },
  { name:"contactNumber", label:"Contact Number", placeholder:"9876543210",         icon:FaPhone,        type:"tel",  required:true  },
];

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
                {done
                  ? <FaCheckCircle style={{ color:"#fff", fontSize:14 }} />
                  : <s.icon style={{ color: active?"#fff":"#9ca3af", fontSize:14 }} />}
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
// MAIN EDIT THEATER PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function EditTheaterPage() {
  const router      = useRouter();
  const params      = useParams();
  const theaterId   = params.id;
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const [basicInfo, setBasicInfo] = useState({
    ownerId:"", name:"", location:"", city:"", state:"", pincode:"", contactNumber:"",
    hasRecliner:false, hasWifi:false, hasParking:false, hasCafe:false, hasWheelchair:false,
  });

  const [layoutData,        setLayoutData]        = useState(null);
  // initialLayoutData drives the builder's hydration useEffect
  const [initialLayoutData, setInitialLayoutData] = useState(null);

  // ── Fetch theater ──
  const { data: theaterData, isLoading: isLoadingTheater } = useQuery({
    queryKey: ["theater", theaterId],
    queryFn:  () => getTheaterByIdAdmin(theaterId),
    enabled:  !!theaterId,
  });

  // ── Hydrate form + builder when data lands (replaces deprecated onSuccess) ──
  useEffect(() => {
    const t = theaterData?.data;
    if (!t) return;

    setBasicInfo({
      ownerId:       t.ownerId?._id || t.ownerId || "",
      name:          t.name          || "",
      location:      t.location      || "",
      city:          t.city          || "",
      state:         t.state         || "",
      pincode:       t.pincode       || "",
      contactNumber: t.contactNumber || "",
      hasRecliner:   t.hasRecliner   || false,
      hasWifi:       t.hasWifi       || false,
      hasParking:    t.hasParking    || false,
      hasCafe:       t.hasCafe       || false,
      hasWheelchair: t.hasWheelchair || false,
    });

    // Reconstruct full builder state from the saved screens + layoutMeta
    const reconstructed = reconstructLayoutFromTheater(t);
    if (reconstructed) setInitialLayoutData(reconstructed);
  }, [theaterData]);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users","THEATER_OWNER"],
    queryFn:  () => getAllUsers({ role:"THEATER_OWNER" }),
  });
  const owners = usersData?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => updateTheaterAdmin(theaterId, data),
    onSuccess: () => {
      toast.success("Theater updated successfully! 🎉");
      queryClient.invalidateQueries(["allTheatersAdmin"]);
      queryClient.invalidateQueries(["theater", theaterId]);
      setTimeout(() => router.push("/admin/theaters"), 2000);
    },
    onError: err => toast.error(err.response?.data?.message || "Failed to update theater"),
  });

  const handleBasicChange = e => {
    const { name, value, type, checked } = e.target;
    if (name==="pincode") {
      const v = value.replace(/[^0-9]/g,"");
      if (v.length<=6) setBasicInfo(p=>({...p,[name]:v}));
      return;
    }
    if (name==="contactNumber") {
      const v = value.replace(/[^0-9]/g,"");
      if (v.length<=10) setBasicInfo(p=>({...p,[name]:v}));
      return;
    }
    setBasicInfo(p=>({...p,[name]: type==="checkbox" ? checked : value}));
  };

  const validateStep1 = () => {
    if (!basicInfo.ownerId)                                      { toast.error("Select a theater owner");          return false; }
    if (!basicInfo.name.trim())                                  { toast.error("Theater name is required");        return false; }
    if (!basicInfo.location.trim())                              { toast.error("Location is required");            return false; }
    if (!basicInfo.city.trim())                                  { toast.error("City is required");                return false; }
    if (!basicInfo.state.trim())                                 { toast.error("State is required");               return false; }
    if (!basicInfo.contactNumber.trim())                         { toast.error("Contact number is required");      return false; }
    if (basicInfo.contactNumber.length !== 10)                   { toast.error("Contact number must be 10 digits");return false; }
    if (basicInfo.pincode && basicInfo.pincode.length !== 6)    { toast.error("Pincode must be 6 digits");        return false; }
    return true;
  };

  const preparePayload = () => {
    const ld     = layoutData;
    const zones  = ld?.zones || [];

    const buildZonesFromLevel = (levelKey, levelData) => {
      if (!levelData?.generated) return [];
      const { rows, cols, seats } = levelData;
      // Include zones with painted seats OR no-seat label zones
      return zones.filter(z => z.noSeat || Object.values(seats).some(s => s.zone === z.id)).map((z, idx) => {
        const zoneSeats = Object.entries(seats).filter(([,v]) => v.zone === z.id);
        const rowsData  = z.noSeat ? [] : Array.from({length:rows}, (_,r) => {
          const rowSeats = Array.from({length:cols}, (_,c) => {
            const k = seatKey(r,c);
            if (seats[k]?.zone !== z.id) return null;
            return {
              seatId:       `${z.id}_${levelKey}_r${r}c${c}`,
              seatNumber:   `${getRowLabel(r, ld.rowNaming||"alpha")}${c+1}`,
              seatLabel:    `${getRowLabel(r, ld.rowNaming||"alpha")}${c+1}`,
              rowNumber:    r+1, columnNumber: c+1,
              rowName:      getRowLabel(r, ld.rowNaming||"alpha"),
              isAvailable:  true, isBooked: false,
            };
          }).filter(Boolean);
          return rowSeats.length
            ? { rowId:`${z.id}_${levelKey}_row${r}`, rowName:getRowLabel(r, ld.rowNaming||"alpha"), rowNumber:r+1, seatCount:rowSeats.length, seats:rowSeats }
            : null;
        }).filter(Boolean);

        return {
          id:            `${z.id}_${levelKey}`,
          zoneNumber:    idx+1,
          name:          z.name,
          position:      levelKey==="balcony" ? "top" : "center",
          positionLabel: levelKey==="balcony" ? "Balcony" : "Center",
          seatType:      "NORMAL",
          color:         z.color,
          icon:          "■",
          basePrice:     z.basePrice ?? 0, priceMultiplier:1, finalPrice: z.basePrice ?? 0,
          noSeat:        z.noSeat || false, label: z.label || "",
          totalRows:     rowsData.length,
          totalSeats:    zoneSeats.length,
          rows:          rowsData,
        };
      });
    };

    const groundZones  = buildZonesFromLevel("ground",  ld?.levels?.ground);
    const balconyZones = buildZonesFromLevel("balcony", ld?.levels?.balcony);
    const allZones     = [...groundZones, ...balconyZones];
    const totalSeats   = allZones.reduce((s,z) => s+z.totalSeats, 0);

    return {
      ...basicInfo,
      screens: [
        {
          screenNumber:1, name:"Ground Floor", position:"center", positionLabel:"Main Floor",
          totalRows:    ld?.levels?.ground?.rows    || 0,
          totalColumns: ld?.levels?.ground?.cols    || 0,
          totalZones:   groundZones.length,
          totalSeatsInScreen: groundZones.reduce((s,z)=>s+z.totalSeats,0),
          zones: groundZones, seatRows:[], status:"ACTIVE",
        },
        ...(ld?.levels?.balcony?.generated ? [{
          screenNumber:2, name:"Balcony", position:"top", positionLabel:"Balcony",
          totalRows:    ld?.levels?.balcony?.rows   || 0,
          totalColumns: ld?.levels?.balcony?.cols   || 0,
          totalZones:   balconyZones.length,
          totalSeatsInScreen: balconyZones.reduce((s,z)=>s+z.totalSeats,0),
          zones: balconyZones, seatRows:[], status:"ACTIVE",
        }] : []),
      ],
      totalScreens: ld?.levels?.balcony?.generated ? 2 : 1,
      totalZones:   allZones.length,
      totalSeats,
      screenPosition: "top",
      images: [],
      layoutMeta: ld ? {
        aisleCols:        ld.levels?.ground?.aisleCols  || [],
        aisleRows:        ld.levels?.ground?.aisleRows   || [],
        balconyAisleCols: ld.levels?.balcony?.aisleCols || [],
        balconyAisleRows: ld.levels?.balcony?.aisleRows  || [],
        rowNaming:        ld.rowNaming,
        groundGenerated:  ld.levels?.ground?.generated,
        balconyGenerated: ld.levels?.balcony?.generated,
        groundRows:       ld.levels?.ground?.rows,
        groundCols:       ld.levels?.ground?.cols,
        balconyRows:      ld.levels?.balcony?.rows,
        balconyCols:      ld.levels?.balcony?.cols,
      } : null,
    };
  };

  const handleSubmit = () => {
    if (!validateStep1()) { setStep(1); return; }
    mutation.mutate(preparePayload());
  };

  const reviewStats = () => {
    if (!layoutData) return { groundSeats:0, balconySeats:0, zones:0 };
    const ld = layoutData;
    return {
      groundSeats:  Object.values(ld.levels?.ground?.seats  || {}).filter(s=>s.zone).length,
      balconySeats: Object.values(ld.levels?.balcony?.seats || {}).filter(s=>s.zone).length,
      zones:        (ld.zones||[]).length,
    };
  };
  const rs = reviewStats();

  // Shared styles
  const card        = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:"24px" };
  const fieldLabel  = { fontSize:13, fontWeight:600, display:"block", marginBottom:6, color:"#374151" };
  const fieldInput  = { width:"100%", padding:"10px 14px", fontSize:13, border:"1px solid #e5e7eb", borderRadius:10, background:"#fafafa", color:"#1a1a2e", outline:"none", boxSizing:"border-box", transition:"border .15s" };
  const btnPrimary  = { padding:"10px 24px", fontSize:14, borderRadius:10, border:"none", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", cursor:"pointer", fontWeight:700, boxShadow:"0 4px 12px rgba(59,130,246,.3)", transition:"all .15s" };
  const btnSecondary= { padding:"10px 20px", fontSize:13, borderRadius:10, border:"2px solid #e5e7eb", background:"#fff", color:"#374151", cursor:"pointer", fontWeight:600 };

  if (isLoadingTheater) {
    return (
      <div style={{ minHeight:"100vh", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:16 }}>⏳</div>
          <div style={{ fontSize:16, fontWeight:600, color:"#1a1a2e" }}>Loading theater details…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f3f4f6", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Toaster position="top-right" />

      {/* ── Sticky header ── */}
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
              <div style={{ fontSize:17, fontWeight:800, color:"#1a1a2e" }}>Edit Theater</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>
                {basicInfo.name ? `"${basicInfo.name}" · ` : ""}Step {step} of 3
              </div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#1a1a2e" }}>{rs.groundSeats + rs.balconySeats} seats mapped</div>
            <div style={{ fontSize:11, color:"#9ca3af" }}>{rs.zones} zones configured</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: step===2 ? 1200 : 760, margin:"0 auto", padding:"28px 20px" }}>
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
                  {isLoadingUsers
                    ? <option disabled>Loading…</option>
                    : owners.map(o=><option key={o._id} value={o._id}>{o.name} ({o.email})</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              {BASIC_FIELDS.map(f=>(
                <div key={f.name} style={f.name==="name"||f.name==="location" ? {gridColumn:"1/-1"} : {}}>
                  <label style={fieldLabel}>{f.label} {f.required && <span style={{ color:"#ef4444" }}>*</span>}</label>
                  <div style={{ position:"relative" }}>
                    {f.icon && <f.icon style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:13 }} />}
                    <input type={f.type} name={f.name} value={basicInfo[f.name]} onChange={handleBasicChange}
                      placeholder={f.placeholder}
                      style={{ ...fieldInput, paddingLeft: f.icon ? 36 : 14 }} />
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
                    display:"flex", alignItems:"center", gap:8, padding:"10px 12px",
                    border:"1px solid #e5e7eb", borderRadius:10, cursor:"pointer",
                    background:    basicInfo[a.key] ? "#eff6ff" : "#fff",
                    borderColor:   basicInfo[a.key] ? "#3b82f6" : "#e5e7eb",
                    transition:"all .15s",
                  }}>
                    <input type="checkbox" name={a.key} checked={basicInfo[a.key]} onChange={handleBasicChange}
                      style={{ accentColor:"#3b82f6", width:15, height:15 }} />
                    <a.icon style={{ color: basicInfo[a.key] ? "#3b82f6" : "#9ca3af", fontSize:13 }} />
                    <span style={{ fontSize:12, fontWeight:500, color: basicInfo[a.key] ? "#1e40af" : "#374151" }}>{a.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={()=>{ if(validateStep1()) setStep(2); }} style={btnPrimary}>
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
                The existing seat layout has been restored. You can repaint zones, adjust the grid, or leave it as-is and proceed.
              </p>
            </div>

            <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap", marginBottom:14, padding:"10px 16px", background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", fontSize:12, color:"#6b7280" }}>
              <span style={{ fontWeight:600, color:"#374151" }}>Quick guide:</span>
              <span>1️⃣ Set rows & cols</span><span>→</span>
              <span>2️⃣ Click Generate</span><span>→</span>
              <span>3️⃣ Select a zone</span><span>→</span>
              <span>4️⃣ Paint seats</span><span>→</span>
              <span>5️⃣ Repeat for Balcony if needed</span>
            </div>

            {/* Pass initialData so the builder hydrates from existing theater data */}
            <TheaterLayoutBuilder onLayoutChange={setLayoutData} initialData={initialLayoutData} />

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

            <div style={{ background:"#f9fafb", borderRadius:10, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>Theater Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  ["Name",     basicInfo.name          || "—"],
                  ["Location", basicInfo.location       || "—"],
                  ["City",     basicInfo.city           || "—"],
                  ["State",    basicInfo.state          || "—"],
                  ["Pincode",  basicInfo.pincode        || "—"],
                  ["Contact",  basicInfo.contactNumber  || "—"],
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

            <div style={{ background:"#f9fafb", borderRadius:10, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>Layout Summary</div>
              {layoutData ? (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  {[
                    { label:"Ground Seats", value:rs.groundSeats,  color:"#2563eb" },
                    { label:"Balcony Seats",value:rs.balconySeats, color:"#7c3aed" },
                    { label:"Total Zones",  value:rs.zones,        color:"#059669" },
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
              {layoutData?.zones?.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:11, color:"#9ca3af", marginBottom:6 }}>Zone breakdown:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {layoutData.zones.map(z=>(
                      <span key={z.id} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:z.color+"18", color:z.color, border:`1px solid ${z.color}44` }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:z.color, display:"inline-block" }} />
                        {z.name}{z.noSeat ? " (no seat)" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", gap:12, paddingTop:16, borderTop:"1px solid #e5e7eb" }}>
              <button onClick={()=>setStep(2)} style={btnSecondary}>← Back to Layout</button>
              <button onClick={handleSubmit} disabled={mutation.isPending}
                style={{ ...btnPrimary, display:"flex", alignItems:"center", gap:8, opacity: mutation.isPending ? 0.8 : 1 }}>
                {mutation.isPending
                  ? <><div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }} />Updating…</>
                  : <><FaCheckCircle />Update Theater</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


