import React from "react";
import { geolocationApi } from "@/lib/api/geolocation";
import { GeolocationClient } from "./components/GeolocationClient";

export default async function GeolocationPage() {
  const geolocations = await geolocationApi.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de Geolocalizaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra las coordenadas geográficas asociadas a cada localidad.
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <GeolocationClient geolocations={geolocations} />
      </div>
    </div>
  );
}
