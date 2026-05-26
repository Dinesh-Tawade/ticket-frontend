import axios from "axios";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

// ==================== HELPER FUNCTIONS ====================
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
  }
  return {};
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ==================== PUBLIC TEST ROUTES ====================
export const testAPI = async () => {
  try {
    const res = await axios.get(`${BE_URL}/`);
    return res.data;
  } catch (error) {
    console.error("Error testing API:", error);
    throw error;
  }
};

export const checkBackend = async () => {
  try {
    const res = await axios.get(`${BE_URL}/yes`);
    return res.data;
  } catch (error) {
    console.error("Backend check failed:", error);
    throw error;
  }
};

// ==================== AUTHENTICATION (Public) ====================

// General User Auth
export const userRegister = async (formData) => {
  const res = await axios.post(`${BE_URL}/auth/register`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (res.data.token) {
    setAuthToken(res.data.token);
    if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const userLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/auth/login`, { email, password });
  if (res.data.token) {
    setAuthToken(res.data.token);
    if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

// Buyer Specific Auth
export const buyerRegister = async (formData) => {
  const res = await axios.post(`${BE_URL}/users/register`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (res.data.token) {
    setAuthToken(res.data.token);
    if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const buyerLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/users/login`, { email, password });
  if (res.data.token) {
    setAuthToken(res.data.token);
    if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

// ==================== PUBLIC SHOWS (No Auth Required) ====================

export const getPublicShows = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/public/shows?${params}` : `${BE_URL}/public/shows`;
  const res = await axios.get(url);
  return res.data;
};

export const getTrendingShows = async () => {
  const res = await axios.get(`${BE_URL}/public/shows/trending`);
  return res.data;
};




export const getPublicShowById = async (id) => {
  const res = await axios.get(`${BE_URL}/public/shows/${id}`);
  return res.data;
};

export const getPublicTheaters = async (city = "") => {
  const url = city ? `${BE_URL}/public/theaters?city=${city}` : `${BE_URL}/public/theaters`;
  const res = await axios.get(url);
  return res.data;
};

export const getAvailableSeats = async (showId) => {
  const res = await axios.get(`${BE_URL}/public/shows/${showId}/seats`);
  return res.data;
};

// ==================== BOOKING (Auth Required) ====================

export const createBooking = async (bookingData) => {
  const res = await axios.post(`${BE_URL}/public/booking/create`, bookingData, getAuthHeader());
  return res.data;
};

export const confirmPayment = async (bookingId) => {
  const res = await axios.put(`${BE_URL}/public/booking/confirm-payment/${bookingId}`, {}, getAuthHeader());
  return res.data;
};

export const getMyBookings = async () => {
  const res = await axios.get(`${BE_URL}/public/booking/my-bookings`, getAuthHeader());
  return res.data;
};

export const cancelBooking = async (bookingId) => {
  const res = await axios.put(`${BE_URL}/public/booking/cancel/${bookingId}`, {}, getAuthHeader());
  return res.data;
};

// ==================== USER PROFILE (Auth Required) ====================

export const getMe = async () => {
  const res = await axios.get(`${BE_URL}/auth/me`, getAuthHeader());
  return res.data;
};

export const updateProfile = async (formData) => {
  const res = await axios.put(`${BE_URL}/auth/update-profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...getAuthHeader(),
  });
  return res.data;
};

export const getBuyerProfile = async () => {
  const res = await axios.get(`${BE_URL}/users/profile`, getAuthHeader());
  return res.data;
};

// ==================== SETUP (Public - One Time) ====================

export const setupSuperAdmin = async (adminData) => {
  const res = await axios.post(`${BE_URL}/setup/create-super-admin`, adminData);
  return res.data;
};

// ==================== BUYER FOOD ORDER APIs (Auth Required) ====================

// Cart Management
export const addToCart = async (cartData) => {
  const res = await axios.post(`${BE_URL}/buyer/cart/add`, cartData, getAuthHeader());
  return res.data;
};

export const getCart = async () => {
  const res = await axios.get(`${BE_URL}/buyer/cart`, getAuthHeader());
  return res.data;
};

export const updateCartItem = async (productId, quantity) => {
  const res = await axios.put(`${BE_URL}/buyer/cart/update/${productId}`, { quantity }, getAuthHeader());
  return res.data;
};

export const removeFromCart = async (productId) => {
  const res = await axios.delete(`${BE_URL}/buyer/cart/remove/${productId}`, getAuthHeader());
  return res.data;
};

export const clearCart = async () => {
  const res = await axios.delete(`${BE_URL}/buyer/cart/clear`, getAuthHeader());
  return res.data;
};

// Order Management
export const placeOrder = async (orderData) => {
  const res = await axios.post(`${BE_URL}/buyer/order/place`, orderData, getAuthHeader());
  return res.data;
};

export const getMyOrders = async (status = "") => {
  const url = status ? `${BE_URL}/buyer/orders?status=${status}` : `${BE_URL}/buyer/orders`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const getOrderDetails = async (orderId) => {
  const res = await axios.get(`${BE_URL}/buyer/order/${orderId}`, getAuthHeader());
  return res.data;
};

export const trackOrder = async (orderId) => {
  const res = await axios.get(`${BE_URL}/buyer/order/track/${orderId}`, getAuthHeader());
  return res.data;
};

export const cancelOrder = async (orderId) => {
  const res = await axios.put(`${BE_URL}/buyer/order/cancel/${orderId}`, {}, getAuthHeader());
  return res.data;
};

// Payment
export const processPayment = async (orderId, paymentData) => {
  const res = await axios.post(`${BE_URL}/buyer/order/pay/${orderId}`, paymentData, getAuthHeader());
  return res.data;
};

// Browse Products
export const getTheaterProducts = async (theaterId, category = "") => {
  const url = category ? `${BE_URL}/buyer/theater/${theaterId}/products?category=${category}` : `${BE_URL}/buyer/theater/${theaterId}/products`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const getProductCategories = async () => {
  const res = await axios.get(`${BE_URL}/buyer/categories`, getAuthHeader());
  return res.data;
};