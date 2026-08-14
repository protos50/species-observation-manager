import { preservationApi } from "@/lib/api/preservation";
import { MethodClient } from "./components/MethodClient";

export default async function MetodosPreservacionPage() {
  const methods = await preservationApi.preservationMethods.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de métodos de preservación
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los métodos de preservación del sistema
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <MethodClient methods={methods} />
      </div>
    </div>
  );
}
