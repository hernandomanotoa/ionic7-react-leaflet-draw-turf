import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import LeafletDraw from "./LeafletDraw";
import "leaflet/dist/leaflet.css";

const MapWithDrawing: React.FC = () => {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
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
