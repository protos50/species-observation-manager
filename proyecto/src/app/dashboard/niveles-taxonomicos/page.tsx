import { taxonomyApi } from "@/lib/api/taxonomy";
import { LevelTaxonClient } from "./components/LevelTaxonClient";

export default async function NivelesTaxonomicosPage() {
  const levels = await taxonomyApi.levels.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de niveles taxonómicos
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los niveles taxonómicos del sistema
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <LevelTaxonClient levels={levels} />
      </div>
    </div>
  );
}
