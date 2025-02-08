import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import LeafletDraw from "./LeafletDrawSelect";
import "leaflet/dist/leaflet.css";

const MapWithDrawing: React.FC = () => {
  return (
    <MapContainer
      ///center={[-0.21168009284190648, -78.50351572036745]}
      center={[-0.248656, -78.533358]}
      zoom={14}
      maxZoom={16}
      style={{
        height: "100vh",
        width: "100%",
        position: "relative", // Ensure the container is positioned properly
      }}
    >
      {/* https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg */}
      {/* https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png */}
      {/* <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      /> */}

      <TileLayer
        url={"../../public/OSMPublicTransport/{z}/{x}/{y}.png"}
        attribution="&copy; OpenStreetMap contributors"
      />
      <LeafletDraw />
    </MapContainer>
  );
};

export default MapWithDrawing;
