"use client";

import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from 'react-hot-toast';
import {
  FaPlus, FaTrash, FaBuilding, FaMapMarkerAlt, FaPhone, FaCity, FaFlag,
  FaCouch, FaWifi, FaParking, FaCoffee, FaAccessibleIcon, FaArrowLeft,
  FaCheckCircle, FaUserTie, FaChevronDown
} from 'react-icons/fa';
import { MdScreenShare, MdTheaters } from 'react-icons/md';
import { createTheater, getAllUsers } from "@/app/services/adminCommunication";

const AMENITIES = [
  { icon: FaCouch, name: "Recliner Seats", key: "hasRecliner", desc: "Premium recliner chairs" },
  { icon: FaWifi, name: "Free WiFi", key: "hasWifi", desc: "High-speed internet" },
  { icon: FaParking, name: "Parking", key: "hasParking", desc: "Covered car parking" },
  { icon: FaCoffee, name: "Food & Café", key: "hasCafe", desc: "In-house café & snacks" },
  { icon: FaAccessibleIcon, name: "Accessibility", key: "hasWheelchair", desc: "Wheelchair friendly" },
];

const SEAT_TYPES = {
  NORMAL: { label: "Standard", color: "blue", mult: "1×", desc: "Regular seating" },
  EXECUTIVE: { label: "Executive", color: "green", mult: "1.5×", desc: "Comfortable seats" },
  PREMIUM: { label: "Premium", color: "purple", mult: "2×", desc: "Luxury seating" },
  VIP: { label: "VIP", color: "yellow", mult: "3×", desc: "Royal experience" },
};

const STEPS = [
  { id: 1, label: "Theater Info", icon: FaBuilding },
  { id: 2, label: "Screens & Seats", icon: MdScreenShare },
  { id: 3, label: "Review", icon: FaCheckCircle },
];

const generateDefaultSeatRows = (totalColumns = 20) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const getCategory = i => i < 5 ? "NORMAL" : i < 10 ? "EXECUTIVE" : i < 13 ? "PREMIUM" : "VIP";
  const getMultiplier = c => ({ NORMAL: 1, EXECUTIVE: 1.5, PREMIUM: 2, VIP: 3 }[c] || 1);
  return Array.from({ length: 10 }, (_, i) => {
    const cat = getCategory(i);
    return { rowName: letters[i], category: cat, startSeat: 1, endSeat: cat === "VIP" ? Math.min(10, totalColumns) : totalColumns, priceMultiplier: getMultiplier(cat) };
  });
};

const createNewScreen = (n, cols = 20) => ({
  screenNumber: n, name: `Screen ${n}`, totalRows: 10, totalColumns: cols, seatRows: generateDefaultSeatRows(cols)
});

const SeatRowConfig = ({ row, index, onUpdate, onDelete, totalColumns }) => {
  const maxSeats = row.category === "VIP" ? Math.min(10, totalColumns) : totalColumns;
  const cfg = SEAT_TYPES[row.category] || SEAT_TYPES.NORMAL;

  return (
    <div className="grid grid-cols-[60px_1fr_80px_80px_80px_42px] gap-2 bg-background border border-border rounded-xl p-2.5 items-center hover:border-blue-500/50 transition-colors animate-in fade-in duration-300" style={{ animationDelay: `${index * 30}ms` }}>
      <input
        type="text"
        value={row.rowName}
        onChange={e => onUpdate(index, { ...row, rowName: e.target.value.toUpperCase() })}
        maxLength={2}
        className="w-full px-2 py-2 bg-background border border-border rounded-lg text-center font-extrabold text-base focus:outline-none focus:border-blue-500 transition-colors"
        placeholder="A"
      />
      <div className="relative">
        <select
          value={row.category}
          onChange={e => {
            const cat = e.target.value;
            onUpdate(index, { ...row, category: cat, endSeat: cat === "VIP" ? Math.min(10, totalColumns) : totalColumns, priceMultiplier: { NORMAL: 1, EXECUTIVE: 1.5, PREMIUM: 2, VIP: 3 }[cat] });
          }}
          className="w-full px-3 py-2 pr-8 bg-background border border-border rounded-lg text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:border-blue-500 transition-colors"
        >
          {Object.entries(SEAT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/30 text-[9px] pointer-events-none" />
        <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-${cfg.color}-500`} />
      </div>
      <input 
        type="number" 
        value={row.startSeat} 
        min={1}
        onChange={e => onUpdate(index, { ...row, startSeat: parseInt(e.target.value) })}
        className="px-2 py-2 bg-background border border-border rounded-lg text-center text-sm focus:outline-none focus:border-blue-500 transition-colors" 
      />
      <input 
        type="number" 
        value={row.endSeat} 
        min={row.startSeat} 
        max={maxSeats}
        onChange={e => {
          let v = parseInt(e.target.value);
          if (v > maxSeats) v = maxSeats;
          if (v < row.startSeat) v = row.startSeat;
          onUpdate(index, { ...row, endSeat: v });
        }}
        className="px-2 py-2 bg-background border border-border rounded-lg text-center text-sm focus:outline-none focus:border-blue-500 transition-colors" 
      />
      <input 
        type="number" 
        step="0.5" 
        value={row.priceMultiplier}
        onChange={e => onUpdate(index, { ...row, priceMultiplier: parseFloat(e.target.value) })}
        className="px-2 py-2 bg-background border border-border rounded-lg text-center text-sm focus:outline-none focus:border-blue-500 transition-colors" 
      />
      <button onClick={() => onDelete(index)} className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-colors">
        <FaTrash className="text-[11px]" />
      </button>
    </div>
  );
};

const ScreenCard = ({ screen, index, onUpdate, onRemove, onAddRow, onRemoveRow, onUpdateRow }) => {
  const [open, setOpen] = useState(true);
  const totalSeats = screen.seatRows.reduce((s, r) => s + (r.endSeat - r.startSeat + 1), 0);

  return (
    <div className="border border-border rounded-2xl overflow-hidden animate-in fade-in duration-300" style={{ animationDelay: `${index * 80}ms` }}>
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${open ? 'bg-blue-500/5 border-b border-border' : ''}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <MdScreenShare className="text-white text-lg" />
          </div>
          <div>
            <div className="font-extrabold text-foreground">{screen.name}</div>
            <div className="text-xs text-foreground/40 mt-0.5 font-medium">
              {screen.seatRows.length} rows · {screen.totalColumns} cols · {totalSeats} total seats
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={e => { e.stopPropagation(); onRemove(index); }} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors">
            <FaTrash className="inline mr-1.5 text-[10px]" /> Remove
          </button>
          <div className={`w-7 h-7 rounded-lg bg-border flex items-center justify-center text-foreground/45 text-xs transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
            <FaChevronDown />
          </div>
        </div>
      </div>
      {open && (
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-2 block">Screen Name</label>
              <input 
                type="text" 
                value={screen.name} 
                onChange={e => onUpdate(index, { name: e.target.value })} 
                placeholder="e.g. Screen 1" 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-2 block">Seats Per Row</label>
              <input 
                type="number" 
                value={screen.totalColumns} 
                min={1} 
                max={30} 
                onChange={e => {
                  const cols = parseInt(e.target.value);
                  onUpdate(index, { 
                    totalColumns: cols, 
                    seatRows: screen.seatRows.map(r => ({ 
                      ...r, 
                      endSeat: r.category === "VIP" ? Math.min(10, cols) : cols 
                    })) 
                  });
                }} 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(SEAT_TYPES).map(([k, v]) => (
              <div key={k} className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-${v.color}-500/10 border border-${v.color}-500/30 text-${v.color}-400`}>
                {v.label} {v.mult}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[60px_1fr_80px_80px_80px_42px] gap-2 pb-2 mb-2 border-b border-border">
            {["Row", "Category", "Start", "End", "Price ×", ""].map((h, i) => (
              <div key={i} className="text-[10px] font-bold text-foreground/30 uppercase tracking-wider text-center">{h}</div>
            ))}
          </div>
          <div className="max-h-[340px] overflow-y-auto space-y-1.5">
            {screen.seatRows.map((row, ri) => (
              <SeatRowConfig 
                key={ri} 
                row={row} 
                index={ri}
                onUpdate={(i, r) => onUpdateRow(index, ri, r)}
                onDelete={() => onRemoveRow(index, ri)}
                totalColumns={screen.totalColumns} 
              />
            ))}
          </div>
          <button 
            onClick={() => onAddRow(index)} 
            className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-border bg-transparent text-foreground/50 font-bold text-sm flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 hover:opacity-100 transition-all"
          >
            <FaPlus className="text-[10px]" /> Add Row
          </button>
        </div>
      )}
    </div>
  );
};

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((s, i) => {
      const done = current > s.id;
      const active = current === s.id;
      return (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-2 z-[1]">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${done ? 'bg-green-500 border-2 border-green-500 shadow-lg shadow-green-500/30' : active ? 'bg-blue-500 border-2 border-blue-500 shadow-lg shadow-blue-500/30' : 'bg-background border-2 border-border'}`}>
              {done ? <FaCheckCircle className="text-white text-base" /> : <s.icon className={`text-base ${active ? 'text-white' : 'text-foreground/25'}`} />}
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${active || done ? 'text-foreground' : 'text-foreground/30'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-20 mb-5 transition-all duration-500 ${current > s.id ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-border'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default function AddTheaterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
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

  const handleBasicChange = e => {
    const { name, value, type, checked } = e.target;
    
    // Validation for pincode - only numbers, max 6 digits
    if (name === "pincode") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 6) {
        setBasicInfo(p => ({ ...p, [name]: onlyNums }));
      }
      return;
    }
    
    // Validation for contact number - only numbers, max 10 digits
    if (name === "contactNumber") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 10) {
        setBasicInfo(p => ({ ...p, [name]: onlyNums }));
      }
      return;
    }
    
    setBasicInfo(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addScreen = () => {
    const n = screens.length + 1;
    setScreens(p => [...p, createNewScreen(n, p[0]?.totalColumns || 20)]);
    toast.success(`Screen ${n} added!`);
  };
  
  const removeScreen = i => {
    if (screens.length <= 1) { 
      toast.error("At least one screen is required!"); 
      return; 
    }
    setScreens(p => p.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, screenNumber: idx + 1, name: `Screen ${idx + 1}` })));
  };
  
  const updateScreen = (i, u) => setScreens(p => p.map((s, idx) => idx === i ? { ...s, ...u } : s));
  
  const addRowToScreen = i => {
    setScreens(p => p.map((s, si) => {
      if (si !== i) return s;
      const last = s.seatRows[s.seatRows.length - 1];
      const next = String.fromCharCode(last.rowName.charCodeAt(0) + 1);
      if (next > "Z") { 
        toast.error("Maximum 26 rows!"); 
        return s; 
      }
      return { 
        ...s, 
        totalRows: s.totalRows + 1, 
        seatRows: [...s.seatRows, { 
          rowName: next, 
          category: "NORMAL", 
          startSeat: 1, 
          endSeat: s.totalColumns, 
          priceMultiplier: 1 
        }] 
      };
    }));
  };
  
  const removeRowFromScreen = (si, ri) => {
    setScreens(p => p.map((s, i) => {
      if (i !== si) return s;
      if (s.seatRows.length <= 1) { 
        toast.error("At least one row required!"); 
        return s; 
      }
      return { 
        ...s, 
        totalRows: s.totalRows - 1, 
        seatRows: s.seatRows.filter((_, idx) => idx !== ri) 
      };
    }));
  };
  
  const updateSeatRow = (si, ri, r) => setScreens(p => p.map((s, i) => i !== si ? s : { ...s, seatRows: s.seatRows.map((row, idx) => idx === ri ? r : row) }));

  const validateStep1 = () => {
    if (!basicInfo.ownerId) { 
      toast.error("Select a theater owner"); 
      return false; 
    }
    if (!basicInfo.name.trim()) { 
      toast.error("Theater name is required"); 
      return false; 
    }
    if (!basicInfo.location.trim()) { 
      toast.error("Location is required"); 
      return false; 
    }
    if (!basicInfo.city.trim()) { 
      toast.error("City is required"); 
      return false; 
    }
    if (!basicInfo.state.trim()) { 
      toast.error("State is required"); 
      return false; 
    }
    if (!basicInfo.contactNumber.trim()) { 
      toast.error("Contact number is required"); 
      return false; 
    }
    // Validate contact number length
    if (basicInfo.contactNumber.length !== 10) { 
      toast.error("Contact number must be exactly 10 digits"); 
      return false; 
    }
    // Validate pincode if provided
    if (basicInfo.pincode && basicInfo.pincode.length !== 6) { 
      toast.error("Pincode must be exactly 6 digits"); 
      return false; 
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateStep1()) { 
      setStep(1); 
      return; 
    }
    mutation.mutate({
      ...basicInfo,
      screens: screens.map(({ screenNumber, name, totalRows, totalColumns, seatRows }) => ({
        screenNumber, 
        name, 
        totalRows, 
        totalColumns,
        seatRows: seatRows.map(r => ({ 
          rowName: r.rowName, 
          category: r.category, 
          startSeat: r.startSeat, 
          endSeat: r.endSeat, 
          priceMultiplier: r.priceMultiplier 
        })),
      })),
    });
  };

  const BASIC_FIELDS = [
    { name: "name", label: "Theater Name", placeholder: "e.g., PVR Cinemas", icon: FaBuilding, type: "text", required: true },
    { name: "location", label: "Location / Area", placeholder: "e.g., Juhu", icon: FaMapMarkerAlt, type: "text", required: true },
    { name: "city", label: "City", placeholder: "e.g., Mumbai", icon: FaCity, type: "text", required: true },
    { name: "state", label: "State", placeholder: "e.g., Maharashtra", icon: FaFlag, type: "text", required: true },
    { name: "pincode", label: "Pincode", placeholder: "400049", icon: null, type: "text", required: false, maxLength: 6, pattern: "[0-9]{6}" },
    { name: "contactNumber", label: "Contact Number", placeholder: "9876543210", icon: FaPhone, type: "tel", required: true, maxLength: 10, pattern: "[0-9]{10}" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Toaster position="top-right" toastOptions={{ className: "!bg-card !text-foreground !border-border !rounded-xl !text-sm !font-semibold" }} />
      
      {/* Header with dark mode support */}
      <div className="sticky top-0 z-[100] bg-blue border-b border-border shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-transparent text-foreground font-semibold text-sm hover:bg-border/30 transition-colors"
              >
                <FaArrowLeft className="text-xs" /> Back
              </button>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <MdTheaters className="text-white text-lg" />
                </div>
                <div>
                  <div className="text-lg font-black text-foreground tracking-tight dark:text-white">Add New Theater</div>
                  <div className="text-xs text-foreground/40 font-medium dark:text-black">Step {step} of 3 — {STEPS[step - 1].label}</div>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={mutation.isPending} 
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-extrabold text-sm shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating…</> : 
                <><FaCheckCircle className="text-xs" /> Create Theater</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <StepIndicator current={step} />

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-7 py-6 border-b border-border bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <FaBuilding className="text-blue-500 text-lg" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-foreground">Theater Information</div>
                  <div className="text-xs text-foreground/40 mt-1">Fill in the basic details about this theater</div>
                </div>
              </div>
            </div>
            <div className="p-7">
              {/* Owner Selection */}
              <div className="mb-6">
                <label className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider mb-2 block">Theater Owner <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaUserTie className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/30 text-sm" />
                  <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/30 text-[10px]" />
                  <select 
                    name="ownerId" 
                    value={basicInfo.ownerId} 
                    onChange={handleBasicChange} 
                    className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-xl text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">— Select Theater Owner —</option>
                    {isLoadingUsers ? 
                      <option disabled>Loading owners…</option> : 
                      owners.map(o => <option key={o._id} value={o._id}>{o.name} ({o.email})</option>)
                    }
                  </select>
                </div>
                {!isLoadingUsers && owners.length === 0 && (
                  <div className="mt-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
                    No theater owners found. Please create a Theater Owner account first.
                  </div>
                )}
              </div>

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
                {BASIC_FIELDS.map(f => (
                  <div key={f.name}>
                    <label className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider mb-2 block">
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                      {!f.required && <span className="text-foreground/30 text-[9px] ml-1">(Optional)</span>}
                    </label>
                    <div className="relative">
                      {f.icon && <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/30 text-sm" />}
                      <input 
                        type={f.type} 
                        name={f.name} 
                        value={basicInfo[f.name]} 
                        onChange={handleBasicChange} 
                        placeholder={f.placeholder} 
                        maxLength={f.maxLength}
                        className={`w-full ${f.icon ? 'pl-10' : 'px-4'} py-3 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors`} 
                      />
                    </div>
                    {f.name === "contactNumber" && (
                      <p className="text-[10px] text-foreground/30 mt-1 ml-1">{basicInfo.contactNumber.length}/10 digits</p>
                    )}
                    {f.name === "pincode" && (
                      <p className="text-[10px] text-foreground/30 mt-1 ml-1">{basicInfo.pincode.length}/6 digits</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div>
                <label className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider mb-3 block">Amenities & Facilities</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AMENITIES.map(a => (
                    <label 
                      key={a.key} 
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${basicInfo[a.key] ? 'border-blue-500 bg-blue-500/10 shadow-sm shadow-blue-500/20' : 'border-border bg-background hover:border-blue-500/50'}`}
                    >
                      <input 
                        type="checkbox" 
                        name={a.key} 
                        checked={basicInfo[a.key]} 
                        onChange={handleBasicChange} 
                        className="absolute opacity-0 pointer-events-none" 
                      />
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${basicInfo[a.key] ? 'bg-blue-500/20 border-2 border-blue-500/50' : 'bg-border border-2 border-transparent'}`}>
                        <a.icon className={`text-sm ${basicInfo[a.key] ? 'text-blue-500' : 'text-foreground/35'}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${basicInfo[a.key] ? 'text-blue-500' : 'text-foreground/70'}`}>{a.name}</div>
                        <div className="text-[11px] text-foreground/35 mt-0.5">{a.desc}</div>
                      </div>
                      {basicInfo[a.key] && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <FaCheckCircle className="text-white text-[10px]" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-7 py-5 border-t border-border flex justify-end">
              <button 
                onClick={() => { if (validateStep1()) setStep(2); }} 
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Next: Configure Screens <span className="text-lg leading-none">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Screens */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-7 py-6 border-b border-border bg-gradient-to-r from-purple-500/5 to-blue-500/5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <MdScreenShare className="text-purple-500 text-xl" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-foreground">Screens & Seat Layout</div>
                    <div className="text-xs text-foreground/40 mt-1">
                      {screens.length} screen{screens.length !== 1 ? "s" : ""} · {screens.reduce((t, s) => t + s.seatRows.reduce((a, r) => a + (r.endSeat - r.startSeat + 1), 0), 0)} total seats
                    </div>
                  </div>
                </div>
                <button 
                  onClick={addScreen} 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-extrabold text-sm shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <FaPlus className="text-[11px]" /> Add Screen
                </button>
              </div>
            </div>
            <div className="p-7 space-y-4">
              {screens.map((s, i) => (
                <ScreenCard 
                  key={i} 
                  screen={s} 
                  index={i}
                  onUpdate={updateScreen} 
                  onRemove={removeScreen}
                  onAddRow={addRowToScreen} 
                  onRemoveRow={removeRowFromScreen} 
                  onUpdateRow={updateSeatRow}
                />
              ))}
            </div>
            <div className="px-7 py-5 border-t border-border flex justify-between">
              <button 
                onClick={() => setStep(1)} 
                className="px-6 py-2.5 rounded-xl border-2 border-border bg-transparent text-foreground font-bold text-sm hover:bg-border/30 transition-colors"
              >
                ← Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Review & Submit <span className="text-lg leading-none">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-7 py-6 border-b border-border bg-gradient-to-r from-green-500/5 to-blue-500/5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-foreground">Review & Submit</div>
                  <div className="text-xs text-foreground/40 mt-1">Confirm all details before creating the theater</div>
                </div>
              </div>
            </div>
            <div className="p-7">
              {/* Theater Details Summary */}
              <div className="mb-5">
                <div className="text-[10px] font-bold text-foreground/35 uppercase tracking-wider mb-3">Theater Details</div>
                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-blue-500/5 to-purple-500/5 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                      <FaBuilding className="text-white text-lg" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-foreground">{basicInfo.name || "—"}</div>
                      <div className="text-xs text-foreground/45 mt-0.5">{basicInfo.location}{basicInfo.city ? `, ${basicInfo.city}` : ""}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border">
                    {[
                      { label: "Owner", value: owners.find(o => o._id === basicInfo.ownerId)?.name || "—" },
                      { label: "Contact", value: basicInfo.contactNumber || "—" },
                      { label: "State", value: basicInfo.state || "—" },
                      { label: "Pincode", value: basicInfo.pincode || "—" },
                    ].map((item, i) => (
                      <div key={i} className={`px-5 py-3 ${i < 2 ? 'border-b border-border' : ''}`}>
                        <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-wider mb-1">{item.label}</div>
                        <div className="text-sm font-bold text-foreground">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {AMENITIES.some(a => basicInfo[a.key]) && (
                    <div className="px-5 py-3 border-t border-border flex flex-wrap gap-2">
                      {AMENITIES.filter(a => basicInfo[a.key]).map(a => (
                        <div key={a.key} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[11px] font-extrabold flex items-center gap-1.5">
                          <a.icon className="text-[9px]" /> {a.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Screens Summary */}
              <div>
                <div className="text-[10px] font-bold text-foreground/35 uppercase tracking-wider mb-3">Screens ({screens.length})</div>
                <div className="space-y-2.5">
                  {screens.map((s, i) => {
                    const seats = s.seatRows.reduce((t, r) => t + (r.endSeat - r.startSeat + 1), 0);
                    const catCounts = s.seatRows.reduce((a, r) => { 
                      a[r.category] = (a[r.category] || 0) + (r.endSeat - r.startSeat + 1); 
                      return a; 
                    }, {});
                    return (
                      <div key={i} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                          <MdScreenShare className="text-blue-500 text-base" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-foreground">{s.name}</div>
                          <div className="text-[11px] text-foreground/40 mt-0.5">
                            {s.seatRows.length} rows · {s.totalColumns} cols/row · <strong className="text-foreground/70">{seats} total seats</strong>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(catCounts).map(([cat, n]) => {
                            const cfg = SEAT_TYPES[cat] || SEAT_TYPES.NORMAL;
                            return (
                              <div key={cat} className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-${cfg.color}-500/10 border border-${cfg.color}-500/30 text-${cfg.color}-400`}>
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
            <div className="px-7 py-5 border-t border-border flex justify-between items-center">
              <button 
                onClick={() => setStep(2)} 
                className="px-6 py-2.5 rounded-xl border-2 border-border bg-transparent text-foreground font-bold text-sm hover:bg-border/30 transition-colors"
              >
                ← Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={mutation.isPending} 
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-extrabold text-sm shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating…</> : 
                  <><FaCheckCircle className="text-xs" /> Create Theater</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}