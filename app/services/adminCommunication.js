import axios from "axios";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

// ==================== HELPER FUNCTIONS ====================
const getAuthHeader = () => {
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

const getAuthHeaderForFormData = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
    }
  }
  return {};
};

// ==================== AUTH ====================
export const adminLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/auth/login`, { email, password });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    if (res.data) {
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("adminData", JSON.stringify(res.data));
    }
  }
  return res.data;
};

export const SuperAdminLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/auth/login`, { email, password });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    if (res.data) {
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("adminData", JSON.stringify(res.data));
    }
  }
  return res.data;
};

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("adminData");
};

export const isAuthenticated = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        return userData.role === "SUPER_ADMIN" || userData.role === "THEATER_OWNER" || userData.role === "VENDOR";
      } catch {
        return false;
      }
    }
  }
  return false;
};

export const isSuperAdmin = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.role === "SUPER_ADMIN";
      } catch {
        return false;
      }
    }
  }
  return false;
};

export const isTheaterOwner = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.role === "THEATER_OWNER";
      } catch {
        return false;
      }
    }
  }
  return false;
};

export const isVendor = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.role === "VENDOR";
      } catch {
        return false;
      }
    }
  }
  return false;
};

export const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        return JSON.parse(user);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async () => {
  const res = await axios.get(`${BE_URL}/admin/stats`, getAuthHeader());
  return res.data;
};

// ==================== USER MANAGEMENT ====================

export const createTheaterOwner = async (userData) => {
  const isFormData = userData instanceof FormData;
  const res = await axios.post(`${BE_URL}/admin/create-theater-owner`, userData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
  return res.data;
};

export const createVendor = async (userData) => {
  const isFormData = userData instanceof FormData;
  const res = await axios.post(`${BE_URL}/admin/create-vendor`, userData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
  return res.data;
};

export const createBuyerAdmin = async (userData) => {
  const isFormData = userData instanceof FormData;
  const res = await axios.post(`${BE_URL}/admin/create-buyer`, userData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
  return res.data;

  console.log("Create buyer request body:", userData);
};

export const createSuperAdminByAdmin = async (userData) => {
  const isFormData = userData instanceof FormData;
  const res = await axios.post(`${BE_URL}/admin/create-super-admin`, userData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
  return res.data;
};

export const getAllUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/admin/users?${params}` : `${BE_URL}/admin/users`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axios.get(`${BE_URL}/admin/users/${id}`, getAuthHeader());
  return res.data;
};

export const updateUser = async (id, userData) => {
  const isFormData = userData instanceof FormData;
  const res = await axios.put(`${BE_URL}/admin/users/${id}`, userData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
  return res.data;
};

export const updateUserStatus = async (id, statusData) => {
  const res = await axios.put(`${BE_URL}/admin/update-status/${id}`, statusData, getAuthHeader());
  return res.data;
};

export const addTheaterToOwner = async (theaterOwnerId, theaterData) => {
  const res = await axios.post(`${BE_URL}/admin/add-theater/${theaterOwnerId}`, theaterData, getAuthHeader());
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${BE_URL}/admin/users/${id}`, getAuthHeader());
  return res.data;
};

// ==================== THEATER MANAGEMENT (Admin) ====================

export const createTheater = async (theaterData) => {
  const res = await axios.post(`${BE_URL}/admin/theater/create`, theaterData, getAuthHeader());
  return res.data;
};

export const getAllTheatersAdmin = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/admin/theater/all?${params}` : `${BE_URL}/admin/theater/all`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const getTheaterByIdAdmin = async (id) => {
  const res = await axios.get(`${BE_URL}/admin/theater/${id}`, getAuthHeader());
  return res.data;
};

export const updateTheaterAdmin = async (id, theaterData) => {
  const res = await axios.put(`${BE_URL}/admin/theater/update/${id}`, theaterData, getAuthHeader());
  return res.data;
};

export const addScreenToTheaterAdmin = async (id, screenData) => {
  const res = await axios.post(`${BE_URL}/admin/theater/add-screen/${id}`, screenData, getAuthHeader());
  return res.data;
};

export const deleteTheaterAdmin = async (id) => {
  const res = await axios.delete(`${BE_URL}/admin/theater/delete/${id}`, getAuthHeader());
  return res.data;
};

export const deleteScreenFromTheaterAdmin = async (theaterId, screenId) => {
  const res = await axios.delete(`${BE_URL}/admin/theater/delete-screen/${theaterId}/${screenId}`, getAuthHeader());
  return res.data;
};

// ==================== SHOW MANAGEMENT (Admin) ====================

export const createShowAdmin = async (showData) => {
  const res = await axios.post(`${BE_URL}/admin/show/create`, showData, getAuthHeader());
  return res.data;
};

export const getAllShowsAdmin = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/admin/show/all?${params}` : `${BE_URL}/admin/show/all`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const getShowByIdAdmin = async (id) => {
  const res = await axios.get(`${BE_URL}/admin/show/${id}`, getAuthHeader());
  return res.data;
};

export const updateShowStatusAdmin = async (id, statusData) => {
  const res = await axios.put(`${BE_URL}/admin/show/update-status/${id}`, statusData, getAuthHeader());
  return res.data;
};

export const deleteShowAdmin = async (id) => {
  const res = await axios.delete(`${BE_URL}/admin/show/delete/${id}`, getAuthHeader());
  return res.data;
};



// ==================== BOOKING MANAGEMENT (Admin) ====================

export const getAllBookingsAdmin = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/admin/booking/all?${params}` : `${BE_URL}/admin/booking/all`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

// ==================== THEATER OWNER API's ====================

export const getDashboardStatsOwner = async () => {
  const res = await axios.get(`${BE_URL}/theater-owner/dashboard-stats`, getAuthHeader());
  return res.data;
};

export const getMyTheaters = async () => {
  const res = await axios.get(`${BE_URL}/theater-owner/my-theaters`, getAuthHeader());
  return res.data;
};

export const getTheaterDetails = async (id) => {
  const res = await axios.get(`${BE_URL}/theater-owner/theater/${id}`, getAuthHeader());
  return res.data;
};

export const updateTheaterOwner = async (id, data) => {
  const res = await axios.put(`${BE_URL}/theater-owner/theater/update/${id}`, data, getAuthHeader());
  return res.data;
};

export const deleteTheaterOwner = async (id) => {
  const res = await axios.delete(`${BE_URL}/theater-owner/theater/delete/${id}`, getAuthHeader());
  return res.data;
};

export const getTheaterScreens = async (theaterId) => {
  const res = await axios.get(`${BE_URL}/theater-owner/theater/${theaterId}/screens`, getAuthHeader());
  return res.data;
};

export const getScreenDetails = async (theaterId, screenId) => {
  const res = await axios.get(`${BE_URL}/theater-owner/theater/${theaterId}/screen/${screenId}`, getAuthHeader());
  return res.data;
};

export const addScreenToTheaterOwner = async (theaterId, screenData) => {
  const res = await axios.post(`${BE_URL}/theater-owner/theater/${theaterId}/add-screen`, screenData, getAuthHeader());
  return res.data;
};

export const updateScreenOwner = async (theaterId, screenId, screenData) => {
  const res = await axios.put(`${BE_URL}/theater-owner/theater/${theaterId}/screen/${screenId}`, screenData, getAuthHeader());
  return res.data;
};

export const deleteScreenOwner = async (theaterId, screenId) => {
  const res = await axios.delete(`${BE_URL}/theater-owner/theater/${theaterId}/screen/${screenId}`, getAuthHeader());
  return res.data;
};

export const getMyShowsOwner = async () => {
  const res = await axios.get(`${BE_URL}/theater-owner/my-shows`, getAuthHeader());
  return res.data;
};

export const updateShowAdmin = async (id, showData) => {
  const res = await axios.put(`${BE_URL}/theater-owner/show/update/${id}`, showData, getAuthHeader());
  return res.data;
};

export const getTheaterShows = async (theaterId) => {
  const res = await axios.get(`${BE_URL}/theater-owner/theater/${theaterId}/shows`, getAuthHeader());
  return res.data;
};

export const getShowByIdOwner = async (id) => {
  const res = await axios.get(`${BE_URL}/theater-owner/show/${id}`, getAuthHeader());
  return res.data;
};

export const updateShowStatusOwner = async (id, statusData) => {
  const res = await axios.put(`${BE_URL}/theater-owner/show/update-status/${id}`, statusData, getAuthHeader());
  return res.data;
};

export const getMyTheaterBookings = async () => {
  const res = await axios.get(`${BE_URL}/theater-owner/my-bookings`, getAuthHeader());
  return res.data;
};

export const getTheaterBookings = async (theaterId) => {
  const res = await axios.get(`${BE_URL}/theater-owner/theater/${theaterId}/bookings`, getAuthHeader());
  return res.data;
};

// ==================== VENDOR API's ====================

export const getVendorDashboardStats = async () => {
  const res = await axios.get(`${BE_URL}/vendor/dashboard-stats`, getAuthHeader());
  return res.data;
};

export const createOrUpdateStore = async (storeData) => {
  const isFormData = storeData instanceof FormData;
  const res = await axios.post(`${BE_URL}/vendor/store/create`, storeData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
  return res.data;
};

export const getMyStore = async () => {
  const res = await axios.get(`${BE_URL}/vendor/store`, getAuthHeader());
  return res.data;
};

export const toggleStoreStatus = async () => {
  const res = await axios.put(`${BE_URL}/vendor/store/toggle-status`, {}, getAuthHeader());
  return res.data;
};

export const addProduct = async (productData) => {
  const isFormData = productData instanceof FormData;
  const res = await axios.post(`${BE_URL}/vendor/product/add`, productData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
  return res.data;
};

export const getMyProducts = async () => {
  const res = await axios.get(`${BE_URL}/vendor/products`, getAuthHeader());
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${BE_URL}/vendor/product/${id}`, getAuthHeader());
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const isFormData = productData instanceof FormData;
  const res = await axios.put(`${BE_URL}/vendor/product/update/${id}`, productData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
  return res.data;
};

export const updateProductStock = async (id, stockData) => {
  const res = await axios.put(`${BE_URL}/vendor/product/update-stock/${id}`, stockData, getAuthHeader());
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${BE_URL}/vendor/product/delete/${id}`, getAuthHeader());
  return res.data;
};

// ✅ FIXED: No params - simple GET request
export const getVendorOrders = async () => {
  const res = await axios.get(`${BE_URL}/vendor/orders`, getAuthHeader());
  return res.data;
};

export const getVendorOrderDetails = async (orderId) => {
  const res = await axios.get(`${BE_URL}/vendor/order/${orderId}`, getAuthHeader());
  return res.data;
};

export const updateVendorOrderStatus = async (orderId, statusData) => {
  const res = await axios.put(`${BE_URL}/vendor/order/update-status/${orderId}`, statusData, getAuthHeader());
  return res.data;
};

export const getVendorSalesReport = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `${BE_URL}/vendor/sales-report?${queryParams}` : `${BE_URL}/vendor/sales-report`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const getVendorPayments = async () => {
  const res = await axios.get(`${BE_URL}/vendor/payments`, getAuthHeader());
  return res.data;
};

// ==================== PUBLIC APIs ====================

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

export const getPublicTheaters = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/public/theaters?${params}` : `${BE_URL}/public/theaters`;
  const res = await axios.get(url);
  return res.data;
};

export const getAvailableSeats = async (showId, timingId = null) => {
  const params = timingId ? `?timingId=${timingId}` : '';
  const res = await axios.get(`${BE_URL}/public/shows/${showId}/seats${params}`, getAuthHeader());
  return res.data;
};

export const getMe = async () => {
  const res = await axios.get(`${BE_URL}/auth/me`, getAuthHeader());
  return res.data;
};

// ==================== BUYER APIs ====================

export const addToCart = async (cartData) => {
  const res = await axios.post(`${BE_URL}/buyer/cart/add`, cartData, getAuthHeader());
  return res.data;
};

export const getCart = async () => {
  const res = await axios.get(`${BE_URL}/buyer/cart`, getAuthHeader());
  return res.data;
};

export const updateCartItem = async (productId, quantityData) => {
  const res = await axios.put(`${BE_URL}/buyer/cart/update/${productId}`, quantityData, getAuthHeader());
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

export const placeOrder = async (orderData) => {
  const res = await axios.post(`${BE_URL}/buyer/order/place`, orderData, getAuthHeader());
  return res.data;
};

export const getBuyerOrders = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/buyer/orders?${params}` : `${BE_URL}/buyer/orders`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const getBuyerOrderDetails = async (orderId) => {
  const res = await axios.get(`${BE_URL}/buyer/order/${orderId}`, getAuthHeader());
  return res.data;
};

export const trackOrder = async (orderId) => {
  const res = await axios.get(`${BE_URL}/buyer/order/track/${orderId}`, getAuthHeader());
  return res.data;
};

export const cancelBuyerOrder = async (orderId) => {
  const res = await axios.put(`${BE_URL}/buyer/order/cancel/${orderId}`, {}, getAuthHeader());
  return res.data;
};

export const processPayment = async (orderId, paymentData) => {
  const res = await axios.post(`${BE_URL}/buyer/order/pay/${orderId}`, paymentData, getAuthHeader());
  return res.data;
};

export const getTheaterProducts = async (theaterId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/buyer/theater/${theaterId}/products?${params}` : `${BE_URL}/buyer/theater/${theaterId}/products`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const getProductCategories = async () => {
  const res = await axios.get(`${BE_URL}/buyer/categories`, getAuthHeader());
  return res.data;
};

// ==================== TICKET BOOKING (Buyer) ====================

// export const createBooking = async (bookingData) => {
//   const res = await axios.post(`${BE_URL}/public/booking/create`, bookingData, getAuthHeader());
//   return res.data;
// };

// export const confirmPayment = async (bookingId) => {
//   const res = await axios.put(`${BE_URL}/public/booking/confirm-payment/${bookingId}`, {}, getAuthHeader());
//   return res.data;
// };

// export const getMyTicketBookings = async () => {
//   const res = await axios.get(`${BE_URL}/public/booking/my-bookings`, getAuthHeader());
//   return res.data;
// };

// export const cancelTicketBooking = async (bookingId) => {
//   const res = await axios.put(`${BE_URL}/public/booking/cancel/${bookingId}`, {}, getAuthHeader());
//   return res.data;
// };

// ==================== VERIFICATION APIs ====================

export const verifyTicket = async (qrData) => {
  try {
    const res = await axios.post(`${BE_URL}/verify/ticket`, { qrData });
    return res.data;
  } catch (error) {
    console.error('Verify ticket error:', error);
    throw error;
  }
};

export const markTicketAsUsed = async (bookingId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const url = `${BE_URL}/ticket/use/${bookingId}`;
    const response = await axios.put(
      url,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getTicketDetails = async (bookingId) => {
  const res = await axios.get(`${BE_URL}/verify/ticket/${bookingId}`, getAuthHeader());
  return res.data;
};

export const getShowTickets = async (showId) => {
  const res = await axios.get(`${BE_URL}/verify/show/${showId}/tickets`, getAuthHeader());
  return res.data;
};

// ==================== SHOW MANAGEMENT (Additional) ====================

export const updateShow = async (id, showData) => {
  const res = await axios.put(`${BE_URL}/admin/show/update/${id}`, showData, getAuthHeader());
  return res.data;
};

export const setAllShowsPaymentMode = async (paymentData) => {
  const res = await axios.put(`${BE_URL}/admin/shows/set-paid-all`, paymentData, getAuthHeader());
  return res.data;
};

// ==================== PAYMENT & BOOKING ====================

export const createPaymentOrder = async (bookingId) => {
  const res = await axios.post(`${BE_URL}/public/booking/create-payment-order/${bookingId}`, {}, getAuthHeader());
  return res.data;
};

export const confirmPaymentForBooking = async (bookingId, paymentData) => {
  const res = await axios.put(`${BE_URL}/public/booking/confirm-payment/${bookingId}`, paymentData, getAuthHeader());
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

// ==================== PUBLIC API ====================

export const getShowSeats = async (showId) => {
  const res = await axios.get(`${BE_URL}/public/shows/${showId}/seats`);
  return res.data;
};


// ==================== ZONE MANAGEMENT (Admin) - NEW APIs ====================

export const addZoneToScreenAdmin = async (theaterId, screenId, zoneData) => {
  const res = await axios.post(`${BE_URL}/admin/theater/add-zone/${theaterId}/${screenId}`, zoneData, getAuthHeader());
  return res.data;
};

export const updateZoneInScreenAdmin = async (theaterId, screenId, zoneId, zoneData) => {
  const res = await axios.put(`${BE_URL}/admin/theater/update-zone/${theaterId}/${screenId}/${zoneId}`, zoneData, getAuthHeader());
  return res.data;
};

export const deleteZoneFromScreenAdmin = async (theaterId, screenId, zoneId) => {
  const res = await axios.delete(`${BE_URL}/admin/theater/delete-zone/${theaterId}/${screenId}/${zoneId}`, getAuthHeader());
  return res.data;
};


export const assignSeatsToBuyer = async (assignData) => {
  const res = await axios.post(`${BE_URL}/admin/buyer/assign-seats`, assignData, getAuthHeader());
  return res.data;
};

// Get buyer's accessible seats
export const getBuyerAccessibleSeats = async (buyerId, theaterId = null) => {
  const url = theaterId 
    ? `${BE_URL}/admin/buyer/accessible-seats/${buyerId}?theaterId=${theaterId}`
    : `${BE_URL}/admin/buyer/accessible-seats/${buyerId}`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

// Remove seat access from buyer (full access or specific seats)
export const removeBuyerSeatAccess = async (buyerId, accessId, seatNumbers = null) => {
  const data = seatNumbers ? { seatNumbers } : {};
  const res = await axios.delete(`${BE_URL}/admin/buyer/remove-seat-access/${buyerId}/${accessId}`, {
    ...getAuthHeader(),
    data
  });
  return res.data;
};

// Get all zones of a theater (for admin dropdown)
export const getTheaterZones = async (theaterId) => {
  const res = await axios.get(`${BE_URL}/admin/theater/${theaterId}`, getAuthHeader());
  return res.data;
};

// ==================== TICKET BOOKING (Buyer) ====================

export const createBooking = async (bookingData) => {
  const res = await axios.post(`${BE_URL}/public/booking/create`, bookingData, getAuthHeader());
  return res.data;
};

export const confirmPayment = async (bookingId) => {
  const res = await axios.put(`${BE_URL}/public/booking/confirm-payment/${bookingId}`, {}, getAuthHeader());
  return res.data;
};

export const getMyTicketBookings = async () => {
  const res = await axios.get(`${BE_URL}/public/booking/my-bookings`, getAuthHeader());
  return res.data;
};

export const cancelTicketBooking = async (bookingId) => {
  const res = await axios.put(`${BE_URL}/public/booking/cancel/${bookingId}`, {}, getAuthHeader());
  return res.data;
};