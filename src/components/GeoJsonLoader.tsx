import React, { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface GeoJsonLoaderProps {
  geoJsonUrl: string; // Path or URL to the GeoJSON file
}

const GeoJsonLoader: React.FC<GeoJsonLoaderProps> = ({ geoJsonUrl }) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!geoJsonUrl) {
      setError("GeoJSON URL is required.");
      return;
    }

    const fetchGeoJson = async () => {
      try {
        const response = await fetch(geoJsonUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
        }
        const data = await response.json();
        setGeoJsonData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load GeoJSON data.");
      }
    };

    fetchGeoJson();
  }, [geoJsonUrl]);

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return geoJsonData ? (
    <GeoJSON
      data={geoJsonData}
      style={() => ({
        color: "#3388ff",
        weight: 2,
        opacity: 1,
        fillColor: "#3388ff",
        fillOpacity: 0.3,
      })}
      onEachFeature={(feature, layer) => {
        if (feature.properties?.name) {
          layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
        }
      }}
    />
  ) : null;
};

export default GeoJsonLoader;
