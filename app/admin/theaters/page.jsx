"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from 'react-hot-toast';
import {
  getAllTheatersAdmin,
  deleteTheater,
  updateTheater
} from "@/app/services/adminCommunication";
import {
  FaBuilding, FaMapMarkerAlt, FaPhone, FaTicketAlt,
  FaCouch, FaWifi, FaParking, FaCoffee, FaAccessibleIcon,
  FaEdit, FaTrash, FaPlus, FaSearch, FaTimes,
  FaCheckCircle, FaTimesCircle, FaChevronDown
} from 'react-icons/fa';
import { MdTheaters, MdScreenShare, MdLocationOn, MdEventSeat } from 'react-icons/md';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const AMENITIES = [
  { icon: FaCouch,          name: "Recliner",  key: "hasRecliner"   },
  { icon: FaWifi,           name: "WiFi",       key: "hasWifi"       },
  { icon: FaParking,        name: "Parking",    key: "hasParking"    },
  { icon: FaCoffee,         name: "Café",       key: "hasCafe"       },
  { icon: FaAccessibleIcon, name: "Accessible", key: "hasWheelchair" },
];

// Each type maps to a CSS variable name from global.css
const SEAT_TYPES = {
  NORMAL:    { label: "Standard",  cssVar: "--blue",   symbol: "S", mult: "1×"   },
  EXECUTIVE: { label: "Executive", cssVar: "--green",  symbol: "E", mult: "1.5×" },
  PREMIUM:   { label: "Premium",   cssVar: "--purple", symbol: "P", mult: "2×"   },
  VIP:       { label: "VIP",       cssVar: "--yellow", symbol: "V", mult: "3×"   },
};

/* ─────────────────────────────────────────
   INJECTED STYLES  (CSS variables only)
───────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');

    .tp * { box-sizing: border-box; }
    .tp   { font-family: 'Sora', system-ui, sans-serif; }

    @keyframes tp-up   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes tp-spin { to   { transform: rotate(360deg); } }

    .tp-fade { animation: tp-up .42s ease both; }

    /* ── cards ── */
    .tp-stat-card {
      transition: transform .25s, box-shadow .25s;
      cursor: default;
    }
    .tp-stat-card:hover {
      transform: translateY(-3px) scale(1.025);
      box-shadow: 0 14px 36px rgba(0,0,0,.12) !important;
    }
    .tp-theater-card {
      transition: transform .28s, box-shadow .28s, border-color .28s;
    }
    .tp-theater-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 60px rgba(0,0,0,.13) !important;
      border-color: var(--blue) !important;
    }

    /* ── buttons ── */
    .tp-btn { transition: opacity .15s, transform .15s; cursor: pointer; }
    .tp-btn:active { transform: scale(.95); }

    /* ── seats ── */
    .tp-seat { transition: transform .15s, box-shadow .15s, filter .15s; cursor: pointer; }
    .tp-seat:hover { transform: scale(1.24) translateY(-2px); filter: brightness(1.15); }

    /* ── inputs ── */
    .tp-input:focus { outline: none; border-color: var(--blue) !important; }

    /* ── scrollbar ── */
    .tp-scroll::-webkit-scrollbar       { width:5px; height:5px; }
    .tp-scroll::-webkit-scrollbar-track { background:transparent; }
    .tp-scroll::-webkit-scrollbar-thumb { background:var(--card-border); border-radius:99px; }

    /* ── legend pill ── */
    .tp-legend {
      display:flex; align-items:center; gap:8px;
      padding:8px 14px; border-radius:10px;
      border:1px solid var(--card-border);
      background:var(--card);
      transition:transform .2s;
    }
    .tp-legend:hover { transform:scale(1.04); }

    /* ── select chrome reset ── */
    .tp-select {
      appearance:none; -webkit-appearance:none;
      background:var(--card); color:var(--foreground);
      border:1.5px solid var(--card-border);
      border-radius:10px; padding:10px 36px 10px 14px;
      font-family:'Sora',system-ui,sans-serif;
      font-size:13px; font-weight:600; cursor:pointer;
      min-width:130px;
    }
    .tp-select:focus { outline:none; border-color:var(--blue); }
  `}</style>
);

/* ─────────────────────────────────────────
   SCREEN VIEW MODAL
───────────────────────────────────────── */
const ScreenViewModal = ({ isOpen, onClose, theater, screens, selectedScreenIndex, onScreenChange }) => {
  const [hovered, setHovered] = useState(null);
  const current = screens?.[selectedScreenIndex];

  const seatsByRow = useMemo(() => {
    if (!current?.seatRows) return {};
    const all = [];
    current.seatRows.forEach(row => {
      for (let i = row.startSeat; i <= row.endSeat; i++)
        all.push({ row: row.rowName, number: i, category: row.category, multiplier: row.priceMultiplier });
    });
    return all.reduce((acc, s) => {
      (acc[s.row] = acc[s.row] || []).push(s);
      return acc;
    }, {});
  }, [current]);

  const total = useMemo(() => Object.values(seatsByRow).reduce((t, r) => t + r.length, 0), [seatsByRow]);
  const catCounts = useMemo(() => {
    const c = {};
    Object.values(seatsByRow).flat().forEach(s => { c[s.category] = (c[s.category] || 0) + 1; });
    return c;
  }, [seatsByRow]);

  if (!isOpen || !current) return null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,.65)', backdropFilter:'blur(10px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'1rem', overflowY:'auto',
        animation:'tp-up .22s ease',
      }}
    >
      <div
        className="tp-scroll"
        style={{
          background:'var(--card)', border:'1px solid var(--card-border)',
          borderRadius:24, width:'100%', maxWidth:860,
          maxHeight:'92vh', overflowY:'auto',
          boxShadow:'0 40px 100px rgba(0,0,0,.45)',
        }}
      >
        {/* Header */}
        <div style={{
          position:'sticky', top:0, zIndex:10,
          background:'var(--card)', borderBottom:'1px solid var(--card-border)',
          padding:'1.5rem 2rem', borderRadius:'24px 24px 0 0',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
            <div>
              {/* Accent bar */}
              <div style={{ width:36, height:4, borderRadius:99, background:'var(--blue)', marginBottom:12 }} />
              <h2 style={{ margin:0, fontSize:21, fontWeight:800, color:'var(--foreground)' }}>
                {theater?.name}
              </h2>
              <p style={{ margin:'6px 0 0', fontSize:13, color:'var(--foreground)', opacity:.5, display:'flex', alignItems:'center', gap:4 }}>
                <MdLocationOn style={{ color:'var(--blue)' }} />
                {theater?.location}, {theater?.city}
              </p>
            </div>
            <button className="tp-btn" onClick={onClose} style={{
              background:'transparent', border:'1px solid var(--card-border)',
              borderRadius:10, padding:'8px 10px', color:'var(--foreground)', opacity:.6,
              display:'flex', alignItems:'center',
            }}>
              <FaTimes style={{ fontSize:14 }} />
            </button>
          </div>

          {/* Screen tabs */}
          {screens?.length > 1 && (
            <div style={{ display:'flex', gap:8, marginTop:16, overflowX:'auto', paddingBottom:2 }}>
              {screens.map((sc, idx) => (
                <button key={sc._id} className="tp-btn" onClick={() => onScreenChange(idx)} style={{
                  padding:'6px 16px', borderRadius:8, fontSize:13, fontWeight:600,
                  border:'none', whiteSpace:'nowrap',
                  background: selectedScreenIndex === idx ? 'var(--blue)' : 'var(--card-border)',
                  color: selectedScreenIndex === idx ? '#fff' : 'var(--foreground)',
                  opacity: selectedScreenIndex === idx ? 1 : .65,
                  fontFamily:'inherit', transition:'all .2s',
                }}>
                  <MdScreenShare style={{ marginRight:6, verticalAlign:'middle', fontSize:12 }} />
                  {sc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:'2rem' }}>

          {/* Stat chips */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:28 }}>
            {[
              { label:'Screen',      value:`#${current.screenNumber}`, v:'--blue'  },
              { label:'Total Seats', value:total,                       v:'--green' },
              ...Object.entries(catCounts).map(([cat, n]) => ({
                label: SEAT_TYPES[cat]?.label || cat,
                value: n,
                v: SEAT_TYPES[cat]?.cssVar || '--blue',
              })),
            ].map((chip, i) => (
              <div key={i} style={{
                padding:'8px 16px', borderRadius:10,
                border:`1.5px solid var(${chip.v})44`,
                background:`var(${chip.v})11`,
              }}>
                <div style={{ fontSize:10, fontWeight:700, color:`var(${chip.v})`, textTransform:'uppercase', letterSpacing:'1px' }}>{chip.label}</div>
                <div style={{ fontSize:22, fontWeight:900, color:`var(${chip.v})`, lineHeight:1.1 }}>{chip.value}</div>
              </div>
            ))}
          </div>

          {/* Cinema screen visual */}
          <div style={{ marginBottom:32, textAlign:'center' }}>
            <div style={{
              height:6,
              background:'linear-gradient(90deg,transparent 0%,var(--blue) 20%,var(--purple) 50%,var(--blue) 80%,transparent 100%)',
              borderRadius:3,
              boxShadow:'0 0 24px var(--blue), 0 0 48px var(--purple)',
              opacity:.75,
              marginBottom:8,
            }} />
            <div style={{
              height:18,
              background:'linear-gradient(180deg,var(--blue)18 0%,transparent 100%)',
              borderRadius:'0 0 60% 60%',
              marginBottom:8,
            }} />
            <span style={{ fontSize:9, fontWeight:800, letterSpacing:'4px', color:'var(--foreground)', opacity:.3, textTransform:'uppercase' }}>
              ◄ &nbsp; ALL EYES THIS WAY &nbsp; ►
            </span>
          </div>

          {/* Seat grid */}
          <div className="tp-scroll" style={{ overflowX:'auto', paddingBottom:8 }}>
            <div style={{ minWidth:'max-content' }}>
              {Object.entries(seatsByRow).map(([rowName, seats]) => (
                <div key={rowName} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:24, textAlign:'center', fontSize:10, fontWeight:800, color:'var(--foreground)', opacity:.35, flexShrink:0 }}>
                    {rowName}
                  </div>
                  <div style={{ display:'flex', gap:5 }}>
                    {seats.map(seat => {
                      const cfg  = SEAT_TYPES[seat.category] || SEAT_TYPES.NORMAL;
                      const isHov = hovered === seat;
                      return (
                        <div
                          key={`${seat.row}${seat.number}`}
                          className="tp-seat"
                          onMouseEnter={() => setHovered(seat)}
                          onMouseLeave={() => setHovered(null)}
                          title={`${seat.row}${seat.number} · ${cfg.label} · ${seat.multiplier}×`}
                          style={{
                            width:34, height:34, borderRadius:8,
                            background: isHov ? `var(${cfg.cssVar})` : `var(${cfg.cssVar})20`,
                            border:`1.5px solid var(${cfg.cssVar})`,
                            color: isHov ? '#fff' : `var(${cfg.cssVar})`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:10, fontWeight:800, position:'relative',
                            boxShadow: isHov ? `0 6px 20px var(${cfg.cssVar})66` : 'none',
                          }}
                        >
                          {seat.number}
                          {/* category dot */}
                          <span style={{
                            position:'absolute', bottom:2, right:2,
                            width:4, height:4, borderRadius:'50%',
                            background:`var(${cfg.cssVar})`,
                            opacity: isHov ? 0 : .6,
                          }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hover info */}
          <div style={{ minHeight:60, margin:'16px 0' }}>
            {hovered && (() => {
              const cfg = SEAT_TYPES[hovered.category] || SEAT_TYPES.NORMAL;
              return (
                <div style={{
                  display:'flex', alignItems:'center', gap:14,
                  padding:'12px 18px', borderRadius:12,
                  border:`1.5px solid var(${cfg.cssVar})44`,
                  background:`var(${cfg.cssVar})0e`,
                  animation:'tp-up .18s ease',
                }}>
                  <div style={{
                    width:40, height:40, borderRadius:10,
                    background:`var(${cfg.cssVar})`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:13, fontWeight:900, color:'#fff', flexShrink:0,
                  }}>
                    {hovered.row}{hovered.number}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--foreground)' }}>
                      Seat {hovered.row}{hovered.number}
                    </div>
                    <div style={{ fontSize:12, color:'var(--foreground)', opacity:.5, marginTop:2 }}>
                      {cfg.label} &nbsp;·&nbsp; {hovered.multiplier}× price multiplier
                    </div>
                  </div>
                  <div style={{
                    marginLeft:'auto', fontSize:11, fontWeight:800,
                    padding:'4px 12px', borderRadius:6,
                    background:`var(${cfg.cssVar})`, color:'#fff',
                  }}>
                    {cfg.symbol}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Legend */}
          <div style={{ borderTop:'1px solid var(--card-border)', paddingTop:20 }}>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--foreground)', opacity:.35, textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:14 }}>
              Seat Categories
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {Object.entries(SEAT_TYPES).map(([key, cfg]) => (
                <div key={key} className="tp-legend">
                  <div style={{
                    width:28, height:28, borderRadius:7,
                    background:`var(${cfg.cssVar})18`,
                    border:`1.5px solid var(${cfg.cssVar})`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:800, color:`var(${cfg.cssVar})`,
                  }}>
                    {cfg.symbol}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--foreground)' }}>{cfg.label}</div>
                    <div style={{ fontSize:11, color:'var(--foreground)', opacity:.4 }}>{cfg.mult} price</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position:'sticky', bottom:0, background:'var(--card)',
          borderTop:'1px solid var(--card-border)',
          padding:'1.25rem 2rem', borderRadius:'0 0 24px 24px',
        }}>
          <button className="tp-btn" onClick={onClose} style={{
            width:'100%', background:'transparent',
            border:'1.5px solid var(--card-border)', borderRadius:12,
            padding:'11px 0', color:'var(--foreground)',
            fontWeight:700, fontSize:14, fontFamily:'inherit',
            transition:'background .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='var(--card-border)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   THEATER CARD
───────────────────────────────────────── */
const TheaterCard = ({ theater, onView, onEdit, onDelete, onStatusToggle }) => {
  const isActive = theater.status === 'ACTIVE';
  const totalScreens = theater.screens?.length || 0;
  const totalSeats = useMemo(() =>
    theater.screens?.reduce((t, s) =>
      t + (s.seatRows?.reduce((sum, r) => sum + (r.endSeat - r.startSeat + 1), 0) || 0), 0
    ) || 0, [theater.screens]);

  return (
    <div className="tp-theater-card card" style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 4px 16px rgba(0,0,0,.07)' }}>
      
      {/* Banner */}
      <div style={{ position:'relative', height:114, overflow:'hidden', background:'linear-gradient(135deg,var(--blue) 0%,var(--indigo) 100%)' }}>
        {/* Seat-grid pattern */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.1 }}
          viewBox="0 0 280 114" preserveAspectRatio="xMidYMid slice">
          {Array.from({length:7}).map((_,r) =>
            Array.from({length:14}).map((_,c) => (
              <rect key={`${r}-${c}`} x={c*21} y={r*16} width={14} height={10} rx={3} fill="white" opacity={((r+c)%2===0)?'.5':'.2'} />
            ))
          )}
        </svg>

        {/* Status pill */}
        <div style={{
          position:'absolute', top:12, left:14,
          display:'flex', alignItems:'center', gap:6,
          padding:'4px 12px', borderRadius:20,
          background: isActive ? 'rgba(22,163,74,.25)' : 'rgba(100,116,139,.2)',
          border: isActive ? '1px solid rgba(74,222,128,.4)' : '1px solid rgba(148,163,184,.3)',
          backdropFilter:'blur(4px)',
        }}>
          <span style={{
            width:7, height:7, borderRadius:'50%',
            background: isActive ? 'var(--green)' : '#94a3b8',
            boxShadow: isActive ? '0 0 8px var(--green)' : 'none',
          }} />
          <span style={{ fontSize:10, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'.8px' }}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Toggle */}
        <button className="tp-btn" onClick={() => onStatusToggle(theater, isActive ? 'deactivate' : 'activate')}
          style={{
            position:'absolute', top:10, right:12,
            background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)',
            borderRadius:8, padding:'5px 7px', color:'#fff',
            display:'flex', alignItems:'center',
          }}
          title={isActive ? 'Deactivate' : 'Activate'}
        >
          {isActive ? <FaTimesCircle style={{fontSize:13}} /> : <FaCheckCircle style={{fontSize:13}} />}
        </button>

        {/* Name */}
        <div style={{ position:'absolute', bottom:12, left:14, right:50 }}>
          <h3 style={{
            margin:0, fontSize:16, fontWeight:800, color:'#fff',
            textShadow:'0 2px 8px rgba(0,0,0,.3)',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>
            {theater.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'16px 18px 18px', flex:1, display:'flex', flexDirection:'column' }}>
        {/* Location */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
          <MdLocationOn style={{ color:'var(--blue)', fontSize:15, flexShrink:0 }} />
          <span style={{ fontSize:12.5, color:'var(--foreground)', opacity:.55, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {theater.location}, {theater.city}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            { icon:<MdTheaters  />, value:totalScreens,                          label:'Screens', color:'var(--blue)'   },
            { icon:<FaTicketAlt />, value:totalSeats,                            label:'Seats',   color:'var(--green)'  },
            { icon:<FaPhone     />, value:theater.contactNumber?.slice(-4)||'—', label:'Phone',   color:'var(--purple)' },
          ].map((s,i) => (
            <div key={i} style={{
              borderRadius:10, padding:'8px 6px', textAlign:'center',
              border:'1px solid var(--card-border)', background:'var(--background)',
            }}>
              <div style={{ fontSize:15, color:s.color, marginBottom:2 }}>{s.icon}</div>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--foreground)', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:10, color:'var(--foreground)', opacity:.4, marginTop:2, fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16, minHeight:26 }}>
          {AMENITIES.filter(a => theater[a.key]).map(({ icon:Icon, name }) => (
            <div key={name} style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'3px 10px', borderRadius:20,
              border:'1px solid var(--card-border)',
              background:'var(--background)',
              fontSize:11, fontWeight:600, color:'var(--foreground)', opacity:.65,
            }}>
              <Icon style={{ fontSize:9 }} /> {name}
            </div>
          ))}
          {!AMENITIES.some(a => theater[a.key]) && (
            <span style={{ fontSize:12, color:'var(--foreground)', opacity:.28, fontStyle:'italic' }}>No amenities</span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
          <button className="tp-btn" onClick={() => onView(theater)} style={{
            flex:1, background:'var(--blue)', border:'none', borderRadius:10,
            padding:'10px 12px', color:'#fff', fontWeight:700, fontSize:13,
            display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            fontFamily:'inherit', boxShadow:'0 4px 14px var(--blue)44',
          }}>
            <MdEventSeat style={{ fontSize:15 }} /> View Layout
          </button>
          <button className="tp-btn" onClick={() => onEdit(theater)} style={{
            background:'var(--background)', border:'1px solid var(--card-border)',
            borderRadius:10, padding:'10px 12px',
            color:'var(--foreground)', display:'flex', alignItems:'center', fontFamily:'inherit',
          }} title="Edit">
            <FaEdit style={{ fontSize:13 }} />
          </button>
          <button className="tp-btn" onClick={() => onDelete(theater)} style={{
            background:'var(--background)', border:'1px solid var(--card-border)',
            borderRadius:10, padding:'10px 12px',
            color:'var(--red)', display:'flex', alignItems:'center', fontFamily:'inherit',
          }} title="Delete">
            <FaTrash style={{ fontSize:13 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   SHARED CONFIRM MODAL
───────────────────────────────────────── */
const ConfirmModal = ({ isOpen, onClose, onConfirm, icon, accentVar, title, body, confirmLabel }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,.6)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
      animation:'tp-up .2s ease',
    }}>
      <div style={{
        background:'var(--card)', border:'1px solid var(--card-border)',
        borderRadius:20, padding:'2rem', maxWidth:400, width:'100%',
        boxShadow:'0 32px 80px rgba(0,0,0,.35)',
      }}>
        <div style={{
          width:52, height:52, borderRadius:14,
          background:`var(${accentVar})18`,
          border:`1px solid var(${accentVar})44`,
          display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18,
        }}>
          {icon}
        </div>
        <h2 style={{ margin:'0 0 8px', fontSize:20, fontWeight:800, color:'var(--foreground)' }}>{title}</h2>
        <p style={{ margin:'0 0 24px', fontSize:14, color:'var(--foreground)', opacity:.55, lineHeight:1.6 }}>{body}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button className="tp-btn" onClick={onConfirm} style={{
            flex:1, background:`var(${accentVar})`, border:'none', borderRadius:10,
            padding:'11px 0', color:'#fff', fontWeight:700, fontSize:14, fontFamily:'inherit',
          }}>
            {confirmLabel}
          </button>
          <button className="tp-btn" onClick={onClose} style={{
            flex:1, background:'transparent', border:'1.5px solid var(--card-border)',
            borderRadius:10, padding:'11px 0', color:'var(--foreground)',
            fontWeight:700, fontSize:14, fontFamily:'inherit',
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   STATS CARD
───────────────────────────────────────── */
const StatsCard = ({ label, value, icon:Icon, accentVar }) => (
  <div className="tp-stat-card card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--foreground)', opacity:.4, textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:34, fontWeight:900, color:'var(--foreground)', letterSpacing:'-1.5px', lineHeight:1 }}>{value}</div>
    </div>
    <div style={{
      width:50, height:50, borderRadius:14, flexShrink:0,
      background:`var(${accentVar})18`, border:`1.5px solid var(${accentVar})33`,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <Icon style={{ fontSize:22, color:`var(${accentVar})` }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function TheatersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm,       setSearchTerm]       = useState('');
  const [statusFilter,     setStatusFilter]     = useState('ALL');
  const [cityFilter,       setCityFilter]       = useState('ALL');
  const [deletingTheater,  setDeletingTheater]  = useState(null);
  const [statusTheater,    setStatusTheater]    = useState(null);
  const [statusAction,     setStatusAction]     = useState('');
  const [selectedTheater,  setSelectedTheater]  = useState(null);
  const [selectedScreenIdx,setSelectedScreenIdx]= useState(0);
  const [isLayoutOpen,     setIsLayoutOpen]     = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['allTheatersAdmin'],
    queryFn: getAllTheatersAdmin,
  });
  const theaters = data?.data || [];

  const cities = useMemo(() => {
    const s = new Set();
    theaters.forEach(t => t.city && s.add(t.city));
    return ['ALL', ...Array.from(s).sort()];
  }, [theaters]);

  const filtered = useMemo(() =>
    theaters.filter(t => {
      const q = searchTerm.toLowerCase();
      return (
        (!q || [t.name,t.location,t.city].some(v => v?.toLowerCase().includes(q))) &&
        (statusFilter === 'ALL' || t.status  === statusFilter) &&
        (cityFilter   === 'ALL' || t.city    === cityFilter)
      );
    }), [theaters, searchTerm, statusFilter, cityFilter]);

  const stats = useMemo(() => ({
    total:    theaters.length,
    active:   theaters.filter(t => t.status === 'ACTIVE').length,
    inactive: theaters.filter(t => t.status === 'INACTIVE').length,
    screens:  theaters.reduce((s,t) => s + (t.screens?.length||0), 0),
    cities:   new Set(theaters.map(t => t.city)).size,
  }), [theaters]);

  const deleteMutation = useMutation({
    mutationFn: deleteTheater,
    onSuccess: () => { queryClient.invalidateQueries(['allTheatersAdmin']); toast.success('Theater deleted'); setDeletingTheater(null); },
    onError: err => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, data }) => updateTheater(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allTheatersAdmin']);
      toast.success(`Theater ${statusAction === 'activate' ? 'activated' : 'deactivated'}`);
      setStatusTheater(null); setStatusAction('');
    },
    onError: err => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleStatusToggle = (theater, action) => { setStatusTheater(theater); setStatusAction(action); };
  const confirmStatus = () => statusTheater && statusMutation.mutate({
    id: statusTheater._id,
    data: { status: statusAction === 'activate' ? 'ACTIVE' : 'INACTIVE' },
  });

  const hasFilters = searchTerm || statusFilter !== 'ALL' || cityFilter !== 'ALL';

  /* Loading */
  if (isLoading) return (
    <div className="tp" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--background)' }}>
      <Styles />
      <div style={{ textAlign:'center' }}>
        <div style={{ width:42, height:42, margin:'0 auto 14px', border:'3px solid var(--card-border)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'tp-spin .8s linear infinite' }} />
        <p style={{ color:'var(--foreground)', opacity:.45, fontWeight:600, fontSize:14 }}>Loading theaters…</p>
      </div>
    </div>
  );

  /* Error */
  if (error) return (
    <div className="tp" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--background)', padding:'1rem' }}>
      <Styles />
      <div className="card" style={{ maxWidth:400, width:'100%', textAlign:'center' }}>
        <p style={{ color:'var(--red)', fontSize:14, marginBottom:16 }}>{error.message}</p>
        <button className="tp-btn" onClick={() => refetch()} style={{ background:'var(--blue)', border:'none', borderRadius:10, padding:'10px 24px', color:'#fff', fontWeight:700, fontFamily:'inherit' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="tp" style={{ background:'var(--background)', minHeight:'100vh' }}>
      <Styles />
      <Toaster position="top-right" toastOptions={{
        style:{ fontFamily:'Sora,system-ui,sans-serif', fontWeight:600, borderRadius:12, fontSize:13, background:'var(--card)', color:'var(--foreground)', border:'1px solid var(--card-border)' }
      }} />

      {/* ══ HEADER ══ */}
      <div style={{
        background:'var(--card)', borderBottom:'1px solid var(--card-border)',
        position:'sticky', top:0, zIndex:100,
        boxShadow:'0 4px 20px rgba(0,0,0,.06)',
      }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 2rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 0', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{
                width:46, height:46, borderRadius:14,
                background:'linear-gradient(135deg,var(--blue),var(--indigo))',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 16px var(--blue)44',
              }}>
                <FaBuilding style={{ color:'#fff', fontSize:18 }} />
              </div>
              <div>
                <h1 style={{ margin:0, fontSize:22, fontWeight:900, color:'var(--foreground)', letterSpacing:'-.5px' }}>
                  Theater Management
                </h1>
                <p style={{ margin:0, fontSize:12.5, color:'var(--foreground)', opacity:.4, fontWeight:500 }}>
                  Manage theaters, screens &amp; seat layouts
                </p>
              </div>
            </div>
            <button className="tp-btn" onClick={() => router.push('/admin/theaters/add')} style={{
              display:'flex', alignItems:'center', gap:8,
              background:'var(--blue)', border:'none', borderRadius:12,
              padding:'11px 22px', color:'#fff', fontWeight:800, fontSize:14,
              fontFamily:'inherit', whiteSpace:'nowrap',
              boxShadow:'0 4px 16px var(--blue)44',
            }}>
              <FaPlus style={{ fontSize:11 }} /> Add Theater
            </button>
          </div>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'2rem' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
          <StatsCard label="Total Theaters" value={stats.total}    icon={FaBuilding}     accentVar="--blue"   />
          <StatsCard label="Active"          value={stats.active}   icon={FaCheckCircle}  accentVar="--green"  />
          <StatsCard label="Inactive"        value={stats.inactive} icon={FaTimesCircle}  accentVar="--red"    />
          <StatsCard label="Total Screens"   value={stats.screens}  icon={MdTheaters}     accentVar="--purple" />
          <StatsCard label="Cities"          value={stats.cities}   icon={FaMapMarkerAlt} accentVar="--yellow" />
        </div>

        {/* Filter bar */}
        <div className="card" style={{ padding:'1.25rem 1.5rem', marginBottom:28, display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
          {/* Search */}
          <div style={{ flex:1, minWidth:220, position:'relative' }}>
            <FaSearch style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--foreground)', opacity:.3, fontSize:12, pointerEvents:'none' }} />
            <input
              type="text" placeholder="Search theaters, cities, locations…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="tp-input"
              style={{
                width:'100%', paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10,
                border:'1.5px solid var(--card-border)', borderRadius:10,
                fontSize:13, color:'var(--foreground)', background:'var(--card)',
                fontFamily:'Sora,system-ui,sans-serif', fontWeight:500,
              }}
            />
          </div>

          {/* Status select */}
          <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="tp-select">
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <FaChevronDown style={{ position:'absolute', right:12, fontSize:9, color:'var(--foreground)', opacity:.4, pointerEvents:'none' }} />
          </div>

          {/* City select */}
          <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="tp-select">
              {cities.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Cities' : c}</option>)}
            </select>
            <FaChevronDown style={{ position:'absolute', right:12, fontSize:9, color:'var(--foreground)', opacity:.4, pointerEvents:'none' }} />
          </div>

          {hasFilters && (
            <button className="tp-btn" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setCityFilter('ALL'); }}
              style={{
                padding:'10px 14px', borderRadius:10, fontFamily:'inherit',
                background:'transparent', border:'1.5px solid var(--red)44',
                color:'var(--red)', fontWeight:700, fontSize:12,
                display:'flex', alignItems:'center', gap:6,
              }}>
              <FaTimes style={{ fontSize:10 }} /> Clear
            </button>
          )}

          <div style={{ marginLeft:'auto', fontSize:12, color:'var(--foreground)', opacity:.35, fontWeight:600 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'5rem 2rem', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
            <div style={{
              width:68, height:68, borderRadius:18, margin:'0 auto 20px',
              background:'var(--background)', border:'1px solid var(--card-border)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <FaBuilding style={{ fontSize:26, color:'var(--foreground)', opacity:.18 }} />
            </div>
            <h3 style={{ margin:'0 0 8px', fontSize:18, fontWeight:800, color:'var(--foreground)' }}>No theaters found</h3>
            <p style={{ margin:'0 0 24px', fontSize:14, color:'var(--foreground)', opacity:.4 }}>
              {hasFilters ? 'Try adjusting your filters' : 'Add your first theater to get started'}
            </p>
            {!hasFilters && (
              <button className="tp-btn" onClick={() => router.push('/admin/theaters/add')} style={{
                background:'var(--blue)', border:'none', borderRadius:10, padding:'11px 24px',
                color:'#fff', fontWeight:700, display:'inline-flex', alignItems:'center', gap:8, fontFamily:'inherit',
              }}>
                <FaPlus style={{ fontSize:11 }} /> Add Theater
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:22 }}>
            {filtered.map((theater, idx) => (
              <div key={theater._id} className="tp-fade" style={{ animationDelay:`${idx * 55}ms` }}>
                <TheaterCard
                  theater={theater}
                  onView={t => { setSelectedTheater(t); setSelectedScreenIdx(0); setIsLayoutOpen(true); }}
                  onEdit={t => router.push(`/admin/theaters/edit/${t._id}`)}
                  onDelete={t => setDeletingTheater(t)}
                  onStatusToggle={handleStatusToggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}
      <ConfirmModal
        isOpen={!!deletingTheater}
        onClose={() => setDeletingTheater(null)}
        onConfirm={() => deletingTheater && deleteMutation.mutate(deletingTheater._id)}
        icon={<FaTrash style={{ color:'var(--red)', fontSize:20 }} />}
        accentVar="--red"
        title="Delete Theater"
        body={<>Delete <strong style={{ color:'var(--foreground)' }}>{deletingTheater?.name}</strong>? This cannot be undone.</>}
        confirmLabel="Delete"
      />

      <ConfirmModal
        isOpen={!!statusTheater}
        onClose={() => { setStatusTheater(null); setStatusAction(''); }}
        onConfirm={confirmStatus}
        icon={statusAction === 'activate'
          ? <FaCheckCircle style={{ color:'var(--green)', fontSize:20 }} />
          : <FaTimesCircle style={{ color:'var(--yellow)', fontSize:20 }} />}
        accentVar={statusAction === 'activate' ? '--green' : '--yellow'}
        title={statusAction === 'activate' ? 'Activate Theater' : 'Deactivate Theater'}
        body={<>Are you sure you want to {statusAction} <strong style={{ color:'var(--foreground)' }}>{statusTheater?.name}</strong>?</>}
        confirmLabel={statusAction === 'activate' ? 'Activate' : 'Deactivate'}
      />

      <ScreenViewModal
        isOpen={isLayoutOpen}
        onClose={() => { setIsLayoutOpen(false); setSelectedTheater(null); setSelectedScreenIdx(0); }}
        theater={selectedTheater}
        screens={selectedTheater?.screens || []}
        selectedScreenIndex={selectedScreenIdx}
        onScreenChange={setSelectedScreenIdx}
      />
    </div>
  );
}