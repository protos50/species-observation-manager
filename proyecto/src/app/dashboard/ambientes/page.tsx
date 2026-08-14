import { locationApi } from "@/lib/api/location";
import { EnvironmentClient } from "./components/EnvironmentClient";

export default async function AmbientesPage() {
  const environments = await locationApi.environments.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de Ambientes
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los tipos de ambientes del sistema
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <EnvironmentClient environments={environments} />
      </div>
    </div>
  );
}
