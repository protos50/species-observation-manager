import { locationApi } from "@/lib/api/location";
import { ClimateDataClient } from "./components/ClimateDataClient";

export default async function DatosClimaticosPage() {
  const climateData = await locationApi.climateData.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Datos Climáticos
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los registros de datos climáticos por localidad y fecha
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <ClimateDataClient climateData={climateData} />
      </div>
    </div>
  );
}
