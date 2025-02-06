import "./ExploreContainer.css";

interface ContainerProps {}
import { useEffect, useRef } from "react";
import { Map, TileLayer, Marker, Popup, Icon } from "leaflet";

const MapViewLeaflet: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const position: [number, number] = [51.505, -0.09];

    const map = new Map(mapRef.current!).setView(position, 13);

    new TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const icon = new Icon({
      iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png",
      iconSize: [38, 95],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
    });

    const marker = new Marker(position, { icon }).addTo(map);
    marker
      .bindPopup("Un ejemplo de marcador con información personalizada.")
      .openPopup();
  }, []);

  return <div ref={mapRef} style={{ height: "100vh", width: "100vw" }}></div>;
};

const App: React.FC = () => {
  return (
    <div>
      <h1>React-Leaflet</h1>
      <MapViewLeaflet />
      <h1>Leaflet Puro</h1>
      <MapViewLeaflet />
    </div>
  );
};

export default App;
