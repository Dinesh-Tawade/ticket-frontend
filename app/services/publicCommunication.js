import axios from "axios";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

export const getPublicCommunications = async () => {
  try {
    const res = await axios.get(`${BE_URL}/public-communications`);
    return res.data;
  } catch (error) {
    console.error("Error fetching public communications:", error);
    throw error;
  }
};


export const checkBackend = async () => {
  const res = await axios.get(`${BE_URL}/yes`);
  return res.data;
};

export const userLogin = async (email, password) => {
  const res = await axios.post(`${BE_URL}/auth/login`, { email, password });
  return res.data;
};


// ✅ register API (form-data)
export const userRegister = async (formData) => {
  const res = await axios.post(`${BE_URL}/auth/register`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};


