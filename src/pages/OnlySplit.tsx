import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import * as turf from "@turf/turf";

const MapPage: React.FC = () => {
  const setMap = useState<L.Map | null>(null);
  const [polygons, setPolygons] = useState<any[]>([]);
  const [drawnPolygons, setDrawnPolygons] = useState<L.FeatureGroup | null>(
    null
  );
  const [drawnLines, setDrawnLines] = useState<L.FeatureGroup | null>(null);

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    // Initialize map
    const mapInstance = L.map("map", {
      center: [51.505, -0.04],
      zoom: 13,
    });

    const osmUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const osmAttrib =
      '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib });
    osm.addTo(mapInstance);

    // Initialize feature groups
    const polygonsGroup = L.featureGroup().addTo(mapInstance);
    const linesGroup = L.featureGroup().addTo(mapInstance);

    setDrawnPolygons(polygonsGroup);
    setDrawnLines(linesGroup);

    // Add drawing controls
    const drawControl = new L.Control.Draw({
      draw: {
        marker: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        polyline: {},
      },
    });
    mapInstance.addControl(drawControl);

    setMap(mapInstance);

    return () => {
      mapInstance.off();
      mapInstance.remove();
    };
  }, []);

  // Function to handle polygon cutting
  const cutPolygon = (
    polygon: any,
    line: any,
    direction: number,
    id: string
  ) => {
    if (polygon.type !== "Polygon" || line.type !== "LineString") return null;

    const intersectPoints = turf.lineIntersect(polygon, line);
    const nPoints = intersectPoints.features.length;
    if (nPoints === 0 || nPoints % 2 !== 0) return null;

    const offsetLine = turf.lineOffset(line, 0.01 * direction, {
      units: "kilometers",
    });
    const polyCoords = [
      ...line.coordinates,
      ...offsetLine.geometry.coordinates.reverse(),
      line.coordinates[0],
    ];
    const thickLinePolygon = turf.lineToPolygon(turf.lineString(polyCoords));

    const clipped = turf.difference(polygon, thickLinePolygon);
    if (!clipped || !clipped.geometry) return null;

    const cutPolyGeoms: any[] = [];
    clipped.geometry.coordinates.forEach((coords: any) => {
      const polyg = turf.polygon([coords]);
      const overlap = turf.lineOverlap(polyg, line, { tolerance: 0.005 });
      if (overlap.features.length > 0) {
        cutPolyGeoms.push(polyg.geometry.coordinates);
      }
    });

    if (cutPolyGeoms.length === 1) return turf.polygon(cutPolyGeoms[0], { id });
    if (cutPolyGeoms.length > 1) return turf.multiPolygon(cutPolyGeoms, { id });

    return null;
  };

  // Handle created events
  useEffect(() => {
    if (!map || !drawnPolygons || !drawnLines) return;

    map.on(L.Draw.Event.CREATED, (event: any) => {
      const { layer } = event;
      const geojson = layer.toGeoJSON();
      const geom = turf.getGeom(geojson);

      if (geom.type === "Polygon") {
        // Add polygon to the group and state
        if (polygonGroup) {
          polygonGroup.addLayer(layer); // Add polygon to the FeatureGroup
        }
        setPolygons((prev) => [...prev, geojson]); // Update the React state
        console.log("Polygon added:", geom);
      } else if (geom.type === "LineString") {
        // Add line to the group
        if (lineGroup) {
          lineGroup.addLayer(layer); // Add line to the FeatureGroup
        }

        const updatedPolygons: Feature<Polygon | MultiPolygon>[] = [];

        // Process each polygon in the group
        if (polygonGroup) {
          polygonGroup.eachLayer((polygonLayer: any) => {
            const polygonGeoJSON = polygonLayer.toGeoJSON();
            const polygonGeom = turf.getGeom(polygonGeoJSON);

            let cutDone = false;

            // Try cutting the polygon with the line
            const upperCut = cutPolygon(polygonGeom, geom, 1, "upper");
            const lowerCut = cutPolygon(polygonGeom, geom, -1, "lower");

            if (upperCut && lowerCut) {
              // Add the split polygons to the group
              L.geoJSON(upperCut, { style: { color: "green" } }).addTo(
                polygonGroup
              );
              L.geoJSON(lowerCut, { style: { color: "yellow" } }).addTo(
                polygonGroup
              );

              // Add split polygons to the array
              updatedPolygons.push(upperCut, lowerCut);
              cutDone = true;
            }

            if (!cutDone) {
              // Keep the original polygon if no cut was made
              updatedPolygons.push(polygonGeoJSON);
            }
          });

          // Clear only the polygons that were affected
          polygonGroup.clearLayers();
          updatedPolygons.forEach((polygon) => {
            const newLayer = L.geoJSON(polygon, {
              style: { color: "#3388ff" },
            });
            polygonGroup.addLayer(newLayer);
          });

          setPolygons(updatedPolygons); // Update the React state
        }
        console.log("Updated polygons:", updatedPolygons);
      }
    });

    return () => {
      map.off(L.Draw.Event.CREATED);
    };
  }, [map, drawnPolygons, drawnLines, polygons]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Map Operations</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div id="map" style={{ height: "100vh" }}></div>
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
