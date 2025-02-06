// src/hooks/useMap.ts
// Hook personalizado para inicializar el mapa
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { initializeMap } from "../utils/mapUtils";

export const useMap = (mapRef: React.RefObject<HTMLDivElement>) => {
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current = initializeMap(mapRef.current!);
      }, 100);
    }
  }, [mapRef]);

  return leafletMapRef;
};
