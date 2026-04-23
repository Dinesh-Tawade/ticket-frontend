"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { zoomIn, zoomOut, setZoom } from "@/app/store/slices/zoomSlice";

export default function useZoom() {
  const dispatch = useDispatch();
  const zoom = useSelector((state) => state.zoom.zoom);

  // Sync with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("zoom");
    if (saved && Number(saved) !== zoom) {
      dispatch(setZoom(Number(saved)));
    }
  }, [dispatch, zoom]);

  // Apply zoom to body
  useEffect(() => {
    document.body.style.zoom = `${zoom}%`;
    localStorage.setItem("zoom", zoom);
  }, [zoom]);

  const zoomInHandler = () => dispatch(zoomIn());
  const zoomOutHandler = () => dispatch(zoomOut());

  return { zoom, zoomIn: zoomInHandler, zoomOut: zoomOutHandler };
}