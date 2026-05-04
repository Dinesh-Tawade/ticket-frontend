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

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("adminData");
  
};

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async () => {
  const res = await axios.get(`${BE_URL}/admin/stats`, getAuthHeader());
  return res.data;
};

// ==================== USER MANAGEMENT ====================

// Create Users
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
};

export const createSuperAdminByAdmin = async (userData) => {
  const isFormData = userData instanceof FormData;
  const res = await axios.post(`${BE_URL}/admin/create-super-admin`, userData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
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
  const isFormData = userData instanceof FormData;
  const res = await axios.put(`${BE_URL}/admin/users/${id}`, userData, isFormData ? getAuthHeaderForFormData() : getAuthHeader());
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

// ==================== DASHBOARD STATS for theater dashboard ====================
export const getDashboardStatsOwner = async () => {
  const res = await axios.get(`${BE_URL}/theater-owner/dashboard-stats`, getAuthHeader());
  return res.data;
};


// ==================== THEATER OWNER API's ====================


// Theater management

// export const theaterDetails = async (id) => {
//   const req = await axios.get(`${BE_URL}/theater-owner/theater/69e9ecdcd1e8f499177852f8`, getAuthHeader());
//   return req.data; // Fixed: changed 'res' to 'req'
// }

// export const theaterUpdate = async (id, data) => {
//   const req = await axios.put(`${BE_URL}/theater-owner/theater/update/${id}`, data, getAuthHeader());
//   return req.data;
// }

// export const theaterAllScreens = async (id) => { // Added id parameter
//   const req = await axios.get(`${BE_URL}/theater-owner/theater/${id}/screens`, getAuthHeader());
//   return req.data; // Fixed: changed 'res' to 'req'
// }

// export const newScreens = async (id, data) => {
//   const req = await axios.post(`${BE_URL}/theater-owner/theater/${id}/add-screen`, data, getAuthHeader()); // Added missing 'data' parameter
//   return req.data;
// }

// export const screenUpdate = async (theaterId, screenId, data) => { // Fixed parameter names
//   const req = await axios.put(`${BE_URL}/theater-owner/theater/${theaterId}/screen/${screenId}`, data, getAuthHeader());
//   return req.data;
// }

// export const theaterBookings = async () => { // Fixed function name (was duplicate)
//   const req = await axios.get(`${BE_URL}/theater-owner/my-bookings`, getAuthHeader());
//   return req.data;
// }

// export const deleteTheaters = async (id) => { // Fixed function name and added proper deletion
//   const req = await axios.delete(`${BE_URL}/theater-owner/theater/delete/${id}`, getAuthHeader());
//   return req.data;
// }


export const theaterDetails = async (id) => {
  const req = await axios.get(`${BE_URL}/theater-owner/theater/${id}`, getAuthHeader());
  return req.data;
};

export const theaterUpdate = async ({ id, data }) => {
  const req = await axios.put(`${BE_URL}/theater-owner/theater/update/${id}`, data, getAuthHeader());
  return req.data;
};

export const theaterAllScreens = async (id) => {
  const req = await axios.get(`${BE_URL}/theater-owner/theater/${id}/screens`, getAuthHeader());
  return req.data;
};

export const newScreens = async ({ id, data }) => {
  const req = await axios.post(`${BE_URL}/theater-owner/theater/${id}/add-screen`, data, getAuthHeader());
  return req.data;
};

export const screenUpdate = async ({ theaterId, screenId, data }) => {
  const req = await axios.put(`${BE_URL}/theater-owner/theater/${theaterId}/screen/${screenId}`, data, getAuthHeader());
  return req.data;
};

export const deleteTheaters = async (id) => {
  const req = await axios.delete(`${BE_URL}/theater-owner/theater/delete/${id}`, getAuthHeader());
  return req.data;
};

// Show APIs
export const myShows = async () => {
  const req = await axios.get(`${BE_URL}/theater-owner/my-shows`, getAuthHeader());
  return req.data;
};

export const showUpdateStatus = async (id, data) => {
  const req = await axios.put(`${BE_URL}/theater-owner/show/update-status/${id}`, data, getAuthHeader());
  return req.data;
};

// Booking APIs
export const theaterBookings = async () => {
  const req = await axios.get(`${BE_URL}/theater-owner/my-bookings`, getAuthHeader());
  return req.data;
};




// show management

export const showService = {
  // Get all shows for theater owner
  getMyShows: async () => {
    try {
      console.log('Fetching my shows...');
      const response = await axios.get(`${BE_URL}/theater-owner/my-shows`, getAuthHeader());
      console.log('Fetched shows response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching shows:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update show status - Only allow COMING_SOON, BOOKING_OPEN, CANCELLED
  updateShowStatus: async ({ id, data }) => {
    try {
      // Validate status is allowed
      const allowedStatuses = ['COMING_SOON', 'BOOKING_OPEN', 'CANCELLED'];
      
      if (!allowedStatuses.includes(data.status)) {
        throw new Error(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`);
      }
      
      console.log(`Updating show ${id} to status:`, data.status);
      const response = await axios.put(
        `${BE_URL}/theater-owner/show/update-status/${id}`, 
        data, 
        getAuthHeader()
      );
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Booking
// export const theaterbooking = async () => {
//   const req = await axios.get(`${BE_URL}/theater-owner/my-bookings`, getAuthHeader());
//   return req.data;
// };


export const getMyBookings = async () => {
  try {
    const response = await axios.get(`${BE_URL}/theater-owner/my-bookings`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error.response?.data || error.message);
    throw error;
  }
};