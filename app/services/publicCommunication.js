import axios from "axios";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

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


// User (General) Auth
export const userRegister = async (formData) => {
  const res = await axios.post(`${BE_URL}/auth/register`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const userLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/auth/login`, { email, password });
  return res.data;
};

// Buyer Specific Auth
export const buyerRegister = async (formData) => {
  const res = await axios.post(`${BE_URL}/users/register`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const buyerLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/users/login`, { email, password });
  return res.data;
};



export const getPublicShows = async () => {
  const res = await axios.get(`${BE_URL}/public/shows`);
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

export const getPublicTheaters = async () => {
  const res = await axios.get(`${BE_URL}/public/theaters`);
  return res.data;
};

export const getAvailableSeats = async (id) => {
  const res = await axios.get(`${BE_URL}/public/shows/${id}/seats`);
  return res.data;
};


export const getPublicCommunications = async () => {
  try {
    const res = await axios.get(`${BE_URL}/public-communications`);
    return res.data;
  } catch (error) {
    console.error("Error fetching public communications:", error);
    throw error;
  }
};


export const setupSuperAdmin = async (adminData) => {
  const res = await axios.post(`${BE_URL}/setup/create-super-admin`, adminData);
  return res.data;
};


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
}

export const cancelBooking = async (bookingId) => {
  const res = await axios.put(`${BE_URL}/public/booking/cancel/${bookingId}`, {}, getAuthHeader());
  return res.data;
}