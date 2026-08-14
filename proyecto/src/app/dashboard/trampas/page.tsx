import { trapsApi } from "@/lib/api/traps";
import { TrapClient } from "./components/TrapClient";

export default async function TrampasPage() {
  const traps = await trapsApi.traps.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de tipos de trampas
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los tipos de trampas del sistema
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <TrapClient traps={traps} />
      </div>
    </div>
  );
}
