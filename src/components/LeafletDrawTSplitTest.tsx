import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import * as turf from "@turf/turf";

const LeafletDrawTSplitTest: React.FC = () => {
  const map = useMap();
  const [polygons, setPolygons] = useState<any[]>([]);

  useEffect(() => {
    if (!map) return;
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const drawnPolygons = new L.FeatureGroup();
    const drawnLines = new L.FeatureGroup();
    map.addLayer(drawnPolygons);
    map.addLayer(drawnLines);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnPolygons,
        remove: true,
      },
      draw: {
        rectangle: false,
      },
    });
    map.addControl(drawControl);

    function cutPolygon(polygon: any, line: any, direction: any, id: any) {
      console.log(polygon, line);
      var j;
      var polyCoords = [];
      var cutPolyGeoms = [];
      var retVal = null;

      if (
        polygon.geometry.type != "Polygon" ||
        line.geometry.type != "LineString"
      )
        return retVal;

      var intersectPoints = turf.lineIntersect(polygon, line);
      console.warn("intersectPoints", intersectPoints);
      var nPoints = intersectPoints.features.length;
      console.warn("nPoints", nPoints);
      if (nPoints == 0 || nPoints % 2 != 0) return retVal;

      var offsetLine = turf.lineOffset(line, 0.01 * direction, {
        units: "kilometers",
      });
      console.warn("offsetLine", offsetLine);

      for (j = 0; j < line.geometry.coordinates.length; j++) {
        polyCoords.push(line.geometry.coordinates[j]);
      }

      for (j = offsetLine.geometry.coordinates.length - 1; j >= 0; j--) {
        polyCoords.push(offsetLine.geometry.coordinates[j]);
      }
      polyCoords.push(line.geometry.coordinates[0]);
      console.warn("polyCoords", polyCoords);
      var thickLineString = turf.lineString(polyCoords);
      var thickLinePolygon = turf.lineToPolygon(thickLineString);
      console.warn("polygon", polygon);
      console.warn("thickLinePolygon", thickLinePolygon);

      let clipped = turf.difference(polygon, thickLinePolygon);
      console.log(clipped);
      /* for (j = 0; j < clipped.geometry.coordinates.length; j++) {
        var polyg = turf.polygon(clipped.geometry.coordinates[j]);
        var overlap = turf.lineOverlap(polyg, line, { tolerance: 0.005 });
        if (overlap.features.length > 0) {
          cutPolyGeoms.push(polyg.geometry.coordinates);
        }
      } */

      /*  if (cutPolyGeoms.length == 1)
        retVal = turf.polygon(cutPolyGeoms[0], { id: id });
      else if (cutPolyGeoms.length > 1) {
        retVal = turf.multiPolygon(cutPolyGeoms, { id: id });
      } */

      return retVal;
    }

    var polygons: any[] = [];

    map.on(L.Draw.Event.CREATED, function (event) {
      var layer = event.layer; // No TypeScript warning now

      var geojson = layer.toGeoJSON();
      var geom = turf.getGeom(geojson);

      if (geom.type == "Polygon") {
        polygons.push(geom);
        drawnPolygons.addLayer(layer);
      } else if (geom.type == "LineString") {
        var line = geom;
        drawnLines.addLayer(layer);
        drawnPolygons.clearLayers();
        var newPolygons: any[] = [];
        console.warn("polygons", polygons);
        if (!polygons) return null;

        /* const polygon = turf.polygon([
          [
            [-0.063429, 51.512642],
            [-0.07493, 51.496507],
            [-0.040255, 51.497683],
            [-0.061541, 51.511787],
            [-0.063429, 51.512642],
          ],
        ]); */
        /* const thickLinePolygon = turf.lineString([
          [-0.076475, 51.505804],
          [-0.035963, 51.509116],
        ]); */

        const polygon = turf.polygon(
          [
            [
              [-78.514888, -0.220745],
              [-78.515312, -0.221838],
              [-78.513869, -0.221865],
              [-78.513821, -0.221061],
              [-78.514384, -0.22164],
              [-78.514427, -0.220804],
              [-78.514899, -0.221409],
              [-78.514888, -0.220745],
            ],
          ],
          {
            fill: "#F00",
            "fill-opacity": 0.1,
          }
        );
        const thickLinePolygon = turf.lineString(
          [
            [-78.515607, -0.221206],
            [-78.513547, -0.221473],
          ],

          {
            fill: "#00F",
            "fill-opacity": 0.1,
          }
        );

        const result = cutPolygon(polygon, thickLinePolygon, 1, "upper");
        const result2 = cutPolygon(polygon, thickLinePolygon, -1, "lower");

        if (result) {
          console.log("Clipped Polygon:", result, result2);
        } else {
          console.warn("No intersection found or invalid inputs.");
        }
        /* polygons.forEach(function (polygon, index) {
          console.warn("polygon", polygon);
          var cutDone = false;
          var layer;
          var upperCut = cutPolygon(polygon, line, 1, "upper");
          var lowerCut = cutPolygon(polygon, line, -1, "lower"); */
        /* if (upperCut != null && lowerCut != null) {
            layer = L.geoJSON(upperCut, {
              style: function (feature) {
                return { color: "green" };
              },
            }).addTo(drawnPolygons);
            layer = L.geoJSON(lowerCut, {
              style: function (feature) {
                return { color: "yellow" };
              },
            }).addTo(drawnPolygons);
            cutDone = true;
          } */
        //if (!upperCut || !lowerCut) return;
        /*  if (cutDone) {
            newPolygons.push(upperCut.geometry);
            newPolygons.push(lowerCut.geometry);
          } else {
            newPolygons.push(polygon);
            layer = L.geoJSON(polygon, {
              style: function (feature) {
                return { color: "#3388ff" };
              },
            }).addTo(drawnPolygons);
          } */
        /* });
        polygons = newPolygons; */
      }
    });

    return () => {
      map.removeControl(drawControl);
      //map.removeLayer(drawnPolygons);
      //map.removeLayer(drawnLines);
    };
  }, [map, polygons]);

  return null;
};

export default LeafletDrawTSplitTest;
