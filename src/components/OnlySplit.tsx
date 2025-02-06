import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import LeafletDraw from "./LeafletDrawOnlySplit";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

const LeafletDraw: React.FC = () => {
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

export default LeafletDraw;
