import axios from "axios";


const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

export const getadmincommunications = async () => {
  try {
    const res = await axios.get(`${BE_URL}/public-communications`);
    return res.data;
  } catch (error) {
    console.error("Error fetching public communications:", error);
    throw error;
  }
};

export const SuperAdminLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/auth/login`, { email, password });
  return res.data;
};


export const Dashboardstats = async () => {
  const res = await axios.get(`${BE_URL}/admin/stats`);
  return res.data;
};


// Theater



export const Theaters = async () => {
  const res = await axios.get(`${BE_URL}/admin/add-theater/THEATER_OWNER_ID`);
  return res.data;
};