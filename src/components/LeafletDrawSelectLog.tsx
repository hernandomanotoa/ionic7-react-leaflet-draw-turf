// Delay invalidateSize to ensure the container is ready

import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

const LeafletDraw: React.FC = () => {
  const map = useMap();
  const [drawnItems, setDrawnItems] = useState<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map) return;
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const featureGroup = new L.FeatureGroup();
    setDrawnItems(featureGroup);
    map.addLayer(featureGroup);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup,
        remove: true,
      },
      draw: {
        rectangle: false, // Disable rectangle draw control
      },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event: any) => {
      const { layer } = event;
      featureGroup.addLayer(layer);
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(featureGroup);
    };
  }, [map]);

  const handleLoad = async () => {
    if (!drawnItems) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".geojson";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const geoJson = JSON.parse(event.target.result);

            const geoJsonLayer = L.geoJSON(geoJson, {
              onEachFeature: (feature, layer) => {
                // Optional: Add popups or bind properties
                if (feature.properties) {
                  const popupContent = Object.entries(feature.properties)
                    .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                    .join("<br/>");
                  layer.bindPopup(popupContent);
                }
              },
            });

            geoJsonLayer.eachLayer((layer: any) => {
              drawnItems.addLayer(layer);
            });

            console.log("GeoJSON loaded:", geoJson);
          } catch (error) {
            console.error("Invalid GeoJSON file", error);
            alert("Failed to load GeoJSON. Please check the file format.");
          }
        };

        reader.readAsText(file);
      }
    };

    input.click();
  };

  const handleExport = () => {
    if (!drawnItems) return;

    const geoJsonData = drawnItems.toGeoJSON();
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(geoJsonData, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "drawn_geometries.geojson");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleClearAll = () => {
    if (!drawnItems) return;
    drawnItems.clearLayers();
  };

  const handleLogGeometries = () => {
    if (!drawnItems) return;
    const geoJsonData = drawnItems.toGeoJSON();
    console.log("Current geometries:", geoJsonData);
  };

  const buttonStyle = {
    position: "absolute" as const,
    top: 10,
    left: 50,
    zIndex: 1000,
    padding: "10px 20px",
    backgroundColor: "#ffffff",
    color: "#333333",
    border: "2px solid #666666",
    borderRadius: "5px",
    cursor: "pointer",
  };

  return (
    <div>
      <button
        onClick={handleLoad}
        style={{ ...buttonStyle, top: 50 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        Load
      </button>
      <button
        onClick={handleExport}
        style={{ ...buttonStyle, top: 100 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        Export
      </button>
      <button
        onClick={handleClearAll}
        style={{ ...buttonStyle, top: 150 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        Clear
      </button>
      <button
        onClick={handleLogGeometries}
        style={{ ...buttonStyle, top: 200 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        Log Geometries
      </button>
    </div>
  );
};

export default LeafletDraw;
