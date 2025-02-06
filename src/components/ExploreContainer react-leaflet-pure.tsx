import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

// Configurar el ícono personalizado para Leaflet
const customIcon = new Icon({
  iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png",
  iconSize: [38, 95],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76],
});

const MapViewReactLeaflet: React.FC = () => {
  const position: [number, number] = [51.505, -0.09];

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={customIcon}>
          <Popup>Un ejemplo de marcador con información personalizada.</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

const App: React.FC = () => {
  return <MapViewReactLeaflet />;
};

export default App;
