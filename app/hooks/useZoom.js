"use client";

import { useEffect, useState } from "react";

export default function useZoom() {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const saved = localStorage.getItem("zoom");
    if (saved) setZoom(Number(saved));
  }, []);

  useEffect(() => {
    document.body.style.zoom = `${zoom}%`;
    localStorage.setItem("zoom", zoom);
  }, [zoom]);

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 150));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  return { zoom, zoomIn, zoomOut };
}