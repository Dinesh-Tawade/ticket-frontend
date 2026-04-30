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

export const adminLogout = () => {
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
        return userData.role === "SUPER_ADMIN";
      } catch {
        return false;
      }
    }
  }
  return false;
};

// ==================== AUTH ====================
export const SuperAdminLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/auth/login`, { email, password });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    if (res.data.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("adminData", JSON.stringify(res.data.user));
    }
  }
  return res.data;
};

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async () => {
  const res = await axios.get(`${BE_URL}/admin/stats`, getAuthHeader());
  return res.data;
};

// ==================== USER MANAGEMENT ====================

// Create Users
export const createTheaterOwner = async (userData) => {
  const res = await axios.post(`${BE_URL}/admin/create-theater-owner`, userData, getAuthHeader());
  return res.data;
};

export const createVendor = async (userData) => {
  const res = await axios.post(`${BE_URL}/admin/create-vendor`, userData, getAuthHeader());
  return res.data;
};

export const createBuyerAdmin = async (userData) => {
  const res = await axios.post(`${BE_URL}/admin/create-buyer`, userData, getAuthHeader());
  return res.data;
};

export const createSuperAdminByAdmin = async (userData) => {
  const res = await axios.post(`${BE_URL}/admin/create-super-admin`, userData, getAuthHeader());
  return res.data;
};

// Get Users
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

export const getUserStats = async () => {
  const res = await axios.get(`${BE_URL}/admin/stats`, getAuthHeader());
  return res.data;
};

// Update Users
export const updateUser = async (id, userData) => {
  const res = await axios.put(`${BE_URL}/admin/users/${id}`, userData, getAuthHeader());
  return res.data;
};

export const updateUserStatus = async (id, statusData) => {
  const res = await axios.put(`${BE_URL}/admin/update-status/${id}`, statusData, getAuthHeader());
  return res.data;
};

// Theater to Owner
export const addTheaterToOwner = async (theaterOwnerId, theaterData) => {
  const res = await axios.post(`${BE_URL}/admin/add-theater/${theaterOwnerId}`, theaterData, getAuthHeader());
  return res.data;
};

// Delete User
export const deleteUser = async (id) => {
  const res = await axios.delete(`${BE_URL}/admin/users/${id}`, getAuthHeader());
  return res.data;
};


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

export const updateTheater = async (id, theaterData) => {
  const res = await axios.put(`${BE_URL}/admin/theater/update/${id}`, theaterData, getAuthHeader());
  return res.data;
};

export const addScreenToTheater = async (id, screenData) => {
  const res = await axios.post(`${BE_URL}/admin/theater/add-screen/${id}`, screenData, getAuthHeader());
  return res.data;
};

export const deleteTheater = async (id) => {
  const res = await axios.delete(`${BE_URL}/admin/theater/delete/${id}`, getAuthHeader());
  return res.data;
};

// ==================== SHOW MANAGEMENT ====================

export const createShow = async (showData) => {
  const res = await axios.post(`${BE_URL}/admin/show/create`, showData, getAuthHeader());
  return res.data;
};

export const getAllShowsAdmin = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${BE_URL}/admin/show/all?${params}` : `${BE_URL}/admin/show/all`;
  const res = await axios.get(url, getAuthHeader());
  return res.data;
};

export const updateShowStatus = async (id, statusData) => {
  const res = await axios.put(`${BE_URL}/admin/show/update-status/${id}`, statusData, getAuthHeader());
  return res.data;
};

export const deleteShow = async (id) => {
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

// ==================== PUBLIC COMMUNICATIONS (Keep if needed) ====================
export const getAdminCommunications = async () => {
  try {
    const res = await axios.get(`${BE_URL}/public-communications`);
    return res.data;
  } catch (error) {
    console.error("Error fetching public communications:", error);
    throw error;
  }
};