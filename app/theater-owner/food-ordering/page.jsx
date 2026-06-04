"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaUtensils, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaCalendarAlt, FaClock, FaChair, FaRupeeSign, FaSpinner, FaStore, FaLock, FaHistory, FaTimes } from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import { getMyTheaters, getTheaterByIdAdmin } from "../../services/adminCommunication";
import axios from "axios";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL || "http://localhost:5000/api";

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
    return { success: false };
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

const FoodOrderingPage = () => {
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

  const theaters = theatersData?.data || theatersData || [];
  const shows = showsData?.data || showsData || [];
  const store = storeData?.data?.store;
  const products = storeData?.data?.products || {};
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
    await addToCart(productId, quantity);
    await refetchCart();
    setLoading(false);
    setShowCart(true);
    // Reset quantity for this product
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
    if (!confirm('Remove this item from cart?')) return;
    setLoading(true);
    await removeFromCart(productId);
    await refetchCart();
    setLoading(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedTheater) {
      alert("Please select a theater first");
      return;
    }

    if (!selectedShow) {
      alert("Please select a show first");
      return;
    }

    if (!selectedTiming) {
      alert("Please select a show timing first");
      return;
    }

    if (selectedSeats.size === 0) {
      alert("Please select at least one seat");
      return;
    }

    if (cart.items.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (orderType === 'scheduled' && !scheduledDateTime) {
      alert("Please select a scheduled date and time");
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
      setCart({ items: [], totalAmount: 0 });
      setSelectedSeats(new Set());
      await refetchCart();
      // Refresh order history if it's open
      if (showOrderHistory) {
        await refetchOrderHistory();
      }
    } else {
      alert(result.message || "Failed to place order");
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 animate-pulse blur-lg opacity-50" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
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
                  onClick={() => {
                    setShowOrderHistory(!showOrderHistory);
                    if (!showOrderHistory) {
                      refetchOrderHistory();
                    }
                  }}
                  className="relative p-3 rounded-xl transition-all hover:scale-105"
                  style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                >
                  <FaHistory style={{ color: "var(--foreground)" }} />
                </button>
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="relative p-3 rounded-xl transition-all hover:scale-105"
                  style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                >
                  <FaShoppingCart style={{ color: "var(--foreground)" }} />
                  {cart.items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.items.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {orderSuccess ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <FaUtensils className="text-4xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Order Placed Successfully!</h2>
            <p className="mb-4" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Your order #{orderId} has been placed with COD payment.
            </p>
            <button
              onClick={() => {
                setOrderSuccess(false);
                setOrderId(null);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Place Another Order
            </button>
          </div>
        ) : showOrderHistory ? (
          // Order History Modal/Section
          <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                <FaHistory className="inline mr-2" />
                Order History
              </h2>
              <button
                onClick={() => setShowOrderHistory(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            {orderHistory.length === 0 ? (
              <p className="text-center py-8" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                No orders found
              </p>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-lg p-4"
                    style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                  >
                    <div className="flex flex-wrap justify-between items-start mb-3">
                      <div>
                        <div className="font-bold" style={{ color: "var(--foreground)" }}>
                          Order #{order.orderNumber || order._id.slice(-6)}
                        </div>
                        <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            background: `${getStatusColor(order.status)}20`,
                            color: getStatusColor(order.status),
                            border: `1px solid ${getStatusColor(order.status)}40`
                          }}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Items:</div>
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                            <span>{item.quantity}x {item.productName}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "var(--card-border)" }}>
                      <div className="text-sm">
                        {order.deliveryType === 'SEAT_DELIVERY' && (
                          <span style={{ color: "var(--foreground)", opacity: 0.6 }}>
                            Delivery to: {order.specialInstructions?.replace('Deliver to seat ', 'Seat ')}
                          </span>
                        )}
                        {order.scheduledFor && (
                          <div className="text-xs mt-1" style={{ color: "#f59e0b" }}>
                            <FaClock className="inline mr-1" />
                            Scheduled: {formatDate(order.scheduledFor)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: "var(--foreground)" }}>
                          Total: ₹{order.totalAmount}
                        </div>
                        <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                          {order.paymentMethod}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                      }}
                      className={`p-4 rounded-xl transition-all ${
                        selectedTheater?._id === theater._id
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
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

              {/* Vendor Info */}
              {store && (
                <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Assigned Vendor</h2>
                  <div className="flex items-center gap-4">
                    {store.logo && (
                      <img src={store.logo} alt={store.name} className="w-16 h-16 rounded-xl object-cover" />
                    )}
                    <div>
                      <div className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{store.name}</div>
                      <div className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                        {store.isOpen ? "🟢 Open" : "🔴 Closed"}
                      </div>
                      <div className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                        {store.openingTime} - {store.closingTime}
                      </div>
                    </div>
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
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
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
                              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
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
                    <div
                      style={{
                        height: 3,
                        maxWidth: 500,
                        margin: "0 auto 6px",
                        background: "linear-gradient(90deg,transparent,#e2c97e,transparent)",
                        borderRadius: 2,
                      }}
                    />
                    <div style={{ fontSize: 10, color: "#e2c97e", letterSpacing: "3px", fontWeight: 700 }}>
                      SCREEN — ALL EYES THIS WAY
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    borderRadius: 12,
                    padding: "12px 20px",
                    marginBottom: 24,
                    textAlign: "center"
                  }}>
                    <span style={{ color: "#22c55e", fontWeight: 600, fontSize: 14 }}>
                      🎟️ You have access to {accessibleSeats?.length || 0} seats in this show
                    </span>
                  </div>

                  {!hasLayout ? (
                    <div style={{ textAlign: "center", paddingTop: 80, color: "#6b7280" }}>
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
              )}

              {/* Products */}
              {showProducts && (
                <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Menu</h2>
                  {!store ? (
                    <p style={{ color: "var(--foreground)", opacity: 0.6 }}>No store found for this theater</p>
                  ) : !products || Object.keys(products).length === 0 ? (
                    <p style={{ color: "var(--foreground)", opacity: 0.6 }}>No products available</p>
                  ) : (
                    Object.entries(groupedProducts).map(([category, items]) => (
                      <div key={category} className="mb-6">
                        <h3 className="text-md font-semibold mb-3" style={{ color: "var(--foreground)", opacity: 0.8 }}>{category}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {items.map((product) => (
                            <div
                              key={product._id}
                              className="rounded-xl p-4 transition-all hover:scale-105"
                              style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                            >
                              {product.image && (
                                <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                              )}
                              <div className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>{product.name}</div>
                              <div className="text-sm mb-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>{product.description}</div>
                              <div className="flex items-center justify-between">
                                <div className="font-bold" style={{ color: "var(--foreground)" }}>
                                  ₹{product.discountPrice || product.price}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleQuantityChange(product._id, -1)}
                                    className="w-8 h-8 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
                                  >
                                    <FaMinus />
                                  </button>
                                  <span className="w-8 text-center font-semibold" style={{ color: "var(--foreground)" }}>
                                    {productQuantities[product._id] || 1}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(product._id, 1)}
                                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-colors flex items-center justify-center"
                                  >
                                    <FaPlus />
                                  </button>
                                  <button
                                    onClick={() => handleAddToCart(product._id, productQuantities[product._id] || 1)}
                                    disabled={loading}
                                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-semibold"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
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
                                  className="w-6 h-6 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-colors flex items-center justify-center disabled:opacity-50"
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
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
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
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
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
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
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
    </div>
  );
};

export default FoodOrderingPage;