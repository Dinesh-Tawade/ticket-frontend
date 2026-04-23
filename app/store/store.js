import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import zoomReducer from "./slices/zoomSlice";
import languageReducer from "./slices/languageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    zoom: zoomReducer,
    language: languageReducer,
  },
});