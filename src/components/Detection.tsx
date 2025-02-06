import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import proj4 from "proj4";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

const MapComponent: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [drawnItems, setDrawnItems] = useState<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map", {
        center: [0.22985, -78.52495], // Quito, Ecuador
        zoom: 8,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const featureGroup = new L.FeatureGroup();
      setDrawnItems(featureGroup);
      map.addLayer(featureGroup);

      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup,
        },
        draw: {
          rectangle: false, // Disable rectangle draw control
        },
      });
      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e: any) => {
        const { layer } = e;
        featureGroup.addLayer(layer);
        console.log("Nuevo objeto dibujado:", layer.toGeoJSON());

        // Ajustar el centro del mapa automáticamente
        if (map && featureGroup.getBounds().isValid()) {
          map.fitBounds(featureGroup.getBounds(), { padding: [20, 20] });
        }
      });

      mapRef.current = map;
    } else {
      setTimeout(() => {
        mapRef.current!.invalidateSize();
      }, 100);
    }
  }, []);

  // Definir sistemas UTM para Ecuador
  const utmZone17S = "+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs";
  const utmZone18S = "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs";

  // Función para determinar y convertir UTM a Lat/Lng
  const convertUTMToLatLng = (x: number, y: number, zone: number) => {
    let proj;
    if (zone === 17) {
      proj = utmZone17S;
    } else if (zone === 18) {
      proj = utmZone18S;
    } else {
      throw new Error("Zona UTM inválida para Ecuador");
    }

    // Convertir coordenadas
    const [lng, lat] = proj4(proj, proj4.WGS84, [x, y]);
    return { lat, lng };
  };

  // Ejemplo de coordenadas UTM (puedes cambiar estas coordenadas para probar)
  useEffect(() => {
    const utmX = 622737.7386194449;
    const utmY = 9771309.225939743;
    const zone = 17;

    const result = convertUTMToLatLng(utmX, utmY, zone);
    console.log(`Latitud: ${result.lat}, Longitud: ${result.lng}`);

    if (mapRef.current) {
      const map = mapRef.current;
      map.setView([result.lat, result.lng], 11);
      const marker = L.marker([result.lat, result.lng])
        .addTo(map)
        .bindPopup(`Lat: ${result.lat}, Lng: ${result.lng}`)
        .openPopup();

      // Agregar el marcador al grupo editable
      if (drawnItems) {
        drawnItems.addLayer(marker);

        // Ajustar automáticamente el centro del mapa
        if (drawnItems.getBounds().isValid()) {
          map.fitBounds(drawnItems.getBounds(), { padding: [20, 20] });
        }
      }
    }
  }, [drawnItems]);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
};

export default MapComponent;
