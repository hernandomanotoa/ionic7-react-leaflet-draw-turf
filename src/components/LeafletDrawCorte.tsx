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
        rectangle: false,
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
  const getSortedIntersectionPoints = (line: any, polygon: any) => {
    const intersections = turf.lineIntersect(line, polygon);

    if (intersections.features.length < 2) {
      return turf.featureCollection([]); // Retorna una FeatureCollection vacía si no hay suficientes intersecciones
    }

    // Obtener el punto inicial de la línea original
    const lineStart = line.geometry.coordinates[0];

    // Ordenar los puntos de intersección por distancia desde el inicio de la línea original
    const sortedPoints = intersections.features
      .map((feature) => turf.point(feature.geometry.coordinates)) // Convertir a puntos geométricos
      .sort((a, b) => {
        const distA = turf.distance(turf.point(lineStart), a);
        const distB = turf.distance(turf.point(lineStart), b);
        return distA - distB;
      });

    // Retornar como FeatureCollection
    return turf.featureCollection(sortedPoints);
  };

  const splitPolygonWithLine = (polygon: any, line: any) => {
    try {
      /* const sortedIntersectionPoints = getSortedIntersectionPoints(
        line,
        polygon
      );
      console.log("shortenedLine", sortedIntersectionPoints); */

      //const intersectionPoints = turf.lineIntersect(line, polygon);
      const intersectionPoints = getSortedIntersectionPoints(line, polygon);

      if (intersectionPoints.features.length < 2) {
        alert(
          "La línea no cruza completamente el polígono, no se puede dividir."
        );
        return null;
      }

      let linesIntersectionPoints: any[] = [];
      for (let i = 0; i < intersectionPoints.features.length; i++) {
        let start: any = intersectionPoints.features[i].geometry.coordinates;
        let end: any = intersectionPoints.features[i + 1].geometry.coordinates;
        let newLine = turf.lineString([start, end]);
        linesIntersectionPoints.push(newLine);
        i = i + 1;
      }
      console.log(
        "Líneas creadas a partir de intersecciones que intersectan con el polígono:",
        linesIntersectionPoints
      );

      let coordinates = polygon.geometry.coordinates[0];
      let splitLines = [];
      for (let i = 0; i < coordinates.length - 1; i++) {
        let segment = turf.lineString([coordinates[i], coordinates[i + 1]]);
        let split = turf.lineSplit(segment, line);
        if (split.features.length > 1) {
          split.features.forEach((f) => splitLines.push(f));
        } else {
          splitLines.push(segment);
        }
      }

      let newPolygons = [];
      let tempPolygon: any[] = [];
      splitLines.forEach((line) => {
        tempPolygon.push(...line.geometry.coordinates);
      });

      /* tempPolygon.forEach((lineTemp, index) => {
        if (
          index < tempPolygon.length - 1 &&
          JSON.stringify(lineTemp) === JSON.stringify(tempPolygon[index + 1])
        ) {
          console.log(
            "Las líneas son iguales:",
            lineTemp,
            tempPolygon[index + 1]
          );
        } else {
          console.log(
            "Las líneas son diferentes:",
            lineTemp,
            tempPolygon[index + 1]
          );
        }
      }); */
      console.log("splitLines", splitLines[0]);
      console.log("Puntos de intersección 1:", intersectionPoints.features);
      console.warn("poligono", turf.polygon([tempPolygon]));
      if (!drawnItems) return;

      ////=====================
      const featurePolygon: turf.Feature = turf.polygon([tempPolygon]); // Ejemplo con un punto
      /*  const featureCollection: turf.FeatureCollection<turf.LineString> =
        turf.featureCollection(linesIntersectionPoints); */

      const featureCollection: turf.FeatureCollection<turf.LineString> =
        turf.featureCollection(splitLines.concat(linesIntersectionPoints)); //Se agrega las lineas intermedias para graficar

      //=============inicio poligonos
      interface GeoJSONFeatureCollection {
        type: "FeatureCollection";
        features: GeoJSONFeature[];
      }

      interface GeoJSONFeature {
        type: "Feature";
        properties: any;
        geometry: GeoJSONGeometry;
      }

      interface GeoJSONGeometry {
        type: "LineString";
        coordinates: number[][];
      }

      function findPolygonsFromLines(geojson: GeoJSONFeatureCollection) {
        const edges = new Map<string, string[]>();

        function key(coord: number[]): string {
          return coord.join(",");
        }

        // Construir grafo de conexiones
        geojson.features.forEach((feature) => {
          if (feature.geometry.type === "LineString") {
            const coords = feature.geometry.coordinates;
            for (let i = 0; i < coords.length - 1; i++) {
              const startKey = key(coords[i]);
              const endKey = key(coords[i + 1]);

              if (!edges.has(startKey)) edges.set(startKey, []);
              if (!edges.has(endKey)) edges.set(endKey, []);

              edges.get(startKey)!.push(endKey);
              edges.get(endKey)!.push(startKey);
            }
          }
        });

        const visited = new Set<string>();
        const polygons: number[][][] = [];

        function dfs(node: string, path: string[], coordPath: number[][]) {
          if (path.length > 2 && node === path[0]) {
            polygons.push([...coordPath]);
            return;
          }

          if (visited.has(node)) return;
          visited.add(node);

          for (const neighbor of edges.get(node) || []) {
            if (path.length > 2 && neighbor === path[path.length - 2]) continue;
            dfs(
              neighbor,
              [...path, neighbor],
              [...coordPath, neighbor.split(",").map(Number)]
            );
          }

          visited.delete(node);
        }

        for (const startNode of edges.keys()) {
          dfs(startNode, [startNode], [startNode.split(",").map(Number)]);
        }

        return {
          type: "FeatureCollection",
          features: polygons.map((coords) => ({
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [coords],
            },
          })),
        };
      }

      // Ejemplo de uso con la entrada proporcionada
      const inputGeoJSON: GeoJSONFeatureCollection = featureCollection; // Reemplazar con el GeoJSON de entrada
      const polygonsGeoJSON = findPolygonsFromLines(inputGeoJSON);
      console.log(JSON.stringify(polygonsGeoJSON, null, 2));

      //===============fin poligonos

      ///==================
      //const geoJsonData = intersectionPoints;
      const geoJsonData = polygonsGeoJSON;
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(geoJsonData, null, 2)
      )}`;
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "drawn_geometries.geojson");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      //turf.featureCollection(features);

      newPolygons.push(turf.polygon([tempPolygon]));

      return newPolygons;
    } catch (error) {
      console.error("Error en la división del polígono:", error);
      return null;
    }
  };

  const handleLGeometriesSplit = () => {
    if (!drawnItems) return;

    const layers = Object.values((drawnItems as L.FeatureGroup).getLayers());
    const polygons = layers
      .map((layer) => {
        if ("toGeoJSON" in layer) {
          const geoJson = (
            layer as L.Layer & { toGeoJSON: () => GeoJSON.Feature }
          ).toGeoJSON();
          return geoJson.geometry.type === "Polygon"
            ? turf.polygon(geoJson.geometry.coordinates)
            : null;
        }
        return null;
      })
      .filter((geoJson) => geoJson !== null);

    const lines = layers
      .map((layer) => {
        if ("toGeoJSON" in layer) {
          const geoJson = (
            layer as L.Layer & { toGeoJSON: () => GeoJSON.Feature }
          ).toGeoJSON();
          return geoJson.geometry.type === "LineString"
            ? turf.lineString(geoJson.geometry.coordinates)
            : null;
        }
        return null;
      })
      .filter((geoJson) => geoJson !== null);

    if (polygons.length === 0 || lines.length === 0) {
      alert("Debe dibujar al menos un polígono y una línea para dividir.");
      return;
    }

    const polygon = polygons[0];
    const line = lines[0];

    const splitPolygons = splitPolygonWithLine(polygon, line);
    if (splitPolygons && splitPolygons.length > 0) {
      console.warn(splitPolygons);
      alert("El polígono ha sido dividido exitosamente.");
      drawnItems.clearLayers();
      splitPolygons.forEach((feature) => {
        const newLayer = L.geoJSON(feature);
        drawnItems.addLayer(newLayer);
      });
    } else {
      alert("No se pudo dividir el polígono.");
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
        onClick={handleLGeometriesSplit}
        style={{ ...buttonStyle, top: 50 }}
      >
        Split Geometries
      </button>
    </div>
  );
};

export default LeafletDraw;
