import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  Circle,
  Rectangle,
  CircleMarker,
} from "react-leaflet";
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

  // Coordenadas para polígono
  const polygon: [number, number][] = [
    [51.505, -0.09],
    [51.51, -0.1],
    [51.52, -0.12],
    [51.505, -0.09],
  ];

  // Coordenadas para polilínea
  const polyline: [number, number][] = [
    [51.505, -0.09],
    [51.51, -0.08],
    [51.52, -0.06],
  ];

  // Coordenadas para círculo
  const circleCenter: [number, number] = [51.508, -0.11];

  // Coordenadas para rectángulo
  const rectangleBounds: [[number, number], [number, number]] = [
    [51.49, -0.08],
    [51.5, -0.06],
  ];

  // Coordenadas para puntos adicionales
  const points: [number, number][] = [
    [51.51, -0.12],
    [51.515, -0.13],
    [51.52, -0.14],
  ];

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

        {/* Polígono */}
        <Polygon positions={polygon} color="blue" />

        {/* Polilínea */}
        <Polyline positions={polyline} color="green" />

        {/* Círculo */}
        <Circle center={circleCenter} radius={200} color="purple">
          <Popup>Círculo</Popup>
        </Circle>

        {/* Rectángulo */}
        <Rectangle bounds={rectangleBounds} color="orange">
          <Popup>Rectángulo</Popup>
        </Rectangle>

        {/* Puntos adicionales */}
        {points.map((point, index) => (
          <CircleMarker key={index} center={point} radius={10} color="red">
            <Popup>Punto {index + 1}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

const App: React.FC = () => {
  return <MapViewReactLeaflet />;
};

export default App;
