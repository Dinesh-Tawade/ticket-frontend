import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

// Initial state
const initialState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastFetched: null, // Track last fetch time
};

// Login Thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BE_URL}/auth/login`, { email, password });
      const data = response.data;
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Register Thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BE_URL}/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

// Get Current User Thunk with caching
export const getCurrentUser = createAsyncThunk(
  "auth/getMe",
  async (forceRefresh = false, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const now = Date.now();
      
      // Don't fetch if last fetch was less than 5 minutes ago and not force refresh
      if (!forceRefresh && auth.lastFetched && (now - auth.lastFetched) < 5 * 60 * 1000) {
        console.log("Using cached user data");
        return rejectWithValue("Cached data, not refetching");
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }
      
      const response = await axios.get(`${BE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return { data: response.data, timestamp: now };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to get user");
    }
  }
);

// Logout
export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch(clearAuth());
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.lastFetched = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.token = action.payload.token || state.token;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Current User cases
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        if (action.payload && action.payload.data) {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.data;
          state.lastFetched = action.payload.timestamp;
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        // Only clear auth if it's not a cache rejection
        if (action.payload !== "Cached data, not refetching") {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      });
  },
});

export const { clearAuth, setUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;