import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  zoom: 100,
};

const zoomSlice = createSlice({
  name: "zoom",
  initialState,
  reducers: {
    zoomIn: (state) => {
      if (state.zoom < 200) {
        state.zoom += 10;
      }
    },
    zoomOut: (state) => {
      if (state.zoom > 50) {
        state.zoom -= 10;
      }
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    resetZoom: (state) => {
      state.zoom = 100;
    },
  },
});

export const { zoomIn, zoomOut, setZoom, resetZoom } = zoomSlice.actions;
export default zoomSlice.reducer;