"use client";

import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from 'react-hot-toast';
import {
  FaPlus, FaTrash, FaSave, FaTimes, FaBuilding, FaMapMarkerAlt,
  FaPhone, FaCity, FaFlag, FaCouch, FaWifi, FaParking, FaCoffee,
  FaAccessibleIcon, FaArrowLeft, FaCheckCircle, FaUserTie,
  FaChevronDown, FaChevronUp, FaFilm, FaLayerGroup, FaExclamationTriangle
} from 'react-icons/fa';
import { MdScreenShare, MdChair, MdEventSeat, MdTheaters } from 'react-icons/md';
import { createTheater, getAllUsers } from "@/app/services/adminCommunication";

/* ─────────────────────────────────────────
   INJECTED STYLES
───────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&display=swap');

    .at * { box-sizing: border-box; }
    .at   { font-family: 'Sora', system-ui, sans-serif; }

    @keyframes at-up    { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes at-in    { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
    @keyframes at-spin  { to   { transform: rotate(360deg); } }
    @keyframes at-pulse { 0%,100% { opacity:.6; } 50% { opacity:1; } }
    @keyframes at-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes at-modal-in {
      from { opacity:0; transform: scale(.92) translateY(16px); }
      to   { opacity:1; transform: scale(1) translateY(0); }
    }
    @keyframes at-overlay-in {
      from { opacity:0; }
      to   { opacity:1; }
    }

    .at-fade { animation: at-up .45s cubic-bezier(.22,1,.36,1) both; }
    .at-scale { animation: at-in .35s cubic-bezier(.22,1,.36,1) both; }

    /* ── Step card ── */
    .at-panel {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,.08);
      overflow: hidden;
      animation: at-in .4s cubic-bezier(.22,1,.36,1) both;
    }

    /* ── Input ── */
    .at-input {
      width: 100%;
      padding: 12px 14px;
      background: var(--background);
      border: 1.5px solid var(--card-border);
      border-radius: 12px;
      font-family: 'Sora', system-ui, sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--foreground);
      transition: border-color .2s, box-shadow .2s;
      outline: none;
    }
    .at-input:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px var(--blue)22;
    }
    .at-input::placeholder { opacity: .35; }
    .at-input.error {
      border-color: var(--red) !important;
      box-shadow: 0 0 0 3px var(--red)18 !important;
      background: var(--red)04;
    }
    .at-input:focus.error {
      border-color: var(--red);
      box-shadow: 0 0 0 3px var(--red)22;
    }

    .at-input-icon { padding-left: 42px; }

    /* ── Select ── */
    .at-select {
      width: 100%;
      padding: 12px 42px 12px 42px;
      background: var(--background);
      border: 1.5px solid var(--card-border);
      border-radius: 12px;
      font-family: 'Sora', system-ui, sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--foreground);
      appearance: none;
      -webkit-appearance: none;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      cursor: pointer;
    }
    .at-select:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px var(--blue)22;
    }
    .at-select.error {
      border-color: var(--red) !important;
      box-shadow: 0 0 0 3px var(--red)18 !important;
    }

    /* ── Error message ── */
    .at-error-msg {
      font-size: 11px;
      font-weight: 600;
      color: var(--red);
      margin-top: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
      animation: at-up .2s ease both;
    }

    /* ── Buttons ── */
    .at-btn { transition: transform .15s, opacity .15s, box-shadow .2s; cursor: pointer; border: none; font-family: 'Sora', system-ui, sans-serif; }
    .at-btn:active { transform: scale(.96); }
    .at-btn-primary {
      background: linear-gradient(135deg, var(--blue), #2563eb);
      color: #fff;
      font-weight: 700;
      border-radius: 12px;
      padding: 12px 28px;
      font-size: 14px;
      display: flex; align-items: center; gap: 8px;
      box-shadow: 0 4px 16px var(--blue)44;
    }
    .at-btn-primary:hover { transform: translateY(-1px); }

    .at-btn-ghost {
      background: transparent;
      color: var(--foreground);
      font-weight: 600;
      border-radius: 12px;
      padding: 12px 22px;
      font-size: 14px;
      display: flex; align-items: center; gap: 8px;
      border: 1.5px solid var(--card-border) !important;
    }
    .at-btn-ghost:hover { opacity: .7; }

    .at-btn-danger {
      background: transparent;
      border: 1px solid var(--red)44 !important;
      color: var(--red);
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 12.5px;
      font-weight: 700;
      display: flex; align-items: center; gap: 6px;
    }
    .at-btn-danger:hover { opacity: .7; }

    .at-btn-success {
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: #fff;
      font-weight: 700;
      border-radius: 12px;
      padding: 12px 28px;
      font-size: 14px;
      display: flex; align-items: center; gap: 8px;
      box-shadow: 0 4px 16px rgba(22,163,74,.35);
    }
    .at-btn-success:hover { transform: translateY(-1px); }
    .at-btn-success:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }

    /* ── Delete confirm modal ── */
    .at-modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: at-overlay-in .2s ease both;
    }
    .at-modal {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      width: 100%; max-width: 420px;
      box-shadow: 0 24px 64px rgba(0,0,0,.25);
      animation: at-modal-in .3s cubic-bezier(.22,1,.36,1) both;
      overflow: hidden;
    }

    /* ── Step indicator ── */
    .at-step-dot {
      transition: all .35s cubic-bezier(.22,1,.36,1);
    }
    .at-step-line {
      transition: all .5s cubic-bezier(.22,1,.36,1);
    }

    /* ── Amenity card toggle ── */
    @keyframes at-check-pop {
      0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
      60%  { transform: scale(1.2) rotate(4deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }

    .at-amenity {
      position: relative;
      border: 1.5px solid var(--card-border);
      border-radius: 16px;
      padding: 18px 14px 14px;
      cursor: pointer;
      transition: border-color .2s, box-shadow .2s, transform .2s, background .2s;
      background: var(--background);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      text-align: center;
      user-select: none;
      overflow: hidden;
    }
    .at-amenity:hover {
      border-color: var(--foreground);
      border-opacity: .25;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,.07);
    }
    .at-amenity.active {
      border-color: var(--foreground);
      box-shadow: 0 2px 12px rgba(0,0,0,.1);
      transform: translateY(-1px);
    }
    .at-amenity input { position: absolute; opacity: 0; pointer-events: none; }

    .at-amenity-icon-wrap {
      width: 48px; height: 48px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      transition: all .2s;
      position: relative;
      z-index: 1;
      flex-shrink: 0;
    }

    .at-amenity-check {
      position: absolute;
      top: 9px; right: 9px;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: var(--foreground);
      display: flex; align-items: center; justify-content: center;
      animation: at-check-pop .3s cubic-bezier(.22,1,.36,1) both;
      z-index: 2;
    }

    .at-amenity-toggle {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .4px;
      text-transform: uppercase;
      transition: all .2s;
      position: relative;
      z-index: 1;
      margin-top: 2px;
    }

    /* ── Screen accordion ── */
    .at-screen-card {
      border: 1.5px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      transition: border-color .2s, box-shadow .2s;
    }
    .at-screen-card:hover { border-color: var(--blue)55; }

    /* ── Row config ── */
    .at-row-config {
      background: var(--background);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 10px 14px;
      display: grid;
      grid-template-columns: 60px 1fr 80px 80px 80px 42px;
      gap: 8px;
      align-items: center;
      transition: border-color .2s;
    }
    .at-row-config:hover { border-color: var(--blue)55; }

    /* ── Category badge ── */
    .cat-NORMAL    { color: var(--blue);   background: var(--blue)18;   border: 1px solid var(--blue)44;   }
    .cat-EXECUTIVE { color: var(--green);  background: var(--green)18;  border: 1px solid var(--green)44;  }
    .cat-PREMIUM   { color: var(--purple); background: var(--purple)18; border: 1px solid var(--purple)44; }
    .cat-VIP       { color: var(--yellow); background: var(--yellow)18; border: 1px solid var(--yellow)44; }

    /* ── Cinema screen visual ── */
    .at-cinema-screen {
      height: 5px;
      border-radius: 3px;
      background: linear-gradient(90deg, transparent, var(--blue) 20%, var(--purple) 50%, var(--blue) 80%, transparent);
      box-shadow: 0 0 20px var(--blue)55, 0 0 40px var(--purple)33;
    }

    /* ── Scrollbar ── */
    .at-scroll::-webkit-scrollbar       { width: 4px; }
    .at-scroll::-webkit-scrollbar-track { background: transparent; }
    .at-scroll::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 99px; }

    /* Header shimmer accent */
    .at-header-accent {
      background: linear-gradient(90deg, var(--blue), var(--purple), var(--blue));
      background-size: 200% auto;
      animation: at-shimmer 3s linear infinite;
    }

    /* ── Label ── */
    .at-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--foreground);
      opacity: .5;
      text-transform: uppercase;
      letter-spacing: .8px;
      margin-bottom: 8px;
      display: block;
    }

    /* ── Field wrapper ── */
    .at-field { position: relative; }
    .at-field-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      color: var(--foreground);
      opacity: .3;
      pointer-events: none;
      z-index: 1;
    }

    @media (max-width: 640px) {
      .at-row-config {
        grid-template-columns: 50px 1fr 60px 60px 60px 36px;
        gap: 5px;
      }
    }
    @media (max-width: 700px) {
      .at-amenity-grid { grid-template-columns: repeat(3, 1fr) !important; }
    }
    @media (max-width: 460px) {
      .at-amenity-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `}</style>
);

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const AMENITIES = [
  { icon: FaCouch,          name: "Recliner Seats",   key: "hasRecliner",   desc: "Premium recliner chairs" },
  { icon: FaWifi,           name: "Free WiFi",         key: "hasWifi",       desc: "High-speed internet" },
  { icon: FaParking,        name: "Parking",           key: "hasParking",    desc: "Covered car parking" },
  { icon: FaCoffee,         name: "Food & Café",       key: "hasCafe",       desc: "In-house café & snacks" },
  { icon: FaAccessibleIcon, name: "Accessibility",     key: "hasWheelchair", desc: "Wheelchair friendly" },
];

const SEAT_TYPES = {
  NORMAL:    { label: "Standard",  cssVar: "--blue",   mult: "1×",   desc: "Regular seating" },
  EXECUTIVE: { label: "Executive", cssVar: "--green",  mult: "1.5×", desc: "Comfortable seats" },
  PREMIUM:   { label: "Premium",   cssVar: "--purple", mult: "2×",   desc: "Luxury seating" },
  VIP:       { label: "VIP",       cssVar: "--yellow", mult: "3×",   desc: "Royal experience" },
};

const STEPS = [
  { id: 1, label: "Theater Info",     icon: FaBuilding    },
  { id: 2, label: "Screens & Seats",  icon: MdScreenShare },
  { id: 3, label: "Review",           icon: FaCheckCircle },
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const generateDefaultSeatRows = (totalColumns = 20) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const getCategory = i => i < 5 ? "NORMAL" : i < 10 ? "EXECUTIVE" : i < 13 ? "PREMIUM" : "VIP";
  const getMultiplier = c => ({ NORMAL:1, EXECUTIVE:1.5, PREMIUM:2, VIP:3 }[c] || 1);
  return Array.from({ length: 10 }, (_, i) => {
    const cat = getCategory(i);
    return { rowName: letters[i], category: cat, startSeat: 1, endSeat: cat === "VIP" ? Math.min(10, totalColumns) : totalColumns, priceMultiplier: getMultiplier(cat) };
  });
};

const createNewScreen = (n, cols = 20) => ({
  screenNumber: n, name: `Screen ${n}`, totalRows: 10, totalColumns: cols, seatRows: generateDefaultSeatRows(cols)
});

/* ─────────────────────────────────────────
   DELETE CONFIRMATION MODAL
───────────────────────────────────────── */
const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, confirmLabel = "Delete" }) => {
  if (!isOpen) return null;
  return (
    <div className="at-modal-overlay" onClick={onCancel}>
      <div className="at-modal" onClick={e => e.stopPropagation()}>
        {/* Top danger bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, var(--red), #dc2626)" }} />

        <div style={{ padding: "28px" }}>
          {/* Icon + title */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: "var(--red)14", border: "1.5px solid var(--red)33",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FaExclamationTriangle style={{ color: "var(--red)", fontSize: 20 }} />
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--foreground)", opacity: .55, fontWeight: 500, lineHeight: 1.5 }}>{message}</div>
            </div>
          </div>

          {/* Warning note */}
          <div style={{
            padding: "10px 14px", borderRadius: 10,
            background: "var(--red)08", border: "1px solid var(--red)22",
            fontSize: 12, color: "var(--red)", fontWeight: 600, marginBottom: 22,
          }}>
            ⚠️ This action cannot be undone.
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="at-btn at-btn-ghost" onClick={onCancel} style={{ fontSize: 13, padding: "10px 20px" }}>
              Cancel
            </button>
            <button
              className="at-btn"
              onClick={onConfirm}
              style={{
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                color: "#fff", fontWeight: 700, borderRadius: 12,
                padding: "10px 22px", fontSize: 13,
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 14px var(--red)44",
              }}
            >
              <FaTrash style={{ fontSize: 11 }} /> {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   SEAT ROW CONFIG ROW
───────────────────────────────────────── */
const SeatRowConfig = ({ row, index, onUpdate, onDelete, totalColumns }) => {
  const maxSeats = row.category === "VIP" ? Math.min(10, totalColumns) : totalColumns;
  const cfg = SEAT_TYPES[row.category] || SEAT_TYPES.NORMAL;
  const [deleteModal, setDeleteModal] = useState(false);

  return (
    <>
      <DeleteConfirmModal
        isOpen={deleteModal}
        title="Remove Seat Row"
        message={`Remove row "${row.rowName}" (${cfg.label}, seats ${row.startSeat}–${row.endSeat})?`}
        confirmLabel="Remove Row"
        onConfirm={() => { setDeleteModal(false); onDelete(index); }}
        onCancel={() => setDeleteModal(false)}
      />

      <div className="at-row-config at-fade" style={{ animationDelay: `${index * 30}ms` }}>
        {/* Row name */}
        <input
          type="text"
          value={row.rowName}
          onChange={e => {
            const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
            onUpdate(index, { ...row, rowName: val });
          }}
          maxLength={1}
          className="at-input"
          style={{ textAlign: "center", fontWeight: 800, fontSize: 15, padding: "8px 6px" }}
          placeholder="A"
        />

        {/* Category */}
        <div style={{ position: "relative" }}>
          <select
            value={row.category}
            onChange={e => {
              const cat = e.target.value;
              const maxEnd = cat === "VIP" ? Math.min(10, totalColumns) : totalColumns;
              onUpdate(index, { ...row, category: cat, endSeat: Math.min(row.endSeat, maxEnd), priceMultiplier: SEAT_TYPES[cat] ? { NORMAL:1,EXECUTIVE:1.5,PREMIUM:2,VIP:3 }[cat] : 1 });
            }}
            className="at-select"
            style={{ paddingLeft: 14, fontSize: 12, padding: "8px 28px 8px 10px" }}
          >
            {Object.entries(SEAT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <FaChevronDown style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 9, color: "var(--foreground)", opacity: .35, pointerEvents: "none" }} />
          <span style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%)", width: 4, height: 20, borderRadius: 99, background: `var(${cfg.cssVar})` }} />
        </div>

        {/* Start seat */}
        <input
          type="number"
          value={row.startSeat}
          min={1}
          max={row.endSeat}
          onChange={e => {
            let v = parseInt(e.target.value) || 1;
            if (v < 1) v = 1;
            if (v > row.endSeat) v = row.endSeat;
            onUpdate(index, { ...row, startSeat: v });
          }}
          className="at-input"
          style={{ padding: "8px 6px", textAlign: "center", fontSize: 13 }}
        />

        {/* End seat */}
        <input
          type="number"
          value={row.endSeat}
          min={row.startSeat}
          max={maxSeats}
          onChange={e => {
            let v = parseInt(e.target.value) || row.startSeat;
            if (v > maxSeats) v = maxSeats;
            if (v < row.startSeat) v = row.startSeat;
            onUpdate(index, { ...row, endSeat: v });
          }}
          className="at-input"
          style={{ padding: "8px 6px", textAlign: "center", fontSize: 13 }}
        />

        {/* Price multiplier */}
        <input
          type="number"
          step="0.5"
          min="0.5"
          max="10"
          value={row.priceMultiplier}
          onChange={e => {
            let v = parseFloat(e.target.value);
            if (isNaN(v) || v < 0.5) v = 0.5;
            if (v > 10) v = 10;
            onUpdate(index, { ...row, priceMultiplier: v });
          }}
          className="at-input"
          style={{ padding: "8px 6px", textAlign: "center", fontSize: 13 }}
        />

        {/* Delete */}
        <button className="at-btn at-btn-danger" onClick={() => setDeleteModal(true)} style={{ padding: "8px", justifyContent: "center", minWidth: 0 }}>
          <FaTrash style={{ fontSize: 11 }} />
        </button>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────
   SCREEN ACCORDION
───────────────────────────────────────── */
const ScreenCard = ({ screen, index, onUpdate, onRemove, onAddRow, onRemoveRow, onUpdateRow, screenErrors }) => {
  const [open, setOpen] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const totalSeats = screen.seatRows.reduce((s, r) => s + (r.endSeat - r.startSeat + 1), 0);
  const hasErrors = screenErrors && Object.keys(screenErrors).length > 0;

  return (
    <>
      <DeleteConfirmModal
        isOpen={deleteModal}
        title="Remove Screen"
        message={`Permanently remove "${screen.name}" and all its ${screen.seatRows.length} seat rows?`}
        confirmLabel="Remove Screen"
        onConfirm={() => { setDeleteModal(false); onRemove(index); }}
        onCancel={() => setDeleteModal(false)}
      />

      <div className="at-screen-card at-fade" style={{ animationDelay: `${index * 80}ms`, borderColor: hasErrors ? "var(--red)66" : undefined }}>
        {/* Header */}
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", cursor: "pointer",
            background: hasErrors ? "var(--red)06" : open ? "var(--blue)08" : "transparent",
            borderBottom: open ? "1px solid var(--card-border)" : "none",
            transition: "background .2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: hasErrors ? "linear-gradient(135deg, var(--red), #dc2626)" : "linear-gradient(135deg, var(--blue), #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: hasErrors ? "0 4px 14px var(--red)44" : "0 4px 14px var(--blue)44",
            }}>
              <MdScreenShare style={{ color: "#fff", fontSize: 19 }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)" }}>{screen.name}</div>
                {hasErrors && (
                  <div style={{ padding: "2px 8px", borderRadius: 20, background: "var(--red)14", border: "1px solid var(--red)33", fontSize: 10.5, color: "var(--red)", fontWeight: 700 }}>
                    Fix errors
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--foreground)", opacity: .4, marginTop: 2, fontWeight: 500 }}>
                {screen.seatRows.length} rows &nbsp;·&nbsp; {screen.totalColumns} cols &nbsp;·&nbsp; {totalSeats} total seats
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="at-btn at-btn-danger" onClick={e => { e.stopPropagation(); setDeleteModal(true); }}>
              <FaTrash style={{ fontSize: 11 }} /> Remove
            </button>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--foreground)", opacity: .45, fontSize: 11, transition: "transform .25s",
              transform: open ? "rotate(180deg)" : "none",
            }}>
              <FaChevronDown />
            </div>
          </div>
        </div>

        {/* Body */}
        {open && (
          <div style={{ padding: "20px" }}>
            {/* Screen meta */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label className="at-label">Screen Name</label>
                <input
                  type="text"
                  value={screen.name}
                  className={`at-input ${screenErrors?.name ? "error" : ""}`}
                  maxLength={50}
                  onChange={e => onUpdate(index, { name: e.target.value })}
                  placeholder="e.g. Screen 1"
                />
                {screenErrors?.name && <div className="at-error-msg">⚠ {screenErrors.name}</div>}
              </div>
              <div>
                <label className="at-label">Seats Per Row (max 30)</label>
                <input
                  type="number"
                  value={screen.totalColumns}
                  min={1}
                  max={30}
                  className={`at-input ${screenErrors?.totalColumns ? "error" : ""}`}
                  onChange={e => {
                    let cols = parseInt(e.target.value) || 1;
                    if (cols < 1) cols = 1;
                    if (cols > 30) cols = 30;
                    onUpdate(index, {
                      totalColumns: cols,
                      seatRows: screen.seatRows.map(r => ({
                        ...r,
                        endSeat: Math.min(r.endSeat, r.category === "VIP" ? Math.min(10, cols) : cols),
                        startSeat: Math.min(r.startSeat, cols),
                      }))
                    });
                  }}
                />
                {screenErrors?.totalColumns && <div className="at-error-msg">⚠ {screenErrors.totalColumns}</div>}
              </div>
            </div>

            {/* Seat legend (mini) */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {Object.entries(SEAT_TYPES).map(([k, v]) => (
                <div key={k} style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  color: `var(${v.cssVar})`, background: `var(${v.cssVar})14`, border: `1px solid var(${v.cssVar})33`,
                }}>
                  {v.label} {v.mult}
                </div>
              ))}
            </div>

            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "60px 1fr 80px 80px 80px 42px",
              gap: 8, padding: "0 0 8px", borderBottom: "1px solid var(--card-border)", marginBottom: 10,
            }}>
              {["Row", "Category", "Start", "End", "Price ×", ""].map((h, i) => (
                <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "var(--foreground)", opacity: .3, textTransform: "uppercase", letterSpacing: ".8px", textAlign: "center" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div className="at-scroll" style={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {screen.seatRows.map((row, ri) => (
                <SeatRowConfig key={ri} row={row} index={ri}
                  onUpdate={(i, r) => onUpdateRow(index, ri, r)}
                  onDelete={() => onRemoveRow(index, ri)}
                  totalColumns={screen.totalColumns} />
              ))}
            </div>

            {/* Max rows warning */}
            {screen.seatRows.length >= 26 && (
              <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "var(--yellow)10", border: "1px solid var(--yellow)33", fontSize: 12, color: "var(--yellow)", fontWeight: 600 }}>
                Maximum 26 rows (A–Z) reached.
              </div>
            )}

            {/* Add row */}
            {screen.seatRows.length < 26 && (
              <button className="at-btn" onClick={() => onAddRow(index)} style={{
                marginTop: 12, width: "100%", padding: "10px", borderRadius: 10,
                border: "1.5px dashed var(--card-border)", background: "transparent",
                color: "var(--foreground)", opacity: .5, fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "all .2s", fontFamily: "'Sora',system-ui,sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.color = "var(--blue)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = ".5"; e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--foreground)"; }}
              >
                <FaPlus style={{ fontSize: 10 }} /> Add Row
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────── */
const StepIndicator = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32 }}>
    {STEPS.map((s, i) => {
      const done    = current > s.id;
      const active  = current === s.id;
      const accent  = done ? "#16a34a" : active ? "var(--blue)" : "var(--card-border)";
      return (
        <React.Fragment key={s.id}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
            <div className="at-step-dot" style={{
              width: 44, height: 44, borderRadius: 14,
              background: done ? "#16a34a" : active ? "var(--blue)" : "var(--background)",
              border: `2px solid ${accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: active ? `0 0 0 6px var(--blue)22, 0 4px 16px var(--blue)44` : done ? "0 4px 12px rgba(22,163,74,.3)" : "none",
              transition: "all .35s cubic-bezier(.22,1,.36,1)",
            }}>
              {done
                ? <FaCheckCircle style={{ color: "#fff", fontSize: 16 }} />
                : <s.icon style={{ color: active ? "#fff" : "var(--foreground)", fontSize: 16, opacity: active ? 1 : .25 }} />
              }
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: ".5px",
              color: "var(--foreground)",
              opacity: active ? 1 : done ? .7 : .3,
              whiteSpace: "nowrap", textTransform: "uppercase",
            }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="at-step-line" style={{
              height: 2, width: 80, marginBottom: 22, flexShrink: 0,
              background: current > s.id
                ? "linear-gradient(90deg,#16a34a,var(--blue))"
                : "var(--card-border)",
              transition: "background .5s",
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────
   ERROR FIELD HELPERS
───────────────────────────────────────── */
const ErrorMsg = ({ msg }) => msg
  ? <div className="at-error-msg"><span>⚠</span> {msg}</div>
  : null;

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function AddTheaterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [screenErrors, setScreenErrors] = useState({});

  const [basicInfo, setBasicInfo] = useState({
    ownerId: "", name: "", location: "", city: "", state: "", pincode: "", contactNumber: "",
    hasRecliner: false, hasWifi: false, hasParking: false, hasCafe: false, hasWheelchair: false,
  });
  const [screens, setScreens] = useState([createNewScreen(1)]);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "THEATER_OWNER"],
    queryFn: () => getAllUsers({ role: "THEATER_OWNER" }),
  });
  const owners = usersData?.data || [];

  const mutation = useMutation({
    mutationFn: createTheater,
    onSuccess: () => {
      toast.success("Theater created successfully! 🎉");
      queryClient.invalidateQueries(["allTheatersAdmin"]);
      setTimeout(() => router.push("/admin/theaters"), 2000);
    },
    onError: err => toast.error(err.response?.data?.message || "Failed to create theater"),
  });

  /* ── Field-level validation ── */
  const VALIDATORS = {
    ownerId:       v => !v                          ? "Theater owner is required"           : "",
    name:          v => !v.trim()                   ? "Theater name is required"
                       : v.trim().length < 3        ? "Name must be at least 3 characters"
                       : v.trim().length > 100      ? "Name must be under 100 characters"   : "",
    location:      v => !v.trim()                   ? "Location is required"
                       : v.trim().length < 3        ? "Location must be at least 3 characters" : "",
    city:          v => !v.trim()                   ? "City is required"
                       : !/^[a-zA-Z\s\-'.]+$/.test(v.trim()) ? "City should contain only letters" : "",
    state:         v => !v.trim()                   ? "State is required"
                       : !/^[a-zA-Z\s\-'.]+$/.test(v.trim()) ? "State should contain only letters" : "",
    pincode:       v => v && !/^\d{6}$/.test(v.trim()) ? "Pincode must be exactly 6 digits"    : "",
    contactNumber: v => !v.trim()                   ? "Contact number is required"
                       : !/^\d{10}$/.test(v.trim()) ? "Enter a valid 10-digit mobile number"  : "",
  };

  const validateField = (name, value) => {
    if (!VALIDATORS[name]) return "";
    return VALIDATORS[name](value);
  };

  const handleBasicChange = e => {
    const { name, value, type, checked } = e.target;

    // Enforce max-length / digit-only on specific fields
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "contactNumber") {
      // Only allow digits, max 10
      finalValue = value.replace(/\D/g, "").slice(0, 10);
    }
    if (name === "pincode") {
      // Only digits, max 6
      finalValue = value.replace(/\D/g, "").slice(0, 6);
    }
    if (name === "city" || name === "state") {
      // No digits
      finalValue = value.replace(/[0-9]/g, "");
    }

    setBasicInfo(p => ({ ...p, [name]: finalValue }));

    // Live error clear/set
    if (type !== "checkbox") {
      const err = validateField(name, finalValue);
      setFieldErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    Object.keys(VALIDATORS).forEach(k => {
      const err = validateField(k, basicInfo[k] ?? "");
      if (err) errors[k] = err;
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    screens.forEach((s, i) => {
      const sErr = {};
      if (!s.name.trim())            sErr.name = "Screen name is required";
      else if (s.name.length > 50)   sErr.name = "Screen name too long (max 50 chars)";
      if (s.totalColumns < 1)        sErr.totalColumns = "Must have at least 1 seat per row";
      if (s.totalColumns > 30)       sErr.totalColumns = "Max 30 seats per row";
      if (s.seatRows.length === 0)   sErr.rows = "Screen must have at least 1 seat row";
      if (Object.keys(sErr).length)  errors[i] = sErr;
    });
    setScreenErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addScreen = () => {
    if (screens.length >= 20) { toast.error("Maximum 20 screens allowed!"); return; }
    const n = screens.length + 1;
    setScreens(p => [...p, createNewScreen(n, p[0]?.totalColumns || 20)]);
    toast.success(`Screen ${n} added!`);
  };

  const removeScreen = i => {
    setScreens(p => p.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, screenNumber: idx + 1, name: `Screen ${idx + 1}` })));
    // Clear errors for removed screen
    setScreenErrors(prev => {
      const next = {};
      Object.keys(prev).forEach(k => { if (parseInt(k) !== i) next[parseInt(k) > i ? parseInt(k) - 1 : k] = prev[k]; });
      return next;
    });
  };

  const updateScreen = (i, u) => {
    setScreens(p => p.map((s, idx) => idx === i ? { ...s, ...u } : s));
    // Clear errors for updated field
    if (u.name !== undefined && screenErrors[i]?.name) {
      setScreenErrors(prev => ({ ...prev, [i]: { ...prev[i], name: u.name.trim() ? "" : prev[i].name } }));
    }
  };

  const addRowToScreen = i => {
    setScreens(p => p.map((s, si) => {
      if (si !== i) return s;
      const last = s.seatRows[s.seatRows.length - 1];
      const next = String.fromCharCode(last.rowName.charCodeAt(0) + 1);
      if (next > "Z") { toast.error("Maximum 26 rows!"); return s; }
      return { ...s, totalRows: s.totalRows + 1, seatRows: [...s.seatRows, { rowName: next, category: "NORMAL", startSeat: 1, endSeat: s.totalColumns, priceMultiplier: 1 }] };
    }));
  };

  const removeRowFromScreen = (si, ri) => {
    setScreens(p => p.map((s, i) => {
      if (i !== si) return s;
      if (s.seatRows.length <= 1) { toast.error("At least one row required!"); return s; }
      return { ...s, totalRows: s.totalRows - 1, seatRows: s.seatRows.filter((_, idx) => idx !== ri) };
    }));
  };

  const updateSeatRow = (si, ri, r) => setScreens(p => p.map((s, i) => i !== si ? s : { ...s, seatRows: s.seatRows.map((row, idx) => idx === ri ? r : row) }));

  const handleSubmit = () => {
    const s1ok = validateStep1();
    const s2ok = validateStep2();
    if (!s1ok) { setStep(1); toast.error("Fix errors in Theater Info"); return; }
    if (!s2ok) { setStep(2); toast.error("Fix errors in Screens"); return; }
    mutation.mutate({
      ...basicInfo,
      screens: screens.map(({ screenNumber, name, totalRows, totalColumns, seatRows }) => ({
        screenNumber, name, totalRows, totalColumns,
        seatRows: seatRows.map(r => ({ rowName: r.rowName, category: r.category, startSeat: r.startSeat, endSeat: r.endSeat, priceMultiplier: r.priceMultiplier })),
      })),
    });
  };

  const BASIC_FIELDS = [
    { name: "name",          label: "Theater Name",    placeholder: "e.g., PVR Cinemas",  icon: FaBuilding,    type: "text",    maxLen: 100 },
    { name: "location",      label: "Location / Area", placeholder: "e.g., Juhu",          icon: FaMapMarkerAlt,type: "text",    maxLen: 100 },
    { name: "city",          label: "City",            placeholder: "e.g., Mumbai",        icon: FaCity,        type: "text",    maxLen: 50  },
    { name: "state",         label: "State",           placeholder: "e.g., Maharashtra",   icon: FaFlag,        type: "text",    maxLen: 50  },
    { name: "pincode",       label: "Pincode",         placeholder: "400049",              icon: null,          type: "text",    maxLen: 6,  inputMode: "numeric" },
    { name: "contactNumber", label: "Contact Number",  placeholder: "10-digit mobile",     icon: FaPhone,       type: "tel",     maxLen: 10  },
  ];

  return (
    <div className="at" style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Styles />
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: "'Sora',system-ui,sans-serif", fontWeight: 600, borderRadius: 12, fontSize: 13, background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)" }
      }} />

      {/* ══ HEADER ══ */}
      <div style={{
        background: "var(--card)", borderBottom: "1px solid var(--card-border)",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 4px 24px rgba(0,0,0,.07)",
      }}>
        <div className="at-header-accent" style={{ height: 3 }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 0", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button className="at-btn at-btn-ghost" onClick={() => router.back()} style={{ padding: "9px 14px", gap: 7, fontSize: 13 }}>
                <FaArrowLeft style={{ fontSize: 12 }} /> Back
              </button>
              <div style={{ width: 1, height: 32, background: "var(--card-border)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg, var(--blue), #2563eb)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px var(--blue)44",
                }}>
                  <MdTheaters style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "var(--foreground)", letterSpacing: "-.3px" }}>Add New Theater</div>
                  <div style={{ fontSize: 11.5, color: "var(--foreground)", opacity: .38, fontWeight: 500 }}>Step {step} of 3 — {STEPS[step - 1].label}</div>
                </div>
              </div>
            </div>
            <button className="at-btn at-btn-success" onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending
                ? <><div style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "at-spin .75s linear infinite" }} /> Creating…</>
                : <><FaCheckCircle style={{ fontSize: 13 }} /> Create Theater</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <StepIndicator current={step} />

        {/* ── STEP 1: BASIC INFO ── */}
        {step === 1 && (
          <div className="at-panel at-scale">
            <div style={{
              padding: "24px 28px", borderBottom: "1px solid var(--card-border)",
              background: "linear-gradient(135deg, var(--blue)0a, var(--purple)06)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: "var(--blue)18", border: "1.5px solid var(--blue)33",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FaBuilding style={{ color: "var(--blue)", fontSize: 18 }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)" }}>Theater Information</div>
                <div style={{ fontSize: 12.5, color: "var(--foreground)", opacity: .4, marginTop: 3 }}>Fill in the basic details about this theater</div>
              </div>
            </div>

            <div style={{ padding: "28px" }}>
              {/* Owner */}
              <div style={{ marginBottom: 24 }}>
                <label className="at-label">Theater Owner <span style={{ color: "var(--red)" }}>*</span></label>
                <div className="at-field">
                  <FaUserTie className="at-field-icon" />
                  <FaChevronDown style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--foreground)", opacity: .3, pointerEvents: "none" }} />
                  <select
                    name="ownerId"
                    value={basicInfo.ownerId}
                    onChange={handleBasicChange}
                    className={`at-select ${fieldErrors.ownerId ? "error" : ""}`}
                  >
                    <option value="">— Select Theater Owner —</option>
                    {isLoadingUsers
                      ? <option disabled>Loading owners…</option>
                      : owners.map(o => <option key={o._id} value={o._id}>{o.name} ({o.email})</option>)
                    }
                  </select>
                </div>
                <ErrorMsg msg={fieldErrors.ownerId} />
                {!isLoadingUsers && owners.length === 0 && (
                  <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "var(--red)10", border: "1px solid var(--red)33", fontSize: 12.5, color: "var(--red)", fontWeight: 600 }}>
                    No theater owners found. Please create a Theater Owner account first.
                  </div>
                )}
              </div>

              {/* Fields grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginBottom: 28 }}>
                {BASIC_FIELDS.map(f => (
                  <div key={f.name}>
                    <label className="at-label">
                      {f.label} {!["pincode"].includes(f.name) && <span style={{ color: "var(--red)" }}>*</span>}
                    </label>
                    <div className="at-field">
                      {f.icon && <f.icon className="at-field-icon" />}
                      <input
                        type={f.type}
                        name={f.name}
                        value={basicInfo[f.name]}
                        onChange={handleBasicChange}
                        placeholder={f.placeholder}
                        maxLength={f.maxLen}
                        inputMode={f.inputMode}
                        className={`at-input ${f.icon ? "at-input-icon" : ""} ${fieldErrors[f.name] ? "error" : ""}`}
                      />
                    </div>
                    <ErrorMsg msg={fieldErrors[f.name]} />
                    {/* Character counter for name / location */}
                    {["name","location"].includes(f.name) && basicInfo[f.name].length > 0 && (
                      <div style={{ fontSize: 10.5, color: "var(--foreground)", opacity: .3, marginTop: 3, textAlign: "right", fontWeight: 600 }}>
                        {basicInfo[f.name].length}/{f.maxLen}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Phone helper */}
              {basicInfo.contactNumber.length > 0 && basicInfo.contactNumber.length < 10 && (
                <div style={{ marginTop: -18, marginBottom: 20, padding: "8px 12px", borderRadius: 10, background: "var(--yellow)10", border: "1px solid var(--yellow)33", fontSize: 12, color: "var(--yellow)", fontWeight: 600 }}>
                  📱 {10 - basicInfo.contactNumber.length} more digit{10 - basicInfo.contactNumber.length !== 1 ? "s" : ""} needed
                </div>
              )}

              {/* Amenities */}
              <div>
                {/* Section header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <label className="at-label" style={{ marginBottom: 2 }}>Amenities &amp; Facilities</label>
                    <div style={{ fontSize: 11.5, color: "var(--foreground)", opacity: .38, fontWeight: 500 }}>
                      {Object.values(AMENITIES).filter(a => basicInfo[a.key]).length} of {AMENITIES.length} selected
                    </div>
                  </div>
                  {Object.values(AMENITIES).some(a => basicInfo[a.key]) && (
                    <button
                      type="button"
                      onClick={() => {
                        const allOn = AMENITIES.every(a => basicInfo[a.key]);
                        const patch = {};
                        AMENITIES.forEach(a => { patch[a.key] = !allOn; });
                        setBasicInfo(p => ({ ...p, ...patch }));
                      }}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        fontSize: 11.5, fontWeight: 700, color: "var(--foreground)",
                        fontFamily: "'Sora',system-ui,sans-serif", padding: "4px 8px",
                        borderRadius: 8, transition: "background .15s",
                      }}
                    >
                      {AMENITIES.every(a => basicInfo[a.key]) ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>

                {/* Cards grid */}
                <div className="at-amenity-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                  {AMENITIES.map((a, idx) => {
                    const on = basicInfo[a.key];
                    return (
                      <label
                        key={a.key}
                        className={`at-amenity ${on ? "active" : ""}`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <input type="checkbox" name={a.key} checked={on} onChange={handleBasicChange} />

                        {/* Checked badge top-right */}
                        {on && (
                          <div className="at-amenity-check">
                            <FaCheckCircle style={{ color: "#fff", fontSize: 9 }} />
                          </div>
                        )}

                        {/* Icon */}
                        <div
                          className="at-amenity-icon-wrap"
                          style={{
                            background: "transparent",
                            border: "none",
                          }}
                        >
                          <a.icon style={{
                            fontSize: 20,
                            color: "var(--foreground)",
                            opacity: on ? 0.85 : 0.25,
                            transition: "all .2s",
                          }} />
                        </div>

                        {/* Text */}
                        <div style={{ position: "relative", zIndex: 1 }}>
                          <div style={{
                            fontSize: 11.5, fontWeight: 800,
                            color: "var(--foreground)", opacity: on ? 1 : .55,
                            transition: "opacity .2s", lineHeight: 1.3,
                          }}>
                            {a.name}
                          </div>
                          <div style={{
                            fontSize: 10, color: "var(--foreground)", opacity: .32,
                            marginTop: 3, lineHeight: 1.3,
                          }}>
                            {a.desc}
                          </div>
                        </div>

                        {/* Toggle pill */}
                        <div
                          className="at-amenity-toggle"
                          style={{
                            background: "transparent",
                            color: "var(--foreground)",
                            opacity: on ? 0.8 : 0.3,
                            border: `1px solid ${on ? "var(--foreground)" : "transparent"}`,
                          }}
                        >
                          <div style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "var(--foreground)",
                            opacity: on ? 1 : 0.5,
                            transition: "all .2s",
                          }} />
                          {on ? "On" : "Off"}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Selected summary chips */}
                {AMENITIES.some(a => basicInfo[a.key]) && (
                  <div style={{
                    marginTop: 12, padding: "10px 14px", borderRadius: 12,
                    background: "var(--background)", border: "1px solid var(--card-border)",
                    display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--foreground)", opacity: .35, textTransform: "uppercase", letterSpacing: ".6px", marginRight: 4 }}>Active:</span>
                    {AMENITIES.filter(a => basicInfo[a.key]).map(a => (
                      <div key={a.key} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: "transparent", border: "1px solid var(--card-border)",
                        color: "var(--foreground)", opacity: 0.75,
                      }}>
                        <a.icon style={{ fontSize: 9 }} /> {a.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: "18px 28px", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "flex-end" }}>
              <button className="at-btn at-btn-primary" onClick={() => { if (validateStep1()) setStep(2); }}>
                Next: Configure Screens <span style={{ opacity: .7 }}>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: SCREENS ── */}
        {step === 2 && (
          <div className="at-panel at-scale">
            <div style={{
              padding: "24px 28px", borderBottom: "1px solid var(--card-border)",
              background: "linear-gradient(135deg, var(--purple)0a, var(--blue)06)",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: "var(--purple)18", border: "1.5px solid var(--purple)33",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MdScreenShare style={{ color: "var(--purple)", fontSize: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)" }}>Screens & Seat Layout</div>
                  <div style={{ fontSize: 12.5, color: "var(--foreground)", opacity: .4, marginTop: 3 }}>
                    {screens.length} screen{screens.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
                    {screens.reduce((t, s) => t + s.seatRows.reduce((a, r) => a + (r.endSeat - r.startSeat + 1), 0), 0)} total seats
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {screens.length >= 20 && (
                  <div style={{ padding: "6px 12px", borderRadius: 10, background: "var(--yellow)12", border: "1px solid var(--yellow)33", fontSize: 11.5, color: "var(--yellow)", fontWeight: 700 }}>
                    Max 20 screens reached
                  </div>
                )}
                <button
                  className="at-btn"
                  onClick={addScreen}
                  disabled={screens.length >= 20}
                  style={{
                    background: screens.length >= 20 ? "var(--card-border)" : "var(--green)",
                    color: screens.length >= 20 ? "var(--foreground)" : "#fff",
                    opacity: screens.length >= 20 ? .5 : 1,
                    borderRadius: 12, border: "none",
                    padding: "10px 20px", fontWeight: 700, fontSize: 13,
                    fontFamily: "'Sora',system-ui,sans-serif",
                    display: "flex", alignItems: "center", gap: 8,
                    boxShadow: screens.length >= 20 ? "none" : "0 4px 14px rgba(22,163,74,.35)",
                    transition: "all .2s", cursor: screens.length >= 20 ? "not-allowed" : "pointer",
                  }}
                >
                  <FaPlus style={{ fontSize: 11 }} /> Add Screen
                </button>
              </div>
            </div>

            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              {screens.map((s, i) => (
                <ScreenCard key={i} screen={s} index={i}
                  onUpdate={updateScreen} onRemove={removeScreen}
                  onAddRow={addRowToScreen} onRemoveRow={removeRowFromScreen} onUpdateRow={updateSeatRow}
                  screenErrors={screenErrors[i]}
                />
              ))}
            </div>

            <div style={{ padding: "18px 28px", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between" }}>
              <button className="at-btn at-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="at-btn at-btn-primary" onClick={() => { if (validateStep2()) setStep(3); else toast.error("Fix screen errors first"); }}>
                Review & Submit <span style={{ opacity: .7 }}>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: REVIEW ── */}
        {step === 3 && (
          <div className="at-panel at-scale">
            <div style={{
              padding: "24px 28px", borderBottom: "1px solid var(--card-border)",
              background: "linear-gradient(135deg, rgba(22,163,74,.06), var(--blue)04)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: "rgba(22,163,74,.12)", border: "1.5px solid rgba(22,163,74,.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FaCheckCircle style={{ color: "#16a34a", fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)" }}>Review & Submit</div>
                <div style={{ fontSize: 12.5, color: "var(--foreground)", opacity: .4, marginTop: 3 }}>Confirm all details before creating the theater</div>
              </div>
            </div>

            <div style={{ padding: "28px" }}>
              {/* Theater summary */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground)", opacity: .35, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Theater Details</div>
                <div style={{ background: "var(--background)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{
                    padding: "18px 20px", borderBottom: "1px solid var(--card-border)",
                    background: "linear-gradient(135deg, var(--blue)0a, var(--purple)06)",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: "linear-gradient(135deg, var(--blue), #2563eb)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 4px 14px var(--blue)44", flexShrink: 0,
                    }}>
                      <FaBuilding style={{ color: "#fff", fontSize: 19 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: "var(--foreground)" }}>{basicInfo.name || "—"}</div>
                      <div style={{ fontSize: 12.5, color: "var(--foreground)", opacity: .45, marginTop: 3 }}>{basicInfo.location}{basicInfo.city ? `, ${basicInfo.city}` : ""}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {[
                      { label: "Owner",   value: owners.find(o => o._id === basicInfo.ownerId)?.name || "—" },
                      { label: "Contact", value: basicInfo.contactNumber || "—" },
                      { label: "State",   value: basicInfo.state || "—" },
                      { label: "Pincode", value: basicInfo.pincode || "—" },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: "12px 20px",
                        borderBottom: i < 2 ? "1px solid var(--card-border)" : "none",
                        borderRight: i % 2 === 0 ? "1px solid var(--card-border)" : "none",
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--foreground)", opacity: .3, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {AMENITIES.some(a => basicInfo[a.key]) && (
                    <div style={{ padding: "14px 20px", borderTop: "1px solid var(--card-border)", display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {AMENITIES.filter(a => basicInfo[a.key]).map(a => (
                        <div key={a.key} style={{
                          padding: "5px 12px", borderRadius: 20,
                          background: "var(--blue)12", border: "1px solid var(--blue)33",
                          color: "var(--blue)", fontSize: 11.5, fontWeight: 700,
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          <a.icon style={{ fontSize: 10 }} /> {a.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Screens summary */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground)", opacity: .35, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>
                  Screens ({screens.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {screens.map((s, i) => {
                    const seats = s.seatRows.reduce((t, r) => t + (r.endSeat - r.startSeat + 1), 0);
                    const catCounts = s.seatRows.reduce((a, r) => { a[r.category] = (a[r.category] || 0) + (r.endSeat - r.startSeat + 1); return a; }, {});
                    return (
                      <div key={i} style={{
                        background: "var(--background)", border: "1px solid var(--card-border)",
                        borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                      }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: "var(--blue)14", border: "1.5px solid var(--blue)33",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <MdScreenShare style={{ color: "var(--blue)", fontSize: 16 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>{s.name}</div>
                          <div style={{ fontSize: 11.5, color: "var(--foreground)", opacity: .4, marginTop: 2 }}>
                            {s.seatRows.length} rows &nbsp;·&nbsp; {s.totalColumns} cols/row &nbsp;·&nbsp; <strong style={{ color: "var(--foreground)", opacity: .7 }}>{seats} total seats</strong>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {Object.entries(catCounts).map(([cat, n]) => {
                            const cfg = SEAT_TYPES[cat] || SEAT_TYPES.NORMAL;
                            return (
                              <div key={cat} style={{
                                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                color: `var(${cfg.cssVar})`, background: `var(${cfg.cssVar})12`, border: `1px solid var(${cfg.cssVar})33`,
                              }}>
                                {cfg.label} ×{n}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ padding: "18px 28px", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button className="at-btn at-btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="at-btn at-btn-success" onClick={handleSubmit} disabled={mutation.isPending}>
                {mutation.isPending
                  ? <><div style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "at-spin .75s linear infinite" }} /> Creating…</>
                  : <><FaCheckCircle style={{ fontSize: 13 }} /> Create Theater</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}