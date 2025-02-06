// src/utils/mapUtils.ts
// Utilidad para inicializar el mapa y manejar eventos
import L from "leaflet";
import * as turf from "@turf/turf";

export const initializeMap = (mapContainer: HTMLDivElement): L.Map => {
  if (L.DomUtil.get(mapContainer.id)) {
    L.DomUtil.get(mapContainer.id)!.innerHTML = "";
  }

  const map = L.map(mapContainer).setView([51.505, -0.04], 13);

  const osmLayer = L.tileLayer(
    "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap contributors",
    }
  );
  osmLayer.addTo(map);

  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

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
    },
    edit: {
      featureGroup: drawnItems,
      remove: true,
    },
  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (event) {
    const createdEvent = event as L.DrawEvents.Created;
    if (!createdEvent.layer) return;

    const layer = createdEvent.layer;
    drawnItems.addLayer(layer);
    if (typeof layer.toGeoJSON === "function") {
      console.log("Elemento creado:", layer.toGeoJSON());
    }
  });

  return map;
};
