import { castesApi } from "@/lib/api/castes";
import { CasteClient } from "./components/CasteClient";

export default async function CastasPage() {
  const castes = await castesApi.castes.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de Castas
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra las castas de hormigas del sistema (Trabajadora, Reina, Soldado, Macho, etc.)
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <CasteClient castes={castes} />
      </div>
    </div>
  );
}
