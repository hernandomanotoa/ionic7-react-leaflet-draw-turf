// src/pages/MapPage.tsx
// Página principal que carga el componente del mapa
import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/react";
import MapComponent from "../components/MapComponent";

const MapPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mapa con corte de geometrias</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <MapComponent />
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
