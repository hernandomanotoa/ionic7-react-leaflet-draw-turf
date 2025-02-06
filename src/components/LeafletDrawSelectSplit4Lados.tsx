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
            // Add custom properties for polygons
            geoJson.properties = {
              ...geoJson.properties,
              id: index + 1, // Example custom property
              description: `Polygon ${index + 1}`,
            };
            return geoJson;
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

    individualPolygons.forEach((polygon, index) => {
      //console.log(`Polygon ${index + 1}:`, polygon);
    });

    console.log(individualPolygons);
  };
  const handleLGeometriesIntersection = () => {
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

    var intersection = turf.intersect(turf.featureCollection([poly1, poly2]));
    if (intersection) {
      console.log("Intersection result:", intersection);
    } else {
      console.log("No intersection found.");
    }
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

    var union = turf.union(turf.featureCollection([poly1, poly2]));
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

  const handleLGeometriesSplit = () => {
    if (!drawnItems) return;

    // Obtén todas las capas del grupo de elementos dibujados
    const layers = Object.values((drawnItems as L.FeatureGroup).getLayers());

    // Clasifica las geometrías en polígonos y líneas
    const individualGeometries = layers
      .map((layer, index) => {
        if ("toGeoJSON" in layer) {
          const geoJson = (
            layer as L.Layer & { toGeoJSON: () => GeoJSON.Feature }
          ).toGeoJSON();

          // Clasificar en función del tipo de geometría

          if (
            geoJson.geometry.type === "Polygon" ||
            geoJson.geometry.type === "MultiPolygon"
          ) {
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
            geoJson.properties = { ...geoJson.properties }; // Propiedades personalizadas
            return { type: "LineString", feature: geoJson };
          }
        }
        return null;
      })
      .filter((geoJson) => geoJson !== null);

    // Separa los polígonos y líneas en listas distintas
    const polygons = individualGeometries
      .filter((item) => item.type === "Polygon")
      .map((item) => item.feature);

    const lines = individualGeometries
      .filter((item) => item.type === "LineString")
      .map((item) => item.feature);

    // Validación: Asegúrate de que al menos haya un polígono y una línea
    if (polygons.length === 0 || lines.length === 0) {
      console.log("No hay suficientes geometrías para realizar la operación.");
      return;
    }

    // Ejemplo: Trabajando con el primer polígono y la primera línea
    const polygon = polygons[0];
    const lineSplit = lines[0];

    console.log("Polígono seleccionado:", polygon);
    console.log("Línea seleccionada:", lineSplit);

    console.log("Polígono seleccionado:", polygon);
    let lineStrings: any[] = [];
    let segments1: any[] = [];
    let segments2: any[] = [];

    try {
      // Asegúrate de que el polígono es válido
      if (polygon.geometry.type !== "Polygon") {
        console.log("Solo se admiten polígonos simples para esta operación.");
        return;
      }

      // Extrae las coordenadas del polígono
      const coordinates = polygon.geometry.coordinates[0]; // Primer anillo del polígono (contorno exterior)

      // Divide los lados del polígono en LineStrings

      for (let i = 0; i < coordinates.length - 1; i++) {
        const line = turf.lineString([coordinates[i], coordinates[i + 1]]);
        const splitResult = turf.lineSplit(line, lineSplit);
        if (splitResult.features.length > 1) {
          console.log(
            "La línea fue dividida en",
            splitResult.features.length,
            "segmentos.",
            splitResult
          );
          segments1.push(splitResult.features[0]);
          segments2.push(splitResult.features[1]);
        } else {
          lineStrings.push(line);
        }
      }

      // Convertir los resultados en FeatureCollections
      lineStrings = turf.featureCollection(lineStrings);
      segments1 = turf.featureCollection(segments1);
      segments2 = turf.featureCollection(segments2);

      // Relacionar las geometrías entre sí sin usar los mismos índices de segments1 y segments2
      const relatedGroups: any[] = [];
      segments1.features.forEach((segment1, index1) => {
        segments2.features.forEach((segment2, index2) => {
          if (index1 !== index2) {
            // Crear grupo inicial
            const group = turf.featureCollection([
              segment1,
              segment2,
              ...lineStrings.features.filter((lineString) => {
                const [start, end] = lineString.geometry.coordinates;
                return (
                  (turf.booleanPointOnLine(start, segment1) ||
                    turf.booleanPointOnLine(end, segment1)) &&
                  (turf.booleanPointOnLine(start, segment2) ||
                    turf.booleanPointOnLine(end, segment2))
                );
              }),
            ]);
            relatedGroups.push(group);
          }
        });
      });

      type Coordinate = [number, number];

      const processPolygonCoordinates = (
        coordinates: Coordinate[]
      ): Coordinate[] => {
        // Eliminar coordenadas duplicadas
        const uniqueCoordinates: Coordinate[] = coordinates.filter(
          (coord, index, self) =>
            index ===
            self.findIndex((c) => JSON.stringify(c) === JSON.stringify(coord))
        );

        // Asegurar que el primer valor sea igual al último para cerrar el polígono
        if (
          JSON.stringify(uniqueCoordinates[0]) !==
          JSON.stringify(uniqueCoordinates[uniqueCoordinates.length - 1])
        ) {
          uniqueCoordinates.push(uniqueCoordinates[0]);
        }

        return uniqueCoordinates;
      };

      // Variable global para la FeatureCollection
      const featureCollection = {
        type: "FeatureCollection",
        features: [] as any[],
      };

      // Función para agregar un nuevo polígono
      const addPolygonToFeatureCollection = (coordinates: Coordinate[]) => {
        const processedCoordinates = processPolygonCoordinates(coordinates);

        const newFeature = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [processedCoordinates],
          },
        };

        featureCollection.features.push(newFeature);
      };

      console.log(
        "Grupos relacionados con LineStrings adicionales (FeatureCollections):",
        relatedGroups
      );
      console.log(relatedGroups.length);
      let allCoordinates: any = [];
      if (relatedGroups.length > 0) {
        relatedGroups.forEach((group, groupIndex) => {
          let coordinatesHelp: any[] = [];
          group.features.forEach((feature: any, featureIndex: any) => {
            if (feature.geometry.type === "LineString") {
              coordinatesHelp.push(feature.geometry.coordinates[0]);
              coordinatesHelp.push(feature.geometry.coordinates[1]);
            } else {
              console.log("    Tipo de geometría no soportado.");
            }
          });
          // Agregar los polígonos al FeatureCollection
          addPolygonToFeatureCollection(coordinatesHelp);
        });
        // Mostrar la FeatureCollection completa
        console.log(
          "FeatureCollection:",
          JSON.stringify(featureCollection, null, 2)
        );
        const geoJsonData = featureCollection;
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(geoJsonData, null, 2)
        )}`;
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute(
          "download",
          "splitPolygonWithLine.geojson"
        );
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        //console.warn(allCoordinates);
      } else {
        console.log("No hay grupos relacionados con LineStrings adicionales.");
      }
    } catch (error) {
      console.error("Error al dividir el polígono:", error);
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
        onClick={handleLGeometriesIntersection}
        style={{ ...buttonStyle, top: 250 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        Intersection
      </button>

      <button
        onClick={handleLGeometriesUnion}
        style={{ ...buttonStyle, top: 300 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        Union
      </button>

      <button
        onClick={handleLGeometriesSplit}
        style={{ ...buttonStyle, top: 350 }}
        className="leaflet-draw-toolbar leaflet-bar"
      >
        SplitLineas
      </button>
    </div>
  );
};

export default LeafletDraw;
