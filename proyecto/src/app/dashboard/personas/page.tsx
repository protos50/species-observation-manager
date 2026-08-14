import { collectionApi } from "@/lib/api/collection";
import { PersonClient } from "./components/PersonClient";

export default async function PersonasPage() {
  const persons = await collectionApi.persons.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de Identificadores y/o Colectores
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los identificadores y/o colectores del sistema
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <PersonClient persons={persons} />
      </div>
    </div>
  );
}
