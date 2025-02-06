import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import LeafletDraw from "./LeafletDraw";
import GeoJsonLoader from "./GeoJsonLoader";
import "leaflet/dist/leaflet.css";

const MapWithDrawing: React.FC = () => {
  const geoJsonUrl = "./data/quito_geometrias.geojson"; // Cambia esto a la URL o ruta válida de tu archivo GeoJSON.

  return (
    <MapContainer
      ///center={[-0.21168009284190648, -78.50351572036745]}
      center={[-0.22126542689512974, -78.51235820260406]}
      zoom={20}
      style={{
        height: "100vh",
        width: "100%",
        position: "relative", // Ensure the container is positioned properly
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LeafletDraw />
    </MapContainer>
  );
};

export default MapWithDrawing;
