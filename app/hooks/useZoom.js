"use client";

import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { zoomIn, zoomOut, setZoom } from "@/app/store/slices/zoomSlice";

export default function useZoom() {
  const dispatch = useDispatch();
  const zoom = useSelector((state) => state.zoom.zoom);
  const isInitialized = useRef(false); 
  useEffect(() => {
    if (!isInitialized.current) {
      const saved = localStorage.getItem("zoom");
      if (saved && Number(saved) !== zoom) {
        dispatch(setZoom(Number(saved)));
      }
      isInitialized.current = true;
    }
  }, [dispatch, zoom]); 
  useEffect(() => {
    if (isInitialized.current) {
      document.body.style.zoom = `${zoom}%`;
      localStorage.setItem("zoom", zoom);
    }
  }, [zoom]);

  const zoomInHandler = () => {
    if (zoom < 150) {
      dispatch(zoomIn());
    }
  };
  
  const zoomOutHandler = () => {
    if (zoom > 50) {
      dispatch(zoomOut());
    }
  };

  return { zoom, zoomIn: zoomInHandler, zoomOut: zoomOutHandler };
}