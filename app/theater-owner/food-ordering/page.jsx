"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaUtensils, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaCalendarAlt, FaClock, FaChair, FaRupeeSign, FaSpinner, FaStore, FaLock, FaHistory, FaTimes, FaEye, FaDownload } from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import { getMyTheaters, getTheaterByIdAdmin } from "../../services/adminCommunication";
import axios from "axios";
import { io } from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { generateInvoicePDF } from "../../utils/invoiceGenerator";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL || "http://localhost:5000/api";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const prefix = normalizedPath.startsWith('/') ? '' : '/';
  const baseUrl = BE_URL.replace('/api', '');
  return `${baseUrl}${prefix}${normalizedPath}`;
};

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get products by theater (using theater owner endpoint)
const getTheaterProducts = async (theaterId) => {
  try {
    const res = await axios.get(`${BE_URL}/theater-owner/theater/${theaterId}/products`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, data: { products: {}, store: null } };
  }
};

// Get theater owner's shows
const getMyShows = async () => {
  try {
    const res = await axios.get(`${BE_URL}/theater-owner/my-shows`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error fetching shows:', error);
    return { success: false, data: [] };
  }
};

// Get theater owner profile (for accessible seats)
const getMe = async () => {
  try {
    const res = await axios.get(`${BE_URL}/auth/me`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success: false };
  }
};

// Get available seats for a show timing
const getAvailableSeats = async (showId, timingId) => {
  try {
    const res = await axios.get(`${BE_URL}/public/shows/${showId}/seats`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error fetching available seats:', error);
    return { success: false };
  }
};

// Get theater bookings
const getTheaterBookings = async (theaterId) => {
  try {
    const res = await axios.get(`${BE_URL}/theater-owner/theater/${theaterId}/bookings`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { success: false, data: [] };
  }
};

// Get order history
const getOrderHistory = async () => {
  try {
    const res = await axios.get(`${BE_URL}/theater-owner/orders/history`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    return { success: false, data: [] };
  }
};

// Add to cart (using theater owner endpoint)
const addToCart = async (productId, quantity) => {
  try {
    const res = await axios.post(`${BE_URL}/theater-owner/cart/add`, { productId, quantity }, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return error.response?.data || { success: false, message: error.message || 'Error adding to cart' };
  }
};

// Get cart
const getCart = async () => {
  try {
    const res = await axios.get(`${BE_URL}/theater-owner/cart`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { success: false, data: { items: [], totalAmount: 0 } };
  }
};

// Place order with COD
const placeOrder = async (deliveryType, specialInstructions, bookingId, scheduledFor) => {
  try {
    const res = await axios.post(`${BE_URL}/theater-owner/order/place`, {
      deliveryType,
      specialInstructions,
      bookingId,
      paymentMethod: 'CASH',
      scheduledFor
    }, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error placing order:', error);
    return { success: false };
  }
};

// Update cart item
const updateCartItem = async (productId, quantity) => {
  try {
    const res = await axios.put(`${BE_URL}/theater-owner/cart/${productId}`, { quantity }, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false };
  }
};

// Remove from cart
const removeFromCart = async (productId) => {
  try {
    const res = await axios.delete(`${BE_URL}/theater-owner/cart/${productId}`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false };
  }
};

// ==================== CINEMA SEAT FLOOR COMPONENT ====================
const CinemaSeatFloor = ({ levelKey, zones, seats, rows, cols, aisleCols = [], aisleRows = [], selected, onToggle, accessibleSeatSet, bookedSeatsSet = new Set() }) => {
  const getRowLabel = (r) => String.fromCharCode(65 + r);
  const getZone = (id) => zones.find((z) => z.id === id);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const buildRowSegments = (r) => {
    const segs = [];
    let c = 0;
    while (c < cols) {
      const k = `${r}-${c}`;
      const sd = seats[k];
      const zone = sd?.zone ? getZone(sd.zone) : null;
      if (zone?.noSeat) {
        let span = 1;
        while (c + span < cols && seats[`${r}-${c + span}`]?.zone === zone.id) span++;
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
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 22, flexShrink: 0 }} />
          {Array.from({ length: cols }, (_, c) => (
            <span key={c} style={{ display: "contents" }}>
              {aisleCols.find((a) => a.idx === c - 1) && <div style={{ width: 14, flexShrink: 0 }} />}
              <div style={{ width: 22, textAlign: "center", fontSize: 9, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>
                {c + 1}
              </div>
            </span>
          ))}
        </div>

        {Array.from({ length: rows }, (_, r) => {
          const hasRowAisle = aisleRows.find((a) => a.idx === r - 1);
          const segs = buildRowSegments(r);
          const rowLabel = getRowLabel(r);

          return (
            <span key={r} style={{ display: "contents" }}>
              {hasRowAisle && <div style={{ height: 12, flexShrink: 0, alignSelf: "stretch" }} />}

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 22, textAlign: "center", fontSize: 10, fontWeight: 700, color: "#9ca3af", flexShrink: 0 }}>
                  {rowLabel}
                </div>

                {segs.map((seg, si) => {
                  if (seg.type === "noSeatBlock") {
                    const colAisle = aisleCols.find((a) => a.idx === seg.startC - 1);
                    const blockWidth = seg.colSpan * 22 + (seg.colSpan - 1) * 4;
                    return (
                      <span key={si} style={{ display: "contents" }}>
                        {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                        <div
                          style={{
                            width: blockWidth,
                            height: 22,
                            flexShrink: 0,
                            borderRadius: 5,
                            background: seg.zone.color + "22",
                            border: `1.5px solid ${seg.zone.color}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {seg.zone.label && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: seg.zone.color,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                padding: "0 4px",
                              }}
                            >
                              {seg.zone.label}
                            </span>
                          )}
                        </div>
                      </span>
                    );
                  }

                  const c = seg.c;
                  const k = `${r}-${c}`;
                  const fullKey = `${levelKey}::${k}`;
                  const sd = seats[k];
                  const zone = sd?.zone ? getZone(sd.zone) : null;
                  const isAisle = !sd || sd.aisle;
                  const isBlocked = sd?.blocked;
                  const seatNumber = `${rowLabel}${c + 1}`;
                  const isBooked = bookedSeatsSet.has(seatNumber);
                  const isSel = selected.has(fullKey);
                  const col = zone ? zone.color : "#4a9edd";
                  const colAisle = aisleCols.find((a) => a.idx === c - 1);
                  const isAccessible = accessibleSeatSet?.has(seatNumber) || false;

                  let seatStyle = {
                    width: 26,
                    height: 26,
                    flexShrink: 0,
                    borderRadius: "6px 6px 4px 4px",
                    cursor: "default",
                    fontSize: 0,
                    border: "none",
                    outline: "none",
                    transition: "transform .1s",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  };

                  if (isAisle) {
                    seatStyle = { ...seatStyle, background: "transparent", visibility: "hidden" };
                  } else if (isBlocked) {
                    seatStyle = { ...seatStyle, background: "#1f2028", border: "1.5px solid #2a2a38", opacity: 0.5 };
                  } else if (isBooked) {
                    if (isSel) {
                      seatStyle = { ...seatStyle, background: "#f59e0b", border: "2px solid #fff", cursor: "pointer", transform: "scale(1.05)" };
                    } else {
                      seatStyle = { 
                        ...seatStyle, 
                        background: "#dc2626", 
                        border: "2px solid #b91c1c", 
                        opacity: 0.85,
                        cursor: "pointer"
                      };
                    }
                  } else if (!isAccessible) {
                    seatStyle = { ...seatStyle, background: "#2a2a38", border: "1.5px solid #3a3a48", opacity: 0.35 };
                  } else if (isSel) {
                    seatStyle = { ...seatStyle, background: col, border: `2px solid #fff`, cursor: "pointer", transform: "scale(1.05)" };
                  } else {
                    seatStyle = { ...seatStyle, background: col + "28", border: `1.5px solid ${col}70`, cursor: "pointer" };
                  }

                  const seatTooltip = !isAisle && zone ? `${rowLabel}${c + 1} · ${zone.name}${isBooked ? ' (Booked)' : ''}` : "";
                  const isSeatBooked = isBooked && !isAisle && !isBlocked;

                  return (
                    <span key={si} style={{ display: "contents" }}>
                      {colAisle && <div style={{ width: 14, flexShrink: 0 }} />}
                      <button
                        style={seatStyle}
                        disabled={isAisle || isBlocked}
                        onClick={() => onToggle(fullKey, zone, seatNumber)}
                        onMouseEnter={() => setHoveredSeat(seatNumber)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        title={seatTooltip}
                        className="relative group"
                      >
                        {isSeatBooked && !isSel && (
                          <FaLock className="w-4 h-4 text-white opacity-90" />
                        )}
                      </button>
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

const colorMap = {
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  yellow: "#eab308",
  indigo: "#6366f1",
  cyan: "#06b6d4",
  emerald: "#10b981",
  orange: "#f97316",
};

const DashboardStatCard = ({ title, value, icon: Icon, color = "blue", prefix = "" }) => {
  const themeColor = colorMap[color] || colorMap.blue;
  const displayValue = `${prefix}${Number(value || 0).toLocaleString()}`;

  return (
    <div
      className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <div className="relative">
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>
          {title}
        </div>
        <div className="text-[34px] font-black tracking-tighter leading-none" style={{ color: "var(--foreground)" }}>
          {displayValue}
        </div>
      </div>
      <div
        className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `${themeColor}15`, border: `1px solid ${themeColor}30` }}
      >
        {Icon && <Icon className="text-xl transition-transform group-hover:scale-110" style={{ color: themeColor }} />}
      </div>
    </div>
  );
};

const FoodOrderingPage = () => {
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedTiming, setSelectedTiming] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [showProducts, setShowProducts] = useState(false);
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [bookedSeats, setBookedSeats] = useState(new Set());
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [orderType, setOrderType] = useState('now'); // 'now' or 'scheduled'
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [productQuantities, setProductQuantities] = useState({});
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [placedOrderData, setPlacedOrderData] = useState(null);

  // Fetch theaters
  const { data: theatersData } = useQuery({
    queryKey: ["my-theaters"],
    queryFn: getMyTheaters,
  });

  // Fetch shows
  const { data: showsData } = useQuery({
    queryKey: ["my-shows"],
    queryFn: getMyShows,
  });

  // Fetch profile for accessible seats
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: getMe,
  });

  // Fetch theater data when selected
  const { data: theaterData } = useQuery({
    queryKey: ["theater", selectedTheater?._id],
    queryFn: () => getTheaterByIdAdmin(selectedTheater?._id),
    enabled: !!selectedTheater,
  });

  // Fetch available seats when timing is selected
  const { data: seatsData } = useQuery({
    queryKey: ["available-seats", selectedShow?._id, selectedTiming?._id],
    queryFn: () => getAvailableSeats(selectedShow?._id, selectedTiming?._id),
    enabled: !!selectedShow && !!selectedTiming,
  });

  // Fetch store and products when theater is selected
  const { data: storeData, refetch: refetchStore } = useQuery({
    queryKey: ["store-by-theater", selectedTheater?._id],
    queryFn: () => getTheaterProducts(selectedTheater?._id),
    enabled: !!selectedTheater,
  });

  // Fetch cart
  const { data: cartData, refetch: refetchCart } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    refetchInterval: 5000,
  });

  // Fetch order history
  const { data: orderHistoryData, refetch: refetchOrderHistory } = useQuery({
    queryKey: ["order-history"],
    queryFn: getOrderHistory,
    enabled: showOrderHistory,
  });

  useEffect(() => {
    if (cartData?.success) {
      setCart(cartData.data);
    }
  }, [cartData]);

  // Connect to Socket.io for live updates
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {}

    if (!user) return;

    const token = localStorage.getItem("token");
    const SOCKET_URL = process.env.NEXT_PUBLIC_BE_URL?.replace("/api", "") || "http://localhost:5000";

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Theater Owner Socket connected");
      socketInstance.emit("buyer-join", user._id);
    });

    socketInstance.on("order-status-updated", (data) => {
      console.log("📢 Live Order update received:", data);
      refetchOrderHistory();
      toast.success(data.message || `Order #${data.orderId} status updated!`, {
        icon: "🍱",
        duration: 5000,
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #334155"
        }
      });
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [refetchOrderHistory]);

  const extractSeatNumbers = (specialInstructions) => {
    if (!specialInstructions) return 'N/A';
    const match = specialInstructions.match(/seat\s+([A-Z0-9,\s]+)/i);
    return match ? match[1].trim() : specialInstructions;
  };

  const theaters = useMemo(() => {
    if (Array.isArray(theatersData?.data)) return theatersData.data;
    if (Array.isArray(theatersData)) return theatersData;
    return [];
  }, [theatersData]);

  // Auto-select first theater when theaters load
  useEffect(() => {
    if (theaters.length > 0 && !selectedTheater) {
      setSelectedTheater(theaters[0]);
    }
  }, [theaters, selectedTheater]);
  const shows = showsData?.data || showsData || [];
  const store = storeData?.data?.store;
  const assignedStores = storeData?.data?.stores || (store ? [store] : []);
  const products = storeData?.data?.products || {};
  const [selectedVendorFilter, setSelectedVendorFilter] = useState(null);
  const [exploreAllVendors, setExploreAllVendors] = useState(false);

  // Always auto-select the first vendor when storeData loads
  useEffect(() => {
    if (assignedStores && assignedStores.length > 0) {
      const firstId = assignedStores[0].id || assignedStores[0]._id;
      setSelectedVendorFilter(firstId);
    }
  }, [storeData]);
  const profile = profileData?.data || profileData;
  const theater = theaterData?.data || theaterData;
  const accessibleSeats = profile?.accessibleSeats || [];
  const orderHistory = orderHistoryData?.data || [];

  // Get show timings
  const showTimings = selectedShow?.timings || [];

  // Build zones from theater screens
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

  // Build level data for seat layout
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
            zone: baseId,
            isAvailable: seat.isAvailable,
            isBooked: seat.isBooked,
          };
        });
      });
    });

    const rows = screen.totalRows || (isBalcony ? meta.balconyRows : meta.groundRows) || 0;
    const cols = screen.totalColumns || (isBalcony ? meta.balconyCols : meta.groundCols) || 0;

    return {
      rows,
      cols,
      seats,
      aisleCols: (isBalcony ? meta.balconyAisleCols : meta.aisleCols) || [],
      aisleRows: (isBalcony ? meta.balconyAisleRows : meta.aisleRows) || [],
    };
  }, [theater]);

  const groundData = buildLevelData("ground");
  const balconyData = buildLevelData("balcony");
  const hasLayout = groundData || balconyData;

  // Extract booked seats from API response
  useEffect(() => {
    if (seatsData?.success && seatsData?.data?.seatCategories) {
      const booked = new Set();
      seatsData.data.seatCategories.forEach(category => {
        if (category.rows && Array.isArray(category.rows)) {
          category.rows.forEach(row => {
            if (row.seats && Array.isArray(row.seats)) {
              row.seats.forEach(seat => {
                if (seat.isBooked && seat.seatNumber) {
                  booked.add(seat.seatNumber);
                }
              });
            }
          });
        }
      });
      setBookedSeats(booked);
    } else {
      setBookedSeats(new Set());
    }
  }, [seatsData]);

  // Clear selected seats when timing changes
  useEffect(() => {
    if (selectedTiming) {
      setSelectedSeats(new Set());
      setShowProducts(false);
      // Clear cart when timing changes
      clearCartData();
    }
  }, [selectedTiming]);

  // Clear cart data function
  const clearCartData = async () => {
    try {
      await axios.delete(`${BE_URL}/theater-owner/cart`, getAuthHeader());
      await refetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Clear cart when theater changes
  useEffect(() => {
    if (selectedTheater) {
      clearCartData();
    }
  }, [selectedTheater]);

  // Clear cart when show changes
  useEffect(() => {
    if (selectedShow) {
      clearCartData();
    }
  }, [selectedShow]);

  // Show products automatically when seats are selected
  useEffect(() => {
    if (selectedSeats.size > 0) {
      setShowProducts(true);
    } else {
      setShowProducts(false);
    }
  }, [selectedSeats.size]);

  const accessibleSeatSet = useMemo(() => new Set(accessibleSeats || []), [accessibleSeats]);

  const handleSeatToggle = (fullKey, zone, seatNumber) => {
    setSelectedSeats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fullKey)) {
        newSet.delete(fullKey);
      } else {
        newSet.add(fullKey);
      }
      return newSet;
    });
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    setLoading(true);
    const result = await addToCart(productId, quantity);
    
    if (result && result.success === false) {
      setLoading(false);
      const isVendorConflict = result.code === 'DIFFERENT_VENDOR_CART' || 
                                (result.message && (result.message.includes('one vendor') || result.message.includes('different')));
                                
      if (isVendorConflict) {
        const errorMsg = result.message || "At one time you can order from one vendor only.";
        const confirmClear = await Swal.fire({
          title: 'Vendor Conflict!',
          text: `${errorMsg}\n\nDo you want to clear your current cart and add items from this vendor instead?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#ef4444',
          confirmButtonText: 'Yes, Clear Cart & Switch Vendor',
          cancelButtonText: 'Cancel'
        });
        
        if (confirmClear.isConfirmed) {
          setLoading(true);
          await clearCartData();
          const retryResult = await addToCart(productId, quantity);
          await refetchCart();
          setLoading(false);
          if (retryResult?.success) {
            setShowCart(true);
            setProductQuantities(prev => ({ ...prev, [productId]: 1 }));
            Swal.fire({
              title: 'Cart Updated!',
              text: 'Your cart has been cleared and updated with items from the new vendor.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            Swal.fire('Error', retryResult?.message || "Failed to add item to cart after clearing.", 'error');
          }
        }
      } else {
        Swal.fire('Error', result.message || "Failed to add item to cart.", 'error');
      }
      return;
    }

    await refetchCart();
    setLoading(false);
    setShowCart(true);
    setProductQuantities(prev => ({ ...prev, [productId]: 1 }));
  };

  const handleQuantityChange = (productId, delta) => {
    setProductQuantities(prev => {
      const current = prev[productId] || 1;
      const newQuantity = Math.max(1, current + delta);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleUpdateCartItem = async (productId, quantity) => {
    if (quantity < 1) return;
    setLoading(true);
    await updateCartItem(productId, quantity);
    await refetchCart();
    setLoading(false);
  };

  const handleRemoveFromCart = async (productId) => {
    const resConfirm = await Swal.fire({
      title: 'Remove Item?',
      text: 'Are you sure you want to remove this item from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it!'
    });
    if (!resConfirm.isConfirmed) return;
    setLoading(true);
    await removeFromCart(productId);
    await refetchCart();
    setLoading(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedTheater) {
      Swal.fire('Selection Required', 'Please select a theater first.', 'warning');
      return;
    }

    if (!selectedShow) {
      Swal.fire('Selection Required', 'Please select a show first.', 'warning');
      return;
    }

    if (!selectedTiming) {
      Swal.fire('Selection Required', 'Please select a show timing first.', 'warning');
      return;
    }

    if (selectedSeats.size === 0) {
      Swal.fire('Selection Required', 'Please select at least one seat.', 'warning');
      return;
    }

    if (cart.items.length === 0) {
      Swal.fire('Empty Cart', 'Your cart is empty. Please add items to cart.', 'warning');
      return;
    }

    if (orderType === 'scheduled' && !scheduledDateTime) {
      Swal.fire('Schedule Time Required', 'Please select a scheduled date and time.', 'warning');
      return;
    }

    // Extract seat numbers from selected seats
    const seatNumbers = Array.from(selectedSeats).map(key => {
      const parts = key.split('::');
      const seatKey = parts[1];
      const [row, col] = seatKey.split('-');
      const rowLabel = String.fromCharCode(65 + parseInt(row));
      return `${rowLabel}${parseInt(col) + 1}`;
    });

    setLoading(true);
    const scheduledFor = orderType === 'scheduled' ? new Date(scheduledDateTime).toISOString() : null;
    const result = await placeOrder('SEAT_DELIVERY', `Deliver to seat ${seatNumbers.join(', ')}`, scheduledFor);
    setLoading(false);

    if (result.success) {
      setOrderSuccess(true);
      setOrderId(result.data.orderId);
      Swal.fire({
        title: 'Order Placed!',
        text: `Your order #${result.data.orderId || ''} has been placed successfully.`,
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      });

      // Automatically generate and download the invoice after placing the order
      try {
        const tempOrderForInvoice = {
          orderId: result.data.orderId || "N/A",
          orderedAt: new Date().toISOString(),
          orderStatus: 'PENDING',
          buyerId: {
            name: currentUser?.name || "Theater Owner",
            phone: currentUser?.phone || "N/A"
          },
          storeId: {
            storeName: store?.name || "Food Store"
          },
          theaterId: {
            name: selectedTheater?.name || "Cinema Theater"
          },
          deliveryType: 'SEAT_DELIVERY',
          specialInstructions: `Deliver to seat ${seatNumbers.join(', ')}`,
          items: cart.items.map(item => ({
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          })),
          subTotal: cart.totalAmount,
          tax: cart.totalAmount * 0.05,
          deliveryCharge: 20,
          totalAmount: cart.totalAmount + (cart.totalAmount * 0.05) + 20,
          paymentMethod: 'CASH ON DELIVERY',
          paymentStatus: 'PENDING'
        };

        setPlacedOrderData(tempOrderForInvoice);
        generateInvoicePDF(tempOrderForInvoice, currentUser);
      } catch (invoiceError) {
        console.error("Error auto-generating invoice PDF:", invoiceError);
      }

      setCart({ items: [], totalAmount: 0 });
      setSelectedSeats(new Set());
      await refetchCart();

      // Refresh order history if it's open
      if (showOrderHistory) {
        await refetchOrderHistory();
      }
    } else {
      Swal.fire('Order Failed', result.message || "Failed to place order.", 'error');
    }
  };

  const groupedProducts = Object.entries(products).reduce((acc, [category, items]) => {
    acc[category] = items;
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'delivered': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                    <FaUtensils className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                    Food Ordering
                  </h1>
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Order food for your theater with COD payment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { refetchCart(); refetchOrderHistory(); }}
                  className="h-10 px-3 rounded-xl transition-all duration-300 hover:scale-105 border flex items-center gap-2 text-sm font-semibold"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  <FaSpinner className={`text-sm ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="relative p-3 rounded-xl transition-all hover:scale-105"
                  style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                >
                  <FaShoppingCart style={{ color: "var(--foreground)" }} />
                  {cart.items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.items.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardStatCard
            title="Total Orders"
            value={orderHistory.length}
            icon={FaHistory}
            color="blue"
          />
          <DashboardStatCard
            title="Menu Items"
            value={Object.values(products).flat().length}
            icon={FaUtensils}
            color="purple"
          />
          <DashboardStatCard
            title="Cart Items"
            value={cart.items.length}
            icon={FaShoppingCart}
            color="cyan"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl mb-8 max-w-md" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <button
            onClick={() => {
              setShowOrderHistory(false);
              setOrderSuccess(false);
            }}
            className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: !showOrderHistory ? "linear-gradient(135deg, #3b82f6, #4f46e5)" : "transparent",
              color: !showOrderHistory ? "#ffffff" : "var(--foreground)",
              opacity: !showOrderHistory ? 1 : 0.65,
            }}
          >
            <FaUtensils className="text-sm" />
            Place Order
          </button>
          <button
            onClick={() => {
              setShowOrderHistory(true);
              setOrderSuccess(false);
              refetchOrderHistory();
            }}
            className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: showOrderHistory ? "linear-gradient(135deg, #3b82f6, #4f46e5)" : "transparent",
              color: showOrderHistory ? "#ffffff" : "var(--foreground)",
              opacity: showOrderHistory ? 1 : 0.65,
            }}
          >
            <FaHistory className="text-sm" />
            Order History
          </button>
        </div>

        {orderSuccess && !showOrderHistory ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <FaUtensils className="text-4xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Order Placed Successfully!</h2>
            <p className="mb-4" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Your order #{orderId} has been placed with COD payment.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  setOrderId(null);
                  setPlacedOrderData(null);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Place Another Order
              </button>
              {placedOrderData && (
                <button
                  onClick={() => generateInvoicePDF(placedOrderData, currentUser)}
                  className="px-6 py-3 rounded-xl border flex items-center gap-2 font-semibold hover:scale-105 transition-all text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
                  style={{ background: "var(--background)" }}
                >
                  <FaDownload />
                  Download Invoice (PDF)
                </button>
              )}
            </div>
          </div>
        ) : showOrderHistory ? (
          <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                <FaHistory className="inline mr-2" />
                Order History
              </h2>
            </div>
            
            {orderHistory.length === 0 ? (
              <p className="text-center py-8" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                No orders found
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
                <table className="min-w-full divide-y" style={{ divideColor: "var(--card-border)" }}>
                  <thead style={{ background: "var(--background)" }}>
                    <tr>
                      {["Order ID", "Customer", "Seat", "Items", "Total", "Status", "Date", "Actions"].map((heading) => (
                        <th key={heading} className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: "var(--card-border)" }}>
                    {orderHistory.map((order) => {
                      const seatNumbers = extractSeatNumbers(order.specialInstructions);
                      return (
                        <tr key={order._id} className="transition-colors hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold" style={{ color: "var(--foreground)" }}>
                            #{order.orderId || order._id.slice(-6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{order.buyerId?.name || currentUser?.name || "Theater Owner"}</div>
                            <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>{order.buyerId?.phone || currentUser?.phone || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-500">
                            {seatNumbers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                            {order.items?.length || 0} items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: "var(--foreground)" }}>
                            ₹{order.totalAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{ 
                                background: `${getStatusColor(order.orderStatus)}20`,
                                color: getStatusColor(order.orderStatus),
                                border: `1px solid ${getStatusColor(order.orderStatus)}40`
                              }}
                            >
                              {order.orderStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
                                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                              >
                                <FaEye className="text-xs" />
                                View
                              </button>
                              <button
                                onClick={() => generateInvoicePDF(order, currentUser)}
                                className="px-3 py-1.5 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all hover:scale-105 text-indigo-500 hover:bg-indigo-500/10 cursor-pointer"
                                style={{ background: "var(--background)", borderColor: "var(--card-border)" }}
                                title="Download Invoice"
                              >
                                <FaDownload className="text-xs" />
                                Invoice
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Theater Selection */}
              <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Select Theater</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {theaters.map((theater) => (
                    <button
                      key={theater._id}
                      onClick={() => {
                        setSelectedTheater(theater);
                        setSelectedShow(null);
                        setSelectedTiming(null);
                        setSelectedSeats(new Set());
                        setSelectedVendorFilter(null);
                        setExploreAllVendors(false);
                      }}
                      className={`p-4 rounded-xl transition-all ${
                        selectedTheater?._id === theater._id
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                          : "hover:scale-105"
                      }`}
                      style={selectedTheater?._id !== theater._id ? { background: "var(--background)", border: "1px solid var(--card-border)" } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <FaStore />
                        <div className="text-left">
                          <div className="font-semibold">{theater.name}</div>
                          <div className="text-xs opacity-80">{theater.location}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
                     {/* Assigned Vendors / Stores */}
              {assignedStores && assignedStores.length > 0 && (
                <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                        Select Vendor <span className="text-xs text-amber-400 font-semibold">(Required)</span>
                      </h2>
                      <p className="text-xs opacity-60">Click a vendor below to load their food menu</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {assignedStores.length} Vendor{assignedStores.length > 1 ? 's' : ''} Available
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assignedStores.map((st) => {
                      const stId = st.id || st._id;
                      const isFilterSelected = selectedVendorFilter === stId;
                      return (
                        <div
                          key={stId}
                          onClick={() => setSelectedVendorFilter(stId)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isFilterSelected
                              ? "border-blue-500 bg-blue-500/15 shadow-lg scale-[1.02] ring-2 ring-blue-500/50"
                              : "hover:border-blue-400/50 hover:scale-[1.01] opacity-75 hover:opacity-100"
                          }`}
                          style={{ background: "var(--background)", borderColor: isFilterSelected ? "#3b82f6" : "var(--card-border)" }}
                        >
                          <div className="flex items-center gap-3">
                            {st.logo ? (
                              <img src={st.logo} alt={st.name} className="w-12 h-12 rounded-xl object-cover border" />
                            ) : (
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${
                                isFilterSelected 
                                  ? "bg-blue-500 text-white border-blue-400" 
                                  : "bg-amber-500/20 text-amber-500 border-amber-500/30"
                              }`}>
                                <FaStore />
                              </div>
                            )}
                            <div className="text-left flex-1">
                              <div className="font-bold text-base text-foreground flex items-center justify-between">
                                <span>{st.name}</span>
                                {isFilterSelected && (
                                  <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold shadow">
                                    ✓ Active Vendor
                                  </span>
                                )}
                              </div>
                              {st.vendorName && (
                                <div className="text-xs font-semibold text-blue-400 mt-0.5">
                                  👤 {st.vendorName}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
                                <span className={st.isOpen ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                  {st.isOpen ? "🟢 Open" : "🔴 Closed"}
                                </span>
                                {st.phone && <span>📞 {st.phone}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show Selection */}
              {selectedTheater && (
                <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Select Show</h2>
                  <div className="space-y-3">
                    {shows.filter(show => {
                      const showTheaterId = show.theaterId?._id || show.theaterId;
                      const selectedTheaterId = selectedTheater._id;
                      return showTheaterId === selectedTheaterId || showTheaterId?.toString() === selectedTheaterId?.toString();
                    }).map((show) => (
                      <button
                        key={show._id}
                        onClick={() => {
                          setSelectedShow(show);
                          setSelectedTiming(null);
                          setSelectedSeats(new Set());
                        }}
                        className={`w-full p-4 rounded-xl transition-all text-left ${
                          selectedShow?._id === show._id
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : "hover:scale-105"
                        }`}
                        style={selectedShow?._id !== show._id ? { background: "var(--background)", border: "1px solid var(--card-border)" } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{show.movie?.name}</div>
                            <div className="text-sm opacity-80 flex items-center gap-2">
                              <FaCalendarAlt />
                              {new Date(show.showDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {shows.filter(show => {
                      const showTheaterId = show.theaterId?._id || show.theaterId;
                      const selectedTheaterId = selectedTheater._id;
                      return showTheaterId === selectedTheaterId || showTheaterId?.toString() === selectedTheaterId?.toString();
                    }).length === 0 && (
                      <p className="text-center py-4" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                        No shows found for this theater
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timing Selection */}
              {selectedShow && showTimings.length > 0 && (
                <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Select Show Timing</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {showTimings.map((timing, idx) => {
                      const isSelected = selectedTiming?._id === timing._id;
                      const showDate = timing.showDate || selectedShow.showDate;
                      const formattedDate = showDate ? new Date(showDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      }) : '';
                      return (
                        <button
                          key={timing._id || idx}
                          onClick={() => {
                            setSelectedTiming(timing);
                            setSelectedSeats(new Set());
                          }}
                          className={`p-4 rounded-xl transition-all text-left ${
                            isSelected
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                              : "hover:scale-105"
                          }`}
                          style={!isSelected ? { background: "var(--background)", border: "1px solid var(--card-border)" } : {}}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FaCalendarAlt />
                            <span className="font-semibold">{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock />
                            <span className="font-semibold">{timing.startTime}</span>
                            <span className="text-xs opacity-80">- {timing.endTime}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seat Selection */}
              {selectedTiming && (
                <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Select Seats</h2>
                  <div className="mb-4">
                    <p className="text-sm mb-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Selected Seats: {selectedSeats.size > 0 ? Array.from(selectedSeats).map(key => {
                        const parts = key.split('::');
                        const seatKey = parts[1];
                        const [row, col] = seatKey.split('-');
                        const rowLabel = String.fromCharCode(65 + parseInt(row));
                        return `${rowLabel}${parseInt(col) + 1}`;
                      }).join(', ') : 'None'}
                    </p>
                    <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Assigned Seats: {accessibleSeats.length}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: "center", padding: "18px 0 10px" }}>
                    {/* Cinema seat layout */}
                    {!hasLayout ? (
                      <div style={{ padding: 30, textAlign: "center", background: "#0f0f16", borderRadius: 12 }}>
                        <MdEventSeat style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#4b5563" }}>No seat layout configured</div>
                        <div style={{ fontSize: 12, marginTop: 6 }}>This theater has no seat data stored yet.</div>
                      </div>
                    ) : (
                      <>
                        {groundData && (
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ textAlign: "center", marginBottom: 12 }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#6b7280",
                                  textTransform: "uppercase",
                                  letterSpacing: ".1em",
                                  padding: "3px 14px",
                                  background: "#1a1a24",
                                  borderRadius: 20,
                                  border: "1px solid #2a2a38",
                                }}
                              >
                                Ground Floor
                              </span>
                            </div>
                            <CinemaSeatFloor
                              levelKey="ground"
                              zones={allZones}
                              seats={groundData.seats}
                              rows={groundData.rows}
                              cols={groundData.cols}
                              aisleCols={groundData.aisleCols}
                              aisleRows={groundData.aisleRows}
                              selected={selectedSeats}
                              onToggle={handleSeatToggle}
                              accessibleSeatSet={accessibleSeatSet}
                              bookedSeatsSet={bookedSeats}
                            />
                          </div>
                        )}

                        {balconyData && (
                          <div>
                            <div style={{ textAlign: "center", marginBottom: 12 }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#6b7280",
                                  textTransform: "uppercase",
                                  letterSpacing: ".1em",
                                  padding: "3px 14px",
                                  background: "#1a1a24",
                                  borderRadius: 20,
                                  border: "1px solid #2a2a38",
                                }}
                              >
                                Balcony
                              </span>
                            </div>
                            <CinemaSeatFloor
                              levelKey="balcony"
                              zones={allZones}
                              seats={balconyData.seats}
                              rows={balconyData.rows}
                              cols={balconyData.cols}
                              aisleCols={balconyData.aisleCols}
                              aisleRows={balconyData.aisleRows}
                              selected={selectedSeats}
                              onToggle={handleSeatToggle}
                              accessibleSeatSet={accessibleSeatSet}
                              bookedSeatsSet={bookedSeats}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Products */}
              {showProducts && (
                <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  {(() => {
                    const activeVendorObj = assignedStores.find(s => (s.id || s._id) === selectedVendorFilter);

                    if (exploreAllVendors) {
                      return (
                        <>
                          <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: "var(--card-border)" }}>
                            <div>
                              <h2 className="text-xl font-black" style={{ color: "var(--foreground)" }}>
                                All Vendor-Wise Menus ({assignedStores.length})
                              </h2>
                              <p className="text-xs opacity-60">Browse menus from all assigned vendors for this theater</p>
                            </div>
                            <button
                              onClick={() => setExploreAllVendors(false)}
                              className="px-4 py-2 text-xs font-bold rounded-xl border bg-background text-foreground hover:scale-105 transition-all cursor-pointer"
                            >
                              ← Back to Selected Vendor View
                            </button>
                          </div>

                          <div className="space-y-10">
                            {assignedStores.map((st) => {
                              const stId = st.id || st._id;
                              const isCurrentSelected = selectedVendorFilter === stId;
                              const vendorItems = Object.entries(groupedProducts).reduce((acc, [cat, items]) => {
                                const matched = items.filter(i => (
                                  i.storeId === stId || 
                                  i.storeInfo?.id === stId || 
                                  i.storeId?.toString() === stId?.toString()
                                ));
                                if (matched.length > 0) acc[cat] = matched;
                                return acc;
                              }, {});

                              return (
                                <div key={stId} className="rounded-2xl p-5 border" style={{ background: "var(--background)", borderColor: isCurrentSelected ? "#3b82f6" : "var(--card-border)" }}>
                                  <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b" style={{ borderColor: "var(--card-border)" }}>
                                    <div className="flex items-center gap-3">
                                      {st.logo ? (
                                        <img src={st.logo} alt={st.name} className="w-12 h-12 rounded-xl object-cover border" />
                                      ) : (
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 text-xl font-bold">
                                          <FaStore />
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-bold text-lg text-foreground flex items-center gap-2">
                                          <span>{st.name}</span>
                                          {isCurrentSelected && (
                                            <span className="text-[10px] bg-blue-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                                              Active Selection
                                            </span>
                                          )}
                                        </div>
                                        {st.vendorName && (
                                          <div className="text-xs font-semibold text-blue-400">
                                            👤 Vendor: {st.vendorName} {st.phone ? `(${st.phone})` : ''}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {!isCurrentSelected && (
                                      <button
                                        onClick={() => {
                                          setSelectedVendorFilter(stId);
                                          setExploreAllVendors(false);
                                        }}
                                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                      >
                                        Select & Switch to {st.name}
                                      </button>
                                    )}
                                  </div>

                                  {Object.keys(vendorItems).length === 0 ? (
                                    <p className="text-xs opacity-60 py-4 text-center">No menu items added for {st.name} yet</p>
                                  ) : (
                                    Object.entries(vendorItems).map(([cat, items]) => (
                                      <div key={cat} className="mb-6">
                                        <h4 className="text-sm font-bold mb-3 opacity-80 uppercase tracking-wider text-blue-400">{cat}</h4>
                                        <div className="flex flex-col gap-4">
                                          {items.map((product) => (
                                            <div
                                              key={product._id}
                                              className="rounded-xl p-4 transition-all hover:scale-[1.01]"
                                              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
                                            >
                                              <div className="flex gap-4 items-stretch">
                                                <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden flex items-center justify-center border" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
                                                  {product.image ? (
                                                    <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                                                  ) : (
                                                    <FaUtensils className="text-2xl opacity-20" style={{ color: "var(--foreground)" }} />
                                                  )}
                                                </div>
                                                <div className="flex flex-col justify-between flex-1 py-1">
                                                  <div>
                                                    <div className="font-bold text-base mb-1" style={{ color: "var(--foreground)" }}>{product.name}</div>
                                                    <div className="text-xs line-clamp-2 opacity-60" style={{ color: "var(--foreground)" }}>{product.description}</div>
                                                  </div>
                                                  <div className="flex items-end justify-between mt-2">
                                                    <div className="font-bold text-base text-blue-500">
                                                      ₹{product.discountPrice || product.price}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      {cart.items.find(item => item.productId === product._id) ? (
                                                        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white p-1">
                                                          <button
                                                            onClick={() => {
                                                              const item = cart.items.find(i => i.productId === product._id);
                                                              if (item.quantity <= 1) {
                                                                handleRemoveFromCart(product._id);
                                                              } else {
                                                                handleUpdateCartItem(product._id, item.quantity - 1);
                                                              }
                                                            }}
                                                            disabled={loading}
                                                            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors rounded disabled:opacity-50"
                                                          >
                                                            <FaMinus className="text-[10px]" />
                                                          </button>
                                                          <span className="w-6 text-center font-bold text-sm">
                                                            {cart.items.find(item => item.productId === product._id).quantity}
                                                          </span>
                                                          <button
                                                            onClick={() => {
                                                              const item = cart.items.find(i => i.productId === product._id);
                                                              handleUpdateCartItem(product._id, item.quantity + 1);
                                                            }}
                                                            disabled={loading}
                                                            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors rounded disabled:opacity-50"
                                                          >
                                                            <FaPlus className="text-[10px]" />
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <button
                                                          onClick={() => handleAddToCart(product._id, 1)}
                                                          disabled={loading}
                                                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-bold flex items-center gap-2 cursor-pointer"
                                                        >
                                                          <FaPlus className="text-xs" /> Add
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-6 border-t mt-8 text-center" style={{ borderColor: "var(--card-border)" }}>
                            <button
                              onClick={() => setExploreAllVendors(false)}
                              className="px-6 py-2.5 rounded-xl border bg-background text-foreground font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                            >
                              ← Collapse / Back to Selected Vendor View
                            </button>
                          </div>
                        </>
                      );
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: "var(--card-border)" }}>
                          <div>
                            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                              Food Menu {activeVendorObj ? `— ${activeVendorObj.name}` : ''}
                            </h2>
                            {activeVendorObj?.vendorName && (
                              <p className="text-xs text-blue-400 font-semibold">
                                Vendor: {activeVendorObj.vendorName} {activeVendorObj.phone ? `(${activeVendorObj.phone})` : ''}
                              </p>
                            )}
                          </div>
                          {activeVendorObj && (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                              <span>🟢</span> {activeVendorObj.name} Selected
                            </span>
                          )}
                        </div>

                        {!selectedVendorFilter ? (
                          <div className="p-8 text-center bg-amber-500/10 border border-amber-500/30 rounded-xl my-4">
                            <FaStore className="text-3xl text-amber-400 mx-auto mb-2" />
                            <p className="font-bold text-amber-400">Please select a vendor first</p>
                            <p className="text-xs opacity-70 mt-1">Select one of the assigned vendors above to load their food menu items.</p>
                          </div>
                        ) : (!assignedStores || assignedStores.length === 0) ? (
                          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>No store found for this theater</p>
                        ) : !products || Object.keys(products).length === 0 ? (
                          <p style={{ color: "var(--foreground)", opacity: 0.6 }}>No products available for this vendor</p>
                        ) : (
                          Object.entries(groupedProducts).map(([category, items]) => {
                            const filteredItems = items.filter(i => (
                              i.storeId === selectedVendorFilter || 
                              i.storeInfo?.id === selectedVendorFilter || 
                              i.storeId?.toString() === selectedVendorFilter?.toString()
                            ));

                            if (filteredItems.length === 0) return null;

                            return (
                              <div key={category} className="mb-6">
                                <h3 className="text-md font-semibold mb-3" style={{ color: "var(--foreground)", opacity: 0.8 }}>{category}</h3>
                                <div className="flex flex-col gap-4">
                                  {filteredItems.map((product) => (
                                    <div
                                      key={product._id}
                                      className="rounded-xl p-4 transition-all hover:scale-[1.01]"
                                      style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                                    >
                                      <div className="flex gap-4 items-stretch">
                                        <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden flex items-center justify-center border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                                          {product.image ? (
                                            <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <FaUtensils className="text-3xl opacity-20" style={{ color: "var(--foreground)" }} />
                                          )}
                                        </div>
                                        
                                        <div className="flex flex-col justify-between flex-1 py-1">
                                          <div>
                                            {product.storeInfo?.name && (
                                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 mb-1 border border-amber-500/30">
                                                <span>🏪 Vendor: {product.storeInfo.name}</span>
                                                {product.storeInfo.vendorName && <span className="opacity-80">({product.storeInfo.vendorName})</span>}
                                              </div>
                                            )}
                                            <div className="font-bold text-lg mb-1" style={{ color: "var(--foreground)" }}>{product.name}</div>
                                            <div className="text-sm line-clamp-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>{product.description}</div>
                                          </div>
                                          <div className="flex items-end justify-between mt-2">
                                            <div className="font-bold text-lg text-blue-500">
                                              ₹{product.discountPrice || product.price}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {cart.items.find(item => item.productId === product._id) ? (
                                                <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white p-1">
                                                  <button
                                                    onClick={() => {
                                                      const item = cart.items.find(i => i.productId === product._id);
                                                      if (item.quantity <= 1) {
                                                        handleRemoveFromCart(product._id);
                                                      } else {
                                                        handleUpdateCartItem(product._id, item.quantity - 1);
                                                      }
                                                    }}
                                                    disabled={loading}
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors rounded disabled:opacity-50"
                                                  >
                                                    <FaMinus className="text-[10px]" />
                                                  </button>
                                                  <span className="w-6 text-center font-bold text-sm">
                                                    {cart.items.find(item => item.productId === product._id).quantity}
                                                  </span>
                                                  <button
                                                    onClick={() => {
                                                      const item = cart.items.find(i => i.productId === product._id);
                                                      handleUpdateCartItem(product._id, item.quantity + 1);
                                                    }}
                                                    disabled={loading}
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors rounded disabled:opacity-50"
                                                  >
                                                    <FaPlus className="text-[10px]" />
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => handleAddToCart(product._id, 1)}
                                                  disabled={loading}
                                                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-bold flex items-center gap-2 cursor-pointer"
                                                >
                                                  <FaPlus className="text-xs" /> Add
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}

                        {assignedStores.length > 1 && (
                          <div className="pt-6 border-t mt-8 text-center" style={{ borderColor: "var(--card-border)" }}>
                            <button
                              onClick={() => setExploreAllVendors(true)}
                              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto cursor-pointer"
                            >
                              <FaUtensils className="text-sm" />
                              Explore More Vendor Menus ({assignedStores.length} Vendors Available) ✨
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            {showCart && (
              <div className="lg:col-span-1">
                <div className="rounded-xl p-6 sticky top-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Your Cart</h2>
                  {cart.items.length === 0 ? (
                    <p className="text-center py-8" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                      Cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        {cart.items.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ background: "var(--background)" }}
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{item.productName}</div>
                              <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                                ₹{item.price} x {item.quantity}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateCartItem(item.productId, item.quantity - 1)}
                                  disabled={loading || item.quantity <= 1}
                                  className="w-6 h-6 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50"
                                >
                                  <FaMinus />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateCartItem(item.productId, item.quantity + 1)}
                                  disabled={loading}
                                  className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 transition-colors flex items-center justify-center disabled:opacity-50"
                                >
                                  <FaPlus />
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveFromCart(item.productId)}
                                disabled={loading}
                                className="p-1 rounded text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 mb-4" style={{ borderColor: "var(--card-border)" }}>
                        <div className="flex justify-between font-bold" style={{ color: "var(--foreground)" }}>
                          <span>Total:</span>
                          <span>₹{cart.totalAmount}</span>
                        </div>
                      </div>

                      {/* Order Type Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>Order Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setOrderType('now')}
                            className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                              orderType === 'now'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                : 'hover:scale-105'
                            }`}
                            style={orderType !== 'now' ? { background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--foreground)' } : {}}
                          >
                            Order Now
                          </button>
                          <button
                            onClick={() => setOrderType('scheduled')}
                            className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                              orderType === 'scheduled'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                : 'hover:scale-105'
                            }`}
                            style={orderType !== 'scheduled' ? { background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--foreground)' } : {}}
                          >
                            Schedule for Later
                          </button>
                        </div>
                      </div>

                      {/* Scheduled Date/Time Picker */}
                      {orderType === 'scheduled' && (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                            <FaCalendarAlt className="inline mr-2" />
                            Schedule Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={scheduledDateTime}
                            onChange={(e) => setScheduledDateTime(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full p-3 rounded-lg text-sm"
                            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                          />
                        </div>
                      )}

                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading || cart.items.length === 0}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <FaSpinner className="animate-spin" /> : orderType === 'now' ? 'Place Order (Cash)' : 'Schedule Order'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Toaster position="top-right" />

      {/* Detailed Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 border-b p-4 flex justify-between items-center" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Order Details</h2>
                <p className="text-xs font-mono" style={{ color: "var(--foreground)", opacity: 0.6 }}>#{selectedOrder.orderId || selectedOrder._id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors" style={{ color: "var(--foreground)" }}>
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer & Location Info */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <FaUtensils className="text-blue-500" /> Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Customer Name</p>
                    <p className="font-medium" style={{ color: "var(--foreground)" }}>{selectedOrder.buyerId?.name || currentUser?.name || "Theater Owner"}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Contact Phone</p>
                    <p className="font-medium" style={{ color: "var(--foreground)" }}>{selectedOrder.buyerId?.phone || currentUser?.phone || "N/A"}</p>
                  </div>
                  <div className="mt-2">
                    <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Delivery Type</p>
                    <p className="font-medium" style={{ color: "var(--foreground)" }}>{selectedOrder.deliveryType?.replace("_", " ") || "SEAT DELIVERY"}</p>
                  </div>
                  <div className="mt-2">
                    <p style={{ color: "var(--foreground)", opacity: 0.6 }}>Seat Number</p>
                    <p className="font-bold text-blue-500">{extractSeatNumbers(selectedOrder.specialInstructions)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  Items Summary
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg border" style={{ borderColor: "var(--card-border)", background: "var(--card)" }}>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--foreground)" }}>{item.productName}</p>
                        <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-bold" style={{ color: "var(--foreground)" }}>₹{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="rounded-lg p-4" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subTotal}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                    <span>Tax (5% GST)</span>
                    <span>₹{selectedOrder.tax}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                    <span>Delivery Charge</span>
                    <span>₹{selectedOrder.deliveryCharge}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                    <span>Total Amount</span>
                    <span className="text-lg text-blue-500 font-bold">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Download Action */}
              <div className="rounded-lg p-4 flex justify-end" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <button
                  onClick={() => generateInvoicePDF(selectedOrder, currentUser)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FaDownload className="text-sm" />
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodOrderingPage;