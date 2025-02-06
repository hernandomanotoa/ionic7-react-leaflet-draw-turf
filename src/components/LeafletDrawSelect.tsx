// Delay invalidateSize to ensure the container is ready

import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import * as turf from "@turf/turf";
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

            const getRandomColor = () => {
              const letters = "0123456789ABCDEF";
              let color = "#";
              for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
              }
              return color;
            };

            const geoJsonLayer = L.geoJSON(geoJson, {
              style: () => ({
                color: getRandomColor(), // Color del borde
                fillColor: getRandomColor(), // Color de relleno
                fillOpacity: 0.6,
                weight: 2,
              }),
              onEachFeature: (feature, layer) => {
                if (
                  feature.properties &&
                  Object.keys(feature.properties).length > 0
                ) {
                  // Construir el contenido del popup solo si hay propiedades
                  const popupContent = Object.entries(feature.properties)
                    .map(
                      ([key, value], index) =>
                        `${index}<strong>${key}:</strong> ${value}`
                    )
                    .join("<br/>");
                  layer.bindPopup(popupContent);
                } else {
                  layer.bindPopup("No hay información disponible");
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
    const layers = Object.values((drawnItems as L.FeatureGroup).getLayers());
    const individualGeometries = layers
      .map((layer, index) => {
        if ("toGeoJSON" in layer) {
          const geoJson = (
            layer as L.Layer & { toGeoJSON: () => GeoJSON.Feature }
          ).toGeoJSON();

          if (
            geoJson.geometry.type === "Polygon" ||
            geoJson.geometry.type === "MultiPolygon"
          ) {
            // Add custom properties for polygons
            geoJson.properties = {
              ...geoJson.properties,
              id: index + 1, // Example custom property
              description: `Polygon ${index + 1}`,
            };
            return { type: "Polygon", feature: geoJson };
          } else if (
            geoJson.geometry.type === "LineString" ||
            geoJson.geometry.type === "MultiLineString"
          ) {
            // Add custom properties for lines
            geoJson.properties = {
              ...geoJson.properties,
              id: index + 1, // Example custom property
              description: `LineString ${index + 1}`,
            };
            return { type: "LineString", feature: geoJson };
          }
        }
        return null;
      })
      .filter((geoJson) => geoJson !== null);

    individualGeometries.forEach((polygon, index) => {
      //console.log(`Polygon ${index + 1}:`, polygon);
    });

    console.log(individualGeometries);
  };

  const handleLGeometriesUnion = () => {
    if (!drawnItems) return;
    const layers = Object.values((drawnItems as L.FeatureGroup).getLayers());
    const individualPolygons = layers
      .map((layer, index) => {
        if ("toGeoJSON" in layer) {
          const geoJson = (
            layer as L.Layer & { toGeoJSON: () => GeoJSON.Feature }
          ).toGeoJSON();
          if (
            geoJson.geometry.type === "Polygon" ||
            geoJson.geometry.type === "MultiPolygon"
          ) {
            // Add custom properties
            geoJson.properties = {
              ...geoJson.properties,
              id: index + 1, // Example custom property
              description: `Polygon ${index + 1}`,
            };
            return geoJson;
          }
        }
        return null;
      })
      .filter((geoJson) => geoJson !== null);

    individualPolygons.forEach((polygon, index) => {
      //console.log(`Polygon ${index + 1}:`, polygon);
    });

    console.log(individualPolygons[0]);
    console.log(individualPolygons[1]);

    var poly1 = individualPolygons[0];

    var poly2 = individualPolygons[1];

    console.log("Coordinates of all poly1:", poly1);
    console.log("Coordinates of all poly2:", poly2);

    var union = turf.union(poly1, poly2);
    if (union) {
      const featureCollection = {
        type: "FeatureCollection",
        features: [] as any[],
      };
      // Función para agregar un nuevo polígono
      featureCollection.features.push(union);
      console.log("Union result:", featureCollection);
      const geoJsonData = featureCollection;
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(geoJsonData, null, 2)
      )}`;
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "unionTwoPolygons.geojson");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else {
      console.log("No union found.");
    }
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

      <button
        onClick={handleLGeometriesUnion}
        style={{ ...buttonStyle, top: 250 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        Union
      </button>
    </div>
  );
};

export default LeafletDraw;
