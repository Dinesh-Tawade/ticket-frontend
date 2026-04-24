import axios from "axios";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getadmincommunications = async () => {
  try {
    const res = await axios.get(`${BE_URL}/public-communications`);
    return res.data;
  } catch (error) {
    console.error("Error fetching public communications:", error);
    throw error;
  }
};

// ==================== AUTH ====================
export const SuperAdminLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/auth/login`, { email, password });
  // Store token after login
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
};

// ==================== DASHBOARD STATS ====================
export const Dashboardstats = async () => {
  const res = await axios.get(`${BE_URL}/admin/stats`, getAuthHeader());
  return res.data;
};

// ==================== USER MANAGEMENT (SUPER_ADMIN only) ====================

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
export const getAllUsers = async () => {
  const res = await axios.get(`${BE_URL}/admin/users`, getAuthHeader());
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axios.get(`${BE_URL}/admin/users/${id}`, getAuthHeader());
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

// ==================== THEATER MANAGEMENT (Admin) ====================

export const createTheater = async (theaterData) => {
  const res = await axios.post(`${BE_URL}/admin/theater/create`, theaterData, getAuthHeader());
  return res.data;
};

export const getAllTheatersAdmin = async () => {
  const res = await axios.get(`${BE_URL}/admin/theater/all`, getAuthHeader());
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

// ==================== SHOW MANAGEMENT (Admin) ====================

export const createShow = async (showData) => {
  const res = await axios.post(`${BE_URL}/admin/show/create`, showData, getAuthHeader());
  return res.data;
};

export const getAllShowsAdmin = async () => {
  const res = await axios.get(`${BE_URL}/admin/show/all`, getAuthHeader());
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


export const getAllBookingsAdmin = async () => {
  const res = await axios.get(`${BE_URL}/admin/booking/all`, getAuthHeader());
  return res.data;
};


// Theater



export const Theaters = async () => {
  const res = await axios.get(`${BE_URL}/admin/add-theater/THEATER_OWNER_ID`);
  return res.data;
};