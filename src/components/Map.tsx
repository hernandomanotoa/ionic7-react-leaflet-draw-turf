import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { GeomanControls } from "react-leaflet-geoman-v2";
import L from "leaflet";

const MapWithGeoman: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    console.log("Mapa cargado con Geoman");
    map.pm.addControls({
      position: "topleft",
      drawMarker: true, // Permitir marcadores
      drawPolyline: true, // Permitir líneas
      drawRectangle: true, // Permitir rectángulos
      drawCircle: true, // Permitir círculos
      drawCircleMarker: true, // Permitir círculos marcadores
      drawPolygon: true, // Permitir polígonos
      editMode: true, // Habilitar edición de geometrías
      dragMode: true, // Permitir arrastrar elementos
      cutPolygon: true, // Permitir cortar polígonos
      mergePolygons: true, // Permitir unir polígonos
      removalMode: true, // Permitir eliminación de geometrías
      rotateMode: true, // Permitir rotación de polígonos
      snappingOption: true, // Activar ajuste de geometrías
    });

    // Configuración global para mejorar la edición
    map.pm.setGlobalOptions({
      allowSelfIntersection: false, // No permitir intersecciones en polígonos
      snapDistance: 20, // Distancia para ajustar elementos cercanos
      continueDrawing: true, // Seguir dibujando después de crear una geometría
    });

    // EVENTOS DE LEAFLET-GEOMAN
    map.on("pm:create", (e) => console.log("🟢 Geometría creada:", e));
    map.on("pm:edit", (e) => console.log("✏️ Geometría editada:", e));
    map.on("pm:cut", (e) => console.log("✂️ Polígono dividido:", e));
    map.on("pm:merge", (e) => console.log("🔀 Polígonos unidos:", e));
    map.on("pm:dragstart", (e) => console.log("🟡 Movimiento iniciado:", e));
    map.on("pm:rotate", (e) => console.log("🔄 Rotación aplicada:", e));
    map.on("pm:remove", (e) => console.log("🗑️ Geometría eliminada:", e));

    return () => {
      map.off("pm:create");
      map.off("pm:edit");
      map.off("pm:cut");
      map.off("pm:merge");
      map.off("pm:dragstart");
      map.off("pm:rotate");
      map.off("pm:remove");
    };
  }, [map]);

  return <GeomanControls options={{ position: "topleft" }} />;
};

const LeafletMap: React.FC = () => {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapWithGeoman />
    </MapContainer>
  );
};

export default LeafletMap;
