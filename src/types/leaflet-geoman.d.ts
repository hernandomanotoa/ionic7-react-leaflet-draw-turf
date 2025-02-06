import "leaflet";
import "@geoman-io/leaflet-geoman-free";

declare module "leaflet" {
  interface Map {
    pm: {
      addControls(options: any): void;
      enableDraw(shape: string): void;
      disableDraw(shape: string): void;
      removeControls(): void;
      addControls(options: any): void;
      enableDraw(shape: string): void;
      disableDraw(shape: string): void;
      removeControls(): void;
      setGlobalOptions(options: any): void;
      toggleGlobalEditMode(): void;
      toggleGlobalRemovalMode(): void;
    };
  }
}
