import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import * as turf from "@turf/turf";
import { Feature, MultiPolygon, Polygon } from "geojson";

const LeafletDraw: React.FC = () => {
  const map = useMap();
  const [polygons, setPolygons] = useState<Feature<Polygon | MultiPolygon>[]>(
    []
  );
  const [polygonGroup, setPolygonGroup] = useState<L.FeatureGroup | null>(null);
  const [lineGroup, setLineGroup] = useState<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Initialize FeatureGroups
    const polygonsGroup = new L.FeatureGroup();
    const linesGroup = new L.FeatureGroup();

    setPolygonGroup(polygonsGroup);
    setLineGroup(linesGroup);

    // Add FeatureGroups to the map
    map.addLayer(polygonsGroup);
    map.addLayer(linesGroup);

    // Add drawing controls
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: L.featureGroup([polygonsGroup, linesGroup]),
        remove: true,
      },
      draw: {
        rectangle: false,
      },
    });
    map.addControl(drawControl);

    // Function to cut a polygon with a line
    const cutPolygon = (
      polygon: Feature<Polygon>,
      line: Feature<any>,
      direction: number,
      id: string
    ): Feature<Polygon | MultiPolygon> | null => {
      try {
        /* if (
          polygon.geometry.type !== "Polygon" ||
          line.geometry.type !== "LineString"
        ) {
          return null;
        }

        // Offset the line for cutting
        const offsetLine = turf.lineOffset(line, 0.01 * direction, {
          units: "kilometers",
        });

        const thickLineCoords = [
          ...line.geometry.coordinates,
          ...offsetLine.geometry.coordinates.reverse(),
          line.geometry.coordinates[0],
        ];
        const thickLineString = turf.lineString(thickLineCoords);

        // Create a polygon from the thick line
        const thickLinePolygon = turf.lineToPolygon(thickLineString);

        // Perform clipping
        const clipped = turf.difference(polygon, thickLinePolygon);
        if (!clipped || !clipped.geometry) return null;

        const cutPolygons = clipped.geometry.coordinates.map((coords: any) =>
          turf.polygon([coords])
        );

        // Filter and return the valid polygons
        return cutPolygons.length > 1
          ? turf.multiPolygon(
              cutPolygons.map((p) => p.geometry.coordinates),
              {
                id,
              }
            )
          : turf.polygon(cutPolygons[0].geometry.coordinates, { id }); */
        return null;
      } catch (error) {
        console.error("Error in cutPolygon:", error);
        return null;
      }
    };

    // Handle the Draw Event
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

        //const updatedPolygons: Feature<Polygon | MultiPolygon>[] = [];

        // Process each polygon in the group
        /* if (polygonGroup && polygonsGroup.getLayers.length > 0) {
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
        } */
        //console.log("Updated polygons:", updatedPolygons);
      }
    });

    // Cleanup
    return () => {
      map.removeControl(drawControl);
      map.removeLayer(polygonsGroup);
      map.removeLayer(linesGroup);
      //map.off(L.Draw.Event.CREATED);
    };
  }, [map]);

  useEffect(() => {
    // Watch changes in the polygons state
    console.log("Current polygons:", polygons);
  }, [polygons]);

  return null;
};

export default LeafletDraw;
