import { authorsApi } from "@/lib/api/authors";
import { AuthorClient } from "./components/AuthorClient";

export default async function AutoresPage() {
  const authors = await authorsApi.authors.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de Autores Científicos
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los autores científicos del sistema (Linnaeus, Fabricius, etc.)
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <AuthorClient authors={authors} />
      </div>
    </div>
  );
}
