"use client";
import Home from "../page/Home";
import { isIOS } from "mobile-device-detect";
import MapProvider from "./MapProvider";

function MapApp() {
  return (
    <MapProvider>
      <Home isIOS={isIOS} />
    </MapProvider>
  );
}

export default MapApp;
