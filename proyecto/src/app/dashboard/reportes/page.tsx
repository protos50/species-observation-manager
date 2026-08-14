import { ExportDataCard } from "./components/ExportDataCard";

export default function ReportesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground mt-2">
            Exporta y analiza los datos de observaciones científicas
          </p>
        </div>
        
        <ExportDataCard />
        
        {/* Placeholder for future report components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Future: Statistics cards, charts, etc. */}
        </div>
      </div>
    </div>
  );
}
