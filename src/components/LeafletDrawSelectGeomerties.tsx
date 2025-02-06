import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

const LeafletDraw: React.FC = () => {
  const map = useMap();
  const [drawnItems, setDrawnItems] = useState<L.FeatureGroup | null>(null);
  const [selectedGeometries, setSelectedGeometries] = useState<any[]>([]); // Store selected geometries

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

      // Enable selection for new layers
      layer.on("click", () => handleGeometrySelection(layer));
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(featureGroup);
    };
  }, [map]);

  const handleGeometrySelection = (layer: any) => {
    // Get the GeoJSON of the selected layer
    const geometry = layer.toGeoJSON();

    setSelectedGeometries((prev) => {
      // Check if the geometry is already selected
      const isAlreadySelected = prev.some(
        (selected) => selected._leaflet_id === layer._leaflet_id
      );

      if (isAlreadySelected) {
        // Deselect the geometry
        const updated = prev.filter(
          (selected) => selected._leaflet_id !== layer._leaflet_id
        );
        console.log("Updated Selections:", updated);
        return updated;
      } else {
        // Select the geometry (limit to 2 selections)
        if (prev.length < 2) {
          const updated = [...prev, geometry];
          console.log("Selected Geometries:", updated);
          return updated;
        } else {
          console.log("You can only select up to 2 geometries.");
          return prev;
        }
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedGeometries([]);
    console.log("Selections cleared");
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
        onClick={handleClearSelection}
        style={{ ...buttonStyle, top: 200 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        Clear Selection
      </button>
    </div>
  );
};

export default LeafletDraw;
