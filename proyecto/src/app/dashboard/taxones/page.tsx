// app/(some-route)/taxones/page.tsx
import React from "react";
import { TaxonClient } from "./components/TaxonClient";
import { taxonomyApi } from "@/lib/api/taxonomy"; // ajusta según tu api client

export default async function TaxonsPage() {
  const [taxa, taxonomicLevels] = await Promise.all([
    taxonomyApi.taxa.getAll(),
    taxonomyApi.levels.getAll(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de taxones
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra la clasificación taxonómica del sistema
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <TaxonClient taxa={taxa} taxonomicLevels={taxonomicLevels} />
      </div>
    </div>
  );
}
