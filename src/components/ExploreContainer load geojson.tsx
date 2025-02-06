import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapViewReactLeaflet: React.FC = () => {
  const position: [number, number] = [-0.21168009284190648, -78.50351572036745];

  // Estado para almacenar datos GeoJSON
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [clickedPosition, setClickedPosition] = useState<
    [number, number] | null
  >(null);

  // Cargar archivo GeoJSON
  useEffect(() => {
    fetch("/data/quito_geometrias.geojson") // Ruta al archivo GeoJSON
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) =>
        console.error("Error cargando el archivo GeoJSON:", error)
      );
  }, []);

  // Componente para capturar el evento click
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        console.log([e.latlng.lat, e.latlng.lng]);
        setClickedPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return null;
  };
  // Aplicar estilos desde las propiedades del GeoJSON
  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      const { stroke, strokeWidth, strokeOpacity, fill, fillOpacity } =
        feature.properties;
      layer.setStyle({
        color: stroke || "blue",
        weight: strokeWidth || 2,
        opacity: strokeOpacity || 1,
        fillColor: fill || "blue",
        fillOpacity: fillOpacity || 0.5,
      });
      //console.log(feature.geometry);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={position}
        zoom={20}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* GeoJSON */}
        {geoJsonData && (
          <GeoJSON data={geoJsonData} onEachFeature={onEachFeature} />
        )}
        {/* Componente para manejar clicks */}
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

const App: React.FC = () => {
  return <MapViewReactLeaflet />;
};

export default App;
