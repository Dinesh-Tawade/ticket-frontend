import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("language", state.language);
      }
    },
  },
});

export const { changeLanguage } = languageSlice.actions;
export default languageSlice.reducer;